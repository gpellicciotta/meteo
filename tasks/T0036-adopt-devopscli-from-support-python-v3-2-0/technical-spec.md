### Declared Files
- `scripts/devops.py`
- `scripts/requirements.txt`
- `tests/test_devops.py`
- `README.md`
- `.gitignore`

Completion check: `.venv/Scripts/python.exe scripts/devops.py check` and `.venv/Scripts/python.exe scripts/devops.py test --slow`.

### Context
- support-python v3.2.0 provides `DevopsCli` and `NodeProject`.
- `MeteoProject(NodeProject)` overrides test, test_slow, lint, format, build, check, and release.
- `serve`, `sw`, and `deploy` stay project actions through `add_action`.
- Release and deploy share one flow that needs an active `-pre` changelog heading.
- Released `main` has no `-pre` heading, so both dry runs fail there by design of that flow.

### Tests
- Unit: `MeteoProject` overrides, mocked, in `tests/test_devops.py`: test order and failure propagation, test_slow, build no-op, lint arguments, check short-circuit, release delegation, deploy flag conflicts, dry run without file changes, plan branch push, action registration.
- Unit: the requirements pin, removed legacy script, banner, help, unknown action exit 2, and `versions` agreement, run as subprocesses.
- Integration: `TestDevopsDryRunIntegration` runs the real `release --dry-run --skip-checks` in a throwaway git clone, with an active `-pre` heading (exit 0, no changes).
- Integration: the same command fails with exit 1 without a `-pre` heading and on a dirty tree, and a failing quality check fails the deploy flow with exit 1.
- Integration: a real `release --skip-checks` in a clone tags the frozen version, then opens the next patch `-pre` heading and `package.json` version, leaving a clean tree and agreeing versions.`n- Integration: the full `deploy --dry-run` and `release --dry-run`, with real checks, run on the branch rebased onto main; the output is in `validation-proof.md`.
