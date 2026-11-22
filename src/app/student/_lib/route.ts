// T-99: today's visits across all the student's patients, in time order,
// with an address and a directions link for the phone's map app.
import { minutes } from "@/lib/reminders/plan";
import { placeOf } from "@/lib/geo/obcine";
import { VISIT_SETTINGS, visitMinutes, type VisitSlot } from "@/lib/student/visits";
import type { TimeOfDay } from "@/lib/types";

export type Stop = {
  key: string;
  rehabId: string;
  name: string;
  address: string | null;
  /** Directions in the phone's map app; null without an address. */
  directions: string | null;
  slot: TimeOfDay;
  at: number;
  late: boolean;
};

export type RoutePin = { rehabId: string; name: string; order: number; at: number; place: [number, number] };

type Patient = { name: string; address: string | null; obcina: string | null; checkin_time: string };

export function fullAddress(address: string | null, obcina: string | null): string | null {
  if (address && obcina && !address.includes(obcina)) return `${address}, ${obcina}`;
  return address || obcina;
}

/** Current time in Europe/Ljubljana as minutes after midnight. */
export function nowMinutesLjubljana(now = new Date()): number {
  return minutes(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Ljubljana", hour: "2-digit", minute: "2-digit", hour12: false }).format(now));
}

export function todayRoute(
  cards: { p: Patient; rehabId: string | null; slots: VisitSlot[] }[],
  now: number,
): { stops: Stop[]; pins: RoutePin[] } {
  const stops: Stop[] = cards.flatMap(({ p, rehabId, slots }) => {
    if (!rehabId) return [];
    const address = fullAddress(p.address, p.obcina);
    const directions = address
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${address}, Slovenija`)}`
      : null;
    return slots.filter((s) => !s.done).map((s) => {
      const at = visitMinutes(s.slot, p.checkin_time);
      return { key: `${rehabId}-${s.slot}`, rehabId, name: p.name, address, directions, slot: s.slot, at, late: now > at + VISIT_SETTINGS.zamudaMin };
    });
  }).sort((a, b) => a.at - b.at || a.name.localeCompare(b.name, "sl"));

  // One pin per patient, numbered by their next visit.
  const pins: RoutePin[] = [];
  for (const s of stops) {
    if (pins.some((x) => x.rehabId === s.rehabId)) continue;
    const obcina = cards.find((c) => c.rehabId === s.rehabId)?.p.obcina ?? null;
    const place = placeOf(obcina, s.rehabId);
    if (place) pins.push({ rehabId: s.rehabId, name: s.name, order: pins.length + 1, at: s.at, place });
  }
  return { stops, pins };
}
