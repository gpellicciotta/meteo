---
id: T0036
owner: "@claude"
session: claude-20261113-d28c60
needs: []
branch: task/T0036-adopt-devopscli-from-support-python-v3-2-0
worktree: .plan/work/T0036-adopt-devopscli-from-support-python-v3-2-0
status: active
started_at: "2026-11-13T19:43:30Z"
ended_at: —
review: agent
preview: none
protocol: standard
usage:
  worker: {turns: 8, duration_s: 4100.4, input: 276, output: 65254, cache_read: 18546146, cache_write: 413150}
  review: {turns: 2, duration_s: 1161.0, input: 135640, output: 10136, cache_read: 5475840, cache_write: 0}
work_duration: 2453.2
review_status: pending
review_round: 2
review_requested_at: "2026-11-13T19:48:39Z"
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
- [x] **[Implement]** Author a failing test that release reopens the next patch -pre heading after tagging.
- [x] **[Implement]** Reopen the next patch -pre heading and package.json version after tagging in release.
- [x] **[Verify]**    Rebase onto main and rerun all acceptance commands, including both dry runs.
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

- [2026-11-13] **[Decide]**
  Acceptance revised: main now has v1.3.0-pre, so dry runs can pass after rebase; release must reopen the next patch -pre heading after tagging.

- [2026-11-13] **[Implement]**
  Wrote a failing reopen test first, then made release open the next patch -pre heading and package.json version after tagging.

- [2026-11-13] **[Verify]**
  Rebased onto main; versions, lint, build, check, test, test --slow, and both dry runs exit 0. Evidence in validation-proof.md.

- [2026-11-13] **[Doc]**
  Added changelog entries under v1.3.0-pre in both changelogs and synced package.json to 1.3.0-pre.

- [2026-11-13] **[Review]**
  Round 2 requested (mode: agent).

