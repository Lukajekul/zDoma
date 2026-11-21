import { useId } from "react";
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
  templates: TemplateOption[];
  change: (key: string, value: string | null) => void;
  clear: () => void;
}

export function DashboardControls({ rows, filters, nurseId, templates, change, clear }: DashboardControlsProps) {
  function picks(title: string, key: string, options: FilterOption[]) {
    return (
      <FilterGroup title={title}>
        {options.map((option) => {
          const candidate = { ...filters, ...option.filter };
          const count = rows.filter((row) => matchesFilters(row, candidate, nurseId)).length;

          return (
            <button
              aria-pressed={option.active}
              className={cn(
                "min-h-12 max-w-full rounded-xl border-2 px-3 py-2 text-left leading-snug font-medium",
                "hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                option.active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background",
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

  const scopes = [
    { value: "moji", label: "Moji pacienti" },
    { value: "vsi", label: "Vsi pacienti" },
    { value: "nedodeljeni", label: "Nedodeljeni" },
  ] as const;
  const statuses = [
    { value: "rdece", label: "Rdeče" },
    { value: "rumeno", label: "Rumeno" },
    { value: "zeleno", label: "Zeleno" },
  ] as const;
  const municipalities = facetValues(rows, "municipality", filters.municipality);
  const places = facetValues(
    rows.filter((row) => !filters.municipality || row.municipality === filters.municipality),
    "place",
    filters.place,
  );

  return (
    <div className="space-y-5 px-4 pb-4">
      <a className="flex min-h-12 w-fit items-center font-medium text-primary underline lg:hidden" href="#seznam-pacientov">
        Na seznam
      </a>
      {picks("Dodelitev", "prikaz", scopes.map(({ value, label }) => ({
        label, value, active: filters.scope === value, filter: { scope: value },
      })))}
      {picks("Stanje", "stanje", statuses.map(({ value, label }) => ({
        label, value, active: filters.status === value, filter: { status: value },
      })))}
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
        className="min-h-12 rounded-xl border-2 border-primary bg-background px-3 py-2 font-semibold text-primary hover:bg-primary/10"
        onClick={clear}
        type="button"
      >
        Počisti filtre
      </button>
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
