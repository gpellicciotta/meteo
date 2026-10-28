# T0005 Walkthrough & Validation

## Key Changes
- `#start-content` is a size container; compact mode applies at a content height of 520px or less.
- Narrow content (352px or less wide) switches at 580px, because its text wraps onto more lines.
- `.start-content` uses `flex: 1 1 0`; with `auto`, Chrome evaluated the container query against a height of 0.
- Compact mode shows the current-location button as a 42px icon left of the field, with a tooltip.
- Compact mode moves the place name and update line below the chart card.
- `sw.js` was regenerated with `python scripts/generate-sw.py generate` (mechanical).
- `package.json` and `package-lock.json` moved to `0.1.1-pre` with `npm version 0.1.1-pre --no-git-tag-version` (mechanical).

## Height Scan
A scratch scan loaded a forecast and stepped the viewport height from 600 to 1000px in 4px steps.
Overflow now occurs only below the heights in this table, where even the compact layout cannot fit.

| Width | Before: scrollbar below | After: scrollbar below |
| :---- | :---------------------- | :--------------------- |
| 1280  | 808px                   | 720px                  |
| 700   | 792px                   | 704px                  |
| 390   | 692px                   | 628px                  |
| 360   | 728px                   | 616px                  |

Known limit: below these heights a scrollbar remains, for example at 320×568 and 800×560.
Near the threshold, the layout mode can differ per language, since Dutch text can wrap more.

## Review Round 1 Rework
The review found doubled card padding in the roomy layout below 480px wide.
A new check failed first, `node tests/forecast-browser.mjs`, exit code 1:

```text
ok - with enough height the place name stays above the chart
Check failed: with enough height the inner card adds no padding (8px)
```

After scoping the phone padding to compact mode, roomy sizes match the pre-change values.
At 390×844 the chart is 344px wide and the card 345px tall; at 360×800, 314px and 389px.

## Red Phase
`node tests/forecast-browser.mjs` before the markup and CSS changes, exit code 1:

```text
ok - no console, page or network errors
ok - a denied location shows its error
ok - no console, page or network errors
Check failed: the forecast fits without scrolling at 1280x800 (overflow 8px)
```

## Green Phase
`npm test`, exit code 0:

```text
 Test Files  2 passed (2)
      Tests  24 passed (24)
```

`npm run test:browser`, exit code 0:

```text
[... 44 lines omitted ...]
ok - the forecast fits without scrolling at 1280x800 (overflow 0px)
ok - the current-location button sits left of the search field
ok - the place name moves below the chart
ok - the icon button keeps its accessible name
ok - the forecast fits without scrolling at 390x667 (overflow 0px)
ok - with enough height the current-location button stays below the field
ok - with enough height the place name stays above the chart
ok - with enough height the inner card adds no padding (0px)
ok - no console, page or network errors
```

## Visual Verification
The local test server answered HTTP 200; no console, page or network errors were recorded.

- Before, 1280×800, forecast clipped: [before-1280x800-light.png](screenshots/before-1280x800-light.png).
- Before, 390×667: [before-390x667-light.png](screenshots/before-390x667-light.png).
- After, compact 1280×800: [light](screenshots/after-1280x800-light.png), [dark](screenshots/after-1280x800-dark.png).
- After, compact 390×667: [light](screenshots/after-390x667-light.png), [dark](screenshots/after-390x667-dark.png).
- After, compact 360×640: [light](screenshots/after-360x640-light.png), [dark](screenshots/after-360x640-dark.png).
- After, roomy 1280×900, unchanged look: [light](screenshots/after-1280x900-light.png), [dark](screenshots/after-1280x900-dark.png).
- After, roomy 390×844, unchanged look: [after-390x844-light.png](screenshots/after-390x844-light.png).
- Compact button tooltip on hover: [after-tooltip.png](screenshots/after-tooltip.png).
