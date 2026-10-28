---
task: T0001
round: 1
verdict: rejected
reviewer: '@claude-2'
reviewed_at: 2026-10-28T11:19:11Z
---
Reviewer: independent Claude Code subagent (read-only), round 1.
Verdict: REJECT.

1. Medium: js/i18n.js stores the language under the bare localStorage key "lang", shared with the quiz on the same GitHub Pages origin.
2. Low: js/app.js reloads the changelog on every languagechange, even while About is hidden.
3. Low: setLang() promises in js/config-view.js and js/app.js lack rejection handling.
4. Low: dark screenshots are captured while CSS transitions still run.
5. Low: browser test does not cover theme preview/revert or the Dutch changelog.
6. Copy: about strings still mention sources although the sources card was removed.
7. Style: js/params.js uses if statements without braces.
8. Minor: some quiz-only CSS remains (.tag-correct, .tag-wrong, .about-legal-hint, .config-checkbox-label, .config-input).
