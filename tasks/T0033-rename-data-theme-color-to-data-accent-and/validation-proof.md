## Walkthrough & Validation

Runs happen in the task worktree at base `33c5cc9`, after `npm ci`.

### Red phase
`npx vitest run tests/accent.test.js` exit code 1 (first lines of each failure kept):

```text
 ❯ tests/accent.test.js (13 tests | 13 failed) 48ms
     × applyTheme sets data-accent to blue and no data-theme-color 14ms
     × applyTheme sets data-accent to yellow and no data-theme-color 2ms
     × applyTheme sets data-accent to red and no data-theme-color 1ms
     × applyTheme lowercases the accent and defaults to blue 1ms
     × keeps the accent from data-accent when the OS theme changes 3ms
     × sets data-accent in the startup script from the URL and from the stored preference 3ms
     × leaves no use of the renamed data-theme-color attribute 12ms
     × overrides the look's accent rules with :root selectors, which outrank them whatever the load order 2ms
     × is linked from docs/index.md 3ms
     × lists every contract token override with meteo's and the look's value 1ms
     × lists each AA exception with its measured ratio below the minimum 1ms
     × lists the white labels on the Light yellow fill as an AA exception 1ms
     × lists the white labels on the Dark yellow fill as an AA exception 1ms
 FAIL  tests/accent.test.js > accent attribute > applyTheme sets data-accent to blue and no data-theme-color
AssertionError: expected null to be 'blue' // Object.is equality
 FAIL  tests/accent.test.js > accent attribute > keeps the accent from data-accent when the OS theme changes
AssertionError: expected null to be 'red' // Object.is equality
 FAIL  tests/accent.test.js > accent attribute > sets data-accent in the startup script from the URL and from the stored preference
AssertionError: expected null to be 'yellow' // Object.is equality
 FAIL  tests/accent.test.js > accent attribute > leaves no use of the renamed data-theme-color attribute
AssertionError: expected [ 'index.html', …(3) ] to deeply equal []
 FAIL  tests/accent.test.js > accent attribute > overrides the look's accent rules with :root selectors, which outrank them whatever the load order
AssertionError: expected [ …(5) ] to deeply equal []
 FAIL  tests/accent.test.js > style guide > is linked from docs/index.md
Error: ENOENT: no such file or directory, open '[...]\docs\index.md'
 FAIL  tests/accent.test.js > style guide > lists every contract token override with meteo's and the look's value
Error: ENOENT: no such file or directory, open '[...]\docs\specs\visual-style-guide.md'
[... 196 lines omitted: the remaining failures, the same ENOENT, and the stack lines ...]
 Test Files  1 failed (1)
      Tests  13 failed (13)
```

`node tests/shell-browser.mjs` exit code 1, failures only (`ok -` lines filtered):

```text
Check failed: choosing the yellow accent previews it as data-accent
Check failed: the light blue page sets data-accent="blue"
```

### Green phase
Runs follow the last code change; the docs and changelogs changed afterwards, so the check and lint reran.

`.venv/Scripts/python.exe scripts/devops.py check` exit code 0 (Git line-ending warnings filtered, path prefixes kept):

```text
Command: C:\Dev-Projects\meteo\.plan\work\T0033-rename-data-theme-color-to-data-accent-and\.venv\Scripts\lint-markdown.EXE check --offline LICENSE.md README.md CHANGELOG.md CHANGELOG.nl.md
Process ID: 93804
All 4 markdown files passed linting.
Command: node C:\Dev-Projects\meteo\.plan\work\T0033-rename-data-theme-color-to-data-accent-and\vendor\design\bin\check.mjs
Process ID: 26536
integrity: PASS
conformance: PASS
Command: C:\Dev-Projects\meteo\.plan\work\T0033-rename-data-theme-color-to-data-accent-and\.venv\Scripts\python.exe -m unittest discover -s tests
Process ID: 68980
.
----------------------------------------------------------------------
Ran 28 tests in 34.315s
OK
Command: "C:\Program Files\nodejs\npm.CMD" test
Process ID: 39376
> meteo@1.3.0-pre test
> vitest run
 RUN  v5.0.5 C:/Dev-Projects/meteo/.plan/work/T0033-rename-data-theme-color-to-data-accent-and
 Test Files  7 passed (7)
      Tests  174 passed (174)
   Start at  22:51:46
   Duration  3.76s (environment 78%, tests 13%, import 5%, worker 2%, transform 2%)
```

`node ./vendor/design/bin/check.mjs` exit code 0:

```text
integrity: PASS
conformance: PASS
```

`.venv/Scripts/lint-markdown.exe check --offline docs/index.md docs/specs/visual-style-guide.md` exit code 0:

```text
All 2 markdown files passed linting.
```

`npm run test:browser` exit code 0: 400 `ok -` lines, 0 `Check failed` lines; the T0033 checks, verbatim:

```text
ok - choosing the yellow accent previews it as data-accent
ok - closing Settings without saving reverts the accent preview
ok - the light blue page sets data-accent="blue"
ok - the dark blue page sets data-accent="blue"
ok - the light yellow page sets data-accent="yellow"
ok - the dark yellow page sets data-accent="yellow"
ok - the light red page sets data-accent="red"
ok - the dark red page sets data-accent="red"
```

### Lossless switch proof
Before: `node tests/switch-proof.mjs --out {{task-dir}}/proof/before` at `33c5cc9`, exit code 0.
After: `node tests/switch-proof.mjs --out {{task-dir}}/proof/after` on the final tree, exit code 0.
Both cover the four pages at 390 and 1440 px, light and dark; accents at 390 px.

`node tests/switch-proof.mjs --compare {{task-dir}}/proof/before/styles.json {{task-dir}}/proof/after/styles.json` exit code 0:

```text
0 differing selector properties
```

Screenshot comparison with `Get-FileHash` over the 24 PNG files of each capture:

```text
different screenshots: 0
```

Leftover search for the renamed name, as ADR-0007 requires, is the unit test "leaves no use of the renamed data-theme-color attribute".
It covers `index.html`, `sw.js`, `README.md`, `js/`, and `css/`; it passes in the run above.

### Visual differences
None: computed styles of every key element match in all 16 page, width, and theme cases, and in the yellow and red accents.
All 24 screenshots are byte-identical, so no difference needs listing as a fix or a deliberate change.
