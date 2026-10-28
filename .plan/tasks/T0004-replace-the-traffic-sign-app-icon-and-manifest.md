---
id: T0004
owner: ~
needs: [T0001]
branch: —
worktree: —
status: ready
started_at: —
ended_at: —
review: agent
preview: none
protocol: standard
---
# T0004: Replace the traffic-sign app icon and manifest branding with a weather icon

## Goals
Give meteo its own icon instead of the copied D5 traffic sign.
Rename the web app manifest and page metadata from the quiz to Meteo.
Keep the icon generator so all PNG sizes and `favicon.ico` come from one SVG.

## Task Execution Steps
- [ ] **[Implement]** Add the manifest and icon assertions to the shell tests.
- [ ] **[Verify]**    Run the tests and confirm the new assertions fail.
- [ ] **[Implement]** Draw the SVG icon, adapt the generator, regenerate icons and update the manifest.
- [ ] **[Verify]**    Run the unit tests and the browser script until both pass.
- [ ] **[Visual]**    Capture the rendered icons and the start view with its favicon.
- [ ] **[Doc]**       Update CHANGELOG.md and CHANGELOG.nl.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.
