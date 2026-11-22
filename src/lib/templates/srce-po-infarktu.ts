// Po infarktu ali operaciji srca. Questions and rules: docs/checkin-questions.md §2.
import {
  CILJNI_TLAK,
  DA_NE,
  PRAVILO_BREZ_MERILNIKA,
  PRAVILO_RANA,
  PRAVILO_VROCINA,
  vprasanjeRana,
  vprasanjeTlak,
  vprasanjeVrocina,
  OPAZANJA_SPLOSNA,
} from "./skupno";
import * as vsebina from "./vsebina/srce-po-infarktu";
import type { Predloga, Vir } from "./types";

const ESC_PRSI: Vir = {
  opis: "ESC: ob bolečini ali pritisku v prsih takoj pokličite nujno pomoč; ESC ACS 2023, 3.1.1",
  potrjeno: false,
};
const EAPC: Vir = {
  opis: "EAPC 2020, tabela 1: jemanje zdravil, samospremljanje (teža, tlak, simptomi)",
  potrjeno: true,
};
const PO_OPERACIJI = "Samo po operaciji";

export const srcePoInfarktu: Predloga = {
  id: "srce-po-infarktu",
  ime: "Po infarktu ali operaciji srca",
  opis: "Srčni infarkt, opornica, obvod ali operacija zaklopke",
  // TODO(T-42): no source for the default length yet.
  privzetoTrajanjeDni: 30,
  trajanjeVir: { opis: "Privzeta dolžina, ni vira", potrjeno: false },
  vrednostiPacienta: [
    {
      kljuc: "zdraviloProtiStrjevanju",
      oznaka: "Zdravilo proti strjevanju krvi",
      tip: "zdravilo",
      zdravila: ["Acetilsalicilna kislina", "Plavix", "Brilique"],
      privzeto: "zdravilo proti strjevanju krvi",
    },
    CILJNI_TLAK,
  ],
  vprasanja: [
    {
      id: "prsi",
      tip: "izbira",
      besedilo: "Ste danes čutili bolečino ali pritisk v prsih?",
      odgovori: [
        { id: "ne", besedilo: "Ne" },
        { id: "minila", besedilo: "Da, je minila" },
        { id: "traja", besedilo: "Da, še traja" },
      ],
      vednoVprasaj: false,
      privzetoIzbrano: true,
      pogostost: "dnevno",
      vir: ESC_PRSI,
    },
    {
      id: "strjevanje",
      tip: "izbira",
      besedilo: "Ste včeraj vzeli {zdraviloProtiStrjevanju}?",
      odgovori: DA_NE,
      izZdravil: { vrednost: "zdraviloProtiStrjevanju", dniNazaj: 1, vzeto: "da" },
      vednoVprasaj: false,
      privzetoIzbrano: true,
      pogostost: "dnevno",
      vir: EAPC,
    },
    {
      id: "dusenje",
      tip: "izbira",
      besedilo: "Ali vas bolj duši kot običajno?",
      odgovori: [
        { id: "ne", besedilo: "Ne" },
        { id: "malo", besedilo: "Malo" },
        { id: "zelo", besedilo: "Zelo, tudi v mirovanju" },
      ],
      vednoVprasaj: false,
      privzetoIzbrano: true,
      pogostost: "dnevno",
      vir: { ...EAPC, potrjeno: false },
    },
    vprasanjeRana("Bolj rdeča, otekla ali boleča", false, PO_OPERACIJI),
    vprasanjeVrocina(false, PO_OPERACIJI),
    vprasanjeTlak(EAPC),
  ],
  pravila: [
    {
      id: "prsi-112",
      tip: "odgovor",
      vprasanje: "prsi",
      odgovori: ["traja"],
      stopnja: "klic112",
      razlog: "Bolečina v prsih še traja",
      vir: ESC_PRSI,
    },
    {
      id: "prsi-minila",
      tip: "odgovor",
      vprasanje: "prsi",
      odgovori: ["minila"],
      stopnja: "opozorilo",
      razlog: "Bolečina v prsih danes (minila)",
      vir: ESC_PRSI,
    },
    {
      id: "strjevanje-izpusceno",
      tip: "odgovor",
      vprasanje: "strjevanje",
      odgovori: ["ne"],
      stopnja: "opozorilo",
      razlog: "Izpuščeno zdravilo proti strjevanju krvi",
      vir: EAPC,
    },
    {
      id: "dusenje-zelo",
      tip: "odgovor",
      vprasanje: "dusenje",
      odgovori: ["zelo"],
      stopnja: "opozorilo",
      razlog: "Močno težka sapa, tudi v mirovanju",
      vir: { ...EAPC, potrjeno: false },
    },
    PRAVILO_RANA,
    PRAVILO_VROCINA,
    PRAVILO_BREZ_MERILNIKA,
  ],
  zdravila: vsebina.zdravila,
  zdravilaOpomba: vsebina.zdravilaOpomba,
  vaje: vsebina.vaje,
  vajeOpomba: vsebina.vajeOpomba,
  opazanja: [
    { id: "prsi-traja", besedilo: "Bolečina ali pritisk v prsih, ki še traja", pravilo: "prsi-112" },
    { id: "prsi-minila", besedilo: "Bolečina v prsih, ki je minila", pravilo: "prsi-minila" },
    { id: "dusenje-zelo", besedilo: "Zelo težko diha, tudi v mirovanju", pravilo: "dusenje-zelo" },
    ...OPAZANJA_SPLOSNA,
  ],
};
