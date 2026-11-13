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
