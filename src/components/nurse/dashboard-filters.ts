import type { TriageStatus } from "@/lib/types";

export interface DashboardRow {
  id: string;
  name: string;
  davcna: string;
  municipality: string | null;
  place: string | null;
  nurseId: string | null;
  status: TriageStatus;
  reason: string | null;
  oldestAlertMs: number | null;
  missedCheckin: boolean;
  medicineUncollected: boolean;
  templateId: string;
  templateLabel: string;
  daysSinceDischarge: number;
}

const priority = { rdece: 0, rumeno: 1, zeleno: 2 };
const slovenian = new Intl.Collator("sl-SI");
const scopes = ["moji", "vsi", "nedodeljeni"] as const;
const statuses = ["rdece", "rumeno", "zeleno"] as const;

export const dayBands = [
  { value: "0-7", label: "0–7 dni", from: 0, through: 7 },
  { value: "8-30", label: "8–30 dni", from: 8, through: 30 },
  { value: "31+", label: "31 dni ali več", from: 31, through: Infinity },
] as const;

type Scope = (typeof scopes)[number];
type DayBand = (typeof dayBands)[number]["value"];

export interface Filters {
  scope: Scope;
  status: TriageStatus | null;
  municipality: string | null;
  place: string | null;
  template: string | null;
  days: DayBand | null;
  missedCheckin: boolean;
  medicineUncollected: boolean;
}

function pick<T extends string>(choices: readonly T[], value: string | null): T | null {
  return choices.find((choice) => choice === value) ?? null;
}

export function readFilters(params: Pick<URLSearchParams, "get">): Filters {
  return {
    scope: pick(scopes, params.get("prikaz")) ?? "moji",
    status: pick(statuses, params.get("stanje")),
    municipality: params.get("obcina") || null,
    place: params.get("kraj") || null,
    template: params.get("predloga") || null,
    days: pick(dayBands.map(({ value }) => value), params.get("od-odpusta")),
    missedCheckin: params.get("brez-pregleda") === "1",
    medicineUncollected: params.get("zdravila") === "1",
  };
}

function normalized(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("sl-SI");
}

export function searchPatients(rows: DashboardRow[], query: string) {
  const words = normalized(query.trim()).split(/\s+/).filter(Boolean);
  if (!words.length) return rows;

  return rows.filter((row) => {
    const searchable = normalized(`${row.name} ${row.davcna}`);
    return words.every((word) => searchable.includes(word));
  });
}

export function matchesFilters(row: DashboardRow, filters: Filters, nurseId: string) {
  if (filters.scope === "moji" && row.nurseId !== nurseId) return false;
  if (filters.scope === "nedodeljeni" && row.nurseId !== null) return false;
  if (filters.status && row.status !== filters.status) return false;
  if (row.oldestAlertMs === null && filters.scope !== "nedodeljeni" && filters.status !== "zeleno") return false;
  if (filters.municipality && row.municipality !== filters.municipality) return false;
  if (filters.place && row.place !== filters.place) return false;
  if (filters.template && row.templateId !== filters.template) return false;
  if (filters.missedCheckin && !row.missedCheckin) return false;
  if (filters.medicineUncollected && !row.medicineUncollected) return false;

  const band = dayBands.find(({ value }) => value === filters.days);
  return !band || (row.daysSinceDischarge >= band.from && row.daysSinceDischarge <= band.through);
}

export function selectDashboardRows(rows: DashboardRow[], filters: Filters, nurseId: string) {
  return rows.filter((row) => matchesFilters(row, filters, nurseId)).sort((a, b) =>
    priority[a.status] - priority[b.status]
    || (a.oldestAlertMs ?? Infinity) - (b.oldestAlertMs ?? Infinity)
    || slovenian.compare(a.name, b.name)
    || a.id.localeCompare(b.id),
  );
}

export function facetValues(rows: DashboardRow[], field: "municipality" | "place", selected: string | null) {
  const values = rows.flatMap((row) => row[field] ? [row[field]] : []);
  return [...new Set(selected ? [...values, selected] : values)].sort(slovenian.compare);
}
