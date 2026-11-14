---
id: T0038
owner: "@claude"
needs: []
branch: —
worktree: —
status: completed
started_at: "2026-11-14T21:40:11Z"
ended_at: "2026-11-14T21:43:40Z"
review: agent
preview: none
protocol: standard
review_status: approved
review_round: 1
review_requested_at: "2026-11-14T21:42:15Z"
reviewed_by: "@codex"
review_session: codex-20261114-c6c200
completion-commit: 65162488cc30c71d8c79e6d097c7f4166da40563
---
# T0038: Add docs/index.md and the visual style guide to the markdown lint list of devops.py

## Goals
Add `docs/index.md` and `docs/specs/visual-style-guide.md` to `CORE_DOCS` in `scripts/devops.py`.
`devops.py lint` and `format` then cover them, and `check` fails on their lint errors.
Both documents already pass `lint-markdown check --offline`, so no document edits are expected.

## Task Execution Steps
- [x] **[Implement]** Author failing tests for the two new lint entries and their repository-relative paths.
- [x] **[Verify]**    Run the new tests and record their failure output in validation-proof.md.
- [x] **[Implement]** Add both documents to CORE_DOCS in devops.py.
- [x] **[Verify]**    Run the devops tests, devops lint, and devops test through the venv.
- [x] **[Doc]**       Update both changelogs.
- [x] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-11-13] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-11-14] **[Implement]**
  Added docs/index.md and docs/specs/visual-style-guide.md to CORE_DOCS; the lint test now compares repository-relative paths.

- [2026-11-14] **[Verify]**
  New lint-list test failed first; 46 devops tests, devops lint over 6 files, and devops test pass.
  - Files touched: 3.
  - Lines touched: 10.
  - Reopenings: 0.

- [2026-11-14] **[Review]**
  Round 1 requested (mode: agent).

- [2026-11-14] **[Review]**
  Launched agent review round 1 via plan agents review T0038 --sandbox.
  - plan PID 37264, codex PID 27288.

- [2026-11-14] **[Review]**
  Round 1 approved by @codex: [Decided]** Approved.
  - Findings: [review-findings-1.md](T0038-add-docs-index-md-and-the-visual-style/review-findings-1.md).

- [2026-11-14] **[Complete]**
  Task completed successfully.

