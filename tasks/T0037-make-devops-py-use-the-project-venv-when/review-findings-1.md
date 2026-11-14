---
task: T0037
round: 1
verdict: rejected
reviewer: "@codex"
reviewed_at: 2026-11-14T21:19:31Z
reviewed_commit: "e3afe76"
base_commit: "c40e7e8"
branch: main
---
# Review Findings: Task T0037 (Round 1)

## Summary

**[Decided]** Rejected for one blocking fallback defect. The normal version check and single-venv re-execution behave as intended.

Reviewed commit `e3afe76` and the specified combined diff. Git status showed unrelated JavaScript changes; task deliverables had no uncommitted changes.

Verification:

- `python -m unittest tests.test_devops.TestSupportPythonPin tests.test_devops.TestSupportPythonVenvSelection tests.test_devops.TestIntegrationCloneIsolation` exited 0.

```text
Ran 9 tests in 8.729s

OK
```

- `git diff --check c40e7e8 e3afe76 -- CHANGELOG.md CHANGELOG.nl.md README.md scripts/devops.py tests/test_devops.py` exited 0 without output.
- `python -m unittest tests.test_devops` exited 1: 37 tests ran, with eight failures.
- Those failures encountered global support-python 3.1.0 and no project venv; they do not independently establish implementation defects.
- `.venv/Scripts/python.exe -m unittest tests.test_devops` could not start because that interpreter is absent.
- Inspected recorded red-phase, green-phase, CLI, and lint evidence in `validation-proof.md`.

## Defects

### Blocking: incompatible worktree and primary venvs cause unbounded re-execution

Location: `scripts/devops.py:87-90`, `_reexec_in_venv()`.

The loop excludes only the current prefix. It forgets previously attempted interpreters across child invocations.
With incompatible versions in both venvs, the worktree launches the primary, which launches the worktree again indefinitely.
This also occurs when neither venv has support-python. The required setup error and exit 1 are never reached normally.

A controlled check exercised the actual selector with two existing candidate paths and installed version 3.1.0 against pin 3.2.0.
It mocked subprocess execution and prefix changes, avoiding uncontrolled process creation. The command exited 0 and printed:

```text
C:\review\worktree\.venv -> C:\review\main\.venv\Scripts\python.exe
C:\review\main\.venv -> C:\review\worktree\.venv\Scripts\python.exe
C:\review\worktree\.venv -> C:\review\main\.venv\Scripts\python.exe
```

## Process Gaps

- Non-blocking: recorded completion command exited 1 from four Node failures attributed to pre-existing CRLF parsing.
  Successful end-to-end completion remains unverified here because the project venv is absent and unrelated work is active.
- Non-blocking: added coverage checks candidate discovery, but omits exhausted multi-venv fallback behavior.

## Required Rework

1. Bound candidate traversal across re-executions, or verify candidate compatibility before selecting an interpreter.
2. Preserve primary-checkout fallback when the worktree venv is incompatible and the primary venv matches the pin.
3. Add regression coverage for two incompatible venvs and two venvs without support-python.
4. Verify exhausted candidates exit 1 with setup commands, without revisiting an interpreter.
5. Run affected tests with pinned support-python and record the results.
