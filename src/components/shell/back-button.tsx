"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const backClass =
  "inline-flex min-h-12 items-center gap-2 rounded-xl bg-card px-4 text-lg font-semibold text-foreground shadow-soft hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring";

type BackButtonProps = {
  /** Where "Nazaj" goes. Prefer a fixed parent page; without it, the browser goes back. */
  href?: string;
  className?: string;
};

/** The "Nazaj" button every screen must show (AGENTS.md §7). */
export function BackButton({ href, className }: BackButtonProps) {
  const router = useRouter();
  const content = (
    <>
      <ArrowLeft aria-hidden className="size-6" />
      Nazaj
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn(backClass, className)}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={cn(backClass, className)}
      onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
    >
      {content}
    </button>
  );
}
