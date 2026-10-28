---
id: T0014
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
# T0014: Show the town and province of the current location instead of its coordinates

## Goals
The current location heading shows rounded coordinates such as "50.85, 4.35".
Show the town, province and country instead, like searched places.
Open-Meteo has no reverse geocoding, so ask the OpenStreetMap Nominatim reverse API.
The forecast must not wait for the name; a failed lookup keeps the coordinates.
Credit OpenStreetMap and update the privacy note, which says only Open-Meteo receives coordinates.
Specifications: [technical-spec.md](T0014-show-the-town-and-province-of-the-current/technical-spec.md).

## Task Execution Steps
- [ ] **[Read]**      Read the Nominatim reverse API documentation and its usage policy.
- [ ] **[Visual]**    Capture before screenshots of the current location forecast on desktop and phone.
- [ ] **[Implement]** Add the reversePlace unit tests and the named current location browser checks.
- [ ] **[Verify]**    Run the tests and confirm the new checks fail.
- [ ] **[Implement]** Add reversePlace, the named heading, the attribution link, strings and data source.
- [ ] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [ ] **[Visual]**    Capture after screenshots in light and dark on desktop and phone.
- [ ] **[Doc]**       Update CHANGELOG.md, CHANGELOG.nl.md and README.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.
