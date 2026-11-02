# T0005 Technical Specifications

- **[Decided]** Detect short space in CSS with a container size query on `#start-content`, not a viewport media query.
  - `#start-content` gets `container: start-content / size`; its height comes from the flex layout, not its content.
  - Compact mode applies at `@container start-content (max-height: 520px)`.
  - Narrow containers (max 352px wide) switch at 580px, since text wraps more there.
  - `.start-content` needs `flex: 1 1 0`; with `auto`, Chrome queried a height of 0.
  - Measured roomy content heights: 484px at 1280 wide, 450px at 390, 519px at 360.
- **[Decided]** Keep the place name below the chart instead of dropping it.
  - The search field is empty after a reload and after "Use current location", so the name is the only place label then.
- **[Decided]** Change structure only in `index.html`; `js/forecast-view.js` keeps the same element ids.
  - `#btn-current-location` moves into `.start-action-row`, which becomes a grid.
  - Roomy grid: areas `"input submit" "locate locate"`, button centered under the field.
  - Compact grid: areas `"locate input submit"`, a 42px square icon button; the label stays as visually hidden text.
  - Compact tooltip `data-tooltip` "Use current location" via `data-i18n-tooltip`, shown only in compact mode.
  - `#forecast` holds `.forecast-meta` (place heading and update line) and `.forecast-card` (summary, chart, legend).
  - Roomy: `#forecast` keeps the card border and look; meta stays on top.
  - Compact: border moves to `.forecast-card`; `.forecast-meta` uses `order` to sit below it, as one centered wrapping line.

### Declared Files
- `index.html`
- `css/style.css`
- `tests/forecast-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`

Mechanical command: python scripts/generate-sw.py generate
Mechanical command: npm version 0.1.1-pre --no-git-tag-version

### Tests
- Unit test: none (markup and CSS only; `npm test` must still pass).
- Integration: a new scenario in `tests/forecast-browser.mjs` with a forecast loaded checks:
  - At 1280×800 and 390×667, `#start-content` has no vertical overflow.
  - At 1280×800, `#btn-current-location` sits left of `#location-input` on the same row.
  - At 1280×800, `#forecast-place` sits below `#forecast-chart`.
  - At 1280×800, the button keeps the accessible name "Use current location".
  - At 390×844, the button sits below the field and the place heading above the chart.
- Existing checks, including the attribution being visible at 1280×800, must still pass.

Completion check: npm test && npm run test:browser

Size estimate: 5 files, 180 lines

