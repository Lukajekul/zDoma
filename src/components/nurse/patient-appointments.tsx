"use client";

import { useState, useTransition } from "react";
import { addAppointment, setAppointmentStatus } from "@/app/nurse/[rehabId]/actions";
import { BigButton } from "@/components/shell";
import { type Appointment, appointmentRelative, formatAppointmentWhen, nextAppointment } from "@/lib/appointments";

const field = "min-h-12 rounded-2xl border-2 border-border bg-card px-3 text-xl";
const STATUS_WORD = { opravljeno: "Opravljeno ✓", preklicano: "Preklicano" } as const;

/** T-64: staff set the next kontrolni pregled (optional), mark it done or cancel it. */
export function PatientAppointments({ rehabId, appointments, today }: {
  rehabId: string;
  appointments: Appointment[];
  today: string;
}) {
  const next = nextAppointment(appointments, today);
  const overdue = appointments.filter((a) => a.status === "nacrtovano" && a.appt_date < today);
  const past = appointments.filter((a) => a.status !== "nacrtovano").slice(0, 5);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});
  const [pending, start] = useTransition();

  const mark = (id: string, status: "opravljeno" | "preklicano") => start(async () => {
    const res = await setAppointmentStatus(id, status);
    if (res.error) return setMsg({ error: res.error });
    setMsg({ ok: status === "opravljeno" ? "Kontrola označena kot opravljena ✓" : "Kontrola preklicana ✓" });
    // After a check-up the doctor usually sets the next one: offer the form straight away.
    if (status === "opravljeno") setOpen(true);
  });

  return (
    <section aria-labelledby="kontrole" className="flex flex-col gap-3 rounded-3xl bg-card p-4 shadow-soft">
      <h2 className="text-xl font-bold" id="kontrole">Kontrolni pregled</h2>

      {overdue.map((a) => (
        <div key={a.id} className="flex flex-col gap-2 rounded-2xl border-2 border-status-rumeno bg-status-rumeno-bg p-3 text-lg text-status-rumeno">
          <p>Kontrola {formatAppointmentWhen(a)} ({a.place}) še ni označena. Je bila opravljena?</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <BigButton disabled={pending} onClick={() => mark(a.id, "opravljeno")}>Opravljena</BigButton>
            <BigButton disabled={pending} variant="secondary" onClick={() => mark(a.id, "preklicano")}>Ni bila</BigButton>
          </div>
        </div>
      ))}

      {next ? (
        <div className="flex flex-col gap-2 text-lg">
          <p>
            <strong className="block text-xl">{appointmentRelative(next.appt_date, today)}: {formatAppointmentWhen(next)}</strong>
            {next.place}{next.doctor ? ` · ${next.doctor}` : ""}
            {next.note && <span className="block text-muted-foreground">{next.note}</span>}
          </p>
          <p className="text-base text-muted-foreground">Vidijo jo pacient, svojci in patronažna sestra.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {next.appt_date <= today && (
              <BigButton disabled={pending} onClick={() => mark(next.id, "opravljeno")}>Opravljena</BigButton>
            )}
            <BigButton
              disabled={pending}
              variant="secondary"
              onClick={() => window.confirm("Res prekličem to kontrolo?") && mark(next.id, "preklicano")}
            >
              Prekliči
            </BigButton>
          </div>
        </div>
      ) : (
        <p className="text-lg">Naslednja kontrola ni določena. Ni obvezno.</p>
      )}

      {open ? (
        <AppointmentForm
          today={today}
          pending={pending}
          onCancel={() => setOpen(false)}
          onSave={(input) => start(async () => {
            const res = await addAppointment(rehabId, input);
            if (res.error) return setMsg({ error: res.error });
            setMsg({ ok: "Kontrola shranjena ✓ Pacient jo vidi na začetnem zaslonu." });
            setOpen(false);
          })}
        />
      ) : (
        <BigButton variant="secondary" onClick={() => { setMsg({}); setOpen(true); }}>
          {next ? "Dodaj še eno kontrolo" : "Določi naslednjo kontrolo"}
        </BigButton>
      )}

      {msg.ok && <p role="status" className="rounded-lg bg-status-zeleno-bg p-3 text-lg font-semibold text-status-zeleno">{msg.ok}</p>}
      {msg.error && <p role="alert" className="rounded-lg bg-status-rdece-bg p-3 text-lg font-semibold text-status-rdece">{msg.error}</p>}

      {past.length > 0 && (
        <details className="text-lg">
          <summary className="cursor-pointer font-semibold">Pretekle kontrole ({past.length})</summary>
          <ul className="mt-2 flex flex-col gap-1">
            {past.map((a) => (
              <li key={a.id}>{formatAppointmentWhen(a)} · {a.place} · {STATUS_WORD[a.status as keyof typeof STATUS_WORD] ?? a.status}</li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

type Input = { date: string; time: string; place: string; doctor: string; note: string };

function AppointmentForm({ today, pending, onSave, onCancel }: {
  today: string;
  pending: boolean;
  onSave: (input: Input) => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState<Input>({ date: "", time: "", place: "", doctor: "", note: "" });
  const set = (k: keyof Input) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => { e.preventDefault(); onSave(v); }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-lg font-semibold">
          Datum
          <input required type="date" min={today} value={v.date} onChange={set("date")} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-lg font-semibold">
          Ura
          <input required type="time" step={300} value={v.time} onChange={set("time")} className={field} />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-lg font-semibold">
        Kje (ambulanta)
        <input required maxLength={120} placeholder="Kardiološka ambulanta, SB Celje" value={v.place} onChange={set("place")} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-lg font-semibold">
        Zdravnik <span className="font-normal text-muted-foreground">(ni obvezno)</span>
        <input maxLength={120} value={v.doctor} onChange={set("doctor")} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-lg font-semibold">
        Opomba za pacienta <span className="font-normal text-muted-foreground">(ni obvezno)</span>
        <input maxLength={300} placeholder="Prinesite seznam zdravil." value={v.note} onChange={set("note")} className={field} />
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        <BigButton type="submit" disabled={pending || !v.date || !v.time || !v.place.trim()}>
          {pending ? "Shranjujem …" : "Shrani kontrolo"}
        </BigButton>
        <BigButton type="button" variant="secondary" onClick={onCancel}>Ne zdaj</BigButton>
      </div>
    </form>
  );
}
