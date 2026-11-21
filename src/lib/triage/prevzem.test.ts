import { describe, expect, it } from "vitest";
import { oceniPrevzem, prevzemDosegel, prevzemRazlog, type PrevzemZdravilo } from ".";

const furosemid: PrevzemZdravilo = { id: "f", name: "Furosemid", change: "novo", picked_up_at: null };
const bisoprolol: PrevzemZdravilo = { id: "b", name: "Bisoprolol", change: "nespremenjeno", picked_up_at: null };

describe("medicine pick-up (eRecept)", () => {
  it("picked-up medicine is fine, unchanged medicines are not checked", () => {
    const o = oceniPrevzem([{ ...furosemid, picked_up_at: "2026-11-19" }, bisoprolol], "2026-11-18", "2026-11-25");
    expect(o).toEqual([{ zdraviloId: "f", ime: "Furosemid", dni: 7, stopnja: "v-redu" }]);
  });

  it("not picked up 3 days after discharge → staff alert with a reason", () => {
    const [o] = oceniPrevzem([furosemid], "2026-11-18", "2026-11-21");
    expect(o.stopnja).toBe("osebje");
    expect(prevzemDosegel(o, "pacient")).toBe(true);
    expect(prevzemRazlog(o)).toBe("Furosemid ni prevzet 3 dni po odpustu");
  });

  it("escalates step by step: wait, patient, then zadolženec and staff", () => {
    const step = (danes: string) => oceniPrevzem([furosemid], "2026-11-18", danes)[0].stopnja;
    expect(step("2026-11-18")).toBe("caka");
    expect(step("2026-11-20")).toBe("pacient");
    expect(step("2026-11-21")).toBe("osebje");
    expect(prevzemRazlog({ ime: "Furosemid", dni: 2 })).toBe("Furosemid ni prevzet 2 dneva po odpustu");
  });
});
