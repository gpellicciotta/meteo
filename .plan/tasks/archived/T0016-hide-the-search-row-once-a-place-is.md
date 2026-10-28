---
id: T0016
owner: "@claude-code"
needs: []
branch: —
worktree: —
status: completed
started_at: "2026-10-28T19:26:59Z"
ended_at: "2026-10-28T19:35:11Z"
review: none
preview: none
protocol: adhoc
---
# T0016: Hide the search row once a place is shown, with a footer button to show it again

## Goals
The search row stays above the forecast after a place is chosen, taking space on phones.
Hide the whole row once a forecast for a chosen place is shown.
A new footer button shows the row again to pick another place.
The row reappears by itself whenever no forecast is shown.
Specifications: [technical-spec.md](T0016-hide-the-search-row-once-a-place-is/technical-spec.md).

## Task Execution Steps
- [x] **[Visual]**    Capture before screenshots of the forecast on desktop and phone.
- [x] **[Implement]** Add searchRowOpen unit tests and the search row browser checks.
- [x] **[Verify]**    Run unit and forecast browser tests and confirm the new checks fail.
- [x] **[Implement]** Add the button, icon, strings, About entry and the row visibility logic.
- [x] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [x] **[Visual]**    Capture after screenshots in light and dark on desktop and phone.
- [x] **[Doc]**       Add the change to CHANGELOG.md and CHANGELOG.nl.md.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-10-28] **[Visual]**
  Captured before screenshots of the forecast with the search row above it on desktop and phone.

- [2026-10-28] **[Implement]**
  Added six searchRowOpen unit tests, Scenarios 11 and 12, and reopen steps in scenarios that search again.

- [2026-10-28] **[Verify]**
  Six unit tests and two browser row checks failed before implementation.

- [2026-10-28] **[Implement]**
  Added searchRowOpen, the footer search button and icon, strings, the About entry and row toggling.

- [2026-10-28] **[Verify]**
  Unit tests passed with 62 tests; browser scripts passed with 199 checks and exit code 0.

- [2026-10-28] **[Visual]**
  Captured after screenshots with the row hidden and reopened in light and dark on desktop and phone.

- [2026-10-28] **[Doc]**
  Added the change to both changelogs under the unpublished v1.0.0 heading.

- [2026-10-28] **[Verify]**
  Recorded the task outcomes.
  - Files touched: 11.
  - Lines touched: 207.
  - Reopenings: 0.

- [2026-10-28] **[Verify]**
  Size note: 11 counted files exceed the typical 8; most are small string, markup and changelog edits.

- [2026-10-28] **[Complete]**
  Task completed successfully.

