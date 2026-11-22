// Synthetic demo data for T-10. All people, numbers and addresses are made up.
import type { TemplateId, TriageStatus } from "@/lib/types";

/** Deterministic PRNG so every seed run gives the same data. */
export function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
    pick: <T>(xs: readonly T[]) => xs[Math.floor(next() * xs.length)],
    chance: (p: number) => next() < p,
  };
}

/** Valid made-up davčne številke from the reserved 99xxxxxx range (check digit per AGENTS.md §6). */
export function* davcne(): Generator<string> {
  for (let n = 9900001; n < 9999999; n++) {
    const s = String(n);
    let sum = 0;
    for (let i = 0; i < 7; i++) sum += Number(s[i]) * (8 - i);
    const r = 11 - (sum % 11);
    if (r === 11) continue;
    yield s + String(r === 10 ? 0 : r);
  }
}

export interface Obcina {
  obcina: string;
  posta: string;
  ulice: string[];
}

export const OBCINE: Obcina[] = [
  { obcina: "Šentjur", posta: "3230 Šentjur", ulice: ["Mestni trg", "Ulica skladateljev Ipavcev", "Cesta Leona Dobrotinška"] },
  { obcina: "Celje", posta: "3000 Celje", ulice: ["Ljubljanska cesta", "Mariborska cesta", "Gubčeva ulica", "Ipavčeva ulica"] },
  { obcina: "Laško", posta: "3270 Laško", ulice: ["Aškerčev trg", "Trubarjeva ulica", "Valvasorjeva ulica"] },
  { obcina: "Žalec", posta: "3310 Žalec", ulice: ["Savinjska cesta", "Šlandrova ulica", "Hmeljarska ulica"] },
  { obcina: "Vojnik", posta: "3212 Vojnik", ulice: ["Keršova ulica", "Celjska cesta"] },
  { obcina: "Slovenske Konjice", posta: "3210 Slovenske Konjice", ulice: ["Stari trg", "Mestni trg", "Delavska cesta"] },
  // No patronažna sestra covers Šmarje: these patients are "Nedodeljeni".
  { obcina: "Šmarje pri Jelšah", posta: "3240 Šmarje pri Jelšah", ulice: ["Aškerčev trg", "Celjska cesta"] },
];

export interface Bolnicar {
  key: string;
  first: string;
  last: string;
  /** Fixed, so logins in docs/demo-accounts.md stay the same after a re-seed. */
  davcna: string;
  /** Občine this patronažna sestra covers; empty = hospital staff. */
  tereni: string[];
}

/** Staff login email (T-67): "Mojca Kovač" → mojca.kovac@zdoma.demo. Made up, never a real address. */
export function staffEmail(b: Pick<Bolnicar, "first" | "last">): string {
  const slug = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]+/g, "-");
  return `${slug(b.first)}.${slug(b.last)}@zdoma.demo`;
}

/** T-87: one patronažna sestra for every občina except Šmarje, and one hospital nurse. */
export const BOLNICARJI: Bolnicar[] = [
  { key: "mojca", first: "Mojca", last: "Kovač", davcna: "99000016",
    tereni: ["Šentjur", "Celje", "Laško", "Žalec", "Vojnik", "Slovenske Konjice"] },
  { key: "tina", first: "Tina", last: "Bizjak", davcna: "99000059", tereni: [] },
];

/** Davčne številke of the demo story; kept from earlier seeds so docs and scripts/demo-plan.mts still match. */
export const DEMO_DAVCNE = {
  janez: "99000075",
  marija: "99000083",
  stanko: "99000091",
  ana: "99000580",
  vesna: "99000652",
  student: "99000679",
} as const;

export interface Polnilo {
  first: string;
  last: string;
  obcina: string;
  predloga: TemplateId;
  profil: TriageStatus;
}

/** T-87: a few fixed patients around the demo story, so the dashboard looks real but stays short. */
export const POLNILA: Polnilo[] = [
  { first: "Franc", last: "Horvat", obcina: "Šentjur", predloga: "srcno-popuscanje", profil: "rdece" },
  { first: "Olga", last: "Vidmar", obcina: "Slovenske Konjice", predloga: "kopb", profil: "rumeno" },
  // Šmarje has no patronažna sestra: shows up under "Nedodeljeni".
  { first: "Ivana", last: "Krajnc", obcina: "Šmarje pri Jelšah", predloga: "srce-po-infarktu", profil: "rumeno" },
  { first: "Rudi", last: "Kolar", obcina: "Vojnik", predloga: "kolk-koleno", profil: "zeleno" },
  { first: "Milena", last: "Rozman", obcina: "Laško", predloga: "mozganska-kap", profil: "zeleno" },
];

export const DIAGNOZA: Record<TemplateId, string> = {
  "srcno-popuscanje": "Srčno popuščanje",
  "srce-po-infarktu": "Po srčnem infarktu",
  "kolk-koleno": "Nov kolk ali koleno",
  kopb: "Kronična obstruktivna pljučna bolezen (KOPB)",
  "mozganska-kap": "Po možganski kapi",
  "rak-sistemsko": "Rak – zdravljenje s tabletami ali infuzijami",
};
