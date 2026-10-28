---
id: T0011
owner: ~
needs: [T0008]
branch: —
worktree: —
status: ready
started_at: —
ended_at: —
review: agent
preview: none
protocol: standard
---
# T0011: Label the first forecast hour as now instead of its clock time

## Goals
Make it obvious at a glance which bar is the current hour.
Replace the clock time under the first column with "Now" ("Nu" in Dutch), in bold.
Say "now" in the summary when rain is already falling in the current hour.
Add no markers, lines or colors; the chart keeps its current look.
It needs T0008 so the first column is the current hour after the app resumes.
Specifications: [technical-spec.md](T0011-label-the-first-forecast-hour-as-now-instead/technical-spec.md).

## Task Execution Steps
- [ ] **[Visual]**    Capture before screenshots of the forecast on desktop and phone.
- [ ] **[Implement]** Add the current-hour unit tests and the Now label browser checks.
- [ ] **[Verify]**    Run the tests and confirm the new checks fail.
- [ ] **[Implement]** Add the current-hour check, the Now label, bold style and summary string.
- [ ] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [ ] **[Visual]**    Capture after screenshots in light and dark on desktop and phone.
- [ ] **[Doc]**       Update CHANGELOG.md and CHANGELOG.nl.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.
