## Technical Specifications

### Behavior
- `CORE_DOCS` lists `docs/index.md` and `docs/specs/visual-style-guide.md` after the four root documents.
- `lint` and `format` pass all six paths, relative to the repository root, to `lint-markdown`.
- Missing documents stay skipped, as before.

### Declared Files
- scripts/devops.py
- tests/test_devops.py
- CHANGELOG.nl.md

### Tests
- Unit: `CORE_DOCS` contains `docs/index.md` and `docs/specs/visual-style-guide.md`.
- Unit: `lint` passes every `CORE_DOCS` entry as its repository-relative path, not only its file name.
- Integration: `python scripts/devops.py lint` reports all 6 markdown files passing.

Completion check: `python scripts/devops.py lint` reports 6 files passing, and `python scripts/devops.py test` passes.

Size estimate: 3 files, 30 lines
