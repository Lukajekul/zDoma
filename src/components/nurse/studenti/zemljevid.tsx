"use client";

import "leaflet/dist/leaflet.css";
import "./zemljevid.css";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import { DEFAULT_CENTER, type LatLng } from "@/lib/geo/obcine";
import type { TriageStatus } from "@/lib/types";

export type MapPatient = { rehabId: string; name: string; status: TriageStatus; place: LatLng; hasStudent: boolean };
export type MapStudent = { id: string; name: string; place: LatLng; load: number; max: number };

// Shape + word + colour per status, never colour alone (§7).
const PIN: Record<TriageStatus, { shape: string; word: string; cls: string }> = {
  rdece: { shape: "▲", word: "Rdeče", cls: "zp-rdece" },
  rumeno: { shape: "●", word: "Rumeno", cls: "zp-rumeno" },
  zeleno: { shape: "■", word: "Zeleno", cls: "zp-zeleno" },
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const short = (name: string) => {
  const [first, ...rest] = name.split(" ");
  return rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first;
};

/**
 * Map for "Razporedi študente" (T-98): patients as labelled pins (shape, word and
 * colour), students as "Študent" pins. Leaflet loads only in the browser.
 */
export function Zemljevid({ patients, students, selected, onSelect }: {
  patients: MapPatient[];
  students: MapStudent[];
  selected: string | null;
  onSelect: (rehabId: string) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const L = useRef<typeof import("leaflet") | null>(null);
  const select = useRef(onSelect);
  useEffect(() => { select.current = onSelect; }, [onSelect]);

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      if (cancelled || !box.current || map.current) return;
      L.current = mod;
      map.current = mod.map(box.current, { center: DEFAULT_CENTER, zoom: 11 });
      mod.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map.current);
      layer.current = mod.layerGroup().addTo(map.current);
      draw();
      fit();
    });
    // On a phone the map starts hidden ("Seznam"): resize and fit once it shows.
    let fitted = false;
    const ro = new ResizeObserver(() => {
      if (!map.current || !box.current?.offsetWidth) return;
      map.current.invalidateSize();
      if (!fitted) { fitted = true; fit(); }
    });
    if (box.current) ro.observe(box.current);
    return () => {
      ro.disconnect();
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw() {
    const mod = L.current;
    if (!mod || !layer.current) return;
    layer.current.clearLayers();
    for (const s of students) {
      const html = `<span class="zp zp-student">🎓 ${esc(short(s.name))} ${s.load}/${s.max}</span>`;
      mod.marker(s.place, { icon: mod.divIcon({ html, className: "zp-wrap", iconSize: undefined }), keyboard: false, zIndexOffset: -100 })
        .bindTooltip(`${esc(s.name)} – ${s.load} od ${s.max} pacientov`)
        .addTo(layer.current);
    }
    for (const p of patients) {
      const pin = PIN[p.status];
      const sel = p.rehabId === selected ? " zp-selected" : "";
      const done = p.hasStudent ? " zp-done" : "";
      const html = `<span class="zp ${pin.cls}${sel}${done}"><b aria-hidden="true">${pin.shape}</b> ${esc(short(p.name))} · ${pin.word}</span>`;
      mod.marker(p.place, {
        icon: mod.divIcon({ html, className: "zp-wrap", iconSize: undefined }),
        title: `${p.name}, ${pin.word}${p.hasStudent ? ", ima študenta" : ""}`,
        zIndexOffset: sel ? 1000 : p.status === "rdece" ? 500 : 0,
      })
        .on("click", () => select.current(p.rehabId))
        .addTo(layer.current);
    }
  }

  function fit() {
    const mod = L.current;
    const pts = [...patients.map((p) => p.place), ...students.map((s) => s.place)];
    if (mod && map.current && pts.length) map.current.fitBounds(mod.latLngBounds(pts), { padding: [40, 40], maxZoom: 13 });
  }

  useEffect(draw); // redraw on every render: few pins, keeps selection in sync

  useEffect(() => {
    const p = patients.find((x) => x.rehabId === selected);
    if (p && map.current) map.current.panTo(p.place);
  }, [selected, patients]);

  return (
    <div className="flex h-full flex-col gap-2">
    <div
      ref={box}
      role="region"
      aria-label="Zemljevid pacientov in študentov"
      className="min-h-[24rem] w-full flex-1 overflow-hidden rounded-3xl bg-muted shadow-soft"
    />
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-base">
        <span><b aria-hidden>▲</b> Rdeče</span>
        <span><b aria-hidden>●</b> Rumeno</span>
        <span><b aria-hidden>■</b> Zeleno</span>
        <span>Črtkano = že ima študenta</span>
        <span>🎓 Študent (pacienti od 3)</span>
      </p>
    </div>
  );
}
