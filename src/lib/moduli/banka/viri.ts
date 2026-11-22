// Sources for the item bank. `potrjeno: false` = example wording or threshold
// from the research report, still to be confirmed by a clinician (T-77).
import type { Vir } from "@/lib/templates";

export const HFA: Vir = { opis: "HFA/ESC self-care, Jaarsma et al. Eur J Heart Fail 2021;23:157–174", potrjeno: true };
export const HFA_TEZA: Vir = {
  opis: "HFA/ESC 2021: nenaden porast teže > 2 kg v 3 dneh; heartfailurematters.org (ESC)",
  potrjeno: true,
  url: "https://www.heartfailurematters.org",
};
export const HFA_ORTOPNEJA: Vir = { opis: "HFA/ESC 2021, tabela 1: ortopneja (besedilo potrditi)", potrjeno: false };

export const NUJNO_112: Vir = {
  opis: "AGENTS.md §5a (112); zmedenost: NICE CG191 / CURB65 kot znak resnosti",
  potrjeno: false,
};

export const NICE_PLJUCNICA: Vir = {
  opis: "NICE CG191: vročina naj mine v ~1 tednu, kašelj in težka sapa se izboljšata v ~6 tednih",
  potrjeno: false,
  url: "https://www.nice.org.uk/guidance/cg191",
};
export const NICE_KASELJ: Vir = { opis: "NICE QS110: pljučnica pri odraslih", potrjeno: false, url: "https://www.nice.org.uk/guidance/qs110" };

export const NICE_SKLEP: Vir = {
  opis: "NICE NG157: zamenjava sklepa – bolečina, rana, rehabilitacija",
  potrjeno: false,
  url: "https://www.nice.org.uk/guidance/ng157",
};
export const ECDC_RANA: Vir = {
  opis: "ECDC HAI-Net SSI v2.3, 3.1.1: gnojni izcedek; bolečina, oteklina, rdečina ali toplota",
  potrjeno: true,
};
export const ESA_VTE: Vir = { opis: "ESA, evropske smernice za preprečevanje VTE 2018 (+2024), ni prebrano", potrjeno: false };

export const ODPUSTNI_RECEPT: Vir = { opis: "Zdravilo na odpustnem receptu; navodilo za uporabo (SmPC)", potrjeno: false };

export const EUROQOL: Vir = {
  opis: "EQ-5D-5L, uradna slovenska različica (EuroQol); uporaba šele po registraciji",
  potrjeno: false,
  url: "https://euroqol.org/register/",
};
