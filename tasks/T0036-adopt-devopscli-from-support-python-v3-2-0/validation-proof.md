# T0036 validation proof

Python: `.venv/Scripts/python` with support-python 3.2.0 from `scripts/requirements.txt`. Run from the task worktree.

| Command                                      | Exit | Result                                                          |
| :------------------------------------------- | :--- | :-------------------------------------------------------------- |
| `python -m unittest discover -s tests`       | 0    | Ran 21 tests, OK                                                |
| `devops test`                                | 0    | unittest 21 OK; vitest 3 files, 105 tests passed                |
| `devops test --slow`                         | 0    | Browser suites printed only `ok - ...` lines                    |
| `devops lint`                                | 0    | All 4 markdown files passed linting                             |
| `devops check`                               | 0    | lint, unittest, and vitest passed                               |
| `devops versions`                            | 0    | Version file 1.2.0, CHANGELOG.md 1.2.0, Versions agree          |
| `devops build`                               | 0    | Nothing to build; skipping (no npm pack)                        |
| `devops release --dry-run --skip-checks`     | 1    | Clean tree; fails: no active `-pre` heading in CHANGELOG.md     |
| `devops deploy --dry-run`                    | 1    | Same `-pre` heading failure (and dirty tree before the commit)  |

The dry-run failure is a precondition of the old flow, not a regression: `main` is at the released v1.2.0 with no `-pre` heading.
Dry runs will pass once a `-pre` heading is open. I did not add one, because the task forbids version bumps.
The release and deploy dry runs were not verified on `main` itself, only on the task branch.
Unit tests mock the heading, checks, and git to cover the passing dry-run path.

## Verbatim output

```text
$ python scripts/devops.py versions
Version file: 1.2.0
CHANGELOG.md: 1.2.0
Versions agree.
exit: 0
$ python scripts/devops.py lint
Command: C:\Dev-Projects\meteo\.plan\work\T0036-adopt-devopscli-from-support-python-v3-2-0\.venv\Scripts\lint-markdown.EXE check --offline LICENSE.md README.md CHANGELOG.md CHANGELOG.nl.md
Process ID: 70140
All 4 markdown files passed linting.
exit: 0
$ python scripts/devops.py release --dry-run --skip-checks
Checking git working tree status.
Working tree is clean.
Checking active CHANGELOG.md version.
**[ERROR]** No active '-pre' version heading found at the top of CHANGELOG.md - nothing to release.
Current branch: task/T0036-adopt-devopscli-from-support-python-v3-2-0
**[ERROR]** Pre-flight deployment checks failed. Resolve issues before deploying.
**[ERROR]** Finished devops release in 0.1s with status: failed
exit: 1
```
