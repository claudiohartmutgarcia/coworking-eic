import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Eine Markdown-Datei je Veranstaltung in src/content/veranstaltungen/.
// Vergangene Termine fallen beim nächsten Build automatisch weg.
const veranstaltungen = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/veranstaltungen" }),
  schema: ({ image }) =>
    z.object({
      titel: z.string(),
      kurz: z.string(),
      bild: image(),
      bildAlt: z.string().default(""),
      ort: z.string().default("Coworking Eichsfeld"),
      adresse: z.string().optional(),
      anmeldung: z.string().url().optional(),
      termine: z.array(
        z.object({
          datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Datum als JJJJ-MM-TT"),
          von: z.string().regex(/^\d{1,2}:\d{2}$/),
          bis: z.string().regex(/^\d{1,2}:\d{2}$/).optional(),
        }),
      ),
    }),
});

export const collections = { veranstaltungen };
