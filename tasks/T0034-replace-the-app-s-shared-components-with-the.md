---
id: T0034
owner: "@claude"
needs: []
branch: task/T0034-replace-the-app-s-shared-components-with-the
worktree: .plan/work/T0034-replace-the-app-s-shared-components-with-the
status: active
started_at: "2026-11-13T21:59:46Z"
ended_at: —
review: agent
preview: none
protocol: standard
---
# T0034: Replace the app's shared components with the vendored ones and import the public bright look entry point

## Goals
Replace the app's own copies of the shared components with the vendored ones, per [components.md](../../../support.webapp/docs/specs/components.md).
They cover the live region, the offline indicator, the service worker update prompt, and any toast or dialog the app builds itself.
Switch `css/style.css` to the public `looks/bright/index.css`, ending the direct import of private files ([ADR-0005](../../../support.webapp/docs/adrs/ADR-0005-distribution-and-versioning.md)).
Keep app-local components, such as the forecast chart, in the app.
Prove a lossless switch as [ADR-0007](../../../support.webapp/docs/adrs/ADR-0007-documentation-and-verification.md) requires, with T0032's proof harness.

## Task Execution Steps
- [ ] **[Read]**      Inventory the app's components against the vendored component list.
- [ ] **[Implement]** Author tests for each component the app now takes from the vendored copy.
- [ ] **[Verify]**    Run the new tests and confirm they fail before the switch.
- [ ] **[Implement]** Replace the app's copies and switch `style.css` to the public bright entry point.
- [ ] **[Verify]**    Run the full tests and the lossless switch proof with T0032's harness.
- [ ] **[Doc]**       Update documentation and CHANGELOG.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-11-13] **[Doc]**
  Companion task file scaffolded at task creation.
