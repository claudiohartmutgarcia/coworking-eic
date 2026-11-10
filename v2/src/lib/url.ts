// Interne Pfade mit dem Basis-Pfad versehen (z. B. /coworking-eic/v2/ in der Vorschau).
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function url(pfad: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(pfad)) return pfad;
  return BASE + "/" + pfad.replace(/^\//, "");
}
