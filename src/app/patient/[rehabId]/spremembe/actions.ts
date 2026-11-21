"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { getMyRehab } from "../../_lib/rehabs";
import { seenCookie } from "../../_lib/changes";

/** "Razumem": remember on this phone that the changes were seen, back to "Danes". */
export async function acknowledgeChanges(rehabId: string) {
  const profile = await requireProfile();
  const rehab = await getMyRehab(profile.id, rehabId);
  if (!rehab) redirect("/patient");
  (await cookies()).set(seenCookie(rehab.id), "1", { path: "/", maxAge: 60 * 60 * 24 * 365, httpOnly: true, sameSite: "lax" });
  redirect(`/patient/${rehab.id}`);
}
