# T0027 Validation Proof

## Walkthrough & Validation

### Test-driven development
Before the CSS change, `node tests/forecast-browser.mjs` exited 1:

```text
Check failed: light yellow buttons use white text (rgb(15, 23, 42), rgb(15, 23, 42))
```

### Unit tests
`npm test`, exit code 0; no unit test applies to CSS custom property values:

```text
 Test Files  3 passed (3)
      Tests  105 passed (105)
```

### Browser integration
`npm run test:browser`, exit code 0, 352 checks passed, none failed:

```text
ok - the other hours keep their clock times in regular weight
ok - light blue buttons use white text (rgb(255, 255, 255), rgb(255, 255, 255))
ok - light yellow buttons use white text (rgb(255, 255, 255), rgb(255, 255, 255))
ok - light yellow buttons keep the #ca8a04 fill (rgb(202, 138, 4))
ok - light red buttons use white text (rgb(255, 255, 255), rgb(255, 255, 255))
ok - dark blue buttons use white text (rgb(255, 255, 255), rgb(255, 255, 255))
ok - dark yellow buttons use white text (rgb(255, 255, 255), rgb(255, 255, 255))
ok - dark yellow buttons keep the #d97706 fill (rgb(217, 119, 6))
ok - dark red buttons use white text (rgb(255, 255, 255), rgb(255, 255, 255))
[... remaining passing lines omitted ...]
```

### Visual verification
The local static server answered HTTP 200; the browser checks found no console, page or network errors.

| View          | Before                                              | After                                              |
| :------------ | :-------------------------------------------------- | :------------------------------------------------- |
| Phone light   | [yellow](before/accent-yellow-mobile-light.png)     | [yellow](after/accent-yellow-mobile-light.png)     |
| Phone dark    | [yellow](before/accent-yellow-mobile-dark.png)      | [yellow](after/accent-yellow-mobile-dark.png)      |
| Desktop light | [yellow](before/accent-yellow-desktop-light.png)    | [yellow](after/accent-yellow-desktop-light.png)    |
| Desktop dark  | [yellow](before/accent-yellow-desktop-dark.png)     | [yellow](after/accent-yellow-desktop-dark.png)     |
