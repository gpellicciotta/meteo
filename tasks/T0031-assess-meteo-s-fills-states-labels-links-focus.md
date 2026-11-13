---
id: T0031
owner: "@claude"
session: claude-20261113-895665
needs: []
branch: task/T0031-assess-meteo-s-fills-states-labels-links-focus
worktree: .plan/work/T0031-assess-meteo-s-fills-states-labels-links-focus
status: active
started_at: "2026-11-13T20:00:18Z"
ended_at: —
review: agent
preview: none
protocol: standard
---
# T0031: Assess meteo's fills, states, labels, links, focus, and grounds against the bright look's AA adjustments.

## Goals
Compare meteo's light yellow and dark blue and red fills, interaction states, labels, links, focus, and grounds with the `bright` look.
Use the AA adjustments of [ADR-0002](../../../support.webapp/docs/adrs/ADR-0002-looks.md) and the [bright look spec](../../../support.webapp/docs/specs/looks/bright.md).
List every palette override meteo needs to keep its appearance, and every deliberate AA exception, such as white labels on yellow.
Investigation only: the findings feed the vendoring task, which applies them.

## Task Execution Steps
- [x] **[Read]**      Read the named ADRs and the app at a recorded commit.
- [x] **[Verify]**    Measure each fill, state, label, link, focus, and ground pair against the bright look.
- [x] **[Doc]**       Record the findings and the follow-up decisions in validation-proof.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-11-13] **[Doc]**
  Created from the support.webapp adoption roadmap at the user's request.

- [2026-11-13] **[Read]**
  Read ADR-0002, bright.md, and the bright look at support.webapp 6cd1671, and meteo css/style.css at b766712.
  - meteo color tokens match 8937c32, the ADR's commit.

- [2026-11-13] **[Verify]**
  Measured fills, states, labels, links, focus, and grounds with contrast.py; recorded both override sets and their token-test results.
  - Recommended set fails only the two white yellow labels.
  - Lossless set fails in five of six accent and theme cases.

- [2026-11-13] **[Doc]**
  Recorded findings, override sets, AA exceptions, and follow-up decisions for T0032 and T0033 in validation-proof.md.
  - Files touched: 0.
  - Lines touched: 0.
  - Reopenings: 0.

