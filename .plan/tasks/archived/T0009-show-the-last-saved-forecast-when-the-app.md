---
id: T0009
owner: "@claude"
session: claude-20261028-777a80
needs: []
branch: task/T0009-show-the-last-saved-forecast-when-the-app
worktree: .plan/work/T0009-show-the-last-saved-forecast-when-the-app
status: completed
started_at: "2026-10-28T18:09:05Z"
ended_at: "2026-10-28T18:29:46Z"
review: agent
preview: none
protocol: standard
usage:
  worker: {turns: 2, duration_s: 909.4, input: 148, output: 60152, cache_read: 8394611, cache_write: 145772}
  review: {turns: 2, duration_s: 271.0, input: 50, output: 13772, cache_read: 1164456, cache_write: 88974}
review_status: approved
review_round: 2
work_duration: 1240.0
reviewed_by: "@claude-2"
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
- [x] **[Implement]** Add the unit tests and the offline start browser scenarios.
- [x] **[Verify]**    Run the tests and confirm the new checks fail.
- [x] **[Implement]** Request 25 steps, add visibleHours, and save and restore the last forecast.
- [x] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [x] **[Visual]**    Capture screenshots of an offline start in light and dark on desktop and phone.
- [x] **[Doc]**       Update CHANGELOG.md, CHANGELOG.nl.md and the How It Works list in README.md.
- [x] **[Implement]** Address review round 1: drop past hours on failed or skipped refreshes.
- [x] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-10-28] **[Verify]**
  Added unit tests and offline-start browser scenarios; ten unit tests and three browser checks failed as expected.
  - Evidence is in validation-proof.md under Red Phase.

- [2026-10-28] **[Implement]**
  Requested 25 hourly steps, added visibleHours, placeKey and restoreForecast, and saved and restored the last forecast.
  - Startup shows a saved forecast only with at least 6 visible hours.
  - A failed load of the shown place below 6 hours hides the chart.
  - Existing browser scenarios now pin the page clock to 10:20 Brussels.

- [2026-10-28] **[Verify]**
  npm test and npm run test:browser passed with 51 unit tests and 163 browser checks.
  - Command: npm test && npm run test:browser, exit code 0.
  - Verbatim output is in validation-proof.md under Green Phase.

- [2026-10-28] **[Visual]**
  Captured offline-start screenshots in light and dark on desktop and phone, before and after.
  - Before: empty view with the network error, in before/.
  - After: saved chart from Now with update time 10:20, in after/.
  - Routes are aborted, so navigator.onLine stays true and no offline banner shows.

- [2026-10-28] **[Doc]**
  Updated CHANGELOG.md, CHANGELOG.nl.md and the How It Works list in README.md, and regenerated sw.js.
  - Command: python scripts/generate-sw.py generate.

- [2026-10-28] **[Visual]**
  Linked the offline-start screenshots before and after the change.
  - [Before phone](T0009-show-the-last-saved-forecast-when-the-app/before/offline-start-mobile-light.png).
  - [Before desktop dark](T0009-show-the-last-saved-forecast-when-the-app/before/offline-start-desktop-dark.png).
  - [After phone](T0009-show-the-last-saved-forecast-when-the-app/after/offline-start-mobile-light.png).
  - [After desktop dark](T0009-show-the-last-saved-forecast-when-the-app/after/offline-start-desktop-dark.png).

- [2026-10-28] **[Review]**
  Round 1 requested (mode: agent).

- [2026-10-28] **[Review]**
  Round 1 rejected by @claude-2: Rejected for one defect against the goal "the chart never shows the past".
  - Findings: [review-findings-1.md](T0009-show-the-last-saved-forecast-when-the-app/review-findings-1.md).

- [2026-10-28] **[Implement]**
  Addressed review round 1: resuming and failed refreshes now re-render from the current hour.
  - Added handleResume and showRemainingHours in js/forecast-view.js.
  - Offline resume below 6 remaining hours shows the network error.
  - Added README.md to Declared Files and recorded the resume decision.

- [2026-10-28] **[Verify]**
  Scenario 10 failed four checks before the fix and passed after it, with 166 browser checks green.
  - Command: npm test && npm run test:browser, exit code 0.
  - Red and green output is in validation-proof.md under Review Round 1 Rework.

- [2026-10-28] **[Review]**
  Round 2 requested (mode: agent).

- [2026-10-28] **[Review]**
  Round 2 approved by @claude-2: Approved: all four round 1 rework items are done, and the goals are met.
  - Findings: [review-findings-2.md](T0009-show-the-last-saved-forecast-when-the-app/review-findings-2.md).

- [2026-10-28] **[Complete]**
  Task completed successfully.

