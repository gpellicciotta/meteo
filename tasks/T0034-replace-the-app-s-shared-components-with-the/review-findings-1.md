---
task: T0034
round: 1
verdict: rejected
reviewer: "@gemini"
reviewed_at: 2026-11-14T23:34:13Z
reviewed_commit: "3cff0a8"
base_commit: "6516248"
branch: task/T0034-replace-the-app-s-shared-components-with-the
session: antigravity-20261115-b56daa
session_agent: antigravity
session_created_at: 2026-11-14T23:24:23Z
---
# Review Findings: Task T0034 (Round 1)

## Summary
Rejected due to two behavioral defects in the adopted toast integration and one leftover sprite symbol from rebasing onto T0035.
The public `looks/bright/index.css` switch, warning offline banner, `app-icon` collision fix, precache closure, and vendored checks otherwise work cleanly.

## Defects
- Blocking — Unlocalized raw keys and stale language in the persistent Update/Reload toast (`js/app.js`, `js/pwa.js`):
  - `js/app.js` invokes `registerServiceWorker()` before `setLang(detectLang())` finishes fetching and parsing `data/strings.${lang}.json`.
  - When a waiting worker already exists at page load (for example in a second tab, reload, or PWA reopen), `serviceWorker.register("./sw.js")` resolves while `dict` in `js/i18n.js` is still `{}`.
  - `UPDATE_MESSAGES` then evaluates `t("pwa.update_ready")` and `t("pwa.update_action")` to raw key strings `"pwa.update_ready"` and `"pwa.update_action"`, rendering and announcing raw keys in the persistent toast and polite live region.
  - Switching languages via `#btn-lang` or Settings dispatches `languagechange` without reloading, leaving an open Update or Reload toast in the prior language because `toast.js` nodes carry no `data-i18n` attributes.

- Blocking — Pressing `Escape` inside a focused Update toast also closes Settings or About (`js/app.js`):
  - `vendor/design/js/toast.js` handles `Escape` on `.toast` by calling `event.preventDefault()` and dismissing the toast without stopping propagation.
  - The `document` `keydown` listener in `js/app.js` does not check `e.defaultPrevented`, so pressing `Escape` on a focused toast while in Settings (`config`) or About (`about`) also closes the screen, discards unsaved Settings changes, and hides the control receiving restored focus.

- Blocking — Dead `<symbol id="icon-wifi">` remains in the shipped sprite (`assets/icons.svg`):
  - The technical specification requires removing the `wifi` icon now replaced by `vendor/design/looks/bright/icons.svg#icon-sync-offline`.
  - Rebasing onto T0035 removed `"wifi"` from `js/icons.js`, but left `<symbol id="icon-wifi">` in `assets/icons.svg` (and `scripts/migrate-icons.mjs`).

## Process Gaps
- Non-blocking — `validation-proof.md` records `npm run test:browser` exiting 1 before the duplicate-cache fix, followed only by `node tests/update-browser.mjs` instead of a full `npm run test:browser` pass matching `Completion check`.

## Required Rework
- Wait for initial `setLang(detectLang())` settlement before offering waiting-worker toasts (while still registering the service worker if string loading fails), and update any displayed Update or Reload toast text and button label on `languagechange` without editing `vendor/design/`.
- Guard the `Escape` branch in `js/app.js` with `if (e.defaultPrevented) return;` so dismissing a focused toast leaves Settings and About open.
- Remove `<symbol id="icon-wifi">` from `assets/icons.svg` (updating `scripts/migrate-icons.mjs` and `tests/leftovers.test.js` as appropriate) and regenerate `sw.js` via `python scripts/generate-sw.py`.
- Add unit and browser regression tests covering an already-waiting worker at startup, in-app language switching while an Update toast is visible, and `Escape` dismissal of a focused toast on Settings/About, then record passing checks in `validation-proof.md`.
