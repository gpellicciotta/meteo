---
id: T0036
owner: "@claude"
session: claude-20261113-d28c60
needs: []
branch: task/T0036-adopt-devopscli-from-support-python-v3-2-0
worktree: .plan/work/T0036-adopt-devopscli-from-support-python-v3-2-0
status: active
started_at: "2026-11-13T17:59:06Z"
ended_at: —
review: agent
preview: none
protocol: standard
usage:
  worker: {turns: 2, duration_s: 1830.6, input: 40, output: 6956, cache_read: 1881002, cache_write: 12640}
work_duration: 939.6
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

