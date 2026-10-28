# T0011 Technical Specifications

- **[Decided]** Label the first column "Now" only while it is the current hour.
  - The current hour is the hour of `now` in the forecast timezone.
  - Compare it with the first hour's `time`, which Open-Meteo gives in that timezone through `timezone=auto`.
  - Otherwise, such as before a T0008 refresh lands, keep the clock time.
- Add the class `is-now` to that `.forecast-hour`; `.is-now .forecast-time` uses `font-weight: 700`.
- New strings in `data/strings.en.json` and `data/strings.nl.json`:
  - `forecast.now`: "Now" / "Nu".
  - `forecast.summary_rain_now`: "Rain expected now (up to {max} mm per hour)." / Dutch equivalent.
- The hidden hour description uses "Now" too, for screen readers.
- Put the "is this the current hour" rule in a pure function in `js/forecast.js`.

### Declared Files
- `js/forecast.js`
- `js/forecast-view.js`
- `css/style.css`
- `data/strings.en.json`
- `data/strings.nl.json`
- `tests/forecast.test.js`
- `tests/forecast-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`

Size note: 9 counted files but under 100 lines; strings and changelogs come in language pairs.

Mechanical command: python scripts/generate-sw.py generate

### Tests
- Unit: the current-hour check is true for the hour containing `now` in the forecast timezone.
- Unit: the check is false one hour later, and across a timezone different from the browser's.
- Integration: `tests/forecast-browser.mjs` with a controlled clock:
  - The first time label reads "Now" in English and "Nu" in Dutch.
  - The other labels keep their clock times.
  - With rain in the first hour, the summary says rain is expected now.

Completion check: npm test && npm run test:browser

Size estimate: 9 files, 100 lines
