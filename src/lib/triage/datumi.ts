// Date helpers on ISO dates ("YYYY-MM-DD"), no time zones involved.
import type { IsoDate } from "@/lib/types";

const DAN_MS = 86_400_000;

function dan(datum: IsoDate): number {
  const [y, m, d] = datum.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAN_MS);
}

/** Whole days from `od` to `do_` (positive when `do_` is later). */
export function razlikaDni(od: IsoDate, do_: IsoDate): number {
  return dan(do_) - dan(od);
}
