import { Suspense } from "react";
import { AppShell } from "@/components/shell";
import { EnableNotifications } from "@/components/push/enable-notifications";
import { requireProfile } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { setCheckinTime } from "./actions";
import { REMINDER_TIMES } from "./times";

export const metadata = { title: "Opomnik – zDoma" };

const label = (t: string) => t.replace(/^0/, "");

/** T-39: daily reminder time ("Opomnik ob") and notifications on this phone. */
export default function OpomnikPage() {
  return (
    <AppShell title="Dnevni opomnik" back="/patient">
      <p className="text-xl">
        Vsak dan vas spomnimo na pregled. Opomnika ne morete izklopiti, lahko pa izberete uro. Ko pregled opravite,
        opomnika ta dan ne dobite več.
      </p>
      <Suspense fallback={<p className="text-xl">Nalagam …</p>}>
        <TimePicker />
      </Suspense>
      <h2 className="mt-4 text-2xl font-bold">Obvestila na tem telefonu</h2>
      <EnableNotifications />
    </AppShell>
  );
}

async function TimePicker() {
  const profile = await requireProfile();
  const current = profile.checkin_time.slice(0, 5);
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-2xl font-bold">Opomnik ob {label(current)}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {REMINDER_TIMES.map((t) => (
          <form key={t} action={setCheckinTime.bind(null, t)}>
            <button
              type="submit"
              aria-pressed={t === current}
              className={cn(
                "min-h-14 w-full rounded-xl border-2 text-xl font-semibold",
                "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring",
                t === current ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted",
              )}
            >
              {label(t)}
              {t === current && " ✓"}
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}
