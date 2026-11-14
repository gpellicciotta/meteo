## Technical Specifications

### Behavior
- `pinned_support_python_version(path)` reads the pin from `support-python @ ...@vX.Y.Z` or `support-python==X.Y.Z`; no pin returns None.
- `installed_support_python_version()` reads `importlib.metadata.version("support-python")` without importing the package.
- `venv_python_candidates(root)` returns `root/.venv`, then the primary checkout's `.venv` when `root` is a linked worktree.
- `_reexec_in_venv()` returns when the installed version equals the pin, or when no pin exists and a copy is installed.
- Otherwise it re-runs under the first candidate venv that exists, is not the running prefix, and holds the pin.
- `venv_support_python_version(python)` probes a candidate's version in a subprocess before selecting it.
- The re-run sets `METEO_DEVOPS_VENV_REEXEC=1`; a run with that marker never re-executes again.
- A run on the pinned version clears the marker, so nested devops runs still re-execute normally.
- With no such venv, it prints the found and pinned versions plus the setup commands to stderr and exits 1.
- **[Decided]** Round 1 rework: probing plus the one-hop marker replaces prefix-only exclusion, which looped between two venvs.
- **[Decided]** A mismatch is an error, not a warning, since a wrong version silently changes release behavior.

### Declared Files
- scripts/devops.py
- tests/test_devops.py
- README.md
- CHANGELOG.nl.md

### Tests
- Unit: the pin parser reads `@v3.2.0`, `==3.4.1`, and returns None without a support-python line.
- Unit: venv candidates from a linked worktree list the worktree venv, then the primary checkout venv.
- Unit: venv candidates from a primary checkout list only its own venv.
- Integration: a copied devops.py seeing support-python 0.0.1 and no venv exits 1, naming 0.0.1, 3.2.0, and the pip command.
- Integration: the same copy with a project venv holding the pinned version re-runs under that venv.
- Integration: a copy seeing the pinned version runs without re-executing.
- Unit: mocked worktree and primary venvs with wrong versions, or without support-python, exit 1 without re-executing.
- Unit: a wrong worktree venv falls back to a pinned primary venv, passing the re-exec marker.
- Unit: a marked run never re-executes; a run on the pinned version clears the marker.
- Integration: a linked worktree with two wrong venvs, or two venvs without support-python, exits 1 with setup commands.
- Integration: a linked worktree with a wrong own venv hands over to the pinned primary venv.

Size estimate: 4 files, 220 lines
Size note: round 1 rework adds regression coverage, crossing 400 lines; the fix and its tests cannot merge apart.
