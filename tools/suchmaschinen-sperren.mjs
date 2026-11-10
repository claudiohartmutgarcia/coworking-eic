// Sperrt die Vorschau auf GitHub Pages für Suchmaschinen, solange coworking-eic.de noch auf WordPress läuft.
// Läuft NUR im GitHub-Workflow (.github/workflows/pages.yml) auf der Kopie, die veröffentlicht wird.
// Die Dateien in site/ bleiben unverändert; für den echten Umzug einfach site/ hochladen.
//
//   node tools/suchmaschinen-sperren.mjs [ordner]   (Standard: site)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.resolve(process.argv[2] || path.join(ROOT, "site"));
const META = '<meta name="robots" content="noindex, nofollow" data-vorschau="github-pages">';

function pages(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["wp-content", "wp-includes", "wp-admin", "_ext"].includes(e.name)) continue;
      pages(p, out);
    } else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

let n = 0;
for (const file of pages(SITE)) {
  const html = fs.readFileSync(file, "utf8");
  if (html.includes('data-vorschau="github-pages"')) continue;
  const m = html.match(/<head[^>]*>/i);
  if (!m) throw new Error("Kein <head> in " + file);
  fs.writeFileSync(file, html.replace(m[0], m[0] + META));
  n++;
}
fs.writeFileSync(path.join(SITE, "robots.txt"), "# Vorschau auf GitHub Pages – nicht indexieren.\nUser-agent: *\nDisallow:\n");
console.log(`${n} Seite(n) für Suchmaschinen gesperrt (noindex).`);
