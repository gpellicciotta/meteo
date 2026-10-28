# Meteo

A minimal web app showing the temperature and hourly rain forecast for the next 12 hours.
It is a static HTML/CSS/JS site without a server, hosted on GitHub Pages and installable as a PWA.
The interface is available in English and Dutch.

Use it at [apps.pellicciotta.com/meteo](https://apps.pellicciotta.com/meteo/).

Meteo started from the application shell of [Verkeersregels Quiz](https://github.com/gpellicciotta/verkeersregels-quiz).
It keeps the same minimal look, the About and Settings views, theming and language switching.

## How It Works
- Type a city, town or postal code and press "Show", or use "Use current location".
- When several places match, pick the one you mean from the list.
- The forecast shows a bar per hour with the rain in mm, the chance of rain and the temperature.
- Below 480px, time labels appear every two hours; all twelve hourly bars and screen-reader descriptions remain available.
- A summary line tells when rain starts and how heavy it gets, or that it stays dry.
- A theme-colored icon starts the summary, showing the current hour's weather with day and night variants.
- Unknown conditions omit the icon; clear and partly cloudy icons also require daylight data.
- The summary includes maximum wind speed and gusts from 50 km/h over the next 12 hours, when available.
- The last place is remembered and reloaded on your next visit.
- Its last forecast is saved too and shown when the app starts offline or a refresh fails.
- The chart always starts at the current hour, also when the app resumes offline.
- A saved forecast keeps its original update time.
- With fewer than 6 hours left, the saved forecast gives way to the network error.

The browser fetches all data directly from the free [Open-Meteo](https://open-meteo.com/) APIs:
- [Forecast API](https://open-meteo.com/en/docs) for hourly temperature, precipitation, rain probability, wind, weather codes and daylight.
- [Geocoding API](https://open-meteo.com/en/docs/geocoding-api) for place and postal code search.

Weather data by [Open-Meteo.com](https://open-meteo.com/), licensed under CC BY 4.0.
Open-Meteo's free tier is for non-commercial use only, which matches this ad-free project.

## URL Parameters
- `?location=Gent`: searches a place at startup and shows its forecast.
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
node tests/forecast-browser.mjs  # Playwright browser check of the forecast, with mocked API answers
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
