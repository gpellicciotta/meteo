## Technical Specifications

### Findings (2026-11-14, during T0038)
- `.venv` was created with `python -m venv .venv` and `.venv/Scripts/python -m pip install -r scripts/requirements.txt`.
- The venv's support-python 3.2.0 declares the `lint-markdown` console script in `entry_points.txt`.
- Yet `.venv/Scripts` holds no `lint-markdown.exe`, and the distribution's `RECORD` lists no scripts.
- The cause is unknown; the install may have run inside a sandbox that blocked writing launchers.
- `resolve_executable("lint-markdown")` from the venv returns the global `Python315/Scripts/lint-markdown.EXE`.
- That launcher belongs to the global support-python 3.1.0.
- `.venv/Scripts/python -m support_python.tools.lint_markdown check --offline README.md` works and exits 0.

### Behavior
- `_lint_markdown(action)` runs `[sys.executable, "-m", "support_python.tools.lint_markdown", action, "--offline", *docs]`.
- It no longer calls `resolve_executable`, so no PATH copy can run.
- The "lint-markdown not found" error goes away; a missing module fails like any other import error.
- **[Decided]** Run the module rather than locate the launcher, since launchers may be missing even in a correct venv.

### Declared Files
- scripts/devops.py
- tests/test_devops.py
- CHANGELOG.nl.md

### Tests
- Unit: `lint` runs `sys.executable -m support_python.tools.lint_markdown check --offline` followed by `CORE_DOCS`.
- Unit: `format` runs the same module with `fix`.
- Unit: `lint` succeeds when PATH holds no `lint-markdown`, patching `resolve_executable` to return None.
- Integration: `python scripts/devops.py lint` from the global interpreter re-runs under `.venv` and lints 6 files.

Completion check: `python scripts/devops.py lint` reports 6 files passing, and `python scripts/devops.py test` passes.

Size estimate: 3 files, 40 lines
