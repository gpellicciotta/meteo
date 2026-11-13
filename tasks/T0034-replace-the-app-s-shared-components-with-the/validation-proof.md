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
