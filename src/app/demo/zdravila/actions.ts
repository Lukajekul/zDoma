"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { mockERecept } from "@/lib/erecept";
import { syncPickupAlerts } from "@/lib/erecept/alerts";
import { todayLjubljana, type Uuid } from "@/lib/types";

/** Demo switch: mark a medicine picked up today (pack of 30) or not picked up, then update alerts. */
export async function setPickedUp(rehabId: Uuid, medicationId: Uuid, prevzeto: boolean): Promise<void> {
  await requireStaff();
  await mockERecept.nastaviPrevzem(medicationId, prevzeto, todayLjubljana(), 30);
  await syncPickupAlerts([rehabId]);
  revalidatePath("/demo/zdravila");
}
