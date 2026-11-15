# T0029 validation proof

## Walkthrough & Validation
Evaluation only: no product code changed. The probe harness is [probe-devopscli.py](probe-devopscli.py).
It runs `DevopsCli(NodeProject(root)).run(ACTION...)` with a given support-python `src/` on `sys.path`.
All outputs below were captured verbatim by running the listed commands; the Results blocks are unedited.

Placeholders and directories:
- `{{companion}}`: `.plan/tasks/T0029-evaluate-adopting-devopscli-from-the-released-support-python` of the meteo repository, the directory every probe ran from.
- `{{worktree}}`: `.plan/work/T0029-evaluate-adopting-devopscli-from-the-released-support-python`, the meteo worktree at 8937c32 under probe (`package.json` 1.2.0, no `lint` or `test:slow` scripts).
- `{{v2-src}}`: `src/` extracted with `git archive v2.0.0 src` into an empty temporary directory.
- `{{v3-src}}`: `src/` of the support.python checkout at HEAD; the last block shows its diff against tag v3.2.0 is empty.

## Results

### v2.0.0 baseline
Command: `python -I probe-devopscli.py {{v2-src}} {{worktree}} versions`
Directory: {{companion}}
Exit code: 0
```text
Version file: 1.2.0
CHANGELOG.md: 1.2.0
Versions agree.
```

Command: `python -I probe-devopscli.py {{v2-src}} {{worktree}} lint`
Directory: {{companion}}
Exit code: 1
```text
**[ERROR]** npm script 'lint' is not defined in package.json.
**[ERROR]** Finished devops lint in 0.1s with status: failed
```

Command: `python -I probe-devopscli.py {{v2-src}} {{worktree}} test --help`
Directory: {{companion}}
Exit code: 0
```text
devops v1.2.0+8937c32 - Copyright (c) Giovanni Pellicciotta

Detailed Action Description: test
  Run the test suite. Pass test paths as SELECTION; put runner options after `--`.

Examples:
  devops test tests/test_cli.py -- -k version

Usage:
  devops test [SELECTION...] [-- RUNNER-OPTIONS...]

Options:
  -h, --help             show help message and exit
  --version              show version information and exit
  -v, --verbose          enable verbose output logging
  --debug                enable debug output logging (implies --verbose)
  --log-file PATH        append operational logs to specified file
  --log-level LEVEL      logging severity threshold (DEBUG, INFO, WARN, ERROR; default: INFO)

Exit codes:
  0   success
  1   an operation failed, the virtual environment is missing, or versions drift
  2   invalid arguments or unknown action
```

Command: `python -I probe-devopscli.py {{v2-src}} {{worktree}} release --dry-run --skip-github-release --skip-checks`
Directory: {{companion}}
Exit code: 2
```text
**[ERROR]** unrecognized arguments: --skip-github-release
            Usage: devops release [--dry-run] [--skip-checks] [--yes]
```

### v3.2.0
Command: `python -I probe-devopscli.py {{v3-src}} {{worktree}} versions`
Directory: {{companion}}
Exit code: 0
```text
Version file: 1.2.0
CHANGELOG.md: 1.2.0
Versions agree.
```

Command: `python -I probe-devopscli.py {{v3-src}} {{worktree}} lint`
Directory: {{companion}}
Exit code: 1
```text
**[ERROR]** npm script 'lint' is not defined in package.json.
**[ERROR]** Finished devops lint in 0.1s with status: failed
```

Command: `python -I probe-devopscli.py {{v3-src}} {{worktree}} test --help`
Directory: {{companion}}
Exit code: 0
```text
devops v1.2.0+8937c32

Detailed Action Description: test
  Run the test suite. Pass --slow to run the slow suite. Pass test paths or names as SELECTION; put runner options after `--`.

Examples:
  devops test test/cli.test.js

Usage:
  devops test [--slow] [SELECTION...] [-- RUNNER-OPTIONS...]

Arguments:
  [selection ...]        test paths or names to run

Options:
  -h, --help             show help message and exit
  --version              show version information and exit
  -v, --verbose          enable verbose output logging
  --debug                enable debug output logging (implies --verbose)
  --log-file PATH        append operational logs to specified file
  --log-level LEVEL      logging severity threshold (DEBUG, INFO, WARN, ERROR; default: INFO)
  --slow                 run the slow test suite

Exit codes:
  0   success
  1   an operation failed, a prerequisite is missing, or versions drift
  2   invalid arguments or unknown action
```

Command: `python -I probe-devopscli.py {{v3-src}} {{worktree}} release --dry-run --skip-github-release --skip-checks`
Directory: {{companion}}
Exit code: 1
```text
Release version: v1.2.0
Next version: v1.2.1-pre
Dry run: True
**[ERROR]** Releases must be cut from branch 'main' (currently on 'task/T0029-evaluate-adopting-devopscli-from-the-released-support-python').
**[ERROR]** Finished devops release in 0.2s with status: failed
```

### Source revisions
Command: `git rev-parse v2.0.0 v3.2.0`
Directory: {{companion}}
Exit code: 0
```text
341b3f3ff018a43bdc29410e1429a2c0f108c865
8391e937499ce5ede572a4dd5ca878cbd5b2ef0c
```

Command: `git rev-parse HEAD`
Directory: {{companion}}
Exit code: 0
```text
4d85bd579479d12d80cca51acbbb493887056fc5
```

Command: `git diff --stat v3.2.0 HEAD -- src`
Directory: {{companion}}
Exit code: 0
```text

```

## Conclusions
- Both versions give the same results for `versions` and `lint`; the conclusions about them hold for v2.0.0 too.
- v2.0.0 cannot skip the GitHub release, which meteo needs: Pages deploys have no release or `gh`. v3.2.0 can.
- v2.0.0 has no `--slow`, so the browser suite cannot map to it; v3.2.0 can.
- v3.2.0 prints no banner copyright unless one is passed; v2.0.0 hardcodes it.
- Therefore follow-up T0036 pins v3.2.0, not the v2.0.0 named in the task.
- `NodeProject.test` runs only `npm test`, so adoption overrides `test` to keep the Python unittest suite as well; see T0036.
- `release` was probed only to its branch precondition, because the worktree is not on `main`; later pipeline steps are unverified.

## Lint
Command: `lint-markdown check --offline validation-proof.md`
Directory: {{companion}}
Exit code: 0
```text
All 1 markdown files passed linting.
```
