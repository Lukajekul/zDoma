// KOPB. Questions and rules: docs/checkin-questions.md §4.
// Weakest-sourced template: no threshold was read in a primary text (T-42).
import { NE_DA, PRAVILO_VROCINA, vprasanjeVrocina } from "./skupno";
import * as vsebina from "./vsebina/kopb";
import type { Predloga, Vir } from "./types";

const GOLD: Vir = {
  opis: "GOLD 2023: poslabšanje = težka sapa in/ali kašelj in izmeček, slabše v < 14 dneh",
  potrjeno: false,
};
const NI_PREVERJENO: Vir = { opis: "docs/checkin-questions.md §4, ni preverjeno", potrjeno: false };

export const kopb: Predloga = {
  id: "kopb",
  ime: "KOPB",
  opis: "Po bolnišnici zaradi poslabšanja KOPB",
  // TODO(T-42): no source for the default length yet.
  privzetoTrajanjeDni: 30,
  trajanjeVir: { opis: "Privzeta dolžina, ni vira", potrjeno: false },
  vrednostiPacienta: [{ kljuc: "inhalatorZaOlajsanje", oznaka: "Inhalator za olajšanje", tip: "zdravilo" }],
  vprasanja: [
    {
      id: "dusenje",
      tip: "izbira",
      besedilo: "Ali vas danes bolj duši kot običajno?",
      odgovori: [
        { id: "ne", besedilo: "Ne" },
        { id: "malo", besedilo: "Malo bolj" },
        { id: "mnogo", besedilo: "Mnogo bolj" },
        { id: "povedi", besedilo: "Ne morem povedati cele povedi" },
      ],
      vednoVprasaj: false,
      privzetoIzbrano: true,
      pogostost: "dnevno",
      vir: GOLD,
    },
    {
      id: "kasel",
      tip: "izbira",
      besedilo: "Ali več kašljate kot običajno?",
      odgovori: NE_DA,
      vednoVprasaj: false,
      privzetoIzbrano: true,
      pogostost: "dnevno",
      vir: GOLD,
    },
    {
      id: "izmecek",
      tip: "izbira",
      besedilo: "Kakšen je izmeček?",
      odgovori: [
        { id: "obicajno", besedilo: "Kot običajno" },
        { id: "vec", besedilo: "Ga je več" },
        { id: "barva", besedilo: "Rumen ali zelen" },
      ],
      vednoVprasaj: false,
      privzetoIzbrano: true,
      pogostost: "dnevno",
      vir: GOLD,
    },
    {
      id: "inhalator",
      tip: "izbira",
      besedilo: "Ste danes potrebovali {inhalatorZaOlajsanje} več kot običajno?",
      odgovori: NE_DA,
      vednoVprasaj: false,
      privzetoIzbrano: true,
      pogostost: "dnevno",
      vir: NI_PREVERJENO,
    },
    { ...vprasanjeVrocina(true), vir: NI_PREVERJENO },
  ],
  pravila: [
    {
      id: "dusenje-112",
      tip: "odgovor",
      vprasanje: "dusenje",
      odgovori: ["povedi"],
      stopnja: "klic112",
      razlog: "Ne more povedati cele povedi",
      vir: { opis: "docs/research.md, brez vira", potrjeno: false },
    },
    {
      id: "dusenje-mnogo",
      tip: "odgovor",
      vprasanje: "dusenje",
      odgovori: ["mnogo"],
      stopnja: "opozorilo",
      razlog: "Mnogo bolj težka sapa",
      vir: GOLD,
    },
    {
      id: "kasel-2-dni",
      tip: "zaporedniDnevi",
      vprasanje: "kasel",
      odgovori: ["da"],
      dni: 2,
      stopnja: "opozorilo",
      razlog: "Več kašlja {dni} dni zapored",
      vir: GOLD,
    },
    {
      id: "izmecek",
      tip: "odgovor",
      vprasanje: "izmecek",
      odgovori: ["vec", "barva"],
      stopnja: "opozorilo",
      razlog: "Izmeček se je spremenil",
      vir: GOLD,
    },
    {
      id: "inhalator",
      tip: "odgovor",
      vprasanje: "inhalator",
      odgovori: ["da"],
      stopnja: "opozorilo",
      razlog: "Inhalator za olajšanje več kot običajno",
      vir: NI_PREVERJENO,
    },
    { ...PRAVILO_VROCINA, vir: NI_PREVERJENO },
  ],
  zdravila: vsebina.zdravila,
  zdravilaOpomba: vsebina.zdravilaOpomba,
  vaje: vsebina.vaje,
  vajeOpomba: vsebina.vajeOpomba,
};
