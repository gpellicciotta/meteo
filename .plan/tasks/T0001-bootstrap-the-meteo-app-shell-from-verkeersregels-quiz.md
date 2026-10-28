---
id: T0001
owner: "@claude-code"
needs: []
branch: —
worktree: —
status: active
started_at: "2026-10-28T11:06:38Z"
ended_at: —
review: agent
preview: none
protocol: standard
---
# T0001: Bootstrap the meteo app shell from verkeersregels-quiz without the quiz-only features

## Goals
Start meteo from the verkeersregels-quiz application shell so it keeps the same minimal look.
Keep the start, About and Settings views, theming, the language switch, the changelog and the PWA support.
Drop every quiz-only feature: quiz, results, carousel, statistics, issue reports, sign printing and sharing.
Offer only Dutch and English, and leave an empty start view ready for the forecast feature in T0002.

## Task Execution Steps
- [x] **[Implement]** Run the bootstrap script and commit its mechanical output separately.
- [x] **[Implement]** Author the Vitest shell tests and the Playwright browser script.
- [x] **[Verify]**    Run the tests and confirm they fail before the shell is complete.
- [x] **[Implement]** Write the slim markup, modules, strings and service worker generator changes.
- [x] **[Verify]**    Run the unit tests and the browser script until both pass.
- [x] **[Visual]**    Capture light and dark screenshots on desktop and mobile.
- [x] **[Doc]**       Write README.md, CHANGELOG.md and CHANGELOG.nl.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-10-28] **[Verify]**
  Red phase: six of seven shell unit tests and the browser script failed before the shell existed.
  - vitest: 6 failed, 1 passed.
  - shell-browser.mjs: #start-title missing, exit 1.

- [2026-10-28] **[Implement]**
  Logged undeclared test files tests/browser-harness.mjs and tests/shell-browser.mjs; the count rises to 20 files.
  - Size note: above the large line by file count only.
  - Estimate stays far below three times 900 lines.

- [2026-10-28] **[Implement]**
  Reran the bootstrap script with the quiz icons as placeholders, so pages and the service worker resolve until T0004.

- [2026-10-28] **[Verify]**
  Seven Vitest tests and the shell browser script passed with zero console or network errors.
  - Screenshots and outputs in validation-proof.md.

- [2026-10-28] **[Doc]**
  Size note: the hand diff reached 20 files and 1130 lines, above the large line but under three times the estimate.

