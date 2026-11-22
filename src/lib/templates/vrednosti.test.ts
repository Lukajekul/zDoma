import { describe, expect, it } from "vitest";
import { predloge } from ".";
import { potrebneVrednosti, vrednostiIzZdravil } from "./vrednosti";

const hf = predloge["srcno-popuscanje"];

describe("patient values needed at discharge", () => {
  it("asks dry weight only as an optional rule value, and not at all without the weight question", () => {
    expect(potrebneVrednosti(hf, ["teza"]).get("suhaTeza")).toBe("pravilo");
    expect(potrebneVrednosti(hf, ["dusenje"]).has("suhaTeza")).toBe(false);
    expect(potrebneVrednosti(hf, ["tlak"]).get("ciljniTlak")).toBe("besedilo");
  });

  it("requires the ward phone when a ticked question can lead to calling the ward", () => {
    const rak = predloge["rak-sistemsko"];
    const q = rak.pravila.find((r) => r.stopnja === "klicOddelek")!.vprasanje;
    expect(potrebneVrednosti(rak, [q]).get("telefonOddelka")).toBe("besedilo");
  });

  it("takes medicine names from the chosen medicines by name or active substance", () => {
    expect(vrednostiIzZdravil(hf, [{ name: "Lasix" }, { name: "Bisoprolol" }])).toEqual({ zdraviloZaVodo: "Lasix" });
    expect(vrednostiIzZdravil(hf, [{ name: "Furosemid Krka", active_substance: "Furosemid" }])).toEqual({
      zdraviloZaVodo: "Furosemid Krka",
    });
    expect(vrednostiIzZdravil(hf, [{ name: "Bisoprolol" }])).toEqual({});
  });
});
