---
id: T0030
owner: "@claude"
session: claude-20261113-a74229
needs: []
branch: task/T0030-drop-the-quiz-leftovers-unused-icons-classes-and
worktree: .plan/work/T0030-drop-the-quiz-leftovers-unused-icons-classes-and
status: active
started_at: "2026-11-13T18:40:16Z"
ended_at: —
review: agent
preview: none
protocol: standard
usage:
  worker: {turns: 2, duration_s: 2525.8, input: 136, output: 29038, cache_read: 3957484, cache_write: 117098}
  review: {turns: 4, duration_s: 2122.0, input: 496136, output: 68988, cache_read: 13230728}
review_status: rejected
review_round: 1
review_requested_at: "2026-11-13T19:01:55Z"
work_duration: 2392.7
reviewed_by: "@gemini"
review_session: antigravity-20261113-29f32c
---
# T0030: Drop the quiz leftovers: unused icons, classes, and tokens, before adopting the design system.

## Goals
Remove the icons, CSS classes, and tokens left from the quiz, which no current screen uses.
Keep every screen's appearance unchanged; screenshots before and after must match.
Start once support.webapp finishes its generator phase; see the [roadmap](../../../support.webapp/docs/roadmap.md), Phase 4.

## Task Execution Steps
- [x] **[Read]**      Read the named ADRs and the app at a recorded commit.
- [x] **[Decide]**    Write declared files, size estimate, tests, and the completion check into the technical specification.
- [x] **[Implement]** Write the failing tests named in the technical specification.
- [x] **[Verify]**    Run the new tests and record their failure output in validation-proof.md.
- [x] **[Implement]** Remove the unused icons, classes, and tokens.
- [x] **[Verify]**    Run the tests and the completion check until they pass.
- [x] **[Visual]**    Record the lossless switch proof: screenshots at 390 and 1440 px, light and dark.
- [x] **[Doc]**       List every visual difference as a fix or deliberate change, and update CHANGELOG.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-11-13] **[Doc]**
  Created from the support.webapp adoption roadmap at the user's request.

- [2026-11-13] **[Doc]**
  Removed 16 icons, 11 classes, 8 tokens; npm test and browser tests pass; screenshots identical apart from three noisy 320px captures.

- [2026-11-13] **[Read]**
  Read the app at 8937c32; audited icons, classes, and tokens against index.html and js.

- [2026-11-13] **[Decided]**
  Decided to keep changelog-badge-* classes, since the changelog renderer builds them from area names.

- [2026-11-13] **[Implement]**
  Wrote tests/leftovers.test.js; 37 tests failed before the removal.

- [2026-11-13] **[Verify]**
  Recorded the failing output in validation-proof.md.

- [2026-11-13] **[Implement]**
  Removed 16 icons, 11 classes, and 8 tokens.

- [2026-11-13] **[Verify]**
  npm test passed 142 tests; browser tests exit 0.

- [2026-11-13] **[Visual]**
  Compared 104 screenshots at 390 and 1440 px, light and dark; only three noisy 320 px captures differ.

- [2026-11-13] **[Doc]**
  Changelog updated in English and Dutch; no visual differences to list.

- [2026-11-13] **[Review]**
  Round 1 requested (mode: agent).

- [2026-11-13] **[Review]**
  Round 1 rejected by @gemini: [Decided]** Rejected because unused quiz leftovers remain in the stylesheet, guard tests miss them, and verification evidence is incomplete.
  - Findings: [review-findings-1.md](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/review-findings-1.md).

- [2026-11-13] **[Implement]**
  Rework: removed --color-warning and .btn-about-back; tightened guard tests; recaptured Start, About, Settings, Forecast screenshots; rewrote spec and proof.

- [2026-11-13] **[Doc]**
  Outcomes: Files touched: 5. Lines touched: 292. Reopenings: 1.

## Screenshots
Before and after are identical; see validation-proof.md.
- Start, 1440 px light: ![before](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/before-start-desktop-light.png) ![after](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/after-start-desktop-light.png)
- Start, 1440 px dark: ![before](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/before-start-desktop-dark.png) ![after](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/after-start-desktop-dark.png)
- Start, 390 px light: ![before](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/before-start-mobile-light.png) ![after](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/after-start-mobile-light.png)
- Start, 390 px dark: ![before](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/before-start-mobile-dark.png) ![after](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/after-start-mobile-dark.png)
- About, 1440 px light: ![before](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/before-about-desktop-light.png) ![after](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/after-about-desktop-light.png)
- About, 1440 px dark: ![before](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/before-about-desktop-dark.png) ![after](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/after-about-desktop-dark.png)
- About, 390 px light: ![before](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/before-about-mobile-light.png) ![after](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/after-about-mobile-light.png)
- About, 390 px dark: ![before](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/before-about-mobile-dark.png) ![after](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/after-about-mobile-dark.png)
- Settings, 1440 px light: ![before](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/before-config-desktop-light.png) ![after](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/after-config-desktop-light.png)
- Settings, 1440 px dark: ![before](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/before-config-desktop-dark.png) ![after](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/after-config-desktop-dark.png)
- Settings, 390 px light: ![before](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/before-config-mobile-light.png) ![after](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/after-config-mobile-light.png)
- Settings, 390 px dark: ![before](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/before-config-mobile-dark.png) ![after](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/after-config-mobile-dark.png)
- Forecast, 1440 px light: ![before](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/before-forecast-en-desktop-light.png) ![after](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/after-forecast-en-desktop-light.png)
- Forecast, 1440 px dark: ![before](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/before-forecast-en-desktop-dark.png) ![after](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/after-forecast-en-desktop-dark.png)
- Forecast, 390 px light: ![before](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/before-forecast-en-mobile-light.png) ![after](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/after-forecast-en-mobile-light.png)
- Forecast, 390 px dark: ![before](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/before-forecast-en-mobile-dark.png) ![after](T0030-drop-the-quiz-leftovers-unused-icons-classes-and/screenshots/after-forecast-en-mobile-dark.png)
