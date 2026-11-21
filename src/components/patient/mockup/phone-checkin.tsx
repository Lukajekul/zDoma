"use client";

import { useState } from "react";
import { PhoneCall, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MockEnd } from "./mock-end";
import { useMockCheckin } from "./use-mock-checkin";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
const UNKNOWN_KEY = "Te tipke ne poznam. Poslušajte še enkrat.";

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/\n/g, ". ").replace(/ = /g, ", "));
  u.lang = "sl-SI";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

/** Automated phone call mock: a voice reads the question, the patient presses a key. */
export function PhoneCheckin() {
  const { status, log, answer, restart } = useMockCheckin("Pritisnite");
  const [unknown, setUnknown] = useState(false);
  const lastPrompt = [...log].reverse().find((m) => m.from === "zdoma")!.text;
  const voice = unknown ? `${UNKNOWN_KEY}\n\n${lastPrompt}` : lastPrompt;
  const lastKey = [...log].reverse().find((m) => m.from === "patient")?.text;

  function press(key: string) {
    const ok = answer(key);
    setUnknown(!ok);
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl p-4",
          status === "asking" ? "bg-status-zeleno-bg text-status-zeleno" : "bg-muted text-foreground",
        )}
      >
        <PhoneCall aria-hidden className="size-7 shrink-0" />
        <p className="text-xl font-semibold">
          {status === "asking" ? "Klic: zDoma" : "Klic končan"}
        </p>
      </div>

      <div className="rounded-xl border-2 border-border p-4" aria-live="polite">
        <p className="mb-2 font-semibold text-muted-foreground">Glas v telefonu:</p>
        <p className="text-xl whitespace-pre-line">{voice}</p>
        <button
          type="button"
          onClick={() => speak(voice)}
          className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-lg border-2 border-border px-4 text-lg font-semibold hover:bg-muted"
        >
          <Volume2 aria-hidden className="size-6" />
          Poslušaj
        </button>
      </div>

      {status === "asking" && (
        <>
          {lastKey && <p className="text-lg">Zadnja pritisnjena tipka: <strong>{lastKey}</strong></p>}
          <div className="grid grid-cols-3 gap-3" role="group" aria-label="Tipkovnica telefona">
            {KEYS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => press(k)}
                className="min-h-16 rounded-2xl border-2 border-border bg-muted/60 text-3xl font-bold hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {k}
              </button>
            ))}
          </div>
        </>
      )}

      <MockEnd
        status={status}
        onRestart={() => {
          setUnknown(false);
          restart();
        }}
      />
    </div>
  );
}
