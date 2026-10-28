---
id: T0008
owner: "@claude"
session: claude-20261028-f314f1
needs: []
branch: task/T0008-refresh-the-forecast-when-the-app-becomes-visible
worktree: .plan/work/T0008-refresh-the-forecast-when-the-app-becomes-visible
status: completed
started_at: "2026-10-28T17:42:51Z"
ended_at: "2026-10-28T17:57:34Z"
review: agent
preview: none
protocol: standard
usage:
  worker: {turns: 1, duration_s: 635.7, input: 96, output: 26385, cache_read: 3927827, cache_write: 93041}
  review: {turns: 1, duration_s: 195.6, input: 34, output: 8465, cache_read: 827184, cache_write: 43046}
review_status: approved
review_round: 1
reviewed_by: "@claude-2"
work_duration: 883.1
---
# T0008: Refresh the forecast when the app becomes visible again and the shown data is older than 15 minutes

## Goals
An installed app on a phone resumes from memory instead of reloading.
The chart then shows hours that already passed, with only the update time hinting at it.
Reload the shown place quietly when the page becomes visible and its forecast is older than 15 minutes.
Add no new UI; the existing update time already tells when the data was fetched.
Specifications: [technical-spec.md](T0008-refresh-the-forecast-when-the-app-becomes-visible/technical-spec.md).

## Task Execution Steps
- [x] **[Implement]** Add the isStale unit tests and the visibility refresh browser scenario.
- [x] **[Verify]**    Run the tests and confirm the new checks fail.
- [x] **[Implement]** Add isStale and the quiet refresh on visibility and pageshow events.
- [x] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [x] **[Doc]**       Update CHANGELOG.md and CHANGELOG.nl.md.
- [x] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-10-28] **[Verify]**
  Wrote isStale unit tests and a visibility refresh browser scenario; both failed before implementation.
  - npm test: 2 isStale tests failed.
  - forecast-browser.mjs: timed out waiting for the 10:16 refresh.

- [2026-10-28] **[Implement]**
  Added isStale and STALE_AFTER_MS, and a quiet refresh on visibilitychange and persisted pageshow.
  - Refresh skips without place, offline, or with a request in flight.
  - Refresh keeps the shown place, chart, and update time on failure.
  - Regenerated sw.js with python scripts/generate-sw.py generate.

- [2026-10-28] **[Verify]**
  Unit tests and both browser scripts passed; a mutation check proved the offline guard is tested.
  - npm test: 39 passed.
  - npm run test:browser: 138 checks passed, exit 0.
  - Evidence in validation-proof.md and browser-validation.txt.

- [2026-10-28] **[Verify]**
  Recorded task outcomes.
  - Files touched: 6.
  - Lines touched: 166.
  - Reopenings: 0.

- [2026-10-28] **[Doc]**
  See [validation-proof.md](T0008-refresh-the-forecast-when-the-app-becomes-visible/validation-proof.md) for verbatim test output; no UI changed, so no screenshots apply.

- [2026-10-28] **[Review]**
  Round 1 requested (mode: agent).

- [2026-10-28] **[Review]**
  Round 1 approved by @claude-2: The work meets every goal and decided specification.
  - Findings: [review-findings-1.md](T0008-refresh-the-forecast-when-the-app-becomes-visible/review-findings-1.md).

- [2026-10-28] **[Complete]**
  Task completed successfully.

