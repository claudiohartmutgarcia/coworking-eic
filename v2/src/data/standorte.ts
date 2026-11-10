import type { ImageMetadata } from "astro";
import hig from "../assets/bilder/space-heiligenstadt.jpg";
import higArbeitsplaetze from "../assets/bilder/arbeitsplaetze.jpg";
import higKueche from "../assets/bilder/kueche.jpg";
import higMeeting from "../assets/bilder/meetingraum-heiligenstadt.jpg";
import higMeeting2 from "../assets/bilder/meetingraum-heiligenstadt-2.jpg";
import higGrundriss from "../assets/bilder/grundriss-heiligenstadt.png";
import lef from "../assets/bilder/meetingraum-leinefelde.jpg";
import lefAussen from "../assets/bilder/leinefelde-aussen.jpg";
import lefInnen from "../assets/bilder/leinefelde-innen.jpg";
import christian from "../assets/team/christian-simon.jpg";
import richard from "../assets/team/richard-arnold.jpg";

const COBOT = "https://coworking-eichsfeld.cobot.me/";
const plan = (id: string) => `${COBOT}membership_signup/new?plan_id=${id}`;

export type Tarif = {
  name: string;
  umfang: string;
  preis?: number; // netto in Euro
  preisText?: string; // wenn es keinen festen Preis gibt
  einheit?: string;
  text: string;
  link: string; // Buchungslink oder "anfrage"
  hervorgehoben?: boolean;
};

export type Standort = {
  slug: "heiligenstadt" | "leinefelde";
  name: string;
  untertitel: string;
  adresse: string;
  telefon: string;
  ansprechpartner: { name: string; foto: ImageMetadata };
  bild: ImageMetadata;
  video: string;
  intro: string;
  raumTitel: string;
  raumText: string[];
  raumBilder: { src: ImageMetadata; alt: string }[];
  grundriss?: { src: ImageMetadata; text: string };
  extraLink?: { titel: string; url: string };
  tarife: Tarif[];
  meetingraum: { preis: number; personen: number; bild: ImageMetadata };
  ganzerSpace: boolean;
  ausstattung: string[];
};

const intro =
  "Die Plätze im Coworking Space lassen sich flexibel anmieten. Alle Personen können mit ihrem Ticket die Infrastruktur wie WLAN, Drucker, Telefonbox, Gemeinschaftsküche und Sanitäranlagen nach Bedarf nutzen. Wer gerne einen eigenen Arbeitsplatz mit Abschließmöglichkeit nutzen möchte, kann bei uns auch einen festen Arbeitsplatz mieten. Bei Fragen oder Anregungen kommt gerne auf uns zu!";

const gemeinsameTarife = (ids: { fest: string; flex: string; mini: string; zehner: string }): Tarif[] => [
  {
    name: "Fester Arbeitsplatz",
    umfang: "Einen ganzen Monat Zugang",
    preis: 225,
    einheit: "Monat",
    text: "Für alle, die regelmäßig an ihren eigenen Tisch kommen und Unterlagen dort sicher (mit eigenem Schlüssel) aufbewahren möchten.",
    link: plan(ids.fest),
  },
  {
    name: "Flexibler Arbeitsplatz",
    umfang: "Einen ganzen Monat Zugang",
    preis: 165,
    einheit: "Monat",
    text: "Ideal für alle, die häufiger mal im Space vorbeischauen möchten. Man kommt vorbei und setzt sich hin, wo Platz ist!",
    link: plan(ids.flex),
    hervorgehoben: true,
  },
  {
    name: "10er-Karte",
    umfang: "Flexibel 10 Tage im Monat",
    preis: 110,
    einheit: "Monat",
    text: "Besser 2× die Woche raus aus der Routine? Dann ist dieses Ticket für dich.",
    link: plan(ids.zehner),
  },
  {
    name: "Mini-Coworking",
    umfang: "Flexibel 5 Tage im Monat",
    preis: 60,
    einheit: "Monat",
    text: "Für alle, die einmal die Woche raus aus der Routine und am coolsten Arbeitsort im Eichsfeld arbeiten möchten.",
    link: plan(ids.mini),
  },
  {
    name: "Tageskarte",
    umfang: "von 8 bis 18 Uhr",
    preis: 15,
    einheit: "Tag",
    text: "Für digitale Nomaden, die heute hier, morgen da und übermorgen zu Hause arbeiten.",
    link: COBOT,
  },
];

export const standorte: Standort[] = [
  {
    slug: "heiligenstadt",
    name: "Heiligenstadt",
    untertitel: "Industrieloft mitten in Heilbad Heiligenstadt",
    adresse: "Windische Gasse 11A, 37308 Heilbad Heiligenstadt",
    telefon: "+49 3606 5075 500",
    ansprechpartner: { name: "Christian Simon", foto: christian },
    bild: hig,
    video: "videos/heiligenstadt.mp4",
    intro,
    raumTitel: "Unser Raum, dein Coworking Space",
    raumText: [
      "An der Fensterfront sind die Arbeitsplätze, sodass man bei Tageslicht konzentriert seine Aufgaben erledigen kann. Im mittleren Bereich befindet sich der große Meetingraum sowie die Küche und ein Aufenthaltsbereich. In der hinteren Ecke gibt es ein kleines Büro, das wir als Rückzugsort sowie für vertrauliche Telefonate und Videokonferenzen reserviert haben. Auf der Empore kann man es sich gemütlich machen.",
    ],
    raumBilder: [
      { src: higArbeitsplaetze, alt: "Das historische Gebäude des Coworking Space in Heiligenstadt" },
      { src: higKueche, alt: "Arbeitsbereich mit Empore" },
      { src: higMeeting2, alt: "Besprechungstisch mit bunten Stühlen" },
    ],
    grundriss: {
      src: higGrundriss,
      text: "Es gibt zwei Eingänge: den Haupteingang auf der linken Seite (von der Wilhelmstraße kommend über den Parkplatz) sowie den Eingang über den Fahrstuhl (von der Windischen Gasse kommend, barrierefrei über den Parkplatz zu erreichen).",
    },
    tarife: gemeinsameTarife({
      fest: "b7d909ca7bead6e0dbc94b9181f05dac",
      flex: "b7d909ca7bead6e0dbc94b9181f051ca",
      mini: "6e72e7b1433336b57c26c27c3e0ea396",
      zehner: "17629defc65261556f89f710e95e7d1f",
    }),
    meetingraum: { preis: 20, personen: 8, bild: higMeeting },
    ganzerSpace: true,
    ausstattung: [
      "250 MBit/s Highspeed-Internet",
      "Großer Arbeitsplatz mit Lampe, ergonomischem Stuhl und einer Pflanze",
      "Großer Küchenbereich zum gemeinsamen Mittagessen oder Feierabend",
      "Meetingraum für Gruppen bis zu 8 Personen",
      "Kleiner Meetingraum für bis zu 3 Personen, auch als privates Büro nutzbar",
      "Drucker und Scanner",
      "Dusche und Fahrradständer",
      "Ökostrom",
      "Barrierearm (Fahrstuhl vorhanden)",
      "Loungeterrasse und Schaukel zum Entspannen",
      "Ein Laufband, damit nicht nur dein Gehirn trainiert wird",
      "Lokales und überregionales Netzwerk",
      "Unterstützung im Gründungsprozess über ThEx, IHK und lokale Akteure",
    ],
  },
  {
    slug: "leinefelde",
    name: "Leinefelde",
    untertitel: "Unser TechHub direkt am Mertens Teich",
    adresse: "Birkunger Str. 20, 37327 Leinefelde-Worbis",
    telefon: "+49 3606 5084 969",
    ansprechpartner: { name: "Richard Arnold", foto: richard },
    bild: lef,
    video: "videos/leinefelde.mp4",
    intro,
    raumTitel: "Leinefelde – unser TechHub",
    raumText: [
      "Unser Coworking Space befindet sich in Leinefelde in unmittelbarer Nähe zu Mertens Teich und verfügt über einen Außenbereich, der zu kreativen Pausen anregt. Unser Nachbar ist das aufstrebende Tech-Startup PACETEQ, Innovator und Softwareanbieter im Motorsport.",
      "Durch diese einzigartige Umgebung bieten wir Techies und kreativen Köpfen einen idealen Ort, um sich zu vernetzen, Ideen auszutauschen und gemeinsam innovative Projekte zu realisieren. Willkommen in unserem Coworking Space, wo Technologie und Natur aufeinandertreffen.",
    ],
    raumBilder: [
      { src: lefInnen, alt: "Arbeitsbereich in Leinefelde" },
      { src: lefAussen, alt: "Gebäude des Coworking Space in Leinefelde" },
    ],
    extraLink: { titel: "Zu PACETEQ", url: "https://www.paceteq.com/" },
    tarife: [
      ...gemeinsameTarife({
        fest: "cb22858bc0b3ed03785c8674ac775f27",
        flex: "cb22858bc0b3ed03785c8674ac7787a3",
        mini: "e8c6d83f69630baeda5b7eb50a3f677d",
        zehner: "cb22858bc0b3ed03785c8674ac774aa8",
      }),
      {
        name: "Einzelbüro",
        umfang: "Dein Raum in Leinefelde",
        preisText: "auf Anfrage",
        text: "Begrenzte Verfügbarkeit im Ökosystem des Standorts LIV!",
        link: "anfrage",
      },
    ],
    meetingraum: { preis: 35, personen: 10, bild: lef },
    ganzerSpace: false,
    ausstattung: [
      "250 MBit/s Highspeed-Internet",
      "Großer Arbeitsplatz mit Lampe, ergonomischem Stuhl und einer Pflanze",
      "Kleine Räume mit ausreichend Platz und schönem Ausblick",
      "Meetingraum für Gruppen bis zu 10 Personen",
      "Gastroangebot mit Teichblick direkt vor der Tür",
      "Gemeinschaftliche Teeküche",
      "Dusche und Fahrradständer",
      "Outdoor-Sitzmöglichkeiten",
      "Barrierearm",
      "Der Tech-Space in Leinefelde und Umgebung",
      "Nähe zur Natur",
      "Lokales und überregionales Netzwerk",
      "Unterstützung im Gründungsprozess über ThEx, IHK und lokale Akteure",
    ],
  },
];

export const zusatz = [
  {
    name: "Vereinsmitgliedschaft",
    preis: "5 € im Monat",
    hinweis: "60 € im Jahr",
    text: "Werde Teil des Vereins und schick uns eine Mail! Wir freuen uns über Unterstützung.",
    link: "/der-verein",
    linkText: "Zur Mitgliedschaft",
  },
  {
    name: "Studi-Ticket",
    preis: "auf Anfrage",
    hinweis: "für Schüler:innen, Studierende und Azubis",
    text: "Möchtest du an einem coolen Ort lernen und/oder arbeiten? Sag uns, was du brauchst.",
    link: "anfrage",
    linkText: "Anfragen",
  },
  {
    name: "Gutscheine",
    preis: "auf Anfrage",
    hinweis: "von Tages- bis Monatskarte",
    text: "Für Freunde und Familie, aber auch als zusätzliche Leistung als Arbeitgeber.",
    link: "anfrage",
    linkText: "Anfragen",
  },
  {
    name: "Workation",
    preis: "Rabatt nach Anzahl der Tage",
    hinweis: "flexibel nach Bedarf",
    text: "Raus aus der Routine? Arbeit und Urlaub verbinden, mit Einheimischen in Kontakt kommen und die Region kennenlernen. Wir helfen dir bei der Suche nach einer Übernachtung.",
    link: "anfrage",
    linkText: "Anfragen",
  },
];
