// @ts-check
import { defineConfig } from "astro/config";

// SITE, BASE und NOINDEX setzt der GitHub-Workflow für die Vorschau unter /coworking-eic/v2/.
// Für coworking-eic.de selbst bleiben die Standardwerte.
const base = process.env.BASE ?? "/";
const mitBasis = (pfad) => base.replace(/\/$/, "") + pfad;

// Alte Adressen der WordPress-Seite leiten auf die neuen weiter.
const alt = {
  "/unsere-community": "/der-verein",
  "/veranstaltungen-coworking-eichsfeld": "/veranstaltungen",
  "/events": "/veranstaltungen",
  "/events/after-work": "/veranstaltungen/after-work",
  "/events/after-work-954": "/veranstaltungen/after-work",
  "/events/thex-sprechtag-794": "/veranstaltungen/thex-sprechtag",
  "/events/digi-kidz-programmieren-tuefteln-und-entdecken": "/veranstaltungen/digikidz-programmieren",
};

export default defineConfig({
  site: process.env.SITE ?? "https://www.coworking-eic.de",
  base,
  trailingSlash: "ignore",
  build: { format: "directory" },
  redirects: Object.fromEntries(Object.entries(alt).map(([von, nach]) => [von, mitBasis(nach)])),
});
