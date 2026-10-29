# T0022 Validation Proof

## Walkthrough & Validation

### Test-driven development
Before the implementation, `npx vitest run` exited 1:

```text
 FAIL  tests/units.test.js [ tests/units.test.js ]
Error: Cannot find module '../js/units.js' imported from C:/Dev-Projects/meteo/tests/units.test.js
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  tests/forecast.test.js > reversePlace > maps a town answer to its name, province and country
AssertionError: expected { name: 'Sint-Niklaas', …(2) } to deeply equal { name: 'Sint-Niklaas', …(3) }
 FAIL  tests/forecast.test.js > reversePlace > prefers city, then village, and the province before the state
AssertionError: expected { name: 'Gent', …(2) } to deeply equal { name: 'Gent', …(3) }
      Tests  2 failed | 69 passed (71)
```

`node tests/forecast-browser.mjs` exited 1 in Scenario 17, which found no unit selects:

```text
page.evaluate: TypeError: Cannot read properties of null (reading 'value')
```

### Unit tests
`npm test`, exit code 0:

```text
 Test Files  3 passed (3)
      Tests  95 passed (95)
```

### Browser integration
`npm run test:browser`, exit code 0, 303 checks passed, none failed:

```text
ok - units scenario receives HTTP 200
ok - without stored units a searched place shows metric units
ok - Settings shows the metric units by default
ok - a theme-only save stores no units
ok - Settings still shows metric before choosing units
ok - the summary uses °F, in and mph (Rain expected from 13:00 (up to 0.10 in per hour).
ok - the chart uses °F, in and mph (49°, 0.02, <0.01, 25)
ok - the hour description uses the units (14:00: 0.05 in rain, 70% chance, 53 °F, wind 12 mph)
ok - localStorage remembers the chosen units
ok - a reload keeps the chosen units
ok - the guide sample follows the chosen units
ok - the guide texts name the chosen units (Rain or snow expected in that hour (in). Shown from 0.0039 in.)
ok - stored units are kept when a current location follows
ok - a current location in US prefills f/in/mph
ok - the forecast for US shows the prefilled units
ok - a current location in BE prefills c/mm/kmh
ok - the forecast for BE shows the prefilled units
ok - a denied location stores no units and keeps metric
ok - no units console, page or network errors
[... remaining passing lines omitted ...]
```

### Visual verification
The local static server answered HTTP 200; the browser checks found no console, page or network errors.

| View                 | Before                                              | After                                              |
| :------------------- | :-------------------------------------------------- | :------------------------------------------------- |
| Default, phone       | [light](before/search-row-hidden-mobile-light.png)  | [light](after/search-row-hidden-mobile-light.png)  |
| Imperial, phone      | —                                                   | [light](after/units-imperial-mobile-light.png), [dark](after/units-imperial-mobile-dark.png) |
| Imperial, desktop    | —                                                   | [light](after/units-imperial-desktop-light.png), [dark](after/units-imperial-desktop-dark.png) |
| US prefill, phone    | —                                                   | [light](after/units-prefilled-us-mobile-light.png) |
| Settings, phone      | [dark](before/settings-mobile-dark.png)             | [dark](after/settings-mobile-dark.png), [light](after/settings-mobile-light.png) |
| Settings, desktop    | [light](before/settings-desktop-light.png)          | [light](after/settings-desktop-light.png)          |
