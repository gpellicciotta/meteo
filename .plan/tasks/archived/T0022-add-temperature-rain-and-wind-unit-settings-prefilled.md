---
id: T0022
owner: "@claude-code"
needs: []
branch: —
worktree: —
status: completed
started_at: "2026-10-29T07:46:03Z"
ended_at: "2026-10-29T07:56:14Z"
review: none
preview: none
protocol: adhoc
---
# T0022: Add temperature, rain and wind unit settings, prefilled from the current location's country, else metric

## Goals
US users expect Fahrenheit, inches and miles per hour.
Add temperature, rain and wind unit settings, remembered in localStorage.
While never set, prefill them from the country of the current location once it is known.
Without a known current location, the metric units stay.
Specifications: [technical-spec.md](T0022-add-temperature-rain-and-wind-unit-settings-prefilled/technical-spec.md).

## Task Execution Steps
- [x] **[Implement]** Add units unit tests, reversePlace country expectations, and the units browser scenario.
- [x] **[Verify]**    Run the tests, keep before screenshots, and confirm the new checks fail.
- [x] **[Implement]** Add units.js, the unit selects, the prefill, unit-aware strings, the forecast and guide rendering.
- [x] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [x] **[Visual]**    Capture after screenshots in light and dark on desktop and phone.
- [x] **[Doc]**       Update both changelogs and the README How It Works list.

## Execution Log
- [2026-10-29] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-10-29] **[Implement]**
  Added units.test.js, countryCode expectations for reversePlace, and Scenario 17.

- [2026-10-29] **[Verify]**
  The unit suite failed on the missing units module and two reversePlace cases; Scenario 17 found no unit selects.

- [2026-10-29] **[Implement]**
  Added units.js, countryCode, the unit selects, prefill, unit-aware strings, and unit-aware forecast and guide rendering.

- [2026-10-29] **[Decided]**
  Guide thresholds use two significant digits, so 0.1 mm reads 0.0039 in; a guide text check was added afterwards.

- [2026-10-29] **[Implement]**
  Touched undeclared css/style.css for the units hint and js/app.js for the unit select listeners.

- [2026-10-29] **[Verify]**
  Unit tests and both browser scripts passed; evidence in validation-proof.md.

- [2026-10-29] **[Doc]**
  Added the change to both changelogs and the README How It Works list.

- [2026-10-29] **[Verify]**
  Size note: 17 files and 616 lines cross the typical line; strings in two languages and tests carry most lines.

- [2026-10-29] **[Verify]**
  Recorded the task outcomes.
  - Files touched: 17.
  - Lines touched: 616.
  - Reopenings: 0.

- [2026-10-29] **[Complete]**
  Task completed successfully.

