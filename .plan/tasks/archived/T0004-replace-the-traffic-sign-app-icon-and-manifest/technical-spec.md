# T0004 Technical Specifications

- **[Decided]** The icon is a hand-written SVG: a cloud with three rain drops on the theme blue `#1a56db`.
- `scripts/generate-pwa-icons.py` renders from `assets/favicon.svg` instead of `assets/signs/D5.svg`.
- Manifest: name "Meteo", short name "Meteo", category `weather`, language `en`, maskable background `#1a56db`.

### Declared Files
- `assets/favicon.svg`
- `scripts/generate-pwa-icons.py`
- `manifest.webmanifest`
- `index.html`
- `tests/shell.test.js`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`

Generated files: `assets/icons/*.png` and `favicon.ico` (`python scripts/generate-pwa-icons.py generate`).

### Tests
- Unit: Every manifest icon file exists, and the manifest name is "Meteo".
- Unit: `favicon.svg` contains no traffic-sign artwork and parses as SVG.
- Integration: load the start view and confirm the favicon and manifest load with HTTP 200.

Completion check: npm test && node tests/shell-browser.mjs

Size estimate: 7 files, 120 lines
