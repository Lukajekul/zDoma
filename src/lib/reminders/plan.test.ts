import { describe, expect, it } from "vitest";
import { planReminders, type ReminderRehab } from "./plan";

const janez: ReminderRehab = {
  rehabId: "r1", patientId: "p1", firstName: "Janez", checkinTime: "08:00:00", doneToday: false, sent: [],
};
const kinds = (now: string, r: Partial<ReminderRehab> = {}) => planReminders([{ ...janez, ...r }], now).map((x) => x.kind);

describe("daily check-in reminders", () => {
  it("sends the first reminder at the patient's time, once", () => {
    expect(kinds("07:59")).toEqual([]);
    const [first] = planReminders([janez], "08:00");
    expect(first.kind).toBe("prvi");
    expect(first.body).toBe("Dobro jutro, Janez. Čas je za današnji pregled. Traja 30 sekund.");
    expect(kinds("08:15", { sent: ["prvi"] })).toEqual([]);
  });

  it("escalates: second reminder after 2 h, zadolženec after 4 h, never after a check-in", () => {
    const [second] = planReminders([{ ...janez, sent: ["prvi"] }], "10:00");
    expect([second.kind, second.marks]).toEqual(["drugi", ["drugi"]]);
    expect(kinds("12:00", { sent: ["prvi", "drugi"] })).toEqual(["zadolzenec"]);
    expect(kinds("12:00", { doneToday: true })).toEqual([]);
  });

  it("edge: quiet after 21:00, a late run sends only the latest patient step", () => {
    expect(kinds("21:00")).toEqual([]);
    const late = planReminders([janez], "12:30");
    expect(late.map((x) => x.kind)).toEqual(["drugi", "zadolzenec"]);
    expect(late[0].marks).toEqual(["prvi", "drugi"]);
  });
});
