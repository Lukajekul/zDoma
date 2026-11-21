// Nov kolk ali koleno. Questions and rules: docs/checkin-questions.md §3.
import { AGENTS_112, NE_DA, PRAVILO_RANA, PRAVILO_VROCINA, vprasanjeRana, vprasanjeVrocina } from "./skupno";
import type { Predloga, Vir } from "./types";

const ESA_VTE: Vir = { opis: "ESA, evropske smernice za preprečevanje VTE 2018 (+2024), ni prebrano", potrjeno: false };

export const kolkKoleno: Predloga = {
  id: "kolk-koleno",
  ime: "Nov kolk ali koleno",
  opis: "Po zamenjavi kolka ali kolena",
  privzetoTrajanjeDni: 90,
  trajanjeVir: { opis: "ECDC HAI-Net SSI v2.3: globoka okužba ob vsadku se spremlja 90 dni", potrjeno: true },
  vrednostiPacienta: [],
  vprasanja: [
    vprasanjeRana("Bolj rdeča, otekla, topla ali boleča", true),
    vprasanjeVrocina(true),
    {
      id: "meca",
      tip: "izbira",
      besedilo: "Ali je ena meča otekla, topla ali boleča?",
      odgovori: NE_DA,
      vednoVprasaj: false,
      privzetoIzbrano: true,
      pogostost: "dnevno",
      vir: ESA_VTE,
    },
    {
      id: "dusenje-prsi",
      tip: "izbira",
      besedilo: "Ali vas je nenadoma začelo dušiti ali vas boli v prsih?",
      odgovori: NE_DA,
      vednoVprasaj: false,
      privzetoIzbrano: true,
      pogostost: "dnevno",
      vir: ESA_VTE,
    },
    {
      id: "bolecina",
      tip: "izbira",
      besedilo: "Kako močna je bolečina danes?",
      odgovori: [
        { id: "0-2", besedilo: "0–2" },
        { id: "3-5", besedilo: "3–5" },
        { id: "6-8", besedilo: "6–8" },
        { id: "9-10", besedilo: "9–10" },
      ],
      vednoVprasaj: false,
      privzetoIzbrano: true,
      pogostost: "dnevno",
      vir: { opis: "Ni evropskega vira za naraščanje bolečine", potrjeno: false },
    },
  ],
  pravila: [
    PRAVILO_RANA,
    PRAVILO_VROCINA,
    {
      id: "meca",
      tip: "odgovor",
      vprasanje: "meca",
      odgovori: ["da"],
      stopnja: "opozorilo",
      razlog: "Otekla, topla ali boleča meča (možen strdek)",
      vir: ESA_VTE,
    },
    {
      id: "dusenje-prsi-112",
      tip: "odgovor",
      vprasanje: "dusenje-prsi",
      odgovori: ["da"],
      stopnja: "klic112",
      razlog: "Nenadna težka sapa ali bolečina v prsih",
      vir: { ...AGENTS_112, potrjeno: false },
    },
    {
      id: "bolecina-narasca",
      tip: "narascaVDneh",
      vprasanje: "bolecina",
      dni: 3,
      stopnja: "opozorilo",
      razlog: "Bolečina narašča {dni} dni zapored",
      vir: { opis: "docs/checkin-questions.md §3, ni evropskega vira", potrjeno: false },
    },
  ],
  // TODO(T-37): recommended medicines from docs/medicines.md.
  zdravila: [],
  // TODO(T-17): physio exercises from docs/rehab-content.md.
  vaje: [],
};
