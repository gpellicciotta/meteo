# T0016 Validation Proof

## Walkthrough & Validation
The validator requires evidence in this companion file rather than an inline task section.

### Test-driven development
Before implementation, `npm test` exited 1 with the six new `searchRowOpen` tests failing:

```text
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  tests/forecast.test.js > searchRowOpen > opens the row on chosen when no forecast is shown
 FAIL  tests/forecast.test.js > searchRowOpen > opens the row on toggled when no forecast is shown
 FAIL  tests/forecast.test.js > searchRowOpen > opens the row on rendered when no forecast is shown
TypeError: searchRowOpen is not a function
 FAIL  tests/forecast.test.js > searchRowOpen > closes the row once a forecast for a chosen place is shown
TypeError: searchRowOpen is not a function
 FAIL  tests/forecast.test.js > searchRowOpen > flips the row with the footer button while a forecast is shown
```

`node tests/forecast-browser.mjs` exited 1 with the new row checks failing:

```text
Check failed: the current location forecast hides the search row
Check failed: choosing a place hides the search row
```

### Unit tests
`npm test`, exit code 0:

```text
[... 8 lines omitted ...]
 Test Files  2 passed (2)
      Tests  62 passed (62)
   Start at  20:33:32
   Duration  781ms (tests 63%, import 21%, transform 10%, worker 6%)
```

### Browser integration
`npm run test:browser`, exit code 0, 199 checks passed, none failed:

```text
ok - the current location forecast hides the search row
ok - search row scenario receives HTTP 200
ok - a start without a saved place shows the search row and no change place button
ok - choosing a place hides the search row
ok - the change place button is shown, collapsed
ok - the change place button has an English name
ok - the change place button shows the search row
ok - showing the search row focuses the search field
ok - the change place button is expanded
ok - the change place button hides the search row again
ok - the change place button has a Dutch name
ok - a language switch keeps the search row hidden
ok - a start with a saved place hides the search row
ok - About lists the search icon
ok - no search row console, page or network errors
ok - a failed first forecast keeps the search row and hides the change place button
[... remaining passing lines omitted ...]
```

### Visual verification
The local static server answered HTTP 200; the browser checks found no console, page or network errors.
The expected HTTP 500 forecast in Scenario 12 is filtered from the error gate, as in earlier scenarios.

| View              | Before                                          | After                                                    |
| :---------------- | :---------------------------------------------- | :------------------------------------------------------- |
| Forecast, phone   | [light](before/forecast-en-mobile-light.png)    | [row hidden](after/search-row-hidden-mobile-light.png)   |
| Forecast, phone   | [dark](before/forecast-en-mobile-dark.png)      | [row hidden](after/search-row-hidden-mobile-dark.png)    |
| Forecast, desktop | [light](before/forecast-en-desktop-light.png)   | [row hidden](after/search-row-hidden-desktop-light.png)  |
| Forecast, desktop | [dark](before/forecast-en-desktop-dark.png)     | [row shown](after/search-row-shown-desktop-dark.png)     |
| Row reopened      | —                                               | [phone light](after/search-row-shown-mobile-light.png)   |
