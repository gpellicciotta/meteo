# T0014 Technical Specifications

## Lookup
- **[Decided]** Use the OpenStreetMap Nominatim reverse API; Open-Meteo returns 404 on `/v1/reverse`.
- **[Decided]** `buildReverseUrl(latitude, longitude, lang)` in `js/weather-api.js` builds:
  `https://nominatim.openstreetmap.org/reverse?lat={{lat}}&lon={{lon}}&format=jsonv2&zoom=10&accept-language={{lang}}`.
- **[Decided]** Round `lat` and `lon` to 3 decimals in that URL, about 100 m, enough for a town.
- **[Decided]** `reversePlace(latitude, longitude, lang, fetchImpl = fetch)` uses `getJson`.
  It returns `{ name, admin1, country }`, or `null` when no name is found.
- Name fallback order: `address.city`, `town`, `village`, `municipality`, `hamlet`, then top-level `name`.
- Province fallback order: `address.province`, `state`, `county`.
- Field names vary by country. Belgium puts the province in `state`.
- Sample answer for 51.1655, 4.1437, checked on 2026-10-28:
  ```json
  { "name": "Sint-Niklaas",
    "address": { "town": "Sint-Niklaas", "municipality": "Sint-Niklaas", "county": "Sint-Niklaas",
                 "state": "Oost-Vlaanderen", "postcode": "9100", "country": "België", "country_code": "be" } }
  ```
- Usage policy: one request per location action or language switch, never per keystroke.
  The browser sends the Referer that identifies the app. The stored `lastPlace` acts as the cache.
- A T0010 timeout in `getJson` applies here too; no dependency either way.

## View
- **[Decided]** The coordinates place keeps `kind: "coords"` and gains an optional `label` from `formatPlace`.
- **[Decided]** The heading becomes `forecast.current_location_named` when `label` is set:
  - en: `"{place} (current location)"`
  - nl: `"{place} (huidige locatie)"`
- Without `label`, the heading keeps `forecast.current_location` with the rounded coordinates.
- `showCurrentLocation` starts the forecast and the lookup together; the forecast never waits for the name.
- A lookup answer is applied only while the same request and place are shown (`requestId` check).
- A lookup failure is silent and keeps the coordinates; no error message.
- On success, store the place with its `label` in `lastPlace` and re-render.
- `localizePlace` also repeats the lookup for a coordinates place on a language switch.

## Attribution and Privacy
- **[Decided]** When the heading shows a looked-up name, add `· {{link}}` after the Open-Meteo link in `.forecast-updated`.
  - Link to `https://www.openstreetmap.org/copyright`, string `forecast.attribution_osm`.
  - en: `"Place name © OpenStreetMap"`, nl: `"Plaatsnaam © OpenStreetMap"`.
  - Hidden while the coordinates or a searched place are shown.
- Update `about.icon_location_desc` (en and nl): coordinates go to Open-Meteo and OpenStreetMap.
- Add an About data source entry `about.source_reverse_title` / `about.source_reverse_description`:
  - Title: "OpenStreetMap Nominatim".
  - en: "Name of the current location from OpenStreetMap data (ODbL)."
  - Link: `https://nominatim.org/release-docs/latest/api/Reverse/`.
- README.md lists Nominatim with the other data sources.
- The service worker already ignores cross-origin requests; no change beyond regeneration.

### Declared Files
- `js/weather-api.js`
- `js/forecast-view.js`
- `index.html`
- `data/strings.en.json`
- `data/strings.nl.json`
- `tests/forecast.test.js`
- `tests/forecast-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`
- `README.md`
- `js/dom.js` (added during execution: attribution element handle)
- `css/style.css` (added during execution: keeps the attribution link on one line)

Mechanical command: python scripts/generate-sw.py generate

### Tests
- Unit: `buildReverseUrl` gives the documented URL with 3-decimal coordinates and the language.
- Unit: `reversePlace` maps the Sint-Niklaas sample to `{ name: "Sint-Niklaas", admin1: "Oost-Vlaanderen", country: "België" }`.
- Unit: `reversePlace` falls back to `city`, then `village`, and to `province` before `state`.
- Unit: `reversePlace` returns `null` for `{ "error": "Unable to geocode" }`.
- Unit: `reversePlace` rejects with code `network` or `http` like `searchPlaces`.
- Integration (`tests/forecast-browser.mjs`, Scenario 2): mock `https://nominatim.openstreetmap.org/**`.
  - The mock answers with a fixture in the shape of the Sint-Niklaas sample.
  - The heading shows the fixture town, province and country, then "(current location)".
  - The OpenStreetMap attribution link is visible.
  - Switching to Dutch shows "(huidige locatie)" and requests `accept-language=nl`.
- Integration: a failing Nominatim mock keeps the coordinates heading, shows no error, and hides the OSM link.
- Integration: a searched place hides the OSM link.

Completion check: npm test && npm run test:browser

Size estimate: 10 files, 220 lines

Size note: 10 counted files exceed the typical 8. Most are one- or two-line string and doc edits. Splitting would ship the lookup without its attribution or privacy note.
