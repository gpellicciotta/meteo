# T0002 Walkthrough & Validation

## Key Changes
- `js/forecast.js` parses 13 hourly steps into 12 hours, shifting rain and probability by one step.
- `js/weather-api.js` and `js/geolocation.js` wrap Open-Meteo and the browser position with coded errors.
- `js/forecast-view.js` drives search, place choice, current location, summary and the 12-bar chart.
- The start view centers safely, so the forecast scrolls instead of clipping its top.
- Unused modal CSS left from the quiz was removed, as the T0001 review suggested.

## Red Phase
`npx vitest run` before the modules existed, exit code 1:

```text
 FAIL  tests/forecast.test.js [ tests/forecast.test.js ]
Error: Cannot find module '../js/forecast.js' imported from {{project-root}}/tests/forecast.test.js
      Tests  8 passed (8)
```

`node tests/forecast-browser.mjs` before the controls existed, exit code 1:

```text
page.fill: Timeout 30000ms exceeded.
page.click: Timeout 30000ms exceeded.
page.click: Timeout 30000ms exceeded.
```

## Review Round 1 Rework
- Each chart column now carries its description in a `.sr-only` span instead of an `aria-label`.
- Status, errors, the pick list and the place name re-render in the new language; the place is re-geocoded by id.
- An empty search invalidates pending requests; the update time uses the 24-hour clock.
- Amount labels start at the 0.1 mm rain threshold; geolocation gives up after 30 s overall.
- The attribution moved next to the update time, so it shows without scrolling.
- The browser test exempts its own mocked HTTP 500 and the matching console entry from the error gate.

Rework red phase: `npx vitest run` failed 1 of 24 (the unanswered-prompt timeout), and
`node tests/forecast-browser.mjs` timed out waiting for `#forecast-chart > li:nth-child(5) .sr-only`.

## Green Phase
`npx vitest run`, exit code 0:

```text
 Test Files  2 passed (2)
      Tests  24 passed (24)
```

`node tests/forecast-browser.mjs`, exit code 0:

```text
ok - two matches are offered to pick from
ok - the chart shows 12 hourly bars
ok - the chosen place is the heading
ok - the summary names the first rainy hour
ok - bars carry a screen reader description (14:00: 1.2 mm rain, 70% chance, 12 °C)
ok - the update time uses the 24-hour clock (Updated at 12:37)
ok - amounts below the 0.1 mm rain threshold get no label
ok - the forecast request uses the picked place
ok - the Open-Meteo attribution is visible without scrolling
ok - the forecast re-renders in Dutch
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
```

`node tests/shell-browser.mjs`, exit code 0 (last line):

```text
ok - no console, page or network errors
```

## Live Open-Meteo Check
A temporary Playwright script loaded `?lang=nl&location=Brussel` against the live APIs, exit code 0:

```text
choices: [
  'Brussel, Brussels Hoofdstedelijk Gewest, België',
  'Brussel, Noord-Kaap, Zuid-Afrika',
  'Brussels, Wisconsin, Verenigde Staten',
  'Brussels, Illinois, Verenigde Staten',
  'Brussels, Ontario, Canada'
]
place: Brussel, Brussels Hoofdstedelijk Gewest, België
summary: Geen regen verwacht in de komende 12 uur. Temperatuur tussen 11 en 15 °C.
[... 1 line of 12 bar descriptions omitted, all "0,0 mm regen, 0% kans" ...]
ok - no errors
```

## Screenshots
- Before: [desktop](screenshots/before-start-desktop-light.png), [mobile](screenshots/before-start-mobile-light.png)
- After, English: [desktop light](screenshots/forecast-en-desktop-light.png), [desktop dark](screenshots/forecast-en-desktop-dark.png), [mobile light](screenshots/forecast-en-mobile-light.png), [mobile dark](screenshots/forecast-en-mobile-dark.png)
- After, Dutch: [desktop light](screenshots/forecast-nl-desktop-light.png), [desktop dark](screenshots/forecast-nl-desktop-dark.png), [mobile light](screenshots/forecast-nl-mobile-light.png), [mobile dark](screenshots/forecast-nl-mobile-dark.png)
- Live Brussels: [desktop light](screenshots/live-brussel-desktop-light.png), [mobile dark](screenshots/live-brussel-mobile-dark.png)
