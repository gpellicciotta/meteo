# T0009 Technical Specifications

- **[Decided]** Store the forecast in the existing `meteo_preferences` entry as `lastForecast`.
  - Shape: `{ placeKey, fetchedAt, forecast }`, with `fetchedAt` as an ISO string.
  - `placeKey` is the place id, or the rounded coordinates for a current location.
  - Save it in `loadForecast` after each successful fetch.
- **[Decided]** Request 24 hourly steps plus one instead of 12 plus one, so a saved forecast still covers later hours.
  - `parseForecast` keeps all steps; a new `visibleHours(forecast, now)` returns the 12 hours from the current hour on.
  - The chart and summary use `visibleHours`; this also fixes the stale chart before a T0008 refresh.
- On startup with a saved place, render the saved forecast at once when it matches the place.
  - Then fetch as now; success replaces it.
  - On failure, keep the saved forecast and show no error when at least 6 visible hours remain.
- **[Decided]** Below 6 remaining hours, hide the forecast and show the existing network error.
- The update line keeps showing the original fetch time, so old data is never presented as new.
- Ignore a saved forecast that fails to parse or has the wrong shape.

### Declared Files
- `js/forecast.js`
- `js/weather-api.js`
- `js/forecast-view.js`
- `tests/forecast.test.js`
- `tests/forecast-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`

Mechanical command: python scripts/generate-sw.py generate

### Tests
- Unit: `buildForecastUrl` requests 25 hourly steps.
- Unit: `visibleHours` starts at the current hour and returns 12 hours.
- Unit: `visibleHours` returns fewer hours when the saved data runs out.
- Unit: a malformed `lastForecast` is ignored without throwing.
- Integration: `tests/forecast-browser.mjs` with mocked Open-Meteo answers:
  - Load a place, then reload with the forecast request failing: the saved chart shows with the old update time.
  - Same, with the clock 3 hours later: the chart starts 3 hours later.
  - Same, with the clock 20 hours later: the network error shows and the chart is hidden.

Completion check: npm test && npm run test:browser

Size estimate: 7 files, 250 lines
