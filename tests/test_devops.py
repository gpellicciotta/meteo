"""Automated unit tests for scripts/devops.py CLI entry point."""

from __future__ import annotations

import importlib.util
from pathlib import Path
import subprocess
import sys
import unittest
from unittest.mock import MagicMock, patch

REPO_ROOT = Path(__file__).resolve().parent.parent
DEVOPS_SCRIPT = REPO_ROOT / "scripts" / "devops.py"
REVIEW_SERVER_SCRIPT = REPO_ROOT / "scripts" / "run-review-server.py"


def _load_devops_module():
    spec = importlib.util.spec_from_file_location("devops_mod", DEVOPS_SCRIPT)
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


class TestDevopsCli(unittest.TestCase):
    """Test suite validating scripts/devops.py subcommands, flags, and exit codes."""

    def test_devops_script_exists(self) -> None:
        """Validates that scripts/devops.py exists on disk."""
        self.assertTrue(DEVOPS_SCRIPT.exists(), f"Missing script: {DEVOPS_SCRIPT}")

    def test_obsolete_scripts_removed(self) -> None:
        """Validates that standalone review server script has been removed."""
        self.assertFalse(
            REVIEW_SERVER_SCRIPT.exists(),
            f"Obsolete standalone script should be deleted: {REVIEW_SERVER_SCRIPT}",
        )

    def test_inlined_server_and_deploy_symbols(self) -> None:
        """Validates that review server and deployment symbols are inlined into devops."""
        mod = _load_devops_module()

        # Inlined server classes and functions
        self.assertTrue(hasattr(mod, "ReviewServer"), "Missing ReviewServer class in devops")
        self.assertTrue(hasattr(mod, "QuietHandler"), "Missing QuietHandler class in devops")
        self.assertTrue(hasattr(mod, "serve"), "Missing serve function in devops")

        # Inlined deployment functions
        for func_name in [
            "has_plan_branch",
            "check_clean_git_tree",
            "read_active_pre_release_version",
            "finalize_changelog",
            "regenerate_service_worker",
            "create_release_commit",
            "create_git_tag",
            "push_release",
            "check_current_branch",
            "deploy",
        ]:
            self.assertTrue(
                hasattr(mod, func_name),
                f"Missing inlined deployment function in devops: {func_name}",
            )

    def test_has_plan_branch_detects_plan(self) -> None:
        """Validates that has_plan_branch detects local plan branch."""
        mod = _load_devops_module()
        self.assertTrue(hasattr(mod, "has_plan_branch"))
        self.assertTrue(mod.has_plan_branch(), "Repository should report local plan branch present")

    def test_push_release_includes_plan_branch(self) -> None:
        """Validates that push_release includes plan branch when local plan branch exists."""
        mod = _load_devops_module()
        logger = MagicMock()
        with patch.object(mod.subprocess, "run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0, stdout="", stderr="")
            success = mod.push_release("main", "1.1.0", logger)
            self.assertTrue(success)
            push_calls = [c for c in mock_run.call_args_list if c[0][0][:2] == ["git", "push"]]
            self.assertEqual(len(push_calls), 1)
            called_cmd = push_calls[0][0][0]
            self.assertEqual(
                called_cmd,
                ["git", "push", "origin", "main", "v1.1.0", "plan"],
                f"Expected push command to include plan branch, got: {called_cmd}",
            )

    def test_version_flag_and_action(self) -> None:
        """Validates that --version and version action exit 0 with proper banner."""
        for flag in ["--version", "version"]:
            result = subprocess.run(
                [sys.executable, str(DEVOPS_SCRIPT), flag],
                cwd=str(REPO_ROOT),
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode, 0, f"Expected 0 for {flag}, got {result.returncode}")
            output = result.stdout.strip()
            self.assertTrue(
                output.startswith("devops v"),
                f"Banner must start with 'devops v', got: {output}",
            )
            self.assertIn("Giovanni Pellicciotta", output)

    def test_help_flag_and_action(self) -> None:
        """Validates that --help and help action exit 0 and document all actions."""
        for flag in ["--help", "-h", "help"]:
            result = subprocess.run(
                [sys.executable, str(DEVOPS_SCRIPT), flag],
                cwd=str(REPO_ROOT),
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode, 0, f"Expected 0 for {flag}, got {result.returncode}")
            output = result.stdout
            for action in ["test", "lint", "check", "serve", "sw", "versions", "production", "deploy"]:
                self.assertIn(action, output, f"Help screen missing action: {action}")
            self.assertIn("Exit codes:", output)

    def test_help_verbose(self) -> None:
        """Validates that help --verbose prints detailed documentation across actions."""
        result = subprocess.run(
            [sys.executable, str(DEVOPS_SCRIPT), "help", "--verbose"],
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("Detailed Action Descriptions:", result.stdout)

    def test_invalid_action_exits_2(self) -> None:
        """Validates that invalid action names exit with code 2."""
        result = subprocess.run(
            [sys.executable, str(DEVOPS_SCRIPT), "nonexistent-action"],
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 2, f"Expected 2 for invalid action, got {result.returncode}")

    def test_versions_subcommand(self) -> None:
        """Validates that the versions subcommand reports project version and checks drift."""
        result = subprocess.run(
            [sys.executable, str(DEVOPS_SCRIPT), "versions", "--check"],
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, f"Expected 0 for versions --check, got {result.returncode}: {result.stderr}")
        self.assertIn("v1.", result.stdout)


if __name__ == "__main__":
    unittest.main()
