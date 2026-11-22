import { timingSafeEqual } from "node:crypto";
import { logMissedDosesForAll } from "@/lib/doses/missed-job";
import { runReminders } from "@/lib/reminders/run";
import { runStudentReminders } from "@/lib/student/run";

/**
 * Called every 15 minutes by the Worker's cron trigger (worker.mjs) with
 * `Authorization: Bearer <CRON_SECRET>`:
 * - T-45: log yesterday's untaken pills as missed,
 * - T-39: send due daily check-in reminders,
 * - študent pomočnik: visit reminders and late-visit notices.
 * Each job is idempotent; one failing does not stop the other.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!secret || given.length !== secret.length || !timingSafeEqual(Buffer.from(given), Buffer.from(secret))) {
    return new Response("Forbidden", { status: 403 });
  }
  const [missed, reminders, students] = await Promise.allSettled([
    logMissedDosesForAll(),
    runReminders(),
    runStudentReminders(),
  ]);
  const value = <T,>(r: PromiseSettledResult<T>) => (r.status === "fulfilled" ? r.value : { error: String(r.reason) });
  const result = { missedDoses: value(missed), reminders: value(reminders), studentVisits: value(students) };
  const failed = [missed, reminders, students].some((r) => r.status === "rejected");
  return Response.json(result, { status: failed ? 500 : 200 });
}
