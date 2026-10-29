# Meteo

A minimal web app showing the temperature and hourly rain forecast for the next 12 hours.
It is a static HTML/CSS/JS site without a server, hosted on GitHub Pages and installable as a PWA.
The interface is available in English and Dutch.

Use it at [apps.pellicciotta.com/meteo](https://apps.pellicciotta.com/meteo/).

## How It Works
- Type a city, town or postal code and press "Show", or use "Use current location".
- When several places match, pick the one you mean from the list.
- The current location shows its town, province and country, or its coordinates when the lookup fails.
- The forecast shows a bar per hour with the rain in mm, the chance of rain and the temperature.
- Below 480px, time labels appear every two hours; all twelve hourly bars and screen-reader descriptions remain available.
- A summary line tells when rain starts and how heavy it gets, or that it stays dry.
- With the sky setting on, a theme-colored icon starts the summary, showing the current hour's weather.
- That setting also adds an hourly condition icon row, with day and night variants, on tall enough screens.
- Unknown conditions omit the icon; clear and partly cloudy icons also require daylight data.
- With the wind setting on, the summary includes maximum wind speed and gusts from 50 km/h, when available.
- That setting also adds hourly wind speeds below the temperatures, on tall enough screens.
- An arrow above each speed points where the wind blows to; screen readers name where it comes from.
- Hourly rows need a screen at least 700px tall, or 800px tall from 480px wide.
- Display settings are off by default and remembered in the browser.
- Settings choose °C or °F, mm or inches, and km/h, mph or m/s.
- Until units are chosen, the first named current location sets its country's usual units; otherwise metric stays.
- The United States and its territories get °F, inches and mph; the United Kingdom gets mph wind.
- The About view explains each part of a numbered sample forecast with every option on.
- Its sky item lists all nine weather icons with their meaning.
- The last place is remembered and reloaded on your next visit.
- Its last forecast is saved too and shown when the app starts offline or a refresh fails.
- The chart always starts at the current hour, also when the app resumes offline.
- A saved forecast keeps its original update time.
- With fewer than 6 hours left, the saved forecast gives way to the network error.

The browser fetches the weather and place search data directly from the free [Open-Meteo](https://open-meteo.com/) APIs:
- [Forecast API](https://open-meteo.com/en/docs) for hourly temperature, precipitation, rain probability, wind speed, gusts and direction, weather codes and daylight.
- [Geocoding API](https://open-meteo.com/en/docs/geocoding-api) for place and postal code search.

The name of the current location comes from the [OpenStreetMap Nominatim reverse API](https://nominatim.org/release-docs/latest/api/Reverse/).
Only the rounded coordinates are sent, once per location request or language switch.
Place names © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, licensed under ODbL.

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
