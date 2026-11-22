// T-98: adds the "Razporedi študente" demo to an existing seed, without wiping it:
// Luka Kranjc gets his občine, Nika Zupan and Tim Golob are created if missing.
//   npx tsx --env-file=.env.local scripts/seed/studenti-razporedi.mts
// Needs SUPABASE_SERVICE_ROLE_KEY and SEED_PASSWORD, like the full seed.
import { todayLjubljana } from "@/lib/types";
import { davcne } from "./data";
import { adminClient, ok } from "./db";
import { addExtraStudents, DEMO_STUDENT, EXTRA_STUDENTS } from "./student";

const password = process.env.SEED_PASSWORD ?? "";
if (password.length < 8) throw new Error("Set SEED_PASSWORD (at least 8 characters).");
const admin = adminClient();

ok(
  await admin.from("profiles").update({ student_obcine: DEMO_STUDENT.obcine })
    .eq("first_name", DEMO_STUDENT.first).eq("last_name", DEMO_STUDENT.last).not("student_until", "is", null),
  "luka obcine",
);

const existing = ok(await admin.from("profiles").select("first_name").not("student_until", "is", null), "students") ?? [];
if (EXTRA_STUDENTS.every((s) => existing.some((e) => e.first_name === s.first))) {
  console.log("Extra students already exist, nothing more to do.");
  process.exit(0);
}

const used = new Set((ok(await admin.from("profiles").select("davcna").like("davcna", "99%"), "davcne") ?? []).map((p) => p.davcna));
const gen = davcne();
const next = () => {
  // gen.next(), not for…of: returning from for…of would close the generator.
  for (let r = gen.next(); !r.done; r = gen.next()) if (!used.has(r.value)) { used.add(r.value); return r.value; }
  throw new Error("No free davčna številka.");
};
for (const x of await addExtraStudents(admin, { davcne: next, password, today: todayLjubljana() })) {
  console.log(`študent   ${x.person.davcna}  ${x.person.first} ${x.person.last} (praksa do ${x.until})`);
}
