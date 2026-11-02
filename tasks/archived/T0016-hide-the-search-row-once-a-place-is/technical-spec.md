# T0016 Technical Specifications
- **[Decided]** Hide `#location-form`, which only holds `.start-action-row`, with the `hidden` class.
- **[Decided]** Hide it after a user or startup load renders a forecast:
  - after a non-quiet `loadForecast` success: place choice, single search match, current location, startup reload;
  - after `showSavedForecast` renders a saved forecast at startup.
- Quiet refreshes and language switches leave the row as it is.
- A failed load keeps the row as it is; the error shows below it.
- **[Decided]** Show the row whenever `renderForecast` hides the forecast, so the app is never stuck without search.
- **[Decided]** Add `#btn-change-place` as the first button of `.start-meta-actions` in the footer.
  - Classes `start-meta-item start-meta-btn start-meta-btn-action`, new `search` icon in `js/icons.js`.
  - Visible only while a forecast is shown.
  - Toggles the row; `aria-expanded` and `aria-controls="location-form"` reflect the state.
  - Opening focuses `#location-input`.
- Strings, en and nl:
  - `start.btn_change_place_aria` / `start.btn_change_place_tooltip`: "Search another place" / "Zoek een andere plaats".
  - `about.icon_search_title`: "Search" / "Zoeken".
  - `about.icon_search_desc`: "Show the search field again to pick another place." / "Toon het zoekveld opnieuw om een andere plaats te kiezen."
- Add a matching About icons list entry after the current location entry.
- **[Decided]** A pure `searchRowOpen(open, event, forecastShown)` in `js/forecast.js` decides the row state:
  - `forecastShown` false: open, whatever the event.
  - `event` `"chosen"`: closed, after a forecast for a newly chosen place renders.
  - `event` `"toggled"`: the opposite of `open`, for the footer button.
  - `event` `"rendered"`: unchanged, for refreshes and language switches.

### Declared Files
- `index.html`
- `js/forecast.js`
- `js/forecast-view.js`
- `js/dom.js`
- `js/icons.js`
- `data/strings.en.json`
- `data/strings.nl.json`
- `tests/forecast.test.js`
- `tests/forecast-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`

Mechanical command: python scripts/generate-sw.py generate

### Tests
- Unit: `searchRowOpen` in `tests/forecast.test.js`:
  - Returns true for every event when no forecast is shown.
  - Returns false for `"chosen"` with a forecast, from open and closed.
  - Flips the state for `"toggled"` with a forecast.
  - Keeps the state for `"rendered"` with a forecast.
- Integration: `tests/forecast-browser.mjs` scenarios:
  - Choosing Gent hides `#location-form` and shows `#btn-change-place` with `aria-expanded="false"`.
  - Clicking `#btn-change-place` shows the form, focuses `#location-input`, and sets `aria-expanded="true"`.
  - Clicking it again hides the form.
  - The current location flow hides the form once the forecast shows.
  - A start without a saved place shows the form and hides `#btn-change-place`.
  - A reload with a saved place starts with the form hidden.
  - A failed first forecast keeps the form visible with the error.

Completion check: npm test && npm run test:browser

Size estimate: 11 files, 190 lines

Size note: 11 counted files exceed the typical 8. Most are small markup, string and changelog edits for one footer button.
