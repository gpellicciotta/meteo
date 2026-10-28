---
id: T0002
owner: ~
needs: [T0001]
branch: —
worktree: —
status: ready
started_at: —
ended_at: —
review: agent
preview: none
protocol: standard
---
# T0002: Add the twelve-hour temperature and hourly rain forecast view using Open-Meteo

## Goals
Let a user enter a place name or use the current location on the start view.
Show the temperature and, most prominently, the hourly rain forecast for the next 12 hours.
Fetch everything straight from the free Open-Meteo APIs in the browser, without a server.
Offer the view in Dutch and English and credit Open-Meteo as its CC BY 4.0 license requires.

## Task Execution Steps
- [ ] **[Implement]** Author the Vitest forecast tests and the Playwright forecast scenario.
- [ ] **[Verify]**    Run both and confirm they fail before the feature exists.
- [ ] **[Implement]** Implement the forecast, API, geolocation and view modules with markup and strings.
- [ ] **[Verify]**    Run all unit tests and browser scripts until they pass.
- [ ] **[Verify]**    Confirm a live Open-Meteo request renders real data for Brussels.
- [ ] **[Visual]**    Capture light and dark screenshots on desktop and mobile in both languages.
- [ ] **[Doc]**       Update README.md, CHANGELOG.md and CHANGELOG.nl.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.
