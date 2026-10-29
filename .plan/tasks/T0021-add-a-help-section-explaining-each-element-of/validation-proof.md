# T0021 Validation Proof

## Walkthrough & Validation

### Test-driven development
Before the implementation, `npx vitest run` exited 1:

```text
FAIL  tests/forecast.test.js [ tests/forecast.test.js ]
Error: Cannot find module '../js/guide-sample.js' imported from C:/Dev-Projects/meteo/tests/forecast.test.js
```

`node tests/forecast-browser.mjs` exited 1 in Scenarios 14 and 16:

```text
Check failed: the forecast card has no legend, which the About guide replaces
ok - guide scenario receives HTTP 200
page.evaluate: TypeError: Cannot read properties of null (reading 'querySelectorAll')
```

### Unit tests
`npm test`, exit code 0:

```text
 Test Files  2 passed (2)
      Tests  71 passed (71)
```

### Browser integration
`npm run test:browser`, exit code 0, 284 checks passed, none failed:

```text
ok - the forecast card has no legend, which the About guide replaces
ok - guide scenario receives HTTP 200
ok - the guide sample shows the full summary at 390x844
ok - the guide sample shows every hourly row at 390x844 (12 sky, 12 wind)
ok - the guide stays inside the viewport at 390x844
ok - the guide lists ten explained elements at 390x844
ok - the guide sample shows the full summary at 320x568
ok - the guide sample shows every hourly row at 320x568 (12 sky, 12 wind)
ok - the guide stays inside the viewport at 320x568
ok - the guide lists ten explained elements at 320x568
ok - the guide sample shows the full summary at 1280x800
ok - the guide sample shows every hourly row at 1280x800 (12 sky, 12 wind)
ok - the guide stays inside the viewport at 1280x800
ok - the guide lists ten explained elements at 1280x800
ok - the guide sample shows the full summary at 390x600
ok - the guide sample shows every hourly row at 390x600 (12 sky, 12 wind)
ok - the guide stays inside the viewport at 390x600
ok - the guide lists ten explained elements at 390x600
ok - the guide sample follows the Dutch language switch
ok - no guide console, page or network errors
[... remaining passing lines omitted ...]
```

### Visual verification
The local static server answered HTTP 200; the browser checks found no console, page or network errors.
A manual 320x700 capture confirmed the phone sample keeps its temperatures apart after shrinking them.

| View              | Before                                              | After                                              |
| :---------------- | :-------------------------------------------------- | :------------------------------------------------- |
| Forecast, phone   | [light](before/search-row-hidden-mobile-light.png)  | [light](after/search-row-hidden-mobile-light.png)  |
| Forecast, desktop | [dark](before/search-row-hidden-desktop-dark.png)   | [dark](after/search-row-hidden-desktop-dark.png)   |
| About, phone      | [light](before/about-mobile-light.png), [dark](before/about-mobile-dark.png) | [light](after/guide-mobile-light.png), [dark](after/guide-mobile-dark.png) |
| About, desktop    | [light](before/about-desktop-light.png), [dark](before/about-desktop-dark.png) | [light](after/guide-desktop-light.png), [dark](after/guide-desktop-dark.png) |
| About, Dutch      | —                                                   | [phone](after/guide-nl-mobile-light.png), [desktop](after/guide-nl-desktop-dark.png) |
