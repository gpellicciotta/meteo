# T0014 Validation Proof

## Red Phase

Command: `npx vitest run` (exit code 1)

```text

 RUN  v5.0.5 C:/Dev-Projects/meteo/.plan/work/T0014-show-the-town-and-province-of-the-current

 ❯ tests/forecast.test.js (46 tests | 5 failed) 230ms
   ❯ reversePlace (5)
     × builds the documented reverse URL with 3-decimal coordinates and the language 7ms
     × maps a town answer to its name, province and country 1ms
     × prefers city, then village, and the province before the state 0ms
     × returns null when no place is found 0ms
     × maps HTTP and network failures to error codes 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/forecast.test.js > reversePlace > builds the documented reverse URL with 3-decimal coordinates and the language
[... 59 lines omitted ...]


 Test Files  1 failed | 1 passed (2)
      Tests  5 failed | 51 passed (56)
   Start at  19:35:54
   Duration  509ms (tests 77%, import 13%, transform 7%, worker 4%)

```

Command: `node tests/forecast-browser.mjs` (exit code 1)

```text
[... 27 lines omitted ...]
ok - the forecast uses the device position
page.waitForFunction: Timeout 30000ms exceeded.
ok - a denied location shows its error
[... 116 lines omitted ...]
```

## Green Phase

Command: `python scripts/generate-sw.py generate` (exit code 0)

```text
Generated sw.js with 30 precached assets (version v0.1.1-pre).
```

Command: `npm test` (exit code 0)

```text

> meteo@0.1.1-pre test
> vitest run


 RUN  v5.0.5 C:/Dev-Projects/meteo/.plan/work/T0014-show-the-town-and-province-of-the-current


 Test Files  2 passed (2)
      Tests  56 passed (56)
   Start at  19:46:20
   Duration  472ms (tests 75%, import 14%, transform 6%, worker 4%)

```

Command: `npm run test:browser` (exit code 0)

```text

> meteo@0.1.1-pre test:browser
> node tests/shell-browser.mjs && node tests/forecast-browser.mjs

[... 46 lines omitted ...]
ok - the forecast uses the device position
ok - the current location shows its town, province and country
ok - the name is looked up once with rounded coordinates (https://nominatim.openstreetmap.org/reverse?lat=50.850&lon=4.352&format=jsonv2&zoom=10&accept-language=en)
ok - the OpenStreetMap attribution is shown with the looked-up name
ok - the current location name follows the language switch
ok - the language switch looks up the Dutch name
ok - a failed lookup keeps the rounded coordinates
ok - a failed lookup shows no error
ok - the OpenStreetMap attribution is hidden with the coordinates
ok - the OpenStreetMap attribution is hidden for a searched place
ok - no console, page or network errors
ok - a denied location shows its error
[... 113 lines omitted ...]
ok - resume scenario receives HTTP 200
ok - resuming drops past hours after a failed or skipped refresh
ok - no resume console, page or network errors
```

The browser run printed 174 `ok` checks and no failures.

## Expected Errors

- Scenario 2 answers one Nominatim request with HTTP 500 on purpose.
- Its response and console entries are filtered from that scenario's error gate.
