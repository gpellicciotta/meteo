# T0007 Technical Specification

## Technical Specifications
Keep the forecast chart readable at 320px without horizontal scrolling.
**[Decided]** Show alternating time labels below 480px using CSS visibility, preserving row alignment and all hourly descriptions.
Keep all twelve bars, temperatures, rain values, and accessible full times.
Restore twelve visible labels at wider viewports without requiring a forecast refresh.
Completion check: `npm test` and `npm run test:browser`.
Size estimate: 5 files, 180 lines

### Declared Files
- [style.css](../../../css/style.css)
- [forecast-browser.mjs](../../../tests/forecast-browser.mjs)
- [README.md](../../../README.md)
- [CHANGELOG.md](../../../CHANGELOG.md)
- [sw.js](../../../sw.js), generated using `python scripts/generate-sw.py generate`.

### Tests
- Unit: Existing forecast parsing tests must preserve twelve hourly labels and their associated measurements.
- Integration: Measure visible time text rectangles at 320px, 390px, 479px, 480px, and 1280px.
- Require positive gaps, viewport containment, aligned temperature rows, and twelve intact accessible descriptions.
- Exercise English and Dutch, light and dark modes, and resizing from narrow to wide.
- Capture original and fixed screenshots; reject unexpected console, page, and network errors.
