# T0027 Technical Specifications

- **[Decided]** The user chose white text on the current yellows over darker text or lighter tints.
  Users who need more contrast can pick the blue or red accent.
- Set `--color-on-primary` to `#ffffff` in the light and dark yellow accent blocks of `css/style.css`.
- The yellows stay `#ca8a04` (light) and `#d97706` (dark); hover shades `#a16207` and `#b45309` stay too.
- WCAG 2 contrast of white text, computed for this task: 2.94 on `#ca8a04`, 3.19 on `#d97706`,
  4.92 on `#a16207` and 5.02 on `#b45309`.
- The comment above the light yellow block no longer claims WCAG AA text contrast.

### Declared Files
- `css/style.css`
- `tests/forecast-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`

Mechanical command: python scripts/generate-sw.py generate

### Tests
- Unit: none; the change only edits CSS custom property values.
- Integration: `tests/forecast-browser.mjs` Scenario 13:
  - for all six theme and accent pairs, the Show button and the footer buttons use white text;
  - yellow keeps its button backgrounds, `#ca8a04` in light and `#d97706` in dark.

Completion check: npm run test:browser

Size estimate: 4 files, 30 lines
