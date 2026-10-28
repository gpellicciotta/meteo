# T0012 Validation Proof

## Walkthrough & Validation
The unit and browser failures were observed before production changes.
All final checks passed; review approval remains the orchestrator's responsibility.

### Automated Checks
Command: `npm test -- --reporter=dot`

Exit code: 1.

```text
[... 7 lines omitted ...]
 ❯ tests/forecast.test.js (18 tests | 6 failed) 80ms
   ❯ parseForecast (5)
     × turns 13 hourly steps into 12 hours with the rain of the following hour 24ms
     × aligns instantaneous speed and preceding-hour gusts across the entire window 4ms
     × keeps absent arrays, missing entries, and explicit null wind values as null 1ms
   ❯ summarizeWind (2)
     × finds independent maxima without rounding or replacing missing data with zero 2ms
     × returns null for each missing series independently 1ms
   ❯ weather API client (4)
     × builds the documented geocoding and forecast URLs 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/forecast.test.js > parseForecast > turns 13 hourly steps into 12 hours with the rain of the following hour
AssertionError: expected { time: '2026-10-28T10:00', …(4) } to deeply equal { time: '2026-10-28T10:00', …(6) }

- Expected
+ Received

@@ -2,8 +2,6 @@
    "label": "10:00",
    "precipitation": 0,
    "probability": 5,
    "temperature": 10,
    "time": "2026-10-28T10:00",
-   "windGusts": null,
-   "windSpeed": null,
  }

 ❯ tests/forecast.test.js:50:31
     48|     expect(forecast.timezone).toBe("Europe/Brussels");
     49|     expect(forecast.hours).toHaveLength(12);
     50|     expect(forecast.hours[0]).toEqual({ time: "2026-10-28T10:00", labe…
       |                               ^
     51|     expect(forecast.hours[4]).toMatchObject({ label: "14:00", temperat…
```

```text
     52|     expect(forecast.hours[11]).toMatchObject({ label: "21:00", precipi…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

 FAIL  tests/forecast.test.js > parseForecast > aligns instantaneous speed and preceding-hour gusts across the entire window
AssertionError: expected { time: '2026-10-28T10:00', …(4) } to match object { windSpeed: 40, windGusts: 35 }
(5 matching properties omitted from actual)

- Expected
+ Received

  {
-   "windGusts": 35,
-   "windSpeed": 40,
+   "label": "10:00",
+   "precipitation": 0,
+   "probability": 5,
+   "temperature": 10,
+   "time": "2026-10-28T10:00",
  }

 ❯ tests/forecast.test.js:70:22
     68|       wind_gusts_10m: [99, ...Array(11).fill(35), 70],
     69|     }));
     70|     expect(hours[0]).toMatchObject({ windSpeed: 40, windGusts: 35 });
       |                      ^
     71|     expect(hours[11]).toMatchObject({ windSpeed: 20, windGusts: 70 });
     72|     expect(summarizeWind(hours)).toEqual({ maxSpeed: 40, maxGusts: 70 …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

 FAIL  tests/forecast.test.js > parseForecast > keeps absent arrays, missing entries, and explicit null wind values as null
AssertionError: expected { time: '2026-10-28T10:00', …(4) } to match object { windSpeed: null, windGusts: null }
(5 matching properties omitted from actual)

```

```text
- Expected
+ Received

  {
-   "windGusts": null,
-   "windSpeed": null,
+   "label": "10:00",
+   "precipitation": 0,
+   "probability": 5,
+   "temperature": 10,
+   "time": "2026-10-28T10:00",
  }

 ❯ tests/forecast.test.js:79:22
     77|       wind_speed_10m: [null, 0], wind_gusts_10m: [90, null, 0],
     78|     }));
     79|     expect(hours[0]).toMatchObject({ windSpeed: null, windGusts: null …
       |                      ^
     80|     expect(hours[1]).toMatchObject({ windSpeed: 0, windGusts: 0 });
     81|     expect(hours[2]).toMatchObject({ windSpeed: null, windGusts: null …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯

 FAIL  tests/forecast.test.js > summarizeWind > finds independent maxima without rounding or replacing missing data with zero
TypeError: summarizeWind is not a function
 ❯ tests/forecast.test.js:88:12
     86| describe("summarizeWind", () => {
     87|   it("finds independent maxima without rounding or replacing missing d…
     88|     expect(summarizeWind([
       |            ^
     89|       { windSpeed: 20.4, windGusts: null },
     90|       { windSpeed: null, windGusts: 70.6 },

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/6]⎯

```

```text
 FAIL  tests/forecast.test.js > summarizeWind > returns null for each missing series independently
TypeError: summarizeWind is not a function
 ❯ tests/forecast.test.js:97:12
     95|
     96|   it("returns null for each missing series independently", () => {
     97|     expect(summarizeWind([])).toEqual({ maxSpeed: null, maxGusts: null…
       |            ^
     98|     expect(summarizeWind([{ windSpeed: null, windGusts: null }])).toEq…
     99|     expect(summarizeWind([{ windSpeed: null, windGusts: 70 }])).toEqua…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/6]⎯

 FAIL  tests/forecast.test.js > weather API client > builds the documented geocoding and forecast URLs
AssertionError: expected 'https://api.open-meteo.com/v1/forecas…' to be 'https://api.open-meteo.com/v1/forecas…' // Object.is equality

Expected: "https://api.open-meteo.com/v1/forecast?latitude=50.85&longitude=4.35&hourly=temperature_2m%2Cprecipitation%2Cprecipitation_probability%2Cwind_speed_10m%2Cwind_gusts_10m&forecast_hours=13&timezone=auto"
Received: "https://api.open-meteo.com/v1/forecast?latitude=50.85&longitude=4.35&hourly=temperature_2m%2Cprecipitation%2Cprecipitation_probability&forecast_hours=13&timezone=auto"

 ❯ tests/forecast.test.js:136:43
    134|       "https://geocoding-api.open-meteo.com/v1/search?name=Sint-Niklaa…
    135|     );
    136|     expect(buildForecastUrl(50.85, 4.35)).toBe(
       |                                           ^
    137|       "https://api.open-meteo.com/v1/forecast?latitude=50.85&longitude…
    138|       + "&hourly=temperature_2m%2Cprecipitation%2Cprecipitation_probab…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/6]⎯


 Test Files  1 failed | 1 passed (2)
      Tests  6 failed | 22 passed (28)
   Start at  13:59:32
   Duration  785ms (transform 53%, tests 27%, import 15%, worker 5%)
```

Command: `node tests/forecast-browser.mjs`

Exit code: 1.

Supervised execution identifier: 80854; completed before proceeding.

```text
ok - the local server returns HTTP 200
ok - two matches are offered to pick from
ok - the chart shows 12 hourly bars
ok - the chosen place is the heading
ok - the summary names the first rainy hour
Check failed: English wind and gust maxima follow the temperature
ok - the current location shows rounded coordinates
ok - the forecast uses the device position
ok - no console, page or network errors
ok - a denied location shows its error
ok - no console, page or network errors
ok - the current-location button sits left of the search field at 1280x900
ok - the place name sits below the chart at 1280x900
ok - the update time has its own line below the place name at 1280x900
ok - the current-location button sits left of the search field at 1280x800
ok - the place name sits below the chart at 1280x800
ok - the update time has its own line below the place name at 1280x800
ok - the forecast fits without scrolling at 1280x800 (overflow 0px)
ok - the current-location button sits left of the search field at 390x844
ok - the place name sits below the chart at 390x844
ok - the update time has its own line below the place name at 390x844
ok - the current-location button sits left of the search field at 390x667
ok - the place name sits below the chart at 390x667
ok - the update time has its own line below the place name at 390x667
ok - the forecast fits without scrolling at 390x667 (overflow 0px)
ok - the current-location button sits left of the search field at 320x568
ok - the place name sits below the chart at 320x568
ok - the update time has its own line below the place name at 320x568
ok - the focused icon button is named exactly once (btn-current-location, 1 match)
ok - no console, page or network errors
Check failed: en summary handles speed 20, gusts 35
```

Command: `npm.cmd test -- --reporter=dot`

Exit code: 0.

```text
[... 9 lines omitted ...]
 Test Files  2 passed (2)
      Tests  28 passed (28)
   Start at  14:00:38
   Duration  428ms (tests 41%, transform 27%, import 25%, worker 6%, environment 1%)
```

Command: `$env:SCREENSHOT_DIR = '.plan/tasks/T0012-add-the-highest-wind-speed-and-strong-gusts/after'; npm.cmd run test:browser`

Exit code: 0.

Supervised execution identifier: 9114; completed before proceeding.

```text

> meteo@0.1.1-pre test:browser
> node tests/shell-browser.mjs && node tests/forecast-browser.mjs

ok - start view shows the Meteo title
ok - Dutch is active with ?lang=nl
ok - manifest.webmanifest loads with HTTP 200
ok - assets/favicon.svg loads with HTTP 200
ok - favicon.ico loads with HTTP 200
ok - assets/icons/icon-192.png loads with HTTP 200
ok - Settings view opens
ok - Settings offers only Dutch and English
ok - saving returns to the start view
ok - language button shows EN
ok - About view opens
ok - About view shows the version tag
ok - language button switches back to Dutch
ok - the language is not stored under the shared key "lang"
ok - About shows the Dutch changelog in Dutch
ok - choosing the dark theme previews it at once
ok - closing Settings without saving reverts the preview
ok - Escape returns to the start view
ok - no console, page or network errors
ok - the local server returns HTTP 200
ok - two matches are offered to pick from
ok - the chart shows 12 hourly bars
ok - the chosen place is the heading
ok - the summary names the first rainy hour
ok - English wind and gust maxima follow the temperature
ok - the request includes both wind variables
ok - bars carry a screen reader description (14:00: 1.2 mm rain, 70% chance, 12 °C)
ok - the update time uses the 24-hour clock (Updated at 14:00)
ok - amounts below the 0.1 mm rain threshold get no label
ok - the forecast request uses the picked place
ok - the Open-Meteo attribution is visible without scrolling
```

```text
ok - the forecast re-renders in Dutch
ok - the wind summary re-renders in Dutch
ok - the place name follows the language switch
ok - an unknown place shows an error naming it
ok - an error message follows the language switch
ok - an empty search cancels a slower pending search
ok - an empty search asks for a place
ok - a failing service shows its error message
ok - a single match loads directly from ?location
ok - the last location reloads at startup
ok - no console, page or network errors
ok - the current location shows rounded coordinates
ok - the forecast uses the device position
ok - no console, page or network errors
ok - a denied location shows its error
ok - no console, page or network errors
ok - the current-location button sits left of the search field at 1280x900
ok - the place name sits below the chart at 1280x900
ok - the update time has its own line below the place name at 1280x900
ok - the current-location button sits left of the search field at 1280x800
ok - the place name sits below the chart at 1280x800
ok - the update time has its own line below the place name at 1280x800
ok - the forecast fits without scrolling at 1280x800 (overflow 0px)
ok - the current-location button sits left of the search field at 390x844
ok - the place name sits below the chart at 390x844
ok - the update time has its own line below the place name at 390x844
ok - the current-location button sits left of the search field at 390x667
ok - the place name sits below the chart at 390x667
ok - the update time has its own line below the place name at 390x667
ok - the forecast fits without scrolling at 390x667 (overflow 0px)
ok - the current-location button sits left of the search field at 320x568
ok - the place name sits below the chart at 320x568
ok - the update time has its own line below the place name at 320x568
ok - the focused icon button is named exactly once (btn-current-location, 1 match)
ok - no console, page or network errors
```

```text
ok - en summary handles speed 20, gusts 35
ok - nl summary handles speed 20, gusts 35
ok - en summary handles speed 20.4, gusts 49.9
ok - nl summary handles speed 20.4, gusts 49.9
ok - en summary handles speed 20.6, gusts 50
ok - nl summary handles speed 20.6, gusts 50
ok - en summary handles speed 40, gusts 70.6
ok - nl summary handles speed 40, gusts 70.6
ok - en summary handles speed 0, gusts 0
ok - nl summary handles speed 0, gusts 0
ok - en summary handles speed null, gusts null
ok - nl summary handles speed null, gusts null
ok - en summary handles speed 20, gusts null
ok - nl summary handles speed 20, gusts null
ok - en summary handles speed null, gusts 70
ok - nl summary handles speed null, gusts 70
ok - en summary handles speed null, gusts 35
ok - nl summary handles speed null, gusts 35
ok - no wind scenario console, page or network errors
```


### Final Repository Checks
Regenerated the service worker after normalizing Markdown line endings.

Command: `python scripts/generate-sw.py generate`

Exit code: 0.

```text
Generated sw.js with 30 precached assets (version v0.1.1-pre).
```

Command: `npm.cmd test -- --reporter=dot`

Exit code: 0.

```text
[... 9 lines omitted ...]
 Test Files  2 passed (2)
      Tests  28 passed (28)
   Start at  14:04:37
   Duration  327ms (tests 53%, import 23%, transform 15%, worker 8%)
```

Command: `python ../../../../dev-guidelines/scripts/lint-markdown.py check README.md CHANGELOG.md CHANGELOG.nl.md .plan/tasks/T0012-add-the-highest-wind-speed-and-strong-gusts.md .plan/tasks/T0012-add-the-highest-wind-speed-and-strong-gusts/technical-spec.md .plan/tasks/T0012-add-the-highest-wind-speed-and-strong-gusts/validation-proof.md --offline`

Exit code: 0.

```text
All 6 markdown files passed linting.
```

Command: `plan tasks validate .plan/tasks/T0012-add-the-highest-wind-speed-and-strong-gusts.md --verbose`

Exit code: 0.

```text
[... 1 lines omitted ...]
Task files being validated:
- **    OK** [T0012-add-the-highest-wind-speed-and-strong-gusts.md]

All 1 task file passed validation.
```

Each command below exited 0 without output:

```powershell
node --check js/forecast.js
node --check js/forecast-view.js
node --check js/weather-api.js
node --check tests/forecast.test.js
node --check tests/forecast-browser.mjs
git -c core.safecrlf=false diff --check
```

### Visual Verification
The baseline forecast browser check passed before implementation.
The local server returned HTTP 200 before final captures.
Inspected both languages, both themes, and desktop/mobile captures; summaries remain readable and charts retain their existing rows.
Browser checks retained layout assertions down to 320 × 568 and passed all error gates.
The intentional mocked HTTP 500 in the existing service-error scenario remains the only documented error-gate exemption.
All browser instances and in-process HTTP servers closed normally.

- en, desktop, light: [before](before/forecast-en-desktop-light.png), [after](after/forecast-en-desktop-light.png).
- en, desktop, dark: [before](before/forecast-en-desktop-dark.png), [after](after/forecast-en-desktop-dark.png).
- en, mobile, light: [before](before/forecast-en-mobile-light.png), [after](after/forecast-en-mobile-light.png).
- en, mobile, dark: [before](before/forecast-en-mobile-dark.png), [after](after/forecast-en-mobile-dark.png).
- nl, desktop, light: [before](before/forecast-nl-desktop-light.png), [after](after/forecast-nl-desktop-light.png).
- nl, desktop, dark: [before](before/forecast-nl-desktop-dark.png), [after](after/forecast-nl-desktop-dark.png).
- nl, mobile, light: [before](before/forecast-nl-mobile-light.png), [after](after/forecast-nl-mobile-light.png).
- nl, mobile, dark: [before](before/forecast-nl-mobile-dark.png), [after](after/forecast-nl-mobile-dark.png).
