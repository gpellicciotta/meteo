# T0034 Technical Specification
Replace the app's shared components with the vendored ones and import the public bright look entry point.

---

## Technical Specifications

### Inputs
- meteo at `7857b0d`, the task base, with support.webapp `0.1.0` vendored in `vendor/design/`.
- [components.md](../../../../support.webapp/docs/specs/components.md) catalog and skeletons.
- [ADR-0003](../../../../support.webapp/docs/adrs/ADR-0003-components-and-patterns.md) shared patterns: a new worker shows an Update toast.

### Component Inventory
| meteo part                                    | Vendored counterpart                          | Outcome                                       |
| :-------------------------------------------- | :-------------------------------------------- | :-------------------------------------------- |
| `.offline-indicator` with the `wifi` icon     | `banner banner--warning`, sprite `icon-sync-offline` | Replaced                               |
| Silent service worker update and auto reload  | `sw-update.js` `watchWorkerUpdates`           | Replaced: persistent Update toast             |
| No toast; empty `.toast-region`               | `toast.js` `createToast`                      | Adopted for the update toast                  |
| No hidden announcer                           | `live-region.js` `createLiveRegion`           | Adopted at page load through the toaster      |
| No dialog                                     | `dialog.js`                                   | Nothing to replace                            |
| `#forecast-status`, `#start-error` lines      | loading status line                           | Kept: visible, app-local status lines         |
| CSS `[data-tooltip]` tooltips                 | `tooltip.js` `attachTooltip`                  | Kept: outside the named scope; follow-up      |
| `btn-primary`, `config-select`, checkboxes    | `button`, `field`, `checkbox`                 | Kept: outside the named scope; follow-up      |
| Forecast chart, guide sample, meta bar        | none (catalog: not in the package)            | Kept app-local                                |
| `js/icons.js` icons, class `icon`             | `icon` component and sprite                   | Kept for T0035; class renamed `app-icon`      |

### Decisions
- **[Decided]** `css/style.css` imports `vendor/design/looks/bright/index.css` and then `tokens.css`; no private file is imported.
- **[Decided]** meteo's generated SVGs take the class `app-icon` instead of `icon`.
  The vendored `.icon` sets `inline-size`, `block-size`, and `stroke-width`, which override the SVG attributes meteo sizes icons with.
  T0035 moves the icons to the sprite and the vendored `.icon`.
- **[Decided]** The offline indicator follows the banner skeleton: `role="status"`, a sprite icon, and `banner__text`.
  The `wifi` icon, `.offline-indicator`, `.offline-icon`, and `--color-notice-border` go; the banner uses the contract warning tokens.
- **[Decided]** The update flow follows the ADR-0003 shared pattern, replacing the silent activation and reload.
  - `sw.js` no longer calls `skipWaiting()` on install; it calls it on the `{type: 'skip-waiting'}` message and still claims clients.
  - `pwa.js` creates one toaster on the shell's `.toast-region` and passes it to `watchWorkerUpdates`.
  - The toast texts come from `t()` when shown, through getters, so they follow the language at that time.
  - The periodic, online, focus, pageshow, and visibility update checks stay, on the registration the module creates.
  - Workers installed before this change still activate themselves; the first update after it waits for the toast.
- **[Decided]** `scripts/generate-sw.py` precaches the vendored modules the app imports, recursively, and vendored files `index.html` references.
- **[Decided]** The switch proof harness also captures icon geometry, `stroke-width`, and an offline page with the banner shown.

### Declared Files
Counted, modified files:
- `index.html`
- `css/style.css`
- `css/tokens.css`
- `js/pwa.js`
- `js/icons.js`
- `js/dom.js`
- `scripts/generate-sw.py`
- `tests/design.test.js`
- `tests/leftovers.test.js`
- `tests/switch-proof.mjs`
- `data/strings.en.json`
- `data/strings.nl.json`
- `README.md`
- `CHANGELOG.nl.md`

Added or uncounted files:
- `tests/pwa.test.js`, `tests/update-browser.mjs` (added).
- `sw.js` (generated), `package.json` only if the browser script list changes.

Mechanical command: `python scripts/generate-sw.py`.

Size estimate: 14 files, 420 lines.

Size note: above the typical line by file count; the switch, the collision fix, and the tests cannot merge apart.
Importing the public entry without renaming the icon class resizes every icon, and the tests must change with the markup.

### Tests
- Unit: `tests/design.test.js`: `style.css` imports only `looks/bright/index.css` and `tokens.css`; `sw.js` precaches every stylesheet, module, and sprite the page loads.
- Unit: `tests/design.test.js`: the offline indicator follows the banner skeleton: `banner banner--warning`, `role="status"`, a sprite `.icon`, and `banner__text`.
- Unit: `tests/design.test.js`: `sw.js` waits for the `skip-waiting` message instead of activating on install, and claims clients.
- Unit: `tests/pwa.test.js` (happy-dom): with a waiting worker, `registerServiceWorker` shows one persistent localized Update toast in `.toast-region`.
- Unit: `tests/pwa.test.js`: Update posts `{type: 'skip-waiting'}` and reloads once on `controllerchange`; a first install shows no toast.
- Unit: `tests/pwa.test.js`: `createIcon` gives `app-icon` and never the vendored `icon` class.
- Integration: `tests/update-browser.mjs`: a served copy installs its worker, gets a changed `sw.js`, shows the Update toast, and reloads under the new worker on Update.
- Integration: `npm run test:browser` and the switch proof: no icon, layout, or color change outside the listed deliberate ones.

Completion check: `python scripts/devops.py check`, `node ./vendor/design/bin/check.mjs`, and `npm run test:browser`, all exit code 0.
