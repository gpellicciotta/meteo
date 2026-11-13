# T0033 Technical Specification
Rename data-theme-color to data-accent and document every palette override and AA exception.

---

## Declared Files
Files are listed when the task starts, after reading the app at a recorded commit.

Size note: No estimate yet; the task counts as above the large line until refined.

### Tests
- Unit: tests that each accent choice sets the matching data-accent value.
- Integration: the app's browser tests on its main pages at 390 and 1440 px, light and dark, before and after the switch

Completion check: the app's full check and `node ./vendor/design/bin/check.mjs`, both exit code 0
