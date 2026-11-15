---
id: T0034
owner: "@codex"
session: codex-20261113-afc2ca
needs: []
branch: task/T0034-replace-the-app-s-shared-components-with-the
worktree: .plan/work/T0034-replace-the-app-s-shared-components-with-the
status: completed
started_at: "2026-11-15T08:05:30Z"
ended_at: "2026-11-15T08:11:39Z"
review: agent
preview: none
protocol: standard
usage:
  worker: {turns: 6, duration_s: 6999.2, input: 157410, output: 15864, cache_read: 4527616, cache_write: 0}
work_duration: 3589.2
contributors: "@claude"
size_status: approved
size_approved: 23 files, 650 lines
size_approved_by: "@giova"
size_approved_at: "2026-11-15T08:05:42Z"
review_status: approved
review_round: 2
review_requested_at: "2026-11-15T08:10:05Z"
review_session: codex-20261115-3196d3
size_estimate: 23 files, 650 lines
reviewed_by: "@codex"
completion-commit: 4d1614bd3826b06c04bfd59a5d24f78fa06af32d
---
# T0034: Replace the app's shared components with the vendored ones and import the public bright look entry point

## Goals
Replace the app's own copies of the shared components with the vendored ones, per [components.md](../../../support.webapp/docs/specs/components.md).
They cover the live region, the offline indicator, the service worker update prompt, and any toast or dialog the app builds itself.
Switch `css/style.css` to the public `looks/bright/index.css`, ending the direct import of private files ([ADR-0005](../../../support.webapp/docs/adrs/ADR-0005-distribution-and-versioning.md)).
Keep app-local components, such as the forecast chart, in the app.
Prove a lossless switch as [ADR-0007](../../../support.webapp/docs/adrs/ADR-0007-documentation-and-verification.md) requires, with T0032's proof harness.

## Task Execution Steps
- [x] **[Read]**      Inventory the app's components against the vendored component list.
- [x] **[Implement]** Author tests for each component the app now takes from the vendored copy.
- [x] **[Verify]**    Run the new tests and confirm they fail before the switch.
- [x] **[Implement]** Replace the app's copies and switch `style.css` to the public bright entry point.
- [x] **[Verify]**    Run the full tests and the lossless switch proof with T0032's harness.
- [x] **[Doc]**       Update documentation and CHANGELOG.md.
- [x] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-11-13] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-11-13] **[Read]**
  Inventoried meteo against components.md: offline indicator, silent worker update, and the empty toast region map to vendored parts.
  - Tooltips, buttons, fields stay app-local: outside the named scope.
  - Vendored .icon would resize meteo icons: rename to app-icon.

- [2026-11-13] **[Implement]**
  Wrote failing unit tests, the update browser scenario, and extended the switch proof with icons and an offline page.
  - tests/pwa.test.js, tests/update-browser.mjs added.

- [2026-11-13] **[Verify]**
  Recorded the failure output of the new tests in validation-proof.md; captured proof/before at 7857b0d.
  - 18 unit tests and the update scenario fail.
  - Fixed CRLF parsing in tests/accent.test.js, undeclared.

- [2026-11-13] **[Verify]**
  Passed 187 unit tests, browser suites, design integrity/conformance, Markdown lint, and switch comparison. Full check blocked by existing recursive release tests; step 5 remains unchecked. Evidence and screenshots saved in validation-proof.md.

- [2026-11-13] **[Verify]**
  Size note: 18 counted files, 352 changed lines; shared adoption remains one concern. Added style-guide documentation, browser coverage, package script, and CRLF test repair beyond the original declaration. Generated sw.js is excluded.
  - Files touched: 18.
  - Lines touched: 352.
  - Reopenings: 0.

- [2026-11-13] **[Verify]**
  Committed documentation and refreshed cache as 6f29f5e; implementation is in ba4bf08. Completion validation reports only TF022 because verification and review remain unchecked. Needs review: required full-check verification cannot finish until release-test recursion is resolved or waived.

- [2026-11-13] **[Verify]**
  Confirmed no remaining descendants from the recursive test tree. Normal task validation passed; completion validation remains blocked by unchecked verification. Implementation and documentation are committed; working tree is clean.

- [2026-11-14] **[Size]**
  Size approved by @giova for 19 files, 420 lines.

- [2026-11-14] **[Decide]**
  Resumed after T0037 (e3afe76): devops.py now runs on pinned support-python 3.2.0, so the full check no longer recurses. Rebase onto main before rerunning it.

- [2026-11-15] **[Verify]**
  Rebased onto main 6516248; preserved unexplained deletions in a stash. Full check passed: 46 Python and 211 JavaScript tests. Design check passed; switch proof has zero differing properties. Adapted the newly inherited icon test to the removed wifi icon.

- [2026-11-15] **[Verify]**
  Fixed a duplicate sprite URL introduced while resolving cache conflicts, after recording a failing regression. All 212 unit tests and the update browser scenario pass. Shell and forecast browser suites passed. Added tests/icons.test.js to the files touched.

- [2026-11-15] **[Verify]**
  Final full check passed after cache correction: 46 Python and 212 JavaScript tests. Task validation passed. Required verification is complete; requesting independent agent review.

- [2026-11-15] **[Review]**
  Round 1 requested (mode: agent).

- [2026-11-15] **[Review]**
  Launched independent review round 1 with plan agents review T0034 --sandbox. Parent PID 22460; reviewer PID 44972. Execution session 88444. Rebased task head is 3cff0a8.

- [2026-11-15] **[Review]**
  Round 1 rejected by @gemini: Rejected due to two behavioral defects in the adopted toast integration and one leftover sprite symbol from rebasing onto T0035.
  - Findings: [review-findings-1.md](T0034-replace-the-app-s-shared-components-with-the/review-findings-1.md).

- [2026-11-15] **[Size]**
  Size approval requested for 23 files, 650 lines.
  - Excluded from size: sw.js (mechanical).

- [2026-11-15] **[Size]**
  Size approved by @giova for 23 files, 650 lines.

- [2026-11-15] **[Implement]**
  Addressed round 1 findings with startup ordering, live toast translations, consumed Escape handling, and unused sprite removal. Added unit and browser regressions. Running python scripts/devops.py check (session 33686) and npm run test:browser (session 33284).

- [2026-11-15] **[Verify]**
  Round 1 rework passes the full check and complete browser suite, including startup language, live translation, and Escape regressions. Recorded red and green evidence. Outcomes: 22 counted files, 388 changed lines, zero reopenings.

- [2026-11-15] **[Review]**
  Round 2 requested (mode: agent).

- [2026-11-15] **[Review]**
  Requested round 2 through plan agents review T0034 --sandbox --agent codex. Reviewer PID 2144, execution session 28820; reviewed head 5f058bc. Scope remains within the approved 23 files and 650 lines.

- [2026-11-15] **[Review]**
  Round 2 approved by @codex: Approved.
  - Findings: [review-findings-2.md](T0034-replace-the-app-s-shared-components-with-the/review-findings-2.md).

- [2026-11-15] **[Complete]**
  Task completed successfully.

