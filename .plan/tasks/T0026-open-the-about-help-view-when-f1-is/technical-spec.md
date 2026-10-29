# T0026 Technical Specifications

### Behavior
- The existing `keydown` listener in `js/app.js` handles `F1` before its Escape handling.
- F1 calls `preventDefault()`, so browsers that allow it skip their own help page.
- From the start view, F1 opens the About view, scrolled to the top where the guide starts.
- From Settings, F1 first closes Settings without saving, reverting a theme preview, then opens About.
- In the About view, F1 keeps it open and scrolls back to the guide.
- **[Decided]** F1 works on every device with a keyboard; the request names desktop, where it matters.
- The About help entry mentions the key: "View this guide, sources, release notes and support links. Shortcut: F1."
  Dutch: "Bekijk deze uitleg, bronnen, release notes en donaties. Sneltoets: F1.".

### Declared Files
- `js/app.js`
- `index.html`
- `data/strings.en.json`
- `data/strings.nl.json`
- `tests/shell-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`
- `README.md`

Mechanical command: python scripts/generate-sw.py generate

### Tests
- Unit: none; the change wires a key to the existing view switch.
- Integration: `tests/shell-browser.mjs`:
  - pressing F1 on the start view shows the About view, and the keydown default is prevented;
  - pressing F1 in Settings after previewing the dark theme shows About and reverts the preview;
  - pressing F1 in About keeps About open with its content scrolled to the top;
  - Escape still returns to the start view afterwards.

Completion check: npm test && npm run test:browser

Size estimate: 8 files, 70 lines
