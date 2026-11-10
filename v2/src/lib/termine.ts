import { getCollection, type CollectionEntry } from "astro:content";

export type Veranstaltung = CollectionEntry<"veranstaltungen">;
export type Termin = Veranstaltung["data"]["termine"][number];

const MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const TAGE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

/** Heutiges Datum in Berlin als JJJJ-MM-TT (zum Zeitpunkt des Builds). */
export function heute(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function datum(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const wt = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return {
    jahr: y,
    tag: d,
    monat: MONATE[m - 1],
    monatKurz: MONATE[m - 1].slice(0, 3),
    wochentag: TAGE[wt],
    lang: `${TAGE[wt]}, ${d}. ${MONATE[m - 1]} ${y}`,
  };
}

export const uhrzeit = (t: Termin) => (t.bis ? `${t.von} – ${t.bis} Uhr` : `${t.von} Uhr`);

export async function alleVeranstaltungen() {
  return getCollection("veranstaltungen");
}

/** Alle kommenden Einzeltermine, sortiert. */
export async function kommendeTermine() {
  const h = heute();
  const alle = await alleVeranstaltungen();
  return alle
    .flatMap((v) => v.data.termine.map((t) => ({ v, t })))
    .filter((x) => x.t.datum >= h)
    .sort((a, b) => (a.t.datum + a.t.von.padStart(5, "0")).localeCompare(b.t.datum + b.t.von.padStart(5, "0")));
}

const kompakt = (iso: string, hhmm: string) => iso.replace(/-/g, "") + "T" + hhmm.replace(":", "").padStart(4, "0") + "00";

export function googleKalender(v: Veranstaltung, t: Termin, seite: string) {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: v.data.titel,
    dates: `${kompakt(t.datum, t.von)}/${kompakt(t.datum, t.bis ?? t.von)}`,
    ctz: "Europe/Berlin",
    details: seite,
  });
  if (v.data.adresse) p.set("location", v.data.adresse);
  return `https://calendar.google.com/calendar/render?${p}`;
}

const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function ics(v: Veranstaltung, seite: string) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const zeilen = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Coworking Eichsfeld e.V.//Veranstaltungen//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const t of v.data.termine) {
    zeilen.push(
      "BEGIN:VEVENT",
      `UID:${v.id}-${t.datum}@coworking-eic.de`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=Europe/Berlin:${kompakt(t.datum, t.von)}`,
      `DTEND;TZID=Europe/Berlin:${kompakt(t.datum, t.bis ?? t.von)}`,
      `SUMMARY:${icsText(v.data.titel)}`,
      `DESCRIPTION:${icsText(v.data.kurz + "\n" + seite)}`,
      `LOCATION:${icsText([v.data.ort, v.data.adresse].filter(Boolean).join(", "))}`,
      `URL:${seite}`,
      "END:VEVENT",
    );
  }
  zeilen.push("END:VCALENDAR");
  return zeilen.join("\r\n") + "\r\n";
}
