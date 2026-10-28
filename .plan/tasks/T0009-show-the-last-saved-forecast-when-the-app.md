---
id: T0009
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
# T0009: Show the last saved forecast when the app starts offline or a refresh fails

## Goals
The app shell works offline, but only the last place is saved, not its forecast.
Offline starts therefore show the offline banner, a network error and an empty view.
Save the last forecast with its fetch time and show it when loading fails.
Drop hours that already passed, so the chart never shows the past.
Add no new UI; the offline banner and the update time explain the situation.
Specifications: [technical-spec.md](T0009-show-the-last-saved-forecast-when-the-app/technical-spec.md).

## Task Execution Steps
- [ ] **[Implement]** Add the unit tests and the offline start browser scenarios.
- [ ] **[Verify]**    Run the tests and confirm the new checks fail.
- [ ] **[Implement]** Request 25 steps, add visibleHours, and save and restore the last forecast.
- [ ] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [ ] **[Visual]**    Capture screenshots of an offline start in light and dark on desktop and phone.
- [ ] **[Doc]**       Update CHANGELOG.md, CHANGELOG.nl.md and the How It Works list in README.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.
