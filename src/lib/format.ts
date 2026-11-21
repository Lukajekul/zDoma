// Slovenian formats in the Europe/Ljubljana time zone (AGENTS.md §7).
export const TIME_ZONE = "Europe/Ljubljana";
const LOCALE = "sl-SI";

const dateFmt = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "numeric", year: "numeric", timeZone: TIME_ZONE });
const timeFmt = new Intl.DateTimeFormat(LOCALE, { hour: "numeric", minute: "2-digit", timeZone: TIME_ZONE });
const longDateFmt = new Intl.DateTimeFormat(LOCALE, { weekday: "long", day: "numeric", month: "long", timeZone: TIME_ZONE });
const isoDayFmt = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: TIME_ZONE });

/** "21. 11. 2026" */
export const formatDate = (d: Date | string) => dateFmt.format(new Date(d));
/** "8:00" */
export const formatTime = (d: Date | string) => timeFmt.format(new Date(d));
/** "sobota, 21. november" */
export const formatLongDate = (d: Date | string) => longDateFmt.format(new Date(d));
/** "74,5" (decimal comma, up to `digits` decimals) */
export const formatNumber = (n: number, digits = 1) =>
  new Intl.NumberFormat(LOCALE, { maximumFractionDigits: digits }).format(n);
/** Today's date in Ljubljana as "2026-11-21", for "today" comparisons. */
export const todayLjubljana = (now: Date = new Date()) => isoDayFmt.format(now);

const hourFmt = new Intl.DateTimeFormat("sl-SI", { hour: "numeric", hourCycle: "h23", timeZone: TIME_ZONE });
const shortDayFmt = new Intl.DateTimeFormat("sl-SI", { weekday: "short", day: "numeric", month: "numeric", timeZone: TIME_ZONE });

/** "Dobro jutro" / "Dober dan" / "Dober večer" by the time in Ljubljana. */
export function greeting(now: Date = new Date()) {
  const h = Number(hourFmt.format(now));
  return h < 10 ? "Dobro jutro" : h < 18 ? "Dober dan" : "Dober večer";
}

/** "sob, 21. 11." for the header band. */
export const formatShortDay = (now: Date = new Date()) => shortDayFmt.format(now).replace(/\.$/, ".");
