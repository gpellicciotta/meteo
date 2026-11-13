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
