// Used only while the templates have no `zdravila` / `vaje` yet (T-44 fills them).
// Copied from docs/medicines.md (T-37) and docs/rehab-content.md (T-17): first
// listed dose and schedule, plain-language purpose. Seed data only, not advice.
import type { Predloga, Vaja, Zdravilo } from "@/lib/templates";
import type { TemplateId } from "@/lib/types";

const VIR = { opis: "docs/medicines.md (T-37)", potrjeno: false };
const VIR_VAJE = { opis: "docs/rehab-content.md (T-17)", potrjeno: false };

const z = (ime: string, ucinkovina: string, odmerki: string[], casi: Zdravilo["casi"], zaKaj: string): Zdravilo => ({
  ime, ucinkovina, odmerki, casi, zaKaj, vir: VIR,
});
const v = (id: string, naslov: string, ponovitve: string): Vaja => ({ id, naslov, koraki: [], ponovitve, vir: VIR_VAJE });

const ZDRAVILA: Record<TemplateId, Zdravilo[]> = {
  "srcno-popuscanje": [
    z("Furosemid", "furosemid", ["40 mg", "80 mg"], ["zjutraj"], "Odvaja odvečno vodo in zmanjša otekanje."),
    z("Bisoprolol", "bisoprolol", ["2,5 mg", "5 mg"], ["zjutraj"], "Upočasni utrip, da srce dela z manj napora."),
    z("Entresto", "sakubitril + valsartan", ["49/51 mg", "97/103 mg"], ["zjutraj", "zvecer"], "Srcu olajša črpanje krvi."),
    z("Forxiga", "dapagliflozin", ["10 mg"], ["zjutraj"], "Pomaga zmanjšati možnost, da se srčno popuščanje poslabša."),
  ],
  "srce-po-infarktu": [
    z("Brilique", "tikagrelor", ["90 mg"], ["zjutraj", "zvecer"], "Zmanjša možnost nastanka strdka v žilah srca."),
    z("Aspirin", "acetilsalicilna kislina", ["100 mg", "75 mg"], ["zjutraj"], "Zmanjša možnost nastanka strdka v žilah srca."),
    z("Atorvastatin", "atorvastatin", ["80 mg", "40 mg"], ["zvecer"], "Zniža škodljivi holesterol in varuje žile."),
  ],
  "kolk-koleno": [
    z("Xarelto", "rivaroksaban", ["10 mg"], ["zjutraj"], "Zmanjša možnost nastanka krvnega strdka po operaciji."),
    z("Paracetamol", "paracetamol", ["1.000 mg", "500 mg"], ["zjutraj", "zvecer"], "Lajša bolečino po operaciji."),
  ],
  kopb: [
    z("Trimbow", "beklometazon + formoterol + glikopironij", ["2 vdiha"], ["zjutraj", "zvecer"], "Odpira dihalne poti in zmanjšuje vnetje v njih."),
    z("Ventolin", "salbutamol", ["1 vdih", "2 vdiha"], ["zjutraj"], "Hitro odpre dihalne poti, ko težje dihate."),
  ],
  "mozganska-kap": [
    z("Plavix", "klopidogrel", ["75 mg"], ["zjutraj"], "Zmanjša možnost strdka, ki bi lahko povzročil novo kap."),
    z("Atorvastatin", "atorvastatin", ["80 mg", "40 mg"], ["zvecer"], "Zniža škodljivi holesterol in varuje žile."),
    z("Ramipril", "ramipril", ["5 mg", "2,5 mg"], ["zjutraj"], "Zniža krvni tlak in pomaga varovati žile."),
  ],
  "rak-sistemsko": [
    z("Ondansetron", "ondansetron", ["8 mg"], ["zjutraj", "zvecer"], "Pomaga preprečiti slabost in bruhanje po kemoterapiji."),
    z("Deksametazon", "deksametazon", ["8 mg"], ["zjutraj"], "Pomaga preprečiti slabost po kemoterapiji."),
  ],
};

const VAJE: Record<TemplateId, Vaja[]> = {
  "srcno-popuscanje": [v("srcno-hoja", "Hoja po ravnem", "10–15 minut na dan"), v("srcno-izteg-kolena", "Izteg kolena na stolu", "6–8 na vsako nogo")],
  "srce-po-infarktu": [v("srce-hoja", "Kratek sprehod", "5–10 minut"), v("srce-dvigi-kolen", "Dvigovanje kolen sede", "10 dvigov")],
  "kolk-koleno": [v("sklep-glezenj", "Premikanje gležnja leže", "20 premikov"), v("sklep-napni-stegno", "Napnite stegno", "10 ponovitev")],
  kopb: [v("kopb-izdih", "Počasen izdih skozi priprte ustnice", "4- do 5-krat na dan"), v("kopb-hoja", "Hoja z odmori", "10 minut")],
  "mozganska-kap": [v("kap-dvig-kolena", "Dvig kolena sede", "do 10 ponovitev"), v("kap-vstajanje", "Vstajanje s stola", "do 10 ponovitev")],
  "rak-sistemsko": [v("rak-hoja", "Nežen sprehod", "10 minut"), v("rak-stopala-sede", "Premikanje stopal sede", "10 ponovitev")],
};

/** The template, with medicines and exercises filled from the docs if it has none yet. */
export function withFallback(p: Predloga): Predloga {
  return {
    ...p,
    zdravila: p.zdravila.length ? p.zdravila : ZDRAVILA[p.id],
    vaje: p.vaje.length ? p.vaje : VAJE[p.id],
  };
}
