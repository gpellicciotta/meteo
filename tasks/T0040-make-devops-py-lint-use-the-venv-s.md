---
id: T0040
owner: ~
needs: []
branch: —
worktree: —
status: ready
started_at: —
ended_at: —
review: agent
preview: none
protocol: standard
---
# T0040: Make devops.py lint use the venv's lint-markdown instead of a global copy from another support-python version

## Goals
Make `devops.py lint` and `format` run the `lint-markdown` of the interpreter running devops.py.
Today `resolve_executable("lint-markdown")` falls back to PATH, running a global copy from support-python 3.1.0.
That defeats the T0037 pin, since lint silently runs on another version.
Run the linter as `sys.executable -m support_python.tools.lint_markdown` instead of resolving a launcher.
See technical-spec.md for the findings and the test plan.

## Task Execution Steps
- [ ] **[Implement]** Author failing tests showing lint and format invoke the running interpreter's lint_markdown module.
- [ ] **[Verify]**    Run the new tests and record their failure output in validation-proof.md.
- [ ] **[Implement]** Run lint-markdown through sys.executable -m in devops.py and drop the launcher lookup.
- [ ] **[Verify]**    Run the devops tests, devops lint, and devops test through the venv.
- [ ] **[Doc]**       Update both changelogs.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-11-14] **[Doc]**
  Companion task file scaffolded at task creation.
