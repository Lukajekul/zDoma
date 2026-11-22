import { CalendarDays } from "lucide-react";
import { Card, IconTile } from "@/components/shell";
import { type Appointment, appointmentRelative, formatAppointmentWhen } from "@/lib/appointments";

type Props = {
  appointment: Pick<Appointment, "appt_date" | "appt_time" | "place" | "doctor" | "note">;
  today: string;
  /** Heading above the date, e.g. "Vaša naslednja kontrola" or "Janezova naslednja kontrola". */
  heading?: string;
};

/** T-64: the next kontrolni pregled, shown to the patient, the zadolženec and staff alike. */
export function AppointmentCard({ appointment: a, today, heading = "Naslednja kontrola pri zdravniku" }: Props) {
  return (
    <Card className="flex-row items-start">
      <IconTile ghost><CalendarDays /></IconTile>
      <div className="flex min-w-0 flex-col gap-1 text-lg">
        <span className="text-muted-foreground">{heading}</span>
        <strong className="text-xl">
          {appointmentRelative(a.appt_date, today)}: {formatAppointmentWhen(a)}
        </strong>
        <span>{a.place}{a.doctor ? ` · ${a.doctor}` : ""}</span>
        {a.note && <span className="text-muted-foreground">{a.note}</span>}
      </div>
    </Card>
  );
}
