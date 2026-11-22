import { describe, expect, it } from "vitest";
import { predloge } from "@/lib/templates";
import { oceniOpazanje, vprasajSkrb } from "./opazanje";

const hf = predloge["srcno-popuscanje"];

describe("oceniOpazanje", () => {
  it("a plain note stays green unless the zadolženec asks for a nurse", () => {
    expect(vprasajSkrb(hf, ["zmeden"])).toBe(true);
    expect(oceniOpazanje(hf, ["zmeden"], false, "Ana (hčerka)")).toEqual({ status: "zeleno", razlogi: [], nujno: undefined });
    const skrbi = oceniOpazanje(hf, ["zmeden"], true, "Ana (hčerka)");
    expect(skrbi.status).toBe("rumeno");
    expect(skrbi.razlogi).toEqual(["Svojec prosi za pregled: Ana (hčerka)"]);
  });

  it("a red-flag chip raises its rule's reason; two warnings make it red", () => {
    expect(vprasajSkrb(hf, ["otekline"])).toBe(false);
    expect(oceniOpazanje(hf, ["otekline"], false, "Ana").status).toBe("rumeno");
    const oba = oceniOpazanje(hf, ["otekline", "dusenje-lezanje"], false, "Ana");
    expect(oba.status).toBe("rdece");
    expect(oba.razlogi).toContain("Svojec opazil: Bolj otekli gležnji ali noge");
  });

  it("an emergency chip is red, comes first and asks for 112", () => {
    const o = oceniOpazanje(hf, ["zmeden", "otekline", "prsi"], true, "Ana");
    expect(o.status).toBe("rdece");
    expect(o.nujno?.stopnja).toBe("klic112");
    expect(o.razlogi[0]).toBe("Svojec opazil: Bolečina v prsih ali omedlevica");
    expect(o.razlogi).not.toContain("Svojec prosi za pregled: Ana");
  });
});
