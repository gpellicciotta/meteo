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

## v0.1.1-pre
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
