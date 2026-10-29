---
id: T0018
owner: "@claude-code"
needs: []
branch: —
worktree: —
status: completed
started_at: "2026-10-29T07:05:24Z"
ended_at: "2026-10-29T07:09:35Z"
review: none
preview: none
protocol: adhoc
---
# T0018: Remove the Open-Meteo and OpenStreetMap attribution links below the forecast, kept in About

## Goals
The line below the forecast repeats the Open-Meteo and OpenStreetMap credits.
The About view already lists both sources with their licenses.
Remove both links from below the forecast and keep the update time.
Specifications: [technical-spec.md](T0018-remove-the-open-meteo-and-openstreetmap-attribution-links/technical-spec.md).

## Task Execution Steps
- [x] **[Implement]** Replace the attribution checks in the forecast browser test with checks that no links remain.
- [x] **[Verify]**    Run the forecast browser test, keep before screenshots, and confirm the new checks fail.
- [x] **[Implement]** Remove the links, their strings, element reference and styles.
- [x] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [x] **[Visual]**    Capture after screenshots in light and dark on desktop and phone.
- [x] **[Doc]**       Add the change to CHANGELOG.md and CHANGELOG.nl.md under a new pre-release heading.

## Execution Log
- [2026-10-29] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-10-29] **[Implement]**
  Replaced the attribution checks in Scenarios 1 and 2 with checks that no links remain.

- [2026-10-29] **[Verify]**
  Both new checks failed before the change; before screenshots kept.

- [2026-10-29] **[Implement]**
  Removed both links, their strings, element reference, class toggle and styles; regenerated sw.js.

- [2026-10-29] **[Verify]**
  Unit tests and both browser scripts passed; evidence in validation-proof.md.

- [2026-10-29] **[Doc]**
  Opened v1.0.1-pre in both changelogs and package.json.

- [2026-10-29] **[Verify]**
  Recorded the task outcomes.
  - Files touched: 10.
  - Lines touched: 42.
  - Reopenings: 0.

- [2026-10-29] **[Complete]**
  Task completed successfully.

