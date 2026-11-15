# T0030 Validation Proof

## Walkthrough & Validation
Base commit: 8937c32. Work commit: 8cab813.

### Red phase, tightened tests before the stylesheet fix
Command: `npx vitest run tests/leftovers.test.js` (exit code 1)

```text
 FAIL  tests/leftovers.test.js > quiz leftovers > class btn-about-back is nowhere in the stylesheet, markup, or scripts
 FAIL  tests/leftovers.test.js > quiz leftovers > token --color-warning is nowhere in the stylesheet, markup, or scripts
 FAIL  tests/leftovers.test.js > quiz leftovers > every stylesheet class is used by the markup or the scripts
 FAIL  tests/leftovers.test.js > quiz leftovers > every custom property is read by a rule, the markup, or a script
AssertionError: expected [ 'btn-about-back' ] to deeply equal []
 Test Files  1 failed (1)
      Tests  4 failed | 36 passed (40)
[... failure diffs omitted ...]
```

### Green phase
Command: `npm test` (exit code 0)

```text
 Test Files  4 passed (4)
      Tests  145 passed (145)
```

### Browser tests
Command: `npm run test:browser` (exit code 0)

```text
[... earlier ok lines omitted ...]
ok - the sky tooltip shows the nine weather icons
ok - leaving the sample hides the tooltip and highlights
ok - no guide hover console, page or network errors
ok - a touch phone shows no hover tooltip or highlight in the guide
ok - no touch guide console, page or network errors
```

### Screenshots
Scratch run with the desktop width set to 1440x900, then reverted. Mobile is 390x844.
108 screenshots per side, base commit against 8cab813, compared byte for byte.
Stored copies cover Start, About, Settings, and Forecast, light and dark, in `screenshots/`.

```text
DIFF hourly-en-320-dark.png
DIFF hourly-nl-320-dark.png
DIFF hourly-nl-320-light.png
[... 105 identical files omitted ...]
```

The three 320 px captures also differ between two runs of the same code, so they are render noise.

### Visual differences
None.
