# coworking-eic.de – Version 2 (Astro)

Neu gebaute Website von Coworking Eichsfeld e.V. mit [Astro](https://astro.build/). Inhalte stammen von der alten Seite, Gestaltung und Aufbau sind neu. Keine Datenbank, kein WordPress: Astro erzeugt beim Bauen reine HTML-Dateien.

## Starten

```bash
cd v2
npm install
npm run dev        # Vorschau mit automatischem Neuladen: http://localhost:4321
npm run build      # fertige Website nach v2/dist/
```

## Wo steht was?

| Ordner / Datei | Inhalt |
| --- | --- |
| `src/content/veranstaltungen/*.md` | **Veranstaltungen.** Eine Datei je Veranstaltung: oben Titel, Bild und Termine, darunter der Beschreibungstext. |
| `src/data/standorte.ts` | Heiligenstadt und Leinefelde: Preise, Buchungslinks, Ausstattung, Ansprechpartner |
| `src/data/community.ts` | Werte und Mitgliederprofile der Community-Seite |
| `src/data/partner.ts` | Netzwerkpartner mit Logos |
| `src/data/site.ts` | E-Mail, Telefon, Social-Media-Links, Menü |
| `src/pages/` | Eine Datei je Seite (Impressum, Datenschutz, …) |
| `src/assets/` | Bilder (werden beim Bauen automatisch verkleinert und als WebP ausgeliefert) |
| `public/` | Dateien, die unverändert ausgeliefert werden: PDFs, Videos, Favicon |

## Termin eintragen

In `src/content/veranstaltungen/after-work.md` eine Zeile unter `termine:` ergänzen:

```yaml
  - { datum: "2027-07-27", von: "18:00", bis: "22:00" }
```

Neue Veranstaltung: eine Datei kopieren, Text und Termine anpassen, Plakat nach `src/assets/veranstaltungen/` legen. Die Adresse der Seite ergibt sich aus dem Dateinamen (`/veranstaltungen/<dateiname>`), dazu gibt es automatisch eine Kalenderdatei `termine.ics`.

Vergangene Termine fallen beim nächsten Bauen weg. Der GitHub-Workflow baut deshalb jede Nacht neu.

## Vorschau auf GitHub Pages

Der Workflow `.github/workflows/pages.yml` baut Version 2 und legt sie neben die alte Kopie: https://claudiohartmutgarcia.github.io/coworking-eic/v2/ – mit `noindex`, damit sie nicht bei Google erscheint. Für den echten Umzug auf coworking-eic.de einfach `npm run build` ohne Umgebungsvariablen ausführen und `dist/` hochladen.

## Was gegenüber der alten Seite anders ist

- Keine Verweise mehr auf WordPress oder das Theme, keine `wp-content`-Pfade. Alte Adressen wie `/events/after-work` oder `/veranstaltungen-coworking-eichsfeld` leiten auf die neuen weiter.
- Keine eingebettete Google-Karte und keine extern geladenen Schriften oder Icons. Die Schrift (Poppins) wird selbst ausgeliefert, Karten öffnen sich erst auf Klick bei OpenStreetMap.
- Kein Cookie-Banner nötig, da keine Cookies und kein Tracking.
- Community-Seite ohne das Profil von Mareike Spitzenberg.
- Datenschutzerklärung: Platzhalter, der finale Text folgt (`src/pages/datenschutz.astro`).
