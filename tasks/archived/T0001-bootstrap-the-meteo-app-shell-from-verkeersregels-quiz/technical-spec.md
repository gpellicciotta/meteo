# T0001 Technical Specifications

### Decisions
- **[Decided]** Copy shared files verbatim with a mechanical script; hand-write the slimmed modules.
- **[Decided]** Keep the quiz `js/` layout at the repository root so GitHub Pages serves it unchanged.
- **[Decided]** Supported languages are `nl` and `en`; default follows `?lang`, stored choice, then `navigator.language`.
- **[Decided]** `CHANGELOG.md` is English (global language rule); `CHANGELOG.nl.md` is its Dutch twin shown in the app.
- **[Decided]** `README.md` is English; no project CLAUDE.md overrides are introduced.
- **[Decided]** The issue-report modal is dropped: its Google Apps Script endpoint belongs to the quiz.
- **[Decided]** Tests use Vitest (unit) and a Playwright script (browser), both as npm dev dependencies.
- **[Decided]** The app icon and manifest branding move to the separate task T0004.
- Preferences use the storage key `meteo_preferences`; the service worker cache prefix becomes `meteo-`.

### Mechanical Change
Mechanical command: python .plan/tasks/T0001-bootstrap-the-meteo-app-shell-from-verkeersregels-quiz/bootstrap-from-quiz.py ../verkeersregels-quiz .

The script copies `FUNDING.yml`, `LICENSE.md`, the manifest, five JS modules and four Python scripts verbatim.
It prunes quiz-only rules from `css/style.css` and keeps only shell keys in `data/strings.{nl,en}.json`.
Hand edits are measured against commit `bc9991a`, the second mechanical run that added the placeholder icons.

### Declared Files
- `index.html`
- `js/app.js`
- `js/dom.js`
- `js/params.js`
- `js/preferences.js`
- `js/config-view.js`
- `js/screens.js`
- `js/i18n.js`
- `js/changelog.js`
- `js/pwa.js`
- `data/strings.nl.json`
- `data/strings.en.json`
- `scripts/generate-sw.py`
- `README.md`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`
- `package.json`
- `tests/shell.test.js`

Generated files: `sw.js` (`python scripts/generate-sw.py generate`) and `package-lock.json` (`npm install`).

### Tests
- Unit: `strings.nl.json` and `strings.en.json` share the same key set.
- Unit: Every `data-i18n`, `data-i18n-aria`, `data-i18n-tooltip` and `data-i18n-placeholder` key in `index.html` exists.
- Unit: Every literal `t("key")` call in `js/*.js` exists in both dictionaries.
- Unit: Every relative ES module import in `js/*.js` resolves to an existing file.
- Unit: Every `getElementById` id in `js/dom.js` exists in `index.html`.
- Unit: `sw.js` precaches only existing files and lists every `js/*.js` module.
- Unit: `CHANGELOG.md` and `CHANGELOG.nl.md` start with the same version heading.
- Integration: Load the start view, open Settings, switch to English, open About and see the version tag.
- Integration: Capture desktop and mobile screenshots in light and dark mode.
- Integration: Fail on any console error, page error, failed request or HTTP status of 400 or higher.

Completion check: npm test && node tests/shell-browser.mjs

Size estimate: 18 files, 900 lines

Size note: the shell spans markup, wiring, strings, docs and tests; each piece alone cannot run or merge.
