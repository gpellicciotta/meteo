# Versiegeschiedenis

Een beknopt overzicht van alle wijzigingen, per versie van dit project.

> Nieuwe items staan bovenaan, in omgekeerd chronologische volgorde.
>
> De bovenste versie is altijd de versie in ontwikkeling, herkenbaar aan het achtervoegsel `-pre`
> (bv. `## v1.1.1-pre`). Zodra een versie bevroren of uitgebracht is, krijgt ze een statuscode:
> - `[{{date}}]` - bevroren op {{date}}
> - `[released: {{date}}]` - uitgebracht op {{date}}
> - `[broken]` - defect, niet gebruiken

---

## v1.3.0-pre
- DevEx: `devops.py lint` en `format` controleren nu ook [docs/index.md](docs/index.md) en de [visuele stijlgids](docs/specs/visual-style-guide.md).
- DevEx: [devops.py](scripts/devops.py) draait alleen nog op de vastgezette support-python, via de `.venv` van het project of de hoofd-checkout, en stopt anders.
- DevEx: [devops.py](scripts/devops.py) herbouwd op DevopsCli van support-python v3.2.0, met `test --slow`, `format`, `release` en een projectlokale `.venv`.
- FrontEnd: Ongebruikte quiz-restanten verwijderd: 16 iconen, 12 stijlklassen en 9 tokens, zonder visuele wijziging.
- FrontEnd: De drie schermen staan in de app-shell van support.webapp: vaste boven- en actiebalk, een smalle gecentreerde kolom en geen kaart op brede schermen.
- FrontEnd: Een link naar de inhoud, zichtbare focusringen voor het toetsenbord en minder beweging uit het gedeelde ontwerpsysteem toegevoegd.
- FrontEnd: Het lichtgele accent donkerder gemaakt tot `#b88000`, de AA-kleur van de bright-look, met witte labels.
- DevEx: support.webapp 0.1.0 met de bright-look meegeleverd, vastgezet in [design.json](design.json) en gecontroleerd door `devops.py check`.
- FrontEnd: Het root-attribuut `data-theme-color` hernoemd naar `data-accent`, het variantattribuut van de bright-look, zonder visuele wijziging.
- DevEx: Een [visuele stijlgids](docs/specs/visual-style-guide.md) toegevoegd met elke kleuroverschrijving en AA-uitzondering, waaronder witte labels op geel.
- FrontEnd: De gedeelde offlinebanner, toegankelijke updatemelding en publieke bright-stijlingang overgenomen.

## v1.2.0 [released: 2026-11-02]
- DevEx: Geünificeerd [devops.py](scripts/devops.py) CLI-script toegevoegd voor tests, linting, review-server, service worker en implementatie.
- DevEx: Review-server-operaties samengevoegd in [devops.py](scripts/devops.py) en verouderd run-review-server.py verwijderd.

## v1.1.0 [released: 2026-10-29]
- FrontEnd: Een windinstelling, standaard uit, toont de windsamenvatting en op hoge schermen de windsnelheid en -richting per uur.
- FrontEnd: Een weerbeeldinstelling, standaard uit, toont het weericoon bij de samenvatting en op hoge schermen per uur.
- FrontEnd: Eenheden voor °F, inch, mph en m/s, vooraf ingevuld volgens het land van je huidige locatie, anders metrisch.
- FrontEnd: Een gids in Over nummert elk onderdeel van een voorbeeldvoorspelling, met weericonen, muistooltips en F1 als sneltoets.
- FrontEnd: De legende en bronvermelding onder de voorspelling zijn weg; de Over-pagina behandelt ze nu.
- FrontEnd: De gele accentknoppen hebben nu witte tekst, in dezelfde gele tinten.

## v1.0.0 [released: 2026-10-28]
- FrontEnd: De regenstaven, hoeveelheden en natte weersamenvatting volgen nu de gekozen accentkleur.
- FrontEnd: De zoekbalk verdwijnt zodra een voorspelling verschijnt; een zoekknop onderaan toont ze opnieuw.
- FrontEnd: De titel en beschrijving van het startscherm staan nu gecentreerd, in plaats van 24 pixels naar links.
- FrontEnd: Elke zin van de weersamenvatting staat op een eigen regel, in een kleiner lettertype.
- FrontEnd: De huidige locatie toont gemeente, provincie en land via OpenStreetMap, met de coördinaten als het opzoeken mislukt.
- FrontEnd: De laatst bewaarde voorspelling verschijnt vanaf het huidige uur bij een offline start, een offline hervatting of een mislukte vernieuwing.
- FrontEnd: Het huidige uur van de voorspelling heet nu vetgedrukt "Nu", en de samenvatting zegt "nu" als het al regent.
- FrontEnd: Een weersvoorspelling ouder dan 15 minuten wordt op de achtergrond vernieuwd wanneer de app weer zichtbaar wordt.
- FrontEnd: Op telefoons staan de tijdslabels van de voorspelling om de twee uur, met behoud van alle uurstaven en toegankelijke beschrijvingen.
- FrontEnd: Plaatszoekopdrachten en weersverzoeken, inclusief antwoordgegevens, beperkt tot 10 seconden, met de bestaande netwerkfout bij een time-out.
- FrontEnd: Een themagekleurd weericoon met dag/nachtvarianten en vertaalde toegankelijke namen toegevoegd aan het begin van de weersamenvatting.
- FrontEnd: Hoogste windsnelheid en windstoten vanaf 50 km/u toegevoegd aan de weersamenvatting in het Nederlands en Engels.
- FrontEnd: De locatieknop staat naast het zoekveld en de plaats en updatetijd staan onder de weerkaart.

## v0.1.0 [released: 2026-10-28]
- FrontEnd: Het gekopieerde verkeersbordicoon vervangen door een Meteo-icoon met regenwolk en een eigen manifestnaam.
- FrontEnd: Zoeken op plaats en huidige locatie toegevoegd, met een 12-uursvoorspelling van regen per uur en temperatuur via Open-Meteo.
- FrontEnd: Meteo gestart vanuit de Verkeersregels Quiz-basis, met start-, Over- en Instellingenscherm in het Engels en Nederlands.
