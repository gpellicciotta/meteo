# T0002 Technical Specifications

### Data Sources
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name={{query}}&count=5&language={{lang}}&format=json`.
- Forecast: `https://api.open-meteo.com/v1/forecast?latitude={{lat}}&longitude={{lon}}&hourly=temperature_2m,precipitation,precipitation_probability&forecast_hours=13&timezone=auto`.
- Both APIs answer with `access-control-allow-origin: *` and need no key for non-commercial use.
- Free tier: 10,000 calls a day per IP; each visitor calls from their own browser.
- License: CC BY 4.0; the start view shows "Weather data by Open-Meteo.com" with a link.

### Decisions
- **[Decided]** Hourly `precipitation` sums the preceding hour, so the app requests 13 hourly steps.
- **[Decided]** Bar `k` covers hour `t[k]` to `t[k+1]`: label and temperature from `t[k]`, rain and probability from `t[k+1]`.
- **[Decided]** The bar scale maximum is `max(2 mm, highest hourly amount)` so drizzle never looks like a downpour.
- **[Decided]** Rain counts as expected from 0.1 mm in an hour, matching Open-Meteo's probability threshold.
- **[Decided]** Several geocoding matches show a pick list of up to five places; one match loads directly.
- **[Decided]** The current location shows its rounded coordinates; Open-Meteo has no reverse geocoding.
- **[Decided]** The last chosen location is stored in preferences and reloaded at startup.
- **[Decided]** `?location={{name}}` searches a place at startup, which also serves the browser tests.
- **[Decided]** Times use the location's own time zone (`timezone=auto`), formatted as `HH:MM`.

### Modules
- `js/forecast.js`: pure functions `parseForecast(json)`, `summarizeRain(hours)`, `barScaleMax(hours)`, `formatPlace(place)`.
- `js/weather-api.js`: `searchPlaces(query, lang)` and `fetchForecast(lat, lon)` wrapping `fetch`, raising coded errors.
- `js/geolocation.js`: `getCurrentCoordinates()` wrapping `navigator.geolocation` with coded errors.
- `js/forecast-view.js`: renders the place list, summary, rain bar chart and temperature row.

### Rendering
- Chart: an ordered list of 12 columns, each with the rain amount, a bar, the probability, the hour and the temperature.
- Each column has an accessible name such as "14:00: 0.4 mm rain, 60% chance, 12 °C".
- Summary: "Rain expected from 14:00 (up to 1.2 mm per hour)" or "No rain expected in the next 12 hours".
- Errors: no match, geolocation denied, unavailable or unsupported, and network failure each get their own message.

### Declared Files
- `index.html`
- `css/style.css`
- `js/app.js`
- `js/dom.js`
- `js/forecast.js`
- `js/weather-api.js`
- `js/geolocation.js`
- `js/forecast-view.js`
- `js/preferences.js`
- `data/strings.nl.json`
- `data/strings.en.json`
- `tests/forecast.test.js`
- `tests/forecast-browser.mjs`
- `README.md`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`

Generated file: `sw.js` (`python scripts/generate-sw.py generate`).

### Tests
- Unit: `parseForecast` turns 13 hourly steps into 12 hours with the shifted rain and probability.
- Unit: `parseForecast` rejects a response with fewer than 13 steps.
- Unit: `summarizeRain` reports the first hour reaching 0.1 mm and the highest hourly amount.
- Unit: `summarizeRain` reports no rain when every hour stays below 0.1 mm.
- Unit: `barScaleMax` returns 2 for light rain and the highest amount for heavy rain.
- Unit: `formatPlace` joins name, region and country and skips missing or duplicate parts.
- Unit: `searchPlaces` and `fetchForecast` build the documented URLs and map HTTP failures to error codes.
- Integration: Search "Gent", pick a place from the list, and see 12 bars, the summary and the attribution.
- Integration: Use a granted fake geolocation and see the forecast for the rounded coordinates.
- Integration: Check a denied geolocation and an empty search result show their error messages.
- Integration: Capture desktop and mobile screenshots in light and dark mode, in Dutch and English.
- Integration: Fail on any console error, page error, failed request or HTTP status of 400 or higher.
- Integration: A final manual run against the live API confirms real Brussels data renders.

Completion check: npm test && node tests/shell-browser.mjs && node tests/forecast-browser.mjs

Size estimate: 16 files, 950 lines

Size note: the feature needs its markup, modules, strings, tests and docs together to run and merge.
