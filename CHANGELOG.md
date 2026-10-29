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

## v1.1.0-pre
- FrontEnd: Opened the About view with its forecast guide when F1 is pressed.
- FrontEnd: Showed each guide explanation in a tooltip when hovering its sample section with a mouse.
- FrontEnd: Listed all nine weather icons with their meaning under the sky item of the About guide.
- FrontEnd: Added hourly wind direction arrows above the wind speeds, with spoken compass directions.
- FrontEnd: Added °F, inch, mph and m/s unit settings, prefilled from the current location's country, else metric.
- FrontEnd: Replaced the forecast legend with an About guide numbering each element of a full sample forecast.
- FrontEnd: Added an off-by-default sky setting showing the summary condition icon and, on tall screens, hourly condition icons.
- FrontEnd: Added an off-by-default wind setting showing the wind summary and, on tall screens, hourly wind speeds.
- FrontEnd: Removed the data source links below the forecast, as the About view already credits them.

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
