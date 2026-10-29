---
id: T0026
owner: "@claude-code"
needs: []
branch: —
worktree: —
status: completed
started_at: "2026-10-29T09:27:24Z"
ended_at: "2026-10-29T09:29:50Z"
review: none
preview: none
protocol: adhoc
---
# T0026: Open the About help view when F1 is pressed

## Goals
Desktop users expect F1 to open help.
Pressing F1 opens the About view with its forecast guide, instead of the browser's own help.
Specifications: [technical-spec.md](T0026-open-the-about-help-view-when-f1-is/technical-spec.md).

## Task Execution Steps
- [x] **[Implement]** Add the F1 checks to the shell browser test.
- [x] **[Verify]**    Run the shell browser test and confirm the new checks fail.
- [x] **[Implement]** Handle F1 in the app keydown listener and mention it in the About help entry.
- [x] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [x] **[Visual]**    Capture the About view opened with F1 in light and dark on desktop.
- [x] **[Doc]**       Update both changelogs and the README.

## Execution Log
- [2026-10-29] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-10-29] **[Implement]**
  Added F1 checks for the start, About and Settings views to the shell browser test.

- [2026-10-29] **[Verify]**
  The first F1 check failed before the change.

- [2026-10-29] **[Implement]**
  Added openHelp and the F1 branch to the keydown listener, and mentioned F1 in the About help entry.

- [2026-10-29] **[Implement]**
  Touched undeclared js/dom.js for the About content element used to scroll back to the guide.

- [2026-10-29] **[Verify]**
  Unit tests and both browser scripts passed; evidence in validation-proof.md.

- [2026-10-29] **[Doc]**
  Added the change to both changelogs and the README.

- [2026-10-29] **[Verify]**
  Recorded the task outcomes.
  - Files touched: 9.
  - Lines touched: 52.
  - Reopenings: 0.

- [2026-10-29] **[Complete]**
  Task completed successfully.

