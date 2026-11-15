---
id: T0032
owner: "@claude"
session: claude-20261113-c52ebd
needs: []
branch: task/T0032-vendor-the-support-webapp-design-system-with-the
worktree: .plan/work/T0032-vendor-the-support-webapp-design-system-with-the
status: completed
started_at: "2026-11-13T20:09:59Z"
ended_at: "2026-11-13T21:28:56Z"
review: agent
preview: none
protocol: standard
usage:
  worker: {turns: 6, duration_s: 8728.6, input: 276, output: 82324, cache_read: 49326552, cache_write: 201290}
  review: {turns: 4, duration_s: 603.4, input: 321152, output: 10874, cache_read: 3085312, cache_write: 0}
work_duration: 4737.1
review_status: approved
review_round: 2
review_requested_at: "2026-11-13T21:26:23Z"
review_session: codex-20261113-72e173
reviewed_by: "@codex"
completion-commit: 33c5cc9e7655dc9371405ed557a51306dbb9c1e4
---
# T0032: Vendor the support.webapp design system with the bright look and move the three screens into its shell.

## Goals
Vendor the support.webapp release with the `bright` look, as [ADR-0005](../../../../support.webapp/docs/adrs/ADR-0005-distribution-and-versioning.md) describes.
Move the three screens into the shell with `app--scroll-page` and `app--width-narrow`, per [ADR-0004](../../../../support.webapp/docs/adrs/ADR-0004-app-shell.md).
Measure the main column against `--width-narrow` first, and propose a smaller width if needed.
Gain reduced-motion handling and visible focus rings through the shared components, and apply the assessed palette overrides.
Prove a lossless switch as [ADR-0007](../../../../support.webapp/docs/adrs/ADR-0007-documentation-and-verification.md) requires.

## Task Execution Steps
- [x] **[Read]**      Read the named ADRs and the app at a recorded commit.
- [x] **[Decide]**    Write declared files, size estimate, tests, and the completion check into the technical specification.
- [x] **[Implement]** Write the failing tests named in the technical specification.
- [x] **[Verify]**    Run the new tests and record their failure output in validation-proof.md.
- [x] **[Implement]** Vendor the release, move the screens into the shell, and apply the palette overrides.
- [x] **[Verify]**    Run the tests, the vendored check, and the completion check until they pass.
- [x] **[Visual]**    Record the lossless switch proof: screenshots at 390 and 1440 px, light and dark.
- [x] **[Doc]**       List every visual difference as a fix or deliberate change, and update CHANGELOG.md.
- [x] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-11-13] **[Doc]**
  Created from the support.webapp adoption roadmap at the user's request.

- [2026-11-13] **[Read]**
  Read ADR-0002, 0004, 0005, 0007, components.md, and support.webapp v0.1.0 (30e1f96); read meteo at b766712.
  - Baseline: 145 vitest tests, 352 browser checks pass.
  - T0031 recommended overrides are the palette input.

- [2026-11-13] **[Decide]**
  Wrote declared files, decisions, size estimate of 17 files and 850 lines, tests, and the completion check into technical-spec.md.
  - Size note: above typical line, kept whole; see technical-spec.md.

- [2026-11-13] **[Implement]**
  Wrote failing unit tests, shell browser checks, and the reusable switch-proof harness.
  - tests/screens.test.js, tests/design.test.js, tests/switch-proof.mjs added.

- [2026-11-13] **[Verify]**
  Recorded the failure output of the new unit and browser tests in validation-proof.md.
  - 15 unit tests fail; shell browser checks fail.

- [2026-11-13] **[Implement]**
  Vendored support.webapp 0.1.0 bright, moved the screens into the shell, moved colors to tokens.css, and applied the T0031 overrides.
  - Dark blue fill and primary headings held for T0033.
  - Size note: 18 files, 958 lines; above typical, kept whole.

- [2026-11-13] **[Verify]**
  devops.py check, check.mjs, and npm run test:browser pass: 28 Python, 161 Vitest, 392 browser checks.
  - System Python with support-python 3.1.0 recursed; reran in the pinned .venv.
  - Follow-up: T0037.

- [2026-11-13] **[Visual]**
  Recorded before and after screenshots at 390 and 1440 px, light and dark, plus computed-style snapshots.
  - proof/before, proof/after, proof/style-diff.txt.

- [2026-11-13] **[Doc]**
  Listed every visual difference as a fix or deliberate change; updated README, CHANGELOG.md, and CHANGELOG.nl.md.
  - Files touched: 18.
  - Lines touched: 958.
  - Reopenings: 0.

- [2026-11-13] **[Decided]**
  Kept --width-narrow for the main column: 880 px against the old 888 px; no smaller width token is proposed.
  - Dark blue fill and primary headings wait for T0033.

- [2026-11-13] **[Review]**
  Round 1 requested (mode: agent).

- [2026-11-13] **[Review]**
  Round 1 rejected by @codex: [Decided]** Rejected because the required browser completion check failed during independent review.
  - Findings: [review-findings-1.md](T0032-vendor-the-support-webapp-design-system-with-the/review-findings-1.md).

- [2026-11-13] **[Verify]**
  Reproduced the round 1 focus failure as a resize-event race, also at the base commit; scenario 4 now waits for the page's resize event.
  - Repro: 4/30 failed before, 0/60 after.
  - npm run test:browser: exit 0, three runs, 392 checks.

- [2026-11-13] **[Review]**
  Round 2 requested (mode: agent).

- [2026-11-13] **[Review]**
  Round 2 approved by @codex: [Decided]** Approved.
  - Findings: [review-findings-2.md](T0032-vendor-the-support-webapp-design-system-with-the/review-findings-2.md).

- [2026-11-13] **[Complete]**
  Task completed successfully.

## Screenshots
The listed differences are in validation-proof.md; `-end` captures in proof/after show scrolled page ends.
- start, 390 px light: ![before](T0032-vendor-the-support-webapp-design-system-with-the/proof/before/start-390-light.png) ![after](T0032-vendor-the-support-webapp-design-system-with-the/proof/after/start-390-light.png)
- start, 390 px dark: ![before](T0032-vendor-the-support-webapp-design-system-with-the/proof/before/start-390-dark.png) ![after](T0032-vendor-the-support-webapp-design-system-with-the/proof/after/start-390-dark.png)
- start, 1440 px light: ![before](T0032-vendor-the-support-webapp-design-system-with-the/proof/before/start-1440-light.png) ![after](T0032-vendor-the-support-webapp-design-system-with-the/proof/after/start-1440-light.png)
- start, 1440 px dark: ![before](T0032-vendor-the-support-webapp-design-system-with-the/proof/before/start-1440-dark.png) ![after](T0032-vendor-the-support-webapp-design-system-with-the/proof/after/start-1440-dark.png)
- forecast, 390 px light: ![before](T0032-vendor-the-support-webapp-design-system-with-the/proof/before/forecast-390-light.png) ![after](T0032-vendor-the-support-webapp-design-system-with-the/proof/after/forecast-390-light.png)
- forecast, 390 px dark: ![before](T0032-vendor-the-support-webapp-design-system-with-the/proof/before/forecast-390-dark.png) ![after](T0032-vendor-the-support-webapp-design-system-with-the/proof/after/forecast-390-dark.png)
- forecast, 1440 px light: ![before](T0032-vendor-the-support-webapp-design-system-with-the/proof/before/forecast-1440-light.png) ![after](T0032-vendor-the-support-webapp-design-system-with-the/proof/after/forecast-1440-light.png)
- forecast, 1440 px dark: ![before](T0032-vendor-the-support-webapp-design-system-with-the/proof/before/forecast-1440-dark.png) ![after](T0032-vendor-the-support-webapp-design-system-with-the/proof/after/forecast-1440-dark.png)
- about, 390 px light: ![before](T0032-vendor-the-support-webapp-design-system-with-the/proof/before/about-390-light.png) ![after](T0032-vendor-the-support-webapp-design-system-with-the/proof/after/about-390-light.png)
- about, 390 px dark: ![before](T0032-vendor-the-support-webapp-design-system-with-the/proof/before/about-390-dark.png) ![after](T0032-vendor-the-support-webapp-design-system-with-the/proof/after/about-390-dark.png)
- about, 1440 px light: ![before](T0032-vendor-the-support-webapp-design-system-with-the/proof/before/about-1440-light.png) ![after](T0032-vendor-the-support-webapp-design-system-with-the/proof/after/about-1440-light.png)
- about, 1440 px dark: ![before](T0032-vendor-the-support-webapp-design-system-with-the/proof/before/about-1440-dark.png) ![after](T0032-vendor-the-support-webapp-design-system-with-the/proof/after/about-1440-dark.png)
- config, 390 px light: ![before](T0032-vendor-the-support-webapp-design-system-with-the/proof/before/config-390-light.png) ![after](T0032-vendor-the-support-webapp-design-system-with-the/proof/after/config-390-light.png)
- config, 390 px dark: ![before](T0032-vendor-the-support-webapp-design-system-with-the/proof/before/config-390-dark.png) ![after](T0032-vendor-the-support-webapp-design-system-with-the/proof/after/config-390-dark.png)
- config, 1440 px light: ![before](T0032-vendor-the-support-webapp-design-system-with-the/proof/before/config-1440-light.png) ![after](T0032-vendor-the-support-webapp-design-system-with-the/proof/after/config-1440-light.png)
- config, 1440 px dark: ![before](T0032-vendor-the-support-webapp-design-system-with-the/proof/before/config-1440-dark.png) ![after](T0032-vendor-the-support-webapp-design-system-with-the/proof/after/config-1440-dark.png)
