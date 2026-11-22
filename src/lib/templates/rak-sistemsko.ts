// Rak na sistemskem zdravljenju. Questions and rules: docs/checkin-questions.md §6.
// Symptoms and grades follow UKONS 24-hour triage tool v3 (text not copied).
import { NE_DA, OPAZANJA_SPLOSNA } from "./skupno";
import * as vsebina from "./vsebina/rak-sistemsko";
import type { Predloga, Vir } from "./types";

/** Team decision 21. 11. 2026: 38,0 °C or more shows the ward's phone number. */
export const PRAG_VROCINE_C = 38;

const UKONS: Vir = { opis: "UKONS 24-hour triage tool v3", potrjeno: true };
const stopinje = (n: number) =>
  new Intl.NumberFormat("sl-SI", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);

export const rakSistemsko: Predloga = {
  id: "rak-sistemsko",
  ime: "Rak na sistemskem zdravljenju",
  opis: "Doma med cikli kemoterapije ali drugega zdravljenja",
  // TODO(T-42): no source for the default length yet.
  privzetoTrajanjeDni: 30,
  trajanjeVir: { opis: "Privzeta dolžina, ni vira", potrjeno: false },
  vrednostiPacienta: [{ kljuc: "telefonOddelka", oznaka: "Telefon onkološkega oddelka", tip: "telefon" }],
  vprasanja: [
    {
      id: "temperatura",
      tip: "izbira",
      besedilo: "Koliko je vaša temperatura?",
      odgovori: [
        { id: "pod-36", besedilo: `Pod ${stopinje(36)}` },
        { id: "36-37", besedilo: `${stopinje(36)}–${stopinje(37.4)}` },
        { id: "37-38", besedilo: `${stopinje(37.5)}–${stopinje(PRAG_VROCINE_C - 0.1)}` },
        { id: "vrocina", besedilo: `${stopinje(PRAG_VROCINE_C)} ali več` },
      ],
      vednoVprasaj: true,
      privzetoIzbrano: true,
      pogostost: "dnevno",
      vir: { opis: "UKONS: ≥ 37,5 °C ali < 36,0 °C nujna ocena; ESMO 2016: > 38,0 °C", potrjeno: true },
    },
    {
      id: "bruhanje",
      tip: "izbira",
      besedilo: "Kolikokrat ste bruhali v zadnjih 24 urah?",
      odgovori: [
        { id: "nic", besedilo: "Nič" },
        { id: "1-2", besedilo: "1–2" },
        { id: "3-5", besedilo: "3–5" },
        { id: "6+", besedilo: "6 ali več" },
      ],
      vednoVprasaj: false,
      privzetoIzbrano: true,
      pogostost: "dnevno",
      vir: UKONS,
    },
    {
      id: "driska",
      tip: "izbira",
      besedilo: "Kolikokrat ste imeli blato več kot običajno?",
      odgovori: [
        { id: "nic", besedilo: "Nič" },
        { id: "do-3", besedilo: "Do 3" },
        { id: "4-6", besedilo: "4–6" },
        { id: "7+", besedilo: "7 ali več" },
      ],
      vednoVprasaj: false,
      privzetoIzbrano: true,
      pogostost: "dnevno",
      vir: UKONS,
    },
    {
      id: "hrana",
      tip: "izbira",
      besedilo: "Ali lahko jeste in pijete?",
      odgovori: [
        { id: "normalno", besedilo: "Normalno" },
        { id: "manj", besedilo: "Manj kot običajno" },
        { id: "skoraj-nic", besedilo: "Skoraj nič" },
      ],
      vednoVprasaj: false,
      privzetoIzbrano: true,
      pogostost: "dnevno",
      vir: UKONS,
    },
    {
      id: "nujno",
      tip: "izbira",
      besedilo: "Ali vas zelo duši, vas boli v prsih ali krvavite in krvavitev ne preneha?",
      odgovori: NE_DA,
      vednoVprasaj: false,
      privzetoIzbrano: true,
      pogostost: "dnevno",
      vir: UKONS,
    },
  ],
  pravila: [
    {
      id: "vrocina-oddelek",
      tip: "odgovor",
      vprasanje: "temperatura",
      odgovori: ["vrocina"],
      stopnja: "klicOddelek",
      razlog: `Temperatura ${stopinje(PRAG_VROCINE_C)} °C ali več`,
      vir: { opis: "Odločitev ekipe 21. 11. 2026, v skladu z ESMO 2016", potrjeno: true },
    },
    {
      id: "temperatura-izven",
      tip: "odgovor",
      vprasanje: "temperatura",
      odgovori: ["pod-36", "37-38"],
      stopnja: "opozorilo",
      razlog: `Temperatura pod ${stopinje(36)} ali od ${stopinje(37.5)} °C`,
      vir: UKONS,
    },
    {
      id: "bruhanje",
      tip: "odgovor",
      vprasanje: "bruhanje",
      odgovori: ["3-5", "6+"],
      stopnja: "opozorilo",
      razlog: "Bruhanje 3-krat ali več v 24 urah",
      vir: UKONS,
    },
    {
      id: "driska",
      tip: "odgovor",
      vprasanje: "driska",
      odgovori: ["4-6", "7+"],
      stopnja: "opozorilo",
      razlog: "Driska: 4 ali več blata več kot običajno",
      vir: UKONS,
    },
    {
      id: "hrana",
      tip: "odgovor",
      vprasanje: "hrana",
      odgovori: ["skoraj-nic"],
      stopnja: "opozorilo",
      razlog: "Skoraj ne je in ne pije",
      vir: UKONS,
    },
    {
      id: "nujno-112",
      tip: "odgovor",
      vprasanje: "nujno",
      odgovori: ["da"],
      stopnja: "klic112",
      razlog: "Huda težka sapa, bolečina v prsih ali krvavitev",
      vir: UKONS,
    },
  ],
  zdravila: vsebina.zdravila,
  zdravilaOpomba: vsebina.zdravilaOpomba,
  vaje: vsebina.vaje,
  vajeOpomba: vsebina.vajeOpomba,
  opazanja: [
    { id: "vrocina", besedilo: "Vročina 38 °C ali več", pravilo: "vrocina-oddelek" },
    { id: "bruhanje", besedilo: "Bruha 3-krat ali več na dan", pravilo: "bruhanje" },
    { id: "driska", besedilo: "Huda driska", pravilo: "driska" },
    { id: "hrana", besedilo: "Skoraj ne je in ne pije", pravilo: "hrana" },
    { id: "nujno", besedilo: "Huda težka sapa, bolečina v prsih ali krvavitev", pravilo: "nujno-112" },
    ...OPAZANJA_SPLOSNA,
  ],
};
