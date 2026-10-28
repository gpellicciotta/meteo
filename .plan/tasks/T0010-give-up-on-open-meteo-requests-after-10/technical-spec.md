# T0010 Technical Specifications

- **[Decided]** `getJson` in `js/weather-api.js` passes `{ signal: AbortSignal.timeout(timeoutMs) }` to fetch.
- **[Decided]** Default `timeoutMs` is 10000; `searchPlaces` and `fetchForecast` accept it as an optional last argument for tests.
- A timeout rejection raises `ForecastError("network")`, which already maps to `forecast.error_network`.
- No new strings or UI.

### Declared Files
- `js/weather-api.js`
- `tests/forecast.test.js`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`

Mechanical command: python scripts/generate-sw.py generate

### Tests
- Unit: a fetch stub that never settles until its signal aborts makes `fetchForecast` reject with code `network`.
- Unit: the same holds for `searchPlaces`.
- Unit: the fetch stub receives an `AbortSignal`.
- Integration: existing browser scenarios still pass; the mocked answers arrive well within 10 seconds.

Completion check: npm test && npm run test:browser

Size estimate: 4 files, 50 lines
