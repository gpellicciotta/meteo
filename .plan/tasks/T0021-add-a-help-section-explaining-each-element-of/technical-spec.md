# T0021 Technical Specifications

### Guide card
- **[Decided]** Add an `about-guide-card` as the first card of the About view.
  Heading: "Reading the forecast" / "De voorspelling lezen".
  Intro: "A sample forecast with every option on. The numbers match the list below." /
  "Een voorbeeldvoorspelling met alle opties aan. De nummers horen bij de lijst eronder.".
- `#guide-sample` holds a `.forecast-card` with a summary and chart, then a place and update line.
  It is hidden from assistive technology; the numbered list carries the same information.
- The sample always shows wind and sky rows, whatever the settings and screen height.
- **[Decided]** The sample data lives in a new pure module `js/guide-sample.js`.
  - `guideHours()` returns the 12 hours parsed by `parseForecast()` from a fixed 13-step response.
  - Rain from 13:00 up to 2.6 mm, gusts to 62 km/h, day icons until 17:00 and night icons after.
- **[Decided]** A new `js/guide.js` renders the sample with the forecast view's own renderers.
  - `renderSummary()` and `renderChart()` move out of `renderForecast()` and are exported, unchanged in output.
  - The first column reads "Now"; the update line reads "Updated at 10:20"; the place is "Ghent, Belgium" / "Gent, België".
  - The sample re-renders on `languagechange`.

### Numbered badges
- Ten badges sit in side gutters of the sample, alternating left (odd) and right (even).
- Each badge is vertically centered on its element; a `ResizeObserver` repositions them.

| Nr | Element      | Target                                 |
| :- | :----------- | :------------------------------------- |
| 1  | Summary      | `.forecast-summary`                    |
| 2  | Rain amount  | `.forecast-amount` of the wettest hour |
| 3  | Rain bar     | `.forecast-bar-track` of that hour     |
| 4  | Chance       | `.forecast-chance` of the last hour    |
| 5  | Hour         | `.forecast-time` of the first hour     |
| 6  | Sky          | `.forecast-sky` of the last hour       |
| 7  | Temperature  | `.forecast-temp` of the first hour     |
| 8  | Wind         | `.forecast-wind` of the last hour      |
| 9  | Place        | the place line                         |
| 10 | Update time  | the update line                        |

### Explanations
- An ordered list `.guide-list` gives each number a title and one or two sentences, in both languages.
- Texts follow the code: the 0.1 mm wet threshold, the 2 mm minimum bar scale, Open-Meteo's preceding-hour probability,
  temperature and wind at the start of the hour, the 15-minute refresh, and the setting each row needs.

### Legend removal
- Remove `.forecast-legend` with `#forecast-legend-wind`, `forecast.legend`, `forecast.legend_wind`,
  `el.forecastLegendWind`, its toggle and styles.
- **[Decided]** Scope the hourly-row media query to `#forecast-chart`, so the guide sample keeps its rows.
- **[Decided]** Keep the 700px and 800px height thresholds; the freed legend height adds slack.

### Declared Files
- `index.html`
- `css/style.css`
- `js/forecast-view.js`
- `js/guide.js`
- `js/guide-sample.js`
- `js/app.js`
- `js/dom.js`
- `data/strings.en.json`
- `data/strings.nl.json`
- `tests/forecast.test.js`
- `tests/forecast-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`
- `README.md`

Mechanical command: python scripts/generate-sw.py generate

Combined task: Exporting the renderers is a fix-up the guide needs; the guide cannot reuse them otherwise.
Size note: Fourteen files exceed the typical line; strings and changelogs are short, and the guide is one feature.

### Tests
- Unit: `tests/forecast.test.js`, `guideHours`:
  - returns 12 hours starting at 10:00, with a first wet hour at 13:00 and a maximum of 2.6 mm;
  - has wind on every hour, gusts reaching 62 km/h, and a condition on every hour;
  - includes day icons before 17:00 and night icons after.
- Integration: `tests/forecast-browser.mjs`:
  - Scenario 14 drops its legend checks; the main card has no `.forecast-legend`.
  - New Scenario 16 opens About without stored settings, at 390x844, 320x568 and 1280x800:
    - the sample shows a summary icon, three summary lines, 12 columns, 12 sky icons and 12 wind cells;
    - at 390x600 the sample still shows its sky and wind rows;
    - ten visible badges, numbered 1 to 10, each vertically centered on its target within 2px;
    - badges and sample stay inside the viewport without horizontal scrolling;
    - the list has ten items with non-empty titles and texts;
    - switching to Dutch re-renders the sample summary in Dutch;
    - no console, page or network errors occur.

Completion check: npm test && npm run test:browser

Size estimate: 14 files, 420 lines
