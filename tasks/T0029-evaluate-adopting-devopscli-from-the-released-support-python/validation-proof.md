# T0029 validation proof

## Walkthrough & Validation
Evaluation only: no product code changed. The probe harness is [probe-devopscli.py](probe-devopscli.py).
It runs `DevopsCli(NodeProject(root)).run(ACTION...)` with a given support-python `src/` on `sys.path`.

Setup, run from a support.python checkout and this worktree:
```text
git rev-parse v2.0.0 v3.2.0
341b3f3ff018a43bdc29410e1429a2c0f108c865
8391e937499ce5ede572a4dd5ca878cbd5b2ef0c
git archive v2.0.0 src | tar -x -C {{empty-temp-dir}}
```
Probe command shape, with `{{src}}` set to `{{empty-temp-dir}}/src` (v2.0.0) or `{{support-python}}/src` (v3.2.0 checkout, HEAD 4d85bd5; `git diff v3.2.0 HEAD -- src` is empty):
```text
python -I probe-devopscli.py {{src}} {{meteo-worktree}} {{action...}}
```
Project under probe: meteo at 8937c32, `package.json` 1.2.0, no `lint` or `test:slow` scripts.

## Results
v2.0.0 baseline:
```text
versions                        exit 0   Version file: 1.2.0 / CHANGELOG.md: 1.2.0 / Versions agree.
lint                            exit 1   ERROR npm script 'lint' is not defined in package.json.
test --help                     exit 0   Usage: devops test [SELECTION...] [-- RUNNER-OPTIONS...]
release --dry-run --skip-github-release --skip-checks
                                exit 2   ERROR unrecognized arguments: --skip-github-release
                                         Usage: devops release [--dry-run] [--skip-checks] [--yes]
```
v3.2.0:
```text
versions                        exit 0   Version file: 1.2.0 / CHANGELOG.md: 1.2.0 / Versions agree.
lint                            exit 1   ERROR npm script 'lint' is not defined in package.json.
test --help                     exit 0   Usage: devops test [--slow] [SELECTION...] [-- RUNNER-OPTIONS...]
release --dry-run --skip-github-release --skip-checks
                                exit 1   Release version: v1.2.0 / Next version: v1.2.1-pre / Dry run: True
                                         ERROR Releases must be cut from branch 'main' (currently on 'task/T0029-...')
```
Banner: v2.0.0 prints `devops v1.2.0+8937c32 - Copyright (c) Giovanni Pellicciotta`; v3.2.0 prints `devops v1.2.0+8937c32` without a copyright.

## Conclusions
- Both versions give the same results for `versions` and `lint`; the conclusions about them hold for v2.0.0 too.
- v2.0.0 cannot skip the GitHub release, which meteo needs: Pages deploys have no release or `gh`. v3.2.0 can.
- v2.0.0 has no `--slow`, so the browser suite cannot map to it; v3.2.0 can.
- Therefore the follow-up pins v3.2.0, not the v2.0.0 named in the task. Task T0036 records the adoption.
- `NodeProject.test` runs only `npm test`, so adoption overrides `test` to keep the Python unittest suite as well; see T0036.
- `release` was probed only to its branch precondition, because the worktree is not on `main`; later pipeline steps are unverified.

## Lint
```text
lint-markdown check --offline validation-proof.md   exit 0
```
