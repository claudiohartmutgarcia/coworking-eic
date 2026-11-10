// Termine statisch erzeugen.
//
//   node tools/termine.mjs                 (heute = aktuelles Datum in Berlin)
//   node tools/termine.mjs --heute 2026-11-09
//
// Liest termine/termine.json und die Beschreibungen in termine/beschreibungen/ und schreibt:
//   - die nächsten 3 Termine als Kacheln auf die Startseite (site/index.html)
//   - alle kommenden Termine als Liste auf die Veranstaltungsseite
//   - je Veranstaltung eine Detailseite  site/events/<slug>/index.html
//   - je Veranstaltung eine Kalenderdatei site/events/<slug>/termine.ics (für Outlook, Apple, Google)
//   - Weiterleitungen für alte Adressen (termine.json → "weiterleitungen")
//
// Vergangene Termine verschwinden automatisch, sobald das Skript nach dem Termin erneut läuft.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(ROOT, "site");
const DIR = path.join(ROOT, "termine");
const VORLAGE = path.join(DIR, "vorlage-detail.html");
const DOMAIN = "https://www.coworking-eic.de";

const MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const TAGE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : null;
};

function heuteInBerlin() {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return p; // YYYY-MM-DD
}
const HEUTE = arg("--heute") || heuteInBerlin();

function datumTeile(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const wt = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { y, m, d, monat: MONATE[m - 1], tag: TAGE[wt], lang: `${d}. ${MONATE[m - 1]} ${y}` };
}
const zeit = (t) => (t.bis ? `${t.von} - ${t.bis}` : t.von || "");
const kompakt = (iso, hhmm) => iso.replace(/-/g, "") + "T" + (hhmm || "00:00").replace(":", "").padStart(4, "0") + "00";

// ---------- Daten laden und prüfen ----------
const daten = JSON.parse(fs.readFileSync(path.join(DIR, "termine.json"), "utf8"));
const fehler = [];
for (const v of daten.veranstaltungen) {
  for (const k of ["slug", "titel", "bild", "beschreibung", "termine"]) if (!v[k]) fehler.push(`${v.slug || v.titel || "?"}: "${k}" fehlt`);
  if (v.slug && !/^[a-z0-9-]+$/.test(v.slug)) fehler.push(`${v.slug}: slug nur aus a-z, 0-9 und - bilden`);
  for (const t of v.termine || []) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(t.datum || "")) fehler.push(`${v.slug}: Datum "${t.datum}" muss JJJJ-MM-TT sein`);
    for (const k of ["von", "bis"]) if (t[k] && !/^\d{1,2}:\d{2}$/.test(t[k])) fehler.push(`${v.slug}: Uhrzeit "${t[k]}" muss HH:MM sein`);
  }
  if (v.bild && !fs.existsSync(path.join(SITE, v.bild))) fehler.push(`${v.slug}: Bild ${v.bild} gibt es nicht in site/`);
  if (v.beschreibung && !fs.existsSync(path.join(DIR, v.beschreibung))) fehler.push(`${v.slug}: Beschreibung termine/${v.beschreibung} fehlt`);
}
if (fehler.length) {
  console.error("Fehler in termine/termine.json:\n  - " + fehler.join("\n  - "));
  process.exit(1);
}

const kleinesBild = (v) => {
  if (v.bild_klein) return v.bild_klein;
  const k = v.bild.replace(/(\.[a-z]+)$/i, "-300x300$1");
  return fs.existsSync(path.join(SITE, k)) ? k : v.bild;
};

// Alle Einzeltermine, sortiert.
const alle = daten.veranstaltungen
  .flatMap((v) => v.termine.map((t) => ({ v, t })))
  .sort((a, b) => (a.t.datum + (a.t.von || "")).localeCompare(b.t.datum + (b.t.von || "")));
const kommend = alle.filter((x) => x.t.datum >= HEUTE);

// ---------- Vorlage für Detailseiten (einmalig aus der kopierten WordPress-Seite) ----------
function vorlageErstellen() {
  const quelle = path.join(SITE, "events", "after-work", "index.html");
  let h = fs.readFileSync(quelle, "utf8");
  const cut = (startMarker, endMarker, ersatz, endInclusive = true) => {
    const a = h.indexOf(startMarker);
    if (a < 0) throw new Error("Vorlage: nicht gefunden: " + startMarker.slice(0, 60));
    const b = h.indexOf(endMarker, a);
    if (b < 0) throw new Error("Vorlage: Ende nicht gefunden: " + endMarker.slice(0, 60));
    h = h.slice(0, a) + ersatz + h.slice(endInclusive ? b + endMarker.length : b);
  };
  // Kopf: Titel, Beschreibung, Social-Vorschau. Yoast-Schema (mit WordPress-Adressen) entfällt.
  h = h.replace(/<title>[\s\S]*?<\/title>/, "<title>{{TITEL}} - Coworking Eichsfeld e.V.</title>");
  h = h.replace(/<link rel="canonical" href="[^"]*" \/>/, '<link rel="canonical" href="{{URL}}" />\n\t<meta name="description" content="{{KURZ}}" />');
  h = h.replace(/<meta property="og:title" content="[^"]*" \/>/, '<meta property="og:title" content="{{TITEL}} - Coworking Eichsfeld e.V." />');
  h = h.replace(/<meta property="og:description" content="[^"]*" \/>/, '<meta property="og:description" content="{{KURZ}}" />');
  h = h.replace(/<meta property="og:url" content="[^"]*" \/>/, '<meta property="og:url" content="{{URL}}" />');
  h = h.replace(/<meta property="og:image" content="[^"]*" \/>/, '<meta property="og:image" content="{{BILD_ABS}}" />');
  h = h.replace(/\s*<meta property="(og:image:(width|height|type)|article:modified_time)" content="[^"]*" \/>/g, "");
  h = h.replace(/\s*<meta name="twitter:(label1|data1)" content="[^"]*" \/>/g, "");
  h = h.replace(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g, "");
  // Inhalt
  h = h.replace(/<span class="mec-current">[^<]*<\/span>/, '<span class="mec-current">{{TITEL}}</span>');
  h = h.replace(/(<div class="mec-events-event-image">\s*)<img[^>]*>/, '$1<img width="1350" height="1350" src="{{BILD}}" class="attachment-full size-full wp-post-image" alt="{{TITEL}}" />');
  h = h.replace(/<h1 class="mec-single-title">[^<]*<\/h1>/, '<h1 class="mec-single-title">{{TITEL}}</h1>');
  cut('<div class="mec-single-event-description mec-events-content">', "<!-- Custom Data Fields -->", '<div class="mec-single-event-description mec-events-content">\n{{HINWEIS}}{{BESCHREIBUNG}}\n</div>\n</div>\n', false);
  cut("<!-- Export Module -->", "<!-- Countdown module -->", "<!-- Export Module -->\n{{EXPORT}}\n", false);
  cut("<!-- Countdown module -->", "<!-- Hourly Schedule -->", "", false);
  cut('<div class="mec-single-event-date">', '<div class="mec-single-event-location">', "{{DATUM_ZEIT}}\n", false);
  cut('<div class="mec-single-event-location">', "<!-- Register Booking Button -->", "{{ORT}}\n", false);
  cut('<div class="mec-event-social mec-frontbox">', "<!-- Weather Module -->", "{{TEILEN}}\n", false);
  // Kommentarfunktion gibt es auf einer statischen Seite nicht.
  cut('<div id="comments" class="comments-area">', "</div><!-- #comments -->", "");
  // WordPress-Kennungen dieser einen Veranstaltung
  h = h.replace(/\bpostid-\d+\b/g, "").replace(/data-mec-postid="\d+"/g, "");
  h = h.replace(/"page_permalink":"[^"]*"/g, '"page_permalink":"{{URL}}"');
  if (/after-work|After Work/.test(h.replace(/AfterWork_2026[^"]*/g, ""))) {
    const rest = h.replace(/AfterWork_2026[^"]*/g, "").match(/[\s\S]{60}(after-work|After Work)[\s\S]{60}/);
    throw new Error("Vorlage enthält noch Reste der Quellseite: " + (rest && rest[0]));
  }
  fs.writeFileSync(VORLAGE, h);
  console.log("  Vorlage erstellt: termine/vorlage-detail.html");
}

// ---------- Bausteine ----------
const SHARE_SVG = `<svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="telegram" class="svg-inline--fa fa-telegram fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm121.8 169.9l-40.7 191.8c-3 13.6-11.1 16.9-22.4 10.5l-62-45.7-29.9 28.8c-3.3 3.3-6.1 6.1-12.5 6.1l4.4-63.1 114.9-103.8c5-4.4-1.1-6.9-7.7-2.5l-142 89.4-61.2-19.1c-13.3-4.2-13.6-13.3 2.8-19.7l239.1-92.2c11.1-4 20.8 2.7 17.2 19.5z"></path></svg>`;
function teilenLinks(v) {
  const u = encodeURIComponent(`${DOMAIN}/events/${v.slug}`);
  const t = esc(v.titel);
  const pop = (h, w) => `onclick="javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=${h},width=${w}'); return false;"`;
  return `<li class="mec-event-social-icon"><a class="facebook" href="https://www.facebook.com/sharer/sharer.php?u=${u}" ${pop(500, 600)} target="_blank" title="Auf Facebook teilen"><i class="mec-fa-facebook"></i></a></li><li class="mec-event-social-icon"><a class="twitter" href="https://twitter.com/share?url=${u}" ${pop(600, 500)} target="_blank" title="Tweet"><i class="mec-fa-twitter"></i></a></li><li class="mec-event-social-icon"><a class="linkedin" href="https://www.linkedin.com/shareArticle?mini=true&url=${u}" ${pop(600, 500)} target="_blank" title="LinkedIn"><i class="mec-fa-linkedin"></i></a></li><li class="mec-event-social-icon"><a class="whatsapp" href="https://api.whatsapp.com/send?text=${u}" target="_blank" title="Über WhatsApp teilen"><i class="mec-fa-whatsapp"></i></a></li><li class="mec-event-social-icon"><a class="telegram" href="https://telegram.me/share/url?url=${u}&text=${t}" target="_blank" title="Über Telegram teilen">${SHARE_SVG}</a></li><li class="mec-event-social-icon"><a class="email" href="mailto:?subject=${t}&body=${u}" title="E-Mail"><i class="mec-fa-envelope"></i></a></li>`;
}

function kachel({ v, t }) {
  const d = datumTeile(t.datum);
  const href = `/events/${v.slug}`;
  return `<div class="col-md-4 col-sm-4"><article class="mec-event-article mec-clear" itemscope>
<div class="event-grid-modern-head clearfix">
<div class="mec-event-date">${d.d}</div>
<div class="mec-event-month">${d.monat}</div>
<div class="mec-event-detail"><div class="mec-event-loc-place">${esc(v.ort || "")}</div></div>
<div class="mec-event-day">${d.tag}</div>
</div>
<div class="mec-event-content">
<h4 class="mec-event-title"><a class="mec-color-hover" href="${href}">${esc(v.titel)}</a></h4>
${v.adresse ? `<p class="mec-grid-event-location">${esc(v.adresse)}</p>` : ""}
</div>
<div class="mec-event-footer">
<a class="mec-booking-button" href="${href}">Details anzeigen</a>
<ul class="mec-event-sharing-wrap"><li class="mec-event-share"><a href="#" class="mec-event-share-icon"><i class="mec-sl-share" title="Share"></i></a></li><li><ul class="mec-event-sharing">${teilenLinks(v)}</ul></li></ul>
</div>
</article></div>`;
}

function startseite(html) {
  const A = "<!-- TERMINE:START -->", E = "<!-- TERMINE:ENDE -->";
  if (!html.includes(A)) {
    // Einmalig: den von WordPress erzeugten Kachelbereich mit Markierungen versehen.
    const a = html.indexOf('<div class="row"><div class="col-md-4 col-sm-4"><article');
    const endTag = "</article></div></div>";
    const b = html.lastIndexOf(endTag, html.indexOf("mec-skin-grid-no-events-container"));
    if (a < 0 || b < a) throw new Error("Startseite: Terminbereich nicht gefunden");
    html = html.slice(0, a) + A + E + html.slice(b + endTag.length);
  }
  const naechste = kommend.slice(0, 3);
  const inhalt = naechste.length
    ? `<div class="row">${naechste.map(kachel).join("\n")}</div>`
    : `<div class="row"><div class="col-md-12"><p class="ce-keine-termine">Gerade stehen keine Termine fest. Schau bald wieder vorbei!</p></div></div>`;
  return html.replace(new RegExp(`${A}[\\s\\S]*?${E}`), A + "\n" + inhalt + "\n" + E);
}

const LISTE_CSS = `<style id="ce-termine-style">.ce-termine{font-family:Poppins,sans-serif;color:#343434}.ce-termine .ce-monat{font-family:'Josefin Sans',sans-serif;font-size:22px;font-weight:600;color:#0c4d48;margin:32px 0 14px;padding-bottom:6px;border-bottom:2px solid #eee}.ce-termine .ce-monat:first-child{margin-top:0}.ce-termine article.ce-termin{display:flex;gap:20px;align-items:center;padding:14px;margin:0 0 14px;background:#fff;border:1px solid #eee;border-radius:4px}.ce-termine .ce-termin img{width:110px;height:110px;object-fit:cover;border-radius:3px;flex:none}.ce-termine .ce-termin .mec-event-date{font-size:14px;font-weight:600;color:#f75920;padding:0;margin:0;border:0;text-align:left;width:auto;float:none;background:none}.ce-termine .ce-termin .mec-event-time{font-size:13px;margin:2px 0 6px}.ce-termine .ce-termin h4.mec-event-title{font-size:18px;font-weight:600;margin:0 0 4px;line-height:1.3}.ce-termine .ce-termin h4 a{color:#0c4d48}.ce-termine .ce-termin .mec-event-loc-place{font-size:13px;color:#777}.ce-termine .ce-keine-termine{font-size:16px}@media (max-width:480px){.ce-termine article.ce-termin{gap:14px}.ce-termine .ce-termin img{width:80px;height:80px}}</style>`;

function veranstaltungsseite(html) {
  const A = "<!-- TERMINE:START -->", E = "<!-- TERMINE:ENDE -->";
  if (!html.includes(A)) {
    // Einmalig: den Monatskalender (lud seine Monate per WordPress-AJAX nach) durch Markierungen ersetzen.
    const a = html.indexOf('<div id="mec_skin_50" class="mec-wrap');
    const endTag = '<div class="mec-event-footer"></div>    </div>';
    const b = html.indexOf(endTag, a);
    if (a < 0 || b < 0) throw new Error("Veranstaltungsseite: Kalender nicht gefunden");
    html = html.slice(0, a) + A + E + html.slice(b + endTag.length);
  }
  let inhalt;
  if (!kommend.length) {
    inhalt = `<p class="ce-keine-termine">Gerade stehen keine Termine fest. Schau bald wieder vorbei!</p>`;
  } else {
    const teile = [];
    let monat = "";
    for (const x of kommend) {
      const d = datumTeile(x.t.datum);
      const m = `${d.monat} ${d.y}`;
      if (m !== monat) teile.push(`<h3 class="ce-monat">${m}</h3>`), (monat = m);
      const href = `/events/${x.v.slug}`;
      teile.push(`<article class="mec-event-article ce-termin"><a href="${href}"><img loading="lazy" decoding="async" width="300" height="300" src="${kleinesBild(x.v)}" alt="${esc(x.v.titel)}" /></a><div><div class="mec-event-date">${d.tag}, ${d.lang}</div><div class="mec-event-time mec-color"><i class="mec-sl-clock-o"></i> ${zeit(x.t)} Uhr</div><h4 class="mec-event-title"><a class="mec-color-hover" href="${href}">${esc(x.v.titel)}</a></h4>${x.v.ort ? `<div class="mec-event-detail"><div class="mec-event-loc-place">${esc(x.v.ort)}</div></div>` : ""}</div></article>`);
    }
    inhalt = teile.join("\n");
  }
  html = html.replace(new RegExp(`${A}[\\s\\S]*?${E}`), `${A}\n<div class="mec-wrap colorskin-custom ce-termine">\n${inhalt}\n</div>\n${E}`);
  html = html.replace(/<style id="ce-termine-style">[\s\S]*?<\/style>/, "");
  html = html.replace("</head>", LISTE_CSS + "</head>");
  return html;
}

function ics(v) {
  const z = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const jetzt = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const ev = v.termine.map((t) => [
    "BEGIN:VEVENT",
    `UID:${v.slug}-${t.datum}@coworking-eic.de`,
    `DTSTAMP:${jetzt}`,
    `DTSTART;TZID=Europe/Berlin:${kompakt(t.datum, t.von)}`,
    `DTEND;TZID=Europe/Berlin:${kompakt(t.datum, t.bis || t.von)}`,
    `SUMMARY:${z(v.titel)}`,
    v.adresse || v.ort ? `LOCATION:${z([v.ort, v.adresse].filter(Boolean).join(", "))}` : null,
    `URL:${DOMAIN}/events/${v.slug}`,
    "END:VEVENT",
  ].filter(Boolean).join("\r\n"));
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Coworking Eichsfeld e.V.//Termine//DE", "CALSCALE:GREGORIAN",
    "BEGIN:VTIMEZONE", "TZID:Europe/Berlin",
    "BEGIN:DAYLIGHT", "TZOFFSETFROM:+0100", "TZOFFSETTO:+0200", "TZNAME:CEST", "DTSTART:19700329T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU", "END:DAYLIGHT",
    "BEGIN:STANDARD", "TZOFFSETFROM:+0200", "TZOFFSETTO:+0100", "TZNAME:CET", "DTSTART:19701025T030000", "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU", "END:STANDARD",
    "END:VTIMEZONE", ...ev, "END:VCALENDAR", ""].join("\r\n");
}

function detailseite(v, vorlage) {
  const beschreibung = fs.readFileSync(path.join(DIR, v.beschreibung), "utf8").trim();
  const text = beschreibung.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  const kurz = v.kurz || (text.length > 300 ? text.slice(0, 297).replace(/\s\S*$/, "") + " …" : text);
  const zukunft = v.termine.filter((t) => t.datum >= HEUTE).sort((a, b) => a.datum.localeCompare(b.datum));
  const naechster = zukunft[0] || [...v.termine].sort((a, b) => b.datum.localeCompare(a.datum))[0];
  const nd = datumTeile(naechster.datum);
  const weitere = zukunft.slice(1, 7);

  const hinweis = zukunft.length ? "" : `<p class="wp-block-paragraph" style="background:#fff4ec;border-left:4px solid #f75920;padding:10px 14px"><strong>Diese Veranstaltung hat bereits stattgefunden.</strong> Aktuelle Termine findest du unter <a href="/veranstaltungen-coworking-eichsfeld">Veranstaltungen</a>.</p>\n`;
  const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(v.titel)}&dates=${kompakt(naechster.datum, naechster.von)}/${kompakt(naechster.datum, naechster.bis || naechster.von)}&ctz=Europe/Berlin&details=${encodeURIComponent(`${DOMAIN}/events/${v.slug}`)}${v.adresse ? `&location=${encodeURIComponent(v.adresse)}` : ""}`;
  const exportHtml = `<div class="mec-event-export-module mec-frontbox">
     <div class="mec-event-exporting">
        <div class="mec-export-details">
            <ul>
                <li><a class="mec-events-gcal mec-events-button mec-color mec-bg-color-hover mec-border-color" href="${esc(gcal)}" target="_blank" rel="noopener">+ Zu Google Kalender hinzufügen</a></li>                <li><a class="mec-events-gcal mec-events-button mec-color mec-bg-color-hover mec-border-color" href="/events/${v.slug}/termine.ics" download>+ iCal / Outlook export</a></li>            </ul>
        </div>
    </div>
</div>`;
  const datumZeit = `<div class="mec-single-event-date">
                <i class="mec-sl-calendar"></i>
                <h3 class="mec-date">${zukunft.length ? "Datum" : "Zuletzt am"}</h3>
                <dl>
                    <dd><abbr class="mec-events-abbr"><span class="mec-start-date-label" itemprop="startDate">${nd.tag}, ${nd.lang}</span></abbr></dd>
                </dl>
            </div>
            <div class="mec-single-event-time">
                <i class="mec-sl-clock " style=""></i>
                <h3 class="mec-time">Uhrzeit</h3>
                <i class="mec-time-comment"></i>
                <dl>
                    <dd><abbr class="mec-events-abbr">${zeit(naechster)} Uhr</abbr></dd>
                </dl>
            </div>${weitere.length ? `
            <div class="mec-single-event-date">
                <i class="mec-sl-calendar"></i>
                <h3 class="mec-date">Weitere Termine</h3>
                <dl>
${weitere.map((t) => `                    <dd><abbr class="mec-events-abbr">${datumTeile(t.datum).lang}, ${zeit(t)} Uhr</abbr></dd>`).join("\n")}
                </dl>
            </div>` : ""}`;
  const ort = v.ort || v.adresse ? `<div class="mec-single-event-location">
                <i class="mec-sl-location-pin"></i>
                <h3 class="mec-events-single-section-title mec-location">Veranstaltungsort</h3>
                <dl>
                    ${v.ort ? `<dd class="author fn org">${esc(v.ort)}</dd>` : ""}
                    ${v.adresse ? `<dd class="location"><address class="mec-events-address"><span class="mec-address">${esc(v.adresse)}</span></address></dd>` : ""}
                </dl>
            </div>` : "";
  const teilen = `<div class="mec-event-social mec-frontbox">
     <h3 class="mec-social-single mec-frontbox-title">Teile diese Veranstaltung</h3>
     <div class="mec-event-sharing">
        <div class="mec-links-details">
            <ul>
                ${teilenLinks(v)}            </ul>
        </div>
    </div>
</div>`;
  const werte = {
    TITEL: esc(v.titel),
    KURZ: esc(kurz),
    URL: `/events/${v.slug}`,
    BILD: v.bild,
    BILD_ABS: DOMAIN + v.bild,
    HINWEIS: hinweis,
    BESCHREIBUNG: beschreibung,
    EXPORT: exportHtml,
    DATUM_ZEIT: datumZeit,
    ORT: ort,
    TEILEN: teilen,
  };
  return vorlage.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => (k in werte ? werte[k] : m));
}

const weiterleitung = (ziel) => `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><title>Weiterleitung</title>
<meta http-equiv="refresh" content="0; url=${ziel}"><link rel="canonical" href="${ziel}"></head>
<body><p>Diese Seite ist umgezogen: <a href="${ziel}">${ziel}</a></p></body></html>
`;

// ---------- Ausführen ----------
const schreiben = (rel, inhalt) => {
  const f = path.join(SITE, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, inhalt);
};

if (!fs.existsSync(VORLAGE)) vorlageErstellen();
const vorlage = fs.readFileSync(VORLAGE, "utf8");

for (const v of daten.veranstaltungen) {
  schreiben(`events/${v.slug}/index.html`, detailseite(v, vorlage));
  schreiben(`events/${v.slug}/termine.ics`, ics(v));
}
for (const [von, nach] of Object.entries(daten.weiterleitungen || {})) {
  schreiben(path.join(von.replace(/^\//, ""), "index.html"), weiterleitung(nach));
}
const start = path.join(SITE, "index.html");
fs.writeFileSync(start, startseite(fs.readFileSync(start, "utf8")));
const vs = path.join(SITE, "veranstaltungen-coworking-eichsfeld", "index.html");
fs.writeFileSync(vs, veranstaltungsseite(fs.readFileSync(vs, "utf8")));

console.log(`Stand ${HEUTE}: ${daten.veranstaltungen.length} Veranstaltungen, ${kommend.length} kommende Termine.`);
for (const x of kommend.slice(0, 12)) console.log(`  ${x.t.datum}  ${zeit(x.t).padEnd(13)}  ${x.v.titel}`);
if (kommend.length > 12) console.log(`  … und ${kommend.length - 12} weitere`);
