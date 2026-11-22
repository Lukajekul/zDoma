// Pieces several templates share (docs/checkin-questions.md). Data only.
import type { Odgovor, Opazanje, Pravilo, VprasanjeIzbira, VrednostPacienta, Vir } from "./types";

export const NE_DA: Odgovor[] = [
  { id: "ne", besedilo: "Ne" },
  { id: "da", besedilo: "Da" },
];

export const DA_NE: Odgovor[] = [
  { id: "da", besedilo: "Da" },
  { id: "ne", besedilo: "Ne" },
];

export const AGENTS_112: Vir = {
  opis: "AGENTS.md §5a: bolečina v prsih, huda nenadna zadihanost, omedlevica ali znaki kapi → Pokličite 112",
  potrjeno: true,
};

// --- Blood pressure, shared rule (Srčno popuščanje, Po infarktu, Možganska kap)

export const CILJNI_TLAK: VrednostPacienta = {
  kljuc: "ciljniTlak",
  oznaka: "Ciljni krvni tlak",
  tip: "tlak",
  enota: "mmHg",
  privzeto: "130/80",
};

export function vprasanjeTlak(vir: Vir): VprasanjeIzbira {
  return {
    id: "tlak",
    tip: "izbira",
    besedilo: "Izmerite krvni tlak. Kakšen je?",
    odgovori: [
      { id: "pod-ciljem", besedilo: "Pod {ciljniTlak}" },
      { id: "nad-ciljem", besedilo: "{ciljniTlak} ali več" },
      { id: "nimam", besedilo: "Nimam ga", steje: false },
    ],
    vednoVprasaj: true,
    privzetoIzbrano: true,
    pogostost: "dnevno",
    vir,
  };
}

// No guideline gives a red flag for a single home reading. "Above target several
// days in a row" needs a number of days (T-42), so that rule is not added yet.
export const PRAVILO_BREZ_MERILNIKA: Pravilo = {
  id: "tlak-brez-merilnika",
  tip: "odgovor",
  vprasanje: "tlak",
  odgovori: ["nimam"],
  stopnja: "opomba",
  razlog: "Brez merilnika tlaka",
  vir: { opis: "docs/checkin-questions.md, skupno pravilo za krvni tlak", potrjeno: true },
};

// --- Wound and fever after surgery (ECDC HAI-Net SSI protocol v2.3)

const ECDC_POVRSINSKA: Vir = {
  opis: "ECDC HAI-Net SSI v2.3, 3.1.1: gnojni izcedek; bolečina, oteklina, rdečina ali toplota",
  potrjeno: true,
};
const ECDC_VROCINA: Vir = { opis: "ECDC HAI-Net SSI v2.3, 3.1.2: vročina (> 38 °C)", potrjeno: true };

export function vprasanjeRana(rdecaBesedilo: string, privzetoIzbrano: boolean, opomba?: string): VprasanjeIzbira {
  return {
    id: "rana",
    tip: "izbira",
    besedilo: "Kakšna je rana?",
    odgovori: [
      { id: "v-redu", besedilo: "V redu" },
      { id: "rdeca", besedilo: rdecaBesedilo },
      { id: "cedi", besedilo: "Iz nje se cedi" },
    ],
    vednoVprasaj: false,
    privzetoIzbrano,
    pogostost: "dnevno",
    fotografija: true,
    opomba,
    vir: ECDC_POVRSINSKA,
  };
}

export const PRAVILO_RANA: Pravilo = {
  id: "rana",
  tip: "odgovor",
  vprasanje: "rana",
  odgovori: ["rdeca", "cedi"],
  stopnja: "opozorilo",
  razlog: "Rana je rdeča, otekla ali se cedi",
  vir: ECDC_POVRSINSKA,
};

export function vprasanjeVrocina(privzetoIzbrano: boolean, opomba?: string): VprasanjeIzbira {
  return {
    id: "vrocina",
    tip: "izbira",
    besedilo: "Ali imate vročino 38 °C ali več?",
    odgovori: NE_DA,
    vednoVprasaj: false,
    privzetoIzbrano,
    pogostost: "dnevno",
    opomba,
    vir: ECDC_VROCINA,
  };
}

export const PRAVILO_VROCINA: Pravilo = {
  id: "vrocina",
  tip: "odgovor",
  vprasanje: "vrocina",
  odgovori: ["da"],
  stopnja: "opozorilo",
  razlog: "Vročina 38 °C ali več",
  vir: ECDC_VROCINA,
};

// --- Opažanja svojcev (T-73): plain notes, no threshold, no alert unless the
// zadolženec asks for a nurse to look ("Da, prosim, naj sestra pogleda").
export const OPAZANJA_SPLOSNA: Opazanje[] = [
  { id: "zmeden", besedilo: "Bolj zmeden ali pozabljiv" },
  { id: "manj-je", besedilo: "Manj je ali pije" },
  { id: "slabse-spi", besedilo: "Slabše spi" },
  { id: "manj-se-giblje", besedilo: "Manj se giblje kot prej" },
  { id: "zalosten", besedilo: "Bolj žalosten ali brez volje" },
  { id: "zdravila-neredno", besedilo: "Zdravil ne jemlje redno" },
];
