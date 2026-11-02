# T0009 Validation Proof

## Red Phase

Unit tests before implementation, `npx vitest run`, exit code 1.
Lines come from two runs on the same red state, filtered with `grep -E "FAIL|×"` and `tail -40`.

```text
     × keeps every hour of a longer response
     × starts at the current hour and returns 12 hours
     × returns fewer hours when the saved data runs out
     × starts at the first hour when it has not begun yet or the timezone is unusable
     × uses the place id, or the rounded coordinates for the current location
     × restores a saved forecast of the same place after a storage round trip
     × ignores the saved forecast of another place
     × ignores a malformed saved forecast without throwing
     × builds the documented geocoding and forecast URLs
     × parses a forecast response
[... FAIL headers, assertion diffs and code frames omitted ...]
 Test Files  1 failed | 1 passed (2)
      Tests  10 failed | 41 passed (51)
```

Browser checks before implementation, `node tests/forecast-browser.mjs`, exit code 1:

```text
Check failed: the forecast request uses the picked place
Check failed: a re-rendered chart starts at the new current hour (10:00, 11:00)
Check failed: the forecast request asks for 25 hourly steps
[... 116 passing ok lines omitted ...]
```

The two refresh checks at the end of scenario 9 were added after implementation, so they have no red run.

## Green Phase

`npm test && npm run test:browser`, exit code 0 (blank lines removed):

```text
> meteo@0.1.1-pre test
> vitest run
 RUN  v5.0.5 C:/Dev-Projects/meteo/.plan/work/T0009-show-the-last-saved-forecast-when-the-app
 Test Files  2 passed (2)
      Tests  51 passed (51)
   Start at  19:18:31
   Duration  487ms (tests 72%, import 16%, transform 7%, worker 5%)
> meteo@0.1.1-pre test:browser
> node tests/shell-browser.mjs && node tests/forecast-browser.mjs
[... 149 ok lines omitted ...]
ok - a dry current hour keeps the first rain time (Rain expected from 13:00 (up to 2.6 mm per hour). Temperature between 10 and 15 °C. Wind up to 40 km/h, gusts up to 70 km/h.)
ok - no now-label console, page or network errors
ok - offline-start scenario receives HTTP 200
ok - the forecast request asks for 25 hourly steps
ok - an offline start still tries to fetch the forecast
ok - an offline start shows the saved chart without an error (Now, 11:00)
ok - the saved chart keeps its original update time (Updated at 10:20)
ok - 3 hours later the saved chart starts at 13:00 (Now, 14:00, Now: 0.4 mm rain, 70% chance, 11 °C)
ok - 3 hours later the update time still reads 10:20 (Updated at 10:20)
ok - 20 hours later the network error replaces the 4 remaining saved hours (The forecast service could not be reached. Check your connection and try again.)
ok - a successful start replaces the saved forecast (Updated at 13:20)
ok - a failed refresh with under 6 hours left hides the chart and shows the error
ok - the next refresh brings the chart back and clears the error
ok - no offline-start console, page or network errors
```

The aborted forecast requests in scenario 9 are expected and filtered from the error gate.

## Review Round 1 Rework

### Red Phase

Scenario 10 before the fix, `node tests/forecast-browser.mjs`, exit code 1:

```text
Check failed: resuming drops past hours after a failed or skipped refresh:
a failed refresh starts the chart at 14:00 (Now, 11:00)
a failed refresh summarizes only the coming hours (Rain expected from 13:00 (up to 2.6 mm per hour). Temperature between 10 and 15 °C. Wind up to 40 km/h, gusts up to 70 km/h.)
an offline resume starts the chart at 16:00 (Now, 11:00)
an offline resume with under 6 hours left shows the network error (Now, 11:00)
[... 145 passing ok lines omitted ...]
```

### Green Phase

`npm test && npm run test:browser`, exit code 0 (blank lines removed):

```text
> meteo@0.1.1-pre test
> vitest run
 RUN  v5.0.5 C:/Dev-Projects/meteo/.plan/work/T0009-show-the-last-saved-forecast-when-the-app
 Test Files  2 passed (2)
      Tests  51 passed (51)
   Start at  19:26:00
   Duration  445ms (tests 76%, import 14%, transform 6%, worker 4%)
> meteo@0.1.1-pre test:browser
> node tests/shell-browser.mjs && node tests/forecast-browser.mjs
[... 158 ok lines omitted ...]
ok - 20 hours later the network error replaces the 4 remaining saved hours (The forecast service could not be reached. Check your connection and try again.)
ok - a successful start replaces the saved forecast (Updated at 13:20)
ok - a failed refresh with under 6 hours left hides the chart and shows the error
ok - the next refresh brings the chart back and clears the error
ok - no offline-start console, page or network errors
ok - resume scenario receives HTTP 200
ok - resuming drops past hours after a failed or skipped refresh
ok - no resume console, page or network errors
```
