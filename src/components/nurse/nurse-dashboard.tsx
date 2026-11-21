"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { claimRehab } from "@/app/nurse/actions";
import { StatusBadge } from "@/components/shell";
import { dniBesedilo } from "@/lib/triage";
import { DashboardControls } from "./dashboard-controls";
import type { TemplateOption } from "./dashboard-controls";
import { readFilters, searchPatients, selectDashboardRows } from "./dashboard-filters";
import type { DashboardRow } from "./dashboard-filters";
import { useDashboardRealtime } from "./use-dashboard-realtime";

const messages = {
  claimed: "Pacient prevzet ✓",
  unavailable: "Pacient ni več na voljo za prevzem. Seznam je osvežen.",
  invalid: "Pacienta ni bilo mogoče najti. Osvežite stran in poskusite znova.",
  error: "Prevzem ni uspel. Osvežite stran in poskusite znova.",
} as const;

export function NurseDashboard({ rows, nurseId, covering = [], templates }: {
  rows: DashboardRow[];
  nurseId: string;
  /** Nurses she substitutes for today (T-49). */
  covering?: string[];
  templates: TemplateOption[];
}) {
  const params = useSearchParams();
  const listQuery = params.toString();
  const query = params.get("q") ?? "";
  const filters = readFilters(params);
  const router = useRouter();
  const realtimeUnavailable = useDashboardRealtime();
  const searchForm = useRef<HTMLFormElement>(null);
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

  function change(key: string, value: string | null) {
    const latest = new URLSearchParams(window.location.search);
    if (key === "obcina") latest.delete("kraj");
    if (value) latest.set(key, value);
    else latest.delete(key);
    const search = latest.toString();
    if (search === window.location.search.slice(1)) return;
    window.history.pushState(null, "", search ? `?${search}` : window.location.pathname);
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("q");
    change("q", typeof value === "string" ? value.trim() : null);
  }

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

  return (
    <>
      <form ref={searchForm} onSubmit={search} role="search" className="space-y-2">
        <label htmlFor="iskanje-pacienta" className="block font-semibold">
          Ime, priimek ali davčna številka
        </label>
        <div className="flex flex-wrap items-stretch gap-2 sm:max-w-2xl">
          <input
            className="min-h-12 min-w-0 flex-1 rounded-xl border-2 border-border bg-background px-3 focus-visible:outline-2 focus-visible:outline-primary"
            defaultValue={query}
            id="iskanje-pacienta"
            key={query}
            maxLength={120}
            name="q"
            type="search"
          />
          <button className="min-h-12 rounded-xl bg-primary px-5 py-2 font-semibold text-primary-foreground" type="submit">
            Išči
          </button>
        </div>
      </form>
      {realtimeUnavailable && (
        <p role="status" className="rounded-xl border p-3">
          Povezava za sprotne posodobitve je prekinjena. Seznam lahko osvežite v brskalniku.
        </p>
      )}
      <div className="grid items-start gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <details className="rounded-2xl border bg-muted/40" ref={filterPanel}>
          <summary className="min-h-12 cursor-pointer rounded-2xl px-4 py-3 font-bold">
            Filtri pacientov
          </summary>
          <DashboardControls
            change={change}
            clear={() => {
              searchForm.current?.reset();
              if (window.location.search) window.history.pushState(null, "", window.location.pathname);
            }}
            filters={filters}
            nurseId={nurseId}
            covering={covering}
            rows={searchedRows}
            templates={templates}
          />
        </details>
        <section aria-labelledby="seznam-pacientov" className="@container min-w-0 space-y-3">
          <h2 aria-live="polite" className="scroll-mt-4 text-xl font-bold" id="seznam-pacientov">Seznam pacientov ({filtered.length})</h2>
          {feedback && (
            <p role={feedback === "claimed" ? "status" : "alert"} className="rounded-xl border bg-muted px-4 py-3 font-medium">
              {messages[feedback]}
            </p>
          )}
          {!filtered.length ? (
            <p className="rounded-xl border p-4">
              Za izbrane filtre ni pacientov. Poskusite z drugimi filtri.
            </p>
          ) : (
            <ul className="grid gap-3 @lg:grid-cols-2">
              {filtered.map((row) => (
                <li key={row.id} className="flex">
                  <article className="flex flex-1 flex-col gap-3 rounded-2xl border bg-background p-4">
                    <div className="min-w-0 space-y-1 wrap-break-word">
                      <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 text-xl leading-snug font-bold">
                        <Link
                          className="inline-flex min-h-12 items-center text-primary underline underline-offset-4"
                          prefetch={false}
                          href={{ pathname: `/nurse/${row.id}`, query: listQuery ? { seznam: listQuery } : undefined }}
                        >
                          {row.name}
                        </Link>
                      </h3>
                      <StatusBadge className="shrink-0" short status={row.status} />
                      </div>
                      <p>{[row.place, row.municipality === row.place ? null : row.municipality].filter(Boolean).join(", ") || "Kraj ni vpisan"}</p>
                      <p className="text-muted-foreground">{row.templateLabel} · Od odpusta {dniBesedilo(row.daysSinceDischarge)}</p>
                    </div>
                    {row.reason && <p className="font-semibold wrap-break-word">{row.reason}</p>}
                    {row.nurseId === null && (
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          aria-label={`Prevzemi: ${row.name}`}
                          className="min-h-12 rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60"
                          disabled={pending}
                          onClick={() => claim(row.id)}
                          type="button"
                        >
                          {pending && claiming === row.id ? "Prevzemam …" : "Prevzemi"}
                        </button>
                        <span>Nedodeljeni</span>
                      </div>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
