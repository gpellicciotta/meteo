# Icon sprite migration

## Scope
### Declared Files
Mechanical: js/icons.js, assets/icons.svg; command: node scripts/migrate-icons.mjs.
Other files: scripts/migrate-icons.mjs, scripts/generate-sw.py, sw.js, tests/icons.test.js, tests/fixtures/icon-geometry.json, tests/leftovers.test.js, tests/switch-proof.mjs.
Documentation: docs/specs/visual-style-guide.md and CHANGELOG.md.
Size estimate: 3 counted files, 70 changed lines; generated and mechanical files excluded.

### Tests
- Unit: All icons resolve to identical geometry, preserve options, and reject unknown names.
- Integration: Both sprites remain precached; browser proof covers main pages, themes, and responsive widths.
Completion check: npm test; npm run test:browser; node tests/switch-proof.mjs --compare before/styles.json after/styles.json.

