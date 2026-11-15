---
id: T0040
owner: "@codex"
needs: []
branch: —
worktree: —
status: active
started_at: "2026-11-15T08:11:47Z"
ended_at: —
review: agent
preview: none
protocol: standard
review_status: pending
review_round: 1
review_requested_at: "2026-11-15T08:14:15Z"
---
# T0040: Make devops.py lint use the venv's lint-markdown instead of a global copy from another support-python version

## Goals
Make `devops.py lint` and `format` run the `lint-markdown` of the interpreter running devops.py.
Today `resolve_executable("lint-markdown")` falls back to PATH, running a global copy from support-python 3.1.0.
That defeats the T0037 pin, since lint silently runs on another version.
Run the linter as `sys.executable -m support_python.tools.lint_markdown` instead of resolving a launcher.
See technical-spec.md for the findings and the test plan.

## Task Execution Steps
- [x] **[Implement]** Author failing tests showing lint and format invoke the running interpreter's lint_markdown module.
- [x] **[Verify]**    Run the new tests and record their failure output in validation-proof.md.
- [x] **[Implement]** Run lint-markdown through sys.executable -m in devops.py and drop the launcher lookup.
- [x] **[Verify]**    Run the devops tests, devops lint, and devops test through the venv.
- [x] **[Doc]**       Update both changelogs.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-11-14] **[Doc]**
  Companion task file scaffolded at task creation.

- [2026-11-15] **[Implement]**
  Lint and format now invoke the running interpreter module. Three regressions failed first; all 22 adapter tests pass. Real lint passed all six documents. Running python scripts/devops.py test in execution session 70349.

- [2026-11-15] **[Verify]**
  All six documents passed lint. Full test passed: 48 Python tests and 428 JavaScript executions, including retained T0034 tests. Restored missing happy-dom dependencies with npm ci. Outcomes: 3 counted files, 34 changed lines, zero reopenings.

- [2026-11-15] **[Verify]**
  Corrected counted outcome from git diff --numstat: 3 files and 30 changed lines, excluding CHANGELOG.md. Zero reopenings.

- [2026-11-15] **[Review]**
  Round 1 requested (mode: agent).

- [2026-11-15] **[Review]**
  Launched plan agents review T0040 --sandbox --agent codex. Reviewer PID 24832, execution session 80314; reviewed head e362792.

