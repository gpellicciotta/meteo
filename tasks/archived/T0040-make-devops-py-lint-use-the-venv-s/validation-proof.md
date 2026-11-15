# T0040 validation

## Walkthrough & Validation

Command: `.venv/Scripts/python.exe -m unittest discover -s tests -p test_devops.py -k TestDevopsAdapter`; exit code 1.

```text
[... 29 lines omitted ...]
    ~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError: Lists differ: ['C:\\Users\\giova\\AppData\\Local\\Programs\\P[90 chars].md'] != ['C:\\Dev-Projects\\meteo\\.venv\\Scripts\\pyth[69 chars]ine']

First differing element 0:
'C:\\Users\\giova\\AppData\\Local\\Programs\\P[40 chars].EXE'
'C:\\Dev-Projects\\meteo\\.venv\\Scripts\\python.exe'

- ['C:\\Users\\giova\\AppData\\Local\\Programs\\Python\\Python315\\Scripts\\lint-markdown.EXE',
+ ['C:\\Dev-Projects\\meteo\\.venv\\Scripts\\python.exe',
+  '-m',
+  'support_python.tools.lint_markdown',
   'check',
-  '--offline',
?             ^

+  '--offline']
?             ^

-  'LICENSE.md',
-  'README.md']

======================================================================
FAIL: test_lint_never_resolves_a_path_launcher (test_devops.TestDevopsAdapter.test_lint_never_resolves_a_path_launcher)
Validates lint works when no launcher exists on PATH.
----------------------------------------------------------------------
Traceback (most recent call last):
  File "C:\Dev-Projects\meteo\tests\test_devops.py", line 122, in test_lint_never_resolves_a_path_launcher
    self.assertTrue(self.project.lint())
    ~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^
AssertionError: False is not true

----------------------------------------------------------------------
Ran 22 tests in 0.189s

FAILED (failures=3)
```

Command: `.venv/Scripts/python.exe -m unittest discover -s tests -p test_devops.py -k TestDevopsAdapter`; exit code 0.

```text
......................
----------------------------------------------------------------------
Ran 22 tests in 0.119s

OK
```

Command: `python scripts/devops.py lint`; exit code 0.

```text
Command: C:\Dev-Projects\meteo\.venv\Scripts\python.exe -m support_python.tools.lint_markdown check --offline LICENSE.md README.md CHANGELOG.md CHANGELOG.nl.md docs/index.md docs/specs/visual-style-guide.md
Process ID: 30008
All 6 markdown files passed linting.
```

Command: `python scripts/devops.py test`; exit code 0.

```text
[... 3 lines omitted ...]
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
.warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.nl.md', LF will be replaced by CRLF the next time Git touches it
.................
----------------------------------------------------------------------
Ran 48 tests in 17.886s
OK
Command: "C:\Program Files\nodejs\npm.CMD" test
Process ID: 6908
> meteo@1.3.0-pre test
> vitest run
 RUN  v5.0.5 C:/Dev-Projects/meteo
 Test Files  18 passed (18)
      Tests  428 passed (428)
   Start at  09:13:41
   Duration  5.20s (environment 73%, tests 17%, transform 5%, import 4%, worker 1%)
    Isolate  18 workers spawned · ~1.33s startup each (spawn + environment, per file)
             at least ~2.08s faster with isolate: false — reuses workers across files instead of one per file
```

The JavaScript count includes the retained T0034 worktree; both copies passed.
