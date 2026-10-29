# T0020 Validation Proof

## Walkthrough & Validation

### Test-driven development
Before the implementation, `npx vitest run` exited 1:

```text
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  tests/forecast.test.js > displaySettings > turns wind and sky conditions off by default for {}
 FAIL  tests/forecast.test.js > displaySettings > turns wind and sky conditions off by default for null
 FAIL  tests/forecast.test.js > displaySettings > turns wind and sky conditions off by default for undefined
 FAIL  tests/forecast.test.js > displaySettings > turns wind and sky conditions off by default for "showWind"
 FAIL  tests/forecast.test.js > displaySettings > turns wind on only for a stored true
 FAIL  tests/forecast.test.js > displaySettings > turns sky conditions on only for a stored true, independently of wind
```

`node tests/forecast-browser.mjs` exited 1 at the first new check:

```text
Check failed: without a stored setting the forecast shows no condition icons
```

### Unit tests
`npm test`, exit code 0:

```text
 Test Files  2 passed (2)
      Tests  68 passed (68)
```

### Browser integration
`npm run test:browser`, exit code 0, 260 checks passed, none failed:

```text
ok - Settings shows the sky checkbox unchecked by default
ok - saving the setting shows twelve hourly icons (icon icon-weather-rain forecast-sky-icon, icon icon-weather-clear-day forecast-sky-icon)
ok - the first hour description ends with its condition (Now: 0.0 mm rain, 5% chance, 10 °C, rain)
ok - localStorage remembers the sky setting
ok - a reload keeps the hourly icons shown
ok - hourly icons are shown and the summary icon stays at 1280x800
ok - the forecast with both rows and the search row fits at 1280x800 (overflow 0px)
ok - hourly icons are shown and the summary icon stays at 390x700
ok - the forecast with both rows and the search row fits at 390x700 (overflow 0px)
ok - hourly icons are hidden and the summary icon stays at 1280x799
ok - hourly icons are hidden and the summary icon stays at 390x667
ok - the forecast with both rows and the search row fits at 390x667 (overflow 0px)
ok - hourly icons are hidden and the summary icon stays at 320x568
ok - the hour description follows the Dutch language switch (Nu: 0,0 mm regen, 5% kans, 10 °C, regen, wind 40 km/u)
ok - turning the setting off removes the summary and hourly icons
[... remaining passing lines omitted ...]
```

### Visual verification
The local static server answered HTTP 200; the browser checks found no console, page or network errors.

| View                 | Before                                              | After                                              |
| :------------------- | :-------------------------------------------------- | :------------------------------------------------- |
| Default, phone       | [light](before/search-row-hidden-mobile-light.png)  | [light](after/search-row-hidden-mobile-light.png)  |
| Default, desktop     | [dark](before/search-row-hidden-desktop-dark.png)   | [dark](after/search-row-hidden-desktop-dark.png)   |
| Sky on, phone        | —                                                   | [light](after/sky-on-mobile-light.png), [dark](after/sky-on-mobile-dark.png) |
| Sky and wind, phone  | —                                                   | [light](after/sky-wind-on-mobile-light.png), [dark](after/sky-wind-on-mobile-dark.png) |
| Sky and wind, desktop | —                                                  | [light](after/sky-wind-on-desktop-light.png), [dark](after/sky-wind-on-desktop-dark.png) |
| Night icon, phone    | [dark](before/condition-night-mobile-dark.png)      | [dark](after/condition-night-mobile-dark.png)      |
| Settings (Dutch)     | —                                                   | [light](after/settings-mobile-light.png), [dark](after/settings-mobile-dark.png) |
