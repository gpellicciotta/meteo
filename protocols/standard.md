---
name: standard
description: Standard task protocol with isolated worktree, git branch, and companion task file.
worktree: auto
branch: auto
task_file: true
integration: squash
commit: auto
push: none
cleanup: auto
review: agent
preview: none
review_guidance: |
  Grade every finding as blocking or non-blocking, and reject only for blocking findings.
  - Blocking: an unmet goal or acceptance criterion, wrong behavior, a failing test, or false evidence.
  - Non-blocking: wording, formatting, evidence layout, and guideline deviations that change no deliverable.
  - Never reject for issues that `plan tasks validate --completion` and the linters already pass.
  - From round 2 on, verify only the previous Required Rework and defects the rework introduced.
  - Raise new findings on content unchanged since the previous round only when they are blocking.
  - List non-blocking findings under Process Gaps; they never make the verdict rejected.
  - When an acceptance criterion cannot be met as written, name the decision a human must make.
---

{{base-prompt}}
