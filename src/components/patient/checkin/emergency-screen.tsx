"use client";

import { Phone } from "lucide-react";
import type { Emergency } from "@/app/patient/_lib/checkin-plan";

type Props = { emergency: Emergency; onContinue: () => void; onBack: () => void };

/** Full-screen "Pokličite 112" (or the ward phone), shown before anything is saved. */
export function EmergencyScreen({ emergency, onContinue, onBack }: Props) {
  const is112 = emergency.kind === "klic112";
  const number = is112 ? "112" : emergency.phone;
  return (
    <div role="alertdialog" aria-labelledby="nujno-naslov" className="fixed inset-0 z-50 overflow-y-auto bg-status-rdece text-white">
      <div className="mx-auto flex min-h-full max-w-xl flex-col justify-center gap-6 p-6 text-center">
        <span aria-hidden className="mx-auto grid size-24 place-items-center rounded-4xl bg-white/20">
          <Phone className="size-12" />
        </span>
        <h2 id="nujno-naslov" className="text-5xl font-extrabold tracking-tight">
          {is112 ? "Pokličite 112" : "Takoj pokličite oddelek"}
        </h2>
        <p className="text-2xl leading-snug">{emergency.reason}. Ne čakajte.</p>
        {number ? (
          <a
            href={`tel:${number.replace(/\s/g, "")}`}
            className="flex min-h-20 items-center justify-center gap-3 rounded-2xl bg-white text-3xl font-bold text-status-rdece"
          >
            <Phone aria-hidden className="size-9" />
            Pokliči {number}
          </a>
        ) : (
          <p className="rounded-xl bg-white p-4 text-xl font-semibold text-status-rdece">
            Pokličite številko oddelka z vašega odpustnega pisma.
          </p>
        )}
        <p className="text-xl">Vaši odgovori še niso poslani.</p>
        <div className="mt-6 flex flex-col gap-3">
          <button type="button" onClick={onContinue} className="min-h-16 rounded-2xl border-2 border-white text-xl font-bold">
            Nadaljuj pregled
          </button>
          <button type="button" onClick={onBack} className="min-h-14 rounded-xl text-xl font-semibold underline">
            Nazaj – popravi odgovor
          </button>
        </div>
      </div>
    </div>
  );
}
