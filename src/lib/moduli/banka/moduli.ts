// Modules: which items a group of patients gets, when, and the red-flag rules.
// Thresholds marked potrjeno: false are examples a clinician must confirm (T-77).
import type { Modul } from "../types";
import * as v from "./viri";

export const moduli: Modul[] = [
  {
    id: "jedro",
    vrsta: "jedro",
    ime: "Nujni znaki (vsi)",
    aktivacija: { vedno: true },
    prednost: 0,
    postavke: [
      { postavka: "jedro.nujno.v1", pogostost: "dnevno", bistveno: true },
      { postavka: "jedro.eq5d5l.v1", pogostost: "tedensko" },
    ],
    pravila: [
      { id: "nujno-112", tip: "odgovor", vprasanje: "jedro.nujno.v1", odgovori: ["da"], stopnja: "klic112",
        razlog: "Bolečina v prsih, huda težka sapa, omedlevica ali zmedenost", vir: v.NUJNO_112 },
    ],
  },
  {
    id: "stanje:srcno-popuscanje",
    vrsta: "stanje",
    ime: "Srčno popuščanje",
    aktivacija: { mkb10: ["I50"] },
    prednost: 10,
    postavke: [
      { postavka: "sp.teza.v1", pogostost: "dnevno" },
      { postavka: "sp.dusenje.v1", pogostost: "dnevno" },
      { postavka: "sp.otekline.v1", pogostost: "dnevno" },
    ],
    pravila: [
      { id: "teza-3-dni", tip: "porastVDneh", vprasanje: "sp.teza.v1", vecKot: 2, dni: 3, stopnja: "opozorilo",
        razlog: "Teža +{razlika} kg v {dni} dneh", vir: v.HFA_TEZA },
      { id: "teza-nad-suho", tip: "nadVrednostjo", vprasanje: "sp.teza.v1", vrednost: "suhaTeza", vecKot: 0,
        stopnja: "opozorilo", razlog: "Teža {razlika} kg nad suho težo",
        vir: { opis: "docs/research.md: teža nad suho težo; HFA: prilagoditi posamezniku", potrjeno: false } },
      { id: "dusenje-slabse", tip: "odgovor", vprasanje: "sp.dusenje.v1", odgovori: ["slabse"], stopnja: "opozorilo",
        razlog: "Težja sapa kot običajno", vir: v.HFA },
      { id: "dusenje-lezanje", tip: "odgovor", vprasanje: "sp.dusenje-lezanje.v1", odgovori: ["da"], stopnja: "opozorilo",
        razlog: "Več blazin za spanje ali ponoči zadihan/a", vir: v.HFA_ORTOPNEJA },
      { id: "otekline", tip: "odgovor", vprasanje: "sp.otekline.v1", odgovori: ["da"], stopnja: "opozorilo",
        razlog: "Bolj otekli gležnji ali noge", vir: v.HFA },
    ],
  },
  {
    id: "stanje:pljucnica",
    vrsta: "stanje",
    ime: "Pljučnica",
    aktivacija: { mkb10: ["J12", "J13", "J14", "J15", "J16", "J17", "J18"] },
    prednost: 20,
    postavke: [
      { postavka: "pl.vrocina.v1", pogostost: "dnevno", aktivniDnevi: [0, 10] },
      { postavka: "pl.dusenje.v1", pogostost: "dnevno" },
      { postavka: "pl.kaselj.v1", pogostost: "vsak2dan" },
    ],
    pravila: [
      // Expected trajectory: fever should be gone by about day 7 (NICE CG191).
      { id: "vrocina-po-7-dnevu", tip: "poDnevu", vprasanje: "pl.vrocina.v1", odgovori: ["da"], poDnevu: 7,
        stopnja: "opozorilo", razlog: "Vročina še {dan}. dan po odpustu", vir: v.NICE_PLJUCNICA },
      { id: "dusenje-slabse", tip: "odgovor", vprasanje: "pl.dusenje.v1", odgovori: ["slabse"], stopnja: "opozorilo",
        razlog: "Težja sapa kot včeraj", vir: v.NICE_PLJUCNICA },
      { id: "kaselj-slabse", tip: "odgovor", vprasanje: "pl.kaselj.v1", odgovori: ["slabse"], stopnja: "opozorilo",
        razlog: "Kašelj ali izmeček slabši", vir: v.NICE_KASELJ },
    ],
  },
  {
    id: "poseg:endoproteza-kolena",
    vrsta: "poseg",
    ime: "Nov kolenski sklep",
    aktivacija: { posegi: ["endoproteza-kolena"] },
    prednost: 30,
    postavke: [
      { postavka: "ko.bolecina.v1", pogostost: "dnevno" },
      { postavka: "ko.rana.v1", pogostost: "dnevno", aktivniDnevi: [0, 14], bistveno: true },
      { postavka: "ko.meca.v1", pogostost: "dnevno", aktivniDnevi: [0, 35], bistveno: true },
      { postavka: "ko.vaje.v1", pogostost: "dnevno" },
    ],
    pravila: [
      { id: "bolecina-narasca", tip: "narascaVDneh", vprasanje: "ko.bolecina.v1", dni: 3, stopnja: "opozorilo",
        razlog: "Bolečina narašča {dni} dni zapored",
        vir: { opis: "docs/checkin-questions.md §3, ni evropskega vira", potrjeno: false } },
      { id: "rana", tip: "odgovor", vprasanje: "ko.rana.v1", odgovori: ["rdeca", "cedi"], stopnja: "opozorilo",
        razlog: "Rana je rdeča, otekla ali se cedi", vir: v.ECDC_RANA },
      { id: "rana-siri", tip: "odgovor", vprasanje: "ko.rana-siri.v1", odgovori: ["da"], stopnja: "opozorilo",
        razlog: "Rdečina se širi ali vročina 38 °C ali več", vir: v.ECDC_RANA },
      { id: "meca", tip: "odgovor", vprasanje: "ko.meca.v1", odgovori: ["da"], stopnja: "opozorilo",
        razlog: "Otekla, topla ali boleča meča (možen strdek)", vir: v.ESA_VTE },
    ],
  },
  {
    id: "zdravilo:antikoagulant",
    vrsta: "zdravilo",
    ime: "Zdravilo za redčenje krvi",
    // B01AA vitamin K antagonists, B01AB heparins, B01AE thrombin inhibitors, B01AF factor Xa inhibitors.
    aktivacija: { atc: ["B01AA", "B01AB", "B01AE", "B01AF"] },
    prednost: 15,
    postavke: [
      { postavka: "ak.vzeto.v1", pogostost: "dnevno" },
      { postavka: "ak.krvavitev.v1", pogostost: "dnevno" },
    ],
    pravila: [
      { id: "antikoagulant-izpuscen", tip: "odgovor", vprasanje: "ak.vzeto.v1", odgovori: ["ne"], stopnja: "opozorilo",
        razlog: "Izpuščeno zdravilo za redčenje krvi", vir: v.ODPUSTNI_RECEPT },
      { id: "krvavitev", tip: "odgovor", vprasanje: "ak.krvavitev.v1", odgovori: ["da"], stopnja: "opozorilo",
        razlog: "Nenavadna krvavitev ali modrice", vir: v.ODPUSTNI_RECEPT },
    ],
  },
  {
    id: "zdravilo:diuretik",
    vrsta: "zdravilo",
    ime: "Zdravilo za vodo (diuretik)",
    aktivacija: { atc: ["C03"] },
    prednost: 12,
    postavke: [
      { postavka: "di.vzeto.v1", pogostost: "dnevno" },
      { postavka: "di.omotica.v1", pogostost: "dnevno" },
    ],
    pravila: [
      { id: "diuretik-izpuscen", tip: "odgovor", vprasanje: "di.vzeto.v1", odgovori: ["ne"], stopnja: "opozorilo",
        razlog: "Izpuščen diuretik", vir: v.HFA },
      { id: "omotica", tip: "odgovor", vprasanje: "di.omotica.v1", odgovori: ["da"], stopnja: "opozorilo",
        razlog: "Vrtoglavica ob vstajanju", vir: v.ODPUSTNI_RECEPT },
    ],
  },
  {
    id: "zdravilo:antibiotik",
    vrsta: "zdravilo",
    ime: "Antibiotik",
    // Items stop on the day after the course ends (DejstvaPacienta.zdravila[].konec).
    aktivacija: { atc: ["J01"] },
    prednost: 25,
    postavke: [{ postavka: "ab.vzeto.v1", pogostost: "dnevno" }],
    pravila: [
      { id: "antibiotik-izpuscen", tip: "odgovor", vprasanje: "ab.vzeto.v1", odgovori: ["ne"], stopnja: "opozorilo",
        razlog: "Izpuščen odmerek antibiotika", vir: v.ODPUSTNI_RECEPT },
    ],
  },
];
