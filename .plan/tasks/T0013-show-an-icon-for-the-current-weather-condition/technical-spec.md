# T0013 Technical Specifications

## Technical Specifications
- **[Decided]** One icon for the current hour only; per-hour icons would duplicate the rain bars and crowd phone widths.
- Request `weather_code` and `is_day` from Open-Meteo.
  - Both variables are instantaneous at step k, as documented by [Open-Meteo](https://open-meteo.com/en/docs).
- Group WMO weather codes into a few conditions in a pure function `weatherCondition(code, isDay)`:
  - `clear`: 0, 1; with a sun icon by day and a moon icon by night.
  - `partly`: 2; sun or moon behind a cloud.
  - `cloudy`: 3.
  - `fog`: 45, 48.
  - `rain`: 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82.
  - `snow`: 71, 73, 75, 77, 85, 86.
  - `thunder`: 95, 96, 97, 99.
  - Unknown or missing code: no icon.
  - Unsupported gaps in the documented codes produce no icon.
  - **[Decided]** Missing or invalid daylight omits clear/partly icons; other conditions do not require daylight.
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
- `README.md`

Size note: One forecast feature spans paired translations, paired changelogs, tests, and README documentation.

Mechanical command: `python scripts/generate-sw.py generate`

### Tests
- Unit: Cover every documented WMO code, unsupported codes, day/night variants, and missing daylight values.
- Unit: Verify instantaneous condition alignment and absent condition arrays.
- Integration: Verify localized accessible icons, unchanged summary text, and replacement after refresh.
- Visual: Capture desktop and phone views before and after, using both themes.
- Unit: `weatherCondition` maps one code from every group, and both day and night for `clear`.
- Unit: unknown and null codes return null.
- Unit: `buildForecastUrl` requests `weather_code` and `is_day`.
- Integration: `tests/forecast-browser.mjs` with mocked answers:
  - Code 61 by day: a rain icon with the accessible name "Rain" precedes the summary text.
  - Code 0 by night: the moon icon shows.
  - Missing code: no icon, and the summary text is unchanged.
  - The icon does not add a line: the summary height matches the one without an icon at 390px width.

Completion check: npm test && npm run test:browser

Size estimate: 12 files, 300 lines
