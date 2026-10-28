# Meteo

A minimal web app showing the temperature and hourly rain forecast for the next 12 hours.
It is a static HTML/CSS/JS site without a server, hosted on GitHub Pages and installable as a PWA.
The interface is available in English and Dutch.

Meteo started from the application shell of [Verkeersregels Quiz](https://github.com/gpellicciotta/verkeersregels-quiz).
It keeps the same minimal look, the About and Settings views, theming and language switching.

## URL Parameters
- `?lang=en|nl`: sets the interface language (default: browser language, else English).
- `?theme=light|dark|system`: sets the color theme (default `system`).
- `?theme-color=blue|yellow|red`: sets the accent color (default `blue`).
- `?view=about` (alias: `?about`): opens the About view directly.
- `?config=1` (alias: `?modal=config`): opens the Settings view directly.

## Development
Requirements: Node.js 22 or higher, Python 3.10 or higher, and Google Chrome for the browser tests.

```bash
npm install
npm test                       # Vitest unit tests
node tests/shell-browser.mjs   # Playwright browser check of the app shell
```

Set `SCREENSHOT_DIR` to save desktop and mobile screenshots in light and dark mode during browser checks.

Serve the site locally for manual review:

```bash
python scripts/run-review-server.py serve --port 8062
```

Regenerate the service worker after adding, removing or changing any precached file:

```bash
python scripts/generate-sw.py generate
```

## License
[MIT](LICENSE.md)
