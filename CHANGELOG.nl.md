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

## v0.1.1-pre
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
