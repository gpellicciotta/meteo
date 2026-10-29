# T0024 Validation Proof

## Walkthrough & Validation

### Test-driven development
Before the change, `node tests/forecast-browser.mjs` exited 1:

```text
Check failed: the sky item explains all nine weather icons at 390x844 (0 listed)
```

### Unit tests
`npm test`, exit code 0; no new unit tests apply, as the change adds static markup and strings:

```text
 Test Files  3 passed (3)
      Tests  105 passed (105)
```

### Browser integration
`npm run test:browser`, exit code 0, 310 checks passed, none failed:

```text
ok - the sky item explains all nine weather icons at 390x844 (9 listed)
ok - the sky item explains all nine weather icons at 320x568 (9 listed)
ok - the sky item explains all nine weather icons at 1280x800 (9 listed)
ok - the sky item explains all nine weather icons at 390x600 (9 listed)
ok - the weather icon names follow the Dutch language switch
[... remaining passing lines omitted ...]
```

### Visual verification
The local static server answered HTTP 200; the captures found no console, page or network errors.

| View          | Before                                        | After                                        |
| :------------ | :-------------------------------------------- | :------------------------------------------- |
| Phone light   | [sky item](before/guide-sky-mobile-light.png)  | [sky item](after/guide-sky-mobile-light.png)  |
| Phone dark    | [sky item](before/guide-sky-mobile-dark.png)   | [sky item](after/guide-sky-mobile-dark.png)   |
| Desktop light | [sky item](before/guide-sky-desktop-light.png) | [sky item](after/guide-sky-desktop-light.png) |
| Desktop dark  | [sky item](before/guide-sky-desktop-dark.png)  | [sky item](after/guide-sky-desktop-dark.png)  |
