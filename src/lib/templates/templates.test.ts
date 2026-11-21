import { describe, expect, it } from "vitest";
import { nujnoPravilo, predloge, seznamPredlog, vstaviVrednosti } from ".";
import { preveriPredlogo } from "./validate";

describe("templates", () => {
  it("has all six templates, keyed by their own id", () => {
    expect(seznamPredlog).toHaveLength(6);
    for (const [id, p] of Object.entries(predloge)) expect(p.id).toBe(id);
  });

  it.each(seznamPredlog.map((p) => [p.id, p] as const))("%s is valid", (_id, p) => {
    expect(preveriPredlogo(p)).toEqual([]);
  });

  it("catches a rule pointing at a missing answer and too many questions", () => {
    const hf = predloge["srcno-popuscanje"];
    const broken = {
      ...hf,
      vprasanja: [...hf.vprasanja, { ...hf.vprasanja[1], id: "extra" }],
      pravila: [{ ...hf.pravila[2], id: "x", tip: "odgovor" as const, odgovori: ["nope"] }],
    };
    const napake = preveriPredlogo(broken);
    expect(napake.some((n) => n.includes("max 6"))).toBe(true);
    expect(napake.some((n) => n.includes("unknown answer nope"))).toBe(true);
  });

  it("finds emergency answers and fills patient values", () => {
    const hf = predloge["srcno-popuscanje"];
    expect(nujnoPravilo(hf, "prsi-omedlevica", "da")?.stopnja).toBe("klic112");
    expect(nujnoPravilo(hf, "otekline", "da")).toBeUndefined();
    expect(nujnoPravilo(predloge["rak-sistemsko"], "temperatura", "vrocina")?.stopnja).toBe("klicOddelek");
    expect(vstaviVrednosti("Pod {ciljniTlak}, {suhaTeza} kg, {manjka}", { ciljniTlak: "130/80", suhaTeza: 72.5 })).toBe(
      "Pod 130/80, 72,5 kg, {manjka}",
    );
  });
});
