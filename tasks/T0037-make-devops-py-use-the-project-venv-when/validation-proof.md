## Walkthrough & Validation

### Red phase: pin, venv candidates, and re-execution

Before the fix, `python -m unittest tests.test_devops.TestSupportPythonPin tests.test_devops.TestSupportPythonVenvSelection`, exit code 1.
The stand-in support-python 0.0.1 ran (`WRONG-VERSION-RAN`), reproducing the T0034 cause.

```text
[... 2 lines omitted ...]
ERROR: test_no_pin_without_support_python_line (tests.test_devops.TestSupportPythonPin.test_no_pin_without_support_python_line)
[... 6 lines omitted ...]
AttributeError: module 'devops_mod' has no attribute 'pinned_support_python_version'
[... 2 lines omitted ...]
ERROR: test_pin_read_from_exact_requirement (tests.test_devops.TestSupportPythonPin.test_pin_read_from_exact_requirement)
[... 6 lines omitted ...]
AttributeError: module 'devops_mod' has no attribute 'pinned_support_python_version'
[... 2 lines omitted ...]
ERROR: test_pin_read_from_project_requirements (tests.test_devops.TestSupportPythonPin.test_pin_read_from_project_requirements)
[... 6 lines omitted ...]
AttributeError: module 'devops_mod' has no attribute 'pinned_support_python_version'
[... 2 lines omitted ...]
ERROR: test_venv_candidates_from_primary_checkout_list_only_its_venv (tests.test_devops.TestSupportPythonPin.test_venv_candidates_from_primary_checkout_list_only_its_venv)
[... 6 lines omitted ...]
AttributeError: module 'devops_mod' has no attribute 'venv_python_candidates'
[... 2 lines omitted ...]
ERROR: test_venv_candidates_from_worktree_include_primary_checkout (tests.test_devops.TestSupportPythonPin.test_venv_candidates_from_worktree_include_primary_checkout)
[... 6 lines omitted ...]
AttributeError: module 'devops_mod' has no attribute 'venv_python_candidates'
[... 2 lines omitted ...]
FAIL: test_mismatched_version_reruns_under_project_venv (tests.test_devops.TestSupportPythonVenvSelection.test_mismatched_version_reruns_under_project_venv)
[... 5 lines omitted ...]
AssertionError: 9 != 7 : WRONG-VERSION-RAN
[... 3 lines omitted ...]
FAIL: test_mismatched_version_without_venv_exits_with_setup_commands (tests.test_devops.TestSupportPythonVenvSelection.test_mismatched_version_without_venv_exits_with_setup_commands)
[... 5 lines omitted ...]
AssertionError: 9 != 1 : WRONG-VERSION-RAN
[... 3 lines omitted ...]
Ran 8 tests in 1.477s
[... 1 lines omitted ...]
FAILED (failures=2, errors=5)
```

### Red phase: integration clone isolation

Before the fix, `python -m unittest tests.test_devops.TestIntegrationCloneIsolation`, exit code 1.
About 1021 leaked clones in the temp directory had used up the NTFS limit of 1023 hard links on the pack index.

```text
[... 13 lines omitted ...]
subprocess.CalledProcessError: Command '['git', 'clone', '-q', '--local', 'C:\\Dev-Projects\\meteo', 'C:\\Users\\giova\\AppData\\Local\\Temp\\tmpo3p4kr6q\\clone']' returned non-zero exit status 128.
[... 2 lines omitted ...]
Ran 1 test in 42.565s
[... 1 lines omitted ...]
FAILED (errors=1)
```

### Green phase: full test run through the venv

After the fix, `python scripts/devops.py test` with the global interpreter (support-python 3.1.0), exit code 1.
It re-ran under `.venv` (support-python 3.2.0); all 37 Python tests pass, including the release clones that recursed before.
The 4 failing Node tests are pre-existing CRLF parsing failures in `tests/accent.test.js`; this task changes no JavaScript.
The T0034 branch already fixes them.

```text
Command: C:\Dev-Projects\meteo\.venv\Scripts\python.exe -m unittest discover -s tests
[... 24 lines omitted ...]
Ran 37 tests in 36.750s
OK
Command: "C:\Program Files\nodejs\npm.CMD" test
[... 11 lines omitted ...]
 FAIL  tests/accent.test.js > style guide > lists every contract token override with meteo's and the look's value
[... 61 lines omitted ...]
 FAIL  tests/accent.test.js > style guide > lists each AA exception with its measured ratio below the minimum
[... 9 lines omitted ...]
 FAIL  tests/accent.test.js > style guide > lists the white labels on the Light yellow fill as an AA exception
 FAIL  tests/accent.test.js > style guide > lists the white labels on the Dark yellow fill as an AA exception
[... 13 lines omitted ...]
 Test Files  1 failed | 15 passed (16)
      Tests  4 failed | 381 passed (385)
[... 4 lines omitted ...]
**[ERROR]** Node test suite failed.
**[ERROR]** Finished devops test in 45.0s with status: failed
```

### End-to-end: global interpreter re-runs under the venv

`python -c "import importlib.metadata as m;print(m.version('support-python'))"; python scripts/devops.py versions`, exit code 0:

```text
3.1.0
Version file: 1.3.0-pre
CHANGELOG.md: 1.3.0-pre
Versions agree.
```

### Documentation lint

`python scripts/devops.py lint`, exit code 0:

```text
All 4 markdown files passed linting.
```
