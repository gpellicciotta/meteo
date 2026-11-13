# T0028: Technical Specifications

- **[Decided]** Create `scripts/devops.py` providing unified actions: `test`, `lint`, `check`, `serve`, `sw`, `versions`, `production`, and `deploy`.
- **[Decided]** Inline `ReviewServer` and `QuietHandler` into `scripts/devops.py`, serving `DEFAULT_PORT = 8062`.
- **[Decided]** In `run_unit_tests`, execute Python unittests (`python -m unittest discover -s tests`) and JS tests (`npm test` via vitest).
- **[Decided]** In `run_markdown_lint`, run dev-guidelines linter over `LICENSE.md`, `README.md`, `CHANGELOG.md`, and `CHANGELOG.nl.md`.
- **[Decided]** Support deployment pre-flight checks, changelog finalization (both `CHANGELOG.md` and `CHANGELOG.nl.md`), SW regeneration, tagging, and push.
- **[Decided]** Detect and include local `plan` worktree branch during release pushes.
- **[Decided]** Remove obsolete `scripts/run-review-server.py` and update `README.md` to reference `devops.py`.
- **[Decided]** Author comprehensive unit and operational tests in `tests/test_devops.py`.
- Size estimate: 6 files, 350 lines.
- Completion check: `python scripts/devops.py check` passes and `python -m unittest discover -s tests` passes.

### Declared Files
- `scripts/devops.py`
- `tests/test_devops.py`
- `scripts/run-review-server.py`
- `README.md`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`

### Tests
- Unit: `tests/test_devops.py` tests CLI entry point, exit codes, version banner, help screens, drift checks, inlined symbols, and plan branch push target.
- Integration: `python scripts/devops.py deploy --dry-run` validates working tree, changelog heading, test execution, and pre-flight reporting.
