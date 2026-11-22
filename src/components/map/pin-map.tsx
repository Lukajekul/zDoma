"use client";

import "leaflet/dist/leaflet.css";
import "./pins.css";
import { useEffect, useRef, type ReactNode } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import { DEFAULT_CENTER, type LatLng } from "@/lib/geo/obcine";

export type Pin = {
  id: string;
  place: LatLng;
  /** Label HTML, already escaped (use `escapeHtml`). Classes from pins.css. */
  html: string;
  title?: string;
  z?: number;
  clickable?: boolean;
  tooltip?: string;
};

export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
export const shortName = (name: string) => {
  const [first, ...rest] = name.split(" ");
  return rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first;
};

/**
 * OpenStreetMap with labelled pins (T-98, T-99). Leaflet loads only in the
 * browser; the map resizes and fits the pins when it becomes visible.
 */
export function PinMap({ pins, focus, onSelect, label, legend }: {
  pins: Pin[];
  /** Pin to pan to. */
  focus?: string | null;
  onSelect?: (id: string) => void;
  label: string;
  legend?: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const L = useRef<typeof import("leaflet") | null>(null);
  const latest = useRef({ pins, onSelect });
  useEffect(() => { latest.current = { pins, onSelect }; });

  const draw = () => {
    const mod = L.current;
    if (!mod || !layer.current) return;
    layer.current.clearLayers();
    for (const p of latest.current.pins) {
      const m = mod.marker(p.place, {
        icon: mod.divIcon({ html: p.html, className: "zp-wrap", iconSize: undefined }),
        title: p.title,
        keyboard: !!p.clickable,
        zIndexOffset: p.z ?? 0,
      });
      if (p.tooltip) m.bindTooltip(p.tooltip);
      if (p.clickable) m.on("click", () => latest.current.onSelect?.(p.id));
      m.addTo(layer.current);
    }
  };
  const fit = () => {
    const mod = L.current;
    const pts = latest.current.pins.map((p) => p.place);
    if (mod && map.current && pts.length) map.current.fitBounds(mod.latLngBounds(pts), { padding: [40, 40], maxZoom: 13 });
  };

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
    // A map that starts hidden (phone "Seznam") has no size: resize and fit once it shows.
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
  }, []);

  useEffect(draw); // few pins: redraw on every render keeps labels and selection in sync

  useEffect(() => {
    const p = pins.find((x) => x.id === focus);
    if (p && map.current) map.current.panTo(p.place);
  }, [focus, pins]);

  return (
    <div className="flex h-full flex-col gap-2">
      <div ref={box} role="region" aria-label={label}
        className="h-[60dvh] min-h-[20rem] w-full overflow-hidden rounded-3xl bg-muted shadow-soft md:h-auto md:flex-1" />
      {legend && <div className="flex flex-wrap gap-x-4 gap-y-1 text-base">{legend}</div>}
    </div>
  );
}
