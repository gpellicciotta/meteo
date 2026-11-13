# T0030 Technical Specification
Drop the quiz leftovers: unused icons, classes, and tokens, before adopting the design system.

---

## Declared Files
Recorded after reading the app at 8937c32.

### Source
- css/style.css
- js/icons.js

### Test files
- tests/leftovers.test.js

### Docs
- CHANGELOG.md
- CHANGELOG.nl.md

Size estimate: 5 files, 292 lines

### Tests
- Unit: tests/leftovers.test.js fails while any removed icon, class, or token is still referenced.
- Unit: it also fails on any unused icon, stylesheet class, or custom property, with whole-name matching.
- Integration: the browser tests on Start, About, Settings, and Forecast at 390 and 1440 px, light and dark, unchanged before and after.

Completion check: `npm test` and `npm run test:browser`, exit code 0
