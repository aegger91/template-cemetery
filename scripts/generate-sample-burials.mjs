// Generates fictional SAMPLE burial records for the template demo.
// Every person here is invented. Run: node scripts/generate-sample-burials.mjs
import { writeFileSync, readFileSync } from "node:fs";

const COUNT = 420;
let seed = 1907;
const rand = () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const int = (a, b) => a + Math.floor(rand() * (b - a + 1));

const ru = {
  male: [
    ["Иоанн", "Ioann", "John"], ["Пётр", "Petr", "Peter"], ["Николай", "Nikolai", "Nicholas"],
    ["Сергей", "Sergei", "Sergius"], ["Василий", "Vasilii", "Basil"], ["Михаил", "Mikhail", "Michael"],
    ["Алексей", "Aleksei", "Alexis"], ["Георгий", "Georgii", "George"], ["Димитрий", "Dimitrii", "Demetrius"],
    ["Феодор", "Feodor", "Theodore"], ["Павел", "Pavel", "Paul"], ["Андрей", "Andrei", "Andrew"],
    ["Константин", "Konstantin", "Constantine"], ["Григорий", "Grigorii", "Gregory"],
  ],
  female: [
    ["Мария", "Mariia", "Mary"], ["Анна", "Anna", "Anna"], ["Евдокия", "Evdokiia", "Eudokia"],
    ["Елена", "Elena", "Helen"], ["Ольга", "Olga", "Olga"], ["Татьяна", "Tatiana", "Tatiana"],
    ["Ксения", "Kseniia", "Xenia"], ["Нина", "Nina", "Nina"], ["Варвара", "Varvara", "Barbara"],
    ["Екатерина", "Ekaterina", "Catherine"], ["Наталия", "Nataliia", "Natalia"], ["София", "Sofiia", "Sophia"],
  ],
  patronymic: [
    ["Иванович", "Ivanovich", "Ивановна", "Ivanovna"], ["Петрович", "Petrovich", "Петровна", "Petrovna"],
    ["Николаевич", "Nikolaevich", "Николаевна", "Nikolaevna"], ["Сергеевич", "Sergeevich", "Сергеевна", "Sergeevna"],
    ["Васильевич", "Vasilevich", "Васильевна", "Vasilevna"], ["Михайлович", "Mikhailovich", "Михайловна", "Mikhailovna"],
    ["Алексеевич", "Alekseevich", "Алексеевна", "Alekseevna"], ["Георгиевич", "Georgievich", "Георгиевна", "Georgievna"],
    ["Фёдорович", "Fedorovich", "Фёдоровна", "Fedorovna"], ["Павлович", "Pavlovich", "Павловна", "Pavlovna"],
  ],
  family: [
    ["Примеров", "Primerov", "Примерова", "Primerova"], ["Образчиков", "Obrazchikov", "Образчикова", "Obrazchikova"],
    ["Тихонравов", "Tikhonravov", "Тихонравова", "Tikhonravova"], ["Сосновский", "Sosnovskii", "Сосновская", "Sosnovskaia"],
    ["Луговой", "Lugovoi", "Луговая", "Lugovaia"], ["Белозёров", "Belozerov", "Белозёрова", "Belozerova"],
    ["Ключарёв", "Kliucharev", "Ключарёва", "Kliuchareva"], ["Холмогоров", "Kholmogorov", "Холмогорова", "Kholmogorova"],
    ["Заречный", "Zarechnyi", "Заречная", "Zarechnaia"], ["Тополев", "Topolev", "Тополева", "Topoleva"],
    ["Звонарёв", "Zvonarev", "Звонарёва", "Zvonareva"], ["Березин", "Berezin", "Березина", "Berezina"],
  ],
};

const el = {
  male: [
    ["Γεώργιος", "Georgios", "George"], ["Δημήτριος", "Dimitrios", "Demetrius"], ["Ιωάννης", "Ioannis", "John"],
    ["Νικόλαος", "Nikolaos", "Nicholas"], ["Κωνσταντίνος", "Konstantinos", "Constantine"], ["Βασίλειος", "Vasileios", "Basil"],
    ["Αθανάσιος", "Athanasios", "Athanasius"], ["Παναγιώτης", "Panagiotis", null], ["Χαράλαμπος", "Charalampos", null],
    ["Σπυρίδων", "Spyridon", "Spiro"],
  ],
  female: [
    ["Μαρία", "Maria", "Mary"], ["Ελένη", "Eleni", "Helen"], ["Αικατερίνη", "Aikaterini", "Catherine"],
    ["Σοφία", "Sofia", "Sophia"], ["Παρασκευή", "Paraskevi", null], ["Ειρήνη", "Eirini", "Irene"],
    ["Αναστασία", "Anastasia", "Anastasia"], ["Βασιλική", "Vasiliki", null], ["Φωτεινή", "Foteini", "Fotini"],
    ["Θεοδώρα", "Theodora", "Theodora"],
  ],
  family: [
    ["Δειγματίδης", "Deigmatidis", "Δειγματίδου", "Deigmatidou"], ["Παραδειγματάς", "Paradeigmatas", "Παραδειγματά", "Paradeigmata"],
    ["Πευκάκης", "Pefkakis", "Πευκάκη", "Pefkaki"], ["Λιβαδίτης", "Livaditis", "Λιβαδίτου", "Livaditou"],
    ["Κυπαρισσίδης", "Kyparissidis", "Κυπαρισσίδου", "Kyparissidou"], ["Ορεινός", "Oreinos", "Ορεινού", "Oreinou"],
  ],
};

const ro = {
  male: ["Ion", "Vasile", "Gheorghe", "Constantin", "Nicolae", "Mihai", "Dumitru"],
  female: ["Maria", "Elena", "Ioana", "Ana", "Paraschiva", "Ecaterina"],
  family: ["Pildescu", "Mostreanu", "Brăduleanu", "Pădureanu", "Livadaru"],
};

const clergy = [
  { from: 1907, to: 1931, name: { en: "Archpriest Vasilii Primerov", ru: "Протоиерей Василий Примеров", el: "Πρωτοπρεσβύτερος Βασίλειος Πρίμεροφ" } },
  { from: 1931, to: 1962, name: { en: "Priest Georgii Kholmogorov", ru: "Иерей Георгий Холмогоров", el: "Ιερέας Γεώργιος Χολμογκόροφ" } },
  { from: 1962, to: 1995, name: { en: "Archpriest Dimitrios Deigmatidis", ru: "Протоиерей Димитрий Дейгматидис", el: "Πρωτοπρεσβύτερος Δημήτριος Δειγματίδης" } },
  { from: 1995, to: 2030, name: { en: "Priest Ioan Pildescu", ru: "Иерей Иоанн Пилдеску", el: "Ιερέας Ιωάννης Πίλντεσκου" } },
];
const deacons = [
  { from: 1950, to: 1990, name: { en: "Protodeacon Andrei Sosnovskii", ru: "Протодиакон Андрей Сосновский", el: "Πρωτοδιάκονος Ανδρέας Σοσνόφσκι" } },
  { from: 1990, to: 2030, name: { en: "Deacon Nikolaos Pefkakis", ru: "Диакон Николай Пефкакис", el: "Διάκονος Νικόλαος Πευκάκης" } },
];

const occupations = [
  { en: "a carpenter", ru: { m: "плотником", f: "плотником" }, el: "ξυλουργός" },
  { en: "a schoolteacher", ru: { m: "учителем", f: "учительницей" }, el: { m: "δάσκαλος", f: "δασκάλα" } },
  { en: "a baker", ru: { m: "пекарем", f: "пекарем" }, el: { m: "φούρναρης", f: "φουρνάρισσα" } },
  { en: "a nurse", ru: { m: "медбратом", f: "медсестрой" }, el: { m: "νοσηλευτής", f: "νοσηλεύτρια" } },
  { en: "a railway worker", ru: { m: "железнодорожником", f: "железнодорожницей" }, el: { m: "σιδηροδρομικός", f: "σιδηροδρομική υπάλληλος" } },
  { en: "a tailor", ru: { m: "портным", f: "портнихой" }, el: { m: "ράφτης", f: "μοδίστρα" } },
  { en: "a farmer", ru: { m: "фермером", f: "фермершей" }, el: { m: "αγρότης", f: "αγρότισσα" } },
  { en: "a bookkeeper", ru: { m: "бухгалтером", f: "бухгалтером" }, el: { m: "λογιστής", f: "λογίστρια" } },
];
const occ = (o, lang, g) => {
  const v = o[lang];
  return typeof v === "string" ? v : v[g];
};

function bio(given, givenLatin, g, arrived, o) {
  const choir = rand() < 0.5;
  return {
    en: `${givenLatin} settled in Exampleville in ${arrived} and worked for many years as ${o.en}. ${g === "m" ? "He" : "She"} ${choir ? "sang in the chapel choir and rarely missed a Saturday Panikhida" : "kept the family grave tidy every spring and brought lilac from the garden"}. This is a fictional sample record.`,
    ru: `${given} ${g === "m" ? "поселился" : "поселилась"} в Экзамплвилле в ${arrived} году и много лет ${g === "m" ? "работал" : "работала"} ${occ(o, "ru", g)}. ${choir ? `${g === "m" ? "Пел" : "Пела"} в хоре часовни и почти не пропускал${g === "m" ? "" : "а"} субботних панихид` : `Каждую весну ${g === "m" ? "приводил" : "приводила"} в порядок семейную могилу и ${g === "m" ? "приносил" : "приносила"} сирень из сада`}. Это вымышленная демонстрационная запись.`,
    el: `${g === "m" ? "Ο" : "Η"} ${given} εγκαταστάθηκε στο Έξαμπλβιλ το ${arrived} και εργάστηκε για πολλά χρόνια ως ${occ(o, "el", g)}. ${choir ? "Έψαλλε στη χορωδία του παρεκκλησίου και σπάνια έλειπε από το Μνημόσυνο του Σαββάτου" : `Κάθε άνοιξη φρόντιζε τον οικογενειακό τάφο και έφερνε πασχαλιές από τον κήπο`}. Πρόκειται για φανταστική εγγραφή-δείγμα.`,
  };
}

const sectionFor = (y) => {
  if (y < 1924) return "A";
  if (y < 1951) return rand() < 0.5 ? "A" : "B";
  if (y < 1978) return rand() < 0.45 ? "B" : "D";
  if (y < 2015) return rand() < 0.4 ? "D" : "E";
  return rand() < 0.5 ? "E" : "F";
};

const pad = (n) => String(n).padStart(2, "0");
function fmtDate(y, precise) {
  if (!precise) return String(y);
  return `${y}-${pad(int(1, 12))}-${pad(int(1, 28))}`;
}

const people = [];
for (let i = 0; i < COUNT; i++) {
  const r = rand();
  const origin = r < 0.55 ? "ru" : r < 0.85 ? "el" : "ro";
  const g = rand() < 0.5 ? "m" : "f";
  let ageRoll = rand();
  const age = ageRoll < 0.06 ? int(1, 25) : ageRoll < 0.2 ? int(26, 54) : int(55, 98);
  const reposedYear = int(1908, 2025);
  const bornYear = reposedYear - age;
  let name;
  if (origin === "ru") {
    const [gc, gl, ge] = pick(g === "m" ? ru.male : ru.female);
    const p = pick(ru.patronymic);
    const f = pick(ru.family);
    const pc = g === "m" ? p[0] : p[2], pl = g === "m" ? p[1] : p[3];
    const fc = g === "m" ? f[0] : f[2], fl = g === "m" ? f[1] : f[3];
    name = { script: "Cyrl", native: `${gc} ${pc} ${fc}`, latin: `${gl} ${pl} ${fl}`, variants: ge && ge !== gl ? [`${ge} ${fl}`] : [], given: gc, givenLatin: gl };
  } else if (origin === "el") {
    const [gc, gl, ge] = pick(g === "m" ? el.male : el.female);
    const f = pick(el.family);
    const fc = g === "m" ? f[0] : f[2], fl = g === "m" ? f[1] : f[3];
    name = { script: "Grek", native: `${gc} ${fc}`, latin: `${gl} ${fl}`, variants: ge && ge !== gl ? [`${ge} ${fl}`] : [], given: gc, givenLatin: gl };
  } else {
    const gn = pick(g === "m" ? ro.male : ro.female);
    let fam = pick(ro.family);
    name = { script: "Latn", native: `${gn} ${fam}`, latin: `${gn} ${fam}`, variants: [], given: gn, givenLatin: gn };
  }
  const precise = rand() < (reposedYear < 1940 ? 0.55 : 0.85);
  const rec = {
    id: "",
    sample: true,
    name: { script: name.script, native: name.native, latin: name.latin, variants: name.variants },
    gender: g,
    born: fmtDate(bornYear, precise && rand() < 0.9),
    reposed: fmtDate(reposedYear, precise),
    section: sectionFor(reposedYear),
    row: 0,
    plot: 0,
    marker: origin === "ru" ? (reposedYear < 1950 ? "slavic-wood" : "slavic-stone") : "byzantine-stone",
    photo: null,
  };
  if (age >= 40 && rand() < 0.32) {
    const arrived = Math.min(reposedYear - 10, bornYear + int(18, 30));
    const b = bio(name.given, name.givenLatin, g, arrived, pick(occupations));
    if (origin === "ru") rec.bio = { en: b.en, ru: b.ru };
    else if (origin === "el") rec.bio = { en: b.en, el: b.el };
    else rec.bio = { en: b.en };
  }
  const priest = clergy.find((c) => reposedYear >= c.from && reposedYear < c.to);
  rec.clergy = [{ name: priest.name, role: "funeral" }];
  const deacon = deacons.find((c) => reposedYear >= c.from && reposedYear < c.to);
  if (deacon && rand() < 0.5) rec.clergy.push({ name: deacon.name, role: "deacon" });
  people.push(rec);
}

const grounds = JSON.parse(readFileSync(new URL("../content/grounds.json", import.meta.url)));
const notable = JSON.parse(readFileSync(new URL("../content/burials/notable-sample.json", import.meta.url)));
const used = new Set(notable.records.map((r) => `${r.section}-${r.row}-${r.plot}`));
const cursor = {};
people.sort((a, b) => a.reposed.localeCompare(b.reposed));
for (const rec of people) {
  const s = grounds.sections.find((x) => x.id === rec.section);
  let n = cursor[s.id] ?? 0;
  let row, plot;
  do {
    row = Math.floor(n / s.plotsPerRow) + 1;
    plot = (n % s.plotsPerRow) + 1;
    n++;
  } while (used.has(`${s.id}-${row}-${plot}`));
  if (row > s.rows) throw new Error(`Section ${s.id} is full`);
  cursor[s.id] = n;
  used.add(`${s.id}-${row}-${plot}`);
  rec.row = row;
  rec.plot = plot;
}
people.forEach((p, i) => {
  p.id = `sample-${String(i + 1).padStart(4, "0")}`;
  delete p.gender;
});

writeFileSync(
  new URL("../content/burials/generated-sample.json", import.meta.url),
  JSON.stringify(
    {
      $schema: "../../schemas/burials.schema.json",
      dataset: { name: "Generated sample burials", sample: true, note: "Fictional people for demonstration only." },
      records: people.map(({ id, ...rest }) => ({ id, ...rest })),
    },
    null,
    1,
  ) + "\n",
);
console.log(`Wrote ${people.length} sample records`);
