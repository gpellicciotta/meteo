#!/usr/bin/env python3
"""Serve the repository over HTTP for browser review and Playwright test runs.

Uses a threading server because the application loads a dozen ES modules in
parallel: the single-threaded http.server refuses those concurrent connections,
which surfaces as random ERR_CONNECTION_REFUSED failures in the browser tests.

Cross-platform (Windows/Linux/macOS).

Usage:
  python scripts/run-review-server.py serve
  python scripts/run-review-server.py serve --port 8063 --host 127.0.0.1
  python scripts/run-review-server.py --version
  python scripts/run-review-server.py --help
"""

from __future__ import annotations

import functools
import sys
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

# Add scripts directory to path to import _cli_common when run directly
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

PROG = "run-review-server"
DESCRIPTION = "Serves the repository root over HTTP so reviewers and browser tests can load the application."
ACTIONS = ["serve", "version", "help"]
DEFAULT_ACTION = "serve"
EXIT_CODES = [
    (0, "Server started and shut down cleanly"),
    (1, "Server could not bind the requested host and port"),
]

DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8062


class ReviewServer(ThreadingHTTPServer):
    """Threading HTTP server that survives the application's parallel module fetches."""

    daemon_threads = True
    request_queue_size = 128
    # On Windows SO_REUSEADDR lets a second server silently steal a bound port, so a
    # duplicate start must fail loudly instead. POSIX keeps it to rebind after TIME_WAIT.
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


def main(argv: list[str] | None = None) -> int:
    version = get_project_version()
    parser = build_action_parser(PROG, DESCRIPTION, ACTIONS, DEFAULT_ACTION)
    parser.add_argument("--host", default=DEFAULT_HOST, help=f"Interface to bind (default {DEFAULT_HOST})")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help=f"Port to listen on (default {DEFAULT_PORT})")
    args = parser.parse_args(argv)

    if args.version or args.action == "version":
        print_version(PROG, version)
        return 0

    if args.help or args.action == "help":
        print_help(PROG, version, DESCRIPTION, parser, EXIT_CODES)
        return 0

    logger = TeeLogger(args.log_file, debug=args.debug, verbose=args.verbose)
    start_time = time.time()
    try:
        logger.log_startup(PROG, version, args.action, {"Host": args.host, "Port": args.port})
        exit_code = serve(args.host, args.port, logger)
        logger.log_completion(PROG, args.action, exit_code, start_time)
        return exit_code
    finally:
        logger.close()


if __name__ == "__main__":
    sys.exit(main())
