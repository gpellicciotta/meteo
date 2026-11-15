# T0039 validation

## Walkthrough & Validation

Command: `npm test -- tests/accent.test.js`; exit code 1.

```text
[... 64 lines omitted ...]

 FAIL  tests/accent.test.js > style guide > dark blue adopts bright's --color-on-primary
AssertionError: expected '#ffffff' to be '#0f172a' // Object.is equality

Expected: "#0f172a"
Received: "#ffffff"

 ❯ tests/accent.test.js:195:45
    193|   it.each(["--color-primary", "--color-primary-hover", "--color-primar…
    194|     "dark blue adopts bright's %s", (token) => {
    195|       expect(effective("Dark blue", token)).toBe(bright("Dark blue", t…
       |                                             ^
    196|     }
    197|   );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

 FAIL  tests/accent.test.js > style guide > dark-blue primary text and icons pass on every shared ground
AssertionError: expected 3.4540665676655196 to be greater than or equal to 4.5
 ❯ tests/accent.test.js:207:99
    205|   it("dark-blue primary text and icons pass on every shared ground", (…
    206|     for (const ground of ["--color-bg", "--color-surface", "--color-su…
    207|       expect(contrast(effective("Dark blue", "--color-primary"), effec…
       |                                                                                                   ^
    208|     }
    209|     expect(tableRows(read(GUIDE), "AA exceptions").filter(([label]) =>…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯


 Test Files  1 failed | 1 passed (2)
      Tests  5 failed | 27 passed (32)
   Start at  09:17:11
   Duration  1.37s (environment 88%, tests 6%, transform 3%, import 3%, worker 1%)

```

Command: `SCREENSHOT_DIR={{companion-dir}}/proof/before node tests/dark-blue-browser.mjs`; exit code 1.

```text
[... 9 lines omitted ...]
ok - no horizontal scrolling
ok - config renders at 390px in dark
ok - no horizontal scrolling
ok - keyboard focus is visible
ok - about renders at 390px in dark
ok - no horizontal scrolling
ok - start renders at 1440px in light
ok - no horizontal scrolling
ok - config renders at 1440px in light
ok - no horizontal scrolling
ok - keyboard focus is visible
ok - about renders at 1440px in light
ok - no horizontal scrolling
ok - start renders at 1440px in dark
ok - no horizontal scrolling
ok - config renders at 1440px in dark
ok - no horizontal scrolling
ok - keyboard focus is visible
ok - about renders at 1440px in dark
ok - no horizontal scrolling
ok - light default fill is rgb(26, 86, 219)
ok - light default label is rgb(255, 255, 255)
ok - light hover fill is rgb(22, 63, 158)
ok - light hover label is rgb(255, 255, 255)
ok - light focus fill is rgb(22, 63, 158)
ok - light focus label is rgb(255, 255, 255)
file:///C:/Dev-Projects/meteo/tests/browser-harness.mjs:124
    throw new Error(`Check failed: ${message}`);
          ^

Error: Check failed: dark default fill is rgb(37, 99, 235)
    at check (file:///C:/Dev-Projects/meteo/tests/browser-harness.mjs:124:11)
    at file:///C:/Dev-Projects/meteo/tests/dark-blue-browser.mjs:59:5

Node.js v22.14.0
```

Command: `npm test -- tests/accent.test.js`; exit code 0.

```text

> meteo@1.3.0-pre test
> vitest run tests/accent.test.js


 RUN  v5.0.5 C:/Dev-Projects/meteo


 Test Files  2 passed (2)
      Tests  32 passed (32)
   Start at  09:18:11
   Duration  1.74s (environment 92%, tests 3%, import 3%, transform 1%, worker 1%)

```

Command: `SCREENSHOT_DIR={{companion-dir}}/proof/after node tests/dark-blue-browser.mjs`; exit code 0.

```text
[... 19 lines omitted ...]
ok - keyboard focus is visible
ok - about renders at 1440px in light
ok - no horizontal scrolling
ok - start renders at 1440px in dark
ok - no horizontal scrolling
ok - config renders at 1440px in dark
ok - no horizontal scrolling
ok - keyboard focus is visible
ok - about renders at 1440px in dark
ok - no horizontal scrolling
ok - light default fill is rgb(26, 86, 219)
ok - light default label is rgb(255, 255, 255)
ok - light hover fill is rgb(22, 63, 158)
ok - light hover label is rgb(255, 255, 255)
ok - light focus fill is rgb(22, 63, 158)
ok - light focus label is rgb(255, 255, 255)
ok - dark default fill is rgb(96, 165, 250)
ok - dark default label is rgb(15, 23, 42)
ok - dark hover fill is rgb(147, 197, 253)
ok - dark hover label is rgb(15, 23, 42)
ok - dark focus fill is rgb(147, 197, 253)
ok - dark focus label is rgb(15, 23, 42)
ok - light default fill is rgb(26, 86, 219)
ok - light default label is rgb(255, 255, 255)
ok - light hover fill is rgb(22, 63, 158)
ok - light hover label is rgb(255, 255, 255)
ok - light focus fill is rgb(22, 63, 158)
ok - light focus label is rgb(255, 255, 255)
ok - dark default fill is rgb(96, 165, 250)
ok - dark default label is rgb(15, 23, 42)
ok - dark hover fill is rgb(147, 197, 253)
ok - dark hover label is rgb(15, 23, 42)
ok - dark focus fill is rgb(147, 197, 253)
ok - dark focus label is rgb(15, 23, 42)
ok - no console, page or network errors: 
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
Ran 48 tests in 20.157s
OK
Command: "C:\Program Files\nodejs\npm.CMD" test
Process ID: 5328
> meteo@1.3.0-pre test
> vitest run
 RUN  v5.0.5 C:/Dev-Projects/meteo
 Test Files  18 passed (18)
      Tests  434 passed (434)
   Start at  09:19:13
   Duration  4.95s (environment 74%, tests 20%, import 4%, worker 1%, transform 1%)
    Isolate  18 workers spawned · ~1.23s startup each (spawn + environment, per file)
             at least ~1.94s faster with isolate: false — reuses workers across files instead of one per file
```

Saved 12 before and 12 after screenshots across three screens, two widths, and both themes.
Inspected [before dark phone](proof/before/start-390-dark.png), [after dark phone](proof/after/start-390-dark.png), [dark Settings desktop](proof/after/config-1440-dark.png), and [light phone](proof/after/start-390-light.png).
The full JavaScript count includes the retained T0034 worktree.
