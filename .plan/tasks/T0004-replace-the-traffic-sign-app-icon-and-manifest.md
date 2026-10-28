---
id: T0004
owner: "@claude-code"
needs: []
branch: —
worktree: —
status: active
started_at: "2026-10-28T11:31:30Z"
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
- [x] **[Implement]** Add the manifest and icon assertions to the shell tests.
- [x] **[Verify]**    Run the tests and confirm the new assertions fail.
- [x] **[Implement]** Draw the SVG icon, adapt the generator, regenerate icons and update the manifest.
- [x] **[Verify]**    Run the unit tests and the browser script until both pass.
- [x] **[Visual]**    Capture the rendered icons and the start view with its favicon.
- [x] **[Doc]**       Update CHANGELOG.md and CHANGELOG.nl.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-10-28] **[Verify]**
  Red phase: both new manifest and favicon tests failed against the copied quiz branding.
  - vitest: 2 failed, 21 passed.

- [2026-10-28] **[Implement]**
  Drew the rain-cloud SVG, pointed the icon generator at it, regenerated icons and renamed the manifest; index.html needed no change.
  - Undeclared: tests/shell-browser.mjs gained HTTP 200 asset checks.

- [2026-10-28] **[Verify]**
  23 unit tests and the shell browser script passed; outputs in validation-proof.md.
  - [Before icon](T0004-replace-the-traffic-sign-app-icon-and-manifest/screenshots/before-icon-512.png).
  - [After icon](T0004-replace-the-traffic-sign-app-icon-and-manifest/screenshots/after-icon-512.png).

