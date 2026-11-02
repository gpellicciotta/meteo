# T0006 Technical Specifications

- **[Decided]** The user asked for one layout at all sizes; it supersedes the T0005 height switch.
- **[Decided]** Remove `@container start-content` and the `container` property from `.start-content`.
  - `.start-content` returns to `flex: 1 1 auto`; the zero basis existed only for the container query.
- `.start-action-row` is always the grid `"locate input submit"`, also below 380px wide.
  - The narrow-phone rules that stacked the input, submit and locate buttons are removed.
- `#btn-current-location` is always a 42px square icon button with a visually hidden label and a tooltip below it.
- `#forecast` is always a flex column: `.forecast-card` carries the border, `.forecast-meta` sits below it.
- `.forecast-meta` shows two centered lines:
  - Line 1: `#forecast-place`, small bold text.
  - Line 2: update time, separator and Open-Meteo attribution.
- Phone card padding stays `12px 8px` below 480px wide.

### Declared Files
- `css/style.css`
- `tests/forecast-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`

Mechanical command: python scripts/generate-sw.py generate

### Tests
- Unit test: none (CSS only; `npm test` must still pass).
- Integration: the compact scenario in `tests/forecast-browser.mjs` checks at 1280x900, 1280x800, 390x844, 390x667 and 320x568:
  - `#btn-current-location` sits left of `#location-input` on the same row.
  - `#forecast-place` sits below `#forecast-chart`.
  - The update line sits below the place name, on its own line.
  - The icon button keeps the accessible name "Use current location".
- Integration: no vertical overflow at 1280x800 and 390x667.
- Existing checks, including the attribution being visible at 1280x800, must still pass.

Completion check: npm test && npm run test:browser

Size estimate: 4 files, 150 lines
