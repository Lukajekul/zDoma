import { describe, expect, it } from "vitest";
import { DRUGA_TEZAVA_BESEDILO, dodajPacientoveOznake } from "./preskok";

describe("dodajPacientoveOznake", () => {
  it("nothing skipped or flagged leaves the check-in as it was", () => {
    expect(dodajPacientoveOznake({ status: "zeleno", razlogi: [], preskocena: [], drugaTezava: false })).toEqual({
      status: "zeleno",
      razlogi: [],
    });
  });

  it("a skipped question is never green: it becomes a warning the nurse can read", () => {
    const o = dodajPacientoveOznake({ status: "zeleno", razlogi: [], preskocena: ["Ali ste otečeni?"], drugaTezava: false });
    expect(o.status).toBe("rumeno");
    expect(o.razlogi).toEqual(["Preskočeno vprašanje: Ali ste otečeni?"]);
  });

  it("skip plus another warning is red; red stays red", () => {
    const o = dodajPacientoveOznake({ status: "rumeno", razlogi: ["Teža +2,5 kg v 3 dneh"], preskocena: ["A", "B"], drugaTezava: false });
    expect(o.status).toBe("rdece");
    expect(o.razlogi[1]).toBe("Preskočena vprašanja (2): A; B");
    expect(dodajPacientoveOznake({ status: "rdece", razlogi: [], preskocena: [], drugaTezava: true })).toEqual({
      status: "rdece",
      razlogi: [DRUGA_TEZAVA_BESEDILO],
    });
  });
});
