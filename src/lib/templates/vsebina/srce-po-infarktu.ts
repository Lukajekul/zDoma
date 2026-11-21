// Medicines and exercises after a heart attack or heart surgery: docs/medicines.md and docs/rehab-content.md.
import type { Vaja, Zdravilo } from "../types";
import { vir } from "./vir";

const ACS = "https://academic.oup.com/eurheartj/article/44/38/3720/7243210";
const ATORVASTATIN = "https://www.medicines.org.uk/emc/product/13674/smpc";
const RAMIPRIL = "https://www.medicines.org.uk/emc/product/14716/smpc";
const SOUTHAMPTON = "https://www.uhs.nhs.uk/Media/UHS-website-2019/Patientinformation/Heartandlungs/Post-sternotomy-activity-3135-PIL.pdf";

export const zdravilaOpomba =
  "Primeri so po infarktu ali koronarnem obvodu. Po operaciji zaklopke je antitrombotični načrt odvisen od posega, tipa zaklopke in drugih indikacij. Pri bolniku s stentom ali z ločeno indikacijo za antikoagulant prepišite točno kombinacijo in trajanje iz odpustnice. Za klinično potrditev: antitrombotično zdravljenje glede na poseg, tveganje krvavitve in trajanje dvojnega zdravljenja; bolniki z zaklopko, atrijsko fibrilacijo ali predpisanim antikoagulantom; trajanje jemanja zaviralca beta.";

export const zdravila: Zdravilo[] = [
  {
    ime: "Acetilsalicilna kislina",
    ucinkovina: "acetilsalicilna kislina",
    odmerki: ["75 mg", "100 mg"],
    nacin: "skozi usta",
    casi: ["zjutraj"],
    urnik: "Enkrat na dan, npr. zjutraj",
    zaKaj: "Zmanjša možnost nastanka strdka v žilah srca.",
    kdaj: "Vzdrževalno po akutnem koronarnem sindromu. Po koronarnem obvodu po kirurškem načrtu.",
    vir: vir("ESC ACS 2023, tabela 6; EACTS 2024, §3.1", ACS),
  },
  {
    ime: "Plavix",
    ucinkovina: "klopidogrel",
    odmerki: ["75 mg"],
    nacin: "skozi usta",
    casi: ["zjutraj"],
    urnik: "Enkrat na dan ob istem času, npr. zjutraj",
    zaKaj: "Zmanjša možnost nastanka strdka v žilah srca.",
    kdaj: "Vzdrževalni odmerek, če odpustni načrt določa klopidogrel kot zaviralec P2Y12.",
    vir: vir("ESC ACS 2023, tabela 6; EMA §4.2", ACS),
  },
  {
    ime: "Brilique",
    ucinkovina: "tikagrelor",
    odmerki: ["90 mg"],
    nacin: "skozi usta",
    casi: ["zjutraj", "zvecer"],
    urnik: "Zjutraj in zvečer",
    zaKaj: "Zmanjša možnost nastanka strdka v žilah srca.",
    kdaj: "Prikazan je vzdrževalni odmerek za akutni koronarni sindrom. SmPC predvideva kombinacijo z nizkim odmerkom acetilsalicilne kisline, če je primerna. 60 mg dvakrat na dan je ločen podaljšani režim za izbrane bolnike z infarktom pred najmanj enim letom in velikim tveganjem.",
    vir: vir("EMA §4.1–4.2", "https://www.ema.europa.eu/en/documents/product-information/brilique-epar-product-information_en.pdf"),
  },
  {
    ime: "Atorvastatin",
    ucinkovina: "atorvastatin",
    odmerki: ["40 mg", "80 mg"],
    nacin: "skozi usta",
    casi: ["zvecer"],
    urnik: "Enkrat na dan, npr. zvečer",
    zaKaj: "Zniža škodljivi holesterol in varuje žile.",
    kdaj: "Sekundarno preprečevanje. NICE kot standard navaja 80 mg, nižji odmerek pa glede na interakcije, tveganje neželenih učinkov ali izbiro bolnika.",
    vir: vir("NICE NG238 §1.7; SmPC §4.2", ATORVASTATIN),
  },
  {
    ime: "Ramipril",
    ucinkovina: "ramipril",
    odmerki: ["2,5 mg", "5 mg"],
    nacin: "skozi usta",
    casi: ["zjutraj", "zvecer"],
    urnik: "Zjutraj in zvečer",
    zaKaj: "Zniža krvni tlak in razbremeni srce.",
    kdaj: "Ta dvakratni režim je iz SmPC za klinično stabilnega bolnika po infarktu z znaki srčnega popuščanja.",
    vir: vir("Ramipril, SmPC §4.2", RAMIPRIL),
  },
  {
    ime: "Bisoprolol",
    ucinkovina: "bisoprolol",
    odmerki: ["1,25 mg", "2,5 mg", "5 mg", "10 mg"],
    nacin: "skozi usta",
    casi: ["zjutraj"],
    urnik: "Zjutraj",
    zaKaj: "Upočasni utrip in razbremeni srce.",
    kdaj: "Prikazani odmerki so za stabilno HFrEF po infarktu. Pri ohranjenem iztisnem deležu in po drugih operacijah velja individualni odpustni načrt.",
    vir: vir("NICE NG185 §1.4; Bisoprolol, SmPC §4.2", "https://www.nice.org.uk/guidance/ng185/chapter/recommendations"),
  },
];

export const vajeOpomba =
  "Bolničar izbere vaje glede na poseg, čas od odpusta in omejitve gibanja. Vaja za ramena po operaciji velja, če jo je potrdila kirurška ekipa.";

export const vaje: Vaja[] = [
  {
    id: "srce-hoja",
    naslov: "Kratek sprehod",
    koraki: [
      "Izberite ravno pot. Prve sprehode opravite s spremljevalcem, če tako svetuje ekipa.",
      "Začnite zelo počasi in hodite v tempu, v katerem se lahko pogovarjate.",
      "Pred koncem upočasnite. Najprej podaljšujte čas hoje po načrtu svoje ekipe.",
    ],
    ponovitve: "Za nekatere je primerno začeti s 5–10 minutami hoje. Upoštevajte predpisano dolžino, ogrevanje in ohlajanje.",
    slika: "/vaje/hoja.svg",
    slikaOpis: "Oseba dela sproščen korak po ravni podlagi. Vodoravna puščica kaže smer hoje.",
    vir: vir("CUH, program hoje; Royal Brompton, hoja po operaciji srca", "https://www.cuh.nhs.uk/patient-information/cardiac-rehabilitation-walking-programme/"),
  },
  {
    id: "srce-dvigi-kolen",
    naslov: "Dvigovanje kolen sede",
    koraki: [
      "Sedite vzravnano na stabilen stol. Stopali položite na tla.",
      "Počasi dvignite eno pokrčeno koleno, kolikor vam je udobno.",
      "Stopalo mirno spustite na tla in zamenjajte nogo.",
    ],
    ponovitve: "10 dvigov skupaj kot del ogrevanja, če je vaja v vašem načrtu.",
    slika: "/vaje/koleno-sede.svg",
    slikaOpis: "Oseba sedi na stolu. Eno stopalo je na tleh, drugo koleno se pomakne navzgor.",
    vir: vir("UHCW, ogrevanje v programu srčne rehabilitacije, str. 3", "https://www.uhcw.nhs.uk/download/clientfiles/files/Patient%20Information%20Leaflets/Medicine/Cardiology/Cardiac%20Rehabilitation%20Circuit%20Training%20Programme.pdf"),
  },
  {
    id: "srce-ramena",
    naslov: "Dvig in spust ramen",
    koraki: [
      "Sedite vzravnano. Roki naj sproščeno visita ob telesu.",
      "Počasi dvignite rameni proti ušesom.",
      "Počasi spustite rameni in ju sprostite.",
    ],
    ponovitve: "5–10 ponovitev po navodilu ekipe po operaciji prsnice.",
    slika: "/vaje/spust-ramen.svg",
    slikaOpis: "Oseba sedi vzravnano. Puščici ob ramenih kažeta dvig.",
    vir: vir("Southampton, vaje za ramena po operaciji prsnice", SOUTHAMPTON),
  },
];
