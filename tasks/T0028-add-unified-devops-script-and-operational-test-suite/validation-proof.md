# T0028: Walkthrough & Validation

## Red Phase
Command: `python -m unittest tests/test_devops.py` (exit code 1)

```text
FEFFE.FEFF
======================================================================
ERROR: test_has_plan_branch_detects_plan (tests.test_devops.TestDevopsCli.test_has_plan_branch_detects_plan)
Validates that has_plan_branch detects local plan branch.
----------------------------------------------------------------------
Traceback (most recent call last):
  File "C:\Dev-Projects\meteo\tests\test_devops.py", line 68, in test_has_plan_branch_detects_plan
    mod = _load_devops_module()
FileNotFoundError: [Errno 2] No such file or directory: 'C:\\Dev-Projects\\meteo\\scripts\\devops.py'

======================================================================
FAIL: test_devops_script_exists (tests.test_devops.TestDevopsCli.test_devops_script_exists)
Validates that scripts/devops.py exists on disk.
----------------------------------------------------------------------
Traceback (most recent call last):
  File "C:\Dev-Projects\meteo\tests\test_devops.py", line 30, in test_devops_script_exists
    self.assertTrue(DEVOPS_SCRIPT.exists(), f"Missing script: {DEVOPS_SCRIPT}")
AssertionError: False is not true : Missing script: C:\Dev-Projects\meteo\scripts\devops.py
[... 72 lines omitted ...]
----------------------------------------------------------------------
Ran 10 tests in 0.146s

FAILED (failures=6, errors=3)
```

## Green Phase
Command: `python scripts/devops.py check` (exit code 0)

```text
[*] Running automated test suite
============================================================
Python: OK
Node:  Test Files  3 passed (3)
Node:       Tests  105 passed (105)
[*] Linting documentation and changelog
============================================================
All documentation passed markdown linting.
```

Command: `python -m unittest discover -s tests` (exit code 0)

```text
..........
----------------------------------------------------------------------
Ran 10 tests in 1.164s

OK
```
