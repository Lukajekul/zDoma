// Supportive medicines and exercises during systemic cancer treatment: docs/medicines.md and docs/rehab-content.md.
import type { Vaja, Zdravilo } from "../types";
import { vir } from "./vir";

const MASCC = "https://pmc.ncbi.nlm.nih.gov/articles/PMC10937211/";
const EMEND = "https://www.ema.europa.eu/en/documents/product-information/emend-epar-product-information_en.pdf";
const MSK = "https://www.mskcc.org/cancer-care/patient-education/managing-cancer-related-fatigue-exercise";

export const zdravilaOpomba =
  "Primeri podpornih zdravil veljajo za preprečevanje slabosti ob določenih režimih kemoterapije. Oddelek določi kombinacijo, čas v ciklu in trajanje glede na vrsto zdravljenja. Zdravila proti raku in drugi podporni režimi se prepišejo iz onkološkega načrta. Za klinično potrditev: onkološki protokol, datum cikla, ure in dnevi odmerjanja, interakcije (zlasti z aprepitantom), prilagoditve pri jetrni okvari in morebitno podvajanje že danih zdravil.";

export const zdravila: Zdravilo[] = [
  {
    ime: "Ondansetron",
    ucinkovina: "ondansetron",
    odmerki: ["8 mg"],
    nacin: "skozi usta",
    casi: ["zjutraj", "zvecer"],
    urnik: "Če je predpisano nadaljevanje doma, na 12 ur do največ 5 dni po zdravljenju po SmPC",
    zaKaj: "Pomaga preprečiti slabost in bruhanje po kemoterapiji.",
    kdaj: "Če je izbran ondansetron in je v načrtu predpisano domače nadaljevanje. Pri zmerni ali hudi jetrni okvari navedeni SmPC omejuje skupni dnevni odmerek na 8 mg.",
    vir: vir("MASCC/ESMO 2023; SmPC §4.2", MASCC),
  },
  {
    ime: "Emend",
    ucinkovina: "aprepitant",
    odmerki: ["125 mg 1. dan, 80 mg 2. in 3. dan"],
    nacin: "skozi usta",
    casi: ["zjutraj"],
    urnik: "Prvi dan eno uro pred kemoterapijo, drugi in tretji dan zjutraj pri enodnevni kemoterapiji",
    zaKaj: "Pomaga preprečiti slabost in bruhanje po kemoterapiji.",
    kdaj: "En tridnevni režim v kombinaciji z drugimi zdravili proti slabosti. Dve jakosti pripadata zaporednima deloma istega cikla, zato različne odmerke po dnevih bolničar vnese ročno.",
    vir: vir("MASCC/ESMO 2023; EMA §4.2", EMEND),
  },
  {
    ime: "Deksametazon",
    ucinkovina: "deksametazon",
    odmerki: ["8 mg"],
    nacin: "skozi usta",
    casi: ["zjutraj"],
    urnik: "Zjutraj na 2.–4. dan, če so ti dnevi predpisani",
    zaKaj: "Pomaga preprečiti slabost po kemoterapiji.",
    kdaj: "Primer nadaljevanja po zelo emetogeni kemoterapiji iz SmPC za Emend, v kombinaciji z aprepitantom. Smernica pri nekaterih režimih predvideva krajše jemanje.",
    vir: vir("MASCC/ESMO 2023; Emend, EMA §4.2", EMEND),
  },
];

export const vajeOpomba =
  "Onkološka ekipa potrdi primerno obremenitev in prilagoditve glede na zdravljenje in počutje. Pri vročini 38 °C ali več prekinite vadbo in pokličite svoj onkološki oddelek po odpustnih navodilih.";

export const vaje: Vaja[] = [
  {
    id: "rak-hoja",
    naslov: "Nežen sprehod",
    koraki: [
      "Izberite kratko, ravno pot doma ali zunaj.",
      "Hodite počasi, v tempu, v katerem lahko govorite.",
      "Počivajte, ko se utrudite. Sprehod lahko razdelite na krajše dele.",
    ],
    ponovitve: "Primer je 10 minut lahke hoje, skupaj ali v krajših delih glede na počutje in načrt.",
    slika: "/vaje/hoja.svg",
    slikaOpis: "Oseba dela sproščen korak po ravni podlagi. Vodoravna puščica kaže smer hoje.",
    vir: vir("Memorial Sloan Kettering, gibanje in utrujenost; American Cancer Society, gibanje med zdravljenjem", MSK),
  },
  {
    id: "rak-koleno-sede",
    naslov: "Dvig kolena na stolu",
    koraki: [
      "Sedite vzravnano na stabilen stol. Primite se za naslonjali za roke.",
      "Počasi dvignite eno koleno, kolikor vam je udobno. Ostanite vzravnani.",
      "Stopalo počasi spustite. Ponovite še z drugo nogo.",
    ],
    ponovitve: "5 dvigov na vsako nogo.",
    slika: "/vaje/koleno-sede.svg",
    slikaOpis: "Oseba sedi na stolu. Eno stopalo je na tleh, drugo koleno se pomakne navzgor.",
    vir: vir("Memorial Sloan Kettering, gibanje in utrujenost", MSK),
  },
  {
    id: "rak-stopala-sede",
    naslov: "Premikanje stopal sede",
    koraki: [
      "Sedite na stabilen stol in položite peti na tla.",
      "Prste povlecite proti sebi. Peti naj ostaneta na tleh.",
      "Spustite prste proti tlom. Premik ponovite počasi.",
    ],
    ponovitve: "10 ponovitev.",
    slika: "/vaje/stopala-sede.svg",
    slikaOpis: "Oseba sedi, peti sta na tleh, prsti se dvignejo proti sebi in vrnejo na tla.",
    vir: vir("Memorial Sloan Kettering, gibanje in utrujenost", MSK),
  },
];
