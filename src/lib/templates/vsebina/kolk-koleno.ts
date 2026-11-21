// Medicines and exercises after a hip or knee replacement: docs/medicines.md and docs/rehab-content.md.
import type { Vaja, Zdravilo } from "../types";
import { vir } from "./vir";

const NG89 = "https://www.nice.org.uk/guidance/ng89/chapter/Recommendations";
const SWANSEA = "https://sbuhb.nhs.wales/hospitals/a-z-services/elective-orthopaedic-physiotherapy/elective-orthopaedic-folder/recovering-from-a-total-hip-replacement/";
const SWANSEA_VIR = "Swansea Bay, kolk; Swansea Bay, koleno";

export const zdravilaOpomba =
  "Za elektivno zamenjavo sklepa prepišite izbrani režim za preprečevanje strdkov skupaj z začetkom in predvidenim koncem. Smernica loči med kolkom in kolenom ter upošteva tveganje krvavitve. Za klinično potrditev: lokalni ortopedski protokol, izbira in zaporedje profilakse, dnevi, ki so že bili opravljeni v bolnišnici, ledvična funkcija, tveganje krvavitve in meja paracetamola pri krhkih bolnikih, nizki telesni masi ali jetrni bolezni.";

export const zdravila: Zdravilo[] = [
  {
    ime: "Inhixa",
    ucinkovina: "natrijev enoksaparin",
    odmerki: ["40 mg (4.000 i.e.)", "20 mg (2.000 i.e.)"],
    nacin: "pod kožo",
    casi: ["zjutraj"],
    urnik: "Enkrat na dan ob predpisani uri",
    zaKaj: "Zmanjša možnost nastanka krvnega strdka po operaciji.",
    kdaj: "Če je izbran nizkomolekularni heparin. 20 mg samo pri hudi ledvični okvari po SmPC (očistek kreatinina 15–30 ml/min), ob potrjeni indikaciji. Bolničar potrdi preostale dni in tehniko injiciranja.",
    vir: vir("NICE NG89; EMA §4.2", "https://www.ema.europa.eu/en/documents/product-information/inhixa-epar-product-information_en.pdf"),
  },
  {
    ime: "Acetilsalicilna kislina",
    ucinkovina: "acetilsalicilna kislina",
    odmerki: ["75 mg", "150 mg"],
    nacin: "skozi usta",
    casi: ["zjutraj"],
    urnik: "Enkrat na dan, npr. zjutraj",
    zaKaj: "Zmanjša možnost nastanka krvnega strdka po operaciji.",
    kdaj: "Možnost po NICE. Kolk: 10 dni nizkomolekularnega heparina, nato 28 dni acetilsalicilne kisline. Koleno: samostojni 14-dnevni režim.",
    vir: vir("NICE NG89 §1.11.5 in §1.11.8", NG89),
  },
  {
    ime: "Xarelto",
    ucinkovina: "rivaroksaban",
    odmerki: ["10 mg"],
    nacin: "skozi usta",
    casi: ["zjutraj"],
    urnik: "Enkrat na dan ob istem času",
    zaKaj: "Zmanjša možnost nastanka krvnega strdka po operaciji.",
    kdaj: "Alternativni režim. SmPC navaja skupno 5 tednov po večji operaciji kolka oziroma 2 tedna po večji operaciji kolena.",
    vir: vir("NICE NG89; EMA §4.2, jakost 10 mg", "https://www.ema.europa.eu/en/documents/product-information/xarelto-epar-product-information_en.pdf"),
  },
  {
    ime: "Paracetamol",
    ucinkovina: "paracetamol",
    odmerki: ["500 mg", "1.000 mg"],
    nacin: "skozi usta",
    casi: [],
    poPotrebi: true,
    urnik: "Po potrebi po receptu, najmanj 4 ure med odmerkoma pri navedenem izdelku",
    zaKaj: "Lajša bolečino po operaciji.",
    kdaj: "Predpis določi, ali je jemanje redno ali po potrebi, ter najvišji dnevni odmerek. Upoštevajte paracetamol iz vseh sočasnih zdravil.",
    vir: vir("PROSPECT za kolk in koleno; SmPC §4.2–4.4", "https://www.medicines.org.uk/emc/product/13494/smpc"),
  },
];

export const vajeOpomba =
  "Veljajo omejitve gibanja, obremenjevanja in uporabe pripomočkov iz odpustnice. Pri zamenjavi kolka fizioterapevt določi dovoljeni upogib. Navedene ponovitve so za eno izvedbo. Pogostost potrdi fizioterapevt.";

export const vaje: Vaja[] = [
  {
    id: "sklep-glezenj",
    naslov: "Premikanje gležnja leže",
    koraki: [
      "Ulezite se na hrbet. Noga naj počiva na postelji.",
      "Prste počasi potegnite proti sebi.",
      "Prste počasi usmerite stran od sebe. Premik naj ostane udoben.",
    ],
    ponovitve: "20 premikov gor in dol, če je tako v vašem načrtu.",
    slika: "/vaje/glezenj-leze.svg",
    slikaOpis: "Oseba leži na hrbtu. Poudarjeno stopalo se pomika proti sebi in nazaj.",
    vir: vir(SWANSEA_VIR, SWANSEA),
  },
  {
    id: "sklep-napni-stegno",
    naslov: "Napnite stegno",
    koraki: [
      "Ulezite se na hrbet in iztegnite operirano nogo.",
      "Zadnjo stran kolena potisnite proti postelji, da napnete sprednji del stegna.",
      "Zadržite 3 sekunde, ves čas dihajte, nato stegno sprostite.",
    ],
    ponovitve: "10 ponovitev z operirano nogo.",
    slika: "/vaje/stegenska-misica.svg",
    slikaOpis: "Oseba leži na hrbtu z iztegnjeno nogo. Puščica nad kolenom kaže pritisk proti postelji.",
    vir: vir(SWANSEA_VIR, SWANSEA),
  },
  {
    id: "sklep-drsenje-pete",
    naslov: "Podrsajte s peto po postelji",
    koraki: [
      "Ulezite se na hrbet. Operirana noga naj bo iztegnjena.",
      "Peto počasi povlecite proti zadnjici. Naj ostane na postelji.",
      "Ustavite se pri upogibu, ki ga je dovolil fizioterapevt, in nogo počasi iztegnite.",
    ],
    ponovitve: "10 ponovitev z operirano nogo.",
    slika: "/vaje/peta.svg",
    slikaOpis: "Oseba leži na hrbtu in pokrči koleno. Peta ves čas drsi po postelji.",
    vir: vir(SWANSEA_VIR, SWANSEA),
  },
];
