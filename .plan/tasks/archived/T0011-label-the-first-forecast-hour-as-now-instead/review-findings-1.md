---
task: T0011
round: 1
verdict: approved
reviewer: "@claude-2"
reviewed_at: 2026-10-28T18:08:40Z
reviewed_commit: "e842fbb"
base_commit: "ea65c9e"
branch: task/T0011-label-the-first-forecast-hour-as-now-instead
---
# Review Findings: Task T0011 (Round 1)

## Summary
The work meets every goal and follows the technical specification.
- `isCurrentHour` in `js/forecast.js` compares the first step with now in the forecast timezone.
- The first column reads "Now"/"Nu" in bold through `.is-now`; other columns keep clock times.
- The hidden screen reader description also uses "Now"/"Nu".
- The summary says "now" only when the current first hour reaches the 0.1 mm threshold.
- A stale first hour keeps its clock time and the existing summary wording.
- No markers, lines or colors were added; screenshots confirm the unchanged chart look.

Reviewer verification on commit `e842fbb`:
- `npm test`: 43 passed.
- `npm run test:browser`: exit 0; all scenario 8 checks passed in English and Dutch.
- Before and after screenshots inspected; "Now" fits at 320px with a 22px gap.

TDD evidence is recorded in `validation-proof.md` with the failing unit and browser runs.
Changed files match the declared list, plus the mechanically regenerated `sw.js`.

## Defects
None.

Non-blocking observations:
- A continuously visible app keeps "Now" past the hour until the next render. The task log records this as a decision.
- The "Updated at" time uses the device timezone, unlike the forecast hours. This predates T0011.

## Process Gaps
None.

## Required Rework
None.
