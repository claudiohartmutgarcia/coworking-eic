// Macht die kopierte WordPress-Seite statisch: entfernt Verweise auf WordPress-Schnittstellen,
// die es ohne WordPress nicht mehr gibt, und ersetzt die Formulare durch Mail-Links.
// Kann beliebig oft laufen (ändert nur, was noch zu ändern ist).
//
//   node tools/aufraeumen.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(ROOT, "site");
const MAIL = "hallo@coworking-eic.de";

function pages(dir = SITE, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["_remake", "wp-content", "wp-includes", "wp-admin", "_ext"].includes(e.name)) continue;
      pages(p, out);
    } else if (e.name === "index.html") out.push(p);
  }
  return out;
}

const mailto = (subject, body = "") =>
  `mailto:${MAIL}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;

const MAIL_STYLE = `<style id="ce-mail-style">.ce-mail{font-family:Poppins,sans-serif;font-size:16px;line-height:1.7;color:#343434}.ce-mail p{margin:0 0 18px}.ce-mail a.ce-mail-button{display:inline-block;background:#0c4d48;color:#fff !important;padding:12px 24px;border-radius:3px;font-weight:500;text-decoration:none}.ce-mail a.ce-mail-button:hover{background:#f75920;color:#fff !important}.ce-mail .ce-mail-address a{color:#0c4d48;font-weight:500}</style>`;

// Ersetzt einen Contact-Form-7-Block (vom öffnenden <div class="wpcf7 ..."> bis zum Ende des Formulars).
function replaceCf7(html, formId, replacement) {
  const start = html.indexOf(`<div class="wpcf7 no-js" id="${formId}"`);
  if (start < 0) return html;
  const formEnd = html.indexOf("</form>", start);
  const divEnd = html.indexOf("</div>", formEnd);
  if (formEnd < 0 || divEnd < 0) return html;
  return html.slice(0, start) + replacement + html.slice(divEnd + "</div>".length);
}

const KONTAKT = `<div class="ce-mail">
<p>Du hast eine Frage, möchtest uns besuchen oder eine Veranstaltung bei uns machen? Schreib uns einfach eine E-Mail &ndash; ein Klick öffnet dein Mailprogramm.</p>
<p><a class="ce-mail-button" href="${mailto("Anfrage über coworking-eic.de", "Hallo Coworking Eichsfeld,\n\n")}">E-Mail schreiben</a></p>
<p class="ce-mail-address">oder direkt an <a href="mailto:${MAIL}">${MAIL}</a></p>
</div>`;

const VEREIN = `<div class="ce-mail">
<p>Schick uns dein ausgefülltes Mitgliedsformular (PDF) einfach per E-Mail. Ein Klick öffnet dein Mailprogramm &ndash; bitte das PDF als Anhang hinzufügen.</p>
<p><a class="ce-mail-button" href="${mailto("Mitgliedsantrag Coworking Eichsfeld e.V.", "Hallo Coworking Eichsfeld,\n\nanbei mein ausgefülltes Mitgliedsformular.\n\n")}">Mitgliedsformular per E-Mail senden</a></p>
<p class="ce-mail-address">an <a href="mailto:${MAIL}">${MAIL}</a></p>
</div>`;

const HEAD_JUNK = [
  // Vom Kopierwerkzeug (Remake) in jede Seite eingebaut: ein Skript, das Links und Formulare abfängt
  // und Seiten zurück zur alten WordPress-Seite schickt, plus "noindex" (Seite wäre für Google unsichtbar).
  /<script src="\/_remake\/runtime\.js"><\/script>/g,
  /<meta name="robots" content="noindex, nofollow">/g,
  /<link rel="alternate" type="application\/rss\+xml"[^>]*>\s*/g,
  /<link rel="alternate" title="oEmbed[^>]*>\s*/g,
  /<link rel="alternate" title="JSON"[^>]*>\s*/g,
  /<link rel="https:\/\/api\.w\.org\/"[^>]*>\s*/g,
  /<link rel="EditURI"[^>]*>\s*/g,
  /<link rel=['"]shortlink['"][^>]*>\s*/g,
  /<link rel="pingback"[^>]*>\s*/g,
  /<link rel=['"]stylesheet['"][^>]*href=['"]\/wp-admin\/admin-ajax\.php[^>]*>\s*/g,
  // Skript, das WordPress unter "/?<kennung>" ausliefert; ohne WordPress kommt dort nur HTML zurück.
  /<script id="[0-9a-f]{32}-js" src="\/\?[0-9a-f]{32}[^"]*"><\/script>\s*/g,
  // Auf der Live-Seite blockiert (403) und nie geladen: fehlerhafte Adresse mit eingebauten Anführungszeichen.
  /<script id="gdpr-cookie-consent-js" src="[^"]*%20async=[^"]*"><\/script>\s*/g,
  // Cookie-Banner: Die statische Seite setzt keine Cookies mehr (kein Google Analytics/Tag Manager).
  /<link rel='stylesheet' id='gdpr-cookie-consent-[^']*-css'[^>]*>\s*/g,
];

// Entfernt das HTML des Cookie-Banners (Hinweisleiste, Einstellungsdialog, "Cookie Einstellungen"-Knopf
// und dessen Inline-Style). Liefert das HTML unverändert zurück, wenn es den Banner nicht (mehr) gibt.
function removeCookieBanner(html) {
  const marker = html.indexOf('<div class="gdprmodal gdprfade" id="gdpr-popup"');
  if (marker < 0) return html;
  const start = html.lastIndexOf("\n", marker) + 1;
  const showAgain = html.indexOf('id="gdpr-cookie-consent-show-again"', marker);
  if (showAgain < 0) return html;
  let end = html.indexOf("</div>", showAgain) + "</div>".length;
  // Direkt danach folgt der Inline-Style des Banners.
  const style = html.slice(end).match(/^\s*<style>[^<]*gdpr_messagebar_detail[^<]*<\/style>/);
  if (style) end += style[0].length;
  return html.slice(0, start) + html.slice(end);
}

let changed = 0;
const vorlage = path.join(ROOT, "termine", "vorlage-detail.html");
for (const file of [...pages(), ...(fs.existsSync(vorlage) ? [vorlage] : [])]) {
  const rel = path.relative(SITE, file).replace(/\\/g, "/");
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  for (const re of HEAD_JUNK) html = html.replace(re, "");
  html = removeCookieBanner(html);
  if (rel === "kontakt/index.html") html = replaceCf7(html, "wpcf7-f121-p133-o1", KONTAKT);
  if (rel === "der-verein/index.html") html = replaceCf7(html, "wpcf7-f2105-p1925-o1", VEREIN);
  // Kaputter Datenschutz-Link im alten Formulartext (ohne https://), falls noch irgendwo vorhanden.
  html = html.replace(/href="www\.coworking-eic\.de\/Datenschutz"/g, 'href="/datenschutz"');
  // "/events" war das WordPress-Archiv des Kalenders; statisch gibt es dafür die Veranstaltungsseite.
  html = html.replace(/href="\/events"/g, 'href="/veranstaltungen-coworking-eichsfeld"');
  // WordPress leitete diese Adresse per 301 auf das Video um; statisch direkt auf die Datei verlinken.
  html = html.replace(/href="\/video_rein-in-den-space"/g, 'href="/wp-content/uploads/2022/08/Video_Rein-in-den-Space.mp4"');
  if (html.includes('class="ce-mail"') && !html.includes('id="ce-mail-style"')) html = html.replace("</head>", MAIL_STYLE + "</head>");
  if (html !== before) {
    fs.writeFileSync(file, html);
    changed++;
    console.log("  aufgeräumt:", rel);
  }
}
// Das Cookie-Plugin steckt auch in den zusammengefassten Skripten und meldet beim Laden jeder Seite
// per POST an /wp-admin/admin-ajax.php ("Zustimmung erneuern"). Ohne WordPress läuft das ins Leere (404).
const BUNDLES = path.join(SITE, "wp-content", "cache", "wpo-minify");
const jsFiles = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) jsFiles(p, out);
    else if (e.name.endsWith(".js")) out.push(p);
  }
  return out;
};
for (const file of [...jsFiles(BUNDLES), path.join(SITE, "wp-content", "plugins", "gdpr-cookie-consent", "public", "js", "gdpr-cookie-consent-public.min.js")]) {
  if (!fs.existsSync(file)) continue;
  const js = fs.readFileSync(file, "utf8");
  if (!js.includes("this.consent_renew_method(),")) continue;
  fs.writeFileSync(file, js.replace("this.consent_renew_method(),", ""));
  console.log("  Cookie-Meldung entfernt:", path.relative(SITE, file).replace(/\\/g, "/"));
}
// Arbeitsordner des Kopierwerkzeugs (Skript + aufgezeichnete Serverantworten) gehört nicht zur Website.
const remakeDir = path.join(SITE, "_remake");
if (fs.existsSync(remakeDir)) {
  fs.rmSync(remakeDir, { recursive: true, force: true });
  console.log("  entfernt: site/_remake/");
}
console.log(`${changed} Seite(n) geändert.`);
