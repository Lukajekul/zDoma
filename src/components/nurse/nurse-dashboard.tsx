"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Activity, Bell, ClipboardX, Pill, SlidersHorizontal } from "lucide-react";
import { claimRehab } from "@/app/nurse/actions";
import { IconTile, StatusBadge } from "@/components/shell";
import type { StaffKind } from "@/lib/staff";
import { dniBesedilo } from "@/lib/triage";
import { DashboardControls } from "./dashboard-controls";
import type { TemplateOption } from "./dashboard-controls";
import { readFilters, searchPatients, selectDashboardRows } from "./dashboard-filters";
import type { DashboardRow } from "./dashboard-filters";
import { useDashboardRealtime } from "./use-dashboard-realtime";
import { initials, setDashboardParam } from "./url-params";
import { cn } from "@/lib/utils";

const messages = {
  claimed: "Pacient prevzet ✓",
  unavailable: "Pacient ni več na voljo za prevzem. Seznam je osvežen.",
  invalid: "Pacienta ni bilo mogoče najti. Osvežite stran in poskusite znova.",
  error: "Prevzem ni uspel. Osvežite stran in poskusite znova.",
} as const;

export function NurseDashboard({ kind, rows, nurseId, covering = [], templates }: {
  /** A patronažna sestra gets "Obisk" on each of her patients (T-57). */
  kind: StaffKind;
  rows: DashboardRow[];
  nurseId: string;
  /** Nurses she substitutes for today (T-49). */
  covering?: string[];
  templates: TemplateOption[];
}) {
  const params = useSearchParams();
  const listQuery = params.toString();
  const query = params.get("q") ?? "";
  const filters = readFilters(params, kind === "patronaza" ? "moji" : "vsi");
  const router = useRouter();
  const realtimeUnavailable = useDashboardRealtime();
  const filterPanel = useRef<HTMLDetailsElement>(null);
  const [pending, startTransition] = useTransition();
  const [claiming, setClaiming] = useState<string>();
  const [feedback, setFeedback] = useState<keyof typeof messages>();
  const searchedRows = searchPatients(rows, query);
  const filtered = selectDashboardRows(searchedRows, filters, nurseId, covering);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");
    function updatePanel() {
      if (filterPanel.current) filterPanel.current.open = desktop.matches;
    }
    if (desktop.matches) updatePanel();
    desktop.addEventListener("change", updatePanel);
    return () => desktop.removeEventListener("change", updatePanel);
  }, []);

  const change = setDashboardParam;

  function claim(id: string) {
    setClaiming(id);
    setFeedback(undefined);
    startTransition(async () => {
      try {
        setFeedback(await claimRehab(id));
      } catch {
        setFeedback("error");
      }
      router.refresh();
    });
  }

  const scoped = selectDashboardRows(searchedRows, { ...filters, status: null, missedCheckin: false, medicineUncollected: false }, nurseId, covering);
  const stats = [
    { key: "stanje", value: "rdece", label: "Rdeče", count: scoped.filter((r) => r.status === "rdece").length, Icon: Activity, tone: "rdece" as const, active: filters.status === "rdece" },
    { key: "stanje", value: "rumeno", label: "Rumeno", count: scoped.filter((r) => r.status === "rumeno").length, Icon: Bell, tone: "rumeno" as const, active: filters.status === "rumeno" },
    { key: "brez-pregleda", value: "1", label: "Brez pregleda", count: scoped.filter((r) => r.missedCheckin).length, Icon: ClipboardX, tone: undefined, active: filters.missedCheckin },
    { key: "zdravila", value: "1", label: "Zdravila niso prevzeta", count: scoped.filter((r) => r.medicineUncollected).length, Icon: Pill, tone: undefined, active: filters.medicineUncollected },
  ];

  const statusChips = (["rdece", "rumeno", "zeleno"] as const).map((value) => ({
    value,
    label: { rdece: "Rdeče", rumeno: "Rumeno", zeleno: "Zeleno" }[value],
    count: selectDashboardRows(searchedRows, { ...filters, status: value }, nurseId, covering).length,
    active: filters.status === value,
  }));

  return (
    <>
      <ul aria-label="Povzetek" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label} className="flex">
            <button
              type="button"
              aria-pressed={s.active}
              onClick={() => change(s.key, s.active ? null : s.value)}
              className="flex flex-1 items-center justify-between gap-3 rounded-3xl bg-card p-4 text-left shadow-soft outline-primary hover:shadow-lift aria-pressed:outline-3 sm:p-5"
            >
              <span>
                <span className="block font-semibold text-muted-foreground">{s.label}</span>
                <span className="text-2xl font-extrabold tabular-nums">{s.count}</span>
              </span>
              <IconTile tone={s.tone}><s.Icon /></IconTile>
            </button>
          </li>
        ))}
      </ul>
      {realtimeUnavailable && (
        <p role="status" className="rounded-3xl bg-card p-4 shadow-soft">
          Povezava za sprotne posodobitve je prekinjena. Seznam lahko osvežite v brskalniku.
        </p>
      )}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(17rem,1fr)]">
        <section aria-labelledby="seznam-pacientov" className="min-w-0 rounded-3xl bg-card p-4 shadow-soft sm:p-6">
          <h2 aria-live="polite" className="scroll-mt-4 text-xl font-bold" id="seznam-pacientov">
            {filters.status === "zeleno" ? "Zeleni pacienti" : "Potrebujejo pozornost"} ({filtered.length})
          </h2>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Stanje">
            {statusChips.map((c) => (
              <button
                key={c.value}
                type="button"
                aria-pressed={c.active}
                onClick={() => change("stanje", c.active ? null : c.value)}
                className={cn(
                  "min-h-11 rounded-full px-4 font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  c.active ? "bg-primary text-primary-foreground" : "bg-canvas hover:bg-brand-soft",
                )}
              >
                {c.label} · {c.count}
              </button>
            ))}
          </div>
          {feedback && (
            <p role={feedback === "claimed" ? "status" : "alert"} className="mt-3 rounded-2xl bg-brand-soft px-4 py-3 font-semibold text-brand-ink">
              {messages[feedback]}
            </p>
          )}
          {!filtered.length ? (
            <p className="mt-3 text-lg">Za izbrane filtre ni pacientov. Poskusite z drugimi filtri.</p>
          ) : (
            <ul className="mt-2 divide-y divide-border">
              {filtered.map((row) => (
                <li key={row.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                  <div className="flex min-w-0 flex-1 basis-64 items-center gap-4">
                  <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-soft font-extrabold text-brand-ink">
                    {initials(row.name)}
                  </span>
                  <div className="min-w-0 flex-1 wrap-break-word">
                    <h3 className="text-lg leading-snug font-bold">{row.name}</h3>
                    <p className="text-base leading-snug text-muted-foreground">
                      {row.reason && <span className="font-semibold text-foreground">{row.reason} · </span>}
                      {[row.place ?? row.municipality ?? "Kraj ni vpisan", row.templateLabel, `od odpusta ${dniBesedilo(row.daysSinceDischarge)}`].join(" · ")}
                    </p>
                  </div>
                  </div>
                  <span className="flex flex-wrap items-center gap-x-4 gap-y-2 max-sm:pl-16">
                  <StatusBadge className="shrink-0" short status={row.status} />
                  {row.nurseId === null ? (
                    <button
                      aria-label={`Prevzemi: ${row.name}`}
                      className="min-h-12 rounded-xl bg-primary px-4 font-bold text-primary-foreground disabled:opacity-60"
                      disabled={pending}
                      onClick={() => claim(row.id)}
                      type="button"
                    >
                      {pending && claiming === row.id ? "Prevzemam …" : "Prevzemi"}
                    </button>
                  ) : (
                    <span className="flex items-center gap-3">
                    {kind === "patronaza" && (
                      <Link
                        prefetch={false}
                        aria-label={`Obisk: ${row.name}`}
                        href={`/nurse/obisk/${row.id}`}
                        className="inline-flex min-h-12 items-center rounded-xl bg-primary px-4 font-bold text-primary-foreground hover:bg-primary/90"
                      >
                        Obisk
                      </Link>
                    )}
                    <Link
                      prefetch={false}
                      aria-label={`Odpri: ${row.name}`}
                      href={{ pathname: `/nurse/${row.id}`, query: listQuery ? { seznam: listQuery } : undefined }}
                      className="inline-flex min-h-12 items-center font-bold text-primary underline underline-offset-4"
                    >
                      Odpri
                    </Link>
                    </span>
                  )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <details className="rounded-3xl bg-card shadow-soft lg:sticky lg:top-4" ref={filterPanel}>
          <summary className="flex min-h-14 cursor-pointer items-center gap-2 rounded-3xl px-5 py-3 text-lg font-bold">
            <SlidersHorizontal aria-hidden className="size-5" /> Filtri
          </summary>
          <DashboardControls
            change={change}
            kind={kind}
            clear={() => {
              if (window.location.search) window.history.pushState(null, "", window.location.pathname);
            }}
            filters={filters}
            nurseId={nurseId}
            covering={covering}
            rows={searchedRows}
            templates={templates}
          />
        </details>
      </div>
    </>
  );
}
