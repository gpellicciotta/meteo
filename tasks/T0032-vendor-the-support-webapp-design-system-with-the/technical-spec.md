# T0032 Technical Specification
Vendor the support.webapp design system with the bright look and move the three screens into its shell.

---

## Inputs
- support.webapp `v0.1.0` at `30e1f96`, exported with `git archive`; its `src/` and `bin/` equal `6cd1671`, the T0031 basis.
- meteo at `b766712`, the task base.
- Palette input: the recommended override set in T0031's validation-proof.md.

## Decisions
- **[Decided]** Vendor with `node bin/cli.mjs vendor --look bright --to vendor/design --styles css` from the exported tag.
  No registry token is read; the tag export holds the same files the package ships.
- **[Decided]** `css/style.css` imports the private `base.css`, `reset.css`, `shell.css`, and the bright `primitives.css` and `look.css`.
  T0034 switches to the public `looks/bright/index.css`, which adds the shared components that replace meteo's own.
  Importing components now would collide with meteo classes such as `.icon` before T0034 replaces them.
- **[Decided]** meteo's color tokens move to `css/tokens.css`, the only app file the conformance check lets hold raw colors.
- **[Decided]** meteo stops using the bright primitives `--radius-sm` and `--radius-md`:
  - `--radius-sm` (4 px) becomes the contract token `--radius-chip`, also 4 px.
  - `--radius-md` (6 px) becomes the app token `--radius-tile`, also 6 px.
- **[Decided]** meteo tokens that share a contract name but differ in meaning get app names, so shell parts read package values:
  - `--color-border` (control border) becomes `--color-control-border`.
  - `--color-warning-bg`, `-border`, and `-text` (offline notice and docs badge) become `--color-notice-bg`, `-border`, and `-text`.
  - The shell's `--color-border` then equals meteo's `--color-border-subtle` in both themes.
- **[Decided]** Apply the T0031 recommended overrides on `data-theme-color`, which T0033 renames to `data-accent`.
  Selector blocks per theme replace `light-dark()`, so no `@supports` fallback is needed.
- **[Decided]** The two T0031 `[Feedback Needed]` items stay at meteo's values until T0033 confirms them:
  - Dark blue keeps `#2563eb` fills, `#1d4ed8` hover, and white labels.
  - Headings keep `--color-primary`; T0034 owns that component change.
- **[Decided]** Shell areas:
  - Top bar: the three screen titles, centered, plus the About and Settings close buttons in `app__top-actions`.
  - Banners: the offline indicator, toggled with the `hidden` attribute that the banners area reads.
  - Main: the three screen sections.
  - Action bar: one group per screen; the start group holds the meta bar and copyright.
  - Overlays: the empty toast region that ADR-0004 lists.
- **[Decided]** Every screen part carries `data-screen`; `showScreen` toggles them all and scrolls the page to the top.
- **[Decided]** `scripts/devops.py check` runs `node vendor/design/bin/check.mjs` between lint and tests.
- **[Decided]** `scripts/generate-sw.py` precaches `css/tokens.css` and every stylesheet `css/style.css` imports, recursively.

## Declared Files
Counted, modified files:
- `index.html`
- `css/style.css`
- `js/screens.js`
- `js/app.js`
- `js/pwa.js`
- `js/dom.js`
- `scripts/generate-sw.py`
- `scripts/devops.py`
- `tests/test_devops.py`
- `tests/shell.test.js`
- `tests/shell-browser.mjs`
- `tests/forecast-browser.mjs`
- `data/strings.en.json`
- `data/strings.nl.json`
- `package.json`
- `README.md`
- `CHANGELOG.nl.md`

Added or uncounted files:
- `css/tokens.css`, `design.json`, `vendor/design/**` (vendored, mechanical), `tests/screens.test.js`, `tests/design.test.js`, `tests/switch-proof.mjs`.
- `sw.js` and `package-lock.json`: generated.

Mechanical command: `node {{support-webapp-v0.1.0}}/bin/cli.mjs vendor --look bright --to vendor/design --styles css`, run in the app root.
Mechanical command: `python scripts/generate-sw.py`.

Size estimate: 17 files, 850 lines.

Size note: above the typical line, kept whole because the vendored check fails until the styles conform, and the shell needs both.

## Tests
- Unit: `tests/screens.test.js` (happy-dom): `showScreen` shows only the chosen screen's sections, titles, close buttons, and action groups; `currentScreen` names it.
- Unit: `tests/design.test.js`: `design.json` pins 0.1.0 and bright; `index.html` uses the meteo shell skeleton; `style.css` imports the vendored layers; `sw.js` precaches them; `tokens.css` holds the overrides.
- Integration: `tests/shell-browser.mjs` at 390 and 1440 px, light and dark: no horizontal scroll, sticky bars, main column at most 55rem, visible focus ring, reduced motion.
- Integration: `tests/switch-proof.mjs` captures screenshots and computed styles of the main pages, before and after, for the lossless switch proof.

Completion check: `python scripts/devops.py check` and `node ./vendor/design/bin/check.mjs`, both exit code 0, plus `npm run test:browser`.
