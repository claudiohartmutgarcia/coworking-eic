// Prüft, ob jeder interne Link und jede eingebundene Datei der Seiten in site/ vorhanden ist.
//
//   node tools/links-pruefen.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(ROOT, "site");
const SKIP = new Set(["_remake", "wp-content", "wp-includes", "wp-admin", "_ext"]);

const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP.has(e.name)) walk(p);
    } else if (e.name === "index.html") pages.push(p);
  }
})(SITE);

const exists = (rel) => {
  const p = path.join(SITE, rel);
  return (fs.existsSync(p) && fs.statSync(p).isFile()) || fs.existsSync(path.join(p, "index.html"));
};

const missing = new Map();
for (const file of pages) {
  const html = fs.readFileSync(file, "utf8");
  for (const m of html.matchAll(/(?:href|src)=["'](\/[^"'#]*)["']/g)) {
    const url = m[1].replace(/&#0?38;|&amp;/g, "&").split("?")[0];
    if (url.startsWith("//")) continue; // fremde Domain ohne Protokoll
    let rel;
    try {
      rel = decodeURIComponent(url);
    } catch {
      rel = url;
    }
    if (!exists(rel)) {
      if (!missing.has(url)) missing.set(url, new Set());
      missing.get(url).add(path.relative(SITE, file).replace(/\\/g, "/"));
    }
  }
}

if (!missing.size) console.log(`Alle internen Verweise in ${pages.length} Seiten gefunden.`);
else {
  console.log(`${missing.size} fehlende Ziele:`);
  for (const [url, from] of missing) console.log(`  ${url}  <-  ${[...from].slice(0, 3).join(", ")}${from.size > 3 ? " …" : ""}`);
  process.exitCode = 1;
}
