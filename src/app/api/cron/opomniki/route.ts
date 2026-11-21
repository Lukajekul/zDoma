import { timingSafeEqual } from "node:crypto";
import { logMissedDosesForAll } from "@/lib/doses/missed-job";
import { runReminders } from "@/lib/reminders/run";

/**
 * Called every 15 minutes by the Worker's cron trigger (worker.mjs) with
 * `Authorization: Bearer <CRON_SECRET>`:
 * - T-45: log yesterday's untaken pills as missed,
 * - T-39: send due daily check-in reminders.
 * Each job is idempotent; one failing does not stop the other.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!secret || given.length !== secret.length || !timingSafeEqual(Buffer.from(given), Buffer.from(secret))) {
    return new Response("Forbidden", { status: 403 });
  }
  const [missed, reminders] = await Promise.allSettled([logMissedDosesForAll(), runReminders()]);
  const result = {
    missedDoses: missed.status === "fulfilled" ? missed.value : { error: String(missed.reason) },
    reminders: reminders.status === "fulfilled" ? reminders.value : { error: String(reminders.reason) },
  };
  const failed = missed.status === "rejected" || reminders.status === "rejected";
  return Response.json(result, { status: failed ? 500 : 200 });
}
