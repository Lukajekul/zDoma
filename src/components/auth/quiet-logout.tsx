"use client";

import { useEffect, useRef, useState } from "react";
import { BigButton } from "@/components/shell";
import { logout } from "@/app/prijava/actions";

/**
 * "Odjava" for patients (T-59): a small grey text link at the bottom of the screen,
 * so it isn't tapped by accident, and a confirm step before signing out.
 * Staying logged in is the big, green answer.
 */
export function QuietLogout() {
  const [asking, setAsking] = useState(false);
  const card = useRef<HTMLElement>(null);
  // The question opens at the bottom of the page: bring it fully into view.
  useEffect(() => {
    if (asking) card.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [asking]);

  if (!asking) {
    return (
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => setAsking(true)}
          className="min-h-12 px-4 text-lg text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-3 focus-visible:outline-ring"
        >
          Odjava
        </button>
      </div>
    );
  }

  return (
    <section ref={card} role="alertdialog" aria-labelledby="odjava-naslov" className="mt-8 flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-lift sm:mx-auto sm:w-full sm:max-w-xl">
      <h2 id="odjava-naslov" className="text-2xl font-bold">Se res želite odjaviti?</h2>
      <p className="text-lg">Za ponovno prijavo potrebujete davčno številko in svoje geslo.</p>
      <BigButton onClick={() => setAsking(false)}>Ne, ostanem prijavljen</BigButton>
      <form action={logout}>
        <BigButton type="submit" variant="secondary">Da, odjavi me</BigButton>
      </form>
    </section>
  );
}
