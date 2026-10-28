# T0004 Walkthrough & Validation

## Key Changes
- `assets/favicon.svg` is a hand-written rain-cloud icon on the theme blue, with a `<title>`.
- `scripts/generate-pwa-icons.py` renders all PNG sizes and `favicon.ico` from that SVG.
- The manifest is named "Meteo" with the `weather` category and English language.
- `index.html` needed no change: its title, theme color and Apple title were already Meteo.

## Red Phase
`npx vitest run` before the icon and manifest changed, exit code 1:

```text
     × names the app Meteo and points at existing icon files 15ms
     × uses a weather favicon instead of the copied traffic sign 9ms
      Tests  2 failed | 21 passed (23)
```

## Green Phase
`python scripts/generate-pwa-icons.py generate`, exit code 0:

```text
Generated all PWA icons (192, 512, maskable, apple-touch-icon) and transparent favicon.ico.
```

`npx vitest run`, exit code 0:

```text
 Test Files  2 passed (2)
      Tests  23 passed (23)
```

`node tests/shell-browser.mjs`, exit code 0:

```text
ok - start view shows the Meteo title
ok - Dutch is active with ?lang=nl
ok - manifest.webmanifest loads with HTTP 200
ok - assets/favicon.svg loads with HTTP 200
ok - favicon.ico loads with HTTP 200
ok - assets/icons/icon-192.png loads with HTTP 200
[... 12 lines omitted ...]
ok - no console, page or network errors
```

`python ../dev-guidelines/scripts/lint-markdown.py CHANGELOG.md CHANGELOG.nl.md`, exit code 0:

```text
All 2 markdown files passed linting.
```

## Screenshots
- Before: [quiz D5 icon](screenshots/before-icon-512.png)
- After: [icon 512](screenshots/after-icon-512.png), [maskable 192](screenshots/after-icon-maskable-192.png), [start view](screenshots/start-desktop-light.png)
