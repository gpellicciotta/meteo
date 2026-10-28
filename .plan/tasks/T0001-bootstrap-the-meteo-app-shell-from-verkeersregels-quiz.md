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
- [ ] **[Implement]** Run the bootstrap script and commit its mechanical output separately.
- [ ] **[Implement]** Author the Vitest shell tests and the Playwright browser script.
- [ ] **[Verify]**    Run the tests and confirm they fail before the shell is complete.
- [ ] **[Implement]** Write the slim markup, modules, strings and service worker generator changes.
- [ ] **[Verify]**    Run the unit tests and the browser script until both pass.
- [ ] **[Visual]**    Capture light and dark screenshots on desktop and mobile.
- [ ] **[Doc]**       Write README.md, CHANGELOG.md and CHANGELOG.nl.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.
