# T0015 Technical Specifications
- **[Decided]** Remove `padding-right: 48px` from `.view-header` in `css/style.css`.
- `.about-header` and `.config-header` set `padding: 10px 0` and use spacers, so they do not change.
- Measured before the fix at 390px: start header center 195, title and description center 171.
- Measured before the fix at 1280px: start header center 640, title and description center 616.

### Declared Files
- `css/style.css`
- `tests/shell-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`

Mechanical command: python scripts/generate-sw.py generate

### Tests
- Unit: none; the fix is one CSS declaration without script logic.
- Integration: `tests/shell-browser.mjs` checks at 390px and 1280px.
  - `#start-title` and `#start-desc` centers lie within 1px of the `#start-content` center.
  - The About title center lies within 1px of the About screen center.

Completion check: npm run test:browser

Size estimate: 4 files, 20 lines
