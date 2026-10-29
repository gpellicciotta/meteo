---
id: T0027
owner: "@claude-code"
needs: []
branch: —
worktree: —
status: completed
started_at: "2026-10-29T09:40:10Z"
ended_at: "2026-10-29T09:44:03Z"
review: none
preview: none
protocol: adhoc
---
# T0027: Use white text on yellow accent buttons in light and dark themes

## Goals
The user prefers white text on the yellow accent, keeping the current yellow shades.
Switch the yellow on-primary text to white in light and dark themes.
Specifications: [technical-spec.md](T0027-use-white-text-on-yellow-accent-buttons-in/technical-spec.md).

## Task Execution Steps
- [x] **[Implement]** Add on-primary text color checks for every accent and theme to the accent browser scenario.
- [x] **[Verify]**    Run the forecast browser test, keep before screenshots, and confirm the yellow checks fail.
- [x] **[Implement]** Set the yellow on-primary tokens to white and update their comment.
- [x] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [x] **[Visual]**    Capture after screenshots in light and dark on desktop and phone.
- [x] **[Doc]**       Add the change to both changelogs.

## Execution Log
- [2026-10-29] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-10-29] **[Implement]**
  Added white button text checks for six theme and accent pairs, and yellow fill checks, to Scenario 13.

- [2026-10-29] **[Verify]**
  The light yellow text check failed with the dark #0f172a text.

- [2026-10-29] **[Implement]**
  Set both yellow on-primary tokens to white and rewrote the yellow block comment.

- [2026-10-29] **[Verify]**
  Unit tests and both browser scripts passed; evidence in validation-proof.md.

- [2026-10-29] **[Doc]**
  Added the change to both changelogs.

- [2026-10-29] **[Verify]**
  Recorded the task outcomes.
  - Files touched: 4.
  - Lines touched: 16.
  - Reopenings: 0.

- [2026-10-29] **[Complete]**
  Task completed successfully.

