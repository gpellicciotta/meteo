# T0034 Validation Proof
Replace the app's shared components with the vendored ones and import the public bright look entry point.

---

## Walkthrough & Validation

### Baseline
Base commit `7857b0d`. The worktree had no `node_modules`; `npm ci` installed the locked dependencies.
`tests/accent.test.js` failed at the base in this checkout: `core.autocrlf=true` gives CRLF files, and its `tableRows` split on `\n`.
It now normalizes line ends; the four style guide tests pass again.

### Failing Tests Before the Switch
`npx vitest run`, exit code 1, with the new tests in place and the app unchanged (accent fix applied after this run):

```text
 ❯ tests/design.test.js (14 tests | 7 failed) 274ms
     × imports the public bright entry point before the app tokens, and no private file 16ms
     × precaches every stylesheet, module, and sprite the page loads, so the shell works offline 17ms
     × waits for the page's skip-waiting message instead of activating on install, and claims clients 2ms
     × offers updates through the vendored module and toast, not a reload of its own 2ms
     × builds the offline banner from the vendored warning banner skeleton with a sprite icon 21ms
     × leaves the vendored icon class to sprite icons, so it never resizes the app's own icons 1ms
     × keep no copy of the offline indicator the banner replaces 2ms
 ❯ tests/pwa.test.js (8 tests | 7 failed) 406ms
     × shows no toast on the first install 199ms
     × offers one persistent, localized Update toast in the shell's toast region for a waiting worker 52ms
     × announces the toast through the vendored polite live region 26ms
     × activates the waiting worker on Update and reloads once it takes control 25ms
     × never reloads by itself when another tab activates the update 24ms
     × shows while the browser is offline and hides once it is back online 28ms
     × carry the app-icon class, never the vendored icon class that resizes them 33ms
 Test Files  3 failed | 5 passed (8)
      Tests  18 failed | 169 passed (187)
```

`node tests/update-browser.mjs`, exit code 1: the old worker activates itself, so no Update toast appears.

```text
ok - the first install precaches every asset and controls the page
ok - the first install shows no Update toast
[... 3 lines omitted ...]
    at C:\Dev-Projects\meteo\.plan\work\T0034-replace-the-app-s-shared-components-with-the\tests\update-browser.mjs:46:15 {
  log: [
    "  - waiting for locator('.app__overlays .toast-region .toast') to be visible"
  ],
  name: 'TimeoutError'
}
```

### Switch Proof, Before
`node tests/switch-proof.mjs --root <git archive of 7857b0d> --out proof/before`, exit code 0, with the extended harness.

```text
captured forecast-1440-dark-blue
captured about-1440-dark-blue
captured config-1440-dark-blue
captured offline-1440-dark-blue
```

### Final Verification
`npm test`, exit code 0:

```text
 Test Files  8 passed (8)
      Tests  187 passed (187)
   Start at  23:55:20
   Duration  3.12s (environment 76%, tests 17%, import 4%, transform 2%, worker 1%)
```

`node vendor/design/bin/check.mjs`, exit code 0:

```text
integrity: PASS
conformance: PASS
```

`lint-markdown check --offline README.md CHANGELOG.md CHANGELOG.nl.md docs/specs/visual-style-guide.md`, exit code 0:

```text
All 4 markdown files passed linting.
```

`python scripts/generate-sw.py`, exit code 0:

```text
Generated sw.js with 82 precached assets (version v1.3.0-pre).
```

`python -m unittest discover -s tests -k TestDevopsAdapter`, exit code 0:

```text
...................
----------------------------------------------------------------------
Ran 19 tests in 0.279s

OK
```

`python -m unittest discover -s tests -k TestDevopsCli`, exit code 0:

```text
....
----------------------------------------------------------------------
Ran 4 tests in 3.315s

OK
```

`npm run test:browser`, exit code 0; final update scenario output:

```text
ok - the first install precaches every asset and controls the page
ok - the first install shows no Update toast
ok - the changed worker installs and waits instead of taking over
ok - the Update toast shows the English ready text
ok - the Update toast offers the Update action
ok - the Update toast stays above the taller start action bar
ok - the toast text keeps the text color, not the app's muted paragraphs (rgb(31, 41, 51))
ok - the Update toast stays past the 8 second expiry of ordinary toasts
ok - Update activates the waiting worker and reloads under it
ok - the new worker removes the old cache
ok - the reloaded page shows no Update toast
ok - no console, page or network errors
```

The browser suite also passed shell and forecast scenarios, including responsive layouts, both themes, and all accents.

### Full Check Blocker
`python scripts/devops.py check`, exit code 1 after stopping recursive Python tests:

```text
**[ERROR]** Python test suite failed.
**[ERROR]** Finished devops check in 169.8s with status: failed
```

Lint and vendored checks passed before the Python suite started.
Existing release integration tests invoke `release --skip-checks`, but `MeteoProject.release` forwards `skip_checks=False`.
Its quality check runs the Python suite again inside another temporary clone, recursively.
Observed descendants included PIDs 91164 and 94096 under the suite's PID 80428.
Stopped the suite and observed descendants through `processes kill --yes --force`; no release implementation changed here.
The required full check remains blocked; step 5 stays unchecked pending a prerequisite fix or explicit verification waiver.

`plan tasks validate --completion --verbose C:/Dev-Projects/meteo/.plan/tasks/T0034-replace-the-app-s-shared-components-with-the.md`, exit code 1:

```text
Resolved worktree root: C:\Dev-Projects\meteo\.plan
Task files being validated:
- **NOT OK** [T0034-replace-the-app-s-shared-components-with-the.md] TF022 [completed-steps-checked]

Found 1 lint issue across 1 task file.
```

Completion validation correctly rejects the unfinished verification step; review also remains pending.

### Switch Proof, After
`node tests/switch-proof.mjs --out C:/Dev-Projects/meteo/.plan/tasks/T0034-replace-the-app-s-shared-components-with-the/proof/after`, exit code 0; final output:

```text
captured start-1440-dark-blue
captured forecast-1440-dark-blue
captured about-1440-dark-blue
captured config-1440-dark-blue
captured offline-1440-dark-blue
```

`node tests/switch-proof.mjs --compare C:/Dev-Projects/meteo/.plan/tasks/T0034-replace-the-app-s-shared-components-with-the/proof/before/styles.json C:/Dev-Projects/meteo/.plan/tasks/T0034-replace-the-app-s-shared-components-with-the/proof/after/styles.json`, exit code 0; final output:

```text
18 differing selector properties
```

All differences belong to the offline banner or its SVG; app icon geometry remains unchanged.
**[Decided]** Adopt the warning banner's contract styling, including its red border/icon, surface background, and regular foreground text.
Banner changes: font 14→16px, weight 500→400, centered→start text, padding 10/14→8/16px, height 43→58px.
Its icon changes from 18→20px; inherited typography follows the banner.
Colors change in both themes; the full comparison can be reproduced from the saved JSON snapshots.
The taller banner shifts offline content downward; screenshots show this deliberate consequence.
No other captured selector properties differ across themes, widths, and accents.

Inspected actual UI captures:
- [Before offline phone](proof/before/offline-390-light.png).
- [After offline phone](proof/after/offline-390-light.png).
- [After offline desktop dark](proof/after/offline-1440-dark.png).
- [Update toast phone light](proof/after/update-toast-mobile-light.png).
- [Update toast desktop dark](proof/after/update-toast-desktop-dark.png).

`$env:SCREENSHOT_DIR='C:/Dev-Projects/meteo/.plan/tasks/T0034-replace-the-app-s-shared-components-with-the/proof/after'; node tests/update-browser.mjs`, exit code 0 after service worker regeneration:

```text
ok - the Update toast stays past the 8 second expiry of ordinary toasts
ok - Update activates the waiting worker and reloads under it
ok - the new worker removes the old cache
ok - the reloaded page shows no Update toast
ok - no console, page or network errors
```

No tokens were renamed; the obsolete `--color-notice-border` definition and references were removed.

## Rebase verification, 2026-11-15
Rebased onto main at 6516248. Preserved unexplained deletions in the Git stash.

Command: `python scripts/devops.py check`; exit code 0.

```text
[... 10 lines omitted ...]
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
.................
----------------------------------------------------------------------
Ran 46 tests in 20.986s
OK
Command: "C:\Program Files\nodejs\npm.CMD" test
Process ID: 46860
> meteo@1.3.0-pre test
> vitest run
 RUN  v5.0.5 C:/Dev-Projects/meteo/.plan/work/T0034-replace-the-app-s-shared-components-with-the
 Test Files  9 passed (9)
      Tests  211 passed (211)
   Start at  00:20:39
   Duration  2.80s (environment 79%, tests 14%, import 4%, worker 2%, transform 1%)
    Isolate  9 workers spawned · ~1.38s startup each (spawn + environment, per file)
             at least ~395ms faster with isolate: false — reuses workers across files instead of one per file
```

Command: `node ./vendor/design/bin/check.mjs`; exit code 0.

```text
integrity: PASS
conformance: PASS
```

Command: `node tests/switch-proof.mjs --out {{companion-dir}}/proof/rebased`; exit code 0.

```text
[... 5 lines omitted ...]
captured start-390-light-yellow
captured forecast-390-light-yellow
captured about-390-light-yellow
captured config-390-light-yellow
captured offline-390-light-yellow
captured start-390-light-red
captured forecast-390-light-red
captured about-390-light-red
captured config-390-light-red
captured offline-390-light-red
captured start-390-dark-blue
captured forecast-390-dark-blue
captured about-390-dark-blue
captured config-390-dark-blue
captured offline-390-dark-blue
captured start-390-dark-yellow
captured forecast-390-dark-yellow
captured about-390-dark-yellow
captured config-390-dark-yellow
captured offline-390-dark-yellow
captured start-390-dark-red
captured forecast-390-dark-red
captured about-390-dark-red
captured config-390-dark-red
captured offline-390-dark-red
captured start-1440-light-blue
captured forecast-1440-light-blue
captured about-1440-light-blue
captured config-1440-light-blue
captured offline-1440-light-blue
captured start-1440-dark-blue
captured forecast-1440-dark-blue
captured about-1440-dark-blue
captured config-1440-dark-blue
captured offline-1440-dark-blue
```

Command: `node tests/switch-proof.mjs --compare {{companion-dir}}/proof/after/styles.json {{companion-dir}}/proof/rebased/styles.json`; exit code 0.

```text
0 differing selector properties
```

Inspected [rebased offline phone](proof/rebased/offline-390-dark.png).

### Cache conflict regression
The combined sprite references initially duplicated one URL and blocked installation; the final generator removes that duplicate.

Command: `npm test -- tests/design.test.js`; exit code 1.

```text
[... 2 lines omitted ...]
> vitest run tests/design.test.js


 RUN  v5.0.5 C:/Dev-Projects/meteo/.plan/work/T0034-replace-the-app-s-shared-components-with-the

 ❯ tests/design.test.js (15 tests | 1 failed) 221ms
   × precaches each asset only once 14ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/design.test.js > precaches each asset only once
AssertionError: expected 84 to be 83 // Object.is equality

- Expected
+ Received

- 83
+ 84

 ❯ tests/design.test.js:192:25
    190| it("precaches each asset only once", () => {

    191|   const assets = precached();
    192|   expect(assets.length).toBe(new Set(assets).size);
       |                         ^
    193| });
    194|
 Test Files  1 failed (1)
      Tests  1 failed | 14 passed (15)
   Start at  00:22:53
   Duration  1.64s (environment 79%, tests 16%, transform 3%, import 2%, worker 1%)


⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

```

Command: `npm test`; exit code 0.

```text

> meteo@1.3.0-pre test
> vitest run


 RUN  v5.0.5 C:/Dev-Projects/meteo/.plan/work/T0034-replace-the-app-s-shared-components-with-the


 Test Files  9 passed (9)
      Tests  212 passed (212)
   Start at  00:23:03
   Duration  2.76s (environment 78%, tests 15%, import 4%, worker 1%, transform 1%)

    Isolate  9 workers spawned · ~1.40s startup each (spawn + environment, per file)
             at least ~400ms faster with isolate: false — reuses workers across files instead of one per file

```

Command: `npm run test:browser`; exit code 1.

```text
[... 389 lines omitted ...]
ok - hovering section 2 highlights its list item
ok - hovering section 3 explains Rain bar in a tooltip inside the sample (3. Rain bar Grows with the rain amount. )
ok - hovering section 3 highlights its list item
ok - hovering section 4 explains Chance of rain in a tooltip inside the sample (4. Chance of rain Probability of more th)
ok - hovering section 4 highlights its list item
ok - hovering section 5 explains Hour in a tooltip inside the sample (5. Hour Start of each hour; the first co)
ok - hovering section 5 highlights its list item
ok - hovering section 6 explains Sky in a tooltip inside the sample (6. Sky Sky condition of each hour, with )
ok - hovering section 6 highlights its list item
ok - hovering section 7 explains Temperature in a tooltip inside the sample (7. Temperature Air temperature at the st)
ok - hovering section 7 highlights its list item
ok - hovering a temperature highlights all twelve temperatures (12)
ok - hovering section 8 explains Wind in a tooltip inside the sample (8. Wind Wind speed 10 m above the ground)
ok - hovering section 8 highlights its list item
ok - hovering section 9 explains Place in a tooltip inside the sample (9. Place The searched place, or your cur)
ok - hovering section 9 highlights its list item
ok - hovering section 10 explains Update time in a tooltip inside the sample (10. Update time When the forecast was fe)
ok - hovering section 10 highlights its list item
ok - hovering badge 6 shows the sky explanation
ok - the sky tooltip shows the nine weather icons
ok - leaving the sample hides the tooltip and highlights
ok - no guide hover console, page or network errors
ok - a touch phone shows no hover tooltip or highlight in the guide
ok - no touch guide console, page or network errors
node:internal/modules/run_main:122
    triggerUncaughtException(
    ^

page.waitForFunction: Timeout 15000ms exceeded.
    at C:\Dev-Projects\meteo\.plan\work\T0034-replace-the-app-s-shared-components-with-the\tests\update-browser.mjs:37:14 {
  log: [],
  name: 'TimeoutError'
}

Node.js v22.14.0
```

Command: `node tests/update-browser.mjs`; exit code 0.

```text
ok - the first install precaches every asset and controls the page
ok - the first install shows no Update toast
ok - the changed worker installs and waits instead of taking over
ok - the Update toast shows the English ready text
ok - the Update toast offers the Update action
ok - the Update toast stays above the taller start action bar
ok - the toast text keeps the text color, not the app's muted paragraphs (rgb(31, 41, 51))
ok - the Update toast stays past the 8 second expiry of ordinary toasts
ok - Update activates the waiting worker and reloads under it
ok - the new worker removes the old cache
ok - the reloaded page shows no Update toast
ok - no console, page or network errors
```

Shell and forecast suites passed before the update timeout; the affected update suite passed after removing the duplicate.

### Final full check
Command: `python scripts/devops.py check`; exit code 0.

```text
[... 10 lines omitted ...]
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
.................
----------------------------------------------------------------------
Ran 46 tests in 25.983s
OK
Command: "C:\Program Files\nodejs\npm.CMD" test
Process ID: 45784
> meteo@1.3.0-pre test
> vitest run
 RUN  v5.0.5 C:/Dev-Projects/meteo/.plan/work/T0034-replace-the-app-s-shared-components-with-the
 Test Files  9 passed (9)
      Tests  212 passed (212)
   Start at  00:23:46
   Duration  3.08s (environment 82%, tests 12%, import 4%, worker 1%, transform 1%)
    Isolate  9 workers spawned · ~1.62s startup each (spawn + environment, per file)
             at least ~463ms faster with isolate: false — reuses workers across files instead of one per file
```

## Round 1 rework verification

Command: `npm test -- tests/pwa.test.js tests/icons.test.js`; exit code 1.

```text
[... 98 lines omitted ...]
+

 ❯ tests/icons.test.js:41:56
     39| it("removes the wifi icon replaced by the shared offline banner", () =…
     40|   expect(createIcon("wifi")).toBeNull();
     41|   expect(readFileSync("assets/icons.svg", "utf8")).not.toContain('id="…
       |                                                        ^
     42| });
     43|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  tests/pwa.test.js > service worker update toast > updates an open toast on language changes, reload=false
 FAIL  tests/pwa.test.js > service worker update toast > updates an open toast on language changes, reload=true
AssertionError: expected 't:pwa.update_ready' to be 'nl:pwa.update_ready' // Object.is equality

Expected: "nl:pwa.update_ready"
Received: "t:pwa.update_ready"

 ❯ tests/pwa.test.js:88:64
     86|     document.dispatchEvent(new CustomEvent("languagechange"));
     87|     expect(document.querySelector(".toast__text").textContent).toBe("n…
     88|     expect(document.querySelector(".toast button").textContent).toBe(`…
       |                                                                ^
     89|     expect(document.querySelectorAll(".toast")).toHaveLength(1);
     90|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯


 Test Files  2 failed (2)
      Tests  3 failed | 31 passed (34)
   Start at  09:06:07
   Duration  1.54s (environment 75%, tests 17%, transform 6%, import 2%, worker 1%)

```

Command: `node tests/update-browser.mjs`; exit code 1.

```text
ok - the first install precaches every asset and controls the page
ok - the first install shows no Update toast
ok - the changed worker installs and waits instead of taking over
ok - the Update toast shows the English ready text
ok - the Update toast offers the Update action
node:internal/modules/run_main:122
    triggerUncaughtException(
    ^

page.waitForFunction: Timeout 30000ms exceeded.
    at C:\Dev-Projects\meteo\.plan\work\T0034-replace-the-app-s-shared-components-with-the\tests\update-browser.mjs:54:14 {
  log: [],
  name: 'TimeoutError'
}

Node.js v22.14.0
```

Command: `npm test`; exit code 0.

```text

> meteo@1.3.0-pre test
> vitest run


 RUN  v5.0.5 C:/Dev-Projects/meteo/.plan/work/T0034-replace-the-app-s-shared-components-with-the


 Test Files  9 passed (9)
      Tests  214 passed (214)
   Start at  09:07:19
   Duration  2.49s (environment 76%, tests 18%, import 4%, worker 1%, transform 1%)

    Isolate  9 workers spawned · ~1.15s startup each (spawn + environment, per file)
             at least ~328ms faster with isolate: false — reuses workers across files instead of one per file

```

Command: `python scripts/devops.py check`; exit code 0.

```text
[... 10 lines omitted ...]
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
.................
----------------------------------------------------------------------
Ran 46 tests in 25.618s
OK
Command: "C:\Program Files\nodejs\npm.CMD" test
Process ID: 39696
> meteo@1.3.0-pre test
> vitest run
 RUN  v5.0.5 C:/Dev-Projects/meteo/.plan/work/T0034-replace-the-app-s-shared-components-with-the
 Test Files  9 passed (9)
      Tests  214 passed (214)
   Start at  09:08:01
   Duration  2.84s (environment 81%, tests 13%, import 3%, worker 1%, transform 1%)
    Isolate  9 workers spawned · ~1.39s startup each (spawn + environment, per file)
             at least ~396ms faster with isolate: false — reuses workers across files instead of one per file
```

Command: `npm run test:browser`; exit code 0.

```text
[... 399 lines omitted ...]
ok - hovering section 7 highlights its list item
ok - hovering a temperature highlights all twelve temperatures (12)
ok - hovering section 8 explains Wind in a tooltip inside the sample (8. Wind Wind speed 10 m above the ground)
ok - hovering section 8 highlights its list item
ok - hovering section 9 explains Place in a tooltip inside the sample (9. Place The searched place, or your cur)
ok - hovering section 9 highlights its list item
ok - hovering section 10 explains Update time in a tooltip inside the sample (10. Update time When the forecast was fe)
ok - hovering section 10 highlights its list item
ok - hovering badge 6 shows the sky explanation
ok - the sky tooltip shows the nine weather icons
ok - leaving the sample hides the tooltip and highlights
ok - no guide hover console, page or network errors
ok - a touch phone shows no hover tooltip or highlight in the guide
ok - no touch guide console, page or network errors
ok - the first install precaches every asset and controls the page
ok - the first install shows no Update toast
ok - the changed worker installs and waits instead of taking over
ok - the Update toast shows the English ready text
ok - the Update toast offers the Update action
ok - an open Update toast follows the selected language
ok - a waiting worker offers no toast before startup translations settle
ok - an already-waiting worker uses the loaded startup language
ok - Escape dismisses the focused toast on config
ok - Escape keeps config open when the toast consumes it
ok - a waiting worker offers no toast before startup translations settle
ok - an already-waiting worker uses the loaded startup language
ok - Escape dismisses the focused toast on about
ok - Escape keeps about open when the toast consumes it
ok - the Update toast stays above the taller start action bar
ok - the toast text keeps the text color, not the app's muted paragraphs (rgb(31, 41, 51))
ok - the Update toast stays past the 8 second expiry of ordinary toasts
ok - Update activates the waiting worker and reloads under it
ok - the new worker removes the old cache
ok - the reloaded page shows no Update toast
ok - no console, page or network errors
```
