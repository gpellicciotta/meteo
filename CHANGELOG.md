# Versioned Changes

A summarized overview of all changes, per version of this project.

> Entries will be added in reverse chronological order, so with the most recent at the top.
>
> The top-most version heading is always the active in-development version, identified by a `-pre`
> suffix on its version number (e.g. `## v1.1.1-pre`) instead of a status tag. Once a version is frozen
> or released, that suffix is replaced by one of these status codes:
> - `[{{date}}]` - frozen/finalized on {{date}}
> - `[released: {{date}}]` - released to package manager or production on {{date}}
> - `[broken]` - considered broken and not be used

---

## v1.3.0-pre
- DevEx: `devops.py lint` and `format` now also cover [docs/index.md](docs/index.md) and the [visual style guide](docs/specs/visual-style-guide.md).
- DevEx: [devops.py](scripts/devops.py) now runs only on the pinned support-python, switching to the project or primary-checkout `.venv` and failing otherwise.
- FrontEnd: Moved icons to external sprites while preserving glyphs, presentation, and offline availability.
- DevEx: Rebuilt [devops.py](scripts/devops.py) on support-python v3.2.0 DevopsCli, adding `test --slow`, `format`, `release`, and a project-local `.venv`.
- FrontEnd: Removed unused quiz leftovers: 16 icons, 12 style classes, and 9 tokens, with no visual change.
- FrontEnd: Moved the three screens into the support.webapp app shell: sticky top and action bars, a narrow centered column, and no wide-screen card.
- FrontEnd: Added a skip link, visible keyboard focus rings, and reduced-motion handling from the shared design system.
- FrontEnd: Darkened the light yellow accent to `#b88000`, the bright look's AA fill, keeping white labels.
- DevEx: Vendored support.webapp 0.1.0 with the bright look, pinned in [design.json](design.json) and checked by `devops.py check`.
- FrontEnd: Renamed the root attribute `data-theme-color` to `data-accent`, the bright look's variant attribute, with no visual change.
- DevEx: Added a [visual style guide](docs/specs/visual-style-guide.md) listing every palette override and AA exception, including white labels on yellow.
- FrontEnd: Adopted the shared offline banner, accessible update notification, and public bright stylesheet entry point.

## v1.2.0 [released: 2026-11-02]
- DevEx: Added unified [devops.py](scripts/devops.py) CLI for testing, linting, review server, service worker, and deployment.
- DevEx: Consolidated review server operations into [devops.py](scripts/devops.py) and removed obsolete run-review-server.py.

## v1.1.0 [released: 2026-10-29]
- FrontEnd: Added an off-by-default wind setting with the wind summary and, on tall screens, hourly speeds and direction arrows.
- FrontEnd: Added an off-by-default sky setting showing the summary condition icon and, on tall screens, hourly condition icons.
- FrontEnd: Added °F, inch, mph and m/s unit settings, prefilled from the current location's country, else metric.
- FrontEnd: Added an About guide numbering every part of a full sample forecast, with icon meanings, mouse tooltips and F1 access.
- FrontEnd: Removed the forecast legend and data source links below the forecast, which the About view now covers.
- FrontEnd: Switched the yellow accent buttons to white text, keeping the current yellow shades.

## v1.0.0 [released: 2026-10-28]
- FrontEnd: Colored the rain bars, amounts and wet forecast summary with the chosen accent color.
- FrontEnd: Hid the search row once a forecast is shown, with a footer search button to show it again.
- FrontEnd: Centered the start view title and description, which sat 24 pixels left of center.
- FrontEnd: Put each forecast summary sentence on its own line in a smaller font.
- FrontEnd: Named the current location by town, province and country from OpenStreetMap, keeping the coordinates when the lookup fails.
- FrontEnd: Showed the last saved forecast from the current hour on when starting offline, resuming offline, or when a refresh fails.
- FrontEnd: Labeled the current forecast hour "Now" in bold, saying "now" in the summary when rain is already falling.
- FrontEnd: Refreshed a forecast older than 15 minutes in the background when the app becomes visible again.
- FrontEnd: Spaced forecast time labels every two hours on phones, preserving all hourly bars and accessible descriptions.
- FrontEnd: Limited place searches and forecasts, including response bodies, to 10 seconds, showing the existing network error on timeout.
- FrontEnd: Added a theme-colored current-weather icon with day/night variants and localized accessible labels before the forecast summary.
- FrontEnd: Added maximum wind speed and gusts from 50 km/h to the forecast summary in English and Dutch.
- FrontEnd: Moved the location button beside the search field and the place and update lines below the forecast card.

## v0.1.0 [released: 2026-10-28]
- FrontEnd: Replaced the copied traffic-sign icon with a Meteo rain-cloud app icon and manifest name.
- FrontEnd: Added place search and current location with a 12-hour forecast of hourly rain bars and temperatures from Open-Meteo.
- FrontEnd: Started Meteo from the Verkeersregels Quiz shell with its start, About and Settings views in English and Dutch.
