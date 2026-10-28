# T0010 Technical Specifications

## Technical Specifications
- **[Decided]** `getJson` in `js/weather-api.js` passes `{ signal: AbortSignal.timeout(timeoutMs) }` to fetch.
- **[Decided]** Default `timeoutMs` is 10000; `searchPlaces` and `fetchForecast` accept it as an optional last argument for tests.
- A timeout rejection raises `ForecastError("network")`, which already maps to `forecast.error_network`.
- **[Decided]** Body-consumption timeouts use the same network error; HTTP failures and unrelated JSON errors retain their behavior.
- No new strings or UI.

### Declared Files
- `js/weather-api.js`
- `tests/forecast.test.js`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`

Mechanical command: `python scripts/generate-sw.py generate`

### Tests
- Unit: a fetch stub that never settles until its signal aborts makes `fetchForecast` reject with code `network`.
- Unit: the same holds for `searchPlaces`.
- Unit: the fetch stub receives an `AbortSignal`.
- Unit: both public request functions default to a 10000-millisecond timeout.
- Unit: both public functions convert timeouts after successful headers into `ForecastError("network")`.
- Unit: malformed JSON remains a parsing error when the request signal has not aborted.
- Integration: existing browser scenarios still pass; the mocked answers arrive well within 10 seconds.
- Integration: native fetch against a local server with incomplete JSON returns the network error after headers arrive.

Completion check: npm test && npm run test:browser

Size estimate: 4 files, 50 lines
