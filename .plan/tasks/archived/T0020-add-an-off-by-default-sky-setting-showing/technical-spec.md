# T0020 Technical Specifications

### Setting
- **[Decided]** The user chose both the summary icon and a new hourly icon row for this setting.
- Store the setting as `showConditions` in `meteo_preferences`; only the boolean `true` turns it on.
- `displaySettings(prefs)` returns `{showWind, showConditions}` with the T0019 rules for each key.
- The Forecast settings card gets a checkbox `#config-show-conditions` below the wind checkbox.
  English: "Show sky conditions (sunny, cloudy, …)"; Dutch: "Toon het weerbeeld (zonnig, bewolkt, …)".
- **[Decided]** One hint below both checkboxes replaces the wind hint, `config.hint_hourly`.
  English: "Hourly rows need a tall enough screen."; Dutch: "Rijen per uur vragen een hoog genoeg scherm.".
- Save stores `showConditions` with the other settings and dispatches `settingschange`, as in T0019.

### Forecast rendering with `showConditions`
- Off: the summary has no condition icon, and no `.forecast-sky` cells are built.
- On: the summary starts with today's condition icon of the first hour, unchanged.
- On: each hour column gets a `.forecast-sky` cell between the time and the temperature.
  - It holds the hour's `weatherCondition()` icon, hidden from assistive technology, or stays empty.
  - Day and night variants follow `is_day`, as for the summary icon.
- On: the hour's screen reader sentence appends `forecast.hour_aria_condition` when the hour has a condition.
  English and Dutch: ", {condition}", with the localized condition name in lower case.
- **[Decided]** The legend gets no sky part; the icons explain themselves.

### Vertical space
- `.forecast-sky` cells use the T0019 media queries: hidden below 700px height, or below 800px from 480px wide.
- Both rows on must still fit with the search row open at 390x700 and 1280x800.
  Measure; if they do not fit, shrink the icons before raising the thresholds.

### Declared Files
- `index.html`
- `css/style.css`
- `js/forecast.js`
- `js/forecast-view.js`
- `js/config-view.js`
- `js/dom.js`
- `data/strings.en.json`
- `data/strings.nl.json`
- `tests/forecast.test.js`
- `tests/forecast-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`
- `README.md`

Mechanical command: python scripts/generate-sw.py generate

Size note: Thirteen files exceed the typical line, but strings and changelogs take one or two lines each.
The setting, its rendering and its layout rule form one feature that cannot merge apart.

### Tests
- Unit: `tests/forecast.test.js`, `displaySettings`:
  - returns both settings false for `{}`, `null`, `undefined` and a string;
  - turns each setting on only for its own stored `true`, independently of the other.
- Integration: `tests/forecast-browser.mjs`:
  - Scenario 6 keeps its summary icon checks with `showConditions` stored before loading.
  - New Scenario 15 at 1280x800 without stored settings:
    - the summary has no icon and the chart has no `.forecast-sky` cells;
    - Settings shows `#config-show-conditions` unchecked;
    - checking and saving shows the summary rain icon and twelve visible hourly icons, rain first, then clear-day;
    - the first hour's screen reader sentence ends with ", rain";
    - localStorage holds `showConditions: true`, and a reload keeps the icons;
    - with wind also on, the forecast fits with the search row open at 1280x800 and 390x700;
    - at 390x667 and 1280x799 the hourly icons are hidden and the summary icon stays;
    - unchecking and saving removes the summary icon and the hourly icons;
    - no console, page or network errors occur.

Completion check: npm test && npm run test:browser

Size estimate: 13 files, 220 lines
