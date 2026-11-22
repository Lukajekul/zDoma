"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Clipboard, GraduationCap, Leaf, Plus, Repeat, Users } from "lucide-react";
import type { StaffKind } from "@/lib/staff";
import { cn } from "@/lib/utils";

const patients = (label: string) => ({
  href: "/nurse",
  label,
  Icon: Users,
  match: (p: string) => p === "/nurse" || /^\/nurse\/(obisk\/)?[0-9a-f-]{36}/.test(p),
});

/** Menu per kind of staff (T-57): home visits for a patronažna sestra, discharges and templates for the hospital. */
export const NAV_ITEMS = {
  patronaza: [
    patients("Moji pacienti"),
    { href: "/nurse/danes", label: "Danes obiščite", Icon: CalendarCheck, match: (p: string) => p.startsWith("/nurse/danes") || p.startsWith("/nurse/prvi-obisk") },
    { href: "/nurse/studenti", label: "Študenti", Icon: GraduationCap, match: (p: string) => p.startsWith("/nurse/studenti") },
    { href: "/nurse/nadomescanje", label: "Nadome\u00ADščanje", Icon: Repeat, match: (p: string) => p.startsWith("/nurse/nadomescanje") },
  ],
  bolnisnica: [
    patients("Pacienti"),
    { href: "/nurse/odpust", label: "Nova rehabilitacija", Icon: Plus, match: (p: string) => p.startsWith("/nurse/odpust") },
    { href: "/nurse/predloge", label: "Predloge", Icon: Clipboard, match: (p: string) => p.startsWith("/nurse/predloge") },
  ],
} satisfies Record<StaffKind, unknown[]>;

/**
 * Bolničar menu: a sidebar on large screens, a labelled tab bar at the bottom on a phone
 * (a patronažna sestra works mostly on her phone, T-57).
 */
export function NurseNav({ kind, footer }: { kind: StaffKind; footer?: ReactNode }) {
  const path = usePathname();
  const items = NAV_ITEMS[kind];
  return (
    <>
    {/* Phone: tab bar at the bottom, every tab with its label (AGENTS.md §7). */}
    <nav aria-label="Glavni meni" className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-lift backdrop-blur lg:hidden">
      <ul className="mx-auto grid max-w-xl" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map(({ href, label, Icon, match }) => {
          const active = match(path);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-18 flex-col items-center justify-center gap-1 px-1 py-2 text-center text-base leading-tight font-semibold focus-visible:outline-3 focus-visible:outline-ring",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span aria-hidden className={cn("grid h-8 w-14 place-items-center rounded-full", active && "bg-brand-soft")}>
                  <Icon className="size-6" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-2 overflow-y-auto p-5 lg:flex">
      <Link href="/nurse" className="mb-3 flex items-center gap-3 border-b px-3 pt-2 pb-5 text-xl font-extrabold">
        <span aria-hidden className="grid size-10 place-items-center rounded-xl bg-brand text-white shadow-[0_4px_10px_oklch(0.73_0.15_150/0.35)]">
          <Leaf className="size-5" />
        </span>
        zDoma
      </Link>
      <nav aria-label="Glavni meni" className="flex flex-col gap-1">
        {items.map(({ href, label, Icon, match }) => {
          const active = match(path);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-2xl px-3 text-base font-semibold focus-visible:outline-3 focus-visible:outline-ring",
                active ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl",
                  active ? "bg-brand text-white shadow-[0_4px_10px_oklch(0.73_0.15_150/0.35)]" : "bg-card text-primary shadow-soft",
                )}
              >
                <Icon className="size-5" />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
      {footer && <div className="mt-auto pt-4">{footer}</div>}
    </aside>
    </>
  );
}
