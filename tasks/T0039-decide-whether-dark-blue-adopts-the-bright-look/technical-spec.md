# T0039 technical specification

## Technical Specifications
The user approved implementation if verification removes the dark-blue AA exception.
Use bright's dark blue: primary #60a5fa, hover #93c5fd, active #bfdbfe, and labels #0f172a.
Align the app's legacy hover token with the new hover fill.
Keep yellow, red, light blue, and the existing dark surfaces unchanged.
Remove dark-blue exceptions only after the measured ratios pass their applicable thresholds.

### Declared Files
- css/tokens.css
- tests/accent.test.js
- docs/specs/visual-style-guide.md
- CHANGELOG.nl.md

Added files: tests/dark-blue-browser.mjs.
Generated file: sw.js.
Mechanical command: python scripts/generate-sw.py
Mechanical files: sw.js

### Tests
- Unit: dark-blue primary states match bright and labels pass 4.5:1 on each fill.
- Unit: primary text passes 4.5:1 and icons pass 3:1 on all three shared grounds.
- Unit: the style guide lists current overrides and no dark-blue AA exceptions.
- Integration: inspect computed control colors, contrast, scrolling, and browser errors in light/dark at 390px and 1440px.
- Integration: capture Start, Settings, and About before and after the token change.

Completion check: python scripts/devops.py check; node tests/dark-blue-browser.mjs
Size estimate: 4 files, 100 lines
