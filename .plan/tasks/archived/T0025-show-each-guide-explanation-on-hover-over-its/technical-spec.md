# T0025 Technical Specifications

### Behavior
- Hover handling runs only while `(hover: hover) and (pointer: fine)` matches and the pointer is a mouse.
  Touch screens keep today's behavior: badges and the list only.
- A section is the element group a badge points at:
  summary, rain amounts, rain bars, chances, hours, sky icons, temperatures, wind cells, place and update line.
  Hovering any cell of a row counts, and so does hovering a badge.
- **[Decided]** While a section is hovered:
  - a `.guide-tip` tooltip shows "{number}. {title}" and the explanation text of its list item;
  - every element of that section, and its list item, get the `is-guide-active` class.
- The tooltip sits above the hovered element, or below it when there is no room above.
  It stays horizontally inside the sample and never catches the pointer.
- Leaving the sample, or hovering a gap between sections, hides the tooltip and highlights.
- The sample stays hidden from assistive technology; the tooltip repeats the list, which stays the accessible source.
- The tooltip uses the existing tooltip colors; highlights use the accent tint.

### Declared Files
- `js/guide.js`
- `js/dom.js`
- `css/style.css`
- `tests/forecast-browser.mjs`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`
- `README.md`

Mechanical command: python scripts/generate-sw.py generate

### Tests
- Unit: none; the behavior depends on pointer events and layout, covered in the browser.
- Integration: `tests/forecast-browser.mjs` new Scenario 18 on About at 1280x800 with a mouse:
  - hovering each of the ten sections shows a visible tooltip starting with its number and list title;
  - the tooltip holds the list item's explanation text and stays inside the sample;
  - hovering the third temperature marks all twelve temperatures and list item 7 active;
  - hovering badge 6 shows the sky explanation;
  - moving the mouse to the view header hides the tooltip and clears every highlight;
  - in a touch phone context at 390x844, hovering a temperature shows no tooltip;
  - no console, page or network errors occur.

Completion check: npm test && npm run test:browser

Size estimate: 7 files, 230 lines
