---
id: T0002
owner: "@claude-code"
needs: []
branch: —
worktree: —
status: active
started_at: "2026-10-28T11:22:33Z"
ended_at: —
review: agent
preview: none
protocol: standard
review_status: approved
review_round: 2
reviewed_by: "@claude-2"
---
# T0002: Add the twelve-hour temperature and hourly rain forecast view using Open-Meteo

## Goals
Let a user enter a place name or use the current location on the start view.
Show the temperature and, most prominently, the hourly rain forecast for the next 12 hours.
Fetch everything straight from the free Open-Meteo APIs in the browser, without a server.
Offer the view in Dutch and English and credit Open-Meteo as its CC BY 4.0 license requires.

## Task Execution Steps
- [x] **[Implement]** Author the Vitest forecast tests and the Playwright forecast scenario.
- [x] **[Verify]**    Run both and confirm they fail before the feature exists.
- [x] **[Implement]** Implement the forecast, API, geolocation and view modules with markup and strings.
- [x] **[Verify]**    Run all unit tests and browser scripts until they pass.
- [x] **[Verify]**    Confirm a live Open-Meteo request renders real data for Brussels.
- [x] **[Visual]**    Capture light and dark screenshots on desktop and mobile in both languages.
- [x] **[Doc]**       Update README.md, CHANGELOG.md and CHANGELOG.nl.md.
- [x] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-10-28] **[Verify]**
  Red phase: the forecast unit suite failed to import missing modules and all three browser scenarios timed out on missing controls.

- [2026-10-28] **[Implement]**
  Logged undeclared files js/icons.js (new locate icon) and package.json (browser test script); js/preferences.js needed no change.

- [2026-10-28] **[Verify]**
  21 unit tests, both browser scripts and a live Brussels check passed with zero console or network errors.
  - Outputs and screenshots in validation-proof.md.

- [2026-10-28] **[Visual]**
  Fixed clipped centered content and misaligned chart rows found in the screenshots.
  - [Before desktop](T0002-add-the-twelve-hour-temperature-and-hourly-rain/screenshots/before-start-desktop-light.png).
  - [After desktop](T0002-add-the-twelve-hour-temperature-and-hourly-rain/screenshots/forecast-en-desktop-light.png).

- [2026-10-28] **[Doc]**
  Size note: 17 files and 1366 lines, above the large line but under three times the estimate; 123 lines are removed quiz CSS.

- [2026-10-28] **[Review]**
  Round 1 requested (mode: agent).

- [2026-10-28] **[Review]**
  Round 1 rejected by @claude-2: Chart accessibility, stale language after switching, and several low-severity UX gaps.
  - Findings: [review-findings-1.md](T0002-add-the-twelve-hour-temperature-and-hourly-rain/review-findings-1.md).

- [2026-10-28] **[Verify]**
  Rework red phase: the unanswered-prompt timeout test and the screen reader description check failed.
  - vitest: 1 failed, 23 passed.
  - forecast-browser: .sr-only description missing.

- [2026-10-28] **[Implement]**
  Reworked review round 1: screen reader descriptions, language-aware place and messages, stale-search guard, 24-hour time, rain label threshold, geolocation timeout, visible attribution.

- [2026-10-28] **[Review]**
  Round 2 requested (mode: agent).

- [2026-10-28] **[Review]**
  Round 2 approved by @claude-2.
  - Findings: [review-findings-2.md](T0002-add-the-twelve-hour-temperature-and-hourly-rain/review-findings-2.md).

- [2026-10-28] **[Doc]**
  Size note: review rework raised the diff to 18 files and 1659 lines, still under three times the 950-line estimate.

- [2026-10-28] **[Verify]**
  Recorded task outcomes.
  - Files touched: 18.
  - Lines touched: 1659.
  - Reopenings: 0.

