# T0010 Validation Proof

## Walkthrough & Validation
### Unit regression proof
Command: `npm test -- --no-color`; exit code: 1 before implementation.

```text
[... 7 lines omitted ...]
 ❯ tests/forecast.test.js (24 tests | 3 failed) 107ms
   ❯ weather API client (7)
     × aborts stalled searchPlaces requests with the network error 16ms
     × aborts stalled fetchForecast requests with the network error 2ms
     × defaults both request timeouts to 10 seconds 13ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/forecast.test.js > weather API client > aborts stalled searchPlaces requests with the network error
 FAIL  tests/forecast.test.js > weather API client > aborts stalled fetchForecast requests with the network error
AssertionError: expected undefined to be an instance of AbortSignal
 ❯ tests/forecast.test.js:187:20
    185|     };
    186|     const result = request(stalled, 20);
    187|     expect(signal).toBeInstanceOf(AbortSignal);
       |                    ^
    188|     await expect(result).rejects.toMatchObject({ code: "network" });
    189|     expect(signal.aborted).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  tests/forecast.test.js > weather API client > defaults both request timeouts to 10 seconds
AssertionError: expected [] to deeply equal [ [ 10000 ], [ 10000 ] ]
```

Failure detail continued:

```text
[... 1 lines omitted ...]
- Expected
+ Received

- [
-   [
-     10000,
-   ],
-   [
-     10000,
-   ],
- ]
+ []

 ❯ tests/forecast.test.js:198:34
    196|       await searchPlaces("Gent", "en", fakeFetch(200, {}));
    197|       await fetchForecast(0, 0, fakeFetch(200, forecastResponse(RAIN))…
    198|       expect(timeout.mock.calls).toEqual([[10000], [10000]]);
       |                                  ^
    199|     }
    200|     finally {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯


 Test Files  1 failed | 1 passed (2)
      Tests  3 failed | 31 passed (34)
   Start at  17:53:35
   Duration  1.28s (transform 46%, tests 34%, import 15%, worker 5%)
```

### Unit verification
Command: `npm test -- --no-color`; exit code: 0 after implementation.

```text
[... 7 lines omitted ...]

 Test Files  2 passed (2)
      Tests  34 passed (34)
   Start at  17:54:00
   Duration  1.58s (tests 49%, transform 23%, import 20%, worker 7%)
```

### Browser verification
Command: `npm run test:browser`; exit code: 0.

```text
[... 93 lines omitted ...]
ok - rain icon follows the Dutch language switch
ok - condition 0/0 preserves the summary text
ok - condition 0/0 renders clear-night
ok - refresh replaces the previous condition icon
ok - condition 0/1 preserves the summary text
ok - condition 0/1 renders clear-day
ok - refresh replaces the previous condition icon
ok - condition 2/0 preserves the summary text
ok - condition 2/0 renders partly-night
ok - refresh replaces the previous condition icon
ok - condition 2/1 preserves the summary text
ok - condition 2/1 renders partly-day
ok - refresh replaces the previous condition icon
ok - condition 3/1 preserves the summary text
ok - condition 3/1 renders cloudy
ok - refresh replaces the previous condition icon
ok - condition 45/1 preserves the summary text
ok - condition 45/1 renders fog
ok - refresh replaces the previous condition icon
ok - condition 71/1 preserves the summary text
ok - condition 71/1 renders snow
ok - refresh replaces the previous condition icon
ok - condition 95/1 preserves the summary text
ok - condition 95/1 renders thunder
ok - refresh replaces the previous condition icon
ok - condition null/1 preserves the summary text
ok - condition null/1 omits the icon
ok - icon adds no summary line at 390px
ok - condition 999/1 preserves the summary text
ok - condition 999/1 omits the icon
ok - icon adds no summary line at 390px
ok - condition 0/null preserves the summary text
ok - condition 0/null omits the icon
ok - icon adds no summary line at 390px
ok - no condition scenario console, page or network errors
```

The existing HTTP 500 scenario intentionally exempts its expected response and console error.
All other console, page, and network checks passed. The suite closed its browsers and local servers.
Rendered components and styles were unchanged; the existing network-error message handles request timeouts.

### Task validation
Command: `plan tasks validate .plan/tasks/T0010-give-up-on-open-meteo-requests-after-10.md`; exit code: 0.

```text
All 1 task file passed validation.
```
