---
id: T0014
owner: "@claude"
session: claude-20261028-f4cc10
needs: []
branch: task/T0014-show-the-town-and-province-of-the-current
worktree: .plan/work/T0014-show-the-town-and-province-of-the-current
status: completed
started_at: "2026-10-28T18:30:06Z"
ended_at: "2026-10-28T18:54:03Z"
review: agent
preview: none
protocol: standard
usage:
  worker: {turns: 1, duration_s: 1264.8, input: 162, output: 43797, cache_read: 8396386, cache_write: 133048}
  review: {turns: 1, duration_s: 127.7, input: 38, output: 6364, cache_read: 951711, cache_write: 52346}
review_status: approved
review_round: 1
reviewed_by: "@claude-2"
work_duration: 1433.3
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
- [x] **[Read]**      Read the Nominatim reverse API documentation and its usage policy.
- [x] **[Visual]**    Capture before screenshots of the current location forecast on desktop and phone.
- [x] **[Implement]** Add the reversePlace unit tests and the named current location browser checks.
- [x] **[Verify]**    Run the tests and confirm the new checks fail.
- [x] **[Implement]** Add reversePlace, the named heading, the attribution link, strings and data source.
- [x] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [x] **[Visual]**    Capture after screenshots in light and dark on desktop and phone.
- [x] **[Doc]**       Update CHANGELOG.md, CHANGELOG.nl.md and README.md.
- [x] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-10-28] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-10-28] **[Read]**
  Read the Nominatim reverse API and usage policy: max 1 request per second, identifying Referer, caching, attribution, no client-side autocomplete.
  - One lookup per location action or language switch stays within policy.
  - Stored lastPlace label serves as the client-side cache.

- [2026-10-28] **[Visual]**
  Captured before screenshots of the current location forecast on desktop and phone, light and dark.
  - Stored in before/current-location-en-*.png.
  - Heading reads Current location (50.85, 4.35).

- [2026-10-28] **[Verify]**
  Ran the new tests before implementation; they failed as expected.
  - Vitest: 5 reversePlace tests failed, 51 passed.
  - Browser Scenario 2 timed out waiting for the Sint-Niklaas heading.

- [2026-10-28] **[Implement]**
  Added reversePlace, the named current location heading, the OpenStreetMap attribution, strings, the About data source and the privacy note.
  - The lookup runs beside the forecast and never delays it.
  - Undeclared files: js/dom.js and css/style.css.

- [2026-10-28] **[Decided]**
  Kept the OpenStreetMap link on one line on phones with a nowrap rule; a startup does not repeat the lookup.
  - The stored lastPlace label acts as the cache.

- [2026-10-28] **[Verify]**
  Unit and both browser scripts pass; after screenshots show the named heading in light and dark on desktop and phone.
  - Vitest: 56 passed.
  - Browser: 174 ok checks, exit code 0.

- [2026-10-28] **[Doc]**
  Updated CHANGELOG.md, CHANGELOG.nl.md and README.md with the current location name and Nominatim source.

- [2026-10-28] **[Verify]**
  Recorded task outcomes.
  - Files touched: 12.
  - Lines touched: 256.
  - Reopenings: 0.

- [2026-10-28] **[Implement]**
  Size note: the recount is 12 files and 256 lines, above the typical line and below the large line.
  - The two extra files hold one and five lines.

- [2026-10-28] **[Visual]**
  Linked the current location screenshots before and after the change; About also lists the Nominatim source.
  - [Before phone](T0014-show-the-town-and-province-of-the-current/before/current-location-en-mobile-light.png).
  - [After phone](T0014-show-the-town-and-province-of-the-current/after/current-location-en-mobile-light.png).
  - [After Dutch desktop dark](T0014-show-the-town-and-province-of-the-current/after/current-location-nl-desktop-dark.png).
  - [After About](T0014-show-the-town-and-province-of-the-current/after/about-desktop-light.png).

- [2026-10-28] **[Verify]**
  Recorded verbatim red and green output in validation-proof.md.
  - Red and green output is in validation-proof.md.

- [2026-10-28] **[Review]**
  Round 1 requested (mode: agent).

- [2026-10-28] **[Review]**
  Round 1 approved by @claude-2: The work meets every goal and follows the technical specification.
  - Findings: [review-findings-1.md](T0014-show-the-town-and-province-of-the-current/review-findings-1.md).

- [2026-10-28] **[Complete]**
  Task completed successfully.

