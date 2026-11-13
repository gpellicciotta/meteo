## Walkthrough & Validation

### Baseline at b766712
`npm test` exit code 0:

```text
 Test Files  4 passed (4)
      Tests  145 passed (145)
```

`npm run test:browser` exit code 0, 352 `ok -` checks, 78 s.

### Failing tests before the switch
`npx vitest run tests/screens.test.js tests/design.test.js` exit code 1:

```text
 ❯ tests/screens.test.js (7 tests | 6 failed) 142ms
     × give every screen a section in the main area, a title in the top bar, and a group in the action bar 22ms
     × put the About and Settings close buttons in the top bar actions 5ms
     × shows only the start parts in every shell area 3ms
     × shows only the about parts in every shell area 3ms
     × shows only the config parts in every shell area 3ms
     × scrolls the page back to the top, since the document is the scroll container 5ms
 ❯ tests/design.test.js (9 tests | 9 failed) 275ms
     × pins support.webapp 0.1.0 with the bright look and checks the app stylesheets 12ms
     × imports the vendored layers before the app tokens, all from existing files 12ms
     × precaches every stylesheet the page imports, so the shell works offline 3ms
     × uses the meteo setup: page scroll in the narrow column 84ms
     × orders the areas as the meteo skeleton does, with a skip link first 54ms
     × keeps the three screens as sections of the main area 52ms
     × shows the offline indicator as a banner, hidden with the attribute the banners area reads 47ms
     × keep raw colors in css/tokens.css only 3ms
     × use no private bright primitives, such as --radius-sm and --radius-md 3ms
 Test Files  2 failed (2)
      Tests  15 failed | 1 passed (16)
```

`node tests/shell-browser.mjs` exit code 1, failures only (`ok -` lines filtered):

```text
Check failed: the About view scrolls the page, as the shell's page scroll mode does
page.evaluate: TypeError: Failed to execute 'getComputedStyle' on 'Window': parameter 1 is not of type 'Element'.
[... 3 identical failures omitted, one per width and theme ...]
Check failed: the light blue contract tokens follow the assessed overrides: --color-primary-hover rgb(31, 41, 51)
instead of #163f9e; --color-primary-active rgb(31, 41, 51) instead of #163f9e; --color-link rgb(31, 41, 51) instead of
#1a56db; --color-link-hover rgb(31, 41, 51) instead of #1a56db; --color-focus rgb(31, 41, 51) instead of #1a56db;
--color-text-muted rgb(31, 41, 51) instead of #6b7280
exit=1
```

The `getComputedStyle` failures come from the shell layout check, which finds no `#main` before the switch.

### Vendored copy
Exported `v0.1.0` with `git -c core.autocrlf=false archive`, then ran `node bin/cli.mjs vendor --look bright --to vendor/design --styles css`.
A first export kept `core.autocrlf` CRLF bytes, so the copy was re-vendored from an LF export.
Every vendored file matches its `v0.1.0` blob (`git hash-object --no-filters` against `git rev-parse v0.1.0:<path>`):

```text
checked=67 mismatched=0
```

`.gitattributes` marks `vendor/design/**` as `-text`, so checkouts keep those bytes.

### Tests after the switch
`.venv/Scripts/python.exe scripts/devops.py check` exit code 0 (Windows path prefixes shortened):

```text
Command: .venv\Scripts\lint-markdown.EXE check --offline LICENSE.md README.md CHANGELOG.md CHANGELOG.nl.md
All 4 markdown files passed linting.
Command: node vendor\design\bin\check.mjs
integrity: PASS
conformance: PASS
Command: .venv\Scripts\python.exe -m unittest discover -s tests
Ran 28 tests in 13.244s
OK
Command: "C:\Program Files\nodejs\npm.CMD" test
 Test Files  6 passed (6)
      Tests  161 passed (161)
```

`node ./vendor/design/bin/check.mjs` exit code 0:

```text
integrity: PASS
conformance: PASS
```

`npm run test:browser` exit code 0, 392 `ok -` checks; the new shell checks, verbatim:

```text
ok - no horizontal scroll at 390px light (0px)
ok - the main column fills up to --width-narrow, 880px, at 390px light (358.0px)
ok - keyboard focus shows the shared 2px focus ring at 390px light (solid 2px rgb(26, 86, 219))
ok - reduced motion turns every control transition off at 390px light (0s, 0s | 0s)
ok - no horizontal scroll at 390px dark (0px)
ok - the main column fills up to --width-narrow, 880px, at 390px dark (358.0px)
ok - keyboard focus shows the shared 2px focus ring at 390px dark (solid 2px rgb(96, 165, 250))
ok - reduced motion turns every control transition off at 390px dark (0s, 0s | 0s)
ok - no horizontal scroll at 1440px light (0px)
ok - the main column fills up to --width-narrow, 880px, at 1440px light (880.0px)
ok - keyboard focus shows the shared 2px focus ring at 1440px light (solid 2px rgb(26, 86, 219))
ok - reduced motion turns every control transition off at 1440px light (0s, 0s | 0s)
ok - no horizontal scroll at 1440px dark (0px)
ok - the main column fills up to --width-narrow, 880px, at 1440px dark (880.0px)
ok - keyboard focus shows the shared 2px focus ring at 1440px dark (solid 2px rgb(96, 165, 250))
ok - reduced motion turns every control transition off at 1440px dark (0s, 0s | 0s)
ok - the light blue contract tokens follow the assessed overrides
ok - the dark blue contract tokens follow the assessed overrides
ok - the light yellow contract tokens follow the assessed overrides
ok - the dark yellow contract tokens follow the assessed overrides
ok - the light red contract tokens follow the assessed overrides
ok - the dark red contract tokens follow the assessed overrides
```

Two existing forecast checks changed with the switch:
- Light yellow buttons now expect the `#b88000` fill, a deliberate change below.
- The guide hover test leaves the sample over a heading in the About section, since the title moved into the top bar.

### Main column against --width-narrow
- Before, at 1440 px, the About and Settings column measured 888 px: the 960 px card minus 2 × 36 px padding.
- After, `app--width-narrow` gives 880 px, measured by the shell check above.
- **[Decided]** `--width-narrow` fits within 8 px, so no smaller width token is proposed.
- The start screen keeps its own 580 px column inside it, as before.

### Lossless switch proof
Harness: [tests/switch-proof.mjs](../../work/T0032-vendor-the-support-webapp-design-system-with-the/tests/switch-proof.mjs), reusable by T0033 and T0034.
- Before: `node tests/switch-proof.mjs --root <export of b766712> --out proof/before`, exit code 0.
- After: `node tests/switch-proof.mjs --out proof/after`, exit code 0.
- Pages: start, forecast (mocked), About, Settings; 390 × 844 and 1440 × 900 px; light and dark; styles also per accent at 390 px.
- Screenshots: [proof/before](proof/before) and [proof/after](proof/after); `-end` files show a scrolled page's end.
- The before run used full-page captures; the old app never scrolled the document, so they equal viewport captures (390 × 844).
- Computed-style differences: [proof/style-diff.txt](proof/style-diff.txt), 49 selector properties.

Renamed token search, `rg -n -- "--radius-sm|--radius-md|--color-border\)|--color-warning-" css js index.html`: no match.

Visual differences, each a fix or a deliberate change:

| Difference                                                                                            | Kind       |
| :---------------------------------------------------------------------------------------------------- | :--------- |
| From 640 px the centered card with radius and shadow is gone; content sits on the page background.     | Deliberate |
| Headers become the shell top bar: surface fill and bottom border across the window; titles stay centered. | Deliberate |
| Title line height follows the shell, 1.25: About and Settings titles shrink from 30 to 25 px tall on phones. | Deliberate |
| Footers become the sticky shell action bar: surface fill and top border; it replaces the start divider. | Deliberate |
| Close buttons move from the screen corner to the end of the top bar.                                  | Deliberate |
| The phone gutter grows from 14 to 16 px, so columns are 4 px narrower and some lines wrap earlier.      | Deliberate |
| The page scrolls instead of each screen's content area; opening a screen starts at its top.           | Deliberate |
| The light yellow accent darkens from `#ca8a04` to `#b88000` wherever it fills or colors text.          | Deliberate |
| The offline banner sits in the banners area: 12 px above it, 16 px below from the main padding.       | Deliberate |
| Control transitions take 120 ms instead of 150 ms.                                                    | Deliberate |
| Keyboard focus shows a 2 px `--color-focus` outline on every control, besides meteo's own glows.       | Fix        |
| Reduced motion turns every control transition off.                                                    | Fix        |
| A skip link appears on the first Tab and leads to the main area.                                      | Fix        |

Unchanged: dark blue, red, and dark yellow fills; text, muted text, grounds, cards, and rain colors.

### Review round 1 rework: focus failure at 320x568
Finding: `npm run test:browser` failed once in forecast scenario 4 with `the focused icon button is named exactly once (, 1 match)`.

Reproduction: a scratch script repeats scenario 4's resize sequence, then `focus("#location-input")` and Shift+Tab.
It logs `resize`, `focusin`, and `focusout` events in the page. At 39a6858, `node repro-focus.mjs <worktree> 30`, exit code 0:

```text
run 28: FAIL active=BODY
  792.8 focusin location-input
  812.8 resize 1280x800 active=location-input
  844.8 resize 390x667 active=location-input
  --- focus input
  874.8 focusout location-input
  875.8 focusin btn-current-location
  877.8 resize 320x568 active=btn-current-location
  877.8 focusout btn-current-location
4/30 runs failed (no settle)
```

The same script against the export of base commit b766712 (`SERVE_ROOT` set), exit code 0:

```text
run 27: FAIL active=BODY
[... 6 trace lines omitted, same order as above ...]
  970.6 focusout btn-current-location
2/30 runs failed (no settle)
```

Cause: `page.setViewportSize` returns before the page dispatches `resize`.
The 320x568 event can arrive after Shift+Tab focuses the button.
`dismissOpenTooltips` in `js/app.js` then blurs it, as designed for open tooltips, so focus falls to `BODY`.
**[Decided]** Disposition: a pre-existing test synchronization race, present at the base commit and not caused by the shell.
The app behavior stays; the assertion, keyboard order, and exact accessible name stay unchanged.

Fix: `resizeViewport` in `tests/forecast-browser.mjs` waits for the page's `resize` event at the new size before scenario 4 continues.
The same wait in the script, `node repro-focus.mjs <worktree> 60 --settle`, exit code 0:

```text
0/60 runs failed (--settle)
```

`npm run test:browser` after the fix, run three times in a row:

```text
run 1 exit=0 ok=392 failed=0
  ok - the focused icon button is named exactly once (btn-current-location, 1 match)
run 2 exit=0 ok=392 failed=0
  ok - the focused icon button is named exactly once (btn-current-location, 1 match)
run 3 exit=0 ok=392 failed=0
  ok - the focused icon button is named exactly once (btn-current-location, 1 match)
```

Process gap on private imports: `css/style.css` imports five private layers until T0034 switches to `looks/bright/index.css`.
That interim state is the split recorded in T0034's goals; the vendored check passes on it.
