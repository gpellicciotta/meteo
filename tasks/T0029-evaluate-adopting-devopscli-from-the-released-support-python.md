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
  worker: {turns: 4, duration_s: 484.2, input: 140, output: 27886, cache_read: 4398652, cache_write: 137940}
  review: {turns: 4, duration_s: 382.0, input: 179784, output: 8300, cache_read: 1066240, cache_write: 0}
review_status: rejected
review_round: 2
review_requested_at: "2026-11-13T17:54:06Z"
review_session: codex-20261113-a8c95f
work_duration: 537.6
reviewed_by: "@codex"
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

- [2026-11-13] **[Review]**
  Round 1 rejected by @codex: [Decided]** Rejected pending evaluation and evidence updates.
  - Findings: [review-findings-1.md](T0029-evaluate-adopting-devopscli-from-the-released-support-python/review-findings-1.md).

- [2026-11-13] **[Doc]**
  Rework round 1: added v2.0.0 baseline probe, test mappings, and follow-up T0036 (pin v3.2.0); evidence rewritten and lint-clean.

- [2026-11-13] **[Review]**
  Round 2 requested (mode: agent).

- [2026-11-13] **[Review]**
  Round 2 rejected by @codex: [Decided]** Rejected for the remaining execution-evidence gap.
  - Findings: [review-findings-2.md](T0029-evaluate-adopting-devopscli-from-the-released-support-python/review-findings-2.md).

- [2026-11-13] **[Doc]**
  Rework round 2: replaced condensed results with verbatim captured output, exact commands, exit codes, and placeholder definitions; linter rerun passes.

