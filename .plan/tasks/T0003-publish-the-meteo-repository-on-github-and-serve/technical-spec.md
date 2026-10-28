# T0003 Technical Specifications

- **[Decided]** The user explicitly asked to create the repository on the `gpellicciotta` account.
- **[Decided]** The repository is public, because GitHub Pages on a free account needs a public repository.
- **[Decided]** Pages deploys from branch `main`, path `/`; no build step or workflow is needed.
- Commands:
  - `gh repo create gpellicciotta/meteo --public --source . --remote origin --push`
  - `gh api -X POST repos/gpellicciotta/meteo/pages -f "source[branch]=main" -f "source[path]=/"`
- Site URL: `https://apps.pellicciotta.com/meteo/` (the account maps `gpellicciotta.github.io` to this custom domain).
- `README.md` links the live site; `CHANGELOG.md` marks the version released.

### Declared Files
- `README.md`
- `CHANGELOG.md`
- `CHANGELOG.nl.md`

### Tests
- Unit test: none (the task only publishes and configures hosting).
- Integration: the live URL returns HTTP 200 and a browser search for "Brussel" shows 12 bars.

Completion check: curl -sI https://apps.pellicciotta.com/meteo/ returns HTTP 200, and a live browser check passes.

Size estimate: 3 files, 20 lines
