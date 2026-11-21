// Structural check for a template. Returns a list of problems (empty = valid).
import { NAJVEC_DNEVNIH_VPRASANJ, type Predloga } from "./types";

const PLACEHOLDER = /\{(\w+)\}/g;
// Placeholders the triage engine fills in reason texts, not patient values.
const RAZLOG_POLJA = new Set(["razlika", "dni"]);

function placeholders(besedilo: string): string[] {
  return [...besedilo.matchAll(PLACEHOLDER)].map((m) => m[1]);
}

function podvojeni(ids: string[]): string[] {
  return ids.filter((id, i) => ids.indexOf(id) !== i);
}

export function preveriPredlogo(p: Predloga): string[] {
  const napake: string[] = [];
  const kljuci = new Set(p.vrednostiPacienta.map((v) => v.kljuc));

  const dnevna = p.vprasanja.filter((v) => v.pogostost === "dnevno" && v.privzetoIzbrano);
  if (dnevna.length > NAJVEC_DNEVNIH_VPRASANJ) {
    napake.push(`${dnevna.length} daily questions pre-ticked, max ${NAJVEC_DNEVNIH_VPRASANJ}`);
  }
  if (p.vprasanja.length === 0) napake.push("no questions");
  if (!(p.privzetoTrajanjeDni > 0)) napake.push("privzetoTrajanjeDni must be > 0");

  for (const id of podvojeni(p.vprasanja.map((v) => v.id))) napake.push(`duplicate question id ${id}`);
  for (const id of podvojeni(p.pravila.map((r) => r.id))) napake.push(`duplicate rule id ${id}`);
  for (const k of podvojeni(p.vrednostiPacienta.map((v) => v.kljuc))) napake.push(`duplicate value ${k}`);

  const besedila: string[] = [];
  for (const v of p.vprasanja) {
    besedila.push(v.besedilo);
    if (v.tip === "izbira") {
      if (v.odgovori.length < 2) napake.push(`${v.id}: needs at least 2 answers`);
      for (const id of podvojeni(v.odgovori.map((o) => o.id))) napake.push(`${v.id}: duplicate answer ${id}`);
      besedila.push(...v.odgovori.map((o) => o.besedilo));
    } else if (!(v.korak > 0)) {
      napake.push(`${v.id}: korak must be > 0`);
    }
  }
  for (const b of besedila) {
    for (const k of placeholders(b)) if (!kljuci.has(k)) napake.push(`unknown placeholder {${k}} in "${b}"`);
  }

  for (const r of p.pravila) {
    const v = p.vprasanja.find((q) => q.id === r.vprasanje);
    if (!r.razlog.trim()) napake.push(`${r.id}: empty razlog`);
    for (const k of placeholders(r.razlog)) {
      if (!RAZLOG_POLJA.has(k) && !kljuci.has(k)) napake.push(`${r.id}: unknown placeholder {${k}}`);
    }
    if (!v) {
      napake.push(`${r.id}: unknown question ${r.vprasanje}`);
      continue;
    }
    if (r.tip === "odgovor" || r.tip === "zaporedniDnevi") {
      if (v.tip !== "izbira") napake.push(`${r.id}: needs a choice question`);
      else {
        for (const o of r.odgovori) {
          if (!v.odgovori.some((a) => a.id === o)) napake.push(`${r.id}: unknown answer ${o}`);
        }
      }
    }
    if ((r.stopnja === "klic112" || r.stopnja === "klicOddelek") && r.tip !== "odgovor") {
      napake.push(`${r.id}: emergency rules must be single-answer rules`);
    }
    if (r.stopnja === "klicOddelek" && !kljuci.has("telefonOddelka")) {
      napake.push(`${r.id}: klicOddelek needs a telefonOddelka value`);
    }
    if ((r.tip === "porastVDneh" || r.tip === "nadVrednostjo") && v.tip !== "teza") {
      napake.push(`${r.id}: needs a number question`);
    }
    if (r.tip === "nadVrednostjo" && !kljuci.has(r.vrednost)) napake.push(`${r.id}: unknown value ${r.vrednost}`);
    if (r.tip === "narascaVDneh" && v.tip !== "izbira") napake.push(`${r.id}: needs a choice question`);
    if ("dni" in r && !(r.dni >= 2)) napake.push(`${r.id}: dni must be >= 2`);
  }

  for (const z of p.zdravila) {
    if (z.odmerki.length < 1 || z.odmerki.length > 4) napake.push(`${z.ime}: needs 1–4 dose options`);
    if (z.casi.length === 0 && !z.poPotrebi) napake.push(`${z.ime}: needs a time of day or poPotrebi`);
    if (podvojeni(z.casi).length) napake.push(`${z.ime}: duplicate time of day`);
    for (const f of ["ime", "ucinkovina", "nacin", "urnik", "zaKaj", "kdaj"] as const) {
      if (!z[f].trim()) napake.push(`${z.ime}: empty ${f}`);
    }
  }
  for (const id of podvojeni(p.zdravila.map((z) => z.ime))) napake.push(`duplicate medicine ${id}`);
  for (const id of podvojeni(p.vaje.map((v) => v.id))) napake.push(`duplicate exercise id ${id}`);
  for (const v of p.vaje) {
    if (v.koraki.length === 0) napake.push(`${v.id}: no steps`);
    if (!v.naslov.trim() || !v.ponovitve.trim()) napake.push(`${v.id}: empty naslov or ponovitve`);
    if (v.slika && !/^\/vaje\/[a-z0-9-]+\.svg$/.test(v.slika)) napake.push(`${v.id}: slika must be /vaje/<name>.svg`);
    if (v.slika && !v.slikaOpis?.trim()) napake.push(`${v.id}: picture needs slikaOpis`);
  }

  return napake;
}
