---
id: T0010
owner: "@codex"
session: codex-20261028-df2030
needs: []
branch: task/T0010-give-up-on-open-meteo-requests-after-10
worktree: .plan/work/T0010-give-up-on-open-meteo-requests-after-10
status: completed
started_at: "2026-10-28T16:52:03Z"
ended_at: "2026-10-28T17:06:18Z"
review: agent
preview: none
protocol: standard
review_status: approved
review_round: 2
work_duration: 853.6
reviewed_by: "@codex-2"
---
# T0010: Give up on Open-Meteo requests after 10 seconds and show the network error

## Goals
The geocoding and forecast requests have no time limit.
On a weak mobile connection, "Loading the forecast…" can then stay on screen for a minute or more.
Abort each request after 10 seconds and show the existing network error.
Geolocation already has its own overall limit and stays unchanged.
Specifications: [technical-spec.md](T0010-give-up-on-open-meteo-requests-after-10/technical-spec.md).
Verification: [validation-proof.md](T0010-give-up-on-open-meteo-requests-after-10/validation-proof.md).
Rework verification: [rework-validation-proof.md](T0010-give-up-on-open-meteo-requests-after-10/rework-validation-proof.md).

## Task Execution Steps
- [x] **[Implement]** Add the timeout unit tests for searchPlaces and fetchForecast.
- [x] **[Verify]**    Run the unit tests and confirm the new checks fail.
- [x] **[Implement]** Pass an AbortSignal timeout to fetch in getJson.
- [x] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [x] **[Doc]**       Update CHANGELOG.md and CHANGELOG.nl.md.
- [x] **[Implement]** Add regression cases for response-body timeouts and unrelated parsing errors.
- [x] **[Verify]**    Confirm body-timeout regressions fail before implementation.
- [x] **[Implement]** Convert response-body timeouts while preserving other error behavior.
- [x] **[Verify]**    Rerun unit tests, browser scripts, and validation; regenerate the service worker.
- [x] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-10-28] **[Decided]**
  Resumed the prepared worktree after verifying active ownership and branch. The installed CLI lacks `tasks inspect`.
  The orchestrator owns claim synchronization, review, and integration.

- [2026-10-28] **[Implement]**
  Added real abort-signal regression tests and confirmed three failures before implementation.
  Both public requests now default to ten seconds and preserve existing network-error handling.

- [2026-10-28] **[Verify]**
  Ran `npm run test:browser` under execution session 5607.
  Browser tests manage their local HTTP server and browser cleanup internally.

- [2026-10-28] **[Doc]**
  Updated timeout parameter documentation and both changelogs without changing versions.
  Regenerated the service worker using the declared mechanical command.

- [2026-10-28] **[Decided]**
  Followed installed validator TF025 by keeping specifications and verification transcripts in linked companion files.

- [2026-10-28] **[Verify]**
  All 34 unit tests and both browser scripts passed. Agent review remains assigned to the orchestrator.
  - Files touched: 4
  - Lines touched: 49
  - Reopenings: 0

- [2026-10-28] **[Review]**
  Round 1 requested (mode: agent).

- [2026-10-28] **[Review]**
  Round 1 rejected by @codex-2: [Decided]** Rejected because timeouts during response-body consumption bypass the specified network-error conversion.
  - Findings: [review-findings-1.md](T0010-give-up-on-open-meteo-requests-after-10/review-findings-1.md).

- [2026-10-28] **[Decided]**
  Retained the request signal through body consumption and converted aborted-body failures into the network error.
  Preserved HTTP failures and unrelated JSON parsing errors.

- [2026-10-28] **[Verify]**
  Confirmed two failing body-timeout regressions before implementation; all 37 tests passed afterward.
  `npm run test:browser` passed under session 90804; native fetch also passed with stalled local responses.

- [2026-10-28] **[Doc]**
  Clarified body timeout coverage in both changelogs and regenerated the service worker without changing versions.
  Recorded review rework evidence for the orchestrator's next review.
  - Files touched: 4
  - Lines touched: 82
  - Reopenings: 0

- [2026-10-28] **[Review]**
  Round 2 requested (mode: agent).

- [2026-10-28] **[Review]**
  Round 2 approved by @codex-2: [Decided]** Approved.
  - Findings: [review-findings-2.md](T0010-give-up-on-open-meteo-requests-after-10/review-findings-2.md).

- [2026-10-28] **[Complete]**
  Task completed successfully.

