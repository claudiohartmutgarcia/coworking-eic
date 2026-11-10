// Schreibt die Pfade der Seite für einen Unterordner um, z. B. für GitHub Pages unter
// https://<konto>.github.io/<repo>/  ->  "/kontakt" wird "/<repo>/kontakt".
// Läuft NUR im GitHub-Workflow auf der Kopie, die veröffentlicht wird. site/ selbst bleibt
// unverändert, damit die Seite auf coworking-eic.de (ohne Unterordner) weiter funktioniert.
//
//   node tools/basis-pfad.mjs <ordner> <basis>     z. B.  node tools/basis-pfad.mjs site /coworking-eic
//
// Ist <basis> leer oder "/", passiert nichts (Seite liegt dann ohnehin in der Wurzel).
import fs from "node:fs";
import path from "node:path";

const DIR = path.resolve(process.argv[2] || "site");
const BASE = (process.argv[3] || "").replace(/\/+$/, "");
if (!BASE || BASE === "/") {
  console.log("Kein Unterordner - nichts umzuschreiben.");
  process.exit(0);
}
if (!/^\/[A-Za-z0-9._-]+$/.test(BASE)) throw new Error("Ungültige Basis: " + BASE);

// Erste Pfadteile, die es in der Wurzel der Seite gibt (Ordner wie "kontakt", "wp-content", "_ext" ...),
// plus Adressen, auf die Seiten verweisen, die es aber nicht als Ordner gibt.
const SEGMENTE = [
  ...fs.readdirSync(DIR, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name),
  "wp-json", "workation", "feed", "comments",
].filter((s) => s !== BASE.slice(1));
const seg = SEGMENTE.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");

// Ein Wurzelpfad beginnt direkt nach Anführungszeichen, "(", "=", Leerzeichen, Komma oder ";" (&quot;),
// optional JSON-maskiert ("\/wp-content\/..."). Externe Adressen (https://...) bleiben unberührt,
// weil dort vor dem "/" ein Buchstabe steht.
const PFAD = new RegExp(`(?<=["'(=\\s,;])(\\\\?)\\/(${seg})(?=[\\\\/"'?#)\\s,&;]|$)`, "g");
// Link auf die Startseite: href="/" bzw. href="/?..." / "/#..." (nur in HTML-Attributen).
const START = /\b(href|src|action|content|data-[\w-]+)=(["'])\/(?=\2|[?#])/g;
const START_JSON = /("(?:url|home_url|homeurl|siteurl|root|home)"\s*:\s*")\\\/(?=")/g;

function dateien(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) dateien(p, out);
    else if (/\.(html|css|js|json)$/i.test(e.name)) out.push(p);
  }
  return out;
}

let geaendert = 0, treffer = 0;
for (const file of dateien(DIR)) {
  const alt = fs.readFileSync(file, "utf8");
  let neu = alt.replace(PFAD, (_m, esc, s) => {
    treffer++;
    return esc ? `\\${BASE.replace(/\//g, "\\/")}\\/${s}` : `${BASE}/${s}`;
  });
  if (file.endsWith(".html")) {
    neu = neu.replace(START, (_m, attr, q) => (treffer++, `${attr}=${q}${BASE}/`));
    neu = neu.replace(START_JSON, (_m, k) => (treffer++, `${k}${BASE.replace(/\//g, "\\/")}\\/`));
  }
  if (neu !== alt) {
    fs.writeFileSync(file, neu);
    geaendert++;
  }
}
console.log(`${treffer} Pfade in ${geaendert} Dateien auf ${BASE}/ umgeschrieben.`);
