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
- **[Decided]** Startup shows a saved forecast only while at least 6 visible hours remain.
  - This avoids flashing a chart that a failed fetch would hide again.
- **[Decided]** The keep-or-hide rule applies to every failed load of the shown place.
  - A failed background refresh with under 6 hours left hides the chart and shows the error.
  - The next refresh of a hidden chart loads visibly, so the error clears on success.
- **[Decided]** Resuming the app (`visibilitychange`, persisted `pageshow`) re-renders with `visibleHours` first.
  - This drops past hours even when the refresh fails or is skipped offline.
  - Offline, a chart below 6 remaining hours gives way to the network error.
- **[Decided]** Browser scenarios pin the page clock to 10:20 in Brussels.
  - The mocked forecasts start at 10:00; without a pinned clock, `visibleHours` would drop hours.

### Declared Files
- `js/forecast.js`
- `js/weather-api.js`
- `js/forecast-view.js`
- `tests/forecast.test.js`
- `tests/forecast-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`
- `README.md`

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
