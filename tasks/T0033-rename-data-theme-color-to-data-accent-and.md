---
id: T0033
owner: ~
needs: [T0032]
branch: —
worktree: —
status: ready
started_at: —
ended_at: —
review: agent
preview: none
protocol: standard
---
# T0033: Rename data-theme-color to data-accent and document every palette override and AA exception.

## Goals
Rename the `data-theme-color` attribute to `data-accent`, keeping the accent names as values.
List every palette override and deliberate AA exception in meteo's style guide, including white labels on yellow.
Follow [ADR-0002](../../../support.webapp/docs/adrs/ADR-0002-looks.md).
Prove a lossless switch as [ADR-0007](../../../support.webapp/docs/adrs/ADR-0007-documentation-and-verification.md) requires.

## Task Execution Steps
- [ ] **[Read]**      Read the named ADRs and the app at a recorded commit.
- [ ] **[Decide]**    Write declared files, size estimate, tests, and the completion check into the technical specification.
- [ ] **[Implement]** Write the failing tests named in the technical specification.
- [ ] **[Verify]**    Run the new tests and record their failure output in validation-proof.md.
- [ ] **[Implement]** Rename the attribute and document the overrides and AA exceptions.
- [ ] **[Verify]**    Run the tests, the vendored check, and the completion check until they pass.
- [ ] **[Visual]**    Record the lossless switch proof: screenshots at 390 and 1440 px, light and dark.
- [ ] **[Doc]**       List every visual difference as a fix or deliberate change, and update CHANGELOG.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-11-13] **[Doc]**
  Created from the support.webapp adoption roadmap at the user's request.
