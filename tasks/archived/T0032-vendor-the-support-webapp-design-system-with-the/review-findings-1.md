---
task: T0032
round: 1
verdict: rejected
reviewer: "@codex"
reviewed_at: 2026-11-13T21:12:12Z
reviewed_commit: "39a6858"
base_commit: "b766712"
branch: task/T0032-vendor-the-support-webapp-design-system-with-the
session: codex-20261113-89db46
session_agent: codex
session_created_at: 2026-11-13T21:09:35Z
---
# Review Findings: Task T0032 (Round 1)

## Summary
**[Decided]** Rejected because the required browser completion check failed during independent review.
The vendored copy, shell structure, palette overrides, width measurement, and recorded visual proof otherwise support the task goals.
Inspected the three commits, application diff, named ADRs, computed-style differences, and representative before-and-after screenshots.

Independent checks at 39a6858:
- `.venv/Scripts/python.exe scripts/devops.py check`: exit 0; lint, integrity, conformance, 28 Python tests, and 161 Vitest tests passed.
- `npm run test:browser`: exit 1; keyboard-focus assertion failed in forecast scenario 4.
- Isolated execution of the existing scenario 4 through Node: exit 0; the same focus assertion passed.

## Defects
- Blocking: the required browser suite failed at [forecast-browser.mjs](../../work/T0032-vendor-the-support-webapp-design-system-with-the/tests/forecast-browser.mjs:429).
  After resizing through 320x568, focusing the location input, and pressing Shift+Tab, the active element had no ID.
  The exact failure was:

  ```text
  Check failed: the focused icon button is named exactly once (, 1 match)
  ```

  The isolated scenario subsequently passed with `btn-current-location`; this establishes intermittent behavior, not a consistently broken accessible name.
  The cause remains unproven. A passing isolated run does not resolve the failed completion check.

## Process Gaps
- Non-blocking: [style.css](../../work/T0032-vendor-the-support-webapp-design-system-with-the/css/style.css:7) imports five private package layers.
  ADR-0005 permits only public entry points. The technical specification documents migration to the public entry point in T0034.
  Current integrity and conformance checks pass; this creates future upgrade coupling without demonstrating a current rendering defect.
- Non-blocking: the existing validation proof records a successful browser run, while this review encountered an intermittent failure.
  This difference does not establish that the earlier evidence was false.

## Required Rework
- Investigate the focus failure at 320x568 and resolve its cause in application behavior or test synchronization, as evidence warrants.
- Preserve the keyboard order and exact accessible-name assertion; do not silently retry or suppress the failure.
- Rerun the complete browser command after correction and record its exit code and verbatim result.
- If the failure is environmental or pre-existing, provide reproducing evidence and an explicit disposition before resubmitting.
