import type { ImageMetadata } from "astro";
import richard from "../assets/team/richard-arnold.jpg";
import sandra from "../assets/team/sandra-simon.jpg";
import claudio from "../assets/team/claudio-garcia.jpg";
import elisabeth from "../assets/team/elisabeth-arnold.jpg";
import johanna from "../assets/team/johanna-saenger.png";
import christian from "../assets/team/christian-simon.jpg";
import elena from "../assets/team/elena-garcia.jpg";
import alex from "../assets/team/alex-hupe.jpg";
import uwe from "../assets/team/uwe-schulze.jpg";
import manuel from "../assets/team/manuel-mock.jpg";

export const werte = [
  "Nachhaltigkeit",
  "Regionalität",
  "Toleranz",
  "Transparenz",
  "Feedbackkultur",
  "Ehrlichkeit",
  "Lösungen",
  "Pro Digitalisierung",
  "Spaß und positive Grundhaltung",
];

export type Mitglied = {
  name: string;
  rolle: string;
  foto: ImageMetadata;
  links: { titel: string; url: string }[];
  motivation: string[];
};

export const mitglieder: Mitglied[] = [
  {
    name: "Richard Arnold",
    rolle: "Gründer von Arnold IT-Consulting",
    foto: richard,
    links: [
      { titel: "LinkedIn", url: "https://www.linkedin.com/in/richard-arnold-a6684151/" },
      { titel: "Website", url: "https://arnold-it-consulting.com/" },
    ],
    motivation: [
      "Die Digitalisierung und neue Wege zu arbeiten bieten dem ländlichen Raum große Chancen. Es ist in vielen Berufen fast egal, ob ich aus Frankfurt, Berlin, München oder Leinefelde arbeite. Zusammen mit meinem Unternehmen Arnold IT-Consulting GmbH möchte ich dazu beitragen, ein Umfeld des Arbeitens zu schaffen, welches diese Entwicklung weiterhin fördert und mit dem ersten Coworking Space im Eichsfeld ein Zentrum der digitalen Arbeit, des Austausches und der Vernetzung untereinander bietet.",
    ],
  },
  {
    name: "Sandra Simon",
    rolle: "HR Managerin bei Ottobock",
    foto: sandra,
    links: [{ titel: "LinkedIn", url: "https://www.linkedin.com/in/sandra-simon-741b68112/" }],
    motivation: [
      "Als einstige Rückkehrerin ins Eichsfeld habe ich inzwischen Vieles in unserer Region zu schätzen gelernt. Dass es hier schon eine sehr aktive New Work Community gibt, zeigt, wie aufgeschlossen, mutig und engagiert die Menschen im Eichsfeld sind. „Einfach mal machen, könnte ja gut werden.“ – Getreu diesem Motto möchten wir den ersten Coworking Space im Eichsfeld aufbauen.",
      "Wir möchten einen Ort schaffen, an dem Menschen mit unterschiedlichem (beruflichen) Hintergrund zusammenkommen, sich austauschen, von- und miteinander lernen und so neue Ideen entstehen lassen können. Und ganz nebenbei: Für die „EichsfelderInnen in der Fremde“ kann nicht nur der Austausch bereichernd sein, sondern auch die Aussicht, am Freitag oder Montag im Coworking Space zu arbeiten und so den Wochenendbesuch in der Heimat um den einen oder anderen Tag zu verlängern.",
    ],
  },
  {
    name: "Claudio Garcia",
    rolle: "Gründer von 3Digity",
    foto: claudio,
    links: [
      { titel: "LinkedIn", url: "https://www.linkedin.com/in/claudio-hartmut-garcia/" },
      { titel: "Xing", url: "https://www.xing.com/profile/Claudio_Garcia12/cv" },
    ],
    motivation: [
      "Ich liebe Orte, an denen Menschen zusammenkommen und ihre Ideen umsetzen! Ich habe selbst in verschiedenen Städten das Konzept des Coworking kennengelernt und als ich zur Familie ins Eichsfeld gezogen bin, wurde mir klar, dass mir diese produktive und positive Atmosphäre fehlt. Mein Antrieb ist, mehr Menschen zu begeistern und unsere tolle Region weiter zu bereichern!",
    ],
  },
  {
    name: "Elisabeth Arnold",
    rolle: "Lehrerin an der KGS Bad Lauterberg",
    foto: elisabeth,
    links: [],
    motivation: [
      "Ich mag die Idee, die hinter dem Coworking Space Eichsfeld steht: gleichgesinnte Menschen treffen, die sich gern von anderen inspirieren lassen. Und wer weiß, vielleicht ergibt sich aus der gegenseitigen Motivation und Hilfe auch die Möglichkeit zu gemeinsamen Projekten.",
      "Das Eichsfeld gemeinsam kann so viel mehr als jeder Einzelne!",
    ],
  },
  {
    name: "Dr.-Ing. Johanna Sänger",
    rolle: "Postdoc an der Montanuniversität Leoben",
    foto: johanna,
    links: [{ titel: "LinkedIn", url: "https://www.linkedin.com/in/johanna-s%C3%A4nger-568838ba/" }],
    motivation: [
      "„Wann kommst du wieder zurück ins Eichsfeld?“ werde ich häufig gefragt. Eigentlich bin ich gar nicht mehr weg, (Corona sei Dank) bis zu 100 % Heimarbeit seitens der BAM. Ok, Forschung lässt sich nicht vollständig remote arrangieren und meistens fahre ich doch ganz gerne nach Berlin. Aber der Zwang ist weg, das jede Woche und in Vollzeit tun zu müssen.",
      "Die Zeit im Eichsfeld kann und möchte ich dafür umso besser nutzen. Für mich ist das Coworking neu und ich bin gespannt, das Potential auszuschöpfen, meine Work-Bike-Balance zu verbessern, immer wieder neue Eindrücke einzufangen und hoffentlich auch einen positiven Impuls in der Region zu setzen. Das Eichsfeld liegt mir am Herzen und darum freue ich mich umso mehr, mit meiner Arbeit, die eigentlich in Berlin stattfindet, auch hier zukunftsorientierte Projekte zu gestalten.",
    ],
  },
  {
    name: "Christian Simon",
    rolle: "Account Manager für die Automobilindustrie bei Microsoft",
    foto: christian,
    links: [{ titel: "LinkedIn", url: "https://www.linkedin.com/in/simon-microsoft/" }],
    motivation: [
      "Als Homeoffice-„Veteran“ war ich überrascht, wie inspirierend und vielseitig die Community im Eichsfeld schon ist, und dieser Community nun einen Raum im historischen Gebäude zu geben, motiviert mich, mich bei Coworking Eichsfeld einzubringen und zu investieren. Schon lange vor Corona war digitale Zusammenarbeit mein tägliches Brot. Nur zu Kundenbesuchen stieg ich ins Auto oder die Bahn.",
      "Seitdem auch das entfällt und wir uns daheim ein Arbeitszimmer teilen, stieg der Wunsch, ein modernes und cooles Arbeitsumfeld zu schaffen, in dem man auch mit echten Menschen zusammentrifft, sich austauscht, neue Ideen entwickelt und seinen Horizont permanent erweitert. Das ist Coworking Eichsfeld! Es gibt nichts Gutes, außer man tut es!",
    ],
  },
  {
    name: "Elena Garcia",
    rolle: "Projektmanagerin bei der Werra-Meißner Wirtschaftsförderung",
    foto: elena,
    links: [
      { titel: "LinkedIn", url: "https://www.linkedin.com/in/elopezort/?locale=de_DE" },
      { titel: "Xing", url: "https://www.xing.com/profile/Elena_Garcia89/cv" },
    ],
    motivation: [
      "Als ich das Coworking-Konzept entdeckt habe, hatte ich einen richtigen AHA-Moment und dachte: Das ist genau, was ich immer gesucht habe. Während meines Studiums in Costa Rica habe ich für ein Start-up gearbeitet und war immer im Homeoffice tätig. Das war zwar cool wegen der Flexibilität und weil ich Workation (ohne das Wort damals zu kennen) während der Ferien genießen konnte, aber generell war ich ziemlich alleine den ganzen Tag.",
      "Ich habe immer einen Ort gesucht, an dem ich in Ruhe arbeiten, mich aber auch mit anderen Personen treffen und Ideen austauschen konnte – am besten, wo ein bisschen Dynamik und Lebendigkeit herrscht. Als ich nach Deutschland gezogen bin, habe ich das erste Mal vom Coworking-Konzept gehört und das war ein Traum für mich. Dann sind wir ins Eichsfeld gezogen und ich fühlte dasselbe wie in Costa Rica … mir fehlte ein Coworking Space! Mit diesem Gefühl bin ich nicht alleine … daher bauen wir einen Ort auf.",
    ],
  },
  {
    name: "Alex Hupe",
    rolle: "Geschäftsführender Gesellschafter bei SportsZone GmbH",
    foto: alex,
    links: [{ titel: "LinkedIn", url: "https://www.linkedin.com/in/alexander-hupe-7b858019a/" }],
    motivation: [
      "Unsere Firma arbeitet ausschließlich remote, und so bin ich seit über 10 Jahren Vollzeit im Homeoffice tätig. Ich empfinde es als unschätzbaren Vorteil, meine Arbeitszeit selbst einteilen zu können. Ich mag den kurzen Arbeitsweg, ich mag es, bei schönem Wetter nachmittags eine Runde joggen zu gehen und dann dafür abends länger zu arbeiten.",
      "Doch wo Licht ist, ist bekanntlich auch Schatten: Im heimischen Büro lernt man schwer Gleichgesinnte aus der Region kennen. Weiterhin hat man keinen „neutralen“ Raum, um z. B. Geschäftspartner oder Kunden persönlich zu treffen. Da ist der Küchentisch nicht gerade die erste Wahl. Genau deshalb fand ich die Idee, im Eichsfeld einen Coworking Space aufzubauen, richtig gut. Und was soll ich sagen: Bereits in der Bauphase und während des Sommercoworkings habe ich so viele nette Menschen kennengelernt. Ich freu mich auf mehr!",
    ],
  },
  {
    name: "Uwe Schulze",
    rolle: "Unternehmensberater, Coach, Trainer bei uweSchulze.jetzt®",
    foto: uwe,
    links: [
      { titel: "LinkedIn", url: "https://www.linkedin.com/in/uweSchulze-digital/" },
      { titel: "Xing", url: "https://www.xing.com/profile/Uwe_Schulze59/" },
      { titel: "Website", url: "http://www.uweschulze.jetzt/" },
    ],
    motivation: [
      "„Die Coworking-Idee hat’s mir einfach angetan.“ Neben dem professionellen und ungezwungenen Miteinander und dem Teilen der Büroinfrastruktur begeistert mich besonders das Teilen von coolen Ideen und Informationen. Eine klasse Grundlage also für viele Gründer, Selbstständige und Unternehmen. Ich freue mich auf regelmäßige Events zu den Themen Netzwerk und persönliches Wachstum in einer flexiblen Umgebung.",
    ],
  },
  {
    name: "Manuel Mock",
    rolle: "Development Lead bei NANGA SYSTEMS",
    foto: manuel,
    // Auf der alten Seite zeigten Manuels Links versehentlich auf Elenas Profile – daher hier vorerst keine Links.
    links: [],
    motivation: [
      "In den letzten beiden Jahren hat sich viel geändert, vor allem wie und wo wir unserer Arbeit nachgehen können. Für viele ist es zur Routine geworden, von verschiedenen Orten zu arbeiten. Sei es zuhause oder eben in einem Coworking Space. Das Konzept eines Coworking Space war mir bereits vertraut von meinem Arbeitgeber in Stuttgart. Dieser setzt zu 100 % auf das Prinzip der freien Arbeitsplatzwahl.",
      "Als ich geplant habe, zurück ins Eichsfeld zu ziehen, spielte dies eine große Rolle. Ich wollte nicht nur im Homeoffice arbeiten, da hätte mir der Austausch gefehlt. Umso besser ist es nun, dass es auch hier einen Coworking Space gibt, den ich regelmäßig nutzen und dadurch auch andere „Gleichgesinnte“ kennenlernen kann. Und sind wir mal ehrlich, zuhause wäre ich nie auf die Idee gekommen, mir ein Laufband unter den Schreibtisch zu stellen. Ich bin gespannt, was für kreative Ideen und Projekte hier noch entstehen werden.",
    ],
  },
];
