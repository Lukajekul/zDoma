import "server-only";

// eRecept pick-up data behind one interface (T-31). For the hackathon the
// source is a mock that reads and writes the pick-up fields on `medications`
// (filled by seed data and the /demo switch). In production this would call
// eRecept via CEZIH and nothing else in the app would change.
import { createAdminClient } from "@/lib/supabase/admin";
import type { IsoDate, TimeOfDay, Uuid } from "@/lib/types";

export interface Prevzem {
  /** Pick-up date, null = not picked up. */
  datum: IsoDate | null;
  /** Pills in the pack, for days left (T-32). */
  pakiranje: number | null;
}

/** A medicine the patient took before admission (T-35). */
export interface ZdraviloPrej {
  name: string;
  dose: string;
  times: TimeOfDay[];
  purpose: string | null;
  active_substance: string | null;
}

export interface ERecept {
  /** Pick-up status for each medicine. */
  prevzemi(medicationIds: Uuid[]): Promise<Map<Uuid, Prevzem>>;
  /** Medicines the patient took before this admission (prescription history). */
  zdravilaPredSprejemom(patientId: Uuid): Promise<ZdraviloPrej[]>;
}

/** Mock: the pick-up fields on `medications` are the "pharmacy". Server only. */
export const mockERecept: ERecept & {
  /** Demo switch: mark a medicine picked up (today) or not picked up. */
  nastaviPrevzem(medicationId: Uuid, prevzeto: boolean, datum: IsoDate, pakiranje?: number): Promise<void>;
} = {
  async prevzemi(ids) {
    const map = new Map<Uuid, Prevzem>();
    if (ids.length === 0) return map;
    const { data, error } = await createAdminClient()
      .from("medications")
      .select("id, picked_up_at, pickup_pack_size")
      .in("id", ids);
    if (error) throw new Error(`eRecept mock: ${error.message}`);
    for (const m of data) map.set(m.id, { datum: m.picked_up_at, pakiranje: m.pickup_pack_size });
    return map;
  },

  // Mock history: the medicines of the patient's latest earlier rehabilitacija
  // (not the stopped ones). In production: the eRecept prescription history.
  async zdravilaPredSprejemom(patientId) {
    const admin = createAdminClient();
    const { data: last } = await admin
      .from("rehabilitacije")
      .select("id")
      .eq("patient_id", patientId)
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!last) return [];
    const { data, error } = await admin
      .from("medications")
      .select("name, dose, times, purpose, active_substance")
      .eq("rehab_id", last.id)
      .neq("change", "ukinjeno");
    if (error) throw new Error(`eRecept mock: ${error.message}`);
    return (data ?? []) as ZdraviloPrej[];
  },
  async nastaviPrevzem(id, prevzeto, datum, pakiranje) {
    const { error } = await createAdminClient()
      .from("medications")
      .update(
        prevzeto
          ? { picked_up_at: datum, pickup_pack_size: pakiranje ?? null }
          : { picked_up_at: null, pickup_pack_size: null },
      )
      .eq("id", id);
    if (error) throw new Error(`eRecept mock: ${error.message}`);
  },
};

/** The source the app uses. Swap for a CEZIH client in production. */
export const erecept: ERecept = mockERecept;
