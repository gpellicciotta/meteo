---
id: T0030
owner: ~
needs: []
branch: —
worktree: —
status: ready
started_at: —
ended_at: —
review: agent
preview: none
protocol: standard
---
# T0030: Drop the quiz leftovers: unused icons, classes, and tokens, before adopting the design system.

## Goals
Remove the icons, CSS classes, and tokens left from the quiz, which no current screen uses.
Keep every screen's appearance unchanged; screenshots before and after must match.
Start once support.webapp finishes its generator phase; see the [roadmap](../../../support.webapp/docs/roadmap.md), Phase 4.

## Task Execution Steps
- [ ] **[Read]**      Read the named ADRs and the app at a recorded commit.
- [ ] **[Decide]**    Write declared files, size estimate, tests, and the completion check into the technical specification.
- [ ] **[Implement]** Write the failing tests named in the technical specification.
- [ ] **[Verify]**    Run the new tests and record their failure output in validation-proof.md.
- [ ] **[Implement]** Remove the unused icons, classes, and tokens.
- [ ] **[Verify]**    Run the tests and the completion check until they pass.
- [ ] **[Visual]**    Record the lossless switch proof: screenshots at 390 and 1440 px, light and dark.
- [ ] **[Doc]**       List every visual difference as a fix or deliberate change, and update CHANGELOG.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-11-13] **[Doc]**
  Created from the support.webapp adoption roadmap at the user's request.
