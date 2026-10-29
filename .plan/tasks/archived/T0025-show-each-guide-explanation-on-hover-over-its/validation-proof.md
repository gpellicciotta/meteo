# T0025 Validation Proof

## Walkthrough & Validation

### Test-driven development
Before the change, `node tests/forecast-browser.mjs` exited 1:

```text
Check failed: hovering section 1 explains Summary in a tooltip inside the sample ()
```

### Unit tests
`npm test`, exit code 0; no new unit tests apply, as hovering depends on pointer events and layout:

```text
 Test Files  3 passed (3)
      Tests  105 passed (105)
```

### Browser integration
`npm run test:browser`, exit code 0, 338 checks passed, none failed:

```text
ok - hovering section 1 explains Summary in a tooltip inside the sample (1. Summary When rain starts and its heav)
ok - hovering section 1 highlights its list item
ok - hovering section 2 explains Rain amount in a tooltip inside the sample (2. Rain amount Rain or snow expected in )
ok - hovering section 2 highlights its list item
ok - hovering section 7 explains Temperature in a tooltip inside the sample (7. Temperature Air temperature at the st)
ok - hovering section 7 highlights its list item
ok - hovering a temperature highlights all twelve temperatures (12)
ok - hovering section 8 explains Wind in a tooltip inside the sample (8. Wind Wind speed 10 m above the ground)
ok - hovering section 8 highlights its list item
ok - hovering section 9 explains Place in a tooltip inside the sample (9. Place The searched place, or your cur)
ok - hovering section 9 highlights its list item
ok - hovering section 10 explains Update time in a tooltip inside the sample (10. Update time When the forecast was fe)
ok - hovering section 10 highlights its list item
ok - hovering badge 6 shows the sky explanation
ok - the sky tooltip shows the nine weather icons
ok - leaving the sample hides the tooltip and highlights
ok - a touch phone shows no hover tooltip or highlight in the guide
[... remaining passing lines omitted ...]
```

### Visual verification
The local static server answered HTTP 200; the browser checks found no console, page or network errors.
Hover captures are desktop only, as phones show no tooltips.

| View          | Before                                   | After                                                |
| :------------ | :--------------------------------------- | :--------------------------------------------------- |
| Desktop light | [guide](before/guide-desktop-light.png)  | [temperature](after/guide-hover-temp-desktop-light.png), [sky](after/guide-hover-sky-desktop-light.png) |
| Desktop dark  | [guide](before/guide-desktop-dark.png)   | [temperature](after/guide-hover-temp-desktop-dark.png), [sky](after/guide-hover-sky-desktop-dark.png) |
