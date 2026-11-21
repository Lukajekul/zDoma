// Medicines and exercises after a stroke: docs/medicines.md and docs/rehab-content.md.
import type { Vaja, Zdravilo } from "../types";
import { vir } from "./vir";

const ESO = "https://journals.sagepub.com/doi/full/10.1177/23969873221100032";
const UHB = "https://www.uhb.nhs.uk/media/zhajlskn/stroke-exercise-booklet_stroke-team_pi.pdf";

export const zdravilaOpomba =
  "Primeri so za sekundarno preprečevanje po ishemični kapi ali prehodnem ishemičnem napadu (TIA). Po možganski krvavitvi velja specialistični načrt. Razlog za kap določa izbiro med zaviralcem trombocitov in antikoagulantom. Za klinično potrditev: podtip kapi, začetek antikoagulacije, trajanje antitrombotičnega zdravljenja, ledvična funkcija in varno požiranje. Zdravila za krvni tlak se prepišejo iz individualnega načrta.";

export const zdravila: Zdravilo[] = [
  {
    ime: "Plavix",
    ucinkovina: "klopidogrel",
    odmerki: ["75 mg"],
    nacin: "skozi usta",
    casi: ["zjutraj"],
    urnik: "Enkrat na dan ob istem času, npr. zjutraj",
    zaKaj: "Zmanjša možnost strdka, ki bi lahko povzročil novo kap.",
    kdaj: "Primer dolgoročnega zaviralca trombocitov po nekardioembolični ishemični kapi. Začetna dvojna terapija pri izbranih bolnikih zahteva ločen časovno omejen načrt.",
    vir: vir("ESO 2022; EMA §4.1–4.2", ESO),
  },
  {
    ime: "Atorvastatin",
    ucinkovina: "atorvastatin",
    odmerki: ["40 mg", "80 mg"],
    nacin: "skozi usta",
    casi: ["zvecer"],
    urnik: "Enkrat na dan, npr. zvečer",
    zaKaj: "Zniža škodljivi holesterol in varuje žile.",
    kdaj: "Sekundarno preprečevanje. Bolničar potrdi odmerek glede na ciljni LDL, prenašanje in interakcije.",
    vir: vir("ESO 2022; NICE NG238 §1.7; SmPC §4.2", ESO),
  },
  {
    ime: "Eliquis",
    ucinkovina: "apiksaban",
    odmerki: ["5 mg", "2,5 mg"],
    nacin: "skozi usta",
    casi: ["zjutraj", "zvecer"],
    urnik: "Zjutraj in zvečer",
    zaKaj: "Zmanjša možnost strdka zaradi nerednega srčnega utripa.",
    kdaj: "Pri nevalvularni atrijski fibrilaciji z indikacijo za antikoagulacijo. 2,5 mg samo ob izpolnjenih merilih za zmanjšanje iz SmPC: najmanj dve merili (starost ≥80 let, masa ≤60 kg, serumski kreatinin ≥1,5 mg/dl) ali huda ledvična okvara (očistek kreatinina 15–29 ml/min).",
    vir: vir("ESC 2024, atrijska fibrilacija; EMA §4.1–4.2", "https://www.ema.europa.eu/en/documents/product-information/eliquis-epar-product-information_en.pdf"),
  },
  {
    ime: "Ramipril",
    ucinkovina: "ramipril",
    odmerki: ["2,5 mg", "5 mg", "10 mg"],
    nacin: "skozi usta",
    casi: ["zjutraj"],
    urnik: "Enkrat na dan ob istem času, npr. zjutraj",
    zaKaj: "Zniža krvni tlak in pomaga varovati žile.",
    kdaj: "Primer, če je ramipril izbran za dolgoročno uravnavanje tlaka. Zdravnik potrdi odmerek in ciljni tlak po ishemični kapi.",
    vir: vir("ESO 2022; SmPC §4.2, hipertenzija", "https://www.medicines.org.uk/emc/product/14716/smpc"),
  },
];

export const vajeOpomba =
  "Fizioterapevt potrdi varno stran, število ponovitev, oporo in potrebno pomoč. Pri vajah na stolu naj bo stol stabilen in brez koles. Ob novih znakih kapi pokličite 112.";

export const vaje: Vaja[] = [
  {
    id: "kap-drsenje-pete",
    naslov: "Pokrčite nogo leže",
    koraki: [
      "Ulezite se na hrbet in iztegnite nogi.",
      "Počasi pokrčite koleno. Peta naj drsi po postelji.",
      "Koleno naj ostane v smeri kolka. Nato počasi iztegnite nogo.",
    ],
    ponovitve: "Do 10 ponovitev z nogo, ki jo določi fizioterapevt.",
    slika: "/vaje/peta.svg",
    slikaOpis: "Oseba leži na hrbtu in pokrči koleno. Peta ves čas drsi po postelji.",
    vir: vir("UHB, vaje po kapi, str. 3", UHB),
  },
  {
    id: "kap-dvig-kolena",
    naslov: "Dvig kolena sede",
    koraki: [
      "Sedite vzravnano na stabilen stol. Stopali položite na tla.",
      "Počasi dvignite eno koleno in ostanite vzravnani.",
      "Stopalo počasi položite nazaj na tla. Zamenjajte nogo, če je tako v načrtu.",
    ],
    ponovitve: "Do 10 ponovitev po načrtu fizioterapevta.",
    slika: "/vaje/koleno-sede.svg",
    slikaOpis: "Oseba sedi na stolu. Eno stopalo je na tleh, drugo koleno se pomakne navzgor.",
    vir: vir("UHB, vaje po kapi, str. 3–4", UHB),
  },
  {
    id: "kap-vstajanje",
    naslov: "Vstajanje s stola",
    koraki: [
      "Sedite na stabilen stol z naslonjaloma za roke. Stopali položite na tla.",
      "Z zgornjim delom telesa se rahlo nagnite naprej.",
      "Počasi vstanite z dogovorjeno oporo in pomočjo.",
      "Počasi se spustite nazaj na stol.",
    ],
    ponovitve: "Do 10 ponovitev, samo če je fizioterapevt potrdil varno vstajanje doma.",
    slika: "/vaje/vstajanje.svg",
    slikaOpis: "Oseba se pomakne naprej, se odrine z naslonjala za roke in se dvigne s stola.",
    vir: vir("UHB, vaje po kapi, str. 3–4; NICE NG236, ponavljanje vsakdanjih gibov", UHB),
  },
];
