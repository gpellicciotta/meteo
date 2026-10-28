# T0015 Validation Proof

## Walkthrough & Validation
The validator requires evidence in this companion file rather than an inline task section.

### Test-driven development
Before the CSS fix, `node tests/shell-browser.mjs` reported the new checks failing; its exit code was not captured:

```text
Check failed: #start-title is centered at 390px (off by 24.0px)
Check failed: #start-title is centered at 1280px (off by 24.0px)
```

### Unit tests
`npm test`, exit code 0:

```text
[... 8 lines omitted ...]
 Test Files  2 passed (2)
      Tests  56 passed (56)
   Start at  20:24:48
   Duration  1.03s (tests 70%, import 18%, transform 9%, worker 4%)
```

### Browser integration
`npm run test:browser`, exit code 0, 182 checks passed, none failed:

```text
ok - #start-title is centered at 390px (off by 0.0px)
ok - #start-desc is centered at 390px (off by 0.0px)
ok - the About title is centered at 390px (off by 0.0px)
ok - no console, page or network errors at 390px
ok - #start-title is centered at 1280px (off by 0.0px)
ok - #start-desc is centered at 1280px (off by 0.0px)
ok - the About title is centered at 1280px (off by 0.0px)
ok - no console, page or network errors at 1280px
[... 186 lines omitted ...]
```

### Visual verification
The local static server answered HTTP 200; the browser checks found no console, page or network errors.

| View  | Before                                             | After                                            |
| :---- | :------------------------------------------------- | :----------------------------------------------- |
| Start | [phone light](before/start-mobile-light.png)       | [phone light](after/start-mobile-light.png)      |
| Start | [phone dark](before/start-mobile-dark.png)         | [phone dark](after/start-mobile-dark.png)        |
| Start | [desktop light](before/start-desktop-light.png)    | [desktop light](after/start-desktop-light.png)   |
| Start | [desktop dark](before/start-desktop-dark.png)      | [desktop dark](after/start-desktop-dark.png)     |
| About | [phone light](before/about-mobile-light.png)       | [phone light](after/about-mobile-light.png)      |
| About | [desktop light](before/about-desktop-light.png)    | [desktop light](after/about-desktop-light.png)   |
