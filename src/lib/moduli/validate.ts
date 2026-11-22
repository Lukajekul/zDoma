// Checks the item bank's shape. Returns English messages for developers; empty = valid.
import type { Banka, Postavka } from "./types";

export function preveriBanko(b: Banka): string[] {
  const napake: string[] = [];
  const poId = new Map<string, Postavka>();
  for (const p of b.postavke) {
    if (poId.has(p.id)) napake.push(`duplicate item id ${p.id}`);
    poId.set(p.id, p);
    if (!/\.v\d+$/.test(p.id)) napake.push(`${p.id}: id must end with a version, e.g. .v1`);
    if (!p.vir?.opis) napake.push(`${p.id}: missing source`);
    if (p.tip === "izbira" && p.odgovori.length < 1) napake.push(`${p.id}: no answers`);
    if (p.raven === 0 && !p.vednoVprasaj) napake.push(`${p.id}: red flags must never be filled by "Enako kot včeraj"`);
    if (p.nadaljnje) {
      const n = poId.get(p.nadaljnje.postavka) ?? b.postavke.find((x) => x.id === p.nadaljnje!.postavka);
      if (!n) napake.push(`${p.id}: unknown follow-up ${p.nadaljnje.postavka}`);
      else if (n.raven !== 3) napake.push(`${p.id}: follow-up ${n.id} must be raven 3`);
      else if (n.nadaljnje) napake.push(`${n.id}: follow-ups are one level deep`);
      const ids = p.tip === "izbira" ? p.odgovori.map((o) => o.id) : [];
      for (const k of p.nadaljnje.ko) if (!ids.includes(k)) napake.push(`${p.id}: follow-up on unknown answer ${k}`);
    }
  }

  // Items sharing a concept must share answer ids, so any module's rules apply to whichever item is kept.
  const poKonceptu = new Map<string, Postavka>();
  for (const p of b.postavke) {
    const prvi = poKonceptu.get(p.koncept);
    if (!prvi) poKonceptu.set(p.koncept, p);
    else {
      const ids = (x: Postavka) => (x.tip === "izbira" ? x.odgovori.map((o) => o.id).join("|") : x.tip);
      if (ids(prvi) !== ids(p)) napake.push(`${p.id}: concept ${p.koncept} has different answers than ${prvi.id}`);
    }
  }

  const modulIds = new Set<string>();
  for (const m of b.moduli) {
    if (modulIds.has(m.id)) napake.push(`duplicate module id ${m.id}`);
    modulIds.add(m.id);
    const a = m.aktivacija;
    if (!a.vedno && !a.mkb10?.length && !a.posegi?.length && !a.atc?.length) napake.push(`${m.id}: never activates`);
    const lastne = new Set<string>();
    for (const pm of m.postavke) {
      const p = poId.get(pm.postavka);
      if (!p) {
        napake.push(`${m.id}: unknown item ${pm.postavka}`);
        continue;
      }
      if (p.raven === 3) napake.push(`${m.id}: follow-up ${p.id} can't be listed directly`);
      if (pm.aktivniDnevi && pm.aktivniDnevi[0] > pm.aktivniDnevi[1]) napake.push(`${m.id}: ${p.id} window is reversed`);
      lastne.add(p.id);
      if (p.nadaljnje) lastne.add(p.nadaljnje.postavka);
    }
    for (const r of m.pravila) {
      const p = poId.get(r.vprasanje);
      if (!p || !lastne.has(p.id)) {
        napake.push(`${m.id}: rule ${r.id} on an item the module doesn't list`);
        continue;
      }
      if (!r.vir?.opis || !r.razlog) napake.push(`${m.id}: rule ${r.id} needs a reason and a source`);
      const odgovori = r.tip === "odgovor" || r.tip === "zaporedniDnevi" || r.tip === "poDnevu" ? r.odgovori : [];
      const ids = p.tip === "izbira" ? p.odgovori.map((o) => o.id) : [];
      for (const o of odgovori) if (!ids.includes(o)) napake.push(`${m.id}: rule ${r.id} uses unknown answer ${o}`);
    }
    for (const p of m.postavke.map((pm) => poId.get(pm.postavka)))
      if (p?.raven === 0 && !m.pravila.some((r) => r.vprasanje === p.id && r.stopnja === "klic112"))
        napake.push(`${m.id}: red flag ${p.id} needs a klic112 rule`);
  }
  if (!b.moduli.some((m) => m.aktivacija.vedno)) napake.push("no core module (aktivacija.vedno)");
  return napake;
}
