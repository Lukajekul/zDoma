// Weekly summary of a rehabilitacija, built from the template and the check-ins (no LLM).
import { vstaviVrednosti, type Predloga } from "@/lib/templates";
import type { IsoDate, PatientValues, TriageStatus } from "@/lib/types";
import { razlikaDni } from "./datumi";
import { oceniPregled } from "./ocena";
import type { DanOdgovori } from "./pravila";

export interface PovzetekVhod {
  predloga: Predloga;
  vrednosti: PatientValues;
  izbranaVprasanja?: string[];
  /** All check-ins of the rehabilitacija, any order. */
  pregledi: DanOdgovori[];
  /** Last day of the summary (today in Europe/Ljubljana). */
  doDne: IsoDate;
  dni?: number;
}

export interface TedenskiPovzetek {
  dni: number;
  opravljenih: number;
  statusi: Record<TriageStatus, number>;
  /** Per rule: the latest reason text and on how many days it fired. */
  razlogi: { praviloId: string; besedilo: string; dni: number }[];
  /** Number questions (weight): first and last reading in the period. */
  stevila: { vprasanjeId: string; prvi: number; zadnji: number }[];
  vrstice: string[];
}

const st = new Intl.NumberFormat("sl-SI", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const predznak = new Intl.NumberFormat("sl-SI", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

/** "1 dan", "2 dneva", "3 dnevi", "5 dni". */
export function dniBesedilo(n: number): string {
  const m = n % 100;
  if (m === 1) return `${n} dan`;
  if (m === 2) return `${n} dneva`;
  if (m === 3 || m === 4) return `${n} dnevi`;
  return `${n} dni`;
}

export function tedenskiPovzetek(vhod: PovzetekVhod): TedenskiPovzetek {
  const dni = vhod.dni ?? 7;
  const vObdobju = vhod.pregledi
    .filter((p) => {
      const nazaj = razlikaDni(p.datum, vhod.doDne);
      return nazaj >= 0 && nazaj < dni;
    })
    .sort((a, b) => a.datum.localeCompare(b.datum));

  const statusi: Record<TriageStatus, number> = { zeleno: 0, rumeno: 0, rdece: 0 };
  const poPravilu = new Map<string, { besedilo: string; dni: number }>();
  for (const danes of vObdobju) {
    const ocena = oceniPregled({
      predloga: vhod.predloga,
      vrednosti: vhod.vrednosti,
      izbranaVprasanja: vhod.izbranaVprasanja,
      danes,
      prejsnji: vhod.pregledi.filter((p) => p.datum < danes.datum),
    });
    statusi[ocena.status]++;
    for (const r of [...ocena.razlogi, ...ocena.opombe]) {
      const prej = poPravilu.get(r.praviloId);
      poPravilu.set(r.praviloId, { besedilo: r.besedilo, dni: (prej?.dni ?? 0) + 1 });
    }
  }
  const razlogi = [...poPravilu].map(([praviloId, r]) => ({ praviloId, ...r }));

  const izbrana = (id: string) => !vhod.izbranaVprasanja || vhod.izbranaVprasanja.includes(id);
  const stevila: TedenskiPovzetek["stevila"] = [];
  for (const v of vhod.predloga.vprasanja) {
    if (v.tip !== "teza" || !izbrana(v.id)) continue;
    const vrednosti = vObdobju.map((p) => p.odgovori[v.id]).filter((a): a is number => typeof a === "number");
    if (vrednosti.length > 0) stevila.push({ vprasanjeId: v.id, prvi: vrednosti[0], zadnji: vrednosti.at(-1)! });
  }

  const vrstice = [
    `Pregled opravljen ${vObdobju.length} od ${dni} dni`,
    `Zeleno ${statusi.zeleno} · Rumeno ${statusi.rumeno} · Rdeče ${statusi.rdece}`,
    ...stevila.map(
      (s) => `Teža: ${st.format(s.prvi)} → ${st.format(s.zadnji)} kg (${predznak.format(s.zadnji - s.prvi)} kg)`,
    ),
    ...razlogi.map((r) => `${r.besedilo} – ${dniBesedilo(r.dni)}`),
  ];

  // Weekly questions have no rules: show the latest answer as it is.
  for (const v of vhod.predloga.vprasanja) {
    if (v.pogostost !== "tedensko" || v.tip !== "izbira" || !izbrana(v.id)) continue;
    const zadnji = [...vObdobju].reverse().find((p) => p.odgovori[v.id] !== undefined);
    const odgovor = zadnji && v.odgovori.find((o) => o.id === zadnji.odgovori[v.id]);
    if (odgovor) vrstice.push(`${vstaviVrednosti(v.besedilo, vhod.vrednosti)} ${odgovor.besedilo}`);
  }

  return { dni, opravljenih: vObdobju.length, statusi, razlogi, stevila, vrstice };
}
