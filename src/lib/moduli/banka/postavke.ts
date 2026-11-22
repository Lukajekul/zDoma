// The shared item bank (T-76). Every item is hand-written once; modules only
// reference items by id. Wording reused from src/lib/templates/ where it exists.
import { DA_NE, NE_DA } from "@/lib/templates/skupno";
import type { Odgovor } from "@/lib/templates";
import type { Postavka } from "../types";
import * as v from "./viri";

/** Order = severity order (narascaVDneh and the arrows on answer buttons use it). */
const BOLJE_ENAKO_SLABSE: Odgovor[] = [
  { id: "bolje", besedilo: "Bolje" },
  { id: "enako", besedilo: "Enako" },
  { id: "slabse", besedilo: "Slabše" },
];

// Yesterday's pills all logged "vzeto" answer "Ste včeraj vzeli …?" (T-84).
const IZ_ZDRAVIL = { dniNazaj: 1, vzeto: "da" };
const izbira = { tip: "izbira" as const, vednoVprasaj: false, status: "zdoma" as const };

export const postavke: Postavka[] = [
  // --- Jedro: asked of everyone
  {
    ...izbira,
    id: "jedro.nujno.v1",
    koncept: "nujno",
    raven: 0,
    besedilo:
      "Ali imate zdaj kaj od tega: bolečino v prsih, hudo težko sapo, omedlevico ali nenadno zmedenost?",
    odgovori: NE_DA,
    // Red flags are never answered by "Enako kot včeraj".
    vednoVprasaj: true,
    vir: v.NUJNO_112,
  },
  {
    // Placeholder until zDoma is registered with EuroQol: never asked while licencaUrejena is false.
    ...izbira,
    id: "jedro.eq5d5l.v1",
    koncept: "eq5d5l",
    raven: 4,
    status: "validiran",
    licencaUrejena: false,
    besedilo: "Vprašalnik o počutju EQ-5D-5L",
    odgovori: [{ id: "izpolnjeno", besedilo: "Izpolnjeno" }],
    vir: v.EUROQOL,
  },

  // --- Srčno popuščanje
  { tip: "teza", id: "sp.teza.v1", koncept: "teza", raven: 1, status: "zdoma", korak: 0.5, vednoVprasaj: true,
    besedilo: "Stopite na tehtnico. Koliko tehtate danes?", vir: v.HFA_TEZA },
  {
    ...izbira,
    id: "sp.dusenje.v1",
    koncept: "dusenje",
    raven: 1,
    besedilo: "Kako vas danes duši v primerjavi z običajnim?",
    odgovori: BOLJE_ENAKO_SLABSE,
    nadaljnje: { ko: ["slabse"], postavka: "sp.dusenje-lezanje.v1" },
    vir: v.HFA,
  },
  {
    ...izbira,
    id: "sp.dusenje-lezanje.v1",
    koncept: "dusenje-lezanje",
    raven: 3,
    besedilo: "Ali potrebujete več blazin za spanje ali se ponoči zbudite zadihani?",
    odgovori: NE_DA,
    vir: v.HFA_ORTOPNEJA,
  },
  { ...izbira, id: "sp.otekline.v1", koncept: "otekline", raven: 1,
    besedilo: "Ali so vam gležnji ali noge danes bolj otekli?", odgovori: NE_DA, vir: v.HFA },

  // --- Pljučnica
  { ...izbira, id: "pl.vrocina.v1", koncept: "vrocina", raven: 2,
    besedilo: "Ali imate danes vročino ali se počutite vročični?", odgovori: NE_DA, vir: v.NICE_PLJUCNICA },
  {
    // Same concept as sp.dusenje.v1 and the same answer ids, so either module's rules apply to whichever is kept.
    ...izbira,
    id: "pl.dusenje.v1",
    koncept: "dusenje",
    raven: 1,
    besedilo: "Kako vas danes duši v primerjavi z včeraj?",
    odgovori: BOLJE_ENAKO_SLABSE,
    vir: v.NICE_PLJUCNICA,
  },
  { ...izbira, id: "pl.kaselj.v1", koncept: "kaselj", raven: 2,
    besedilo: "Kašelj in izmeček: kako je danes v primerjavi z včeraj?", odgovori: BOLJE_ENAKO_SLABSE, vir: v.NICE_KASELJ },

  // --- Endoproteza kolena
  {
    ...izbira,
    id: "ko.bolecina.v1",
    koncept: "bolecina-koleno",
    raven: 1,
    besedilo: "Kako močno vas boli koleno danes?",
    odgovori: [
      { id: "0-2", besedilo: "0–2" },
      { id: "3-5", besedilo: "3–5" },
      { id: "6-8", besedilo: "6–8" },
      { id: "9-10", besedilo: "9–10" },
    ],
    vir: v.NICE_SKLEP,
  },
  {
    ...izbira,
    id: "ko.rana.v1",
    koncept: "rana",
    raven: 2,
    besedilo: "Kakšna je rana?",
    odgovori: [
      { id: "v-redu", besedilo: "V redu" },
      { id: "rdeca", besedilo: "Bolj rdeča, otekla, topla ali boleča" },
      { id: "cedi", besedilo: "Iz nje se cedi" },
    ],
    fotografija: true,
    nadaljnje: { ko: ["rdeca", "cedi"], postavka: "ko.rana-siri.v1" },
    vir: v.ECDC_RANA,
  },
  { ...izbira, id: "ko.rana-siri.v1", koncept: "rana-siri", raven: 3,
    besedilo: "Ali se rdečina širi ali imate vročino 38 °C ali več?", odgovori: NE_DA, vir: v.ECDC_RANA },
  { ...izbira, id: "ko.meca.v1", koncept: "meca", raven: 2,
    besedilo: "Ali je ena meča otekla, topla ali boleča?", odgovori: NE_DA, vir: v.ESA_VTE },
  {
    ...izbira,
    id: "ko.vaje.v1",
    koncept: "vaje",
    raven: 2,
    besedilo: "Ste danes naredili vaje?",
    odgovori: [
      { id: "vse", besedilo: "Vse" },
      { id: "nekaj", besedilo: "Nekaj" },
      { id: "ne", besedilo: "Ne" },
    ],
    vir: v.NICE_SKLEP,
  },

  // --- Zdravila
  { ...izbira, id: "ak.vzeto.v1", koncept: "antikoagulant-vzeto", raven: 1,
    besedilo: "Ste včeraj vzeli zdravilo za redčenje krvi?", odgovori: DA_NE, izZdravilModula: IZ_ZDRAVIL, vir: v.ODPUSTNI_RECEPT },
  { ...izbira, id: "ak.krvavitev.v1", koncept: "krvavitev", raven: 1,
    besedilo: "Ali ste opazili nenavadno krvavitev ali velike modrice?", odgovori: NE_DA, vir: v.ODPUSTNI_RECEPT },
  { ...izbira, id: "di.vzeto.v1", koncept: "diuretik-vzeto", raven: 1,
    besedilo: "Ste včeraj vzeli zdravilo za vodo?", odgovori: DA_NE, izZdravilModula: IZ_ZDRAVIL, vir: v.ODPUSTNI_RECEPT },
  { ...izbira, id: "di.omotica.v1", koncept: "omotica", raven: 2,
    besedilo: "Ali se vam vrti, ko vstanete?", odgovori: NE_DA, vir: v.ODPUSTNI_RECEPT },
  { ...izbira, id: "ab.vzeto.v1", koncept: "antibiotik-vzeto", raven: 1,
    besedilo: "Ste včeraj vzeli vse odmerke antibiotika?", odgovori: DA_NE, izZdravilModula: IZ_ZDRAVIL, vir: v.ODPUSTNI_RECEPT },
];
