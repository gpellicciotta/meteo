# T0032 Technical Specification
Vendor the support.webapp design system with the bright look and move the three screens into its shell.

---

## Declared Files
Files are listed when the task starts, after reading the app at a recorded commit.

Size note: No estimate yet; the task counts as above the large line until refined.

### Tests
- Unit: tests of the screen toggle code after the screens move into the shell.
- Integration: the app's browser tests on its main pages at 390 and 1440 px, light and dark, before and after the switch

Completion check: the app's full check and `node ./vendor/design/bin/check.mjs`, both exit code 0
