---
id: T0013
owner: ~
needs: [T0012]
branch: —
worktree: —
status: ready
started_at: —
ended_at: —
review: agent
preview: none
protocol: standard
---
# T0013: Show an icon for the current weather condition at the start of the forecast summary

## Goals
Show the current weather at a glance with one small icon.
Place it at the start of the existing summary line, not as a new row or per-hour icons.
Use simple line icons in the style of the existing icon set, colored by the theme.
It needs T0012 because both change the forecast request, parser and summary.
Specifications: [technical-spec.md](T0013-show-an-icon-for-the-current-weather-condition/technical-spec.md).

## Task Execution Steps
- [ ] **[Read]**      Read the Open-Meteo documentation on weather_code, is_day and the WMO code table.
- [ ] **[Visual]**    Capture before screenshots of the forecast on desktop and phone.
- [ ] **[Implement]** Add the weatherCondition unit tests and the condition icon browser checks.
- [ ] **[Verify]**    Run the tests and confirm the new checks fail.
- [ ] **[Implement]** Request the codes, add weatherCondition, the icons, styles and strings.
- [ ] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [ ] **[Visual]**    Capture after screenshots in light and dark on desktop and phone.
- [ ] **[Doc]**       Update CHANGELOG.md, CHANGELOG.nl.md and README.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.
