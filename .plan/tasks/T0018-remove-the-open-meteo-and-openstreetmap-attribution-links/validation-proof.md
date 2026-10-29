# T0018 Validation Proof

## Walkthrough & Validation

### Test-driven development
Before the removal, `node tests/forecast-browser.mjs` exited 1 at both new checks:

```text
Check failed: the forecast shows no attribution links, which the About view lists
Check failed: a named current location shows no attribution links
```

### Unit tests
`npm test`, exit code 0:

```text
 Test Files  2 passed (2)
      Tests  62 passed (62)
```

### Browser integration
`npm run test:browser`, exit code 0, 213 checks passed, none failed:

```text
ok - the forecast shows no attribution links, which the About view lists
ok - the update time is still shown below the place name
ok - a named current location shows no attribution links
[... remaining passing lines omitted ...]
ok - no accent console, page or network errors
```

### Visual verification
The local static server answered HTTP 200; the browser checks found no console, page or network errors.

| View          | Before                                              | After                                              |
| :------------ | :-------------------------------------------------- | :------------------------------------------------- |
| Phone light   | [searched](before/search-row-hidden-mobile-light.png) | [searched](after/search-row-hidden-mobile-light.png) |
| Phone dark    | [searched](before/search-row-hidden-mobile-dark.png)  | [searched](after/search-row-hidden-mobile-dark.png)  |
| Desktop light | [searched](before/search-row-hidden-desktop-light.png) | [searched](after/search-row-hidden-desktop-light.png) |
| Desktop dark  | [searched](before/search-row-hidden-desktop-dark.png) | [searched](after/search-row-hidden-desktop-dark.png) |
| Current place | —                                                   | [phone light](after/current-location-en-mobile-light.png) |
