# T0030 Technical Specification
Drop the quiz leftovers: unused icons, classes, and tokens, before adopting the design system.

---

## Declared Files
Files are listed when the task starts, after reading the app at a recorded commit.

Size note: No estimate yet; the task counts as above the large line until refined.

### Tests
- Unit: a test that fails while any removed class or token name is still referenced.
- Integration: the app's browser tests on its three screens at 390 and 1440 px, light and dark, unchanged before and after

Completion check: `npm test` and the browser tests, exit code 0

## Declared Files (recorded at 8937c32)
- css/style.css, js/icons.js, tests/leftovers.test.js, CHANGELOG.md, CHANGELOG.nl.md
- Size estimate: 5 files, about 300 lines, mostly deletions.
- Removed icons (16), classes (11), tokens (8): see tests/leftovers.test.js.
