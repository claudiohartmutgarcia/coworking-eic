// Zentrale Angaben, die auf mehreren Seiten vorkommen.
export const verein = {
  name: "Coworking Eichsfeld e.V.",
  slogan: "vernetzen, inspirieren, gemeinsam arbeiten",
  leitprinzip: "Einfach machen, könnte ja gut werden!",
  email: "hallo@coworking-eic.de",
  telefonZentral: "+49 3606 5085 476",
  buchung: "https://coworking-eichsfeld.cobot.me/",
};

export const social = [
  { name: "Instagram", url: "https://www.instagram.com/coworking_eichsfeld/" },
  { name: "Facebook", url: "https://www.facebook.com/coworkingeichsfeld" },
  { name: "LinkedIn", url: "https://www.linkedin.com/company/coworking-eichsfeld" },
];

export const navigation = [
  { titel: "Heiligenstadt", pfad: "/heiligenstadt" },
  { titel: "Leinefelde", pfad: "/leinefelde" },
  { titel: "Preise", pfad: "/preise" },
  { titel: "Veranstaltungen", pfad: "/veranstaltungen" },
  { titel: "Verein", pfad: "/der-verein" },
  { titel: "Kontakt", pfad: "/kontakt" },
];

export const mailto = (betreff?: string) =>
  `mailto:${verein.email}` + (betreff ? `?subject=${encodeURIComponent(betreff)}` : "");

export const tel = (nummer: string) => `tel:${nummer.replace(/\s/g, "")}`;
