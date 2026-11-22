// Approximate centres of Slovenian občine (WGS84), for placing patients and
// students on the map without geocoding addresses (T-98). Later: geocode the
// address from the GURS register at discharge and store it on the profile.
export type LatLng = [number, number];

export const OBCINE: Record<string, LatLng> = {
  Celje: [46.2309, 15.2604],
  Dobrna: [46.3375, 15.2264],
  Laško: [46.1546, 15.2358],
  Ljubljana: [46.0569, 14.5058],
  Maribor: [46.5547, 15.6459],
  Polzela: [46.2806, 15.0731],
  Prebold: [46.2375, 15.0919],
  "Rogaška Slatina": [46.2375, 15.6386],
  "Slovenske Konjice": [46.3367, 15.4214],
  "Šentjur": [46.2172, 15.3967],
  "Šmarje pri Jelšah": [46.2272, 15.5194],
  "Štore": [46.2208, 15.3139],
  Velenje: [46.3592, 15.1103],
  Vojnik: [46.2925, 15.3036],
  "Zreče": [46.3742, 15.3864],
  "Žalec": [46.2514, 15.165],
};

/** Map centre when nothing is known: Celje. */
export const DEFAULT_CENTER: LatLng = OBCINE.Celje;

/** Small deterministic offset from the občina centre, so pins in one občina don't overlap. */
export function placeOf(obcina: string | null, seed: string): LatLng | null {
  const centre = obcina ? OBCINE[obcina] : undefined;
  if (!centre) return null;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const a = ((h >>> 0) % 360) * (Math.PI / 180);
  const r = 0.006 + ((h >>> 9) % 100) / 100 * 0.018;
  return [centre[0] + Math.sin(a) * r, centre[1] + Math.cos(a) * r * 1.4];
}
