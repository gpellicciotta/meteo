# T0024 Technical Specifications

### Icon list
- Guide item 6 gets a `.guide-icons` list below its text, with one entry per icon of `weatherCondition()`.
- Each entry shows the icon through a `data-icon` placeholder, a name and a meaning.
- The meanings follow the WMO codes that `weatherCondition()` maps to each icon.

| Icon                   | English name, meaning                                    | Dutch name, meaning                                   | WMO codes          |
| :--------------------- | :------------------------------------------------------- | :---------------------------------------------------- | :----------------- |
| `weather-clear-day`    | Clear: clear or mainly clear sky by day.                  | Helder: heldere of vrijwel heldere hemel overdag.     | 0, 1 by day        |
| `weather-clear-night`  | Clear night: clear or mainly clear sky after dark.        | Heldere nacht: heldere of vrijwel heldere hemel na zonsondergang. | 0, 1 at night |
| `weather-partly-day`   | Partly cloudy: sun and clouds by day.                     | Half bewolkt: zon en wolken overdag.                  | 2 by day           |
| `weather-partly-night` | Partly cloudy night: some clouds after dark.              | Half bewolkte nacht: enkele wolken na zonsondergang.  | 2 at night         |
| `weather-cloudy`       | Cloudy: overcast sky.                                     | Bewolkt: volledig bewolkte hemel.                     | 3                  |
| `weather-fog`          | Fog: fog or rime fog.                                     | Mist: mist of rijpmist.                               | 45, 48             |
| `weather-rain`         | Rain: drizzle, rain or showers, also freezing.            | Regen: motregen, regen of buien, ook ijzel.           | 51–67, 80–82       |
| `weather-snow`         | Snow: snowfall, snow grains or snow showers.              | Sneeuw: sneeuwval, motsneeuw of sneeuwbuien.          | 71–77, 85, 86      |
| `weather-thunder`      | Thunderstorm: thunderstorm, possibly with hail.           | Onweer: onweer, mogelijk met hagel.                   | 95, 96, 99         |

- **[Decided]** The sky item text shortens to "Sky condition of each hour, with these icons.
  Needs the sky setting and a tall enough screen.", as the list now names the conditions.
  Dutch: "Weerbeeld van elk uur, met deze iconen. Vraagt de weerbeeldinstelling en een hoog genoeg scherm.".
- Entries use a responsive grid: one column on phones, more where they fit.

### Declared Files
- `index.html`
- `css/style.css`
- `data/strings.en.json`
- `data/strings.nl.json`
- `tests/forecast-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`
- `README.md`

Mechanical command: python scripts/generate-sw.py generate

### Tests
- Unit: none; the change adds static markup and strings without script logic.
  The existing `tests/shell.test.js` checks that both dictionaries hold every `data-i18n` key.
- Integration: `tests/forecast-browser.mjs` Scenario 16:
  - guide item 6 lists nine entries with the nine weather icons as rendered SVGs, in table order;
  - every entry has a non-empty name and meaning, and the icons stay inside the viewport at every size;
  - after the Dutch switch the first entry reads "Helder".

Completion check: npm test && npm run test:browser

Size estimate: 8 files, 130 lines
