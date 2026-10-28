---
id: T0010
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
# T0010: Give up on Open-Meteo requests after 10 seconds and show the network error

## Goals
The geocoding and forecast requests have no time limit.
On a weak mobile connection, "Loading the forecast…" can then stay on screen for a minute or more.
Abort each request after 10 seconds and show the existing network error.
Geolocation already has its own overall limit and stays unchanged.
Specifications: [technical-spec.md](T0010-give-up-on-open-meteo-requests-after-10/technical-spec.md).

## Task Execution Steps
- [ ] **[Implement]** Add the timeout unit tests for searchPlaces and fetchForecast.
- [ ] **[Verify]**    Run the unit tests and confirm the new checks fail.
- [ ] **[Implement]** Pass an AbortSignal timeout to fetch in getJson.
- [ ] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [ ] **[Doc]**       Update CHANGELOG.md and CHANGELOG.nl.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.
