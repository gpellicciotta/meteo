# T0019 Technical Specifications

### Setting
- **[Decided]** Store the setting as `showWind` in the existing `meteo_preferences` localStorage object.
- Only the boolean `true` turns wind on; a missing or other value means off.
- `displaySettings(prefs)` in `js/forecast.js` returns `{showWind}` from a preferences object.
  It accepts `null` and non-objects and returns the defaults.
- **[Decided]** Add a second settings card, "Forecast" / "Voorspelling", below the General card.
  - It holds a checkbox `#config-show-wind`, "Show wind" / "Toon wind".
  - A hint below reads "Hourly wind needs a tall enough screen." / "Wind per uur vraagt een hoog genoeg scherm.".
- Opening Settings fills the checkbox from storage; closing without saving discards changes.
- Save stores `showWind` with the other settings, then dispatches a `settingschange` event on `document`.
- The forecast view re-renders the shown forecast on `settingschange`.

### Forecast rendering with `showWind`
- Off: the summary has no wind sentence, and no `.forecast-wind` cells are built.
- On: the summary keeps today's wind and gust sentence rules.
- On: each hour column ends with a `.forecast-wind` cell below the temperature.
  - It holds the wind speed rounded to whole km/h, or "–" when missing.
  - Gusts stay in the summary only. **[Decided]** Wind direction stays out of scope.
- On: the screen reader sentence of each hour appends `forecast.hour_aria_wind`.
  English: ", wind {wind} km/h"; Dutch: ", wind {wind} km/u".
- On: the legend appends `.forecast-legend-wind`: "The bottom row shows wind in km/h." / "De onderste rij toont de wind in km/u.".

### Vertical space
- Measured with the search row open, the current forecast stops scrolling at about 645px on phones.
  Desktop widths need about 755px, because of the taller 120px bar track.
- Each added row takes about 20px, and T0020 adds another one.
- **[Decided]** Hide `.forecast-wind` and `.forecast-legend-wind` with CSS media queries:
  - below 700px height at any width;
  - below 800px height from 480px width.
- The summary line stays, as it already fits today's layouts.

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
- `package.json`

Mechanical command: python scripts/generate-sw.py generate
Mechanical command: npm install --package-lock-only --ignore-scripts

Size note: Fourteen files exceed the typical line, but strings, changelogs and version files take one or two lines each.
The setting, its rendering and its layout rule form one feature that cannot merge apart.

### Tests
- Unit: `tests/forecast.test.js`, `displaySettings`:
  - returns `{showWind: false}` for `{}`, `null`, `undefined` and a string;
  - returns `{showWind: true}` only for `showWind: true`, and false for `"true"` and `1`.
- Integration: `tests/forecast-browser.mjs`:
  - Scenarios 1 and 5 keep their wind summary checks with `showWind` stored before loading.
  - New Scenario 14 at 1280x800 without stored settings:
    - the summary has no wind sentence and the chart has no `.forecast-wind` cells;
    - Settings shows `#config-show-wind` unchecked;
    - checking it and saving shows the wind sentence and twelve visible wind cells, "40" first, then "20";
    - localStorage holds `showWind: true`, and a reload keeps the wind shown;
    - the forecast fits without scrolling at 1280x800 and 390x700 with the search row open;
    - at 390x667 and 1280x799 the wind cells and legend part are hidden; the summary keeps wind;
    - the first hour's screen reader sentence ends with ", wind 40 km/h";
    - unchecking and saving removes the wind sentence and cells;
    - no console, page or network errors occur.

Completion check: npm test && npm run test:browser

Size estimate: 14 files, 260 lines
