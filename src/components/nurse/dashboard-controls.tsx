import { useId } from "react";
import Link from "next/link";
import type { StaffKind } from "@/lib/staff";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { dayBands, facetValues, matchesFilters } from "./dashboard-filters";
import type { DashboardRow, Filters } from "./dashboard-filters";

export type TemplateOption = { id: string; label: string };

interface FilterOption {
  label: string;
  value: string;
  active: boolean;
  filter: Partial<Filters>;
}

interface DashboardControlsProps {
  rows: DashboardRow[];
  filters: Filters;
  nurseId: string;
  covering?: string[];
  templates: TemplateOption[];
  kind: StaffKind;
  change: (key: string, value: string | null) => void;
  clear: () => void;
}

export function DashboardControls({ rows, filters, nurseId, covering = [], templates, kind, change, clear }: DashboardControlsProps) {
  function picks(title: string, key: string, options: FilterOption[]) {
    return (
      <FilterGroup title={title}>
        {options.map((option) => {
          const candidate = { ...filters, ...option.filter };
          const count = rows.filter((row) => matchesFilters(row, candidate, nurseId, covering)).length;

          return (
            <button
              aria-pressed={option.active}
              className={cn(
                "min-h-11 max-w-full rounded-full px-4 py-2 text-left leading-snug font-semibold",
                "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring",
                option.active ? "bg-primary text-primary-foreground" : "bg-canvas hover:bg-brand-soft",
              )}
              key={option.value}
              onClick={() => change(key, option.active ? null : option.value)}
              type="button"
            >
              {option.label} <span className="ml-0.5 tabular-nums">({count})</span>
            </button>
          );
        })}
      </FilterGroup>
    );
  }

  const municipalities = facetValues(rows, "municipality", filters.municipality);
  const places = facetValues(
    rows.filter((row) => !filters.municipality || row.municipality === filters.municipality),
    "place",
    filters.place,
  );

  return (
    <div className="space-y-5 px-5 pb-5">
      <a className="flex min-h-12 w-fit items-center font-medium text-primary underline lg:hidden" href="#seznam-pacientov">
        Na seznam
      </a>
      {picks("Dnevni pregled", "brez-pregleda", [
        { label: "Brez pregleda danes", value: "1", active: filters.missedCheckin, filter: { missedCheckin: true } },
      ])}
      {picks("Zdravila", "zdravila", [
        { label: "Zdravila niso prevzeta", value: "1", active: filters.medicineUncollected, filter: { medicineUncollected: true } },
      ])}
      {!!municipalities.length && picks("Občina", "obcina", municipalities.map((value) => ({
        label: value, value, active: filters.municipality === value, filter: { municipality: value, place: null },
      })))}
      {!!places.length && picks("Kraj", "kraj", places.map((value) => ({
        label: value, value, active: filters.place === value, filter: { place: value },
      })))}
      {picks("Predloga okrevanja", "predloga", templates.map(({ id, label }) => ({
        label, value: id, active: filters.template === id, filter: { template: id },
      })))}
      {picks("Od odpusta", "od-odpusta", dayBands.map(({ value, label }) => ({
        label, value, active: filters.days === value, filter: { days: value },
      })))}
      <button
        className="min-h-12 w-full rounded-xl bg-brand-soft px-4 py-2 font-bold text-brand-ink hover:bg-brand-soft/70"
        onClick={clear}
        type="button"
      >
        Počisti filtre
      </button>
      {kind === "patronaza" && (
        <Link href="/nurse/nadomescanje" className="flex min-h-14 w-full items-center justify-center rounded-xl border-2 border-brand bg-card px-4 font-bold text-primary hover:bg-brand-soft">
          Nadomeščanje
        </Link>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();

  return (
    <section aria-labelledby={id}>
      <h3 className="mb-2 font-semibold" id={id}>{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}
