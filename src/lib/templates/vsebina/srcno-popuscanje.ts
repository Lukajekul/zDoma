// Medicines and exercises for srčno popuščanje: docs/medicines.md and docs/rehab-content.md.
import type { Vaja, Zdravilo } from "../types";
import { vir } from "./vir";

const BISOPROLOL = "https://www.medicines.org.uk/emc/product/14907/smpc";

export const zdravilaOpomba =
  "Prikazane odmerke zdravil, ki vplivajo na potek bolezni, vežemo na srčno popuščanje z zmanjšanim iztisnim deležem (HFrEF). Dapagliflozin ima širšo indikacijo. Furosemid je namenjen bolnikom z zastajanjem tekočine. Za klinično potrditev: ustreznost glede na iztisni delež, tlak, utrip, kalij in ledvično funkcijo ter načrt spremljanja po odpustu; zamenjava zaviralca ACE z zdravilom Entresto; navodila o dapagliflozinu med akutno boleznijo ali ob posegu.";

export const zdravila: Zdravilo[] = [
  {
    ime: "Lasix",
    ucinkovina: "furosemid",
    odmerki: ["40 mg", "80 mg"],
    nacin: "skozi usta",
    casi: ["zjutraj"],
    urnik: "Zjutraj, na tešče",
    zaKaj: "Odvaja odvečno vodo in zmanjša otekanje.",
    kdaj: "Zastajanje tekočine. Prikazana sta primera vzdrževalnih odmerkov zdravila Lasix. Odmerek določi bolničar po odpustnem načrtu.",
    vir: vir("Lasix, CBZ §4.2", "https://www.cbz.si/zzzs/pao/bazazdr2.nsf/o/582412352E8F356CC12579C2003F58F2/%24File/s-029216.pdf"),
  },
  {
    ime: "Entresto",
    ucinkovina: "sakubitril + valsartan",
    odmerki: ["24/26 mg", "49/51 mg", "97/103 mg"],
    nacin: "skozi usta",
    casi: ["zjutraj", "zvecer"],
    urnik: "Zjutraj in zvečer",
    zaKaj: "Srcu olajša črpanje krvi.",
    kdaj: "Simptomatsko kronično HFrEF. Ni sočasno z zaviralcem ACE ali drugim sartanom. Pred uvedbo po zaviralcu ACE je potreben najmanj 36-urni premor.",
    vir: vir("EMA §4.2–4.3", "https://www.ema.europa.eu/en/documents/product-information/entresto-epar-product-information_en.pdf"),
  },
  {
    ime: "Bisoprolol",
    ucinkovina: "bisoprolol",
    odmerki: ["1,25 mg", "2,5 mg", "5 mg", "10 mg"],
    nacin: "skozi usta",
    casi: ["zjutraj"],
    urnik: "Zjutraj",
    zaKaj: "Upočasni utrip, da srce dela z manj napora.",
    kdaj: "Stabilno HFrEF. Izbor za prikaz že določenega odmerka. Celotno zaporedje postopnega prilagajanja je v SmPC.",
    vir: vir("Bisoprolol, SmPC §4.2", BISOPROLOL),
  },
  {
    ime: "Aldactone",
    ucinkovina: "spironolakton",
    odmerki: ["25 mg", "50 mg"],
    nacin: "skozi usta",
    casi: ["zjutraj"],
    urnik: "Zjutraj, z obrokom",
    zaKaj: "Pomaga odvajati odvečno vodo in razbremeni srce.",
    kdaj: "50 mg pride v poštev po prenašanju 25 mg in po klinični presoji. Potrebno je spremljanje kalija in delovanja ledvic.",
    vir: vir("Aldactone, SmPC §4.2–4.4", "https://www.medicines.org.uk/emc/product/1619/smpc"),
  },
  {
    ime: "Forxiga",
    ucinkovina: "dapagliflozin",
    odmerki: ["10 mg"],
    nacin: "skozi usta",
    casi: ["zjutraj"],
    urnik: "Enkrat na dan, npr. zjutraj",
    zaKaj: "Pomaga zmanjšati možnost, da se srčno popuščanje poslabša.",
    kdaj: "Simptomatsko kronično srčno popuščanje. En običajen odmerek za to indikacijo.",
    vir: vir("EMA §4.1–4.2", "https://www.ema.europa.eu/en/documents/product-information/forxiga-epar-product-information_en.pdf"),
  },
];

export const vajeOpomba =
  "Za stabilno srčno popuščanje, ko je ekipa dovolila vadbo doma. Pri odpustu potrdi primeren začetek, dolžino ogrevanja in ohlajanja ter dovoljeno obremenitev.";

export const vaje: Vaja[] = [
  {
    id: "srcno-hoja",
    naslov: "Hoja po ravnem",
    koraki: [
      "Izberite ravno pot. Če so vam predpisali pripomoček za hojo, ga uporabite.",
      "Začnite počasi. Hodite tako, da lahko ves čas govorite v celih stavkih.",
      "Proti koncu upočasnite. Dolžino hoje povečujte po načrtu svoje ekipe.",
    ],
    ponovitve: "Primer začetnega cilja je skupaj 10–15 minut hoje na dan. Upoštevajte svoj odpustni načrt.",
    slika: "/vaje/hoja.svg",
    slikaOpis: "Oseba dela sproščen korak po ravni podlagi. Vodoravna puščica kaže smer hoje.",
    vir: vir("Ontario, vadba pri srčnem popuščanju; CUH, hoja pri srčni rehabilitaciji", "https://www.ontario.ca/files/2023-12/moh-qbp-clinical-handbook-heart-failure-en-2023-12-11.pdf"),
  },
  {
    id: "srcno-koraki-sede",
    naslov: "Koraki na stolu",
    koraki: [
      "Sedite vzravnano na stabilen stol. Stopali položite na tla.",
      "Z rokama ob telesu rahlo dvignite eno koleno in stopalo vrnite na tla.",
      "Zamenjajte nogo. Nadaljujte počasi in dihajte sproščeno.",
    ],
    ponovitve: "1 minuta počasnih izmeničnih korakov kot del dogovorjenega ogrevanja.",
    slika: "/vaje/koleno-sede.svg",
    slikaOpis: "Oseba sedi na stolu. Eno stopalo je na tleh, drugo koleno se pomakne navzgor.",
    vir: vir("Oxford University Hospitals, sedeči program, str. 19", "https://www.ouh.nhs.uk/media/ryhji1z0/106200rehab.pdf"),
  },
  {
    id: "srcno-izteg-kolena",
    naslov: "Izteg kolena na stolu",
    koraki: [
      "Sedite vzravnano, s stopali na tleh. Z rokama se lahko primete za rob stola.",
      "Med izdihom počasi iztegnite eno koleno. Prste potegnite proti sebi in zadržite 1 sekundo.",
      "Med vdihom stopalo počasi spustite na tla. Ponovite z drugo nogo.",
    ],
    ponovitve: "6–8 na vsako nogo. Če je tako v načrtu, po odmoru ponovite še en niz.",
    slika: "/vaje/izteg-sede.svg",
    slikaOpis: "Ena noga miruje na tleh, druga se iztegne naprej. Puščica kaže dvig stopala.",
    vir: vir("American Heart Association, vaje za moč in ravnotežje pri srčnem popuščanju, str. 1", "https://www.heart.org/-/media/Files/Health-Topics/Heart-Failure/Strength-and-Balance.pdf"),
  },
];
