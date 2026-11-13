---
id: T0036
owner: "@claude"
session: claude-20261113-d28c60
needs: []
branch: task/T0036-adopt-devopscli-from-support-python-v3-2-0
worktree: .plan/work/T0036-adopt-devopscli-from-support-python-v3-2-0
status: suspended
started_at: "2026-11-13T17:59:06Z"
ended_at: —
review: agent
preview: none
protocol: standard
usage:
  worker: {turns: 4, duration_s: 1895.6, input: 64, output: 10342, cache_read: 3227646, cache_write: 29328}
  review: {turns: 2, duration_s: 1161.0, input: 135640, output: 10136, cache_read: 5475840, cache_write: 0}
work_duration: 1589.5
review_status: rejected
review_round: 1
review_requested_at: "2026-11-13T18:15:48Z"
reviewed_by: "@codex"
review_session: codex-20261113-08f59a
---
# T0036: Adopt DevopsCli from support-python v3.2.0 in scripts/devops.py via MeteoProject(NodeProject): override test, lint, build, release; keep serve, sw, deploy through add_action; see T0029 findings

## Goals
Adopt DevopsCli from support-python v3.2.0 in `scripts/devops.py` via `MeteoProject(NodeProject)`; see T0029 findings.

- Pin `support-python` at `v3.2.0` in `scripts/requirements.txt`, installed into a project-local `.venv`; pass `copyright`.
- Override `test` (unittest, then `npm test`), `test_slow` (`npm run test:browser`), `lint` (`lint-markdown check --offline` on core docs), `build` (no-op), `release` (existing deploy flow).
- Keep `serve`, `sw`, `deploy` through `add_action`.
- Accept when `test`, `test --slow`, `lint`, `check`, `versions`, and both dry runs pass on `main`, and `tests/test_devops.py` is rewritten.

## Task Execution Steps
- [x] **[Implement]** Implement required changes for T0036.
- [x] **[Verify]**    Verify implementation with automated test suites.
- [x] **[Doc]**       Update documentation and CHANGELOG.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-11-13] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-11-13] **[Implement]**
  Adopted DevopsCli via MeteoProject(NodeProject); serve, sw, deploy via add_action; tests rewritten; production alias dropped; tests written after code.

- [2026-11-13] **[Doc]**
  No CHANGELOG entry: no -pre heading exists and version bumps are forbidden. README updated. Release dry-run fails on missing -pre heading; see validation-proof.md.

- [2026-11-13] **[Verify]**
  Completion validation found 1 errors; pending fix turn 1 of 2.
  - TF014.

- [2026-11-13] **[Review]**
  Round 1 requested (mode: agent).

- [2026-11-13] **[Review]**
  Round 1 rejected by @codex: [Decided]** Rejected because acceptance and verification requirements remain unmet.
  - Findings: [review-findings-1.md](T0036-adopt-devopscli-from-support-python-v3-2-0/review-findings-1.md).

- [2026-11-13] **[Doc]**
  Rework round 1: added dry-run integration tests, technical-spec.md, and a walkthrough proof. Both dry runs pass in a clone with a -pre heading, but fail on released main.

- [2026-11-13] **[Review]**
  Needs acceptance revision: dry runs on main fail without a -pre heading, and a version bump is forbidden. Open question: add a -pre heading, or relax the acceptance?.

