---
id: T0006
owner: "@claude-code"
needs: []
branch: —
worktree: —
status: active
started_at: "2026-10-28T12:37:57Z"
ended_at: —
review: agent
preview: none
protocol: standard
review_status: approved
review_round: 2
reviewed_by: "@claude-2"
---
# T0006: Always show the current-location icon beside the search field and the place and update lines below the forecast card

## Goals
Use one start layout at every window size instead of switching on available height.
Show the current-location button as an icon left of the search field everywhere.
Show the place name and the update line below the forecast card, as two separate lines.
Drop the height container query, which no longer has anything to switch.
Specifications: [technical-spec.md](T0006-always-show-the-current-location-icon-beside-the/technical-spec.md).

## Task Execution Steps
- [x] **[Implement]** Change the forecast browser checks to expect the single layout at all sizes.
- [x] **[Verify]**    Run the browser test and confirm the changed checks fail.
- [x] **[Implement]** Make the compact rules unconditional and remove the container query.
- [x] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [x] **[Visual]**    Capture after screenshots in light and dark on desktop and phone sizes.
- [x] **[Doc]**       Update CHANGELOG.md and CHANGELOG.nl.md.
- [x] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-10-28] **[Verify]**
  Red phase: the changed layout checks failed at 1280x900 before the CSS change.

- [2026-10-28] **[Implement]**
  Made the compact rules unconditional and removed the container query.
  - Undeclared: index.html now uses the sr-only utility.
  - Mechanical: sw.js regenerated.
  - Follow-up T0007 for 320px chart labels.

- [2026-10-28] **[Verify]**
  24 unit tests and both browser scripts passed; outputs in validation-proof.md.
  - [After 1280x900](T0006-always-show-the-current-location-icon-beside-the/screenshots/after-1280x900-light.png).

- [2026-10-28] **[Review]**
  Round 1 requested (mode: agent).

- [2026-10-28] **[Review]**
  Round 1 rejected by @claude-2: Tooltip text doubles the accessible name of the location button.

- [2026-10-28] **[Implement]**
  Named the location button with aria-label after the round 1 rejection, with an exact focused-name check failing first.
  - Dutch name follows the language switch.

- [2026-10-28] **[Review]**
  Round 2 requested (mode: agent).

- [2026-10-28] **[Review]**
  Round 2 approved by @claude-2.

- [2026-10-28] **[Implement]**
  Moved the location button first in the markup so keyboard order matches the visual order, with a failing Shift+Tab check first.

- [2026-10-28] **[Verify]**
  Recorded task outcomes.
  - Files touched: 5.
  - Lines touched: 246.
  - Reopenings: 0.

