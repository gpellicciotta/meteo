# T0001 Walkthrough & Validation

## Key Changes
- Mechanical commits `6e96e53` and `bc9991a` hold the bootstrap script output; hand edits are measured against `bc9991a`.
- The stylesheet shrank from 3806 to 1675 lines by dropping quiz-only selectors.
- New slim modules wire the start, About and Settings views with English and Dutch only.
- Tests run in-process: `tests/browser-harness.mjs` serves the repository itself, so no server process needs stopping.

## Red Phase
`npx vitest run` before the shell existed, exit code 1:

```text
     × contain every i18n key used in index.html 11ms
     × contain every literal t() key used in the modules 12ms
     × resolve every relative import 3ms
     × only look up element ids that exist in index.html 1ms
     × precaches existing files including every module 1ms
     × start with the same version in English and Dutch 1ms
      Tests  6 failed | 1 passed (7)
```

`node tests/shell-browser.mjs` before the shell existed, exit code 1:

```text
page.textContent: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('#start-title')
```

## Review Round 1 Rework
- The language now persists under `meteo_lang`; a new unit test requires the `meteo_` prefix for every storage key.
- The changelog reloads on language change only while About is visible; `setLang` rejections are caught.
- Screenshots disable transitions first; the browser script now covers theme preview, revert and the Dutch changelog.
- About strings no longer mention sources; `js/params.js` uses braces; five leftover quiz CSS rules were removed.

Red phase of the new storage-key test, `npx vitest run`, exit code 1:

```text
     × prefixes every localStorage key with meteo_ to stay apart from sibling apps on the same origin 25ms
      Tests  1 failed | 7 passed (8)
```

## Green Phase
`npx vitest run`, exit code 0:

```text
 Test Files  1 passed (1)
      Tests  8 passed (8)
```

`node tests/shell-browser.mjs`, exit code 0:

```text
ok - start view shows the Meteo title
ok - Dutch is active with ?lang=nl
ok - Settings view opens
ok - Settings offers only Dutch and English
ok - saving returns to the start view
ok - language button shows EN
ok - About view opens
ok - About view shows the version tag
ok - language button switches back to Dutch
ok - the language is not stored under the shared key "lang"
ok - About shows the Dutch changelog in Dutch
ok - choosing the dark theme previews it at once
ok - closing Settings without saving reverts the preview
ok - Escape returns to the start view
ok - no console, page or network errors
```

`python ../dev-guidelines/scripts/lint-markdown.py README.md CHANGELOG.md CHANGELOG.nl.md`, exit code 0:

```text
All 3 markdown files passed linting.
```

## Screenshots
Before (quiz start view the shell came from):
- [Desktop](screenshots/before-quiz-start-desktop-light.png), [mobile](screenshots/before-quiz-start-mobile-light.png)

After (`SCREENSHOT_DIR=... node tests/shell-browser.mjs`):
- Start: [desktop light](screenshots/start-desktop-light.png), [desktop dark](screenshots/start-desktop-dark.png), [mobile light](screenshots/start-mobile-light.png), [mobile dark](screenshots/start-mobile-dark.png)
- About: [desktop light](screenshots/about-desktop-light.png), [desktop dark](screenshots/about-desktop-dark.png), [mobile light](screenshots/about-mobile-light.png), [mobile dark](screenshots/about-mobile-dark.png)
