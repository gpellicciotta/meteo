# T0026 Validation Proof

## Walkthrough & Validation

### Test-driven development
Before the change, `node tests/shell-browser.mjs` exited 1:

```text
Check failed: F1 opens the About view from the start view
```

### Unit tests
`npm test`, exit code 0; no new unit tests apply, as the change wires a key to the existing view switch:

```text
 Test Files  3 passed (3)
      Tests  105 passed (105)
```

### Browser integration
`npm run test:browser`, exit code 0, 344 checks passed, none failed:

```text
ok - F1 opens the About view from the start view
ok - F1 prevents the browser's own help
ok - F1 in the About view keeps it open and scrolls back to the guide
ok - F1 in Settings opens the About view
ok - F1 in Settings reverts the unsaved theme preview
ok - Escape returns to the start view after F1
[... remaining passing lines omitted ...]
```

### Visual verification
The local static server answered HTTP 200; the browser checks found no console, page or network errors.

| View          | Before                                   | After                                         |
| :------------ | :--------------------------------------- | :-------------------------------------------- |
| Desktop light | [About](before/about-desktop-light.png)  | [About after F1](after/about-f1-desktop-light.png) |
| Desktop dark  | [About](before/about-desktop-dark.png)   | [About after F1](after/about-f1-desktop-dark.png)  |
