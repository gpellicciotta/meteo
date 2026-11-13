# T0030 Validation Proof

Base commit: 8937c32. Work commit: 0abcbd0.

## Failing tests before implementation
Command: `npx vitest run tests/leftovers.test.js`
```
 Test Files  1 failed (1)
      Tests  37 failed (37)
```

## After implementation
Command: `npm test`
```
 Test Files  4 passed (4)
      Tests  142 passed (142)
```
Command: `npm run test:browser` exit code 0 (all lines `ok`).

## Visual proof
Scratch run with the harness desktop width set to 1440x900 (reverted afterward), plus 390x844, light and dark.
104 screenshots before (base commit) and after, compared byte for byte.
Three differ: `hourly-en-320-dark`, `hourly-nl-320-dark`, `hourly-nl-320-light`.
Two runs of the same changed code also differ on those files, so they are render noise, not a change.
All other 101 are identical.

## Visual differences
None. Removed items had no references in index.html or js/.
Kept: `changelog-badge-*` classes, because the changelog renderer builds them from area names.
