"""Shared CLI boilerplate and logging infrastructure for standalone scripts under scripts/.

Conforms strictly to AI Agent Guidelines for CLI tools and Logging:
- Action-oriented subcommand parsing with --help, --version, --verbose, --debug, --log-file.
- Single-line version output: {prog} v{version} - {copyright}
- Dual-target logging (stdout/stderr and optional append log file)
- Startup details and completion summary with elapsed duration
- Padded severity indicators: **[ERROR]**, **[WARN]** , **[INFO]** , **[DEBUG]**
- Vertical indentation for multi-line log messages matching the prefix column
- Timestamps and INFO indicators omitted on stdout/stderr
"""

from __future__ import annotations

import argparse
from datetime import datetime
from pathlib import Path
import re
import sys
import time
from typing import Any, TextIO

APP_AUTHOR = "Giovanni Pellicciotta"
COPYRIGHT = f"Copyright (c) 2026 {APP_AUTHOR}"

REPO_ROOT = Path(__file__).resolve().parent.parent


def get_project_version() -> str:
    """Read the active version from CHANGELOG.md so all scripts self-report consistently."""
    try:
        changelog = REPO_ROOT / "CHANGELOG.md"
        if changelog.exists():
            text = changelog.read_text(encoding="utf-8")
            m = re.search(r"^##\s+v?([0-9]+(?:\.[0-9]+)+(?:-[^\s\[]+)?|[^\s\[]+)", text, re.MULTILINE)
            if m:
                v = m.group(1).strip()
                return v[1:] if v.startswith("v") else v
    except OSError:
        pass
    return "0.0.0+unknown"


def format_duration(seconds: float) -> str:
    """Format duration in seconds to a concise human-readable string."""
    if seconds < 0:
        return "0.0s"
    if seconds < 60:
        return f"{seconds:.1f}s"
    mins, secs = divmod(int(seconds), 60)
    hours, mins = divmod(mins, 60)
    if hours > 0:
        return f"{hours}h {mins:02d}m {secs:02d}s"
    return f"{mins}m {secs:02d}s"


def format_severity_indicator(level: str | None) -> str:
    """Format severity tag with 5-character uppercase padding per guidelines."""
    if not level:
        return ""
    clean = level.strip().upper()
    if clean in ("WARN", "WARNING"):
        return "**[WARN]** "
    if clean == "INFO":
        return "**[INFO]** "
    if clean == "ERROR":
        return "**[ERROR]**"
    if clean == "DEBUG":
        return "**[DEBUG]**"
    return f"**[{clean:<5}]**"


def format_log_message(
    message: str,
    level: str | None = "INFO",
    origin: str | None = None,
    timestamp: datetime | None = None,
    for_file: bool = True,
) -> str:
    """Format a single or multi-line log message adhering to general guidelines.

    In file mode:
        [YYYY-MM-DD HH:MM:SS] **[LEVEL]** <origin> First line
                              Subsequent lines aligned vertically
    In stdout/stderr mode:
        [**[LEVEL]** ] [<origin> ] First line
        Subsequent lines aligned vertically
        (timestamps and INFO indicators omitted)
    """
    if not message and not level and not origin:
        return ""

    ts = timestamp or datetime.now()
    parts: list[str] = []

    if for_file:
        parts.append(f"[{ts.strftime('%Y-%m-%d %H:%M:%S')}]")
        if level:
            parts.append(format_severity_indicator(level))
    else:
        # On stdout/stderr, omit timestamps and omit INFO severity indicator
        lvl_clean = level.strip().upper() if level else ""
        if lvl_clean in ("WARN", "WARNING", "ERROR"):
            parts.append(format_severity_indicator(lvl_clean))

    if origin:
        orig_clean = origin.strip()
        if not (
            (orig_clean.startswith("<") and orig_clean.endswith(">"))
            or (orig_clean.startswith("[") and orig_clean.endswith("]"))
        ):
            orig_clean = f"<{orig_clean}>"
        parts.append(orig_clean)

    prefix = (" ".join(parts) + " ") if parts else ""
    prefix_len = len(prefix)

    raw_lines = message.splitlines()
    non_empty_lines = [line for line in raw_lines if line.strip() != ""]
    if not non_empty_lines:
        return ""

    formatted_lines = [prefix + non_empty_lines[0]]
    indent = " " * prefix_len
    for line in non_empty_lines[1:]:
        formatted_lines.append(indent + line)

    return "\n".join(formatted_lines) + "\n"


class TeeLogger:
    """Writes operational logs to stdout/stderr and optionally appends to a log file."""

    def __init__(self, log_path: Path | None = None, debug: bool = False, verbose: bool = False) -> None:
        self.log_path = log_path
        self.debug = debug
        self.verbose = verbose
        self._file: TextIO | None = None
        if log_path is not None:
            log_path = log_path.resolve()
            log_path.parent.mkdir(parents=True, exist_ok=True)
            self._file = log_path.open("a", encoding="utf-8", buffering=1)

    def log(
        self,
        message: str = "",
        level: str | None = "INFO",
        origin: str | None = None,
        timestamp: datetime | None = None,
        to_stdout: bool = True,
        to_file: bool = True,
    ) -> None:
        """Write a formatted message with level, origin, and timestamping."""
        if not message and not level and not origin:
            return

        lvl_clean = level.strip().upper() if level else "INFO"
        if lvl_clean == "DEBUG":
            if not self.debug:
                return
            to_stdout = False  # debug messages are never emitted to stdout

        ts = timestamp or datetime.now()

        if to_stdout:
            stream = sys.stderr if lvl_clean in ("ERROR", "WARN", "WARNING") else sys.stdout
            stdout_text = format_log_message(message, level=level, origin=origin, timestamp=ts, for_file=False)
            if stdout_text:
                stream.write(stdout_text)
                stream.flush()

        if to_file and self._file is not None:
            file_text = format_log_message(message, level=level, origin=origin, timestamp=ts, for_file=True)
            if file_text:
                self._file.write(file_text)
                self._file.flush()

    def log_startup(
        self,
        prog: str,
        version: str,
        action: str,
        config: dict[str, Any] | None = None,
    ) -> None:
        """Log software startup details in a single multi-line message."""
        display_name = prog.replace("-", " ").replace("_", " ").title()
        cfg_lines = [
            f"Starting {display_name} v{version}",
            "with following configuration:",
            f"- Full command line given: {' '.join(sys.argv)}",
            f"- Action                  : {action}",
        ]
        if self.log_path:
            cfg_lines.append(f"- Log file                : {self.log_path.resolve()}")
        if self.verbose:
            cfg_lines.append("- Verbose                 : True")
        if self.debug:
            cfg_lines.append("- Debug                   : True")
        if config:
            for k, v in config.items():
                cfg_lines.append(f"- {k:<24}: {v}")
        # When verbose or log file is active, show startup details
        msg = "\n".join(cfg_lines)
        self.log(msg, level="INFO", origin=prog, to_stdout=self.verbose, to_file=True)

    def log_completion(
        self,
        prog: str,
        action: str,
        exit_code: int,
        start_time: float,
    ) -> None:
        """Log completion summary upon exit including runtime duration."""
        display_name = prog.replace("-", " ").replace("_", " ").title()
        duration = time.time() - start_time
        summary = (
            f"{display_name} {action} run ended with exit code {exit_code}\n"
            f"It ran for {format_duration(duration)}"
        )
        level = "INFO" if exit_code == 0 else "ERROR"
        self.log(summary, level=level, origin=prog, to_stdout=self.verbose, to_file=True)

    def close(self) -> None:
        """Close log file handle."""
        if self._file is not None:
            self._file.close()
            self._file = None


def build_action_parser(
    prog: str,
    description: str,
    actions: list[str],
    default_action: str,
) -> argparse.ArgumentParser:
    """Builds an action-oriented parser with version, help, verbose, debug, and log-file options."""
    parser = argparse.ArgumentParser(prog=prog, description=description, add_help=False)
    parser.add_argument("action", nargs="?", default=default_action, choices=actions, help="Action to perform")
    parser.add_argument("-h", "--help", action="store_true", help="Show this help message and exit")
    parser.add_argument("-v", "--version", action="store_true", help="Show version information and exit")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose operational output")
    parser.add_argument("--debug", action="store_true", help="Enable debug output in logs")
    parser.add_argument("--log-file", type=Path, default=None, help="Append operational logs to specified file")
    return parser


def print_version(prog: str, version: str) -> None:
    """Prints single-line version output conforming to CLI guidelines."""
    print(f"{prog} v{version} - {COPYRIGHT}")


def print_help(
    prog: str,
    version: str,
    description: str,
    parser: argparse.ArgumentParser,
    exit_codes: list[tuple[int, str]],
) -> None:
    """Prints formatted help output including header, usage, and exit codes."""
    print_version(prog, version)
    print()
    print(description)
    print()
    parser.print_help()
    print("\nExit codes:")
    for code, meaning in exit_codes:
        print(f"  {code}  {meaning}")
