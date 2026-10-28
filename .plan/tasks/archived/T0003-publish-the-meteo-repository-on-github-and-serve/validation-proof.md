# T0003 Walkthrough & Validation

## Key Changes
- Created the public repository `gpellicciotta/meteo` and pushed `main`.
- Enabled GitHub Pages from `main`, path `/`.
- The account maps `gpellicciotta.github.io` to `apps.pellicciotta.com`, so the site lives at `https://apps.pellicciotta.com/meteo/`.
- README.md, the repository homepage and both changelogs point at that URL and mark v0.1.0 released.

## Publishing Commands
Each command exited with code 0:

```text
gh repo create gpellicciotta/meteo --public --description "..." --homepage "..." --source . --remote origin --push
gh api -X POST repos/gpellicciotta/meteo/pages -f "source[branch]=main" -f "source[path]=/"
gh repo edit gpellicciotta/meteo --homepage "https://apps.pellicciotta.com/meteo/"
```

## Verification
Pages build poll followed by `curl -L` of both URLs, exit code 0:

```text
pages build: built
200 https://apps.pellicciotta.com/meteo/
200 https://apps.pellicciotta.com/meteo/
```

Live Playwright check of `?lang=nl&location=Brussel` against the real Open-Meteo APIs, exit code 0:

```text
desktop: place="Brussel, Brussels Hoofdstedelijk Gewest, België" bars=12
desktop: summary="Geen regen verwacht in de komende 12 uur. Temperatuur tussen 11 en 14 °C."
desktop: sw=true
mobile: place="Brussel, Brussels Hoofdstedelijk Gewest, België" bars=12
mobile: summary="Geen regen verwacht in de komende 12 uur. Temperatuur tussen 11 en 14 °C."
mobile: sw=true
no console, page or network errors
```

## Screenshots
- Before: the site did not exist yet (HTTP 404 from the markdown link check before publishing).
- After: [live desktop](screenshots/live-site-desktop.png), [live mobile](screenshots/live-site-mobile.png)
