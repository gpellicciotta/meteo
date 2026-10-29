---
id: T0025
owner: "@claude-code"
needs: []
branch: —
worktree: —
status: completed
started_at: "2026-10-29T09:15:59Z"
ended_at: "2026-10-29T09:26:48Z"
review: none
preview: none
protocol: adhoc
---
# T0025: Show each guide explanation on hover over its sample element on pointing devices

## Goals
Mouse users should not need to scroll between the guide sample and its numbered list.
On devices with a fine hovering pointer, hovering a sample element shows its explanation in a tooltip.
The hovered section and its list item are highlighted together.
Specifications: [technical-spec.md](T0025-show-each-guide-explanation-on-hover-over-its/technical-spec.md).

## Task Execution Steps
- [x] **[Implement]** Add the guide hover browser scenario for mouse and touch devices.
- [x] **[Verify]**    Run the browser test, keep before screenshots, and confirm the new checks fail.
- [x] **[Implement]** Add the hover tooltip, section highlights and their styles to the guide.
- [x] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [x] **[Visual]**    Capture after screenshots of hovered sections in light and dark on desktop.
- [x] **[Doc]**       Update both changelogs and the README How It Works list.

## Execution Log
- [2026-10-29] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-10-29] **[Implement]**
  Added Scenario 18 for mouse hover and Scenario 18b for touch phones.

- [2026-10-29] **[Verify]**
  Scenario 18 failed with no tooltip before the change; the touch check already held.

- [2026-10-29] **[Implement]**
  Added section detection, the guide tooltip, section and list highlights, and their styles.

- [2026-10-29] **[Decided]**
  The sky tooltip also shows the nine icons by name, since its text refers to them; tooltip checks read title and text parts.

- [2026-10-29] **[Verify]**
  Unit tests and both browser scripts passed; evidence in validation-proof.md.

- [2026-10-29] **[Doc]**
  Added the change to both changelogs and the README.

- [2026-10-29] **[Verify]**
  Recorded the task outcomes.
  - Files touched: 7.
  - Lines touched: 259.
  - Reopenings: 0.

- [2026-10-29] **[Complete]**
  Task completed successfully.

