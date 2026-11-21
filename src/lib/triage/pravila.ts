// Evaluates one template rule against today's answers and the history.
// Generic: knows rule types, never conditions or question ids.
import { vstaviVrednosti } from "@/lib/templates";
import type { Pravilo, Predloga, Vprasanje } from "@/lib/templates";
import type { CheckinAnswer, CheckinAnswers, IsoDate, PatientValues } from "@/lib/types";
import { razlikaDni } from "./datumi";

export interface DanOdgovori {
  datum: IsoDate;
  odgovori: CheckinAnswers;
}

export interface Kontekst {
  predloga: Predloga;
  vrednosti: PatientValues;
  danes: DanOdgovori;
  /** Earlier check-ins of this rehabilitacija, any order. */
  prejsnji: DanOdgovori[];
}

const kg = new Intl.NumberFormat("sl-SI", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function stevilo(a: CheckinAnswer | undefined): number | undefined {
  if (typeof a === "number" && Number.isFinite(a)) return a;
  if (typeof a === "string" && a.trim() !== "") {
    const n = Number(a.replace(",", "."));
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/** Answers to one question on consecutive days ending today (stops at the first gap). */
function zaporedni(k: Kontekst, vprasanje: string, dni: number): CheckinAnswer[] | undefined {
  const poDnevih = new Map<number, CheckinAnswer>();
  for (const d of k.prejsnji) {
    const nazaj = razlikaDni(d.datum, k.danes.datum);
    const a = d.odgovori[vprasanje];
    if (nazaj > 0 && nazaj < dni && a !== undefined) poDnevih.set(nazaj, a);
  }
  const niz: CheckinAnswer[] = [];
  for (let nazaj = dni - 1; nazaj >= 1; nazaj--) {
    const a = poDnevih.get(nazaj);
    if (a === undefined) return undefined;
    niz.push(a);
  }
  niz.push(k.danes.odgovori[vprasanje]);
  return niz;
}

function indeksOdgovora(v: Vprasanje, a: CheckinAnswer): number {
  return v.tip === "izbira" ? v.odgovori.findIndex((o) => o.id === a) : -1;
}

/** Reason text when the rule fires today, otherwise undefined. */
export function oceniPravilo(p: Pravilo, k: Kontekst): string | undefined {
  const danes = k.danes.odgovori[p.vprasanje];
  if (danes === undefined) return undefined;
  const v = k.predloga.vprasanja.find((q) => q.id === p.vprasanje);
  if (!v) return undefined;
  const besedilo = (polja: Record<string, string | number> = {}) =>
    vstaviVrednosti(p.razlog, { ...k.vrednosti, ...polja });

  switch (p.tip) {
    case "odgovor":
      return p.odgovori.includes(String(danes)) ? besedilo() : undefined;

    case "porastVDneh": {
      const zdaj = stevilo(danes);
      if (zdaj === undefined) return undefined;
      const prej = k.prejsnji
        .filter((d) => {
          const nazaj = razlikaDni(d.datum, k.danes.datum);
          return nazaj > 0 && nazaj <= p.dni;
        })
        .map((d) => stevilo(d.odgovori[p.vprasanje]))
        .filter((n): n is number => n !== undefined);
      if (prej.length === 0) return undefined;
      const razlika = zdaj - Math.min(...prej);
      return razlika > p.vecKot ? besedilo({ razlika: kg.format(razlika), dni: p.dni }) : undefined;
    }

    case "nadVrednostjo": {
      const zdaj = stevilo(danes);
      const meja = stevilo(k.vrednosti[p.vrednost]);
      if (zdaj === undefined || meja === undefined) return undefined;
      const razlika = zdaj - meja;
      return razlika > p.vecKot ? besedilo({ razlika: kg.format(razlika) }) : undefined;
    }

    case "zaporedniDnevi": {
      const niz = zaporedni(k, p.vprasanje, p.dni);
      if (!niz || !niz.every((a) => p.odgovori.includes(String(a)))) return undefined;
      return besedilo({ dni: p.dni });
    }

    case "narascaVDneh": {
      const niz = zaporedni(k, p.vprasanje, p.dni);
      if (!niz) return undefined;
      const idx = niz.map((a) => indeksOdgovora(v, a));
      if (idx.some((i) => i < 0)) return undefined;
      const narasca = idx.every((i, n) => n === 0 || i > idx[n - 1]);
      return narasca ? besedilo({ dni: p.dni }) : undefined;
    }
  }
}
