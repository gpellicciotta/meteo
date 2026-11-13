"""Automated unit tests for scripts/devops.py, the DevopsCli adapter for Meteo."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
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
        self.assertEqual(argv[1:3], ["check", "--offline"])
        self.assertEqual([Path(a).name for a in argv[3:]], self.mod.CORE_DOCS)

    def test_check_stops_at_first_failure(self) -> None:
        """Validates check runs lint then test and skips test after a lint failure."""
        with patch.object(self.project, "lint", return_value=False), patch.object(self.project, "test") as tests:
            self.assertFalse(self.project.check())
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
        self.tmp = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        self.addCleanup(self.tmp.cleanup)
        self.clone = Path(self.tmp.name) / "clone"
        subprocess.run(["git", "clone", "-q", "--local", str(REPO_ROOT), str(self.clone)], check=True)
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


if __name__ == "__main__":
    unittest.main()
