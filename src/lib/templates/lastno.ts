// T-69: doctors' own check-in questions and exercises. Pure, no I/O.
// They become ordinary template items (a choice question, an "odgovor" rule,
// an exercise), so check-in, triage and the exercise screens need no new code.
import type { LastnaVaja, LastnoVprasanje, Predloga, PraviloOdgovor, Vaja, VprasanjeIzbira } from "./types";

export const NAJVEC_ODGOVOROV = 5;
export const NAJVEC_KORAKOV = 4;
const ID = /^lastn[oa]-[a-z0-9]{4,24}$/;
const DOLZINA = { besedilo: 200, odgovor: 60, razlog: 160, korak: 200, ponovitve: 100 };
const VIR = { opis: "Dodal zdravnik v zDoma", potrjeno: false };

/** Fresh id for a new item, e.g. "lastno-lz3k9a2f". */
export function novId(vrsta: "lastno" | "lastna"): string {
  return `${vrsta}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Answers for a Da/Ne question. */
export const DA_NE = [
  { id: "da", besedilo: "Da" },
  { id: "ne", besedilo: "Ne" },
];

const prazno = (s: unknown) => typeof s !== "string" || !s.trim();
// Braces are placeholders in template texts; keep doctors' texts plain.
const predolgo = (s: string, n: number) => s.trim().length > n || /[{}]/.test(s);

/** Problems with a custom question (Slovenian, shown to staff). Empty = valid. */
export function preveriLastnoVprasanje(q: LastnoVprasanje): string[] {
  const n: string[] = [];
  if (!ID.test(q.id)) n.push("Neveljavno vprašanje.");
  if (prazno(q.besedilo) || predolgo(q.besedilo, DOLZINA.besedilo)) n.push(`Vpišite vprašanje (do ${DOLZINA.besedilo} znakov, brez { }).`);
  if (!Array.isArray(q.odgovori) || q.odgovori.length < 2 || q.odgovori.length > NAJVEC_ODGOVOROV) {
    n.push(`Vprašanje potrebuje od 2 do ${NAJVEC_ODGOVOROV} odgovorov.`);
  } else {
    if (q.odgovori.some((o) => prazno(o.id) || prazno(o.besedilo) || predolgo(o.besedilo, DOLZINA.odgovor))) {
      n.push(`Vpišite vse odgovore (do ${DOLZINA.odgovor} znakov).`);
    }
    if (new Set(q.odgovori.map((o) => o.id)).size !== q.odgovori.length) n.push("Odgovori se ponavljajo.");
    if (new Set(q.odgovori.map((o) => o.besedilo.trim().toLowerCase())).size !== q.odgovori.length) n.push("Odgovori se ponavljajo.");
  }
  if (q.opozorilo) {
    if (!q.odgovori?.some((o) => o.id === q.opozorilo!.odgovor)) n.push("Izberite odgovor za opozorilo.");
    if (prazno(q.opozorilo.razlog) || predolgo(q.opozorilo.razlog, DOLZINA.razlog)) {
      n.push(`Vpišite razlog za opozorilo (do ${DOLZINA.razlog} znakov).`);
    }
  }
  return [...new Set(n)];
}

/** Problems with a custom exercise (Slovenian, shown to staff). Empty = valid. */
export function preveriLastnoVajo(v: LastnaVaja): string[] {
  const n: string[] = [];
  if (!ID.test(v.id)) n.push("Neveljavna vaja.");
  if (prazno(v.naslov) || predolgo(v.naslov, DOLZINA.besedilo)) n.push("Vpišite ime vaje.");
  if (!Array.isArray(v.koraki) || v.koraki.length < 1 || v.koraki.length > NAJVEC_KORAKOV) {
    n.push(`Vaja potrebuje od 1 do ${NAJVEC_KORAKOV} korakov.`);
  } else if (v.koraki.some((k) => prazno(k) || predolgo(k, DOLZINA.korak))) n.push("Vpišite vse korake.");
  if (prazno(v.ponovitve) || predolgo(v.ponovitve, DOLZINA.ponovitve)) n.push("Vpišite ponovitve ali čas.");
  return [...new Set(n)];
}

const obreži = (s: string) => s.trim();

/** Trimmed copy; drops a red flag that is switched off. */
export function ocistiVprasanje(q: LastnoVprasanje): LastnoVprasanje {
  return {
    id: q.id,
    besedilo: obreži(q.besedilo),
    odgovori: q.odgovori.map((o) => ({ id: o.id, besedilo: obreži(o.besedilo) })),
    ...(q.opozorilo ? { opozorilo: { odgovor: q.opozorilo.odgovor, razlog: obreži(q.opozorilo.razlog) } } : {}),
  };
}

export function ocistiVajo(v: LastnaVaja): LastnaVaja {
  return { id: v.id, naslov: obreži(v.naslov), koraki: v.koraki.map(obreži), ponovitve: obreži(v.ponovitve) };
}

const seznam = (json: unknown) => (Array.isArray(json) ? json.filter((x) => x && typeof x === "object") : []);

/** Reads stored JSON; anything malformed or invalid is dropped. */
export function preberiLastnaVprasanja(json: unknown): LastnoVprasanje[] {
  return seznam(json)
    .map((x) => x as LastnoVprasanje)
    .filter((q) => {
      try {
        return preveriLastnoVprasanje(q).length === 0;
      } catch {
        return false;
      }
    })
    .map(ocistiVprasanje);
}

export function preberiLastneVaje(json: unknown): LastnaVaja[] {
  return seznam(json)
    .map((x) => x as LastnaVaja)
    .filter((v) => {
      try {
        return preveriLastnoVajo(v).length === 0;
      } catch {
        return false;
      }
    })
    .map(ocistiVajo);
}

/** A custom question as a template question: daily, pre-ticked, not always asked. */
export function vVprasanje(q: LastnoVprasanje): VprasanjeIzbira {
  return {
    id: q.id,
    tip: "izbira",
    besedilo: q.besedilo,
    odgovori: q.odgovori,
    vednoVprasaj: false,
    privzetoIzbrano: true,
    pogostost: "dnevno",
    opomba: "Lastno vprašanje",
    vir: VIR,
  };
}

/** The red-flag answer as an ordinary "odgovor" rule (nurse alert, never 112). */
export function vPravilo(q: LastnoVprasanje): PraviloOdgovor | undefined {
  if (!q.opozorilo) return undefined;
  return {
    id: `${q.id}-opozorilo`,
    tip: "odgovor",
    vprasanje: q.id,
    odgovori: [q.opozorilo.odgovor],
    stopnja: "opozorilo",
    razlog: q.opozorilo.razlog,
    vir: VIR,
  };
}

export function vVajo(v: LastnaVaja): Vaja {
  return { id: v.id, naslov: v.naslov, koraki: v.koraki, ponovitve: v.ponovitve, privzetoIzbrano: true, vir: VIR };
}

/** The template with custom questions, their rules and custom exercises appended. Ids already present are skipped. */
export function zLastnimi(p: Predloga, vprasanja: LastnoVprasanje[] = [], vaje: LastnaVaja[] = []): Predloga {
  const noviQ = vprasanja.filter((q, i) => !p.vprasanja.some((x) => x.id === q.id) && vprasanja.findIndex((x) => x.id === q.id) === i);
  const noveV = vaje.filter((v, i) => !p.vaje.some((x) => x.id === v.id) && vaje.findIndex((x) => x.id === v.id) === i);
  if (!noviQ.length && !noveV.length) return p;
  return {
    ...p,
    vprasanja: [...p.vprasanja, ...noviQ.map(vVprasanje)],
    pravila: [...p.pravila, ...noviQ.flatMap((q) => vPravilo(q) ?? [])],
    vaje: [...p.vaje, ...noveV.map(vVajo)],
    lastnaVprasanja: [...(p.lastnaVprasanja ?? []), ...noviQ],
    lastneVaje: [...(p.lastneVaje ?? []), ...noveV],
  };
}
