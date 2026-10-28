# T0008 Technical Specifications

- **[Decided]** Trigger on `visibilitychange` to `visible` and on `pageshow` with `persisted` (back-forward cache).
- **[Decided]** Stale means `Date.now() - view.updatedAt >= 15 * 60 * 1000`; export the limit as `STALE_AFTER_MS`.
- Skip the refresh when no place is shown, when `navigator.onLine === false`, or when a request is in flight.
- Reuse `loadForecast(view.place)`; its request id already drops late answers.
- **[Decided]** A background refresh keeps the shown chart while loading:
  - No "Loading the forecast…" status line, so the view does not jump.
  - A failure keeps the old chart and shows no error; the old update time stays visible.
- A user search or location request during a refresh wins through the existing request id.
- Put the staleness rule in a pure function `isStale(updatedAt, now)` in `js/forecast.js` for unit tests.

### Declared Files
- `js/forecast.js`
- `js/forecast-view.js`
- `tests/forecast.test.js`
- `tests/forecast-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`

Mechanical command: python scripts/generate-sw.py generate

### Tests
- Unit: `isStale` returns false at 14:59 minutes and true at 15:00 minutes.
- Unit: `isStale` returns false when `updatedAt` is null.
- Integration: `tests/forecast-browser.mjs` with mocked Open-Meteo answers and a controlled clock:
  - Load a place, advance the clock 16 minutes, fire `visibilitychange`: one new forecast request, new update time.
  - Advance only 5 minutes: no new request.
  - Make the refresh fail: the old chart and update time stay, no error is shown.

Completion check: npm test && npm run test:browser

Size estimate: 6 files, 150 lines
