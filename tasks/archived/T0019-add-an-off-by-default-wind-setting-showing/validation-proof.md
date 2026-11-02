# T0019 Validation Proof

## Walkthrough & Validation

### Test-driven development
Before the implementation, `npx vitest run` exited 1:

```text
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  tests/forecast.test.js > displaySettings > turns wind off by default for {}
 FAIL  tests/forecast.test.js > displaySettings > turns wind off by default for null
 FAIL  tests/forecast.test.js > displaySettings > turns wind off by default for undefined
 FAIL  tests/forecast.test.js > displaySettings > turns wind off by default for "showWind"
 FAIL  tests/forecast.test.js > displaySettings > turns wind on only for a stored true
```

`node tests/forecast-browser.mjs` exited 1 at the first new check:

```text
Check failed: without a stored setting the forecast shows no wind
```

### Unit tests
`npm test`, exit code 0:

```text
 Test Files  2 passed (2)
      Tests  67 passed (67)
```

### Browser integration
`npm run test:browser`, exit code 0, 240 checks passed, none failed:

```text
ok - the forecast fits without scrolling at 1280x800 (overflow 0px)
ok - the forecast fits without scrolling at 390x667 (overflow 0px)
ok - Settings shows the wind checkbox unchecked by default
ok - saving the setting shows twelve hourly wind cells and the legend part (40, 20, 12 visible)
ok - localStorage remembers the wind setting
ok - hourly wind is shown at 1280x800
ok - the forecast with search row fits without scrolling at 1280x800 (overflow 0px)
ok - hourly wind is shown at 390x700
ok - the forecast with search row fits without scrolling at 390x700 (overflow 0px)
ok - hourly wind is hidden at 1280x799
ok - hourly wind is hidden at 390x667
ok - the forecast with search row fits without scrolling at 390x667 (overflow 0px)
ok - hourly wind is shown at 390x844
ok - the forecast with search row fits without scrolling at 390x844 (overflow 0px)
[... remaining passing lines omitted ...]
```

### Visual verification
The local static server answered HTTP 200; the browser checks found no console, page or network errors.

| View            | Before                                         | After                                          |
| :-------------- | :--------------------------------------------- | :--------------------------------------------- |
| Wind off, phone | [light](before/wind-off-mobile-light.png)      | [light](after/wind-off-mobile-light.png)       |
| Wind on, phone  | —                                              | [light](after/wind-on-mobile-light.png), [dark](after/wind-on-mobile-dark.png) |
| Wind on, desktop | —                                             | [light](after/wind-on-desktop-light.png), [dark](after/wind-on-desktop-dark.png) |
| Settings, phone | [light](before/settings-mobile-light.png)      | [light](after/settings-mobile-light.png), [dark](after/settings-mobile-dark.png) |
| Settings, desktop | [dark](before/settings-desktop-dark.png)     | [dark](after/settings-desktop-dark.png)        |
