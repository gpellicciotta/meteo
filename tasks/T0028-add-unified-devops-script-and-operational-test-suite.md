---
id: T0028
owner: "@gemini"
needs: []
branch: —
worktree: —
status: active
started_at: "2026-11-02T19:56:21Z"
ended_at: —
review: human
preview: none
protocol: standard
review_status: pending
review_round: 1
---
# T0028: Add unified devops script and operational test suite

## Goals
Bundle developer and operational workflows into a unified `scripts/devops.py` CLI.
Inline local review server and remove obsolete `scripts/run-review-server.py`.
Provide comprehensive operational CLI tests in `tests/test_devops.py`.
Support test execution, markdown linting, service worker regeneration, version inspection, and deployment.
Keep project documentation and changelogs updated.

## Task Execution Steps
- [x] **[Implement]** Author failing unit tests in `tests/test_devops.py`.
- [x] **[Verify]**    Confirm test failure in red phase.
- [x] **[Implement]** Implement `scripts/devops.py` and inline review server.
- [x] **[Implement]** Remove obsolete `scripts/run-review-server.py` and update `README.md`.
- [x] **[Verify]**    Run devops checks and test suite confirming green phase.
- [x] **[Doc]**       Update validation proof, task log, and changelogs.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-11-02] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-11-02] **[Implement]**
  Authored failing unit tests in tests/test_devops.py.

- [2026-11-02] **[Verify]**
  Confirmed failure in red phase with 6 failures and 3 errors.

- [2026-11-02] **[Implement]**
  Created scripts/devops.py and inlined review server.

- [2026-11-02] **[Implement]**
  Removed obsolete scripts/run-review-server.py and updated README.md.

- [2026-11-02] **[Verify]**
  Full test suite and devops check passed cleanly in green phase.

- [2026-11-02] **[Doc]**
  Updated changelogs, README.md, and validation proof.

- [2026-11-02] **[Verify]**
  Recorded task outcomes.
  - Files touched: 7.
  - Lines touched: 847.
  - Reopenings: 0.

- [2026-11-02] **[Review]**
  Round 1 requested (mode: agent).

- [2026-11-02] **[Review]**
  Review raised from agent to human.

