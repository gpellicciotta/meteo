# T0007 Validation Evidence

## Walkthrough & Validation
### Regression Failure
Command: `$env:SCREENSHOT_DIR='.plan/tasks/before'; node tests/forecast-browser.mjs`
Exit code: 1. Tool session: 97620.
```text
ok - en hourly-label scenario receives HTTP 200
ok - nl hourly-label scenario receives HTTP 200
ok - no hourly-label console, page or network errors
Check failed: hourly labels remain separated across 20 language/theme/viewport combinations:
en/light/320px: time labels need a 2px gap (actual -0.73px)
en/light/320px: label count or horizontal containment is incorrect
en/dark/320px: time labels need a 2px gap (actual -0.73px)
en/dark/320px: label count or horizontal containment is incorrect
en/light/390px: label count or horizontal containment is incorrect
en/dark/390px: label count or horizontal containment is incorrect
en/light/479px: label count or horizontal containment is incorrect
en/dark/479px: label count or horizontal containment is incorrect
nl/light/320px: time labels need a 2px gap (actual -0.73px)
nl/light/320px: label count or horizontal containment is incorrect
nl/dark/320px: time labels need a 2px gap (actual -0.73px)
nl/dark/320px: label count or horizontal containment is incorrect
nl/light/390px: label count or horizontal containment is incorrect
nl/dark/390px: label count or horizontal containment is incorrect
nl/light/479px: label count or horizontal containment is incorrect
nl/dark/479px: label count or horizontal containment is incorrect
[... 105 lines omitted ...]
```

### Passing Tests
Command: `npm test`
Exit code: 0.
```text
[... 7 lines omitted ...]
 Test Files  2 passed (2)
      Tests  37 passed (37)
   Start at  18:11:02
   Duration  650ms (tests 50%, transform 33%, import 13%, worker 4%)
```

Command: `$env:SCREENSHOT_DIR='.plan/tasks/after'; npm run test:browser`
Exit code: 0. Tool session: 30536.
```text
[... 22 lines omitted ...]
ok - en hourly-label scenario receives HTTP 200
ok - nl hourly-label scenario receives HTTP 200
ok - no hourly-label console, page or network errors
ok - hourly labels remain separated across 20 language/theme/viewport combinations
[... 104 lines omitted ...]
ok - no condition scenario console, page or network errors
```
The full browser output is recorded in [browser-validation.txt](browser-validation.txt).
The existing service-error scenario intentionally returns HTTP 500; its documented console and response errors remain exempt.
Both test runs closed their browsers and local HTTP servers before returning.

Command: `node --check tests/forecast-browser.mjs`
Exit code: 0; no output.

### Visual Verification
Screenshots show actual forecast UI after HTTP 200 responses.
Time labels are separated at 320px; hourly temperature rows remain aligned, and desktop retains twelve labels.
- [Original phone, English light](before/hourly-en-320-light.png).
- [Fixed phone, English light](after/hourly-en-320-light.png).
- [Fixed phone, Dutch dark](after/hourly-nl-320-dark.png).
- [Fixed desktop, English light](after/forecast-en-desktop-light.png).

### Documentation and Task Checks
Command: `plan tasks validate .plan/tasks/T0007-keep-the-hourly-time-labels-of-the-forecast.md`
Exit code: 0.

```text
All 1 task file passed validation.
```

Command: `python ../../../../dev-guidelines/scripts/lint-markdown.py check README.md CHANGELOG.md .plan/tasks/T0007-keep-the-hourly-time-labels-of-the-forecast.md .plan/tasks/T0007-keep-the-hourly-time-labels-of-the-forecast/technical-spec.md .plan/tasks/T0007-keep-the-hourly-time-labels-of-the-forecast/validation-proof.md --offline`
Exit code: 0.

```text
All 5 markdown files passed linting.
```

Command: `python scripts/generate-sw.py generate`
Exit code: 0.

```text
Generated sw.js with 30 precached assets (version v0.1.1-pre).
```

## Dutch Changelog Follow-Up

Added the missing `CHANGELOG.nl.md` twin entry, then regenerated the service worker.

Command: `python scripts/generate-sw.py generate`
Exit code: 0.

```text
Generated sw.js with 30 precached assets (version v0.1.1-pre).
```

Command: `npx vitest run`
Exit code: 0.

```text
 Test Files  2 passed (2)
      Tests  37 passed (37)
```

Command: `python ../../../../dev-guidelines/scripts/lint-markdown.py CHANGELOG.nl.md`
Exit code: 0.

```text
All 1 markdown files passed linting.
```
