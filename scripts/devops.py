#!/usr/bin/env python3
"""Unified development and operational CLI for Meteo.

Provides action-oriented commands for testing, linting, quality checking, serving locally,
service worker regeneration, version inspection, and production deployment.

Usage:
  python scripts/devops.py test
  python scripts/devops.py lint
  python scripts/devops.py check
  python scripts/devops.py serve [--host 127.0.0.1] [--port 8062]
  python scripts/devops.py sw
  python scripts/devops.py versions [--check]
  python scripts/devops.py production {deploy|check} [--dry-run] [--push]
  python scripts/devops.py deploy [--dry-run] [--push]
  python scripts/devops.py --version
  python scripts/devops.py --help
"""

from __future__ import annotations

import argparse
from datetime import date
import functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import re
import subprocess
import sys
import time

SCRIPTS_DIR = Path(__file__).resolve().parent
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from _cli_common import (
    REPO_ROOT,
    TeeLogger,
    build_action_parser,
    get_project_version,
    print_help,
    print_version,
)

PROG = "devops"
DESCRIPTION = "Unified development and operational CLI: test, lint, check, serve, sw, versions, and deploy."
ACTIONS = [
    "test",
    "lint",
    "check",
    "serve",
    "sw",
    "versions",
    "production",
    "deploy",
    "version",
    "help",
]
DEFAULT_ACTION = "help"
EXIT_CODES = [
    (0, "Success"),
    (1, "An operation or precondition failed"),
    (2, "Invalid arguments or syntax errors"),
]

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

    logger: TeeLogger | None = None

    def log_message(self, format: str, *args) -> None:
        """Route access log lines to the shared logger at DEBUG level."""
        if self.logger is not None:
            self.logger.log(format % args, level="DEBUG", origin=PROG)

    def end_headers(self) -> None:
        """Disable caching so a reviewer always sees the current working tree."""
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


def serve(host: str, port: int, logger: TeeLogger) -> int:
    """Runs the review server until interrupted, returning the process exit code."""
    QuietHandler.logger = logger
    handler = functools.partial(QuietHandler, directory=str(REPO_ROOT))
    try:
        server = ReviewServer((host, port), handler)
    except OSError as exc:
        logger.log(f"Cannot serve on {host}:{port}: {exc}", level="ERROR")
        return 1

    logger.log(f"Serving {REPO_ROOT} at http://{host}:{port}/ (Ctrl+C to stop).", level="INFO")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.log("Shutting down on keyboard interrupt.", level="INFO")
    finally:
        server.server_close()
    return 0


def run_unit_tests(logger: TeeLogger) -> bool:
    """Runs automated unit tests via python unittest and npm test."""
    logger.log("\n[*] Running automated test suite\n" + "=" * 60, level="INFO")
    cmd = [sys.executable, "-m", "unittest", "discover", "-s", "tests"]
    result = subprocess.run(
        cmd,
        cwd=str(REPO_ROOT),
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        err = (result.stderr.strip() + "\n" + result.stdout.strip()).strip()
        logger.log(f"Python test suite failed:\n{err}", level="ERROR")
        return False
    lines = [line for line in result.stderr.strip().splitlines() if line.strip()]
    if lines:
        logger.log(f"Python: {lines[-1]}", level="INFO")

    if PACKAGE_JSON_PATH.exists():
        npm_cmd = ["npm.cmd" if sys.platform == "win32" else "npm", "test"]
        npm_result = subprocess.run(
            npm_cmd,
            cwd=str(REPO_ROOT),
            check=False,
            capture_output=True,
            text=True,
        )
        if npm_result.returncode != 0:
            err = (npm_result.stderr.strip() + "\n" + npm_result.stdout.strip()).strip()
            logger.log(f"Node test suite failed:\n{err}", level="ERROR")
            return False
        npm_lines = [
            line for line in npm_result.stdout.strip().splitlines()
            if "passed" in line or "Tests" in line
        ]
        for line in npm_lines:
            logger.log(f"Node: {line.strip()}", level="INFO")

    return True


def run_markdown_lint(logger: TeeLogger) -> bool:
    """Runs markdown linter across core documentation."""
    candidates = [
        REPO_ROOT.parent / "dev-guidelines" / "scripts" / "lint-markdown.py",
        REPO_ROOT.parent.parent.parent.parent / "dev-guidelines" / "scripts" / "lint-markdown.py",
    ]
    linter_path = next((p for p in candidates if p.exists()), None)
    if linter_path is None:
        logger.log("dev-guidelines linter not found; skipping markdown lint.", level="WARN")
        return True

    docs_to_lint = [doc for doc in CORE_DOCS if (REPO_ROOT / doc).exists()]
    logger.log("\n[*] Linting documentation and changelog\n" + "=" * 60, level="INFO")
    cmd = [
        sys.executable,
        str(linter_path),
        "check",
        "--offline",
        *docs_to_lint,
    ]
    result = subprocess.run(
        cmd,
        cwd=str(REPO_ROOT),
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        err = (result.stderr.strip() + "\n" + result.stdout.strip()).strip()
        logger.log(f"Markdown linting failed:\n{err}", level="ERROR")
        return False
    logger.log("All documentation passed markdown linting.", level="INFO")
    return True


def run_check(logger: TeeLogger) -> bool:
    """Runs tests and markdown linting."""
    tests_ok = run_unit_tests(logger)
    lint_ok = run_markdown_lint(logger)
    return tests_ok and lint_ok


def run_serve(host: str, port: int, logger: TeeLogger) -> bool:
    """Runs the local review web server."""
    logger.log(f"Starting review server on {host}:{port}...", level="INFO")
    return serve(host, port, logger) == 0


def run_sw(logger: TeeLogger) -> bool:
    """Regenerates service worker precache assets and version hash."""
    if not SW_SCRIPT_PATH.exists():
        logger.log("generate-sw.py not found.", level="ERROR")
        return False
    cmd = [sys.executable, str(SW_SCRIPT_PATH), "generate"]
    result = subprocess.run(cmd, cwd=str(REPO_ROOT), check=False, capture_output=True, text=True)
    if result.returncode != 0:
        err = (result.stderr.strip() + "\n" + result.stdout.strip()).strip()
        logger.log(f"sw.js generation failed:\n{err}", level="ERROR")
        return False
    logger.log("sw.js regenerated successfully.", level="INFO")
    return True


def run_versions(check_drift: bool, logger: TeeLogger) -> bool:
    """Inspects project version and checks for drift."""
    version = get_project_version()
    sw_path = REPO_ROOT / "sw.js"

    logger.log(f"Project version: v{version}", level="INFO")
    if not check_drift:
        return True

    drift = False
    if CHANGELOG_PATH.exists():
        text = CHANGELOG_PATH.read_text(encoding="utf-8")
        m = re.search(r"^##\s+v?([0-9]+(?:\.[0-9]+)+(?:-[^\s\[]+)?|[^\s\[]+)", text, re.MULTILINE)
        if m and m.group(1).strip() != version:
            logger.log(f"Version drift detected: CHANGELOG has v{m.group(1).strip()}, project has v{version}", level="ERROR")
            drift = True
        else:
            logger.log("CHANGELOG.md version matches active project version.", level="INFO")

    if CHANGELOG_NL_PATH.exists():
        text_nl = CHANGELOG_NL_PATH.read_text(encoding="utf-8")
        m_nl = re.search(r"^##\s+v?([0-9]+(?:\.[0-9]+)+(?:-[^\s\[]+)?|[^\s\[]+)", text_nl, re.MULTILINE)
        if m_nl and m_nl.group(1).strip() != version:
            logger.log(f"Version drift detected: CHANGELOG.nl.md has v{m_nl.group(1).strip()}, project has v{version}", level="ERROR")
            drift = True
        else:
            logger.log("CHANGELOG.nl.md version matches active project version.", level="INFO")

    if PACKAGE_JSON_PATH.exists():
        try:
            pkg_data = json.loads(PACKAGE_JSON_PATH.read_text(encoding="utf-8"))
            clean_v = version[:-4] if version.endswith("-pre") else version
            if pkg_data.get("version") != clean_v:
                logger.log(f"Version drift note: package.json has {pkg_data.get('version')}, clean version is {clean_v}", level="WARN")
            else:
                logger.log("package.json version matches active project version.", level="INFO")
        except Exception as exc:
            logger.log(f"Could not parse package.json: {exc}", level="WARN")

    if sw_path.exists():
        sw_text = sw_path.read_text(encoding="utf-8")
        clean_v = version[:-4] if version.endswith("-pre") else version
        if clean_v not in sw_text:
            logger.log(f"Version note: sw.js cache key may not match release v{clean_v}; run 'devops sw' before release.", level="WARN")

    return not drift


def has_plan_branch() -> bool:
    """Returns whether a local plan branch exists in the repository."""
    result = subprocess.run(
        ["git", "show-ref", "--verify", "--quiet", "refs/heads/plan"],
        cwd=str(REPO_ROOT),
        check=False,
    )
    return result.returncode == 0


def check_clean_git_tree(logger: TeeLogger) -> bool:
    """Returns whether the git working tree has no uncommitted changes."""
    logger.log("\n[*] Checking git working tree status\n" + "=" * 60, level="INFO")
    result = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=str(REPO_ROOT),
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        logger.log("Failed to query git status", level="ERROR")
        return False
    if result.stdout.strip():
        logger.log(
            "Working tree has uncommitted changes - commit or stash before deploying.\n"
            + result.stdout.strip(),
            level="ERROR",
        )
        return False

    plan_dir = REPO_ROOT / ".plan"
    if plan_dir.is_dir() and (plan_dir / ".git").exists():
        plan_result = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=str(plan_dir),
            check=False,
            capture_output=True,
            text=True,
        )
        if plan_result.returncode == 0 and plan_result.stdout.strip():
            logger.log(
                ".plan working tree has uncommitted changes - commit or stash before deploying.\n"
                + plan_result.stdout.strip(),
                level="ERROR",
            )
            return False

    logger.log("Working tree is clean.", level="INFO")
    return True


def read_active_pre_release_version(logger: TeeLogger) -> str | None:
    """Returns the active '-pre' version number from CHANGELOG.md's top heading, or None."""
    logger.log("\n[*] Checking active CHANGELOG.md version\n" + "=" * 60, level="INFO")
    if not CHANGELOG_PATH.exists():
        logger.log("CHANGELOG.md not found.", level="ERROR")
        return None
    text = CHANGELOG_PATH.read_text(encoding="utf-8")
    m = re.search(r"^## v([0-9]+(?:\.[0-9]+)+)-pre\s*$", text, re.MULTILINE)
    if not m:
        logger.log(
            "No active '-pre' version heading found at the top of CHANGELOG.md - nothing to release.",
            level="ERROR",
        )
        return None
    version = m.group(1)
    logger.log(f"Active in-development version: v{version}-pre", level="INFO")
    return version


def finalize_changelog(version: str, logger: TeeLogger) -> bool:
    """Replaces the active '-pre' heading with a '[released: date]' status tag."""
    logger.log("\n[*] Finalizing CHANGELOG.md heading\n" + "=" * 60, level="INFO")
    text = CHANGELOG_PATH.read_text(encoding="utf-8")
    today = date.today().isoformat()
    new_text, count = re.subn(
        rf"^## v{re.escape(version)}-pre\s*$",
        f"## v{version} [released: {today}]",
        text,
        count=1,
        flags=re.MULTILINE,
    )
    if count != 1:
        logger.log("Failed to locate the '-pre' heading to finalize.", level="ERROR")
        return False
    CHANGELOG_PATH.write_text(new_text, encoding="utf-8")
    logger.log(f"Finalized heading in CHANGELOG.md: v{version} [released: {today}]", level="INFO")

    if CHANGELOG_NL_PATH.exists():
        text_nl = CHANGELOG_NL_PATH.read_text(encoding="utf-8")
        new_text_nl, count_nl = re.subn(
            rf"^## v{re.escape(version)}-pre\s*$",
            f"## v{version} [released: {today}]",
            text_nl,
            count=1,
            flags=re.MULTILINE,
        )
        if count_nl == 1:
            CHANGELOG_NL_PATH.write_text(new_text_nl, encoding="utf-8")
            logger.log(f"Finalized heading in CHANGELOG.nl.md: v{version} [released: {today}]", level="INFO")

    return True


def regenerate_service_worker(logger: TeeLogger) -> bool:
    """Regenerates sw.js so precached assets and the cache-key version stay current."""
    logger.log("\n[*] Regenerating service worker precache\n" + "=" * 60, level="INFO")
    result = subprocess.run(
        [sys.executable, str(SW_SCRIPT_PATH), "generate"],
        cwd=str(REPO_ROOT),
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        logger.log(f"sw.js regeneration failed:\n{result.stderr}\n{result.stdout}", level="ERROR")
        return False
    logger.log("sw.js regenerated successfully.", level="INFO")
    return True


def create_release_commit(version: str, logger: TeeLogger) -> bool:
    """Commits the finalized changelogs and regenerated sw.js."""
    logger.log("\n[*] Committing release\n" + "=" * 60, level="INFO")
    changelog_files = ["CHANGELOG.md"]
    if CHANGELOG_NL_PATH.exists():
        changelog_files.append("CHANGELOG.nl.md")
    result = subprocess.run(
        ["git", "add", *changelog_files, "sw.js"],
        cwd=str(REPO_ROOT),
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        logger.log(f"git add failed:\n{result.stderr}", level="ERROR")
        return False
    result = subprocess.run(
        ["git", "commit", "-m", f"Released v{version}."],
        cwd=str(REPO_ROOT),
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        logger.log(f"git commit failed:\n{result.stderr}\n{result.stdout}", level="ERROR")
        return False
    logger.log(f"Committed release v{version}.", level="INFO")
    return True


def create_git_tag(version: str, logger: TeeLogger) -> bool:
    """Creates the local git tag for the release."""
    logger.log("\n[*] Creating git tag\n" + "=" * 60, level="INFO")
    result = subprocess.run(
        ["git", "tag", f"v{version}"],
        cwd=str(REPO_ROOT),
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        logger.log(f"git tag failed (it may already exist):\n{result.stderr}", level="ERROR")
        return False
    logger.log(f"Created tag v{version}.", level="INFO")
    return True


def push_release(branch: str, version: str, logger: TeeLogger) -> bool:
    """Pushes the release branch, tag, and plan branch to origin when --push was passed."""
    logger.log("\n[*] Pushing release to origin\n" + "=" * 60, level="INFO")
    targets = [branch, f"v{version}"]
    if has_plan_branch():
        targets.append("plan")
    result = subprocess.run(
        ["git", "push", "origin", *targets],
        cwd=str(REPO_ROOT),
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        logger.log(f"git push failed:\n{result.stderr}", level="ERROR")
        return False
    targets_str = " ".join(targets)
    logger.log(f"Pushed {targets_str} to origin.", level="INFO")
    return True


def check_current_branch(logger: TeeLogger) -> str:
    """Returns the current git branch name."""
    logger.log("\n[*] Checking git branch\n" + "=" * 60, level="INFO")
    result = subprocess.run(
        ["git", "rev-parse", "--abbrev-ref", "HEAD"],
        cwd=str(REPO_ROOT),
        check=False,
        capture_output=True,
        text=True,
    )
    branch = result.stdout.strip() if result.returncode == 0 else "unknown"
    logger.log(f"Current branch: {branch}", level="INFO")
    return branch


def deploy(dry_run: bool, push: bool, logger: TeeLogger) -> int:
    """Validates pre-flight checks, then finalizes, commits, tags, and optionally pushes the release."""
    if dry_run and push:
        logger.log("--dry-run and --push cannot be combined.", level="ERROR")
        return 1

    all_ok = True
    all_ok &= check_clean_git_tree(logger)
    version = read_active_pre_release_version(logger)
    all_ok &= version is not None
    branch = check_current_branch(logger)
    all_ok &= run_unit_tests(logger)
    all_ok &= run_markdown_lint(logger)

    if not all_ok or version is None:
        logger.log(
            "\n[!] Pre-flight deployment checks failed. Resolve issues before deploying.",
            level="ERROR",
        )
        return 1

    summary_lines = [
        f"\n[*] Deployment Pre-flight Summary for v{version}",
        "=" * 60,
        f"Target Version: v{version}",
        f"Current Branch: {branch}",
        "Pre-flight Checks: ALL PASSED",
    ]
    logger.log("\n".join(summary_lines), level="INFO")

    if dry_run:
        logger.log(
            f"\n[dry-run] Preconditions validated successfully. Would finalize, commit, and "
            f"tag v{version}. No files were changed.",
            level="INFO",
        )
        return 0

    if not finalize_changelog(version, logger):
        return 1
    if not regenerate_service_worker(logger):
        logger.log(
            "CHANGELOG.md was finalized but sw.js regeneration failed.\n"
            "Fix the issue and rerun, or 'git checkout -- CHANGELOG.md' to revert.",
            level="ERROR",
        )
        return 1
    if not create_release_commit(version, logger):
        logger.log(
            "Changelog and sw.js were updated but not committed.\n"
            "Inspect with 'git diff', then commit manually or resolve and rerun.",
            level="ERROR",
        )
        return 1
    if not create_git_tag(version, logger):
        return 1

    if not push:
        plan_str = " plan" if has_plan_branch() else ""
        guidance = (
            f"\n[+] Release v{version} committed and tagged locally on '{branch}'.\n"
            "    With explicit confirmation, push to publish to GitHub Pages:\n"
            f"      git push origin {branch} v{version}{plan_str}\n"
            "    GitHub Pages will build and publish automatically within 2 minutes.\n"
        )
        logger.log(guidance, level="INFO")
        return 0

    if not push_release(branch, version, logger):
        return 1

    logger.log(
        f"\n[+] Release v{version} pushed to origin ('--push' was given). "
        "GitHub Pages will build and publish automatically within 2 minutes.",
        level="INFO",
    )
    return 0


def print_detailed_help(prog: str, version: str, parser: argparse.ArgumentParser) -> None:
    """Prints help including detailed descriptions for each action."""
    print_help(prog, version, DESCRIPTION, parser, EXIT_CODES)
    print("\nDetailed Action Descriptions:")
    details = [
        ("test", "Run automated unit and integration tests across the test suite."),
        ("lint", "Validate documentation and changelog formatting using lint-markdown."),
        ("check", "Execute full quality suite (automated unit tests and markdown linting)."),
        ("serve", "Launch threaded local HTTP review server for browser inspection."),
        ("sw", "Regenerate service worker cache key and asset precache list."),
        ("versions", "Inspect active project version and verify synchronization across files."),
        ("production", "Execute production deployment checks or release workflow (deploy, check)."),
        ("deploy", "Shortcut for 'production deploy' to validate, finalize, tag, and publish."),
    ]
    for name, desc in details:
        print(f"  {name:<12} {desc}")


def main(argv: list[str] | None = None) -> int:
    if argv is None:
        argv = sys.argv[1:]

    version = get_project_version()
    parser = build_action_parser(PROG, DESCRIPTION, ACTIONS, DEFAULT_ACTION)
    parser.add_argument("subaction", nargs="?", default=None, help="Subaction for production (deploy, check)")
    parser.add_argument("--dry-run", action="store_true", help="Validate preconditions without deploying")
    parser.add_argument(
        "--push",
        action="store_true",
        help="Push the release branch and tag to origin after tagging (confirmation to publish).",
    )
    parser.add_argument("--check", action="store_true", help="Check version drift without modifying files")
    parser.add_argument("--host", default=DEFAULT_HOST, help=f"Interface to bind for serve (default: {DEFAULT_HOST})")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help=f"HTTP port for serve (default: {DEFAULT_PORT})")

    # Intercept --help and version early to support help --verbose
    is_help = any(arg in argv for arg in ("-h", "--help", "help"))
    is_verbose = "--verbose" in argv or "-v" in argv
    is_version = any(arg in argv for arg in ("--version", "version"))

    if is_help:
        if is_verbose:
            print_detailed_help(PROG, version, parser)
        else:
            print_help(PROG, version, DESCRIPTION, parser, EXIT_CODES)
        return 0

    if is_version and not is_help:
        print_version(PROG, version)
        return 0

    try:
        args = parser.parse_args(argv)
    except SystemExit as exc:
        return exc.code

    start_time = time.time()
    logger = TeeLogger(
        verbose=args.verbose,
        debug=args.debug,
        log_path=args.log_file,
    )
    logger.log_startup(PROG, version, args.action)

    exit_code = 0
    try:
        if args.action == "test":
            exit_code = 0 if run_unit_tests(logger) else 1
        elif args.action == "lint":
            exit_code = 0 if run_markdown_lint(logger) else 1
        elif args.action == "check":
            exit_code = 0 if run_check(logger) else 1
        elif args.action == "serve":
            exit_code = 0 if run_serve(args.host, args.port, logger) else 1
        elif args.action == "sw":
            exit_code = 0 if run_sw(logger) else 1
        elif args.action == "versions":
            exit_code = 0 if run_versions(args.check, logger) else 1
        elif args.action == "production":
            sub = args.subaction or "deploy"
            if sub == "check":
                exit_code = deploy(dry_run=True, push=False, logger=logger)
            elif sub == "deploy":
                exit_code = deploy(dry_run=args.dry_run, push=args.push, logger=logger)
            else:
                logger.log(f"Unknown production subaction: '{sub}'. Choose 'deploy' or 'check'.", level="ERROR")
                exit_code = 2
        elif args.action == "deploy":
            exit_code = deploy(dry_run=args.dry_run, push=args.push, logger=logger)
        else:
            logger.log(f"Unknown action: '{args.action}'", level="ERROR")
            exit_code = 2
    except Exception as exc:
        logger.log(f"Unhandled operational failure: {exc}", level="ERROR")
        exit_code = 1
    finally:
        logger.log_completion(PROG, args.action, exit_code, start_time)
        logger.close()

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
