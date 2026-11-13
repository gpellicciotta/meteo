---
id: T0035
owner: "@codex"
needs: []
branch: task/T0035-move-the-icons-to-the-vendored-external-icon
worktree: .plan/work/T0035-move-the-icons-to-the-vendored-external-icon
status: active
started_at: "2026-11-13T22:59:52Z"
ended_at: —
review: agent
preview: none
protocol: standard
---
# T0035: Move the icons to the vendored external icon sprite, keeping each icon's appearance

## Goals
Move the inline icon definitions in `js/icons.js` to the vendored external icon sprite, as T0177 does in family-portal.
Run the design system's recorded migration command, and keep every icon's size, stroke, and color unchanged.
Keep weather-specific icons the sprite lacks in an app-local sprite file.
Prove a lossless switch as [ADR-0007](../../../support.webapp/docs/adrs/ADR-0007-documentation-and-verification.md) requires, with T0032's proof harness.

## Task Execution Steps
- [ ] **[Read]**      Map each icon in `js/icons.js` to the vendored sprite or an app-local symbol.
- [ ] **[Implement]** Author tests that every icon reference resolves to a sprite symbol.
- [ ] **[Verify]**    Run the new tests and confirm they fail before the migration.
- [ ] **[Implement]** Migrate the icons with the recorded command and remove the inline definitions.
- [ ] **[Verify]**    Run the full tests and compare icon screenshots before and after.
- [ ] **[Doc]**       Update documentation and CHANGELOG.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-11-13] **[Doc]**
  Companion task file scaffolded at task creation.
