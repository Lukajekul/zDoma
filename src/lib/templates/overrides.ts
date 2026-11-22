// T-24: staff edits of a template's plan defaults, merged over the file
// template. Only defaults can change: default length, which check-in questions
// start ticked, which exercises start ticked and their repetitions. Rules,
// thresholds, question texts and medicines always come from the files.
// T-69: staff may also add their own questions and exercises (`lastno.ts`).
// Pure, no I/O; the stored JSON is checked here before it is used.
import {
  preberiLastnaVprasanja, preberiLastneVaje, preveriLastnoVajo, preveriLastnoVprasanje, zLastnimi,
} from "./lastno";
import { NAJVEC_DNEVNIH_VPRASANJ, type LastnaVaja, type LastnoVprasanje, type Predloga } from "./types";

export interface PrilagoditevVaje {
  izbrana: boolean;
  /** New repetitions text; omitted = the file's text. */
  ponovitve?: string;
}

export interface Prilagoditev {
  privzetoTrajanjeDni?: number;
  /** Ids of the questions that start ticked. Omitted = the file's choice. */
  izbranaVprasanja?: string[];
  vaje?: Record<string, PrilagoditevVaje>;
  /** Doctors' own questions for every new patient of this template (T-69). */
  lastnaVprasanja?: LastnoVprasanje[];
  /** Doctors' own exercises for every new patient of this template (T-69). */
  lastneVaje?: LastnaVaja[];
}

/** The file template with the override's own questions and exercises added (before ticks are applied). */
const osnova = (p: Predloga, o: Prilagoditev) => zLastnimi(p, o.lastnaVprasanja, o.lastneVaje);

export const NAJVEC_DNI = 365;
const NAJVEC_PONOVITVE = 200;

/** Problems with an override for this template (Slovenian, shown to staff). Empty = valid. */
export function preveriPrilagoditev(p: Predloga, o: Prilagoditev): string[] {
  const napake: string[] = [];
  for (const q of o.lastnaVprasanja ?? []) napake.push(...preveriLastnoVprasanje(q));
  for (const v of o.lastneVaje ?? []) napake.push(...preveriLastnoVajo(v));
  const b = osnova(p, o);
  if (b.vprasanja.length !== p.vprasanja.length + (o.lastnaVprasanja?.length ?? 0)) napake.push("Vprašanje se ponavlja.");
  if (b.vaje.length !== p.vaje.length + (o.lastneVaje?.length ?? 0)) napake.push("Vaja se ponavlja.");
  if (o.privzetoTrajanjeDni !== undefined) {
    const d = o.privzetoTrajanjeDni;
    if (!Number.isInteger(d) || d < 1 || d > NAJVEC_DNI) napake.push(`Trajanje mora biti od 1 do ${NAJVEC_DNI} dni.`);
  }
  if (o.izbranaVprasanja !== undefined) {
    const znana = new Set(b.vprasanja.map((q) => q.id));
    if (o.izbranaVprasanja.some((id) => !znana.has(id))) napake.push("Neznano vprašanje.");
    const dnevna = b.vprasanja.filter((q) => q.pogostost === "dnevno" && o.izbranaVprasanja!.includes(q.id)).length;
    if (dnevna === 0) napake.push("Izberite vsaj eno dnevno vprašanje.");
    if (dnevna > NAJVEC_DNEVNIH_VPRASANJ) napake.push(`Največ ${NAJVEC_DNEVNIH_VPRASANJ} dnevnih vprašanj.`);
  } else if (b.vprasanja.filter((q) => q.pogostost === "dnevno" && q.privzetoIzbrano).length > NAJVEC_DNEVNIH_VPRASANJ) {
    napake.push(`Največ ${NAJVEC_DNEVNIH_VPRASANJ} dnevnih vprašanj.`);
  }
  for (const [id, v] of Object.entries(o.vaje ?? {})) {
    if (!b.vaje.some((x) => x.id === id)) napake.push("Neznana vaja.");
    if (typeof v.izbrana !== "boolean") napake.push("Neveljavna izbira vaje.");
    if (v.ponovitve !== undefined && (!v.ponovitve.trim() || v.ponovitve.length > NAJVEC_PONOVITVE)) {
      napake.push(`Ponovitve: vpišite besedilo do ${NAJVEC_PONOVITVE} znakov.`);
    }
  }
  return [...new Set(napake)];
}

/** Reads stored JSON into an override; anything malformed is dropped. */
export function preberiPrilagoditev(json: unknown): Prilagoditev {
  if (!json || typeof json !== "object" || Array.isArray(json)) return {};
  const j = json as Record<string, unknown>;
  const o: Prilagoditev = {};
  if (typeof j.privzetoTrajanjeDni === "number") o.privzetoTrajanjeDni = j.privzetoTrajanjeDni;
  if (Array.isArray(j.izbranaVprasanja) && j.izbranaVprasanja.every((x) => typeof x === "string")) {
    o.izbranaVprasanja = j.izbranaVprasanja as string[];
  }
  if (j.vaje && typeof j.vaje === "object" && !Array.isArray(j.vaje)) {
    o.vaje = {};
    for (const [id, v] of Object.entries(j.vaje as Record<string, unknown>)) {
      if (!v || typeof v !== "object") continue;
      const r = v as Record<string, unknown>;
      if (typeof r.izbrana !== "boolean") continue;
      o.vaje[id] = { izbrana: r.izbrana, ...(typeof r.ponovitve === "string" ? { ponovitve: r.ponovitve } : {}) };
    }
  }
  const lq = preberiLastnaVprasanja(j.lastnaVprasanja);
  if (lq.length) o.lastnaVprasanja = lq;
  const lv = preberiLastneVaje(j.lastneVaje);
  if (lv.length) o.lastneVaje = lv;
  return o;
}

/**
 * The template with staff defaults applied. An invalid override is ignored
 * as a whole, so a bad row can never break discharge.
 */
export function uporabiPrilagoditev(p: Predloga, o: Prilagoditev | undefined): Predloga {
  if (!o || preveriPrilagoditev(p, o).length) return p;
  const b = osnova(p, o);
  return {
    ...b,
    privzetoTrajanjeDni: o.privzetoTrajanjeDni ?? p.privzetoTrajanjeDni,
    vprasanja: o.izbranaVprasanja
      ? b.vprasanja.map((q) => ({ ...q, privzetoIzbrano: o.izbranaVprasanja!.includes(q.id) }))
      : b.vprasanja,
    vaje: b.vaje.map((v) => {
      const x = o.vaje?.[v.id];
      return x ? { ...v, privzetoIzbrano: x.izbrana, ponovitve: x.ponovitve?.trim() || v.ponovitve } : v;
    }),
  };
}

/** True when the override changes nothing compared with the file template. */
export function jePrazna(p: Predloga, o: Prilagoditev): boolean {
  const m = uporabiPrilagoditev(p, o);
  return (
    m.vprasanja.length === p.vprasanja.length &&
    m.vaje.length === p.vaje.length &&
    m.privzetoTrajanjeDni === p.privzetoTrajanjeDni &&
    m.vprasanja.every((q, i) => q.privzetoIzbrano === p.vprasanja[i].privzetoIzbrano) &&
    m.vaje.every((v, i) => (v.privzetoIzbrano ?? true) === (p.vaje[i].privzetoIzbrano ?? true) && v.ponovitve === p.vaje[i].ponovitve)
  );
}

/**
 * Keeps only what differs from the file template, so later corrections to the
 * files (e.g. a repetitions text) are not pinned by a stored copy. {} = no change.
 */
export function stisniPrilagoditev(p: Predloga, o: Prilagoditev): Prilagoditev {
  const out: Prilagoditev = {};
  if (o.lastnaVprasanja?.length) out.lastnaVprasanja = o.lastnaVprasanja;
  if (o.lastneVaje?.length) out.lastneVaje = o.lastneVaje;
  const b = osnova(p, o);
  if (o.privzetoTrajanjeDni !== undefined && o.privzetoTrajanjeDni !== p.privzetoTrajanjeDni) {
    out.privzetoTrajanjeDni = o.privzetoTrajanjeDni;
  }
  if (o.izbranaVprasanja) {
    const izvirna = b.vprasanja.filter((q) => q.privzetoIzbrano).map((q) => q.id);
    const enako = izvirna.length === o.izbranaVprasanja.length && izvirna.every((id) => o.izbranaVprasanja!.includes(id));
    if (!enako) out.izbranaVprasanja = b.vprasanja.map((q) => q.id).filter((id) => o.izbranaVprasanja!.includes(id));
  }
  for (const v of b.vaje) {
    const x = o.vaje?.[v.id];
    if (!x) continue;
    const ponovitve = x.ponovitve?.trim();
    const spremenjenePonovitve = !!ponovitve && ponovitve !== v.ponovitve;
    if (x.izbrana !== (v.privzetoIzbrano ?? true) || spremenjenePonovitve) {
      out.vaje = { ...out.vaje, [v.id]: { izbrana: x.izbrana, ...(spremenjenePonovitve ? { ponovitve } : {}) } };
    }
  }
  return out;
}

const dniBesedilo = (n: number) => `${n} dni`;

/** Added / removed / changed own items, by id. */
function razlikeLastnih<T extends { id: string }>(prej: T[] = [], potem: T[] = [], ime: (x: T) => string, vrsta: [string, string, string]) {
  const out: string[] = [];
  for (const x of potem) {
    const y = prej.find((z) => z.id === x.id);
    if (!y) out.push(`${vrsta[0]}: ${ime(x)}`);
    else if (JSON.stringify(x) !== JSON.stringify(y)) out.push(`${vrsta[2]}: ${ime(x)}`);
  }
  for (const y of prej) if (!potem.some((x) => x.id === y.id)) out.push(`${vrsta[1]}: ${ime(y)}`);
  return out;
}

/** What changed between two overrides, in short Slovenian lines for the audit view. */
export function opisSpremembe(p: Predloga, prej: Prilagoditev, potem: Prilagoditev): string[] {
  const a = uporabiPrilagoditev(p, prej);
  const b = uporabiPrilagoditev(p, potem);
  const vrstice: string[] = [];
  if (a.privzetoTrajanjeDni !== b.privzetoTrajanjeDni) {
    vrstice.push(`Trajanje: ${dniBesedilo(a.privzetoTrajanjeDni)} → ${dniBesedilo(b.privzetoTrajanjeDni)}`);
  }
  vrstice.push(
    ...razlikeLastnih(prej.lastnaVprasanja, potem.lastnaVprasanja, (q) => q.besedilo, [
      "Dodano lastno vprašanje", "Odstranjeno lastno vprašanje", "Spremenjeno lastno vprašanje",
    ]),
    ...razlikeLastnih(prej.lastneVaje, potem.lastneVaje, (v) => v.naslov, ["Dodana lastna vaja", "Odstranjena lastna vaja", "Spremenjena lastna vaja"]),
  );
  for (const qb of b.vprasanja) {
    const qa = a.vprasanja.find((q) => q.id === qb.id);
    if (qa && qa.privzetoIzbrano !== qb.privzetoIzbrano) {
      vrstice.push(`${qb.privzetoIzbrano ? "Dodano" : "Odstranjeno"} vprašanje: ${qb.besedilo}`);
    }
  }
  for (const vb of b.vaje) {
    const va = a.vaje.find((v) => v.id === vb.id);
    if (!va) continue;
    if ((va.privzetoIzbrano ?? true) !== (vb.privzetoIzbrano ?? true)) {
      vrstice.push(`${vb.privzetoIzbrano ?? true ? "Dodana" : "Odstranjena"} vaja: ${vb.naslov}`);
    }
    if (va.ponovitve !== vb.ponovitve) vrstice.push(`${vb.naslov}: ponovitve »${vb.ponovitve}«`);
  }
  return vrstice.length ? vrstice : ["Brez sprememb"];
}
