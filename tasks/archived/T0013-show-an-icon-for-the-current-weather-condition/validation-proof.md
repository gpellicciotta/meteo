# T0013 Validation Proof

## Walkthrough & Validation
The installed validator requires evidence in this companion file rather than an inline task section.

### Test-driven development
Before implementation, `npm test -- --reporter=dot` exited 1 with five expected failures.
The mapper, parsed condition, and requested fields were absent.
The initial browser run also exited 1 because the accessible rain icon was missing.

`node tests/forecast-browser.mjs`, exit code 1; final failure:

```text
Check failed: rain icon has an accessible English name
```

### Unit tests
`npm test`, exit code 0:

```text
[... 7 lines omitted ...]

 Test Files  2 passed (2)
      Tests  31 passed (31)
   Start at  17:44:47
   Duration  611ms (tests 48%, import 28%, transform 14%, worker 9%)
```

### Browser integration
`npm run test:browser`, exit code 0:

```text
[... 90 lines omitted ...]
ok - rain icon has an accessible English name
ok - current-hour rain icon precedes the summary text
ok - the request includes weather code and daylight
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

Both shell and forecast scripts passed.
The fixture's intentional HTTP 500 exercises service errors and is excluded from the console/network error gate.
All other console errors, page exceptions, failed requests, and HTTP errors fail verification.
Browser fixtures replace remote API responses; production requests use Open-Meteo.

### Syntax checks
Each command exited 0 with no output:

```powershell
node --check js/forecast.js
node --check js/forecast-view.js
node --check js/icons.js
node --check js/weather-api.js
node --check tests/forecast.test.js
node --check tests/forecast-browser.mjs
```

The repository does not configure a JavaScript linter.

### Visual verification
Both screenshot runs confirmed HTTP 200 before capture.
Inspected screenshots show real forecast content, aligned icons, readable text, and theme colors.
Desktop captures use 1280×800; phone captures use 390×844.
Automated layout checks also passed at 1280×900, 390×667, and 320×568.

- Before: [desktop dark](before/forecast-en-desktop-dark.png), [phone light](before/forecast-en-mobile-light.png).
- After: [desktop light](after/forecast-en-desktop-light.png), [phone light](after/forecast-en-mobile-light.png).
- Dutch: [phone dark](after/forecast-nl-mobile-dark.png).
- Night: [phone dark](after/condition-night-mobile-dark.png).

Before capture command, session 97229, exit code 0:

```powershell
node --input-type=module -e 'process.env.SCREENSHOT_DIR=".plan/tasks/T0013-show-an-icon-for-the-current-weather-condition/before"; await import("./tests/forecast-browser.mjs");'
```

After capture command, final session 29973, exit code 0:

```powershell
node --input-type=module -e 'process.env.SCREENSHOT_DIR=".plan/tasks/T0013-show-an-icon-for-the-current-weather-condition/after"; await import("./tests/forecast-browser.mjs");'
```

Earlier after-capture sessions 71705 and 11523 exposed block layout and SVG-whitespace assertion issues, respectively.
The initial red browser command used session 14150.
Final browser verification used session 1257.
All sessions finished; each harness closed its browser and in-process HTTP server.

### Generated assets
`python scripts/generate-sw.py generate`, exit code 0:

```text
Generated sw.js with 30 precached assets (version v0.1.1-pre).
```

The generator refreshed the content hash without changing the version.

### Documentation and task validation
`python ../../../../dev-guidelines/scripts/lint-markdown.py check README.md CHANGELOG.md CHANGELOG.nl.md .plan/tasks/T0013-show-an-icon-for-the-current-weather-condition.md .plan/tasks/T0013-show-an-icon-for-the-current-weather-condition/technical-spec.md .plan/tasks/T0013-show-an-icon-for-the-current-weather-condition/validation-proof.md --offline`, exit code 0:

```text
All 6 markdown files passed linting.
```

`plan tasks validate .plan/tasks/T0013-show-an-icon-for-the-current-weather-condition.md`, exit code 0:

```text
All 1 task file passed validation.
```

The review checkbox remains pending because approval belongs to the orchestrator's reviewer.
