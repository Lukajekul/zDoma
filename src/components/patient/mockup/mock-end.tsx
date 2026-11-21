import { Phone, RotateCcw } from "lucide-react";
import { BigButton } from "@/components/shell";
import type { MockStatus } from "./use-mock-checkin";

/** End of the mock flow: "Pokličite 112" or done, plus "Začni znova". */
export function MockEnd({ status, onRestart }: { status: MockStatus; onRestart: () => void }) {
  if (status === "asking") return null;
  return (
    <div className="flex flex-col gap-3">
      {status === "emergency" ? (
        <div className="flex flex-col gap-3 rounded-xl bg-status-rdece p-5 text-white">
          <p className="text-3xl font-bold">Pokličite 112</p>
          <p className="text-xl">Ne čakajte. Odgovori niso bili poslani.</p>
          <a
            href="tel:112"
            className="flex min-h-16 items-center justify-center gap-3 rounded-xl bg-white text-2xl font-bold text-status-rdece"
          >
            <Phone aria-hidden className="size-7" />
            Pokliči 112
          </a>
        </div>
      ) : (
        <p className="rounded-xl bg-status-zeleno-bg p-4 text-xl font-semibold text-status-zeleno">
          Pregled končan ✓
        </p>
      )}
      <BigButton variant="secondary" icon={<RotateCcw />} onClick={onRestart}>
        Začni znova
      </BigButton>
    </div>
  );
}
