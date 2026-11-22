"use client";

import { ArrowLeft, Check, MessageCircleWarning, Phone, SkipForward } from "lucide-react";
import type { Emergency } from "@/app/patient/_lib/checkin-plan";

/** "Nujna pomoč" from any question: the general 112 screen, nothing saved. */
export const NUJNA_POMOC: Emergency = {
  kind: "klic112",
  reason: "Če vam je zelo slabo, vas boli v prsih, težko dihate ali ste omedleli",
};

const small =
  "inline-flex min-h-12 items-center gap-2 rounded-xl bg-card px-4 text-lg font-semibold shadow-soft hover:bg-muted";

type Props = {
  onBack?: () => void;
  onSkip?: () => void;
  otherProblem: boolean;
  onOther: () => void;
  onCancelOther: () => void;
  onHelp: () => void;
};

/** T-94: the ways out of every check-in question, always in the same place. */
export function HelpRow({ onBack, onSkip, otherProblem, onOther, onCancelOther, onHelp }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {otherProblem && (
        <div role="status" className="flex items-start gap-3 rounded-xl bg-card p-4 text-lg shadow-soft">
          <Check aria-hidden className="mt-0.5 size-6 shrink-0 text-brand" />
          <div className="flex flex-col items-start">
            <span className="font-semibold">Sporočeno ✓ Sestri bomo sporočili, naj vas pokliče.</span>
            <button type="button" onClick={onCancelOther} className="min-h-12 font-semibold underline">
              Prekliči
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {onBack && (
          <button type="button" onClick={onBack} className={small}>
            <ArrowLeft aria-hidden className="size-6" />
            Nazaj
          </button>
        )}
        {onSkip && (
          <button type="button" onClick={onSkip} className={small}>
            <SkipForward aria-hidden className="size-6" />
            Preskoči
          </button>
        )}
        {!otherProblem && (
          <button type="button" onClick={onOther} className={small}>
            <MessageCircleWarning aria-hidden className="size-6" />
            Sporoči drugo težavo
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onHelp}
        className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-status-rdece px-5 text-xl font-bold text-white"
      >
        <Phone aria-hidden className="size-6" />
        Nujna pomoč
      </button>
    </div>
  );
}
