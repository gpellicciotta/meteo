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
