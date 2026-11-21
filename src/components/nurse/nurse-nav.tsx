"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Clipboard, Leaf, Plus, Repeat, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/nurse", label: "Pacienti", Icon: Users, match: (p: string) => p === "/nurse" || /^\/nurse\/[0-9a-f-]{36}/.test(p) },
  { href: "/nurse/danes", label: "Danes obiščite", Icon: CalendarCheck, match: (p: string) => p.startsWith("/nurse/danes") || p.startsWith("/nurse/prvi-obisk") },
  { href: "/nurse/odpust", label: "Nova rehabilitacija", Icon: Plus, match: (p: string) => p.startsWith("/nurse/odpust") },
  { href: "/nurse/nadomescanje", label: "Nadomeščanje", Icon: Repeat, match: (p: string) => p.startsWith("/nurse/nadomescanje") },
  { href: "/nurse/predloge", label: "Predloge", Icon: Clipboard, match: (p: string) => p.startsWith("/nurse/predloge") },
];

/**
 * Bolničar sidebar, shown on large screens only (the staff area is PC-first).
 * On a phone the dashboard's own big buttons do the same job.
 */
export function NurseNav({ footer }: { footer?: ReactNode }) {
  const path = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col gap-2 overflow-y-auto p-5 lg:flex">
      <Link href="/nurse" className="mb-3 flex items-center gap-3 border-b px-3 pt-2 pb-5 text-xl font-extrabold">
        <span aria-hidden className="grid size-10 place-items-center rounded-xl bg-brand text-white">
          <Leaf className="size-5" />
        </span>
        zDoma
      </Link>
      <nav aria-label="Glavni meni" className="flex flex-col gap-1">
        {ITEMS.map(({ href, label, Icon, match }) => {
          const active = match(path);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-2xl px-3 text-lg font-semibold focus-visible:outline-3 focus-visible:outline-ring",
                active ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl",
                  active ? "bg-brand text-white" : "bg-card text-primary shadow-soft",
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
  );
}
