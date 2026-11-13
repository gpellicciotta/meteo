---
id: T0032
owner: "@claude"
needs: []
branch: task/T0032-vendor-the-support-webapp-design-system-with-the
worktree: .plan/work/T0032-vendor-the-support-webapp-design-system-with-the
status: active
started_at: "2026-11-13T20:09:59Z"
ended_at: —
review: agent
preview: none
protocol: standard
---
# T0032: Vendor the support.webapp design system with the bright look and move the three screens into its shell.

## Goals
Vendor the support.webapp release with the `bright` look, as [ADR-0005](../../../support.webapp/docs/adrs/ADR-0005-distribution-and-versioning.md) describes.
Move the three screens into the shell with `app--scroll-page` and `app--width-narrow`, per [ADR-0004](../../../support.webapp/docs/adrs/ADR-0004-app-shell.md).
Measure the main column against `--width-narrow` first, and propose a smaller width if needed.
Gain reduced-motion handling and visible focus rings through the shared components, and apply the assessed palette overrides.
Prove a lossless switch as [ADR-0007](../../../support.webapp/docs/adrs/ADR-0007-documentation-and-verification.md) requires.

## Task Execution Steps
- [ ] **[Read]**      Read the named ADRs and the app at a recorded commit.
- [ ] **[Decide]**    Write declared files, size estimate, tests, and the completion check into the technical specification.
- [ ] **[Implement]** Write the failing tests named in the technical specification.
- [ ] **[Verify]**    Run the new tests and record their failure output in validation-proof.md.
- [ ] **[Implement]** Vendor the release, move the screens into the shell, and apply the palette overrides.
- [ ] **[Verify]**    Run the tests, the vendored check, and the completion check until they pass.
- [ ] **[Visual]**    Record the lossless switch proof: screenshots at 390 and 1440 px, light and dark.
- [ ] **[Doc]**       List every visual difference as a fix or deliberate change, and update CHANGELOG.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-11-13] **[Doc]**
  Created from the support.webapp adoption roadmap at the user's request.
