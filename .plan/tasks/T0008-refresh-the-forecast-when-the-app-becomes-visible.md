---
id: T0008
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
# T0008: Refresh the forecast when the app becomes visible again and the shown data is older than 15 minutes

## Goals
An installed app on a phone resumes from memory instead of reloading.
The chart then shows hours that already passed, with only the update time hinting at it.
Reload the shown place quietly when the page becomes visible and its forecast is older than 15 minutes.
Add no new UI; the existing update time already tells when the data was fetched.
Specifications: [technical-spec.md](T0008-refresh-the-forecast-when-the-app-becomes-visible/technical-spec.md).

## Task Execution Steps
- [ ] **[Implement]** Add the isStale unit tests and the visibility refresh browser scenario.
- [ ] **[Verify]**    Run the tests and confirm the new checks fail.
- [ ] **[Implement]** Add isStale and the quiet refresh on visibility and pageshow events.
- [ ] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [ ] **[Doc]**       Update CHANGELOG.md and CHANGELOG.nl.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.
