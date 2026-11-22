// Adds only the študent pomočnik demo to an existing seed, without wiping it:
//   npx tsx --env-file=.env.local scripts/seed/student-only.mts
// Uses the next free seed davčna številka (the same one a full `npm run seed` gives it).
// Needs SUPABASE_SERVICE_ROLE_KEY and SEED_PASSWORD, like the full seed.
import { todayLjubljana } from "@/lib/types";
import { davcne } from "./data";
import { adminClient, ok } from "./db";
import { addDemoStudent, DEMO_STUDENT } from "./student";

const password = process.env.SEED_PASSWORD ?? "";
if (password.length < 8) throw new Error("Set SEED_PASSWORD (at least 8 characters).");
const admin = adminClient();

const byDavcna = async (davcna: string) =>
  ok(await admin.from("profiles").select("id").eq("davcna", davcna).maybeSingle(), davcna)?.id;
const existing = ok(
  await admin.from("profiles").select("id").eq("first_name", DEMO_STUDENT.first).eq("last_name", DEMO_STUDENT.last).not("student_until", "is", null),
  "existing student",
);
if (existing?.length) {
  console.log("Demo student already exists, nothing to do.");
  process.exit(0);
}

// Marija Kos, Stanko Zupančič and Mojca Kovač keep these numbers across seed runs (docs/demo-accounts.md).
const [marija, stanko, mojca] = await Promise.all([byDavcna("99000083"), byDavcna("99000091"), byDavcna("99000016")]);
if (!marija || !stanko || !mojca) throw new Error("Seed patients not found: run `npm run seed` first.");

const used = new Set((ok(await admin.from("profiles").select("davcna").like("davcna", "99%"), "davcne") ?? []).map((p) => p.davcna));
let davcna = "";
for (const d of davcne()) if (!used.has(d)) { davcna = d; break; }

const s = await addDemoStudent(admin, {
  davcna, password, today: todayLjubljana(), assignedBy: mojca, approvedPatient: marija, pendingPatient: stanko,
});
console.log(`študent   ${s.person.davcna}  ${s.person.first} ${s.person.last} (praksa do ${s.until})`);
