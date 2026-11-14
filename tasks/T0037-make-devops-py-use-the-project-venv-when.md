---
id: T0037
owner: "@claude"
session: claude-20261114-ee1e90
needs: []
branch: —
worktree: —
status: active
started_at: "2026-11-14T09:12:02Z"
ended_at: —
review: agent
preview: none
protocol: standard
review_status: pending
review_round: 2
review_requested_at: "2026-11-14T21:32:19Z"
usage:
  worker: {turns: 8, duration_s: 0.0}
work_duration: 2180.7
review_session: codex-20261114-02098f
---
# T0037: Make devops.py use the project venv when the importable support-python differs from the pinned version

## Goals
Make `scripts/devops.py` run on the support-python version pinned in `scripts/requirements.txt`.
Today it uses any importable copy, so a user-site v3.1.0 drops `--skip-checks` and T0034's full check recursed.
Compare the installed distribution version with the pin before importing it.
On a mismatch, re-run under the project venv, falling back to the primary checkout's venv from a task worktree.
Without a usable venv, exit 1 with the setup commands instead of running on the wrong version.
Completion check: `python scripts/devops.py test` passes through the venv.

## Task Execution Steps
- [x] **[Implement]** Author failing tests for pin parsing, venv candidates, re-execution, and the mismatch error.
- [x] **[Verify]**    Run the new tests and record their failure output in validation-proof.md.
- [x] **[Implement]** Implement the version check, worktree venv fallback, and error in devops.py.
- [x] **[Verify]**    Create the venv, then run the Python suite and devops test through it.
- [x] **[Doc]**       Update README.md and both changelogs.
- [x] **[Implement]** Author failing tests for two incompatible venvs, two venvs without support-python, and the re-exec guard.
- [x] **[Verify]**    Run the new mocked tests and record their failure output in validation-proof.md.
- [x] **[Implement]** Probe each candidate venv's support-python version and bound re-execution to one hop.
- [x] **[Verify]**    Run the affected tests and devops test through the pinned venv.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-11-13] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-11-14] **[Decide]**
  Folded the integration clone fix into this task: leaked hard-linked clones blocked verification. Clones now use --no-hardlinks and clean up without ignoring errors.
  - Same declared file: tests/test_devops.py.

- [2026-11-14] **[Verify]**
  Python suite passes through the venv, including the release clones that recursed. Four Node accent tests fail on main from CRLF parsing, fixed on the T0034 branch.
  - Files touched: 4.
  - Lines touched: 235.
  - Reopenings: 0.

- [2026-11-14] **[Implement]**
  Added tests for pin parsing, worktree venv candidates, venv re-execution, the mismatch error, and integration clone isolation.

- [2026-11-14] **[Verify]**
  New tests failed first: missing functions, and the stand-in support-python 0.0.1 ran instead of the venv. Clone test failed on the hard-link limit.

- [2026-11-14] **[Implement]**
  devops.py compares the installed support-python version with the requirements pin, re-runs under the checkout or primary-checkout venv, else exits 1 with setup commands.

- [2026-11-14] **[Doc]**
  Documented the version check and worktree venv fallback in README.md and both changelogs; Markdown lint passes.

- [2026-11-14] **[Review]**
  Round 1 requested (mode: agent).

- [2026-11-14] **[Review]**
  Launched agent review round 1 via plan agents review T0037 --sandbox; reviewer @codex.
  - plan PID 33176, codex PID 34540.

- [2026-11-14] **[Review]**
  Round 1 rejected by @codex: [Decided]** Rejected for one blocking fallback defect.
  - Findings: [review-findings-1.md](T0037-make-devops-py-use-the-project-venv-when/review-findings-1.md).

- [2026-11-14] **[Implement]**
  Round 1 rework: devops.py probes each candidate venv's support-python version and re-executes at most once, guarded by METEO_DEVOPS_VENV_REEXEC.

- [2026-11-14] **[Verify]**
  Five mocked fallback tests failed first; all 16 venv tests and devops test from the global interpreter now pass.
  - Files touched: 4.
  - Lines touched: 430.
  - Reopenings: 0.
  - Size note: regression tests cross 400 lines; fix and tests merge together.

- [2026-11-14] **[Review]**
  Round 2 requested (mode: agent).

- [2026-11-14] **[Review]**
  Launched agent review round 2 via plan agents review T0037 --sandbox.
  - plan PID 20600, codex PID 37740.

