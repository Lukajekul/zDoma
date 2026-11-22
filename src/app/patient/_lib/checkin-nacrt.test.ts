import { describe, expect, it } from "vitest";
import { banka, odobriNacrt, sestaviNacrt } from "@/lib/moduli";
import { getPredloga } from "@/lib/templates";
import type { Checkin, CheckinAnswers, DoseLog, Medication } from "@/lib/types";
import { brezOdgovorovIzZdravil, planQuestions, predlogaIzNacrta } from "./checkin-nacrt";
import { answersFromPillsNacrt } from "./med-answers";
import { collectAnswers, copyFromYesterday, sameAsYesterdaySource, withFollowUps } from "./checkin-plan";

// Heart failure on a diuretic, discharged 20. 11. 2026, checked in on day 3.
const nacrt = odobriNacrt(
  sestaviNacrt({ odpust: "2026-11-20", mkb10: ["I50.1"], posegi: [], zdravila: [{ atc: "C03CA01" }] }, banka),
  { odstrani: [], pregledal: "test", cas: "2026-11-20T10:00:00Z" },
).nacrt!;
const predloga = predlogaIzNacrta(getPredloga("srcno-popuscanje")!, nacrt);
const checkin = (date: string, answers: CheckinAnswers): Checkin =>
  ({ checkin_date: date, answers, triage_status: "zeleno" }) as Checkin;
const yesterday = (extra: CheckinAnswers = {}) =>
  checkin("2026-11-22", {
    "jedro.nujno.v1": "ne", "sp.teza.v1": 72, "sp.dusenje.v1": "enako", "sp.otekline.v1": "ne",
    "di.vzeto.v1": "da", "di.omotica.v1": "ne", ...extra,
  });
const today = (history: Checkin[]) => planQuestions(predloga, nacrt, "2026-11-23", { suhaTeza: 72 }, history);

describe("check-in from an approved plan", () => {
  it("asks the red flag first and never fills it with 'Enako kot včeraj'", () => {
    const qs = today([yesterday()]);
    expect(qs[0].id).toBe("jedro.nujno.v1");
    expect(qs[0].always).toBe(true);
    expect(qs.find((q) => q.id === "sp.teza.v1")?.always).toBe(true);
    const same = copyFromYesterday(qs, sameAsYesterdaySource(qs, [yesterday()], "2026-11-23")!);
    expect(same["jedro.nujno.v1"]).toBeUndefined();
    expect(same["sp.teza.v1"]).toBeUndefined();
    expect(same["sp.dusenje.v1"]).toBe("enako");
  });

  it("puts the follow-up right after its parent only when triggered, and requires its answer", () => {
    const qs = today([]);
    const order = (a: CheckinAnswers) => withFollowUps(qs, a).map((q) => q.id);
    expect(order({ "sp.dusenje.v1": "enako" })).not.toContain("sp.dusenje-lezanje.v1");
    const worse = order({ "sp.dusenje.v1": "slabse" });
    expect(worse[worse.indexOf("sp.dusenje.v1") + 1]).toBe("sp.dusenje-lezanje.v1");

    const answers = Object.fromEntries(qs.map((q) => [q.id, q.kind === "teza" ? 72 : q.options[0].id]));
    expect(collectAnswers(qs, { ...answers, "sp.dusenje.v1": "slabse" }, {})).toBeUndefined();
    expect(collectAnswers(qs, { ...answers, "sp.dusenje.v1": "slabse", "sp.dusenje-lezanje.v1": "da" }, {})).toBeDefined();
  });

  it("offers the 112 screen on the red-flag answer", () => {
    const red = today([])[0];
    expect(red.kind === "izbira" && red.options.find((o) => o.id === "da")?.emergency?.kind).toBe("klic112");
  });
});

describe("plan medicine items from the pill list", () => {
  const med = (id: string, name: string, substance: string) =>
    ({ id, name, active_substance: substance, times: ["zjutraj"], change: "novo", start_date: "2026-11-20", end_date: null }) as unknown as Medication;
  const meds = [med("m1", "Edemid", "furosemid"), med("m2", "Concor", "bisoprolol")];
  const log = (medication_id: string, status: DoseLog["status"]) =>
    ({ medication_id, scheduled_date: "2026-11-22", time_of_day: "zjutraj", status }) as DoseLog;
  const ids = today([]).map((q) => q.id);

  it("answers the diuretic item when yesterday's diuretic was taken, ignoring other medicines", () => {
    const known = answersFromPillsNacrt(nacrt, ids, meds, [log("m1", "vzeto"), log("m2", "izpusceno")], "2026-11-23");
    expect(known).toEqual({ "di.vzeto.v1": "da" });
    const { questions, known: saved } = brezOdgovorovIzZdravil(today([]), known);
    expect(questions.map((q) => q.id)).not.toContain("di.vzeto.v1");
    expect(saved).toEqual({ "di.vzeto.v1": "da" });
  });

  it("still asks when a dose was skipped or not logged", () => {
    expect(answersFromPillsNacrt(nacrt, ids, meds, [log("m1", "izpusceno")], "2026-11-23")).toEqual({});
    expect(answersFromPillsNacrt(nacrt, ids, meds, [], "2026-11-23")).toEqual({});
  });

  it("keeps every question when the pill list would answer all of them", () => {
    const only = today([]).filter((q) => q.id === "di.vzeto.v1");
    const { questions, known } = brezOdgovorovIzZdravil(only, { "di.vzeto.v1": "da" });
    expect(questions).toHaveLength(1);
    expect(known).toEqual({});
  });
});
