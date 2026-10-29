---
id: T0023
owner: "@claude-code"
needs: []
branch: —
worktree: —
status: completed
started_at: "2026-10-29T09:03:11Z"
ended_at: "2026-10-29T09:10:32Z"
review: none
preview: none
protocol: adhoc
---
# T0023: Show the hourly wind direction as an arrow in the wind row

## Goals
The hourly wind row shows speed only, while the user also wants its direction.
Request the wind direction from Open-Meteo and show it as an arrow above each wind speed.
The arrow points where the wind blows to; screen readers hear where it comes from.
Specifications: [technical-spec.md](T0023-show-the-hourly-wind-direction-as-an-arrow/technical-spec.md).

## Task Execution Steps
- [x] **[Implement]** Add compassPoint, parse, URL and restore unit tests, and wind arrow browser checks.
- [x] **[Verify]**    Run the tests, keep before screenshots, and confirm the new checks fail.
- [x] **[Implement]** Request and parse the direction, add compassPoint, the arrow icon, cell layout, strings and guide data.
- [x] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [x] **[Visual]**    Capture after screenshots in light and dark on desktop and phone.
- [x] **[Doc]**       Update both changelogs and the README How It Works list.

## Execution Log
- [2026-10-29] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-10-29] **[Implement]**
  Added compassPoint, direction parsing, URL and restore unit tests, and arrow checks in Scenarios 14, 15 and 17.

- [2026-10-29] **[Verify]**
  Thirteen unit tests and four browser checks failed before the implementation.

- [2026-10-29] **[Implement]**
  Requested and parsed wind_direction_10m, added compassPoint, the wind-arrow icon, stacked wind cells, spoken directions and guide data.

- [2026-10-29] **[Decided]**
  The 337.5 degree unit case moved to 330, as 337.5 lies exactly between NW and N; arrow checks compare centers.

- [2026-10-29] **[Verify]**
  Unit tests and both browser scripts passed; both hourly rows still fit at 390x700 and 1280x800.

- [2026-10-29] **[Doc]**
  Added the change to both changelogs and the README.

- [2026-10-29] **[Verify]**
  Recorded the task outcomes.
  - Files touched: 14.
  - Lines touched: 184.
  - Reopenings: 0.

- [2026-10-29] **[Complete]**
  Task completed successfully.

- [2026-10-29] **[Implement]**
  Touched undeclared index.html for the guide wind text default; recount stays at 14 files and 184 lines.

