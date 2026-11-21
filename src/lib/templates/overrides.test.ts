import { describe, expect, it } from "vitest";
import { predloge } from ".";
import { jePrazna, opisSpremembe, preberiPrilagoditev, preveriPrilagoditev, stisniPrilagoditev, uporabiPrilagoditev } from "./overrides";
import { preveriPredlogo } from "./validate";

const hf = predloge["srcno-popuscanje"];

describe("template overrides (T-24)", () => {
  it("normal: changes length, ticked questions and an exercise, rules untouched", () => {
    const m = uporabiPrilagoditev(hf, {
      privzetoTrajanjeDni: 45,
      izbranaVprasanja: ["teza", "otekline"],
      vaje: { "srcno-hoja": { izbrana: false, ponovitve: "20 minut na dan" } },
    });
    expect(m.privzetoTrajanjeDni).toBe(45);
    expect(m.vprasanja.filter((q) => q.privzetoIzbrano).map((q) => q.id)).toEqual(["teza", "otekline"]);
    expect(m.vaje[0]).toMatchObject({ id: "srcno-hoja", privzetoIzbrano: false, ponovitve: "20 minut na dan" });
    expect(m.pravila).toBe(hf.pravila);
    expect(m.zdravila).toBe(hf.zdravila);
    expect(preveriPredlogo(m)).toEqual([]);
    expect(jePrazna(hf, {})).toBe(true);
  });

  it("rejects too many daily questions, unknown ids and bad lengths; invalid overrides are ignored", () => {
    const vsa = hf.vprasanja.map((q) => q.id);
    const prevec = { izbranaVprasanja: [...vsa, ...vsa.slice(0, 1)] };
    expect(preveriPrilagoditev(predloge["mozganska-kap"], { izbranaVprasanja: [] })).toContain("Izberite vsaj eno dnevno vprašanje.");
    expect(preveriPrilagoditev(hf, { izbranaVprasanja: ["neobstaja"] })).toContain("Neznano vprašanje.");
    expect(preveriPrilagoditev(hf, { privzetoTrajanjeDni: 0 })).toHaveLength(1);
    expect(preveriPrilagoditev(hf, prevec)).toEqual([]); // 6 daily questions is the maximum, still fine
    expect(uporabiPrilagoditev(hf, { privzetoTrajanjeDni: 999 })).toBe(hf);
  });

  it("edge: malformed stored JSON is dropped piece by piece", () => {
    expect(preberiPrilagoditev(null)).toEqual({});
    expect(preberiPrilagoditev([1, 2])).toEqual({});
    expect(preberiPrilagoditev({ privzetoTrajanjeDni: "30", izbranaVprasanja: [1], vaje: { a: { izbrana: "da" }, b: { izbrana: true } } })).toEqual({
      vaje: { b: { izbrana: true } },
    });
  });
});

describe("audit summary", () => {
  it("lists what changed", () => {
    expect(opisSpremembe(hf, {}, { privzetoTrajanjeDni: 45, vaje: { "srcno-hoja": { izbrana: false } } })).toEqual([
      "Trajanje: 30 dni → 45 dni",
      "Odstranjena vaja: Hoja po ravnem",
    ]);
    expect(opisSpremembe(hf, {}, {})).toEqual(["Brez sprememb"]);
  });

  it("stores only what differs from the file", () => {
    const vse = Object.fromEntries(hf.vaje.map((v) => [v.id, { izbrana: true, ponovitve: v.ponovitve }]));
    const izvirna = hf.vprasanja.filter((q) => q.privzetoIzbrano).map((q) => q.id);
    expect(stisniPrilagoditev(hf, { privzetoTrajanjeDni: 30, izbranaVprasanja: izvirna, vaje: vse })).toEqual({});
    expect(stisniPrilagoditev(hf, { privzetoTrajanjeDni: 60, vaje: { ...vse, "srcno-hoja": { izbrana: false, ponovitve: hf.vaje[0].ponovitve } } })).toEqual({
      privzetoTrajanjeDni: 60,
      vaje: { "srcno-hoja": { izbrana: false } },
    });
  });
});
