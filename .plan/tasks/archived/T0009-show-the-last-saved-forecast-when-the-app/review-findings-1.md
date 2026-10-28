---
task: T0009
round: 1
verdict: rejected
reviewer: "@claude-2"
reviewed_at: 2026-10-28T18:23:31Z
reviewed_commit: "8974e0b"
base_commit: "51e96b4"
branch: task/T0009-show-the-last-saved-forecast-when-the-app
---
# Review Findings: Task T0009 (Round 1)

## Summary
Rejected for one defect against the goal "the chart never shows the past".
Saving, restoring, the 25-step request, `visibleHours` and the startup paths work as specified.
`npm test` passed 51 tests and `npm run test:browser` passed 163 checks, both with exit code 0.
The after screenshots show the saved chart from "Now" with update time 10:20.

## Defects
1. **A failed background refresh keeps showing past hours.**
   - In `loadForecast` (`js/forecast-view.js`), the catch returns early when at least 6 hours remain.
   - It skips `renderForecast()`, so the chart keeps the hours rendered at the last fetch.
   - Reproduced with a script outside the repository, using the test harness and mocked Open-Meteo responses:
     - Loaded Gent at 10:20 Brussels time; the chart showed `Now, 11:00, 12:00`.
     - At 14:05, a `visibilitychange` refresh failed; the chart still showed `Now, 11:00, 12:00`.
     - The past 10:00 column kept its bold "Now" label, and the summary still covered past hours.
   - The goals name a failed refresh explicitly, and the spec claims `visibleHours` fixes the stale chart before a refresh.
2. **A resumed app that is offline also shows past hours** (same root cause).
   - `refreshIfStale` returns early while `navigator.onLine` is false and does not re-render.
   - Reproduced at 17:05 with the context offline: the chart still started at the 10:00 column, labeled "Now".
   - The 6-hour rule does not apply either, so a phone resuming offline next day shows yesterday's chart.
   - `initForecastView` names resume-from-memory as the main path of an installed app.

## Process Gaps
- Scenario 9 covers only the failed refresh below 6 hours; no check covers the case of 6 or more hours.
- The two refresh checks of scenario 9 have no red run, as `validation-proof.md` admits.
- `README.md` changed but is missing from Declared Files in `technical-spec.md`.

## Required Rework
1. Re-render the shown forecast when a load of the shown place fails with at least 6 hours left.
2. On resume (`visibilitychange` to visible and `pageshow` with `persisted`), apply `visibleHours` and the 6-hour rule even when no refresh runs.
   - Skipped refreshes include the offline case and the case of a non-stale forecast across an hour boundary.
3. Add browser checks, written and proven failing first:
   - A failed refresh with 6 or more hours left drops the past hours, with "Now" on the current hour.
   - An offline resume hours later drops the past hours, or shows the error below 6 hours.
4. Add `README.md` to Declared Files, and record the new red and green evidence in `validation-proof.md`.
