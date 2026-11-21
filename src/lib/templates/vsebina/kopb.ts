// Medicines and exercises for KOPB: docs/medicines.md and docs/rehab-content.md.
import type { Vaja, Zdravilo } from "../types";
import { vir } from "./vir";

const HSE = "https://www2.hse.ie/conditions/copd/learning-to-control-your-breathing/";

export const zdravilaOpomba =
  "Vzdrževalni inhalator se izbira po simptomih, poslabšanjih in drugih značilnostih (npr. eozinofilci, sočasna astma). Primer dvojnega in primer trojnega inhalatorja sta alternativi. Imeni in jakosti veljata za navedena pripomočka. Za klinično potrditev: prava naprava, tehnika vdihovanja, morebitni podaljšek, izbira vzdrževalnega inhalatorja in zapis navodil za olajševalec. Kratko kuro po poslabšanju prepišite s točnim predpisom in datumom konca.";

export const zdravila: Zdravilo[] = [
  {
    ime: "Anoro Ellipta",
    ucinkovina: "umeklidinij + vilanterol",
    odmerki: ["1 vdih (55/22 µg na vdih)"],
    nacin: "vdih iz inhalatorja",
    casi: ["zjutraj"],
    urnik: "Enkrat na dan ob istem času, npr. zjutraj",
    zaKaj: "Odpira dihalne poti, da lažje dihate čez dan.",
    kdaj: "Vzdrževalni dvojni bronhodilatator (LAMA/LABA).",
    vir: vir("GOLD 2026; EMA §4.1–4.2", "https://www.ema.europa.eu/en/documents/product-information/anoro-ellipta-epar-product-information_en.pdf"),
  },
  {
    ime: "Trimbow",
    ucinkovina: "beklometazondipropionat + formoterol + glikopironij",
    odmerki: ["2 vdiha (87/5/9 µg na vdih)"],
    nacin: "pršilo pod tlakom",
    casi: ["zjutraj", "zvecer"],
    urnik: "Zjutraj in zvečer",
    zaKaj: "Odpira dihalne poti in zmanjšuje vnetje v njih.",
    kdaj: "Vzdrževalna trojna kombinacija pri izbranih bolnikih. Izberite natančno predpisano napravo in jakost.",
    vir: vir("GOLD 2026; EMA §4.1–4.2", "https://www.ema.europa.eu/en/documents/product-information/trimbow-epar-product-information_en.pdf"),
  },
  {
    ime: "Ventolin Evohaler",
    ucinkovina: "salbutamol",
    odmerki: ["1 vdih (100 µg)", "2 vdiha (100 µg na vdih)"],
    nacin: "pršilo pod tlakom",
    casi: [],
    poPotrebi: true,
    urnik: "Po potrebi po osebnem načrtu",
    zaKaj: "Hitro odpre dihalne poti, ko težje dihate.",
    kdaj: "Kratkodelujoči inhalator. Predpis določi mejo in navodila za ukrepanje ob poslabšanju.",
    vir: vir("GOLD 2026; SmPC §4.2", "https://www.medicines.org.uk/emc/product/850/smpc"),
  },
  {
    ime: "Prednizolon",
    ucinkovina: "prednizolon",
    odmerki: ["30 mg"],
    nacin: "skozi usta",
    casi: ["zjutraj"],
    urnik: "Enkrat na dan ob predpisani uri. Pet dni skupaj z odmerki v bolnišnici.",
    zaKaj: "Med poslabšanjem zmanjša vnetje v dihalih.",
    kdaj: "V odpustni načrt sodi le preostanek predpisane kratke kure. GOLD navaja 40 mg v ekvivalentu prednizona na dan pet dni. Izbiro lokalnega režima potrdi zdravnik.",
    vir: vir("NICE NG115 §1.3.16; GOLD 2026, poglavje 4", "https://www.nice.org.uk/guidance/ng115/chapter/recommendations"),
  },
];

export const vajeOpomba =
  "Po poslabšanju dolžino hoje določi ekipa za pljučno rehabilitacijo. Dihalni vaji sta za učenje tehnike in obvladovanje običajne zadihanosti.";

export const vaje: Vaja[] = [
  {
    id: "kopb-izdih",
    naslov: "Počasen izdih skozi priprte ustnice",
    koraki: [
      "Sedite udobno. Sprostite vrat in ramena.",
      "Nežno vdihnite skozi nos, če lahko, in štejte do 2.",
      "Ustnice rahlo stisnite, kot pri žvižganju in nežno izdihnite, medtem ko štejete do 4.",
      "Nadaljujte v mirnem ritmu. Če se vam vrti, prekinite.",
    ],
    ponovitve: "Tehniko vadite štirikrat ali petkrat na dan, če vam je fizioterapevt priporočil to tehniko.",
    slika: "/vaje/ustnice.svg",
    slikaOpis: "Ob ustih je daljša puščica za počasni izdih. Krajša puščica ob nosu kaže vdih.",
    vir: vir("HSE, dihanje skozi priprte ustnice", HSE),
  },
  {
    id: "kopb-opora",
    naslov: "Odmor z oporo na kolenih",
    koraki: [
      "Sedite na stabilen stol. Stopali položite plosko na tla.",
      "Nagnite se malo naprej in komolca sproščeno naslonite na stegna.",
      "Sprostite ramena. Dihajte mirno in se osredotočite na sproščen izdih.",
    ],
    ponovitve: "En odmor po potrebi, dokler se običajna zadihanost ne umiri.",
    slika: "/vaje/opora-sede.svg",
    slikaOpis: "Oseba sedi, stopali sta na tleh. Zgornji del telesa je nagnjen naprej, komolca počivata na stegnih.",
    vir: vir("CUH, položaji za lažje dihanje; CUH, umirjanje dihanja", "https://www.cuh.nhs.uk/patient-information/leaflet-4-positions-to-ease-breathlessness/"),
  },
  {
    id: "kopb-hoja",
    naslov: "Hoja z odmori",
    koraki: [
      "Izberite ravno pot, kjer se lahko varno ustavite.",
      "Začnite počasi in dihajte sproščeno.",
      "Po potrebi se ustavite in počivajte. Ko se dihanje umiri, nadaljujte po svojem načrtu.",
    ],
    ponovitve: "V programu Kent je krajša možnost 10 minut hoje. Pri odpustu naj ekipa potrdi primeren čas in odmore.",
    slika: "/vaje/hoja.svg",
    slikaOpis: "Oseba dela sproščen korak po ravni podlagi. Vodoravna puščica kaže smer hoje.",
    vir: vir("Kent, program pljučne rehabilitacije doma; CUH, tehnike dihanja", "https://www.kentcht.nhs.uk/leaflet/home-pulmonary-rehabilitation-programme-2/"),
  },
];
