# Meteo Visual Style Guide
Meteo reuses a shared design system and keeps only a few local colors and overrides.

## Design System
- [icons.js](../../js/icons.js) references external symbols while preserving caller sizes, strokes, colors, and labels.
- Close, search, help, and settings use the unchanged bright sprite.
- [icons.svg](../../assets/icons.svg) retains weather and other glyphs absent from the pinned bright sprite.
- Both sprites are precached for offline use.
- Reproduce the migration with `node scripts/migrate-icons.mjs`, using the recorded original geometry fixture.
- Meteo uses [support.webapp](https://github.com/gpellicciotta/support.webapp) with its `bright` look.
- [design.json](../../design.json) pins the version; the release is vendored in [vendor/design](../../vendor/design).
- The look's own page is [bright.md](https://github.com/gpellicciotta/support.webapp/blob/main/docs/specs/looks/bright.md).
- [style.css](../../css/style.css) imports the public [index.css](../../vendor/design/looks/bright/index.css), then [tokens.css](../../css/tokens.css).
- [tokens.css](../../css/tokens.css) holds meteo's own colors and its overrides of contract tokens.
  It is the only app stylesheet with raw colors.
- Meteo has no gallery of its own yet; the shared gallery shows the look.
- The offline indicator uses the shared warning banner and offline sprite icon.
- Service worker updates use the shared persistent toast and polite live region; Update activates the worker and reloads.
- App-generated icons retain their dimensions through `app-icon`; `icon` belongs to shared sprite icons.

## Accents
- Users pick a blue, yellow, or red accent in Settings or with `?theme-color=`.
- The app sets the accent as `data-accent` on the root element, next to `data-theme`.
- `data-accent` is the look's variant attribute, as [ADR-0002](https://github.com/gpellicciotta/support.webapp/blob/main/docs/adrs/ADR-0002-looks.md) defines.
- The look's variant rules use a bare `[data-accent="{{value}}"]` selector.
- Meteo's overrides use `:root[data-accent="{{value}}"]`, which outranks them whatever the load order.
- Blue is the default, also when the root carries no `data-accent`.

## Palette overrides
Every contract token that [tokens.css](../../css/tokens.css) overrides, with the look's own value.
"Default" applies in both themes; "Dark" applies to every dark accent.
Tokens missing here keep the look's value, such as `--color-link-hover` for blue.
The token test of support.webapp does not cover these overrides; the ratios below come from meteo's tests.

| Case         | Token                    | meteo     | bright    | Reason                                                |
| :----------- | :----------------------- | :-------- | :-------- | :---------------------------------------------------- |
| Default      | `--color-bg`             | `#f5f7fa` | `#f5f7fa` | Equal to bright; meteo's own rules read it too.       |
| Default      | `--color-text`           | `#1f2933` | `#0f172a` | Keeps meteo's text color, at 13.75 or more.           |
| Default      | `--color-text-muted`     | `#6b7280` | `#596270` | Keeps meteo's muted text, at 4.50 or more.            |
| Default      | `--radius-round`         | `50%`     | `50%`     | Equal to bright; meteo's own rules read it too.       |
| Light blue   | `--color-primary`        | `#1a56db` | `#1a56db` | Equal to bright.                                      |
| Light blue   | `--color-primary-hover`  | `#163f9e` | `#163f9e` | Equal to bright.                                      |
| Light blue   | `--color-primary-active` | `#163f9e` | `#163f9e` | Equal to bright; meteo repeats hover when pressed.    |
| Light blue   | `--color-on-primary`     | `#ffffff` | `#ffffff` | Equal to bright.                                      |
| Light blue   | `--color-link`           | `#1a56db` | `#163f9e` | Keeps meteo's accent links, at 5.76 or more.          |
| Light blue   | `--color-focus`          | `#1a56db` | `#1a56db` | Equal to bright.                                      |
| Light yellow | `--color-primary`        | `#b88000` | `#b88000` | Equal to bright, replacing meteo's `#ca8a04`.         |
| Light yellow | `--color-primary-hover`  | `#a16207` | `#b88000` | Keeps meteo's darker hover; bright's equals its fill. |
| Light yellow | `--color-primary-active` | `#a16207` | `#b88000` | Repeats hover, as meteo's pressed controls do.        |
| Light yellow | `--color-on-primary`     | `#ffffff` | `#111827` | Keeps white labels: a deliberate AA exception.        |
| Light yellow | `--color-link`           | `#a16207` | `#163f9e` | Yellow links; meteo's `#ca8a04` fails AA.             |
| Light yellow | `--color-link-hover`     | `#854d0e` | `#163f9e` | Darker yellow on hover, meteo's AA text color.        |
| Light yellow | `--color-focus`          | `#b88000` | `#1a56db` | Yellow ring at bright's fill, at 3.19 or more.        |
| Light red    | `--color-primary`        | `#dc2626` | `#dc2626` | Equal to bright.                                      |
| Light red    | `--color-primary-hover`  | `#b91c1c` | `#b91c1c` | Equal to bright.                                      |
| Light red    | `--color-primary-active` | `#b91c1c` | `#b91c1c` | Equal to bright.                                      |
| Light red    | `--color-on-primary`     | `#ffffff` | `#ffffff` | Equal to bright.                                      |
| Light red    | `--color-link`           | `#b91c1c` | `#163f9e` | Red links; meteo's `#dc2626` fails AA on `bg`.        |
| Light red    | `--color-link-hover`     | `#991b1b` | `#163f9e` | Darker red on hover, meteo's AA text color.           |
| Light red    | `--color-focus`          | `#dc2626` | `#1a56db` | Red ring, at 4.49 or more.                            |
| Dark         | `--color-bg`             | `#0f172a` | `#0f172a` | Equal to bright; meteo's own rules read it too.       |
| Dark         | `--color-text`           | `#f1f5f9` | `#f5f7fa` | Keeps meteo's text color, at 13.35 or more.           |
| Dark         | `--color-text-muted`     | `#94a3b8` | `#94a3b8` | Equal to bright.                                      |
| Dark blue    | `--color-primary`        | `#2563eb` | `#60a5fa` | Keeps meteo's fill; as an icon, an AA exception.      |
| Dark blue    | `--color-primary-hover`  | `#1d4ed8` | `#93c5fd` | Keeps meteo's hover, with white labels at 6.70.       |
| Dark blue    | `--color-primary-active` | `#1d4ed8` | `#bfdbfe` | Repeats hover, as meteo's pressed controls do.        |
| Dark blue    | `--color-on-primary`     | `#ffffff` | `#0f172a` | Keeps white labels, at 5.17 on the fill.              |
| Dark blue    | `--color-link`           | `#93c5fd` | `#93c5fd` | Equal to bright; meteo's `#2563eb` fails AA as text.  |
| Dark blue    | `--color-focus`          | `#60a5fa` | `#60a5fa` | Equal to bright.                                      |
| Dark yellow  | `--color-primary`        | `#d97706` | `#d97706` | Equal to bright.                                      |
| Dark yellow  | `--color-primary-hover`  | `#b45309` | `#d97706` | Keeps meteo's darker hover; bright's equals its fill. |
| Dark yellow  | `--color-primary-active` | `#b45309` | `#d97706` | Repeats hover, as meteo's pressed controls do.        |
| Dark yellow  | `--color-on-primary`     | `#ffffff` | `#111827` | Keeps white labels: a deliberate AA exception.        |
| Dark yellow  | `--color-link`           | `#d97706` | `#93c5fd` | Yellow links, at 4.59 or more.                        |
| Dark yellow  | `--color-link-hover`     | `#fde68a` | `#93c5fd` | Light yellow on hover; meteo's `#b45309` fails AA.    |
| Dark yellow  | `--color-focus`          | `#d97706` | `#60a5fa` | Yellow ring, at 4.59 or more.                         |
| Dark red     | `--color-primary`        | `#dc2626` | `#f87171` | Keeps meteo's fill; as an icon, at 3.02 or more.      |
| Dark red     | `--color-primary-hover`  | `#b91c1c` | `#fca5a5` | Keeps meteo's hover, with white labels at 6.47.       |
| Dark red     | `--color-primary-active` | `#b91c1c` | `#fecaca` | Repeats hover, as meteo's pressed controls do.        |
| Dark red     | `--color-on-primary`     | `#ffffff` | `#0f172a` | Keeps white labels, at 4.83 on the fill.              |
| Dark red     | `--color-link`           | `#fca5a5` | `#93c5fd` | Light red links; meteo's `#dc2626` fails AA as text.  |
| Dark red     | `--color-link-hover`     | `#fca5a5` | `#93c5fd` | Equal to the link; meteo's `#b91c1c` fails AA.        |
| Dark red     | `--color-focus`          | `#dc2626` | `#60a5fa` | Red ring, at 3.02 or more.                            |

## AA exceptions
Every contrast pair in meteo's palette that misses WCAG 2.2 AA.
Each row names the worst shared ground: `bg`, `surface`, or `surface-sunken`.
Ratios are truncated to two decimals, so none reads higher than it is.
ADR-0002 rounds instead, giving 3.43 and 3.19 for the yellow labels.

| Case         | Foreground           | Background        | Ratio | Minimum | Reason                                                          |
| :----------- | :------------------- | :---------------- | :---- | :------ | :-------------------------------------------------------------- |
| Light yellow | `--color-on-primary` | `--color-primary` | 3.42  | 4.5     | Deliberate: white labels on yellow, as ADR-0002 allows.         |
| Dark yellow  | `--color-on-primary` | `--color-primary` | 3.18  | 4.5     | Deliberate: white labels on yellow, as in light.                |
| Dark blue    | `--color-primary`    | `--color-surface` | 2.83  | 3       | Fill as an icon; awaits the user's call on bright's fill.       |
| Light yellow | `--color-primary`    | `--color-bg`      | 3.19  | 4.5     | Accent headings; the component switch moves them to an AA role. |
| Light red    | `--color-primary`    | `--color-bg`      | 4.49  | 4.5     | Accent headings; the component switch moves them to an AA role. |
| Dark blue    | `--color-primary`    | `--color-surface` | 2.83  | 4.5     | Accent headings; the component switch moves them to an AA role. |
| Dark red     | `--color-primary`    | `--color-surface` | 3.02  | 4.5     | Accent headings; the component switch moves them to an AA role. |

The yellow hover and pressed fills keep white labels at AA: 4.92 in light and 5.02 in dark.

## Component gaps
Meteo's own controls draw their focus states until the shared components replace them.
These ratios were measured with the WCAG 2.2 formula on 2026-11-13:
- Inputs and selects add a 3 px glow in `--color-primary-focus`, at 1.22 to 1.51 against `surface`.
- Close buttons add a ring in `--color-primary-border`, at 1.23 to 2.15.
- Their `outline: none` hides the look's 2 px `--color-focus` ring.
- Where the accent passes 3:1, the input border in `--color-primary` carries the indicator.

## Decisions
- Meteo keeps its accents and colors where they pass AA, else the look's value or meteo's AA text color.
- White labels on yellow stay by choice, as ADR-0002 allows meteo through an app override.
- Dark blue keeps meteo's `#2563eb` fill with white labels, so the switch to `data-accent` changes nothing visible.
  The look's alternative is a `#60a5fa` fill with `#0f172a` labels; adopting it is the user's call.
- Headings keep `--color-primary` until the component switch moves them to an AA text role.
- The `?theme-color=` parameter and the stored `themeColor` preference keep their names, so links and settings survive.
