# T0012 Technical Specifications

## Technical Specifications
- **[Decided]** Request `wind_speed_10m` and `wind_gusts_10m` in km/h, the Open-Meteo default unit.
- Read the Open-Meteo forecast documentation first.
  - Confirm whether each variable is an instant value or covers the preceding hour.
  - Align instant values like temperature (step k) and preceding-hour values like precipitation (step k + 1).
  - Record the documented behavior and its link in the Execution Log.
- `parseForecast` adds `windSpeed` and `windGusts` per hour, keeping missing values as null.
- A pure function `summarizeWind(hours)` returns `{ maxSpeed, maxGusts }`, ignoring nulls.
- **[Decided]** Summary text appended after the temperature sentence:
  - Always: "Wind up to {speed} km/h." / "Wind tot {speed} km/u."
  - **[Decided]** Add "gusts up to {gusts} km/h" only from 50 km/h, comparing before rounding.
    This product threshold is not a Beaufort classification; Beaufort describes mean wind rather than gusts.
  - Omit the wind sentence when every wind value is null.
- **[Decided]** Show strong gusts alone when wind speed is missing; omit weaker gusts without a speed.
- Round speeds to whole numbers with the existing `formatNumber`.
- The per-hour chart stays unchanged.

### Declared Files
- `js/weather-api.js`
- `js/forecast.js`
- `js/forecast-view.js`
- `data/strings.en.json`
- `data/strings.nl.json`
- `tests/forecast.test.js`
- `tests/forecast-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`
- `README.md`

Size note: One forecast-summary feature spans paired translations, changelogs, tests, and required README documentation.

Mechanical command: `python scripts/generate-sw.py generate`

### Tests
- Unit: `buildForecastUrl` requests both wind variables.
- Unit: `parseForecast` reads wind at the documented step and keeps missing values as null.
- Unit: `summarizeWind` returns the highest speed and gusts, and nulls when no data exists.
- Unit: Test both window boundaries, absent arrays, null entries, independent maxima, and zero wind.
- Integration: `tests/forecast-browser.mjs` with mocked answers:
  - 20 km/h wind and 35 km/h gusts: the summary mentions the wind but no gusts.
  - 40 km/h wind and 70 km/h gusts: the summary mentions both, in English and Dutch.
- Integration: Verify rounding, the 49.9/50 km/h gust boundary, zero wind, and independently missing wind series in both languages.
- Visual: Capture both languages and themes on desktop and mobile; retain existing chart and layout checks.

Completion check: npm test && npm run test:browser

Size estimate: 10 files, 240 lines

### Confirmed Timing
- [Open-Meteo](https://open-meteo.com/en/docs) documents instantaneous wind speed and preceding-hour maximum gusts, using km/h by default.
- **[Decided]** Read speed at step k and gusts at step k + 1 for the displayed interval.
- [Met Office](https://weather.metoffice.gov.uk/guides/coast-and-sea/beaufort-scale) describes Beaufort using mean wind speeds.
- **[Decided]** Keep the specified 50 km/h gust threshold as a display choice, without labeling it Beaufort 7.
