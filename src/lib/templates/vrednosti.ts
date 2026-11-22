// Which patient values a rehabilitacija needs, and medicine names taken from
// its own medicines (T-70). Pure, generic: reads only template data.
import type { Predloga, VrednostPacienta } from "./types";

const PLACEHOLDER = /\{(\w+)\}/g;
const kljuciV = (besedilo: string) => [...besedilo.matchAll(PLACEHOLDER)].map((m) => m[1]);
const norm = (s: string) => s.trim().toLocaleLowerCase("sl-SI");

/** "besedilo" = shown to the patient, must be filled; "pravilo" = only a rule threshold, optional. */
export type Potreba = "besedilo" | "pravilo";

/**
 * Patient values the ticked questions need: placeholders in their texts and
 * their rules' reasons are required, a rule's comparison value (e.g. dry
 * weight) is optional, the ward phone is required when a ticked question can
 * lead to "call the ward".
 */
export function potrebneVrednosti(p: Predloga, izbrana: string[]): Map<string, Potreba> {
  const out = new Map<string, Potreba>();
  const zahtevaj = (k: string) => out.set(k, "besedilo");
  for (const q of p.vprasanja) {
    if (!izbrana.includes(q.id)) continue;
    kljuciV(q.besedilo).forEach(zahtevaj);
    if (q.tip === "izbira") q.odgovori.forEach((o) => kljuciV(o.besedilo).forEach(zahtevaj));
    if (q.tip === "izbira" && q.izZdravil) zahtevaj(q.izZdravil.vrednost);
  }
  for (const r of p.pravila) {
    if (!izbrana.includes(r.vprasanje)) continue;
    for (const k of kljuciV(r.razlog)) if (p.vrednostiPacienta.some((v) => v.kljuc === k)) zahtevaj(k);
    if (r.tip === "nadVrednostjo" && !out.has(r.vrednost)) out.set(r.vrednost, "pravilo");
    if (r.stopnja === "klicOddelek") p.vrednostiPacienta.filter((v) => v.tip === "telefon").forEach((v) => zahtevaj(v.kljuc));
  }
  return out;
}

/** The value is filled from the rehabilitacija's medicines, never typed. */
export const izZdravil = (v: VrednostPacienta) => v.tip === "zdravilo" && !!v.zdravila?.length;

type ZdraviloVrstica = { name: string; active_substance?: string | null };

/** Does this medicine (by name or active substance) fill value `kljuc`? */
export function polniVrednost(p: Predloga, kljuc: string, m: ZdraviloVrstica): boolean {
  const v = p.vrednostiPacienta.find((x) => x.kljuc === kljuc);
  if (!v?.zdravila?.length) return false;
  const imena = new Set<string>();
  for (const ime of v.zdravila) {
    const z = p.zdravila.find((x) => x.ime === ime);
    imena.add(norm(ime));
    if (z) imena.add(norm(z.ucinkovina));
  }
  return imena.has(norm(m.name)) || (!!m.active_substance && imena.has(norm(m.active_substance)));
}

const seznam = new Intl.ListFormat("sl-SI", { type: "conjunction" });

/** Medicine-name values found in the given medicines, e.g. "Plavix in Eliquis". Values with no match are left out. */
export function vrednostiIzZdravil(p: Predloga, zdravila: ZdraviloVrstica[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const v of p.vrednostiPacienta) {
    if (!izZdravil(v)) continue;
    const imena = [...new Set(zdravila.filter((m) => polniVrednost(p, v.kljuc, m)).map((m) => m.name.trim()))];
    if (imena.length) out[v.kljuc] = seznam.format(imena);
  }
  return out;
}

/** Template defaults (e.g. "130/80", "zdravilo za vodo") for values not set otherwise. */
export function privzeteVrednosti(p: Predloga): Record<string, string | number> {
  return Object.fromEntries(p.vrednostiPacienta.flatMap((v) => (v.privzeto === undefined ? [] : [[v.kljuc, v.privzeto]])));
}
