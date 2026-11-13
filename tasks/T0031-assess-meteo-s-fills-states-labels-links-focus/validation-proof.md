## Walkthrough & Validation

Investigation only: no repository file changed.
The findings feed T0032 and T0033, which apply the overrides and record the exceptions.

### Inputs
- meteo `css/style.css` at `b766712` (task base).
  Its color tokens match `8937c32`, the commit the ADR measured; `git diff 8937c32 HEAD` removes only quiz tokens.
- support.webapp at `6cd1671`, with `src/looks/bright/`, `src/css/`, ADR-0002, and `bright.md` clean in `git status`.
- Token-test pairs: support.webapp `tests/unit/contract.js`, lines 5–16.
- Method: [contrast.py](contrast.py), WCAG 2.2 relative luminance; all ratios here are `[D]`.
- Bright sets `surface-hover`, `surface-selected`, and `surface-active` to `surface-sunken`.
  So `bg`, `surface`, and `sunken` cover all five token-test grounds.

### Where meteo uses each role
- Fills: `.btn-primary`, `.btn-start-arrow`, `.start-meta-btn-action`, `.guide-badge`, `.about-icon-badge`.
- Hover and keyboard focus share one rule, which sets `--color-primary-dark`; meteo has no `:active` rule.
  A pressed control therefore shows the `-dark` fill, so meteo's `active` equals its `hover`.
- Accent text: links `.about-source-link` and `.about-support-link` use `--color-primary`, and `--color-primary-dark` on hover.
  Headings `h1`, `h2`, `.start-title`, `.about-title`, `.config-title`, `.config-section-title`, and `.changelog-version-title` use `--color-primary` too.
- Focus: inputs, selects, and place choices change the border to `--color-primary` and add a 3 px `--color-primary-focus` glow.
  Buttons show their hover fill and set `outline: none`; close buttons add a `--color-primary-border` ring.
- The package draws a 2 px `--color-focus` outline on every `:focus-visible` in `reset.css`.
  meteo's `outline: none` rules outrank it, so meteo's own controls keep their indicators until T0034 replaces them.

### Findings
#### Grounds, text, and lines
| Role             | meteo light            | bright light | meteo dark                 | bright dark | Finding                                                     |
| :--------------- | :--------------------- | :----------- | :------------------------- | :---------- | :---------------------------------------------------------- |
| `bg`             | `#f5f7fa`              | `#f5f7fa`    | `#0f172a`                  | `#0f172a`   | Identical; no override.                                     |
| `surface`        | `#ffffff`              | `#ffffff`    | `#1e293b`                  | `#1e293b`   | Identical; no override.                                     |
| `surface-sunken` | `#f8fafc`              | `#f8fafc`    | `#141f33`                  | `#141f33`   | Identical; no override.                                     |
| `surface-hover`  | 5% black, `#f2f2f2`    | `#f8fafc`    | 10% white, `#343e4f`       | `#141f33`   | meteo's dark tint drops blue and red icons to 2.09 and 2.23. |
| `text`           | `#1f2933`              | `#0f172a`    | `#f1f5f9`                  | `#f5f7fa`   | Both pass at 13.35 or more; override keeps meteo.           |
| `text-muted`     | `#6b7280`              | `#596270`    | `#94a3b8`                  | `#94a3b8`   | meteo passes, at 4.5046 on light `bg`; override keeps meteo. |
| `border`         | `#e2e8f0`              | `#e2e8f0`    | `#334155`                  | `#334155`   | meteo's card border equals bright; no override.             |
| `border-strong`  | control `#cbd5e1`      | `#788595`    | control `#475569`          | `#788595`   | meteo fails 3:1, at 1.38–1.48 and 1.93–2.36; keep bright.    |

#### Action fills, states, and labels
| Accent and theme | meteo fill, hover, label         | bright fill, hover, active, label             | Finding                                                                 |
| :--------------- | :------------------------------- | :-------------------------------------------- | :---------------------------------------------------------------------- |
| Light blue       | `#1a56db`, `#163f9e`, white      | `#1a56db`, `#163f9e`, `#163f9e`, white        | Identical; all pass.                                                    |
| Light yellow     | `#ca8a04`, `#a16207`, white      | `#b88000`, `#b88000`, `#b88000`, `#111827`    | meteo label 2.94 and icon 2.74–2.94 fail; bright hover equals its fill. |
| Light red        | `#dc2626`, `#b91c1c`, white      | `#dc2626`, `#b91c1c`, `#b91c1c`, white        | Identical; all pass.                                                    |
| Dark blue        | `#2563eb`, `#1d4ed8`, white      | `#60a5fa`, `#93c5fd`, `#bfdbfe`, `#0f172a`    | meteo labels pass; its icon fails on `surface` at 2.83.                  |
| Dark yellow      | `#d97706`, `#b45309`, white      | `#d97706`, `#d97706`, `#d97706`, `#111827`    | meteo label 3.19 fails, hover 5.02 passes; bright hover equals its fill. |
| Dark red         | `#dc2626`, `#b91c1c`, white      | `#f87171`, `#fca5a5`, `#fecaca`, `#0f172a`    | meteo passes everywhere: labels 4.83 and 6.47, icon 3.03–3.70.          |

The fill-to-hover ratio is 1.00 for bright yellow in both themes, so hover gives no visible feedback; meteo's is 1.68 and 1.58.

#### Links
- bright uses blue `--color-link` in every accent, `#163f9e` light and `#93c5fd` dark, with `link-hover` equal to `link`.
- meteo's accent text fails 4.5:1 in four of six cases:
  - light yellow 2.74–2.94;
  - light red 4.4999 on `bg`, passing at 4.83 on `surface`;
  - dark blue 2.83–3.45;
  - dark red 3.03–3.70.
- meteo's hover text, `-dark`, fails on every dark ground, at 2.18–3.56.
- meteo's own `--color-primary-text` values pass everywhere, at 5.53–14.33, and keep each accent's hue.

#### Focus
- bright's blue ring passes 3:1 on every ground: `#1a56db` at 5.76–6.18 and `#60a5fa` at 5.75–7.02.
- meteo's 3 px glow measures 1.22–1.51 against `surface`; its close-button ring measures 1.23–2.15.
  Both are below 3:1; the input border itself, in `--color-primary`, carries the indicator where the accent passes.
- An accent-colored `--color-focus` passes when it equals an AA fill: light yellow needs `#b88000`, not `#ca8a04`.

### Lossless overrides and their AA exceptions
These values reproduce meteo's colors on every contract token.
Selectors on `:root[data-accent="{{value}}"]` outrank the look's bare attribute rule.

```css
:root {
  --color-text: light-dark(#1f2933, #f1f5f9);
  --color-text-muted: light-dark(#6b7280, #94a3b8);
}
:root[data-accent="blue"] {
  --color-primary: light-dark(#1a56db, #2563eb);
  --color-primary-hover: light-dark(#163f9e, #1d4ed8);
  --color-primary-active: light-dark(#163f9e, #1d4ed8);
  --color-on-primary: #ffffff;
  --color-link: light-dark(#1a56db, #2563eb);
  --color-link-hover: light-dark(#163f9e, #1d4ed8);
  --color-focus: light-dark(#1a56db, #2563eb);
}
:root[data-accent="yellow"] {
  --color-primary: light-dark(#ca8a04, #d97706);
  --color-primary-hover: light-dark(#a16207, #b45309);
  --color-primary-active: light-dark(#a16207, #b45309);
  --color-on-primary: #ffffff;
  --color-link: light-dark(#ca8a04, #d97706);
  --color-link-hover: light-dark(#a16207, #b45309);
  --color-focus: light-dark(#ca8a04, #d97706);
}
:root[data-accent="red"] {
  --color-primary: #dc2626;
  --color-primary-hover: #b91c1c;
  --color-primary-active: #b91c1c;
  --color-on-primary: #ffffff;
  --color-link: #dc2626;
  --color-link-hover: #b91c1c;
  --color-focus: #dc2626;
}
```

The lossless set breaks the token test in five of six accent and theme cases; see the run below:
- Light yellow: white label 2.94; primary, link, and focus on grounds 2.74–2.94.
- Light red: link on `bg` 4.4999.
- Dark blue: primary and focus on `surface` 2.83; link 2.83–3.45; link hover 2.18–2.66.
- Dark yellow: white label 3.19; link hover 2.91–3.56.
- Dark red: link 3.03–3.70; link hover 2.26–2.76.

### Recommended overrides
Rule: keep meteo's value where it passes AA, else the package value or meteo's own AA text color.
The only exception is the white yellow label that ADR-0002 allows.

```css
:root {
  --color-text: light-dark(#1f2933, #f1f5f9);
  --color-text-muted: light-dark(#6b7280, #94a3b8);
}
:root[data-accent="blue"] {
  --color-link: light-dark(#1a56db, #93c5fd);
}
:root[data-accent="yellow"] {
  --color-primary-hover: light-dark(#a16207, #b45309);
  --color-primary-active: light-dark(#a16207, #b45309);
  --color-on-primary: #ffffff;
  --color-link: light-dark(#a16207, #d97706);
  --color-link-hover: light-dark(#854d0e, #fde68a);
  --color-focus: light-dark(#b88000, #d97706);
}
:root[data-accent="red"] {
  --color-primary: #dc2626;
  --color-primary-hover: #b91c1c;
  --color-primary-active: #b91c1c;
  --color-on-primary: #ffffff;
  --color-link: light-dark(#b91c1c, #fca5a5);
  --color-link-hover: light-dark(#991b1b, #fca5a5);
  --color-focus: #dc2626;
}
```

Deliberate AA exceptions in the recommended set:
- White label on the light yellow fill `#b88000`, at 3.43.
- White label on the dark yellow fill `#d97706`, at 3.19.
- Both hover and active yellow fills pass with white labels, at 4.92 and 5.02.

Visual changes that the recommended set keeps, for the adoption proof:
- Light yellow default fill darkens from `#ca8a04` to `#b88000`.
- Light yellow links show `#a16207` instead of `#ca8a04`; light red links show `#b91c1c` instead of `#dc2626`.
- Dark blue fills become `#60a5fa`, `#93c5fd`, and `#bfdbfe`, with `#0f172a` labels instead of white.
- Dark blue and dark red links show `#93c5fd` and `#fca5a5`; dark yellow link hover shows `#fde68a`.
- Focus becomes a 2 px outline: blue for the blue accent, `#b88000` or `#d97706` for yellow, `#dc2626` for red.
- `surface-hover` and `border-strong` keep the package values.

### Follow-up decisions
- **[Decided]** Grounds and `border` need no override; meteo and bright match in both themes.
- **[Decided]** `border-strong` and `surface-hover` keep the package values, because meteo's values fail 3:1.
- **[Decided]** The recommended set is the default input for T0033; the lossless set stays documented as the alternative.
- **[Decided]** A light-dark() override needs a fallback in T0033, mirroring the package's `@supports not (color: light-dark(...))` block.
  Without it, browsers lacking `light-dark()` substitute an invalid value and lose the action colors.
- **[Feedback Needed]** Confirm in T0033 that dark blue may switch to the package's light fill with dark labels.
  Restoring `#2563eb` adds a non-ADR exception: icon 2.83 on `surface`.
- **[Feedback Needed]** Confirm in T0033 that headings in `--color-primary` move to an AA text role.
  They share the link failures listed above; T0034 owns the component change.

### Verification runs
Command, run from the task worktree: `python -I C:/Dev-Projects/meteo/.plan/tasks/T0031-assess-meteo-s-fills-states-labels-links-focus/contrast.py`

Exit code: 0. The output follows in five blocks, plus one block of selected lines.

```text
Grounds order: bg / surface / sunken.

== light blue ==
meteo  fill  #1a56db label #ffffff:  6.18 pass
meteo  hover #163f9e label #ffffff:  9.38 pass
bright fill  #1a56db label #ffffff:  6.18 pass
bright hover #163f9e label #ffffff:  9.38 pass
bright activ #163f9e label #ffffff:  9.38 pass
meteo  fill as icon/border  (3:1):  5.76 pass /  6.18 pass /  5.91 pass
bright fill as icon/border  (3:1):  5.76 pass /  6.18 pass /  5.91 pass
meteo  fill as text       (4.5:1):  5.76 pass /  6.18 pass /  5.91 pass
meteo  hover as text      (4.5:1):  8.74 pass /  9.38 pass /  8.96 pass
bright link #163f9e       (4.5:1):  8.74 pass /  9.38 pass /  8.96 pass
meteo  fill text on tint #eff6ff (4.5:1):  5.68 pass
meteo  hover text on tint       (4.5:1):  8.62 pass
meteo  primary-text on tint     (4.5:1):  5.45 pass
meteo  focus glow #d6e1f9 vs surface (3:1):  1.31 FAIL
meteo  close-button ring #bae6fd (3:1):  1.24 FAIL /  1.33 FAIL /  1.27 FAIL
bright focus #1a56db       (3:1):  5.76 pass /  6.18 pass /  5.91 pass

== light yellow ==
meteo  fill  #ca8a04 label #ffffff:  2.94 FAIL
meteo  hover #a16207 label #ffffff:  4.92 pass
bright fill  #b88000 label #111827:  5.17 pass
bright hover #b88000 label #111827:  5.17 pass
bright activ #b88000 label #111827:  5.17 pass
meteo  fill as icon/border  (3:1):  2.74 FAIL /  2.94 FAIL /  2.81 FAIL
bright fill as icon/border  (3:1):  3.19 pass /  3.43 pass /  3.28 pass
meteo  fill as text       (4.5:1):  2.74 FAIL /  2.94 FAIL /  2.81 FAIL
meteo  hover as text      (4.5:1):  4.59 pass /  4.92 pass /  4.71 pass
bright link #163f9e       (4.5:1):  8.74 pass /  9.38 pass /  8.96 pass
meteo  fill text on tint #fefce8 (4.5:1):  2.84 FAIL
meteo  hover text on tint       (4.5:1):  4.76 pass
meteo  primary-text on tint     (4.5:1):  6.62 pass
meteo  focus glow #f4e8cd vs surface (3:1):  1.22 FAIL
meteo  close-button ring #fde047 (3:1):  1.23 FAIL /  1.32 FAIL /  1.26 FAIL
bright focus #1a56db       (3:1):  5.76 pass /  6.18 pass /  5.91 pass
[... 73 lines omitted: light red, dark blue, dark yellow, dark red; same layout ...]
```

Selected lines from the omitted accent blocks, verbatim and in output order:

```text
== light red ==
meteo  fill as text       (4.5:1):  4.50 FAIL /  4.83 pass /  4.62 pass
meteo  fill text on tint #fef2f2 (4.5:1):  4.41 FAIL
meteo  focus glow #f8d4d4 vs surface (3:1):  1.37 FAIL
meteo  close-button ring #fca5a5 (3:1):  1.77 FAIL /  1.90 FAIL /  1.81 FAIL
== dark blue ==
meteo  fill  #2563eb label #ffffff:  5.17 pass
bright fill  #60a5fa label #0f172a:  7.02 pass
meteo  fill as icon/border  (3:1):  3.45 pass /  2.83 FAIL /  3.19 pass
meteo  fill as text       (4.5:1):  3.45 FAIL /  2.83 FAIL /  3.19 FAIL
meteo  hover as text      (4.5:1):  2.66 FAIL /  2.18 FAIL /  2.46 FAIL
meteo  focus glow #203a70 vs surface (3:1):  1.32 FAIL
meteo  close-button ring #1e40af (3:1):  2.05 FAIL /  1.68 FAIL /  1.89 FAIL
bright focus #60a5fa       (3:1):  7.02 pass /  5.75 pass /  6.49 pass
== dark yellow ==
meteo  fill  #d97706 label #ffffff:  3.19 FAIL
meteo  hover #b45309 label #ffffff:  5.02 pass
bright fill  #d97706 label #111827:  5.57 pass
meteo  fill as text       (4.5:1):  5.60 pass /  4.59 pass /  5.18 pass
meteo  hover as text      (4.5:1):  3.56 FAIL /  2.91 FAIL /  3.28 FAIL
meteo  focus glow #56402b vs surface (3:1):  1.51 FAIL
meteo  close-button ring #78350f (3:1):  1.97 FAIL /  1.61 FAIL /  1.82 FAIL
== dark red ==
meteo  fill  #dc2626 label #ffffff:  4.83 pass
meteo  hover #b91c1c label #ffffff:  6.47 pass
bright fill  #f87171 label #0f172a:  6.45 pass
meteo  fill as icon/border  (3:1):  3.70 pass /  3.03 pass /  3.41 pass
meteo  fill as text       (4.5:1):  3.70 FAIL /  3.03 FAIL /  3.41 FAIL
meteo  hover as text      (4.5:1):  2.76 FAIL /  2.26 FAIL /  2.55 FAIL
meteo  focus glow #572835 vs surface (3:1):  1.23 FAIL
meteo  close-button ring #991b1b (3:1):  2.15 FAIL /  1.76 FAIL /  1.98 FAIL
```

```text
== grounds and text, theme-wide ==
light meteo text #1f2933               (4.5:1): 13.75 pass / 14.76 pass / 14.10 pass
light bright text #0f172a              (4.5:1): 16.63 pass / 17.85 pass / 17.06 pass
light meteo muted #6b7280              (4.5:1):  4.50 pass /  4.83 pass /  4.62 pass
light bright muted #596270             (4.5:1):  5.75 pass /  6.17 pass /  5.89 pass
light meteo border #cbd5e1             (3:1):  1.38 FAIL /  1.48 FAIL /  1.42 FAIL
light bright border-strong #788595     (3:1):  3.50 pass /  3.76 pass /  3.59 pass
dark  meteo text #f1f5f9               (4.5:1): 16.30 pass / 13.35 pass / 15.05 pass
dark  bright text #f5f7fa              (4.5:1): 16.63 pass / 13.63 pass / 15.36 pass
dark  meteo/bright muted #94a3b8       (4.5:1):  6.96 pass /  5.71 pass /  6.43 pass
dark  meteo border #475569             (3:1):  2.36 FAIL /  1.93 FAIL /  2.18 FAIL
dark  bright border-strong #788595     (3:1):  4.75 pass /  3.89 pass /  4.39 pass
light meteo btn-tint-hover on surface = #f2f2f2; bright surface-hover = #f8fafc
dark  meteo btn-tint-hover on surface = #343e4f; bright surface-hover = #141f33
light primary on meteo hover ground #f2f2f2: blue 5.52, yellow 2.62, red 4.31
dark  primary on meteo hover ground #343e4f: blue 2.09, yellow 3.38, red 2.23
ADR check: white on #ca8a04 2.94, white on #d97706 3.19
ADR check: #111827 on #ca8a04 6.04, #111827 on #d97706 5.57
Override check: white on #b88000 3.43
```

```text
== lossless override set against the token-test pairs ==
light blue  : all pass
light yellow: link on bg 2.74; primary on bg 2.74; focus on bg 2.74; link on surface 2.94; primary on surface 2.94; focus on surface 2.94; link on sunken 2.81; primary on sunken 2.81; focus on sunken 2.81; on-primary on primary 2.94
light red   : link on bg 4.50
dark  blue  : link on bg 3.45; link_hover on bg 2.66; link on surface 2.83; link_hover on surface 2.18; primary on surface 2.83; focus on surface 2.83; link on sunken 3.19; link_hover on sunken 2.46
dark  yellow: link_hover on bg 3.56; link_hover on surface 2.91; link_hover on sunken 3.28; on-primary on primary 3.19
dark  red   : link on bg 3.70; link_hover on bg 2.76; link on surface 3.03; link_hover on surface 2.26; link on sunken 3.41; link_hover on sunken 2.55

== recommended override set against the token-test pairs ==
light blue  : all pass
light yellow: on-primary on primary 3.43
light red   : all pass
dark  blue  : all pass
dark  yellow: on-primary on primary 3.19
dark  red   : all pass

== AA link candidates (meteo --color-primary-text), 4.5:1 ==
light blue   #0369a1:  5.53 pass /  5.93 pass /  5.67 pass
light yellow #854d0e:  6.38 pass /  6.85 pass /  6.55 pass
light red    #991b1b:  7.74 pass /  8.31 pass /  7.94 pass
dark  blue   #93c5fd:  9.90 pass /  8.11 pass /  9.14 pass
dark  yellow #fde68a: 14.33 pass / 11.75 pass / 13.24 pass
dark  red    #fca5a5:  9.41 pass /  7.71 pass /  8.69 pass
```

```text
== yellow and dark alternatives ==
label #111827 on #ca8a04:  6.04 pass
label #ffffff on #a16207:  4.92 pass
label #111827 on #a16207:  3.60 FAIL
label #ffffff on #b45309:  5.02 pass
label #111827 on #b45309:  3.53 FAIL
label #ffffff on #2563eb:  5.17 pass
label #ffffff on #1d4ed8:  6.70 pass
#a16207 as icon on light grounds (3:1):  4.59 pass /  4.92 pass /  4.71 pass
#b88000 as icon on light grounds (3:1):  3.19 pass /  3.43 pass /  3.28 pass
#1d4ed8 as icon on dark grounds (3:1):  2.66 FAIL /  2.18 FAIL /  2.46 FAIL
#b45309 as icon on dark grounds (3:1):  3.56 pass /  2.91 FAIL /  3.28 pass
#b91c1c as icon on dark grounds (3:1):  2.76 FAIL /  2.26 FAIL /  2.55 FAIL

== hover distinguishability, fill vs hover fill ==
light blue  : meteo 1.52, bright 1.52
light yellow: meteo 1.68, bright 1.00
light red   : meteo 1.34, bright 1.34
dark  blue  : meteo 1.30, bright 1.41
dark  yellow: meteo 1.58, bright 1.00
dark  red   : meteo 1.34, bright 1.46
```

Borderline values to four decimals; [borderline.py](borderline.py) reuses `ratio` from the same script.
Command: `python -I C:/Dev-Projects/meteo/.plan/tasks/T0031-assess-meteo-s-fills-states-labels-links-focus/borderline.py`, exit code 0.

```text
#dc2626 on #f5f7fa: 4.4999
#6b7280 on #f5f7fa: 4.5046
```
