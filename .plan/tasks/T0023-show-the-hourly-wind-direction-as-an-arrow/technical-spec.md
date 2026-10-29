# T0023 Technical Specifications

### Data
- Request `wind_direction_10m` after `wind_gusts_10m` in `buildForecastUrl()`.
- Open-Meteo documents it in degrees, instantaneous like the speed, so hour k takes step k.
- `parseForecast()` adds `windDirection: number|null` to each hour.
- `restoreForecast()` keeps accepting hours without `windDirection`, saved by older versions.
  A present `windDirection` must be `null` or a finite number.
- `compassPoint(degrees)` in `js/forecast.js` returns one of `n`, `ne`, `e`, `se`, `s`, `sw`, `w`, `nw`, or `null`.
  It rounds to the nearest 45 degrees and wraps negative and 360+ values.

### Rendering
- **[Decided]** Each `.forecast-wind` cell stacks a 10px arrow above the speed.
  - The arrow is a new `wind-arrow` icon pointing up, rotated by `(direction + 180) mod 360` degrees.
  - So it points where the wind blows to, as weather maps draw it.
  - Without a direction, the arrow slot stays empty, keeping the speeds aligned.
- The hour description says where the wind comes from, with `forecast.hour_aria_wind_from`:
  English ", wind {wind} {unit} from the {direction}"; Dutch ", wind {wind} {unit} uit het {direction}".
- Direction names are `wind.dir_{point}`:
  English north, northeast, east, southeast, south, southwest, west, northwest;
  Dutch noorden, noordoosten, oosten, zuidoosten, zuiden, zuidwesten, westen, noordwesten.
- **[Decided]** The summary sentence stays unchanged; the direction is hourly only.
- The guide sample gets directions veering from south to west, and item 8 adds
  "The arrow points where the wind blows to." / "De pijl wijst waar de wind naartoe waait.".
- The forecast must still fit with both hourly rows and the search row at 390x700 and 1280x800.

### Declared Files
- `js/forecast.js`
- `js/weather-api.js`
- `js/forecast-view.js`
- `js/icons.js`
- `js/guide-sample.js`
- `css/style.css`
- `data/strings.en.json`
- `data/strings.nl.json`
- `tests/forecast.test.js`
- `tests/forecast-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`
- `README.md`

Mechanical command: python scripts/generate-sw.py generate

Size note: Thirteen files exceed the typical line; strings, changelogs and icons take a few lines each.

### Tests
- Unit: `tests/forecast.test.js`:
  - `compassPoint`: 0 is n, 44 is ne, 225 is sw, 337.5 is nw, 359 and 360 are n, -45 is nw, null is null.
  - `parseForecast` takes `windDirection` from step k, and keeps it null when absent.
  - `buildForecastUrl` requests `wind_direction_10m`.
  - `restoreForecast` accepts an hour without `windDirection` and rejects `windDirection: "sw"`.
- Integration: `tests/forecast-browser.mjs`, with mocked directions of 225 degrees:
  - Scenario 14: every wind cell has an arrow rotated 45 degrees above its speed;
    the first description ends with ", wind 40 km/h from the southwest", and in Dutch "uit het zuidwesten";
  - Scenario 14: a forecast without directions shows no arrows and descriptions without "from";
  - Scenarios 1, 15 and 17 expect the direction in their descriptions;
  - Scenario 15 still fits with both rows at 390x700 and 1280x800.

Completion check: npm test && npm run test:browser

Size estimate: 13 files, 200 lines
