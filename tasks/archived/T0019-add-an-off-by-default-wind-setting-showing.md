---
id: T0019
owner: "@claude-code"
needs: []
branch: —
worktree: —
status: completed
started_at: "2026-10-29T07:11:01Z"
ended_at: "2026-10-29T07:21:40Z"
review: none
preview: none
protocol: adhoc
---
# T0019: Add an off-by-default wind setting showing hourly wind on tall screens and the wind summary

## Goals
Wind matters to some users only, so hide it unless they ask for it.
Add a wind setting, off by default and remembered in localStorage.
With the setting on, show the wind summary line and an hourly wind speed row.
Show the hourly row only when the screen is tall enough to keep the forecast unscrolled.
Specifications: [technical-spec.md](T0019-add-an-off-by-default-wind-setting-showing/technical-spec.md).

## Task Execution Steps
- [x] **[Implement]** Add displaySettings unit tests and the wind setting browser scenario; enable wind in existing wind checks.
- [x] **[Verify]**    Run the tests, keep before screenshots, and confirm the new checks fail.
- [x] **[Implement]** Add displaySettings, the settings checkbox, the settings event, the wind row and its styles.
- [x] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [x] **[Visual]**    Capture after screenshots in light and dark on desktop and phone.
- [x] **[Doc]**       Update both changelogs, package.json version and the README How It Works list.

## Execution Log
- [2026-10-29] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-10-29] **[Implement]**
  Added displaySettings unit tests, Scenario 14 and stored wind settings for Scenarios 1 and 5.

- [2026-10-29] **[Verify]**
  Five unit tests and the first Scenario 14 check failed before the implementation.

- [2026-10-29] **[Implement]**
  Added displaySettings, the Forecast settings card, the settingschange event, the wind row, legend part and media query.

- [2026-10-29] **[Decided]**
  Scenario 1 now expects the wind part in its hour description, since it stores the wind setting.

- [2026-10-29] **[Verify]**
  Unit tests and both browser scripts passed; evidence in validation-proof.md.

- [2026-10-29] **[Doc]**
  Renumbered the changelogs and package.json to v1.1.0-pre; updated README and the About settings description.

- [2026-10-29] **[Verify]**
  Recorded the task outcomes.
  - Files touched: 14.
  - Lines touched: 252.
  - Reopenings: 0.

- [2026-10-29] **[Complete]**
  Task completed successfully.

