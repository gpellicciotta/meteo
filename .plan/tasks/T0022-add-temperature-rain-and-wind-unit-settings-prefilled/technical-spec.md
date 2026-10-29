# T0022 Technical Specifications

### Units
| Kind          | Options                  | Metric | Digits          | Conversion from metric |
| :------------ | :----------------------- | :----- | :-------------- | :--------------------- |
| temperature   | `c` °C, `f` °F           | `c`    | 0               | °F = °C × 9 / 5 + 32   |
| precipitation | `mm` mm, `in` in         | `mm`   | 1 for mm, 2 for in | in = mm / 25.4      |
| wind          | `kmh` km/h, `mph` mph, `ms` m/s | `kmh` | 0          | mph = km/h / 1.609344; m/s = km/h / 3.6 |

- **[Decided]** The app keeps fetching and storing metric values; units only change what is shown.
  Thresholds stay metric: 0.1 mm wet hours, 2 mm bar scale, 50 km/h strong gusts.
- A wet hour below 0.005 in shows "<0.01" instead of "0.00".
- A new pure module `js/units.js` holds the options, conversions and formatting rules:
  - `storedUnits(prefs)` returns `prefs.units` when all three kinds hold valid options, else `null`.
  - `activeUnits(prefs)` returns `storedUnits(prefs)` or the metric units.
  - `unitsForCountry(code)` maps an ISO country code, in any case, to units, or `null` for an empty code.
  - `convertValue(kind, value, unit)` converts a metric value, keeping `null`.
  - `unitDigits(unit)` returns the fraction digits from the table.

### Country defaults
- **[Decided]** `US`, `PR`, `GU`, `VI`, `AS`, `MP` and `UM` use °F, in and mph.
- **[Decided]** `GB` uses °C, mm and mph, as UK forecasts give wind in mph.
- Every other country uses the metric units.

### Storage and prefill
- Units are stored as `units: {temperature, precipitation, wind}` in `meteo_preferences`.
- **[Decided]** "Current location" means the device position from the location button.
  Searched places never change the units; no position is requested only for units.
- `reversePlace()` also returns `countryCode`, upper case, from Nominatim `address.country_code`, or "".
- A named current location stores `countryCode` with its label in the place.
- While `storedUnits()` is `null`, a known current location country stores `unitsForCountry()` and re-renders.
  This runs after the reverse lookup, after a language switch lookup, and at startup for a saved current location.
- Settings shows three selects in the Forecast card: `#config-unit-temperature`, `#config-unit-precipitation`, `#config-unit-wind`.
- Save stores the units only when units were stored before or a unit select changed in this visit.
  A theme-only save therefore keeps the prefill open.

### Rendering
- The summary, chart cells, hour descriptions and guide sample use the active units.
- Unit labels come from new strings `units.{option}`; the Dutch km/h label is "km/u".
- Strings with units take a `{unit}` placeholder: `forecast.summary_rain`, `forecast.summary_rain_now`,
  `forecast.summary_temp`, `forecast.summary_wind`, `forecast.summary_wind_gusts`, `forecast.summary_gusts`,
  `forecast.hour_aria` (`{rain_unit}` and `{temp_unit}`) and `forecast.hour_aria_wind`.
- The guide texts naming units get placeholders, filled by `renderGuide()` instead of `data-i18n`.

### Declared Files
- `index.html`
- `js/units.js`
- `js/forecast-view.js`
- `js/config-view.js`
- `js/dom.js`
- `js/weather-api.js`
- `js/guide.js`
- `data/strings.en.json`
- `data/strings.nl.json`
- `tests/units.test.js`
- `tests/forecast.test.js`
- `tests/forecast-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`
- `README.md`

Mechanical command: python scripts/generate-sw.py generate

Size note: Fifteen files exceed the typical line; strings and changelogs are short, and units form one feature.

### Tests
- Unit: `tests/units.test.js`:
  - `unitsForCountry`: `US`, `us` and `PR` give f/in/mph; `GB` gives c/mm/mph; `BE` gives metric; "" and `null` give `null`.
  - `storedUnits`: valid units pass; missing, partial or unknown options give `null`.
  - `activeUnits`: defaults to c/mm/kmh.
  - `convertValue`: 10 °C is 50 °F, -40 stays -40, 25.4 mm is 1 in, 100 km/h is 62.14 mph, 36 km/h is 10 m/s, `null` stays `null`.
  - `unitDigits`: 0 for c, f, kmh, mph and ms; 1 for mm; 2 for in.
- Unit: `tests/forecast.test.js` `reversePlace` expectations include `countryCode`, "BE" or "".
- Integration: `tests/forecast-browser.mjs` new Scenario 17:
  - without stored units a searched place shows °C, mm and km/h;
  - Settings shows °C, mm and km/h; a theme-only save stores no units;
  - choosing °F, in and mph shows "Temperature between 49 and 59 °F." and "(up to 0.10 in per hour)";
  - the chart shows "49°", amount "0.02" at 13:00, "<0.01" at 20:00, and wind "25" first;
  - the hour description reads "14:00: 0.05 in rain, 70% chance, 53 °F, wind 12 mph";
  - localStorage holds the units, a reload keeps them, and the guide sample shows °F;
  - a fresh current location in the US stores and shows imperial units; one in Belgium stores metric;
  - a denied location stores no units and keeps metric;
  - stored units are kept when a US current location follows;
  - no unexpected console, page or network errors occur.

Completion check: npm test && npm run test:browser

Size estimate: 15 files, 480 lines
