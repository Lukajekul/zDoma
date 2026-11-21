import type { Vir } from "../types";

/**
 * Source of medicine or exercise content. Both docs say a clinician must
 * confirm the content before real discharges, so it is never `potrjeno` here.
 */
export const vir = (opis: string, url?: string): Vir => ({ opis, potrjeno: false, url });

