"use client";

import { useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { Search } from "lucide-react";
import { setDashboardParam } from "./url-params";

/** Patient search in the dashboard's green band (design v3). Kept in the URL as `q`. */
export function DashboardSearch() {
  const query = useSearchParams().get("q") ?? "";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("q");
    setDashboardParam("q", typeof value === "string" ? value.trim() : null);
  }

  return (
    <form onSubmit={submit} role="search" className="flex w-full items-stretch gap-2 sm:w-auto">
      <label htmlFor="iskanje-pacienta" className="sr-only">Ime, priimek ali davčna številka</label>
      <div className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-xl bg-card px-3 text-foreground focus-within:outline-3 focus-within:outline-white/70 sm:w-72">
        <Search aria-hidden className="size-5 shrink-0 text-muted-foreground" />
        <input
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          defaultValue={query}
          id="iskanje-pacienta"
          key={query}
          maxLength={120}
          name="q"
          placeholder="Ime ali davčna številka"
          type="search"
        />
      </div>
      <button className="min-h-12 rounded-xl bg-brand-ink px-4 font-bold text-white hover:bg-brand-ink/90" type="submit">
        Išči
      </button>
    </form>
  );
}
