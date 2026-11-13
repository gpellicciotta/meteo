---
id: T0035
owner: "@codex"
session: codex-20261113-f58fbf
needs: []
branch: task/T0035-move-the-icons-to-the-vendored-external-icon
worktree: .plan/work/T0035-move-the-icons-to-the-vendored-external-icon
status: active
started_at: "2026-11-13T22:59:52Z"
ended_at: —
review: agent
preview: none
protocol: standard
usage:
  worker: {turns: 2, duration_s: 1627.0, input: 232568, output: 26842, cache_read: 7473664, cache_write: 0}
review_status: pending
review_round: 1
review_requested_at: "2026-11-13T23:13:34Z"
---
# T0035: Move the icons to the vendored external icon sprite, keeping each icon's appearance

## Goals
Move the inline icon definitions in `js/icons.js` to the vendored external icon sprite, as T0177 does in family-portal.
Run the design system's recorded migration command, and keep every icon's size, stroke, and color unchanged.
Keep weather-specific icons the sprite lacks in an app-local sprite file.
Prove a lossless switch as [ADR-0007](../../../support.webapp/docs/adrs/ADR-0007-documentation-and-verification.md) requires, with T0032's proof harness.

## Task Execution Steps
- [x] **[Read]**      Map each icon in `js/icons.js` to the vendored sprite or an app-local symbol.
- [x] **[Implement]** Author tests that every icon reference resolves to a sprite symbol.
- [x] **[Verify]**    Run the new tests and confirm they fail before the migration.
- [x] **[Implement]** Migrate the icons with the recorded command and remove the inline definitions.
- [x] **[Verify]**    Run the full tests and compare icon screenshots before and after.
- [x] **[Doc]**       Update documentation and CHANGELOG.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-11-13] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-11-14] **[Read]**
  Mapped four exact bright glyphs and eighteen app-local glyphs. Recorded reproducible migration and lossless proof scenarios.

- [2026-11-14] **[Verify]**
  Confirmed 24 failing regression tests before migration. Baseline browser capture session 15628 runs node tests/switch-proof.mjs --out companion/proof/before.

- [2026-11-14] **[Implement]**
  Ran node scripts/migrate-icons.mjs: four shared and eighteen local symbols. Preserved SVG presentation and precached both sprites. Browser captures show no computed style differences.

- [2026-11-14] **[Doc]**
  Updated the style guide and changelog. Retained all missing bright glyphs locally and documented the migration command.

- [2026-11-14] **[Verify]**
  JavaScript tests: 198 passed. Vendored checks, Ruff, syntax checks, and Markdown lint passed. Python discovery recursively launches release clones; stopped PID 77068 with processes kill --yes --force.

- [2026-11-14] **[Verify]**
  Force-stopped recursive Python descendants after the parent exited. Browser and lossless capture servers remain supervised until their checks finish.

- [2026-11-14] **[Verify]**
  Full browser suite passed. Inspected before/after phone light and desktop dark icons. Computed styles match exactly; screenshots and validation evidence are linked in validation-proof.md.

- [2026-11-14] **[Verify]**
  Recorded task outcomes.
  - Files touched: 11.
  - Lines touched: 335.
  - Reopenings: 0.

- [2026-11-14] **[Review]**
  Round 1 requested (mode: agent).

