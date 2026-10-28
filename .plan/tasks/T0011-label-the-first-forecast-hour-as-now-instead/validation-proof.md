# T0011 Validation Evidence

## Walkthrough & Validation
### Regression Failure
Both runs used the new tests with `js/forecast.js`, `js/forecast-view.js`, CSS and strings at their base versions.

Command: `npx vitest run > /tmp/t0011-red-unit.txt`
Exit code: 1.

Standard output:
```text
[... 3 lines omitted ...]
 ❯ tests/forecast.test.js (33 tests | 4 failed) 224ms
   ❯ isCurrentHour (4)
     × is true for the hour containing now in the forecast timezone 17ms
     × is false one hour later or earlier 1ms
     × uses the forecast timezone rather than the device timezone 1ms
     × is false without a usable timezone 1ms

 Test Files  1 failed | 1 passed (2)
      Tests  4 failed | 39 passed (43)
[... 3 lines omitted ...]
```

Standard error:
```text
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/forecast.test.js > isCurrentHour > is true for the hour containing now in the forecast timezone
TypeError: isCurrentHour is not a function
 ❯ tests/forecast.test.js:183:12
[... 21 lines omitted ...]
 FAIL  tests/forecast.test.js > isCurrentHour > uses the forecast timezone rather than the device timezone
TypeError: isCurrentHour is not a function
 ❯ tests/forecast.test.js:196:12
[... 9 lines omitted ...]
 FAIL  tests/forecast.test.js > isCurrentHour > is false without a usable timezone
TypeError: isCurrentHour is not a function
 ❯ tests/forecast.test.js:203:12
[... 9 lines omitted ...]
```

Command: `SCREENSHOT_DIR=/tmp/t0011-before node tests/forecast-browser.mjs`
Exit code: 1.
```text
[... 116 lines omitted ...]
ok - a page restored from the back-forward cache refreshes a stale forecast
ok - an offline device skips the refresh
ok - no refresh scenario console, page or network errors
ok - now-label scenario receives HTTP 200
Check failed: the current hour is labeled "Now" in bold (10:00, 400)
```

### Final Run
Command: `npm test && npm run test:browser`
Exit code: 0.
```text
[... 1 lines omitted ...]
> meteo@0.1.1-pre test
> vitest run
[... 5 lines omitted ...]
 Test Files  2 passed (2)
      Tests  43 passed (43)
[... 4 lines omitted ...]
> meteo@0.1.1-pre test:browser
> node tests/shell-browser.mjs && node tests/forecast-browser.mjs
[... 139 lines omitted ...]
ok - now-label scenario receives HTTP 200
ok - the current hour is labeled "Now" in bold (Now, 700)
ok - the other hours keep their clock times in regular weight
ok - the screen reader description says "Now" (Now: 0.6 mm rain, 5% chance, 10 °C)
ok - the "Now" label keeps a 2px gap at 320px (22.27px)
ok - the summary says rain is expected now (Rain expected now (up to 2.6 mm per hour). Temperature between 10 and 15 °C. Wind up to 40 km/h, gusts up to 70 km/h.)
ok - the Dutch current hour is labeled "Nu" (Nu)
ok - the Dutch screen reader description says "Nu" (Nu: 0,6 mm regen, 5% kans, 10 °C)
ok - the Dutch summary says rain is expected now (Nu regen verwacht (tot 2,6 mm per uur). Temperatuur tussen 10 en 15 °C. Wind tot 40 km/u, windstoten tot 70 km/u.)
ok - a first hour that is no longer current keeps its clock time (10:00)
ok - the summary names a past first hour by its time (Rain expected from 10:00 (up to 2.6 mm per hour). Temperature between 10 and 15 °C. Wind up to 40 km/h, gusts up to 70 km/h.)
ok - a dry current hour keeps the first rain time (Rain expected from 13:00 (up to 2.6 mm per hour). Temperature between 10 and 15 °C. Wind up to 40 km/h, gusts up to 70 km/h.)
ok - no now-label console, page or network errors
```
All 151 browser checks passed, including the zero-error console and network gate per scenario.
Expected HTTP 500 responses come from the existing failure scenarios and are filtered there.

### Visual Verification
- Scenario 8 runs at 320x568 in the `Asia/Tokyo` device timezone with a Brussels forecast.
- The clock is fixed at 10:20 Brussels time, so the first column is the current hour.
- Before: [phone light](before/now-en-mobile-light.png), [desktop dark](before/now-en-desktop-dark.png).
- After: [phone light](after/now-en-mobile-light.png), [desktop dark](after/now-en-desktop-dark.png).
- After, Dutch: [phone dark](after/now-nl-mobile-dark.png), [desktop dark](after/now-nl-desktop-dark.png).
- Inspected captures show "Now"/"Nu" in bold under the first bar, other times unchanged.
- The summary starts with "Rain expected now" / "Nu regen verwacht"; no markers or colors were added.

Screenshot command:
```text
SCREENSHOT_DIR=/tmp/t0011-after node tests/forecast-browser.mjs
```
Only the `now-*` captures were copied into `before/` and `after/`.

### Mechanical Change
`python scripts/generate-sw.py generate` refreshed the cache name in `sw.js`.
