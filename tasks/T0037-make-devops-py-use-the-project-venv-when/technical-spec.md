## Technical Specifications

### Behavior
- `pinned_support_python_version(path)` reads the pin from `support-python @ ...@vX.Y.Z` or `support-python==X.Y.Z`; no pin returns None.
- `installed_support_python_version()` reads `importlib.metadata.version("support-python")` without importing the package.
- `venv_python_candidates(root)` returns `root/.venv`, then the primary checkout's `.venv` when `root` is a linked worktree.
- `_reexec_in_venv()` returns when the installed version equals the pin, or when no pin exists and a copy is installed.
- Otherwise it re-runs under the first existing candidate venv that is not the running interpreter's prefix.
- With no such venv, it prints the found and pinned versions plus the setup commands to stderr and exits 1.
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

Size estimate: 4 files, 220 lines
