---
task: T0008
round: 1
verdict: approved
reviewer: "@claude-2"
reviewed_at: 2026-10-28T17:57:27Z
reviewed_commit: "5f67dc5"
base_commit: "fd53a5d"
branch: task/T0008-refresh-the-forecast-when-the-app-becomes-visible
---
# Review Findings: Task T0008 (Round 1)

## Summary
The work meets every goal and decided specification.
- `isStale` and `STALE_AFTER_MS` live in `js/forecast.js` as a pure, unit-tested rule.
- `visibilitychange` to visible and persisted `pageshow` both call `refreshIfStale`.
- The refresh skips without a place, while offline, during a user request, or during another refresh.
- A quiet load shows no status line and keeps the chart, update time, and error state on failure.
- A quiet load keeps `view.place`, so a concurrent language rename survives.
- User actions bump `requestId`, so they still drop a late background answer.
- No new UI was added; both changelogs gained one entry.

Reviewer runs on commit `5f67dc5`:
- `npm test`: 2 files, 39 tests passed.
- `npm run test:browser`: exit 0, 138 `ok` checks, including all 9 refresh scenario checks.

The validation proof shows both new test sets failing before the implementation.
The browser scenario goes beyond the spec, covering back-forward cache restore and the offline guard.

## Defects
- Minor, non-blocking: the committed `sw.js` cache hash does not match its committed inputs.
  - `generate-sw.py` was run before the CHANGELOG edits, and the hash covers both changelogs.
  - Regenerating on a copy of the worktree gives `meteo-v0.1.1-pre-ada32bcb1d7c5429`.
  - The committed value is `meteo-v0.1.1-pre-4078f0d6dc076494`.
  - Swapping in only main's changelogs reproduces the committed hash exactly.
  - Impact is low: the cache name still differs from main, so clients install a fresh worker.
  - Main's committed `sw.js` drifts from its own regenerated output too, so the pattern predates this task.

## Process Gaps
- The mechanical `generate-sw.py` step ran before the `[Doc]` changelog step instead of last.
- No test covers a user search that starts during a background refresh.
  - The spec relies on the existing request id and lists no such test, so this is not a gap against the spec.

## Required Rework
None.
Optional: rerun `python scripts/generate-sw.py generate` before merging so `sw.js` matches the final tree.
