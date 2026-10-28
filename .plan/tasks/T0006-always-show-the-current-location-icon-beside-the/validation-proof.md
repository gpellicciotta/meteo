# T0006 Walkthrough & Validation

## Key Changes
- The T0005 compact rules are now the only layout; the `@container start-content` query is gone.
- `.start-content` is back to `flex: 1 1 auto` without a `container` property.
- The current-location button is always a 42px icon left of the field, with a tooltip below it.
- Its label uses the existing `.sr-only` utility in `index.html` (undeclared file, two comment and class edits).
- The place name and the update line sit below the card as two centered lines.
- `sw.js` was regenerated with `python scripts/generate-sw.py generate` (mechanical).

## Height Scan
Smallest viewport heights without a scrollbar once a forecast is shown:

| Width | Before T0005 | T0006 |
| :---- | :----------- | :---- |
| 1280  | 808px        | 744px |
| 700   | 792px        | 728px |
| 390   | 692px        | 636px |
| 360   | 728px        | 620px |

The two-line place and update block needs about 24px more than the T0005 single line.

## Red Phase
`node tests/forecast-browser.mjs` after changing the checks, before the CSS change, exit code 1:

```text
ok - no console, page or network errors
Check failed: the current-location button sits left of the search field at 1280x900
```

## Green Phase
`npm test`, exit code 0:

```text
 Test Files  2 passed (2)
      Tests  24 passed (24)
```

`npm run test:browser`, exit code 0:

```text
[... 46 lines omitted ...]
ok - the current-location button sits left of the search field at 1280x900
ok - the place name sits below the chart at 1280x900
ok - the update time has its own line below the place name at 1280x900
ok - the current-location button sits left of the search field at 1280x800
ok - the place name sits below the chart at 1280x800
ok - the update time has its own line below the place name at 1280x800
ok - the forecast fits without scrolling at 1280x800 (overflow 0px)
ok - the current-location button sits left of the search field at 390x844
ok - the place name sits below the chart at 390x844
ok - the update time has its own line below the place name at 390x844
ok - the current-location button sits left of the search field at 390x667
ok - the place name sits below the chart at 390x667
ok - the update time has its own line below the place name at 390x667
ok - the forecast fits without scrolling at 390x667 (overflow 0px)
ok - the current-location button sits left of the search field at 320x568
ok - the place name sits below the chart at 320x568
ok - the update time has its own line below the place name at 320x568
ok - the icon button keeps its accessible name
ok - no console, page or network errors
```

## Visual Verification
The local test server answered HTTP 200; no console, page or network errors were recorded.
Before screenshots are the T0005 ones in `../T0005-use-a-compact-start-layout-with-the-forecast/screenshots/`.

- 1280×900: [light](screenshots/after-1280x900-light.png), [dark](screenshots/after-1280x900-dark.png).
- 1280×800: [light](screenshots/after-1280x800-light.png), [dark](screenshots/after-1280x800-dark.png).
- 390×844: [light](screenshots/after-390x844-light.png), [dark](screenshots/after-390x844-dark.png).
- 320×568: [light](screenshots/after-320x568-light.png), [dark](screenshots/after-320x568-dark.png).

At 320px wide the hour labels run together; the chart CSS is unchanged, so this predates the task.
Follow-up: T0007 in the Backlog.
