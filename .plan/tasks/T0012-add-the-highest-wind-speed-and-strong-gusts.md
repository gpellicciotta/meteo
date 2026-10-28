---
id: T0012
owner: ~
needs: []
branch: —
worktree: —
status: ready
started_at: —
ended_at: —
review: agent
preview: none
protocol: standard
---
# T0012: Add the highest wind speed, and strong gusts, to the forecast summary

## Goals
Tell the wind without adding a chart row or a widget.
Extend the existing summary sentence with the highest wind speed of the next 12 hours.
Mention gusts only when they are strong, so calm days keep a short summary.
Specifications: [technical-spec.md](T0012-add-the-highest-wind-speed-and-strong-gusts/technical-spec.md).

## Task Execution Steps
- [ ] **[Read]**      Read the Open-Meteo documentation on wind variable timing and log the findings.
- [ ] **[Implement]** Add the wind unit tests and the wind summary browser checks.
- [ ] **[Verify]**    Run the tests and confirm the new checks fail.
- [ ] **[Implement]** Request and parse wind, add summarizeWind and the summary sentence.
- [ ] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [ ] **[Visual]**    Capture after screenshots in light and dark on desktop and phone.
- [ ] **[Doc]**       Update CHANGELOG.md, CHANGELOG.nl.md and the How It Works list in README.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.
