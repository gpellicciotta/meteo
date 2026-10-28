---
id: T0005
owner: "@claude-code"
needs: []
branch: —
worktree: —
status: completed
started_at: "2026-10-28T12:11:46Z"
ended_at: "2026-10-28T12:26:55Z"
review: agent
preview: none
protocol: standard
review_status: approved
review_round: 2
reviewed_by: "@claude-2"
---
# T0005: Use a compact start layout with the forecast details below the chart when vertical space is short

## Goals
Avoid the vertical scrollbar on the start view once a forecast is shown in a short window.
At 1280×800 the forecast content is 8px taller than its area, so a scrollbar appears.
When space is short, move the current-location button next to the search field as an icon button.
Move the place name and update time below the chart, where scrolling them off matters least.
Keep the roomy layout unchanged when there is enough height.
Specifications: [technical-spec.md](T0005-use-a-compact-start-layout-with-the-forecast/technical-spec.md).

## Task Execution Steps
- [x] **[Visual]**    Capture before screenshots of the forecast at 1280×800 and 390×667.
- [x] **[Implement]** Add the compact layout scenario to the forecast browser test.
- [x] **[Verify]**    Run the browser test and confirm the new checks fail.
- [x] **[Implement]** Restructure the form and forecast markup and add the container query styles.
- [x] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [x] **[Visual]**    Capture after screenshots in light and dark, roomy and compact.
- [x] **[Doc]**       Update CHANGELOG.md and CHANGELOG.nl.md.
- [x] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-10-28] **[Verify]**
  Red phase: the new compact layout scenario failed on the 8px overflow at 1280x800.
  - 24 existing checks passed.

- [2026-10-28] **[Implement]**
  Restructured the form and forecast markup and added the container query compact layout.
  - Chrome needed flex-basis 0 for the container height.
  - Narrow phones switch at 580px instead of 520px.
  - Mechanical: sw.js regenerated, version bumped to 0.1.1-pre.

- [2026-10-28] **[Verify]**
  24 unit tests and both browser scripts passed; outputs in validation-proof.md.
  - [Before 1280x800](T0005-use-a-compact-start-layout-with-the-forecast/screenshots/before-1280x800-light.png).
  - [After 1280x800](T0005-use-a-compact-start-layout-with-the-forecast/screenshots/after-1280x800-light.png).

- [2026-10-28] **[Review]**
  Round 1 requested (mode: agent).

- [2026-10-28] **[Review]**
  Round 1 rejected by @claude-2: Doubled forecast card padding in the roomy phone layout.

- [2026-10-28] **[Implement]**
  Scoped the phone card padding to compact mode after the round 1 rejection, with a failing check first.
  - Roomy chart widths match the pre-change values.
  - Restored the 10px gap on narrow phones.

- [2026-10-28] **[Review]**
  Round 2 requested (mode: agent).

- [2026-10-28] **[Review]**
  Round 2 approved by @claude-2.

- [2026-10-28] **[Verify]**
  Recorded task outcomes.
  - Files touched: 5.
  - Lines touched: 236.
  - Reopenings: 0.

- [2026-10-28] **[Complete]**
  Task completed successfully.

