"""Probe DevopsCli over NodeProject. Usage: python -I probe-devopscli.py {{support-python-src}} {{project-root}} ACTION..."""
import sys
from pathlib import Path

sys.path.insert(0, sys.argv[1])
from support_python.devops import DevopsCli, NodeProject  # noqa: E402

raise SystemExit(DevopsCli(NodeProject(Path(sys.argv[2]).resolve())).run(sys.argv[3:]))
