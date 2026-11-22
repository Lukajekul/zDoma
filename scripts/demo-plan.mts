// T-80 demo: give one seeded heart-failure patient (Stanko Zupančič, 99000091)
// discharge facts and an approved plan composed by the modular engine, so the
// plan-driven check-in can be shown. Insert-only and idempotent: does nothing
// when the rehabilitacija already has a plan. Never updates or deletes rows.
//
//   npx tsx --env-file=.env.local scripts/demo-plan.mts [davcna]
import { banka, odobriNacrt, sestaviNacrt, type DejstvaPacienta } from "@/lib/moduli";
import type { Json } from "@/lib/database.types";
import { adminClient, ok } from "./seed/db";

const davcna = process.argv[2] ?? "99000091";
const admin = adminClient();

const patient = ok(await admin.from("profiles").select("id, first_name, last_name").eq("davcna", davcna).single(), "patient")!;
const rehab = ok(
  await admin
    .from("rehabilitacije")
    .select("id, start_date, created_by, template_id")
    .eq("patient_id", patient.id)
    .eq("status", "aktivna")
    .eq("template_id", "srcno-popuscanje")
    .order("start_date", { ascending: false })
    .limit(1)
    .single(),
  "active heart-failure rehabilitacija",
)!;
const name = `${patient.first_name} ${patient.last_name} (${davcna})`;

const existing = ok(await admin.from("patient_plans").select("version").eq("rehab_id", rehab.id).limit(1), "plans");
if (existing?.length) {
  console.log(`${name} already has a plan; nothing to do.`);
  process.exit(0);
}
const staffId = rehab.created_by;
if (!staffId) throw new Error("The rehabilitacija has no staff author to approve the plan.");
const staff = ok(await admin.from("profiles").select("first_name, last_name").eq("id", staffId).single(), "staff")!;

// Heart failure (I50.9) on a loop diuretic (furosemid, C03CA01): core + heart failure + diuretic modules.
const dejstva: DejstvaPacienta = {
  odpust: rehab.start_date,
  mkb10: ["I50.9"],
  posegi: [],
  zdravila: [{ atc: "C03CA01", ime: "Furosemid" }],
};
const facts = ok(await admin.from("patient_facts").select("rehab_id").eq("rehab_id", rehab.id), "facts");
if (!facts?.length) {
  ok(
    await admin.from("patient_facts").insert({
      rehab_id: rehab.id,
      discharge_date: dejstva.odpust,
      icd10: dejstva.mkb10,
      procedures: dejstva.posegi,
      medicines: dejstva.zdravila as Json,
      entered_by: staffId,
    }),
    "insert facts",
  );
}

const { nacrt, napake } = odobriNacrt(sestaviNacrt(dejstva, banka), {
  odstrani: [],
  pregledal: `${staff.first_name} ${staff.last_name}`,
  cas: new Date().toISOString(),
});
if (!nacrt) throw new Error(napake.join(" "));
ok(
  await admin.from("patient_plans").insert({
    rehab_id: rehab.id,
    version: 1,
    bank_version: nacrt.verzija,
    plan: nacrt as unknown as Json,
    approved_by: staffId,
  }),
  "insert plan",
);
ok(
  await admin.from("audit_log").insert({
    actor_id: staffId,
    action: "nacrt_odobren",
    entity: "rehabilitacije",
    entity_id: rehab.id,
    details: { verzija: 1, moduli: nacrt.moduli, odstranjeno: [], vir: "scripts/demo-plan.mts" },
  }),
  "audit log",
);
console.log(`${name}: plan v1 with modules ${nacrt.moduli.join(", ")} (${nacrt.vnosi.length} items).`);
