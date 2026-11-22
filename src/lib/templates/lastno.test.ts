import { describe, expect, it } from "vitest";
import { oceniPregled } from "@/lib/triage";
import { predloge, predlogaZaRehab } from ".";
import { DA_NE, preberiLastnaVprasanja, preveriLastnoVajo, preveriLastnoVprasanje, zLastnimi } from "./lastno";
import { preveriPrilagoditev, uporabiPrilagoditev } from "./overrides";
import { preveriPredlogo } from "./validate";
import type { LastnaVaja, LastnoVprasanje } from "./types";

const kk = predloge["kolk-koleno"];
const rana: LastnoVprasanje = {
  id: "lastno-abcd1234",
  besedilo: "Ali rana boli bolj kot včeraj?",
  odgovori: DA_NE,
  opozorilo: { odgovor: "da", razlog: "Rana boli bolj kot včeraj" },
};
const vaja: LastnaVaja = { id: "lastna-abcd1234", naslov: "Dvig pete", koraki: ["Stojte ob stolu.", "Dvignite pete."], ponovitve: "10-krat" };

describe("doctors' own questions and exercises (T-69)", () => {
  it("normal: merged template stays valid and the red-flag answer raises a yellow alert", () => {
    const p = zLastnimi(kk, [rana], [vaja]);
    expect(preveriPredlogo(p)).toEqual([]);
    expect(p.vaje.at(-1)?.koraki).toEqual(vaja.koraki);
    const o = oceniPregled({ predloga: p, vrednosti: {}, danes: { datum: "2026-11-21", odgovori: { [rana.id]: "da" } }, prejsnji: [] });
    expect(o.status).toBe("rumeno");
    expect(o.razlogi.map((r) => r.besedilo)).toEqual(["Rana boli bolj kot včeraj"]);
    expect(o.nujno).toBeUndefined();
  });

  it("red flag: rehab copy is read back from stored JSON, broken entries dropped", () => {
    const p = predlogaZaRehab({ template_id: "kolk-koleno", custom_questions: [rana, { id: "x" }, null] });
    expect(p?.vprasanja.filter((q) => q.id.startsWith("lastno-"))).toHaveLength(1);
    expect(preberiLastnaVprasanja("nope")).toEqual([]);
  });

  it("edge: rejects bad items and a 7th daily question in the template editor", () => {
    expect(preveriLastnoVprasanje({ ...rana, odgovori: [DA_NE[0]] })).not.toEqual([]);
    expect(preveriLastnoVprasanje({ ...rana, opozorilo: { odgovor: "mogoce", razlog: "x" } })).not.toEqual([]);
    expect(preveriLastnoVprasanje({ ...rana, besedilo: "Teža {suhaTeza}?" })).not.toEqual([]);
    expect(preveriLastnoVajo({ ...vaja, koraki: ["1", "2", "3", "4", "5"] })).not.toEqual([]);
    const hf = predloge["srcno-popuscanje"];
    const sest = hf.vprasanja.filter((q) => q.pogostost === "dnevno").slice(0, 6).map((q) => q.id);
    expect(preveriPrilagoditev(hf, { lastnaVprasanja: [rana], izbranaVprasanja: [...sest, rana.id] })).toContain("Največ 6 dnevnih vprašanj.");
    const ok = uporabiPrilagoditev(hf, { lastnaVprasanja: [rana], izbranaVprasanja: [...sest.slice(0, 5), rana.id] });
    expect(ok.lastnaVprasanja).toEqual([rana]);
  });
});
