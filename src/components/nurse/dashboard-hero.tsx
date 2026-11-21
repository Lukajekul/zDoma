"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import type { StaffKind } from "@/lib/staff";
import { cn } from "@/lib/utils";
import { readFilters, searchPatients } from "./dashboard-filters";
import type { DashboardRow } from "./dashboard-filters";
import { initials, setDashboardParam } from "./url-params";

const SCOPES = [
  { value: "moji", label: "Moji pacienti" },
  { value: "vsi", label: "Vsi pacienti" },
  { value: "nedodeljeni", label: "Nedodeljeni" },
] as const;

/**
 * Floating card under the dashboard band (design v3): who is looking (teren or hospital),
 * how many patients and how many need attention, and the "whose patients" chips.
 */
export function DashboardHero({ kind, name, place, rows, nurseId, covering }: {
  kind: StaffKind;
  name: string;
  /** "Šentjur, Celje" for a patronažna sestra; empty for hospital staff. */
  place: string;
  rows: DashboardRow[];
  nurseId: string;
  covering: string[];
}) {
  const params = useSearchParams();
  const filters = readFilters(params, kind === "patronaza" ? "moji" : "vsi");
  const searched = searchPatients(rows, params.get("q") ?? "");
  const inScope = (row: DashboardRow, scope: (typeof SCOPES)[number]["value"]) =>
    scope === "vsi" || (scope === "nedodeljeni"
      ? row.nurseId === null
      : row.nurseId !== null && (row.nurseId === nurseId || covering.includes(row.nurseId)));
  const count = (scope: (typeof SCOPES)[number]["value"]) => searched.filter((r) => inScope(r, scope)).length;
  const total = count(filters.scope);
  const attention = searched.filter((r) => inScope(r, filters.scope) && r.status !== "zeleno").length;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-3xl bg-card/85 p-4 shadow-soft backdrop-blur-md sm:px-5">
      <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-xl bg-brand-soft text-lg font-extrabold text-brand-ink">
        {initials(name)}
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <p className="text-lg font-bold">{kind === "patronaza" ? `Patronaža ${place}` : "Bolnišnica"}</p>
        <p className="text-muted-foreground">
          {total} {total === 1 ? "pacient" : total === 2 ? "pacienta" : total < 5 ? "pacienti" : "pacientov"} · {attention} {attention === 1 ? "potrebuje" : "potrebujejo"} pozornost
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {SCOPES.filter((s) => kind === "patronaza" || s.value !== "moji").map((s) => {
          const active = filters.scope === s.value;
          return (
            <button
              key={s.value}
              type="button"
              aria-pressed={active}
              onClick={() => setDashboardParam("prikaz", s.value)}
              className={cn(
                "min-h-12 rounded-full px-4 font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring",
                active ? "bg-primary text-primary-foreground" : "bg-canvas hover:bg-brand-soft",
              )}
            >
              {s.label}{s.value === "nedodeljeni" && ` · ${count("nedodeljeni")}`}
            </button>
          );
        })}
        {kind === "bolnisnica" && (
          <Link href="/nurse/odpust" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-4 font-bold text-primary-foreground shadow-[0_6px_14px_-4px_var(--primary)] hover:bg-primary/90">
            <Plus aria-hidden className="size-5" /> Nova rehabilitacija
          </Link>
        )}
      </div>
    </div>
  );
}
