## Walkthrough & Validation

### Baseline: both documents already pass lint

`lint-markdown check --offline docs/index.md docs/specs/visual-style-guide.md`, exit code 0:

```text
All 2 markdown files passed linting.
```

### Red phase

Before the change, `.venv/Scripts/python -m unittest tests.test_devops.TestDevopsAdapter.test_lint_checks_core_docs_offline tests.test_devops.TestDevopsAdapter.test_lint_covers_docs_index_and_visual_style_guide`, exit code 1.
The path test compares repository-relative paths instead of file names; it passes on the four root documents.

```text
FAIL: test_lint_covers_docs_index_and_visual_style_guide
(tests.test_devops.TestDevopsAdapter.test_lint_covers_docs_index_and_visual_style_guide)
AssertionError: 'docs/index.md' not found in ['LICENSE.md', 'README.md', 'CHANGELOG.md', 'CHANGELOG.nl.md']
Ran 2 tests in 0.143s
FAILED (failures=1)
```

### Green phase: devops tests

After the change, `.venv/Scripts/python -m unittest tests.test_devops`, exit code 0:

```text
----------------------------------------------------------------------
Ran 46 tests in 22.278s

OK
```

### Completion check: lint covers six documents

`python scripts/devops.py lint`, exit code 0:

```text
All 6 markdown files passed linting.
```

### Completion check: full test run

`python scripts/devops.py test` from the global interpreter, exit code 0; it re-ran under `.venv`.
The Node run reflects unrelated uncommitted work in the checkout, which deletes several JavaScript test files.

```text
Command: C:\Dev-Projects\meteo\.venv\Scripts\python.exe -m unittest discover -s tests
Ran 46 tests in 22.667s
OK
Command: "C:\Program Files\nodejs\npm.CMD" test
 Test Files  3 passed (3)
      Tests  105 passed (105)
```

`git diff --check` exited 0 without output.
