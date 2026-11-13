---
id: T0034
owner: "@claude"
session: claude-20261113-ae9be2
needs: []
branch: task/T0034-replace-the-app-s-shared-components-with-the
worktree: .plan/work/T0034-replace-the-app-s-shared-components-with-the
status: active
started_at: "2026-11-13T21:59:46Z"
ended_at: —
review: agent
preview: none
protocol: standard
usage:
  worker: {turns: 2, duration_s: 3606.0, input: 4, output: 4}
work_duration: 1828.2
---
# T0034: Replace the app's shared components with the vendored ones and import the public bright look entry point

## Goals
Replace the app's own copies of the shared components with the vendored ones, per [components.md](../../../support.webapp/docs/specs/components.md).
They cover the live region, the offline indicator, the service worker update prompt, and any toast or dialog the app builds itself.
Switch `css/style.css` to the public `looks/bright/index.css`, ending the direct import of private files ([ADR-0005](../../../support.webapp/docs/adrs/ADR-0005-distribution-and-versioning.md)).
Keep app-local components, such as the forecast chart, in the app.
Prove a lossless switch as [ADR-0007](../../../support.webapp/docs/adrs/ADR-0007-documentation-and-verification.md) requires, with T0032's proof harness.

## Task Execution Steps
- [x] **[Read]**      Inventory the app's components against the vendored component list.
- [x] **[Implement]** Author tests for each component the app now takes from the vendored copy.
- [x] **[Verify]**    Run the new tests and confirm they fail before the switch.
- [ ] **[Implement]** Replace the app's copies and switch `style.css` to the public bright entry point.
- [ ] **[Verify]**    Run the full tests and the lossless switch proof with T0032's harness.
- [ ] **[Doc]**       Update documentation and CHANGELOG.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-11-13] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-11-13] **[Read]**
  Inventoried meteo against components.md: offline indicator, silent worker update, and the empty toast region map to vendored parts.
  - Tooltips, buttons, fields stay app-local: outside the named scope.
  - Vendored .icon would resize meteo icons: rename to app-icon.

- [2026-11-13] **[Implement]**
  Wrote failing unit tests, the update browser scenario, and extended the switch proof with icons and an offline page.
  - tests/pwa.test.js, tests/update-browser.mjs added.

- [2026-11-13] **[Verify]**
  Recorded the failure output of the new tests in validation-proof.md; captured proof/before at 7857b0d.
  - 18 unit tests and the update scenario fail.
  - Fixed CRLF parsing in tests/accent.test.js, undeclared.

