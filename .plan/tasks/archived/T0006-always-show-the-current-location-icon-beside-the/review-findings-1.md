---
task: T0006
round: 1
verdict: rejected
reviewer: '@claude-2'
reviewed_at: 2026-10-28T12:43:21Z
---
Reviewer: independent Claude Code subagent (read-only), round 1.
Verdict: REJECT. `npm test` 24/24 and `npm run test:browser` passed.

Blocking:
1. While the tooltip shows, its `::after` text joins the button's accessible name from content.
   On focus or hover the name becomes "Use current location Use current location".
   Fix: name the button with `aria-label` and `data-i18n-aria`, as `#btn-config` does.
2. The accessible name test matches substrings, so it passes with the doubled name.
   It should match exactly while the button has keyboard focus.

Non-blocking nits:
1. Layout checks cover only English; Dutch strings are longer.
2. 320x568 still scrolls about 91px in English; tests assert nothing there.
