# T0017 Validation Proof

## Walkthrough & Validation
The validator requires evidence in this companion file rather than an inline task section.

### Test-driven development
Before the CSS change, `node tests/forecast-browser.mjs` exited 1 at the first non-blue accent:

```text
Check failed: light yellow rain bars use #ca8a04 (rgb(59, 130, 246))
```

### Unit tests
`npm test`, exit code 0:

```text
[... 8 lines omitted ...]
 Test Files  2 passed (2)
      Tests  62 passed (62)
   Start at  20:42:29
   Duration  755ms (tests 67%, import 15%, transform 9%, worker 8%)
```

### Browser integration
`npm run test:browser`, exit code 0, 214 checks passed, none failed:

```text
ok - red accent scenario receives HTTP 200
ok - yellow accent scenario receives HTTP 200
ok - light blue rain bars use #3b82f6 (rgb(59, 130, 246))
ok - light blue amounts and wet summary use #1d4ed8 (rgb(29, 78, 216), rgb(29, 78, 216))
ok - light yellow rain bars use #ca8a04 (rgb(202, 138, 4))
ok - light yellow amounts and wet summary use #854d0e (rgb(133, 77, 14), rgb(133, 77, 14))
ok - light red rain bars use #ef4444 (rgb(239, 68, 68))
ok - light red amounts and wet summary use #b91c1c (rgb(185, 28, 28), rgb(185, 28, 28))
ok - dark blue rain bars use #60a5fa (rgb(96, 165, 250))
ok - dark blue amounts and wet summary use #93c5fd (rgb(147, 197, 253), rgb(147, 197, 253))
ok - dark yellow rain bars use #fbbf24 (rgb(251, 191, 36))
ok - dark yellow amounts and wet summary use #fde68a (rgb(253, 230, 138), rgb(253, 230, 138))
ok - dark red rain bars use #f87171 (rgb(248, 113, 113))
ok - dark red amounts and wet summary use #fca5a5 (rgb(252, 165, 165), rgb(252, 165, 165))
ok - no accent console, page or network errors
[... remaining passing lines omitted ...]
```

### Visual verification
The local static server answered HTTP 200; the browser checks found no console, page or network errors.

| Accent | Before                                            | After                                            |
| :----- | :------------------------------------------------ | :----------------------------------------------- |
| Red    | [phone light](before/accent-red-mobile-light.png) | [phone light](after/accent-red-mobile-light.png) |
| Red    | [phone dark](before/accent-red-mobile-dark.png)   | [phone dark](after/accent-red-mobile-dark.png)   |
| Red    | [desktop](before/accent-red-desktop-light.png)    | [desktop](after/accent-red-desktop-light.png)    |
| Yellow | [phone light](before/accent-yellow-mobile-light.png) | [phone light](after/accent-yellow-mobile-light.png) |
| Yellow | [phone dark](before/accent-yellow-mobile-dark.png) | [phone dark](after/accent-yellow-mobile-dark.png) |
| Yellow | [desktop](before/accent-yellow-desktop-dark.png)  | [desktop](after/accent-yellow-desktop-dark.png)  |
