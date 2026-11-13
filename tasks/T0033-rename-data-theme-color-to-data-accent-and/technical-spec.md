# T0033 Technical Specification
Rename data-theme-color to data-accent and document every palette override and AA exception.

---

## Technical Specifications

### Inputs
- meteo at `33c5cc9`, the task base.
- support.webapp ADR-0002 (looks, app overrides) and ADR-0007 (lossless switch proof).
- Palette input: the T0031 recommended override set, as T0032 applied it in `css/tokens.css`.

### Findings at the base
- The bright look's `[data-accent="{{value}}"]` rules match nothing yet, because meteo sets `data-theme-color`.
- After the rename they match; each sets `--color-primary`, `-hover`, `-active`, and `--color-on-primary`.
- meteo sets those four tokens for every accent and theme, so its rules decide every value:
  - Yellow and red: `:root[data-accent]` (0,2,0) and the dark rules (0,3,0) outrank the bare rule (0,1,0).
  - Light blue: plain `:root` ties with the bare rule and wins only by load order.

### Decisions
- **[Decided]** Rename only the root attribute, in `js/theme.js`, `js/config-view.js`, and the startup script in `index.html`.
  These names stay, as public or standard names outside ADR-0002's scope:
  - the `?theme-color=` URL parameter and its aliases;
  - the stored `themeColor` preference;
  - `<meta name="theme-color">`;
  - the `#config-theme-color` select and its string keys.
- **[Decided]** Light blue tokens move to `:root, :root[data-accent="blue"]`, so they outrank the look whatever the load order.
  `:root` keeps them as defaults when the attribute is missing.
- **[Decided]** Dark blue keeps meteo's `#2563eb` fill, `#1d4ed8` hover, and white labels, so the switch stays lossless.
  The style guide lists it as a deliberate exception: the fill as an icon reaches 2.83:1 on `surface`.
  T0031's `[Feedback Needed]` on the package's light fill stays open as a user decision.
- **[Decided]** Headings keep `--color-primary`; the style guide lists their contrast gaps, and T0034 owns the change.
- **[Decided]** meteo's style guide lives at `docs/specs/visual-style-guide.md`, linked from `docs/index.md`, per the ui-guidelines.
- **[Decided]** `devops.py lint` covers only `CORE_DOCS`; this task lints the two new pages directly.
  Adding `docs/` to `CORE_DOCS` changes the CLI and its test, so it becomes a follow-up task.

### Declared Files
Counted, modified files:
- `js/theme.js`
- `js/config-view.js`
- `index.html`
- `css/tokens.css`
- `tests/shell-browser.mjs`
- `README.md`
- `CHANGELOG.nl.md`

Added or uncounted files:
- `tests/accent.test.js`, `docs/index.md`, `docs/specs/visual-style-guide.md`: added.
- `CHANGELOG.md`: uncounted.

Size estimate: 7 files, 140 lines.

### Tests
- Unit: `tests/accent.test.js` (happy-dom):
  - `applyTheme` sets `data-accent` to each of `blue`, `yellow`, and `red`, lowercased, defaulting to `blue`.
  - `applyTheme` sets no `data-theme-color`.
  - The OS theme listener re-applies the accent read from `data-accent`.
  - The `index.html` startup script sets `data-accent` from `?theme-color=` and from the stored preference.
  - No `data-theme-color` remains in `index.html`, `js/`, `css/`, `sw.js`, or `README.md`.
  - Every contract token override in `tokens.css` appears in the style guide's override table, with its value per accent and theme.
  - The style guide lists white labels on yellow as an AA exception in both themes.
- Integration: `tests/shell-browser.mjs`: choosing an accent in Settings previews `data-accent`; Escape reverts it.
  The palette check also asserts the root's `data-accent` value.
- Integration: `tests/switch-proof.mjs` at 390 and 1440 px, light and dark, on `33c5cc9` and after the change.
  Its compare step must report 0 differing selector properties.

Completion check: `npm test`, `npm run test:browser`, `node ./vendor/design/bin/check.mjs`, `.venv/Scripts/python.exe scripts/devops.py check`, and `lint-markdown check --offline docs/index.md docs/specs/visual-style-guide.md`, all exit code 0, plus a switch-proof compare reporting 0 differences.
