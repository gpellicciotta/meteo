# T0029 validation proof

## Walkthrough & Validation

Evaluation only: no repository code changed. Probe ran the support.python checkout (3.2.0, `src/` via PYTHONPATH) against this worktree through `DevopsCli(NodeProject(root))`.

Command: `versions` (exit 0)
```text
Version file: 1.2.0
CHANGELOG.md: 1.2.0
Versions agree.
```

Command: `lint` (exit 1)
```text
**[ERROR]** npm script 'lint' is not defined in package.json.
**[ERROR]** Finished devops lint in 0.1s with status: failed
```

Command: `release --dry-run --skip-github-release --skip-checks` (exit 1)
```text
Release version: v1.2.0
Next version: v1.2.1-pre
Dry run: True
**[ERROR]** Releases must be cut from branch 'main' (currently on 'task/T0029-evaluate-adopting-devopscli-from-the-released-support-python').
**[ERROR]** Finished devops release in 0.3s with status: failed
```

Source check: v2.0.0 and v3.2.0 both ship `DevopsCli.add_action`, `NodeProject`, and `ReleasePipeline`; the latest tag is v3.2.0.
