#!/usr/bin/env python3
"""Unified development and operational CLI for Meteo, built on support-python's DevopsCli.

Usage:
  python scripts/devops.py lint | format | test [--slow] | build | check | clean
  python scripts/devops.py serve [--host 127.0.0.1] [--port 8062]
  python scripts/devops.py sw
  python scripts/devops.py versions [VERSION] [--dry-run]
  python scripts/devops.py release [--dry-run]
  python scripts/devops.py deploy [--dry-run] [--push]
  python scripts/devops.py help [--verbose] | version

Setup (once):
  python -m venv .venv
  .venv/Scripts/python -m pip install -r scripts/requirements.txt
"""

from __future__ import annotations

import argparse
from datetime import date
import functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
import subprocess
import sys
from typing import Optional, Sequence

REPO_ROOT = Path(__file__).resolve().parent.parent
REQUIREMENTS_PATH = REPO_ROOT / "scripts" / "requirements.txt"
VENV_PYTHON_RELATIVE = Path(".venv") / ("Scripts/python.exe" if sys.platform == "win32" else "bin/python")
SUPPORT_PYTHON_PIN = re.compile(r"^\s*support[-_]python\b[^\n#]*?(?:==\s*|@v?)(\d+(?:\.\d+)*)\s*(?:#.*)?$", re.IGNORECASE | re.MULTILINE)


def pinned_support_python_version(requirements: Path = REQUIREMENTS_PATH) -> Optional[str]:
    """Returns the support-python version pinned in a requirements file, or None when it pins none."""
    try:
        text = requirements.read_text(encoding="utf-8")
    except OSError:
        return None
    match = SUPPORT_PYTHON_PIN.search(text)
    return match.group(1) if match else None


def installed_support_python_version() -> Optional[str]:
    """Returns the version of the importable support-python distribution without importing it, or None."""
    from importlib import metadata

    try:
        return metadata.version("support-python")
    except metadata.PackageNotFoundError:
        return None


def venv_python_candidates(repo_root: Path = REPO_ROOT) -> list[Path]:
    """Returns the venv interpreters to try: the checkout's own, then the primary checkout's from a linked worktree."""
    roots = [repo_root]
    try:
        result = subprocess.run(
            ["git", "-C", str(repo_root), "rev-parse", "--path-format=absolute", "--git-common-dir"],
            capture_output=True,
            text=True,
            check=False,
            timeout=10,
        )
    except (OSError, subprocess.SubprocessError):
        result = None
    if result is not None and result.returncode == 0 and result.stdout.strip():
        primary_root = Path(result.stdout.strip()).parent
        if primary_root.resolve() != repo_root.resolve():
            roots.append(primary_root)
    return [root / VENV_PYTHON_RELATIVE for root in roots]


def _reexec_in_venv() -> None:
    """Re-runs this script under the project venv unless the pinned support-python version is importable."""
    pinned = pinned_support_python_version()
    installed = installed_support_python_version()
    if installed is not None and (pinned is None or installed == pinned):
        return
    running_prefix = Path(sys.prefix).resolve()
    for venv_python in venv_python_candidates():
        if venv_python.is_file() and venv_python.parent.parent.resolve() != running_prefix:
            raise SystemExit(subprocess.run([str(venv_python), *sys.argv], check=False).returncode)
    found = f"support-python {installed} is installed" if installed else "support-python is not installed"
    wanted = f"scripts/requirements.txt pins {pinned}" if pinned else "scripts/requirements.txt requires it"
    print(
        f"{found}, but {wanted}. Install the pinned version into the project venv:\n"
        "  python -m venv .venv\n"
        "  .venv/Scripts/python -m pip install -r scripts/requirements.txt",
        file=sys.stderr,
    )
    raise SystemExit(1)


if __name__ == "__main__":
    _reexec_in_venv()

from support_python.devops import DevopsCli, NodeProject  # noqa: E402
from support_python.devops.release import read_version, write_version  # noqa: E402
from support_python.logging import CliLogger  # noqa: E402

PROG = "devops"
DESCRIPTION = "Unified development and operational CLI: lint, test, check, serve, sw, versions, release, and deploy."
COPYRIGHT = "Copyright (c) 2026 Giovanni Pellicciotta"

CORE_DOCS = [
    "LICENSE.md",
    "README.md",
    "CHANGELOG.md",
    "CHANGELOG.nl.md",
]

CHANGELOG_PATH = REPO_ROOT / "CHANGELOG.md"
CHANGELOG_NL_PATH = REPO_ROOT / "CHANGELOG.nl.md"
PACKAGE_JSON_PATH = REPO_ROOT / "package.json"
SW_SCRIPT_PATH = REPO_ROOT / "scripts" / "generate-sw.py"
DESIGN_CHECK_PATH = REPO_ROOT / "vendor" / "design" / "bin" / "check.mjs"

DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8062


class ReviewServer(ThreadingHTTPServer):
    """Threading HTTP server that survives the application's parallel module fetches."""

    daemon_threads = True
    request_queue_size = 128
    # On Windows SO_REUSEADDR lets a second server silently steal a bound port.
    # Duplicate start must fail loudly instead. POSIX keeps it to rebind after TIME_WAIT.
    allow_reuse_address = sys.platform != "win32"


class QuietHandler(SimpleHTTPRequestHandler):
    """Static file handler routing its access log through the shared logger."""

    logger: Optional[CliLogger] = None

    def log_message(self, format: str, *args) -> None:
        """Route access log lines to the shared logger at DEBUG level."""
        if self.logger is not None:
            self.logger.debug(format % args, origin=PROG)

    def end_headers(self) -> None:
        """Disable caching so a reviewer always sees the current working tree."""
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


def serve(host: str, port: int, logger: CliLogger) -> int:
    """Runs the review server until interrupted, returning the process exit code."""
    QuietHandler.logger = logger
    handler = functools.partial(QuietHandler, directory=str(REPO_ROOT))
    try:
        server = ReviewServer((host, port), handler)
    except OSError as exc:
        logger.error(f"Cannot serve on {host}:{port}: {exc}")
        return 1

    logger.info(f"Serving {REPO_ROOT} at http://{host}:{port}/ (Ctrl+C to stop).")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("Shutting down on keyboard interrupt.")
    finally:
        server.server_close()
    return 0


def run_git(*args: str, cwd: Path = REPO_ROOT) -> subprocess.CompletedProcess:
    """Runs git with captured text output in cwd."""
    return subprocess.run(["git", *args], cwd=str(cwd), check=False, capture_output=True, text=True)


def has_plan_branch() -> bool:
    """Returns whether a local plan branch exists in the repository."""
    return run_git("show-ref", "--verify", "--quiet", "refs/heads/plan").returncode == 0


def check_clean_git_tree(logger: CliLogger) -> bool:
    """Returns whether the git working tree has no uncommitted changes."""
    logger.info("Checking git working tree status.")
    result = run_git("status", "--porcelain")
    if result.returncode != 0:
        logger.error("Failed to query git status")
        return False
    if result.stdout.strip():
        logger.error("Working tree has uncommitted changes - commit or stash before deploying.\n" + result.stdout.strip())
        return False

    plan_dir = REPO_ROOT / ".plan"
    if plan_dir.is_dir() and (plan_dir / ".git").exists():
        plan_result = run_git("status", "--porcelain", cwd=plan_dir)
        if plan_result.returncode == 0 and plan_result.stdout.strip():
            logger.error(
                ".plan working tree has uncommitted changes - commit or stash before deploying.\n"
                + plan_result.stdout.strip()
            )
            return False

    logger.info("Working tree is clean.")
    return True


def read_active_pre_release_version(logger: CliLogger) -> Optional[str]:
    """Returns the active '-pre' version number from CHANGELOG.md's top heading, or None."""
    logger.info("Checking active CHANGELOG.md version.")
    if not CHANGELOG_PATH.exists():
        logger.error("CHANGELOG.md not found.")
        return None
    text = CHANGELOG_PATH.read_text(encoding="utf-8")
    m = re.search(r"^## v([0-9]+(?:\.[0-9]+)+)-pre\s*$", text, re.MULTILINE)
    if not m:
        logger.error("No active '-pre' version heading found at the top of CHANGELOG.md - nothing to release.")
        return None
    version = m.group(1)
    logger.info(f"Active in-development version: v{version}-pre")
    return version


def finalize_changelog(version: str, logger: CliLogger) -> bool:
    """Replaces the active '-pre' heading with a '[released: date]' status tag and freezes package.json."""
    logger.info("Finalizing CHANGELOG.md heading.")
    today = date.today().isoformat()
    for path in (CHANGELOG_PATH, CHANGELOG_NL_PATH):
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        new_text, count = re.subn(
            rf"^## v{re.escape(version)}-pre\s*$",
            f"## v{version} [released: {today}]",
            text,
            count=1,
            flags=re.MULTILINE,
        )
        if count != 1:
            if path == CHANGELOG_PATH:
                logger.error("Failed to locate the '-pre' heading to finalize.")
                return False
            continue
        path.write_text(new_text, encoding="utf-8")
        logger.info(f"Finalized heading in {path.name}: v{version} [released: {today}]")

    if PACKAGE_JSON_PATH.exists() and read_version(REPO_ROOT) != version:
        write_version(REPO_ROOT, version)
        logger.info(f"Set package.json version to {version}.")
    return True


def regenerate_service_worker(logger: CliLogger) -> bool:
    """Regenerates sw.js so precached assets and the cache-key version stay current."""
    if not SW_SCRIPT_PATH.exists():
        logger.error("generate-sw.py not found.")
        return False
    result = subprocess.run(
        [sys.executable, str(SW_SCRIPT_PATH), "generate"],
        cwd=str(REPO_ROOT),
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        err = (result.stderr.strip() + "\n" + result.stdout.strip()).strip()
        logger.error(f"sw.js generation failed:\n{err}")
        return False
    logger.info("sw.js regenerated successfully.")
    return True


def create_release_commit(version: str, logger: CliLogger) -> bool:
    """Commits the finalized changelogs, package.json, and regenerated sw.js."""
    logger.info("Committing release.")
    files = ["CHANGELOG.md", "package.json", "sw.js"]
    if CHANGELOG_NL_PATH.exists():
        files.append("CHANGELOG.nl.md")
    result = run_git("add", *files)
    if result.returncode != 0:
        logger.error(f"git add failed:\n{result.stderr}")
        return False
    result = run_git("commit", "-m", f"Released v{version}.")
    if result.returncode != 0:
        logger.error(f"git commit failed:\n{result.stderr}\n{result.stdout}")
        return False
    logger.info(f"Committed release v{version}.")
    return True


def create_git_tag(version: str, logger: CliLogger) -> bool:
    """Creates the local git tag for the release."""
    logger.info("Creating git tag.")
    result = run_git("tag", f"v{version}")
    if result.returncode != 0:
        logger.error(f"git tag failed (it may already exist):\n{result.stderr}")
        return False
    logger.info(f"Created tag v{version}.")
    return True


def next_patch_version(version: str) -> str:
    """Returns the version with its patch number raised by one."""
    major, minor, patch = (int(part) for part in version.split("."))
    return f"{major}.{minor}.{patch + 1}"


def open_next_development_version(version: str, logger: CliLogger) -> bool:
    """Opens the next patch '-pre' heading in both changelogs and package.json, then commits it."""
    next_version = next_patch_version(version)
    logger.info(f"Opening v{next_version}-pre.")
    for path in (CHANGELOG_PATH, CHANGELOG_NL_PATH):
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        new_text, count = re.subn(r"^## v", f"## v{next_version}-pre\n\n## v", text, count=1, flags=re.MULTILINE)
        if count != 1:
            logger.error(f"No version heading found in {path.name} to open v{next_version}-pre above.")
            return False
        path.write_text(new_text, encoding="utf-8")
    write_version(REPO_ROOT, f"{next_version}-pre")
    files = ["CHANGELOG.md", "package.json"]
    if CHANGELOG_NL_PATH.exists():
        files.append("CHANGELOG.nl.md")
    result = run_git("add", *files)
    if result.returncode == 0:
        result = run_git("commit", "-m", f"Opened v{next_version}-pre.")
    if result.returncode != 0:
        logger.error(f"Committing v{next_version}-pre failed:\n{result.stderr}\n{result.stdout}")
        return False
    logger.info(f"Committed v{next_version}-pre.")
    return True


def push_release(branch: str, version: str, logger: CliLogger) -> bool:
    """Pushes the release branch, tag, and plan branch to origin when --push was passed."""
    logger.info("Pushing release to origin.")
    targets = [branch, f"v{version}"]
    if has_plan_branch():
        targets.append("plan")
    result = run_git("push", "origin", *targets)
    if result.returncode != 0:
        logger.error(f"git push failed:\n{result.stderr}")
        return False
    logger.info(f"Pushed {' '.join(targets)} to origin.")
    return True


def current_branch(logger: CliLogger) -> str:
    """Returns the current git branch name."""
    result = run_git("rev-parse", "--abbrev-ref", "HEAD")
    branch = result.stdout.strip() if result.returncode == 0 else "unknown"
    logger.info(f"Current branch: {branch}")
    return branch


class MeteoProject(NodeProject):
    """Meteo repository: Python unittest plus vitest, markdown lint, and a deploy-based release."""

    def test(self, selection: Sequence[str] = ()) -> bool:
        """Runs the Python unittest suite and then npm test; a selection goes to npm test only."""
        if selection:
            return self._npm("test", "--", *selection)
        python_ok = self.run_command([sys.executable, "-m", "unittest", "discover", "-s", "tests"])
        if not python_ok:
            self.logger.error("Python test suite failed.")
            return False
        if not PACKAGE_JSON_PATH.exists():
            return True
        if not self._npm("test"):
            self.logger.error("Node test suite failed.")
            return False
        return True

    def test_slow(self, selection: Sequence[str] = ()) -> bool:
        """Runs the Playwright browser suites through npm run test:browser."""
        return self._npm("run", "test:browser", *(["--", *selection] if selection else []))

    def lint(self) -> bool:
        """Checks the core documentation with lint-markdown, offline."""
        return self._lint_markdown("check")

    def format(self) -> bool:
        """Fixes the core documentation with lint-markdown, offline."""
        return self._lint_markdown("fix")

    def build(self) -> bool:
        """Skips the build: the app is static and npm pack must never run."""
        self.logger.info("Nothing to build; skipping.")
        return True

    def design_check(self) -> bool:
        """Runs the vendored support.webapp check: copy integrity and app style conformance."""
        return self.run_command(["node", str(DESIGN_CHECK_PATH)])

    def check(self) -> bool:
        """Runs lint, the vendored design check, and the fast tests, stopping at the first failure."""
        return self.lint() and self.design_check() and self.test()

    def action_summaries(self) -> dict[str, str]:
        """Describes the overridden actions in the help screen."""
        return {
            "lint": "check the core Markdown documents with lint-markdown, offline",
            "format": "fix the core Markdown documents with lint-markdown, offline",
            "test": "run the Python unittest suite and npm test; --slow runs the browser suites",
            "build": "skipped: the app is static and has no outputs",
            "check": "run lint, the vendored design check, and the fast tests, stopping at the first failure",
            "release": "validate, freeze the changelogs and sw.js, commit, tag locally, and open the next -pre version",
        }

    def release(
        self, *, dry_run: bool = False, assume_yes: bool = False, skip_checks: bool = False, skip_github_release: bool = False
    ) -> bool:
        """Runs the Meteo deploy flow: freeze changelogs, regenerate sw.js, commit, and tag; never pushes."""
        return deploy_flow(self, dry_run=dry_run, push=False, skip_checks=skip_checks, logger=self.logger) == 0

    def _lint_markdown(self, action: str) -> bool:
        from support_python.devops.steps import resolve_executable

        executable = resolve_executable("lint-markdown")
        if executable is None:
            self.logger.error("lint-markdown not found; install scripts/requirements.txt into the venv.")
            return False
        docs = [doc for doc in CORE_DOCS if (REPO_ROOT / doc).exists()]
        return self.run_command([executable, action, "--offline", *docs])


def deploy_flow(project: MeteoProject, *, dry_run: bool, push: bool, skip_checks: bool, logger: CliLogger) -> int:
    """Validates pre-flight checks, then finalizes, commits, tags, and optionally pushes the release."""
    if dry_run and push:
        logger.error("--dry-run and --push cannot be combined.")
        return 1

    project.logger = logger
    all_ok = check_clean_git_tree(logger)
    version = read_active_pre_release_version(logger)
    all_ok &= version is not None
    branch = current_branch(logger)
    if not skip_checks:
        all_ok &= project.check()

    if not all_ok or version is None:
        logger.error("Pre-flight deployment checks failed. Resolve issues before deploying.")
        return 1

    logger.info(
        f"Deployment pre-flight summary for v{version}: branch {branch}, "
        f"{'checks skipped' if skip_checks else 'all checks passed'}."
    )

    if dry_run:
        logger.info(f"[dry-run] Preconditions validated successfully. Would finalize, commit, tag v{version}, and open v{next_patch_version(version)}-pre. No files were changed.")
        return 0

    if not finalize_changelog(version, logger):
        return 1
    if not regenerate_service_worker(logger):
        logger.error(
            "CHANGELOG.md was finalized but sw.js regeneration failed.\n"
            "Fix the issue and rerun, or 'git checkout -- CHANGELOG.md CHANGELOG.nl.md package.json' to revert."
        )
        return 1
    if not create_release_commit(version, logger):
        logger.error("Changelog and sw.js were updated but not committed.\nInspect with 'git diff', then commit manually or resolve and rerun.")
        return 1
    if not create_git_tag(version, logger):
        return 1
    if not open_next_development_version(version, logger):
        logger.error(f"v{version} is committed and tagged, but the next -pre version was not opened. Open it manually.")
        return 1

    if not push:
        plan_str = " plan" if has_plan_branch() else ""
        logger.info(
            f"Release v{version} committed and tagged locally on '{branch}'.\n"
            "With explicit confirmation, push to publish to GitHub Pages:\n"
            f"  git push origin {branch} v{version}{plan_str}\n"
            "GitHub Pages will build and publish automatically within 2 minutes."
        )
        return 0

    if not push_release(branch, version, logger):
        return 1
    logger.info(
        f"Release v{version} pushed to origin ('--push' was given). "
        "GitHub Pages will build and publish automatically within 2 minutes."
    )
    return 0


def build_cli(project: Optional[MeteoProject] = None) -> DevopsCli:
    """Builds the devops command line over the Meteo project, with serve, sw, and deploy added."""
    project = project or MeteoProject(REPO_ROOT)
    cli = DevopsCli(project, name=PROG, description=DESCRIPTION, copyright=COPYRIGHT)

    def serve_action(args: argparse.Namespace, logger: CliLogger) -> int:
        logger.info(f"Starting review server on {args.host}:{args.port}...")
        return serve(args.host, args.port, logger)

    def sw_action(args: argparse.Namespace, logger: CliLogger) -> int:
        return 0 if regenerate_service_worker(logger) else 1

    def deploy_action(args: argparse.Namespace, logger: CliLogger) -> int:
        return deploy_flow(project, dry_run=args.dry_run, push=args.push, skip_checks=False, logger=logger)

    def configure_serve(parser: argparse.ArgumentParser) -> None:
        parser.add_argument("--host", default=DEFAULT_HOST, help=f"interface to bind (default: {DEFAULT_HOST})")
        parser.add_argument("--port", type=int, default=DEFAULT_PORT, help=f"HTTP port (default: {DEFAULT_PORT})")

    def configure_deploy(parser: argparse.ArgumentParser) -> None:
        parser.add_argument("--dry-run", action="store_true", help="validate preconditions without deploying")
        parser.add_argument("--push", action="store_true", help="push the release branch, tag, and plan branch to origin")

    cli.add_action(
        "serve",
        "launch the threaded local HTTP review server for browser inspection",
        serve_action,
        usage_suffix="[--host HOST] [--port PORT]",
        configure_parser=configure_serve,
    )
    cli.add_action("sw", "regenerate the service worker cache key and asset precache list", sw_action, usage_suffix="")
    cli.add_action(
        "deploy",
        "validate, finalize, tag, and optionally push the release",
        deploy_action,
        usage_suffix="[--dry-run] [--push]",
        configure_parser=configure_deploy,
    )
    return cli


def main(argv: Optional[Sequence[str]] = None) -> int:
    return build_cli().run(argv)


if __name__ == "__main__":
    sys.exit(main())
