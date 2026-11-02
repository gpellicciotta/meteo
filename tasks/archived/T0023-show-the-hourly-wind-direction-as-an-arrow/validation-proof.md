# T0023 Validation Proof

## Walkthrough & Validation

### Test-driven development
Before the implementation, `npx vitest run` exited 1 with 13 failed tests, among them:

```text
 FAIL  tests/forecast.test.js > parseForecast > turns 13 hourly steps into 12 hours with the rain of the following hour
 FAIL  tests/forecast.test.js > parseForecast > takes the instantaneous wind direction from the start of each hour
 FAIL  tests/forecast.test.js > compassPoint > names 0 degrees "n"
 FAIL  tests/forecast.test.js > restoreForecast > accepts hours saved without a wind direction by older versions
 FAIL  tests/forecast.test.js > restoreForecast > ignores a malformed saved forecast without throwing
 FAIL  tests/forecast.test.js > weather API client > builds the documented geocoding and forecast URLs
```

`node tests/forecast-browser.mjs` exited 1:

```text
Check failed: bars carry a screen reader description (14:00: 1.2 mm rain, 70% chance, 12 °C, wind 20 km/h)
Check failed: the first hour description ends with its wind (Now: 0.0 mm rain, 5% chance, 10 °C, wind 40 km/h)
Check failed: the hour description follows the Dutch language switch (Nu: 0,0 mm regen, 5% kans, 10 °C, regen, wind 40 km/u)
Check failed: the chart uses °F, in and mph (49°, 0.02, <0.01, )
```

### Unit tests
`npm test`, exit code 0:

```text
 Test Files  3 passed (3)
      Tests  105 passed (105)
```

### Browser integration
`npm run test:browser`, exit code 0, 305 checks passed, none failed:

```text
ok - bars carry a screen reader description (14:00: 1.2 mm rain, 70% chance, 12 °C, wind 20 km/h from the southwest)
ok - the first hour description ends with its wind (Now: 0.0 mm rain, 5% chance, 10 °C, wind 40 km/h from the southwest)
ok - every wind cell has an arrow pointing northeast above its speed (rotate(45deg))
ok - without directions the wind cells show no arrows and no direction
ok - the forecast with both rows and the search row fits at 1280x800 (overflow 0px)
ok - the forecast with both rows and the search row fits at 390x700 (overflow 0px)
ok - the forecast with both rows and the search row fits at 390x667 (overflow 0px)
ok - the hour description follows the Dutch language switch (Nu: 0,0 mm regen, 5% kans, 10 °C, regen, wind 40 km/u uit het zuidwesten)
ok - the hour description uses the units (14:00: 0.05 in rain, 70% chance, 53 °F, wind 12 mph from the southwest)
[... remaining passing lines omitted ...]
```

### Visual verification
The local static server answered HTTP 200; the browser checks found no console, page or network errors.

| View               | Before                                        | After                                        |
| :----------------- | :-------------------------------------------- | :------------------------------------------- |
| Wind on, phone     | [light](before/sky-wind-on-mobile-light.png)  | [light](after/sky-wind-on-mobile-light.png), [dark](after/sky-wind-on-mobile-dark.png) |
| Wind on, desktop   | [dark](before/sky-wind-on-desktop-dark.png)   | [dark](after/sky-wind-on-desktop-dark.png), [light](after/sky-wind-on-desktop-light.png) |
| Guide, phone       | [light](before/guide-mobile-light.png)        | [light](after/guide-mobile-light.png), [dark](after/guide-mobile-dark.png) |
| Guide, desktop     | [light](before/guide-desktop-light.png)       | [light](after/guide-desktop-light.png)       |
