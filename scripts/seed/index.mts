// T-10 seed: `npm run seed`. Re-runnable: removes the previous seed users
// (marked seed: true) and everything attached, then creates the demo story,
// a few filler patients, two bolničarji and the študent pomočnik (T-87: kept
// small for the 3-minute demo). Other users are untouched.
// Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SEED_PASSWORD
// (password for every seeded account) in .env.local.
import { predloge } from "@/lib/templates";
import { todayLjubljana, type CheckinAnswers, type TemplateId, type TriageStatus } from "@/lib/types";
import { BOLNICARJI, DEMO_DAVCNE, OBCINE, POLNILA, davcne, rng, staffEmail } from "./data";
import { adminClient, cleanSeed, createAccount, ok, type Person } from "./db";
import { withFallback } from "./fallback";
import { addDays } from "./generate";
import { buildRehab, emptyRows, type RehabSpec, type Rows } from "./rehab";
import { addDemoStudent } from "./student";

const password = process.env.SEED_PASSWORD ?? "";
if (password.length < 8) throw new Error("Set SEED_PASSWORD (at least 8 characters) in .env.local.");

const admin = adminClient();
const today = todayLjubljana();
const r = rng(2026);
// Fillers take the first free numbers; staff and the demo story keep fixed ones.
const fixedDavcne = new Set<string>([...BOLNICARJI.map((b) => b.davcna), ...Object.values(DEMO_DAVCNE)]);
const nextDavcna = (() => {
  const g = davcne();
  return () => {
    for (;;) {
      const d = g.next().value as string;
      if (!fixedDavcne.has(d)) return d;
    }
  };
})();
const tpl = (id: TemplateId) => withFallback(predloge[id]);

console.log(`Removed ${await cleanSeed(admin)} previous seed users.`);

// ---- Bolničarji, tereni ----
const staff: Record<string, string> = {};
const summary: string[] = [];
for (const b of BOLNICARJI) {
  const p: Person = { davcna: b.davcna, first: b.first, last: b.last };
  const email = staffEmail(b);
  staff[b.key] = await createAccount(admin, p, { password, staff: true, email });
  summary.push(`bolničar  ${email}  ${p.davcna}  ${p.first} ${p.last}${b.tereni.length ? ` (teren: ${b.tereni.join(", ")})` : ""}`);
}
ok(await admin.from("tereni").insert(BOLNICARJI.flatMap((b) => b.tereni.map((obcina) => ({ nurse_id: staff[b.key], obcina })))), "tereni");
const nurseFor = (obcina: string) => {
  const b = BOLNICARJI.find((x) => x.tereni.includes(obcina));
  return b ? staff[b.key] : null;
};

// ---- Patients ----
const rows: Rows = emptyRows();
const patients: { id: string; person: Person; rehabId: string }[] = [];
const counts: Record<TriageStatus, number> = { zeleno: 0, rumeno: 0, rdece: 0 };

async function addPatient(person: Person, obcina: string, specs: Omit<RehabSpec, "patientId" | "createdBy" | "nurseId" | "today" | "r">[]) {
  const o = OBCINE.find((x) => x.obcina === obcina)!;
  const address = `${r.pick(o.ulice)} ${r.int(1, 60)}, ${o.posta}`;
  // Demo patients get the shared demo password (shown in docs/demo-accounts.md), not a QR starting password.
  const id = await createAccount(admin, person, { password, address, obcina });
  let rehabId = "";
  for (const s of specs) {
    const built = buildRehab({ ...s, patientId: id, createdBy: staff.tina, nurseId: nurseFor(obcina), today, r }, rows);
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
// The story ends yesterday, so Janez can still do today's check-in live (T-90).
const demoStart = addDays(today, -7);
const weights = [71.8, 71.9, 71.7, 72.0, 72.8, 73.6, 74.5];
const demoFixed: Record<string, CheckinAnswers> = Object.fromEntries(
  weights.map((w, k): [string, CheckinAnswers] => [addDays(demoStart, k), k === 6 ? { teza: w, otekline: "da", diuretik: "ne" } : { teza: w }]),
);
const demo = await addPatient({ davcna: DEMO_DAVCNE.janez, first: "Janez", last: "Novak" }, "Šentjur", [
  { predloga: tpl("srcno-popuscanje"), start: demoStart, profil: "zeleno", fixed: demoFixed,
    values: { suhaTeza: 72, zdraviloZaVodo: DIURETIK, ciljniTlak: "130/80" } },
]);
summary.push(`DEMO      ${DEMO_DAVCNE.janez}  Janez Novak (srčno popuščanje, rdeče)`);

// Two rehabilitacije, one finished.
const kolkLen = predloge["kolk-koleno"].privzetoTrajanjeDni;
const marija = await addPatient({ davcna: DEMO_DAVCNE.marija, first: "Marija", last: "Kos" }, "Celje", [
  { predloga: tpl("kolk-koleno"), start: addDays(today, -(kolkLen + 60)), profil: "zeleno", zakljucena: true },
  { predloga: tpl("srce-po-infarktu"), start: addDays(today, -9), profil: "zeleno" },
]);
summary.push(`2 rehab.  ${DEMO_DAVCNE.marija}  Marija Kos (kolk – zaključena, srce po infarktu – aktivna)`);

// New medicine not picked up at the pharmacy (T-31).
const stanko = await addPatient({ davcna: DEMO_DAVCNE.stanko, first: "Stanko", last: "Zupančič" }, "Žalec", [
  { predloga: tpl("srcno-popuscanje"), start: addDays(today, -4), profil: "zeleno", notPickedUp: true },
]);
summary.push(`eRecept   ${DEMO_DAVCNE.stanko}  Stanko Zupančič (novo zdravilo ni prevzeto)`);

// A few fixed fillers so the dashboard isn't empty (T-87).
for (const f of POLNILA) {
  const davcna = nextDavcna();
  await addPatient({ davcna, first: f.first, last: f.last }, f.obcina, [
    { predloga: tpl(f.predloga), start: addDays(today, -r.int(5, 15)), profil: f.profil, installed: true },
  ]);
  summary.push(`pacient   ${davcna}  ${f.first} ${f.last} (${f.obcina}, ${f.predloga}, ${f.profil})`);
}

// ---- Zadolženci ----
async function addCarer(person: Person, patientId: string, relation: string) {
  const id = await createAccount(admin, person, { password });
  ok(await admin.from("family_access").insert({
    requester_id: id, patient_id: patientId, relation, status: "approved", decided_at: new Date().toISOString(),
  }), "family_access");
  summary.push(`svojec    ${person.davcna}  ${person.first} ${person.last} (${relation}, odobren)`);
  return id;
}
const ana = await addCarer({ davcna: DEMO_DAVCNE.ana, first: "Ana", last: "Novak" }, demo.id, "hčerka");
// T-63: family member of the eRecept patient, so "Skrbim za" shows the pharmacy warning (T-48/T-62).
await addCarer({ davcna: DEMO_DAVCNE.vesna, first: "Vesna", last: "Zupančič" }, stanko.id, "hčerka");

// T-86: študent pomočnik, approved by Marija Kos, waiting for Stanko Zupančič.
const student = await addDemoStudent(admin, {
  davcna: DEMO_DAVCNE.student, password, today, assignedBy: staff.mojca, approvedPatient: marija.id, pendingPatient: stanko.id,
});
summary.push(`študent   ${student.person.davcna}  Luka Kranjc (praksa do ${student.until}; Marija Kos odobrila, Stanko čaka)`);

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
console.log("Accounts (password: SEED_PASSWORD in .env.local):");
for (const line of summary) console.log(`  ${line}`);
