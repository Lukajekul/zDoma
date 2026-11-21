// Možganska kap. Questions and rules: docs/checkin-questions.md §5.
import { CILJNI_TLAK, DA_NE, NE_DA, PRAVILO_BREZ_MERILNIKA, vprasanjeTlak } from "./skupno";
import type { Predloga, Vir } from "./types";

const SAPE: Vir = { opis: "ESO + SAFE, Stroke Action Plan for Europe, laična različica 2023", potrjeno: true };

export const mozganskaKap: Predloga = {
  id: "mozganska-kap",
  ime: "Možganska kap",
  opis: "Po možganski kapi ali TIA",
  // TODO(T-42): no source for the default length yet.
  privzetoTrajanjeDni: 30,
  trajanjeVir: { opis: "Privzeta dolžina, ni vira", potrjeno: false },
  vrednostiPacienta: [
    { kljuc: "zdraviloProtiStrjevanju", oznaka: "Zdravilo proti strjevanju krvi", tip: "zdravilo" },
    CILJNI_TLAK,
  ],
  vprasanja: [
    {
      id: "znaki-kapi",
      tip: "izbira",
      besedilo: "Ste opazili nov povešen kot ust, šibko roko ali nogo ali težave z govorom?",
      odgovori: NE_DA,
      vednoVprasaj: false,
      privzetoIzbrano: true,
      pogostost: "dnevno",
      vir: { opis: "SAP-E: kap je nujno stanje, pokličite reševalce; znaki GROM/FAST", potrjeno: false },
    },
    vprasanjeTlak({ opis: "ESO 2022: cilj < 130/80 mmHg; SAP-E: redno merjenje tlaka", potrjeno: true }),
    {
      id: "strjevanje",
      tip: "izbira",
      besedilo: "Ste včeraj vzeli {zdraviloProtiStrjevanju}?",
      odgovori: DA_NE,
      vednoVprasaj: false,
      privzetoIzbrano: true,
      pogostost: "dnevno",
      vir: SAPE,
    },
    {
      id: "padec",
      tip: "izbira",
      besedilo: "Ste od včeraj padli?",
      odgovori: NE_DA,
      vednoVprasaj: false,
      privzetoIzbrano: true,
      pogostost: "dnevno",
      vir: SAPE,
    },
    {
      id: "poziranje",
      tip: "izbira",
      besedilo: "Ste se pri jedi ali pitju zakašljali ali zadušili?",
      odgovori: NE_DA,
      vednoVprasaj: false,
      privzetoIzbrano: true,
      pogostost: "dnevno",
      vir: { opis: "ESO/ESSD 2021: presejanje požiranja (v bolnišnici); doma naša izbira", potrjeno: false },
    },
    {
      id: "razpolozenje",
      tip: "izbira",
      besedilo: "Ste se zadnje dni počutili žalostni ali brez volje?",
      odgovori: NE_DA,
      vednoVprasaj: false,
      privzetoIzbrano: true,
      pogostost: "tedensko",
      vir: { opis: "SAP-E: ocena naj vključuje požiranje in razpoloženje", potrjeno: true },
    },
  ],
  pravila: [
    {
      id: "znaki-kapi-112",
      tip: "odgovor",
      vprasanje: "znaki-kapi",
      odgovori: ["da"],
      stopnja: "klic112",
      razlog: "Novi znaki kapi (obraz, roka, govor)",
      vir: SAPE,
    },
    {
      id: "strjevanje-izpusceno",
      tip: "odgovor",
      vprasanje: "strjevanje",
      odgovori: ["ne"],
      stopnja: "opozorilo",
      razlog: "Izpuščeno zdravilo proti strjevanju krvi",
      vir: SAPE,
    },
    {
      id: "padec",
      tip: "odgovor",
      vprasanje: "padec",
      odgovori: ["da"],
      stopnja: "opozorilo",
      razlog: "Padec od včeraj",
      vir: SAPE,
    },
    {
      id: "poziranje",
      tip: "odgovor",
      vprasanje: "poziranje",
      odgovori: ["da"],
      stopnja: "opozorilo",
      razlog: "Kašelj ali dušenje pri jedi ali pitju",
      vir: { opis: "ESO/ESSD 2021, doma naša izbira", potrjeno: false },
    },
    // The weekly mood question has no alert rule in the docs: the nurse sees the answer.
    PRAVILO_BREZ_MERILNIKA,
  ],
  // TODO(T-37): recommended medicines from docs/medicines.md.
  zdravila: [],
  // TODO(T-17): mobility exercises from docs/rehab-content.md.
  vaje: [],
};
