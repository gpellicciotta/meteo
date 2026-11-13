---
id: T0036
owner: "@claude"
needs: []
branch: task/T0036-adopt-devopscli-from-support-python-v3-2-0
worktree: .plan/work/T0036-adopt-devopscli-from-support-python-v3-2-0
status: active
started_at: "2026-11-13T17:59:06Z"
ended_at: —
review: agent
preview: none
protocol: standard
---
# T0036: Adopt DevopsCli from support-python v3.2.0 in scripts/devops.py via MeteoProject(NodeProject): override test, lint, build, release; keep serve, sw, deploy through add_action; see T0029 findings

## Goals
Adopt DevopsCli from support-python v3.2.0 in scripts/devops.py via MeteoProject(NodeProject): override test, lint, build, release; keep serve, sw, deploy through add_action; see T0029 findings.

Source: Execution Log and `validation-proof.md` of T0029.

### Dependency
- Pin `support-python` at `v3.2.0` in `scripts/requirements.txt`, installed into a project-local `.venv`.
- Do not pin `v2.0.0`: it lacks `--skip-github-release` and `--slow`, and it hardcodes the banner copyright.
- Pass `copyright` to `DevopsCli`, because v3 defaults it to empty.

### Adapter overrides on `MeteoProject(NodeProject)`
- `test`: run `python -m unittest discover -s tests` and then `npm test`; both must pass.
- `test_slow`: run `npm run test:browser`; add `test:slow` as an alias only if needed.
- `lint`: run `lint-markdown check --offline` on `LICENSE.md`, `README.md`, `CHANGELOG.md`, `CHANGELOG.nl.md`.
- `build`: no-op, so `npm pack` never runs.
- `release`: delegate to the existing deploy flow: `sw.js` regeneration in the release commit, `CHANGELOG.nl.md` freeze, plan branch push.

### Retained actions through `add_action`
- `serve`, `sw`, `deploy`.

### Acceptance checks
- `devops test` runs the Python and Node suites, and fails when either fails.
- `devops test --slow` runs the browser suites.
- `devops lint` and `devops check` pass.
- `devops versions` reports agreement.
- `devops release --dry-run` and `devops deploy --dry-run` pass on `main`.
- `tests/test_devops.py` is rewritten for the new structure and passes.

## Task Execution Steps
- [ ] **[Implement]** Implement required changes for T0036.
- [ ] **[Verify]**    Verify implementation with automated test suites.
- [ ] **[Doc]**       Update documentation and CHANGELOG.md.
- [ ] **[Review]**    Obtain review approval of the finished work before completion.

## Execution Log
- [2026-11-13] **[Doc]**
  Companion task file scaffolded at task creation.
