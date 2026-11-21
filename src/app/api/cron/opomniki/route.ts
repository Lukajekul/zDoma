import { timingSafeEqual } from "node:crypto";
import { runReminders } from "@/lib/reminders/run";

/**
 * T-39: called every 15 minutes by the Worker's cron trigger (worker.mjs) with
 * `Authorization: Bearer <CRON_SECRET>`. Sends due daily check-in reminders.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!secret || given.length !== secret.length || !timingSafeEqual(Buffer.from(given), Buffer.from(secret))) {
    return new Response("Forbidden", { status: 403 });
  }
  const result = await runReminders();
  return Response.json(result);
}
