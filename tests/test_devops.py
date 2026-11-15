"""Automated unit tests for scripts/devops.py, the DevopsCli adapter for Meteo."""

from __future__ import annotations

import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from typing import Optional
import unittest
from unittest.mock import MagicMock, patch

REPO_ROOT = Path(__file__).resolve().parent.parent
DEVOPS_SCRIPT = REPO_ROOT / "scripts" / "devops.py"
REQUIREMENTS = REPO_ROOT / "scripts" / "requirements.txt"
REVIEW_SERVER_SCRIPT = REPO_ROOT / "scripts" / "run-review-server.py"


def _load_devops_module():
    spec = importlib.util.spec_from_file_location("devops_mod", DEVOPS_SCRIPT)
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _run_devops(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, str(DEVOPS_SCRIPT), *args],
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True,
        check=False,
    )


class TestDevopsAdapter(unittest.TestCase):
    """Validates MeteoProject overrides and the retained serve, sw, and deploy actions."""

    def setUp(self) -> None:
        self.mod = _load_devops_module()
        self.project = self.mod.MeteoProject(REPO_ROOT)
        self.project.logger = MagicMock()

    def test_support_python_pinned_to_v3_2_0(self) -> None:
        """Validates the requirements file pins support-python v3.2.0."""
        self.assertIn("support.python.git@v3.2.0", REQUIREMENTS.read_text(encoding="utf-8"))

    def test_obsolete_scripts_removed(self) -> None:
        """Validates that the standalone review server script stays removed."""
        self.assertFalse(REVIEW_SERVER_SCRIPT.exists())

    def test_project_is_node_project(self) -> None:
        """Validates MeteoProject extends NodeProject."""
        from support_python.devops import NodeProject

        self.assertIsInstance(self.project, NodeProject)

    def test_test_runs_python_then_node(self) -> None:
        """Validates test runs unittest first and then npm test."""
        with patch.object(self.project, "run_command", return_value=True) as run_cmd, patch.object(
            self.project, "_npm", return_value=True
        ) as npm:
            self.assertTrue(self.project.test())
        run_cmd.assert_called_once_with([sys.executable, "-m", "unittest", "discover", "-s", "tests"])
        npm.assert_called_once_with("test")

    def test_test_fails_when_python_fails(self) -> None:
        """Validates a failing Python suite fails test and skips npm."""
        with patch.object(self.project, "run_command", return_value=False), patch.object(
            self.project, "_npm", return_value=True
        ) as npm:
            self.assertFalse(self.project.test())
        npm.assert_not_called()

    def test_test_fails_when_node_fails(self) -> None:
        """Validates a failing Node suite fails test."""
        with patch.object(self.project, "run_command", return_value=True), patch.object(
            self.project, "_npm", return_value=False
        ):
            self.assertFalse(self.project.test())

    def test_test_slow_runs_browser_suites(self) -> None:
        """Validates test_slow runs npm run test:browser."""
        with patch.object(self.project, "_npm", return_value=True) as npm:
            self.assertTrue(self.project.test_slow())
        npm.assert_called_once_with("run", "test:browser")

    def test_build_never_packs(self) -> None:
        """Validates build is a no-op that never runs npm."""
        with patch.object(self.project, "_npm") as npm:
            self.assertTrue(self.project.build())
        npm.assert_not_called()

    def test_lint_checks_core_docs_offline(self) -> None:
        """Validates lint runs lint-markdown check --offline on the core documents."""
        with patch.object(self.project, "run_command", return_value=True) as run_cmd:
            self.assertTrue(self.project.lint())
        argv = run_cmd.call_args[0][0]
        self.assertEqual(argv[:5], [sys.executable, "-m", "support_python.tools.lint_markdown", "check", "--offline"])
        self.assertEqual([Path(a).as_posix() for a in argv[5:]], self.mod.CORE_DOCS)

    def test_format_uses_running_interpreter(self) -> None:
        """Validates format uses the running interpreter's linter module."""
        with patch.object(self.project, "run_command", return_value=True) as run_cmd:
            self.assertTrue(self.project.format())
        run_cmd.assert_called_once_with(
            [sys.executable, "-m", "support_python.tools.lint_markdown", "fix", "--offline", *self.mod.CORE_DOCS]
        )

    def test_lint_never_resolves_a_path_launcher(self) -> None:
        """Validates lint works when no launcher exists on PATH."""
        with patch("support_python.devops.steps.resolve_executable", return_value=None) as resolve, patch.object(
            self.project, "run_command", return_value=True
        ) as run_cmd:
            self.assertTrue(self.project.lint())
        resolve.assert_not_called()
        self.assertEqual(run_cmd.call_args[0][0][:3], [sys.executable, "-m", "support_python.tools.lint_markdown"])

    def test_lint_covers_docs_index_and_visual_style_guide(self) -> None:
        """Validates the docs index and the visual style guide are in the lint list."""
        self.assertIn("docs/index.md", self.mod.CORE_DOCS)
        self.assertIn("docs/specs/visual-style-guide.md", self.mod.CORE_DOCS)

    def test_check_stops_at_first_failure(self) -> None:
        """Validates check runs lint then test and skips test after a lint failure."""
        with patch.object(self.project, "lint", return_value=False), patch.object(self.project, "test") as tests:
            self.assertFalse(self.project.check())
        tests.assert_not_called()

    def test_design_check_runs_vendored_checker(self) -> None:
        """Validates design_check runs the vendored support.webapp check.mjs with Node.js."""
        with patch.object(self.project, "run_command", return_value=True) as run_cmd:
            self.assertTrue(self.project.design_check())
        argv = run_cmd.call_args[0][0]
        self.assertEqual(argv[0], "node")
        self.assertEqual(Path(argv[1]).relative_to(REPO_ROOT).as_posix(), "vendor/design/bin/check.mjs")

    def test_check_runs_design_check_before_tests(self) -> None:
        """Validates check runs the design check after lint and skips test when it fails."""
        with patch.object(self.project, "lint", return_value=True), patch.object(
            self.project, "design_check", return_value=False
        ) as design, patch.object(self.project, "test") as tests:
            self.assertFalse(self.project.check())
        design.assert_called_once_with()
        tests.assert_not_called()

    def test_release_delegates_to_deploy_flow(self) -> None:
        """Validates release runs the deploy flow without pushing."""
        with patch.object(self.mod, "deploy_flow", return_value=0) as flow:
            self.assertTrue(self.project.release(dry_run=True, skip_checks=True))
        kwargs = flow.call_args.kwargs
        self.assertTrue(kwargs["dry_run"])
        self.assertFalse(kwargs["push"])
        self.assertTrue(kwargs["skip_checks"])

    def test_deploy_rejects_dry_run_with_push(self) -> None:
        """Validates --dry-run and --push cannot be combined."""
        logger = MagicMock()
        self.assertEqual(self.mod.deploy_flow(self.project, dry_run=True, push=True, skip_checks=True, logger=logger), 1)

    def test_deploy_dry_run_changes_nothing(self) -> None:
        """Validates a passing dry run neither finalizes nor commits."""
        logger = MagicMock()
        with patch.object(self.mod, "check_clean_git_tree", return_value=True), patch.object(
            self.mod, "read_active_pre_release_version", return_value="9.9.9"
        ), patch.object(self.mod, "current_branch", return_value="main"), patch.object(
            self.project, "check", return_value=True
        ), patch.object(self.mod, "finalize_changelog") as finalize:
            code = self.mod.deploy_flow(self.project, dry_run=True, push=False, skip_checks=False, logger=logger)
        self.assertEqual(code, 0)
        finalize.assert_not_called()

    def test_deploy_fails_without_pre_heading(self) -> None:
        """Validates deploy fails when no -pre version heading is active."""
        logger = MagicMock()
        with patch.object(self.mod, "check_clean_git_tree", return_value=True), patch.object(
            self.mod, "read_active_pre_release_version", return_value=None
        ), patch.object(self.mod, "current_branch", return_value="main"):
            code = self.mod.deploy_flow(self.project, dry_run=True, push=False, skip_checks=True, logger=logger)
        self.assertEqual(code, 1)

    def test_has_plan_branch_detects_plan(self) -> None:
        """Validates has_plan_branch reads the git exit code."""
        with patch.object(self.mod, "run_git", return_value=MagicMock(returncode=0)):
            self.assertTrue(self.mod.has_plan_branch())
        with patch.object(self.mod, "run_git", return_value=MagicMock(returncode=1)):
            self.assertFalse(self.mod.has_plan_branch())

    def test_push_release_includes_plan_branch(self) -> None:
        """Validates push_release includes the plan branch when it exists."""
        logger = MagicMock()
        with patch.object(self.mod, "has_plan_branch", return_value=True), patch.object(
            self.mod, "run_git", return_value=MagicMock(returncode=0, stdout="", stderr="")
        ) as git:
            self.assertTrue(self.mod.push_release("main", "1.1.0", logger))
        git.assert_called_once_with("push", "origin", "main", "v1.1.0", "plan")

    def test_cli_registers_retained_actions(self) -> None:
        """Validates the CLI registers serve, sw, and deploy beside the standard actions."""
        cli = self.mod.build_cli(self.project)
        for name in ["lint", "test", "build", "check", "versions", "release", "serve", "sw", "deploy"]:
            self.assertIn(name, cli.harness._actions)


class TestDevopsCli(unittest.TestCase):
    """Validates scripts/devops.py as a subprocess: banner, help, exit codes, and versions."""

    def test_version_flag_and_action(self) -> None:
        """Validates that --version and version exit 0 with the project banner."""
        for flag in ["--version", "version"]:
            result = _run_devops(flag)
            self.assertEqual(result.returncode, 0, f"Expected 0 for {flag}: {result.stderr}")
            self.assertTrue(result.stdout.strip().startswith("devops v"), result.stdout)
            self.assertIn("Giovanni Pellicciotta", result.stdout)

    def test_help_flag_and_action(self) -> None:
        """Validates that help exits 0 and documents all actions."""
        for flag in ["--help", "-h", "help"]:
            result = _run_devops(flag)
            self.assertEqual(result.returncode, 0, f"Expected 0 for {flag}")
            for action in ["lint", "test", "check", "serve", "sw", "versions", "release", "deploy"]:
                self.assertIn(action, result.stdout, f"Help screen missing action: {action}")
            self.assertIn("Exit codes:", result.stdout)

    def test_invalid_action_exits_2(self) -> None:
        """Validates that invalid action names exit with code 2."""
        self.assertEqual(_run_devops("nonexistent-action").returncode, 2)

    def test_versions_subcommand(self) -> None:
        """Validates that versions reports agreement and exits 0."""
        result = _run_devops("versions")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Versions agree", result.stdout)


class TestDevopsDryRunIntegration(unittest.TestCase):
    """Runs real release dry runs in a throwaway clone, with and without an active -pre heading."""

    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.clone = Path(self.tmp.name) / "clone"
        # Copy objects instead of hard-linking them: NTFS caps a file at 1023 links, and links pin the repository packs.
        subprocess.run(["git", "clone", "-q", "--no-hardlinks", str(REPO_ROOT), str(self.clone)], check=True)
        subprocess.run(["git", "-C", str(self.clone), "config", "user.email", "test@example.invalid"], check=True)
        subprocess.run(["git", "-C", str(self.clone), "config", "user.name", "Test"], check=True)
        # Start from the released state even when the repository itself has an active -pre heading.
        for name in ["CHANGELOG.md", "CHANGELOG.nl.md"]:
            path = self.clone / name
            text = path.read_text(encoding="utf-8")
            text = re.sub(r"^(## v\d+\.\d+\.\d+)-pre[ \t]*$", r"\1 [released: 2026-01-01]", text, count=1, flags=re.MULTILINE)
            path.write_text(text, encoding="utf-8", newline="")
        subprocess.run(["git", "-C", str(self.clone), "commit", "-q", "-am", "Closed pre heading.", "--allow-empty"], check=True)

    def _devops(self, *args: str) -> subprocess.CompletedProcess:
        return subprocess.run(
            [sys.executable, str(self.clone / "scripts" / "devops.py"), *args],
            cwd=str(self.clone),
            capture_output=True,
            text=True,
            check=False,
        )

    def _open_pre_heading(self) -> None:
        for name in ["CHANGELOG.md", "CHANGELOG.nl.md"]:
            path = self.clone / name
            text = path.read_text(encoding="utf-8")
            text = re.sub(r"^(## v\d+\.\d+\.\d+ \[released: )", "## v9.9.9-pre\n- Test entry.\n\n\\1", text, count=1, flags=re.MULTILINE)
            path.write_text(text, encoding="utf-8", newline="")
        manifest = self.clone / "package.json"
        manifest.write_text(
            re.sub(r'"version": "[^"]+"', '"version": "9.9.9-pre"', manifest.read_text(encoding="utf-8"), count=1),
            encoding="utf-8",
            newline="",
        )
        subprocess.run(["git", "-C", str(self.clone), "commit", "-q", "-am", "Opened pre heading."], check=True)

    def test_release_dry_run_passes_with_pre_heading_and_changes_nothing(self) -> None:
        """Validates release --dry-run exits 0 on a clean tree with an active -pre heading."""
        self._open_pre_heading()
        head = subprocess.run(["git", "-C", str(self.clone), "rev-parse", "HEAD"], capture_output=True, text=True).stdout
        result = self._devops("release", "--dry-run", "--skip-checks")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("[dry-run]", result.stdout)
        status = subprocess.run(["git", "-C", str(self.clone), "status", "--porcelain"], capture_output=True, text=True).stdout
        self.assertEqual(status.strip(), "")
        head_after = subprocess.run(["git", "-C", str(self.clone), "rev-parse", "HEAD"], capture_output=True, text=True).stdout
        self.assertEqual(head, head_after)

    def test_release_tags_then_reopens_next_patch_pre_heading(self) -> None:
        """Validates a real release tags the frozen version and then opens the next patch -pre version."""
        self._open_pre_heading()
        result = self._devops("release", "--skip-checks")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

        def git(*args: str) -> str:
            return subprocess.run(["git", "-C", str(self.clone), *args], capture_output=True, text=True, check=True).stdout

        self.assertIn("[released:", git("show", "v9.9.9:CHANGELOG.md").split("\n## v9.9.9", 1)[1].split("\n", 1)[0])
        self.assertEqual(json.loads(git("show", "v9.9.9:package.json"))["version"], "9.9.9")
        for name in ["CHANGELOG.md", "CHANGELOG.nl.md"]:
            top = re.search(r"^## v\S+.*$", (self.clone / name).read_text(encoding="utf-8"), re.MULTILINE)
            self.assertEqual(top.group(0).strip(), "## v9.9.10-pre", name)
        self.assertEqual(json.loads((self.clone / "package.json").read_text(encoding="utf-8"))["version"], "9.9.10-pre")
        self.assertEqual(git("status", "--porcelain").strip(), "")
        self.assertEqual(self._devops("versions").returncode, 0)

    def test_release_dry_run_fails_without_pre_heading(self) -> None:
        """Validates the missing -pre heading propagates as exit 1."""
        result = self._devops("release", "--dry-run", "--skip-checks")
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn("nothing to release", result.stdout + result.stderr)

    def test_release_dry_run_fails_on_dirty_tree(self) -> None:
        """Validates uncommitted changes propagate as exit 1."""
        self._open_pre_heading()
        (self.clone / "untracked.txt").write_text("x", encoding="utf-8")
        result = self._devops("release", "--dry-run", "--skip-checks")
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn("uncommitted changes", result.stdout + result.stderr)

    def test_release_dry_run_fails_when_checks_fail(self) -> None:
        """Validates a failing quality check propagates as exit 1 through the deploy flow."""
        mod = _load_devops_module()
        project = mod.MeteoProject(REPO_ROOT)
        logger = MagicMock()
        with patch.object(mod, "check_clean_git_tree", return_value=True), patch.object(
            mod, "read_active_pre_release_version", return_value="9.9.9"
        ), patch.object(mod, "current_branch", return_value="main"), patch.object(project, "check", return_value=False):
            self.assertEqual(mod.deploy_flow(project, dry_run=True, push=False, skip_checks=False, logger=logger), 1)



PINNED_VERSION = "3.2.0"
VENV_RELATIVE = Path(".venv") / ("Scripts/python.exe" if sys.platform == "win32" else "bin/python")
REEXEC_ENV = "METEO_DEVOPS_VENV_REEXEC"
SETUP_COMMAND = "pip install -r scripts/requirements.txt"


def _git(*args: str) -> None:
    subprocess.run(["git", *args], check=True, capture_output=True, text=True)


def _write_fake_support_python(site: Path, version: str, marker: str, exit_code: int) -> None:
    """Writes a stand-in support-python distribution whose devops package prints marker and exits."""
    package = site / "support_python"
    (package / "devops").mkdir(parents=True)
    (package / "__init__.py").write_text("", encoding="utf-8")
    (package / "devops" / "__init__.py").write_text(
        f"import sys\nprint({marker!r})\nsys.stdout.flush()\nraise SystemExit({exit_code})\n", encoding="utf-8"
    )
    dist_info = site / f"support_python-{version}.dist-info"
    dist_info.mkdir()
    (dist_info / "METADATA").write_text(
        f"Metadata-Version: 2.1\nName: support-python\nVersion: {version}\n", encoding="utf-8"
    )


def _make_venv(root: Path, version: Optional[str], marker: str, exit_code: int) -> None:
    """Creates root/.venv, holding a stand-in support-python of version, or none when version is None."""
    subprocess.run([sys.executable, "-m", "venv", "--without-pip", str(root / ".venv")], check=True, timeout=120)
    if version is None:
        return
    purelib = subprocess.run(
        [str(root / VENV_RELATIVE), "-c", "import sysconfig; print(sysconfig.get_paths()['purelib'])"],
        capture_output=True,
        text=True,
        check=True,
    ).stdout.strip()
    _write_fake_support_python(Path(purelib), version, marker, exit_code)


def _run_script_with_site(script: Path, site: Path, *args: str) -> subprocess.CompletedProcess:
    """Runs script as __main__ with site first on sys.path, like a user-site install."""
    bootstrap = (
        "import runpy, sys\n"
        f"sys.path.insert(0, {str(site)!r})\n"
        f"sys.argv = [{str(script)!r}, *{list(args)!r}]\n"
        f"runpy.run_path({str(script)!r}, run_name='__main__')\n"
    )
    env = {key: value for key, value in os.environ.items() if key != REEXEC_ENV}
    return subprocess.run(
        [sys.executable, "-c", bootstrap],
        cwd=str(script.parent.parent),
        capture_output=True,
        text=True,
        check=False,
        timeout=120,
        env=env,
    )


class TestSupportPythonPin(unittest.TestCase):
    """Validates how devops.py reads the support-python pin and finds the project venv."""

    def setUp(self) -> None:
        self.mod = _load_devops_module()
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)

    def test_pin_read_from_project_requirements(self) -> None:
        """Validates the git URL pin in scripts/requirements.txt yields 3.2.0."""
        self.assertEqual(self.mod.pinned_support_python_version(REQUIREMENTS), PINNED_VERSION)

    def test_pin_read_from_exact_requirement(self) -> None:
        """Validates an exact version requirement is read as the pin."""
        requirements = self.root / "requirements.txt"
        requirements.write_text("other==1.0\nsupport_python==3.4.1\n", encoding="utf-8")
        self.assertEqual(self.mod.pinned_support_python_version(requirements), "3.4.1")

    def test_no_pin_without_support_python_line(self) -> None:
        """Validates a requirements file without support-python has no pin."""
        requirements = self.root / "requirements.txt"
        requirements.write_text("other==1.0\n", encoding="utf-8")
        self.assertIsNone(self.mod.pinned_support_python_version(requirements))

    def test_venv_candidates_from_worktree_include_primary_checkout(self) -> None:
        """Validates a linked worktree falls back to the primary checkout's venv."""
        main = self.root / "main"
        main.mkdir()
        _git("-C", str(main), "init", "-q")
        _git("-C", str(main), "-c", "user.email=t@example.invalid", "-c", "user.name=T", "commit", "-q", "--allow-empty", "-m", "Init.")
        worktree = self.root / "worktree"
        _git("-C", str(main), "worktree", "add", "-q", "-b", "task", str(worktree))
        candidates = [path.resolve() for path in self.mod.venv_python_candidates(worktree)]
        self.assertEqual(candidates, [(worktree / VENV_RELATIVE).resolve(), (main / VENV_RELATIVE).resolve()])

    def test_venv_candidates_from_primary_checkout_list_only_its_venv(self) -> None:
        """Validates a primary checkout only offers its own venv."""
        _git("-C", str(self.root), "init", "-q")
        candidates = [path.resolve() for path in self.mod.venv_python_candidates(self.root)]
        self.assertEqual(candidates, [(self.root / VENV_RELATIVE).resolve()])


class TestSupportPythonVenvSelection(unittest.TestCase):
    """Runs a copy of devops.py against stand-in support-python versions, with and without a project venv."""

    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.project = Path(self.tmp.name) / "project"
        (self.project / "scripts").mkdir(parents=True)
        for source in [DEVOPS_SCRIPT, REQUIREMENTS]:
            (self.project / "scripts" / source.name).write_bytes(source.read_bytes())
        self.outer_site = Path(self.tmp.name) / "outer-site"

    def _run_copy(self, *args: str) -> subprocess.CompletedProcess:
        """Runs the copied script as __main__ with the stand-in site first on sys.path."""
        return _run_script_with_site(self.project / "scripts" / "devops.py", self.outer_site, *args)

    def test_mismatched_version_without_venv_exits_with_setup_commands(self) -> None:
        """Validates a wrong support-python version and no venv stop devops.py with the setup commands."""
        _write_fake_support_python(self.outer_site, "0.0.1", "WRONG-VERSION-RAN", 9)
        result = self._run_copy("version")
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertNotIn("WRONG-VERSION-RAN", result.stdout)
        self.assertIn("0.0.1", result.stderr)
        self.assertIn(PINNED_VERSION, result.stderr)
        self.assertIn("pip install -r scripts/requirements.txt", result.stderr)

    def test_mismatched_version_reruns_under_project_venv(self) -> None:
        """Validates a wrong support-python version re-runs devops.py under the project venv."""
        _write_fake_support_python(self.outer_site, "0.0.1", "WRONG-VERSION-RAN", 9)
        venv = self.project / ".venv"
        subprocess.run([sys.executable, "-m", "venv", "--without-pip", str(venv)], check=True, timeout=120)
        venv_python = self.project / VENV_RELATIVE
        purelib = subprocess.run(
            [str(venv_python), "-c", "import sysconfig; print(sysconfig.get_paths()['purelib'])"],
            capture_output=True,
            text=True,
            check=True,
        ).stdout.strip()
        _write_fake_support_python(Path(purelib), PINNED_VERSION, "PINNED-VENV-RAN", 7)
        result = self._run_copy("version")
        self.assertEqual(result.returncode, 7, result.stdout + result.stderr)
        self.assertIn("PINNED-VENV-RAN", result.stdout)
        self.assertNotIn("WRONG-VERSION-RAN", result.stdout)

    def test_pinned_version_runs_without_reexec(self) -> None:
        """Validates the pinned support-python version runs in place."""
        _write_fake_support_python(self.outer_site, PINNED_VERSION, "PINNED-IN-PLACE-RAN", 5)
        result = self._run_copy("version")
        self.assertEqual(result.returncode, 5, result.stdout + result.stderr)
        self.assertIn("PINNED-IN-PLACE-RAN", result.stdout)


class TestSupportPythonVenvFallback(unittest.TestCase):
    """Validates the choice between worktree and primary venvs, mocking interpreter probes and re-execution."""

    def setUp(self) -> None:
        self.mod = _load_devops_module()
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.worktree_python = self.root / "worktree" / VENV_RELATIVE
        self.primary_python = self.root / "main" / VENV_RELATIVE
        for python in [self.worktree_python, self.primary_python]:
            python.parent.mkdir(parents=True)
            python.write_bytes(b"")

    def _reexec(
        self,
        venv_versions: dict[Path, Optional[str]],
        running_prefix: Path,
        installed: Optional[str] = "3.1.0",
        marker: Optional[str] = None,
    ) -> tuple[Optional[int], MagicMock, str]:
        """Runs _reexec_in_venv with mocked probes; returns its exit code, the run mock, and stderr."""
        run = MagicMock(return_value=subprocess.CompletedProcess([], 0))
        stderr = io.StringIO()
        environ = {key: value for key, value in os.environ.items() if key != REEXEC_ENV}
        if marker is not None:
            environ[REEXEC_ENV] = marker
        code: Optional[int] = None
        with contextlib.ExitStack() as stack:
            stack.enter_context(patch.dict(os.environ, environ, clear=True))
            stack.enter_context(patch.object(self.mod, "pinned_support_python_version", return_value=PINNED_VERSION))
            stack.enter_context(patch.object(self.mod, "installed_support_python_version", return_value=installed))
            stack.enter_context(
                patch.object(self.mod, "venv_python_candidates", return_value=[self.worktree_python, self.primary_python])
            )
            stack.enter_context(
                patch.object(self.mod, "venv_support_python_version", side_effect=venv_versions.get, create=True)
            )
            stack.enter_context(patch.object(self.mod.subprocess, "run", run))
            stack.enter_context(patch.object(self.mod.sys, "prefix", str(running_prefix)))
            stack.enter_context(contextlib.redirect_stderr(stderr))
            try:
                self.mod._reexec_in_venv()
            except SystemExit as exit_:
                code = exit_.code
            self.marker_after = os.environ.get(REEXEC_ENV)
        return code, run, stderr.getvalue()

    def test_two_mismatched_venvs_exit_with_setup_commands(self) -> None:
        """Validates incompatible worktree and primary venvs end in the setup error, not a re-execution."""
        versions = {self.worktree_python: "3.1.0", self.primary_python: "3.0.0"}
        code, run, stderr = self._reexec(versions, self.worktree_python.parent.parent)
        self.assertEqual(code, 1, run.call_args_list)
        run.assert_not_called()
        self.assertIn(SETUP_COMMAND, stderr)

    def test_two_venvs_without_support_python_exit_with_setup_commands(self) -> None:
        """Validates venvs lacking support-python end in the setup error, not a re-execution."""
        versions = {self.worktree_python: None, self.primary_python: None}
        code, run, stderr = self._reexec(versions, self.primary_python.parent.parent, installed=None)
        self.assertEqual(code, 1, run.call_args_list)
        run.assert_not_called()
        self.assertIn(SETUP_COMMAND, stderr)

    def test_mismatched_worktree_venv_falls_back_to_pinned_primary_venv(self) -> None:
        """Validates an incompatible worktree venv is skipped for a primary venv holding the pin."""
        versions = {self.worktree_python: "3.1.0", self.primary_python: PINNED_VERSION}
        code, run, _ = self._reexec(versions, self.root / "global")
        self.assertEqual(code, 0)
        run.assert_called_once()
        self.assertEqual(run.call_args.args[0][0], str(self.primary_python))
        self.assertEqual(run.call_args.kwargs["env"][REEXEC_ENV], "1")

    def test_reexecuted_run_never_reexecutes_again(self) -> None:
        """Validates a run started by a re-execution exits with the setup error on a mismatch."""
        versions = {self.worktree_python: PINNED_VERSION, self.primary_python: PINNED_VERSION}
        code, run, stderr = self._reexec(versions, self.root / "global", marker="1")
        self.assertEqual(code, 1, run.call_args_list)
        run.assert_not_called()
        self.assertIn(SETUP_COMMAND, stderr)

    def test_pinned_version_clears_reexec_marker(self) -> None:
        """Validates a run on the pinned version clears the marker, so nested devops runs may re-execute."""
        code, run, _ = self._reexec({}, self.root / "global", installed=PINNED_VERSION, marker="1")
        self.assertIsNone(code)
        run.assert_not_called()
        self.assertIsNone(self.marker_after)


class TestSupportPythonWorktreeFallback(unittest.TestCase):
    """Runs devops.py from a linked worktree whose own and primary venvs both lack the pinned version."""

    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        root = Path(self.tmp.name)
        self.main = root / "main"
        (self.main / "scripts").mkdir(parents=True)
        for source in [DEVOPS_SCRIPT, REQUIREMENTS]:
            (self.main / "scripts" / source.name).write_bytes(source.read_bytes())
        _git("-C", str(self.main), "init", "-q")
        _git("-C", str(self.main), "add", "scripts")
        _git("-C", str(self.main), "-c", "user.email=t@example.invalid", "-c", "user.name=T", "commit", "-q", "-m", "Init.")
        self.worktree = root / "worktree"
        _git("-C", str(self.main), "worktree", "add", "-q", "-b", "task", str(self.worktree))
        self.outer_site = root / "outer-site"
        _write_fake_support_python(self.outer_site, "0.0.1", "WRONG-VERSION-RAN", 9)

    def _assert_setup_error(self, result: subprocess.CompletedProcess) -> None:
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertNotIn("RAN", result.stdout)
        self.assertIn(SETUP_COMMAND, result.stderr)

    def test_two_mismatched_venvs_exit_with_setup_commands(self) -> None:
        """Validates incompatible worktree and primary venvs exit 1 with the setup commands."""
        _make_venv(self.worktree, "0.0.2", "WORKTREE-VENV-RAN", 3)
        _make_venv(self.main, "0.0.3", "PRIMARY-VENV-RAN", 4)
        self._assert_setup_error(_run_script_with_site(self.worktree / "scripts" / "devops.py", self.outer_site, "version"))

    def test_two_venvs_without_support_python_exit_with_setup_commands(self) -> None:
        """Validates worktree and primary venvs without support-python exit 1 with the setup commands."""
        _make_venv(self.worktree, None, "", 0)
        _make_venv(self.main, None, "", 0)
        self._assert_setup_error(_run_script_with_site(self.worktree / "scripts" / "devops.py", self.outer_site, "version"))

    def test_mismatched_worktree_venv_falls_back_to_pinned_primary_venv(self) -> None:
        """Validates an incompatible worktree venv hands over to a primary venv holding the pin."""
        _make_venv(self.worktree, "0.0.2", "WORKTREE-VENV-RAN", 3)
        _make_venv(self.main, PINNED_VERSION, "PRIMARY-VENV-RAN", 4)
        result = _run_script_with_site(self.worktree / "scripts" / "devops.py", self.outer_site, "version")
        self.assertEqual(result.returncode, 4, result.stdout + result.stderr)
        self.assertIn("PRIMARY-VENV-RAN", result.stdout)
        self.assertNotIn("WORKTREE-VENV-RAN", result.stdout)



class TestIntegrationCloneIsolation(unittest.TestCase):
    """Validates the dry-run integration clones share no files with the repository and leave nothing behind."""

    def test_integration_clone_is_independent_and_removed(self) -> None:
        """Validates clone pack files have one link each and cleanup deletes the clone."""
        case = TestDevopsDryRunIntegration("test_release_dry_run_fails_without_pre_heading")
        case.setUp()
        clone = case.clone
        try:
            pack_files = list((clone / ".git" / "objects" / "pack").glob("*"))
            self.assertTrue(pack_files, "the clone holds no pack files")
            for pack_file in pack_files:
                self.assertEqual(pack_file.stat().st_nlink, 1, f"{pack_file.name} is hard-linked to the repository")
        finally:
            case.doCleanups()
        self.assertFalse(clone.exists(), "cleanup left the integration clone behind")


if __name__ == "__main__":
    unittest.main()
