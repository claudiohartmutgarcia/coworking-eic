# coworking-eic.de – statische Website

Statische Kopie der bisherigen WordPress-Seite von Coworking Eichsfeld e.V. Es gibt keine Datenbank, kein PHP und keinen Login, also auch nichts, was man angreifen könnte. Jeder Webspace, der Dateien ausliefert, reicht als Hosting.

| Ordner | Inhalt |
| --- | --- |
| `site/` | **Die Website.** Diesen Ordner auf den Webspace hochladen. |
| `termine/termine.json` | Alle Veranstaltungen und Termine |
| `termine/beschreibungen/` | Beschreibungstext je Veranstaltung (HTML) |
| `termine/vorlage-detail.html` | Vorlage für die Detailseiten der Veranstaltungen |
| `tools/` | Kleine Node-Skripte (keine Abhängigkeiten, nur Node.js ab Version 20) |
| `v2/` | **Version 2:** neu gebaute Website mit Astro, siehe [v2/README.md](v2/README.md). Vorschau unter https://claudiohartmutgarcia.github.io/coworking-eic/v2/ |
| `remake/` | Arbeitsdaten vom Kopieren der alten Seite. Gehört nicht zur Website und kann gelöscht werden. |

## Vorschau

```bash
node tools/vorschau.mjs
```

Danach http://localhost:8080 im Browser öffnen.

## Vorschau auf GitHub Pages

Jeder Push auf `main` veröffentlicht `site/` über den Workflow `.github/workflows/pages.yml` auf GitHub Pages. Dabei setzt `tools/suchmaschinen-sperren.mjs` in jede veröffentlichte Seite `noindex`, aber nur in der Kopie, die hochgeladen wird. So erscheint die Vorschau nicht neben der alten WordPress-Seite bei Google. Weil die Vorschau unter https://claudiohartmutgarcia.github.io/coworking-eic/ liegt, also in einem Unterordner, schreibt `tools/basis-pfad.mjs` dort außerdem alle Pfade um (`/kontakt` → `/coworking-eic/kontakt`). Die Dateien in `site/` bleiben unverändert. Für den echten Umzug auf coworking-eic.de lädt man `site/` direkt hoch, ohne dieses Skript.

## Termine pflegen

1. In `termine/termine.json` einen Termin ergänzen, zum Beispiel `{ "datum": "2027-07-27", "von": "18:00", "bis": "22:00" }`.
   Für eine neue Veranstaltung einen neuen Block anlegen und die Beschreibung als `termine/beschreibungen/<name>.html` speichern. Das Bild kommt nach `site/wp-content/uploads/…`.
2. Generator ausführen:

   ```bash
   node tools/termine.mjs
   ```

3. Den Ordner `site/` hochladen.

Der Generator schreibt:

- die nächsten 3 Termine als Kacheln auf die Startseite,
- alle kommenden Termine als Liste auf `/veranstaltungen-coworking-eichsfeld`,
- je Veranstaltung eine Detailseite `/events/<slug>` mit Google-Kalender-Link,
- je Veranstaltung eine Kalenderdatei `/events/<slug>/termine.ics` für Outlook und Apple.

Vergangene Termine fallen erst weg, wenn der Generator erneut läuft. Deshalb nach jedem Termin oder mindestens einmal im Monat ausführen und `site/` hochladen. Claude kann das übernehmen, zum Beispiel mit „Trag das After Work am 27.07.2027 ein“.

## Was sich gegenüber WordPress geändert hat

- **Kontakt:** Das Formular ist ersetzt durch einen Mail-Link auf hallo@coworking-eic.de. Er öffnet das eigene Mailprogramm mit vorausgefülltem Betreff.
- **Mitgliedsformular** (Seite „Der Verein“): Der Upload ist ebenfalls ein Mail-Link, das PDF hängt man selbst an.
- **Veranstaltungen:** Der Kalender von „Modern Events Calendar“ lud seine Daten von WordPress nach. Er ist ersetzt durch die statische Liste aus `termine/termine.json`. Die Kommentarfunktion unter den Veranstaltungen ist entfallen.
- **Alte Adressen:** `/events/after-work-954` und `/events` leiten weiter (`weiterleitungen` in `termine.json`).
- **Entfernt:** Google Tag Manager/Analytics, WordPress-Schnittstellen (Feed, oEmbed, xmlrpc, admin-ajax).
- **Cookie-Banner entfernt:** Die Seite selbst setzt keine Cookies mehr. Ausnahme: Die eingebettete Google-Karte auf `/kontakt` lädt Inhalte von Google, und Google kann dabei Cookies setzen. Das war schon bei WordPress so, das Banner hat die Karte nie blockiert.
- **Cobot und alle anderen externen Links** sind unverändert.

Nach Änderungen an Seiten:

```bash
node tools/links-pruefen.mjs
```

Das Skript meldet interne Links, deren Ziel fehlt. Bekannt: `/workation` ist auch auf der alten WordPress-Seite schon ein toter Link.
