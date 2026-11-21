// T-10 seed: `npm run seed`. Re-runnable: removes the previous seed users
// (marked seed: true) and everything attached, then creates ~40 patients,
// bolničarji with tereni, zadolženci and the demo story. Other users are untouched.
// Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SEED_PASSWORD
// (password for seeded staff and family accounts) in .env.local.
import { predloge } from "@/lib/templates";
import { todayLjubljana, type CheckinAnswers, type TemplateId, type TriageStatus } from "@/lib/types";
import {
  BOLNICARJI, IMENA_M, IMENA_Z, NADOMESCANJE, OBCINE, PRIIMKI, RAZDELITEV, SORODSTVO, davcne, rng,
} from "./data";
import { adminClient, cleanSeed, createAccount, ok, type Person } from "./db";
import { withFallback } from "./fallback";
import { addDays } from "./generate";
import { buildRehab, emptyRows, type RehabSpec, type Rows } from "./rehab";

const password = process.env.SEED_PASSWORD ?? "";
if (password.length < 8) throw new Error("Set SEED_PASSWORD (at least 8 characters) in .env.local.");

const admin = adminClient();
const today = todayLjubljana();
const r = rng(2026);
const nextDavcna = (() => {
  const g = davcne();
  return () => g.next().value as string;
})();
const tpl = (id: TemplateId) => withFallback(predloge[id]);

console.log(`Removed ${await cleanSeed(admin)} previous seed users.`);

// ---- Bolničarji, tereni, nadomeščanje ----
const staff: Record<string, string> = {};
const summary: string[] = [];
for (const b of BOLNICARJI) {
  const p: Person = { davcna: nextDavcna(), first: b.first, last: b.last };
  staff[b.key] = await createAccount(admin, p, { password, staff: true });
  summary.push(`bolničar  ${p.davcna}  ${p.first} ${p.last}${b.tereni.length ? ` (teren: ${b.tereni.join(", ")})` : ""}`);
}
ok(await admin.from("tereni").insert(BOLNICARJI.flatMap((b) => b.tereni.map((obcina) => ({ nurse_id: staff[b.key], obcina })))), "tereni");
ok(
  await admin.from("nadomescanje").insert({
    nurse_id: staff[NADOMESCANJE.nurse], substitute_id: staff[NADOMESCANJE.substitute],
    until_date: addDays(today, NADOMESCANJE.dniOdDanes), created_by: staff.tina,
  }),
  "nadomescanje",
);
const nurseFor = (obcina: string) => {
  const b = BOLNICARJI.find((x) => x.tereni.includes(obcina));
  return b ? staff[b.key] : null;
};

// ---- Patients ----
const rows: Rows = emptyRows();
const patients: { id: string; person: Person; rehabId: string }[] = [];
const counts: Record<TriageStatus, number> = { zeleno: 0, rumeno: 0, rdece: 0 };
const usedNames = new Set(["Janez Novak"]);

async function addPatient(person: Person, obcina: string, specs: Omit<RehabSpec, "patientId" | "createdBy" | "nurseId" | "today" | "r">[]) {
  const o = OBCINE.find((x) => x.obcina === obcina)!;
  const address = `${r.pick(o.ulice)} ${r.int(1, 60)}, ${o.posta}`;
  const id = await createAccount(admin, person, { address, obcina });
  let rehabId = "";
  for (const s of specs) {
    const built = buildRehab({ ...s, patientId: id, createdBy: r.pick([staff.tina, staff.marko]), nurseId: nurseFor(obcina), today, r }, rows);
    if (!s.zakljucena) {
      rehabId = built.id;
      counts[built.status]++;
    }
  }
  patients.push({ id, person, rehabId });
  return { id, rehabId };
}

// Demo story: heart failure, dry weight 72 kg → 74,5 kg, swollen ankles, one missed diuretic.
// The diuretic is the heart-failure template's first medicine (e.g. Lasix / furosemid).
const DIURETIK = tpl("srcno-popuscanje").zdravila[0].ime;
const demoStart = addDays(today, -6);
const weights = [71.8, 71.9, 71.7, 72.0, 72.8, 73.6, 74.5];
const demoFixed: Record<string, CheckinAnswers> = Object.fromEntries(
  weights.map((w, k): [string, CheckinAnswers] => [addDays(demoStart, k), k === 6 ? { teza: w, otekline: "da", diuretik: "ne" } : { teza: w }]),
);
const demo = await addPatient({ davcna: nextDavcna(), first: "Janez", last: "Novak" }, "Šentjur", [
  { predloga: tpl("srcno-popuscanje"), start: demoStart, profil: "zeleno", fixed: demoFixed,
    values: { suhaTeza: 72, zdraviloZaVodo: DIURETIK, ciljniTlak: "130/80" } },
]);
summary.push(`DEMO      ${patients[0].person.davcna}  Janez Novak (srčno popuščanje, rdeče)`);

// Two rehabilitacije, one finished.
const kolkLen = predloge["kolk-koleno"].privzetoTrajanjeDni;
await addPatient({ davcna: nextDavcna(), first: "Marija", last: "Kos" }, "Celje", [
  { predloga: tpl("kolk-koleno"), start: addDays(today, -(kolkLen + 60)), profil: "zeleno", zakljucena: true },
  { predloga: tpl("srce-po-infarktu"), start: addDays(today, -9), profil: "zeleno" },
]);
summary.push(`2 rehab.  ${patients[1].person.davcna}  Marija Kos (kolk – zaključena, srce po infarktu – aktivna)`);

// New medicine not picked up at the pharmacy (T-31).
await addPatient({ davcna: nextDavcna(), first: "Stanko", last: "Zupančič" }, "Žalec", [
  { predloga: tpl("srcno-popuscanje"), start: addDays(today, -4), profil: "zeleno", notPickedUp: true },
]);
summary.push(`eRecept   ${patients[2].person.davcna}  Stanko Zupančič (novo zdravilo ni prevzeto)`);

// The rest, spread over templates and občine; a few in Šmarje (no nurse → "Nedodeljeni").
let k = 0;
for (const [templateId, n] of RAZDELITEV) {
  for (let j = 0; j < n; j++, k++) {
    let first: string, last: string;
    do {
      first = r.pick(r.chance(0.5) ? IMENA_M : IMENA_Z);
      last = r.pick(PRIIMKI);
    } while (usedNames.has(`${first} ${last}`));
    usedNames.add(`${first} ${last}`);
    const obcina = k % 13 === 5 ? "Šmarje pri Jelšah" : r.pick(OBCINE.slice(0, 6)).obcina;
    const x = r.next();
    const start = addDays(today, -r.int(1, 24));
    await addPatient({ davcna: nextDavcna(), first, last }, obcina, [
      { predloga: tpl(templateId), start, profil: x < 0.6 ? "zeleno" : x < 0.85 ? "rumeno" : "rdece",
        skipToday: r.chance(0.15), installed: start < addDays(today, -1) || r.chance(0.5) },
    ]);
  }
}

// ---- Zadolženci ----
async function addCarer(person: Person, patientId: string, relation: string, status: "approved" | "pending") {
  const id = await createAccount(admin, person, { password });
  ok(await admin.from("family_access").insert({
    requester_id: id, patient_id: patientId, relation, status, decided_at: status === "approved" ? new Date().toISOString() : null,
  }), "family_access");
  summary.push(`svojec    ${person.davcna}  ${person.first} ${person.last} (${relation}, ${status === "approved" ? "odobren" : "čaka"})`);
  return id;
}
const ana = await addCarer({ davcna: nextDavcna(), first: "Ana", last: "Novak" }, demo.id, "hčerka", "approved");
for (const p of patients.slice(3, 8)) {
  await addCarer({ davcna: nextDavcna(), first: r.pick(IMENA_Z), last: p.person.last }, p.id, r.pick(SORODSTVO), "approved");
}
await addCarer({ davcna: nextDavcna(), first: r.pick(IMENA_M), last: patients[9].person.last }, patients[9].id, "sin", "pending");

// Demo: Ana marked the evening pills; yesterday's morning diuretic was missed.
const demoMeds = rows.medications.filter((m) => m.rehab_id === demo.rehabId);
const diuretic = demoMeds.find((m) => m.name === DIURETIK);
for (const l of rows.dose_logs.filter((l) => l.rehab_id === demo.rehabId)) {
  if (l.time_of_day === "zvecer") l.entered_by = ana;
  if (l.medication_id === diuretic?.id && l.scheduled_date === addDays(today, -1)) l.status = "izpusceno";
  else l.status = "vzeto";
}

// ---- Bulk insert ----
for (const table of ["rehabilitacije", "medications", "rehab_exercises", "checkins", "alerts", "dose_logs", "rehab_logs"] as const) {
  const all = rows[table];
  for (let i = 0; i < all.length; i += 500) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- rows are built to match the table
    ok(await admin.from(table).insert(all.slice(i, i + 500) as any), `insert ${table}`);
  }
  console.log(`${table}: ${all.length}`);
}
// The check-in trigger sets current_status per row; set it explicitly to the latest day.
for (const rh of rows.rehabilitacije) {
  ok(await admin.from("rehabilitacije").update({ current_status: rh.current_status as TriageStatus }).eq("id", rh.id as string), "status");
}

console.log(`\nPatients: ${patients.length} active rehab statuses: ${JSON.stringify(counts)}`);
console.log("Accounts (passwords: SEED_PASSWORD in .env.local; patients log in with their QR listek):");
for (const line of summary) console.log(`  ${line}`);
