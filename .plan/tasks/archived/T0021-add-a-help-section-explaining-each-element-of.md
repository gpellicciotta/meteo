---
id: T0021
owner: "@claude-code"
needs: []
branch: —
worktree: —
status: completed
started_at: "2026-10-29T07:31:18Z"
ended_at: "2026-10-29T07:44:45Z"
review: none
preview: none
protocol: adhoc
---
# T0021: Add a help section explaining each element of a full sample forecast card, and drop the card legend

## Goals
Explain every part of the forecast card in one place instead of a legend on the card.
Add a guide to the About view showing a sample card with every option on.
Number each element on the sample and explain it in a matching list.
Then remove the legend below the main forecast chart.
Specifications: [technical-spec.md](T0021-add-a-help-section-explaining-each-element-of/technical-spec.md).

## Task Execution Steps
- [x] **[Implement]** Add the guide sample unit test and the guide browser scenario; drop legend checks from Scenario 14.
- [x] **[Verify]**    Run the tests, keep before screenshots, and confirm the new checks fail.
- [x] **[Implement]** Export the summary and chart renderers, add the guide sample, guide module, markup and styles.
- [x] **[Implement]** Remove the card legend, its strings, element reference and styles.
- [x] **[Verify]**    Run unit tests and both browser scripts until they pass.
- [x] **[Visual]**    Capture after screenshots in light and dark on desktop and phone.
- [x] **[Doc]**       Update both changelogs and the README How It Works list.

## Execution Log
- [2026-10-29] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-10-29] **[Implement]**
  Added guideHours unit tests and Scenario 16; Scenario 14 now checks that the card has no legend.

- [2026-10-29] **[Verify]**
  The unit suite failed on the missing guide sample; Scenarios 14 and 16 failed in the browser.

- [2026-10-29] **[Implement]**
  Exported renderSummary and renderChart; added guide-sample.js, guide.js, the guide card, badges, strings and styles.

- [2026-10-29] **[Implement]**
  Removed the card legend, its strings, element reference and styles; scoped the hourly-row media query to the main chart.

- [2026-10-29] **[Decided]**
  Scenario 16 trims the summary text, since the icon SVG adds whitespace; phone samples use smaller temperatures.

- [2026-10-29] **[Verify]**
  Unit tests and both browser scripts passed; evidence in validation-proof.md.

- [2026-10-29] **[Doc]**
  Added the change to both changelogs and the README How It Works list.

- [2026-10-29] **[Verify]**
  Size note: 522 changed lines cross the typical line; the ten bilingual explanations account for most of the excess.

- [2026-10-29] **[Verify]**
  Recorded the task outcomes.
  - Files touched: 14.
  - Lines touched: 522.
  - Reopenings: 0.

- [2026-10-29] **[Complete]**
  Task completed successfully.

