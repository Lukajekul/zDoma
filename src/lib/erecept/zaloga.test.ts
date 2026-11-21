import { describe, expect, it } from "vitest";
import { dniZaloge, zalogaBesedilo, zalogaKmaluPorabljena, type ZalogaZdravilo } from "./zaloga";

const furosemid: ZalogaZdravilo = {
  name: "Furosemid",
  times: ["zjutraj"],
  change: "novo",
  end_date: null,
  picked_up_at: "2026-11-01",
  pickup_pack_size: 30,
};

describe("days of medicine left", () => {
  it("normal: 30 pills once a day, picked up 1. 11. → lasts to 30. 11.", () => {
    expect(dniZaloge(furosemid, "2026-11-25")).toBe(5);
    expect(zalogaKmaluPorabljena([furosemid], "2026-11-24")).toEqual([]);
    const o = zalogaKmaluPorabljena([furosemid], "2026-11-25");
    expect(zalogaBesedilo(o)).toBe("Zdravila vam bodo zmanjkala čez 5 dni. Pokličite osebnega zdravnika za nov recept.");
  });

  it("runs out today; twice a day halves the days", () => {
    expect(dniZaloge(furosemid, "2026-11-30")).toBe(0);
    expect(zalogaBesedilo(zalogaKmaluPorabljena([furosemid], "2026-11-30"))).toContain("zmanjkala danes");
    expect(dniZaloge({ ...furosemid, times: ["zjutraj", "zvecer"] }, "2026-11-15")).toBe(0);
  });

  it("edge: missing pack size, not picked up, as needed, stopped or ending first → no reminder", () => {
    expect(dniZaloge({ ...furosemid, pickup_pack_size: null }, "2026-11-29")).toBeNull();
    expect(dniZaloge({ ...furosemid, picked_up_at: null }, "2026-11-29")).toBeNull();
    expect(dniZaloge({ ...furosemid, times: [] }, "2026-11-29")).toBeNull();
    expect(dniZaloge({ ...furosemid, change: "ukinjeno" }, "2026-11-29")).toBeNull();
    expect(dniZaloge({ ...furosemid, end_date: "2026-11-30" }, "2026-11-29")).toBeNull();
    expect(dniZaloge({ ...furosemid, end_date: "2026-12-05" }, "2026-11-29")).toBe(1);
  });
});
