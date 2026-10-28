# T0017 Technical Specifications

- **[Decided]** Define `--color-rain` and `--color-rain-text` per accent in the existing accent blocks of `css/style.css`.
- This replaces the earlier choice of a fixed blue rain chart, at the user's request.
- Bars, amount labels, the wet summary and its condition icon already use these tokens or `currentColor`.

| Theme | Accent | `--color-rain` | `--color-rain-text` | Bar contrast on card | Text contrast on card |
| :---- | :----- | :------------- | :------------------ | :------------------- | :-------------------- |
| light | blue   | `#3b82f6`      | `#1d4ed8`           | 3.68                 | 6.70                  |
| light | yellow | `#ca8a04`      | `#854d0e`           | 2.94                 | 6.85                  |
| light | red    | `#ef4444`      | `#b91c1c`           | 3.76                 | 6.47                  |
| dark  | blue   | `#60a5fa`      | `#93c5fd`           | 5.75                 | 8.11                  |
| dark  | yellow | `#fbbf24`      | `#fde68a`           | 8.76                 | 11.75                 |
| dark  | red    | `#f87171`      | `#fca5a5`           | 5.29                 | 7.71                  |

- Contrast ratios are WCAG 2 values against the card colors `#ffffff` and `#1e293b`, computed for this task.
- **[Decided]** Light yellow bars use the accent `#ca8a04` at 2.94:1, just under 3:1.
  Each rainy bar also prints its amount as text, so the bar is not the only carrier.
- Blue keeps its current values.

### Declared Files
- `css/style.css`
- `tests/forecast-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`

Mechanical command: python scripts/generate-sw.py generate

### Tests
- Unit: none; the change only adds CSS custom property values without script logic.
- Integration: `tests/forecast-browser.mjs` Scenario 13 opens Brussel with `?theme={{theme}}&theme-color={{accent}}`.
  - For all six theme and accent pairs, a rainy `.forecast-bar` background equals `--color-rain` from the table.
  - The wet `#forecast-summary` and a `.forecast-amount` label use `--color-rain-text` from the table.

Completion check: npm run test:browser

Size estimate: 4 files, 70 lines
