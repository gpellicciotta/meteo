# T0018 Technical Specifications

- **[Decided]** Remove the Open-Meteo link and the OpenStreetMap span from `.forecast-updated` in `index.html`.
- The update time stays as the only content of that line.
- Remove the `forecast.attribution` and `forecast.attribution_osm` strings in both languages.
- Remove `el.forecastAttributionOsm`, its toggle in `renderForecast()`, and the now unused link styles.
- The About view keeps its Data sources card with the Open-Meteo and Nominatim links and licenses.
- **[Decided]** The README keeps its attribution paragraphs; it documents the project, not the forecast view.
- **[Decided]** The first change after the v1.0.0 release opens a `v1.0.1-pre` heading.
  `package.json` follows as `1.0.1-pre`.

### Declared Files
- `index.html`
- `js/dom.js`
- `js/forecast-view.js`
- `css/style.css`
- `data/strings.en.json`
- `data/strings.nl.json`
- `tests/forecast-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`
- `package.json`

Mechanical command: python scripts/generate-sw.py generate

Size note: Ten files exceed the typical line, but each removal is a few lines of one change.

### Tests
- Unit: none; the change removes markup, strings and one class toggle without pure logic.
  The existing `tests/shell.test.js` dictionary checks must still pass with the keys removed.
- Integration: `tests/forecast-browser.mjs`.
  - Scenario 1: a searched place shows no link inside `#forecast`, and the update time is shown.
  - Scenario 2: a named current location shows no link inside `#forecast`.

Completion check: npm test && npm run test:browser

Size estimate: 10 files, 60 lines
