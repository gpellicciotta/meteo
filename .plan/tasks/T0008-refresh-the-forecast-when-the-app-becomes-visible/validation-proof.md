# T0008 Validation Evidence

## Walkthrough & Validation
### Regression Failure
Both runs used the new tests with `js/forecast.js` and `js/forecast-view.js` at their base versions.

Command: `npm test`
Exit code: 1.
```text
[... 12 lines omitted ...]
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/forecast.test.js > isStale > turns stale after exactly 15 minutes
AssertionError: expected undefined to be 900000 // Object.is equality

- Expected:
900000

+ Received:
undefined

 ❯ tests/forecast.test.js:170:28
    168|
    169|   it("turns stale after exactly 15 minutes", () => {
    170|     expect(STALE_AFTER_MS).toBe(15 * 60 * 1000);
       |                            ^
    171|     expect(isStale(updatedAt, updatedAt.getTime() + (14 * 60 + 59) * 1…
    172|     expect(isStale(updatedAt, updatedAt.getTime() + 15 * 60 * 1000)).t…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  tests/forecast.test.js > isStale > is never stale without a forecast
TypeError: isStale is not a function
 ❯ tests/forecast.test.js:176:12
    174|
    175|   it("is never stale without a forecast", () => {
    176|     expect(isStale(null, Date.now())).toBe(false);
       |            ^
    177|   });
    178| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed | 1 passed (2)
      Tests  2 failed | 37 passed (39)
[... 3 lines omitted ...]
```

Command: `node tests/forecast-browser.mjs`
Exit code: 1. The refresh never reached the 10:16 update time.
```text
[... 108 lines omitted ...]
ok - no condition scenario console, page or network errors
ok - refresh scenario receives HTTP 200
ok - the first forecast is fetched at 10:00
ok - a 5-minute-old forecast is not refreshed
ok - a background refresh keeps the chart and shows no loading line
page.waitForFunction: Timeout 30000ms exceeded.
```

### Passing Tests
Command: `npm test`
Exit code: 0.
```text
[... 8 lines omitted ...]
 Test Files  2 passed (2)
      Tests  39 passed (39)
   Start at  18:49:54
   Duration  652ms (tests 63%, import 21%, transform 9%, worker 6%)

```

Command: `npm run test:browser`
Exit code: 0. All 138 checks passed; the refresh scenario is shown below.
```text
[... 132 lines omitted ...]
ok - refresh scenario receives HTTP 200
ok - the first forecast is fetched at 10:00
ok - a 5-minute-old forecast is not refreshed
ok - a background refresh keeps the chart and shows no loading line
ok - a 16-minute-old forecast is refreshed once on visibilitychange
ok - a stale forecast requests a refresh again
ok - a failed refresh keeps the chart and update time without an error
ok - a page restored from the back-forward cache refreshes a stale forecast
ok - an offline device skips the refresh
ok - no refresh scenario console, page or network errors
```

The full browser output is recorded in [browser-validation.txt](browser-validation.txt).
The refresh scenario intentionally answers one forecast with HTTP 500; its response and console entries are exempt.
Both browser scripts closed their browsers and in-process HTTP servers before returning.

### Offline Guard Mutation Check
The `navigator.onLine === false` guard was removed temporarily, then restored.

Command: `node tests/forecast-browser.mjs 2>&1 | tail -4`
```text
ok - a stale forecast requests a refresh again
ok - a failed refresh keeps the chart and update time without an error
ok - a page restored from the back-forward cache refreshes a stale forecast
Check failed: an offline device skips the refresh
```

### Visual Verification
No screenshots apply: the refresh adds no UI and leaves the rendered layout unchanged.
The browser scenario checks that the chart stays and no status line appears during a refresh.
