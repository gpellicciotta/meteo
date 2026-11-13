---
id: T0029
owner: "@claude"
session: claude-20261113-8b94b7
needs: []
branch: task/T0029-evaluate-adopting-devopscli-from-the-released-support-python
worktree: .plan/work/T0029-evaluate-adopting-devopscli-from-the-released-support-python
status: active
started_at: "2026-11-13T17:46:42Z"
ended_at: —
review: agent
preview: none
protocol: standard
usage:
  worker: {turns: 2, duration_s: 306.8, input: 84, output: 15454, cache_read: 2348236, cache_write: 108486}
review_status: pending
review_round: 1
review_requested_at: "2026-11-13T17:50:12Z"
---
# T0029: Evaluate adopting DevopsCli from the released support-python v2.0.0, keeping project-specific actions through add_action

## Goals
Needs the released support-python v2.0.0; see `docs/migration-v2.md` in support-python for the full mapping.
Evaluate replacing `scripts/devops.py` with `DevopsCli` over the matching `PythonProject`, `GradleProject`, or `NodeProject` adapter.
Keep project-specific actions through `DevopsCli.add_action`.
Record the decision in the Execution Log, and adopt it in a follow-up task when it fits.

## Task Execution Steps
- [x] **[Implement]** Implement required changes for T0029.
- [x] **[Verify]**    Verify implementation with automated test suites.
- [x] **[Doc]**       Update documentation and CHANGELOG.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-11-10] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-11-13] **[Doc]**
  Decision: adopt DevopsCli over a MeteoProject(NodeProject) subclass in a follow-up task; probe showed versions works, lint needs override, release needs main branch.

- [2026-11-13] **[Doc]**
  Keep via add_action: serve, sw, deploy. Override lint (lint-markdown), build (no-op, not npm pack), release (own deploy: sw.js regeneration at freeze, CHANGELOG.nl.md, plan branch push).

- [2026-11-13] **[Doc]**
  Cost: Python dependency and venv in a Node repo; pin latest v3.2.0, not v2.0.0; v3 needs explicit copyright. Rewrite tests/test_devops.py. No changelog entry: no pre-release heading, no product change.

- [2026-11-13] **[Review]**
  Round 1 requested (mode: agent).

