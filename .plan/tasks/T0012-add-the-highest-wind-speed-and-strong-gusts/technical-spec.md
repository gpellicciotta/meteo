# T0012 Technical Specifications

- **[Decided]** Request `wind_speed_10m` and `wind_gusts_10m` in km/h, the Open-Meteo default unit.
- Read the Open-Meteo forecast documentation first.
  - Confirm whether each variable is an instant value or covers the preceding hour.
  - Align instant values like temperature (step k) and preceding-hour values like precipitation (step k + 1).
  - Record the documented behavior and its link in the Execution Log.
- `parseForecast` adds `windSpeed` and `windGusts` per hour, keeping missing values as null.
- A pure function `summarizeWind(hours)` returns `{ maxSpeed, maxGusts }`, ignoring nulls.
- **[Decided]** Summary text appended after the temperature sentence:
  - Always: "Wind up to {speed} km/h." / "Wind tot {speed} km/u."
  - **[Estimation]** Add "gusts up to {gusts} km/h" only from 50 km/h.
    That is roughly Beaufort 7 and needs confirming against an official source during the task.
  - Omit the wind sentence when every wind value is null.
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

Size note: 9 counted files but about 120 lines; strings and changelogs come in language pairs.

Mechanical command: python scripts/generate-sw.py generate

### Tests
- Unit: `buildForecastUrl` requests both wind variables.
- Unit: `parseForecast` reads wind at the documented step and keeps missing values as null.
- Unit: `summarizeWind` returns the highest speed and gusts, and nulls when no data exists.
- Integration: `tests/forecast-browser.mjs` with mocked answers:
  - 20 km/h wind and 35 km/h gusts: the summary mentions the wind but no gusts.
  - 40 km/h wind and 70 km/h gusts: the summary mentions both, in English and Dutch.

Completion check: npm test && npm run test:browser

Size estimate: 9 files, 120 lines
