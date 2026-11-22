"use client";

import { escapeHtml as esc, PinMap, shortName as short, type Pin } from "@/components/map/pin-map";
import type { LatLng } from "@/lib/geo/obcine";
import type { TriageStatus } from "@/lib/types";

export type MapPatient = { rehabId: string; name: string; status: TriageStatus; place: LatLng; hasStudent: boolean };
export type MapStudent = { id: string; name: string; place: LatLng; load: number; max: number };

// Shape + word + colour per status, never colour alone (§7).
const PIN: Record<TriageStatus, { shape: string; word: string; cls: string }> = {
  rdece: { shape: "▲", word: "Rdeče", cls: "zp-rdece" },
  rumeno: { shape: "●", word: "Rumeno", cls: "zp-rumeno" },
  zeleno: { shape: "■", word: "Zeleno", cls: "zp-zeleno" },
};

/** "Razporedi študente" map (T-98): patients by status, students with their load. */
export function Zemljevid({ patients, students, selected, onSelect }: {
  patients: MapPatient[];
  students: MapStudent[];
  selected: string | null;
  onSelect: (rehabId: string) => void;
}) {
  const pins: Pin[] = [
    ...students.map((s) => ({
      id: `s-${s.id}`,
      place: s.place,
      html: `<span class="zp zp-student">🎓 ${esc(short(s.name))} ${s.load}/${s.max}</span>`,
      tooltip: `${esc(s.name)} – ${s.load} od ${s.max} pacientov`,
      z: -100,
    })),
    ...patients.map((p) => {
      const pin = PIN[p.status];
      const sel = p.rehabId === selected;
      return {
        id: p.rehabId,
        place: p.place,
        html: `<span class="zp ${pin.cls}${sel ? " zp-selected" : ""}${p.hasStudent ? " zp-done" : ""}"><b aria-hidden="true">${pin.shape}</b> ${esc(short(p.name))} · ${pin.word}</span>`,
        title: `${p.name}, ${pin.word}${p.hasStudent ? ", ima študenta" : ""}`,
        z: sel ? 1000 : p.status === "rdece" ? 500 : 0,
        clickable: true,
      };
    }),
  ];
  return (
    <PinMap
      pins={pins}
      focus={selected}
      onSelect={onSelect}
      label="Zemljevid pacientov in študentov"
      legend={<>
        <span><b aria-hidden>▲</b> Rdeče</span>
        <span><b aria-hidden>●</b> Rumeno</span>
        <span><b aria-hidden>■</b> Zeleno</span>
        <span>Črtkano = že ima študenta</span>
        <span>🎓 Študent (pacienti od 3)</span>
      </>}
    />
  );
}
