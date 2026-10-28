# T0013 Technical Specifications

- **[Decided]** One icon for the current hour only; per-hour icons would duplicate the rain bars and crowd phone widths.
- Request `weather_code` and `is_day` from Open-Meteo.
  - Confirm in the documentation which step each one belongs to, as T0012 does for wind.
- Group WMO weather codes into a few conditions in a pure function `weatherCondition(code, isDay)`:
  - `clear`: 0, 1; with a sun icon by day and a moon icon by night.
  - `partly`: 2; sun or moon behind a cloud.
  - `cloudy`: 3.
  - `fog`: 45, 48.
  - `rain`: 51–67 and 80–82 (drizzle, rain, freezing rain, showers).
  - `snow`: 71–77, 85, 86.
  - `thunder`: 95–99.
  - Unknown or missing code: no icon.
  - Verify these code ranges against the WMO table in the Open-Meteo documentation before implementing.
- Add the icons to `js/icons.js` as 24×24 stroke SVGs using `currentColor`, matching the existing icons.
- The icon sits inline before the summary text, about 1.25em high, and gets `role="img"` with a localized name.
- New strings `forecast.condition_{name}` in English and Dutch, such as "Partly cloudy" / "Half bewolkt".
- Add the icons to the About view icon list only if that list stays readable; otherwise skip it and log the reason.

### Declared Files
- `js/weather-api.js`
- `js/forecast.js`
- `js/forecast-view.js`
- `js/icons.js`
- `css/style.css`
- `data/strings.en.json`
- `data/strings.nl.json`
- `tests/forecast.test.js`
- `tests/forecast-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`

Size note: 11 counted files and about 250 lines; one feature, and strings and changelogs come in language pairs.

Mechanical command: python scripts/generate-sw.py generate

### Tests
- Unit: `weatherCondition` maps one code from every group, and both day and night for `clear`.
- Unit: unknown and null codes return null.
- Unit: `buildForecastUrl` requests `weather_code` and `is_day`.
- Integration: `tests/forecast-browser.mjs` with mocked answers:
  - Code 61 by day: a rain icon with the accessible name "Rain" precedes the summary text.
  - Code 0 by night: the moon icon shows.
  - Missing code: no icon, and the summary text is unchanged.
  - The icon does not add a line: the summary height matches the one without an icon at 390px width.

Completion check: npm test && npm run test:browser

Size estimate: 11 files, 250 lines
