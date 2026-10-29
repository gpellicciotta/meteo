---
id: T0020
owner: "@claude-code"
needs: []
branch: —
worktree: —
status: completed
started_at: "2026-10-29T07:22:11Z"
ended_at: "2026-10-29T07:29:43Z"
review: none
preview: none
protocol: adhoc
---
# T0020: Add an off-by-default sky setting showing the summary condition icon and hourly condition icons

## Goals
Sky conditions matter to some users only, so hide them unless asked for.
Add a sky setting, off by default and remembered in localStorage.
With the setting on, show the condition icon before the summary and an hourly icon row.
Show the hourly row only when the screen is tall enough to keep the forecast unscrolled.
Specifications: [technical-spec.md](T0020-add-an-off-by-default-sky-setting-showing/technical-spec.md).

## Task Execution Steps
- [x] **[Implement]** Extend the displaySettings unit tests and add the sky setting browser scenario; enable it in Scenario 6.
- [x] **[Verify]**    Run the tests, keep before screenshots, and confirm the new checks fail.
- [x] **[Implement]** Add the sky checkbox, setting, summary icon gate, hourly icon row and styles.
- [x] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [x] **[Visual]**    Capture after screenshots in light and dark on desktop and phone.
- [x] **[Doc]**       Update both changelogs and the README How It Works list.

## Execution Log
- [2026-10-29] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-10-29] **[Implement]**
  Extended the displaySettings unit tests, added Scenario 15 and stored the sky setting for Scenario 6.

- [2026-10-29] **[Verify]**
  Six unit tests and the first Scenario 15 check failed before the implementation.

- [2026-10-29] **[Implement]**
  Added the sky checkbox, showConditions, the summary icon gate, hourly icon row, hour descriptions and shared media query.

- [2026-10-29] **[Decided]**
  One shared hint below both checkboxes replaced the wind hint; the 16px icons fit both rows at 390x700 and 1280x800.

- [2026-10-29] **[Verify]**
  Unit tests and both browser scripts passed; evidence in validation-proof.md.

- [2026-10-29] **[Doc]**
  Added the change to both changelogs and updated the README How It Works list.

- [2026-10-29] **[Verify]**
  Recorded the task outcomes.
  - Files touched: 13.
  - Lines touched: 194.
  - Reopenings: 0.

- [2026-10-29] **[Complete]**
  Task completed successfully.

