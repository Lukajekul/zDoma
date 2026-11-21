import "server-only";

// Web Push with @pushforge/builder (Web Crypto, works on Cloudflare Workers).
import { buildPushHTTPRequest } from "@pushforge/builder";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Uuid } from "@/lib/types";

export interface PushPayload {
  title: string;
  body: string;
  /** Page to open on tap. */
  url: string;
}

const ADMIN_CONTACT = "mailto:zdoma@example.com";

function privateJwk(): string {
  const k = process.env.VAPID_PRIVATE_KEY;
  if (!k) throw new Error("Missing VAPID_PRIVATE_KEY (server only).");
  return k;
}

/**
 * Sends one notification to every device of these users. Subscriptions the
 * push service reports as gone (404/410) are removed. Returns devices reached.
 */
export async function sendPush(userIds: Uuid[], payload: PushPayload): Promise<number> {
  if (userIds.length === 0) return 0;
  const admin = createAdminClient();
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .in("user_id", userIds);

  let reached = 0;
  for (const s of subs ?? []) {
    try {
      const req = await buildPushHTTPRequest({
        privateJWK: privateJwk(),
        subscription: { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        message: { payload: { ...payload }, adminContact: ADMIN_CONTACT, options: { ttl: 6 * 3600, urgency: "high" } },
      });
      const res = await fetch(req.endpoint, { method: "POST", headers: req.headers, body: req.body });
      if (res.status === 404 || res.status === 410) await admin.from("push_subscriptions").delete().eq("id", s.id);
      else if (res.ok) reached++;
    } catch {
      // One broken subscription must not stop the others.
    }
  }
  return reached;
}
