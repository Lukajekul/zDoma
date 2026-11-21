"use client";

import { useState, useTransition } from "react";
import { BigButton } from "@/components/shell";
import { NAJVEC_DNEVNIH_VPRASANJ, vstaviVrednosti, type Predloga } from "@/lib/templates";
import { NAJVEC_DNI, preveriPrilagoditev, uporabiPrilagoditev, type Prilagoditev } from "@/lib/templates/overrides";
import { shraniPrilagoditev } from "../actions";

const HITRI_DNEVI = [14, 30, 60, 90];
const box = "flex flex-col gap-3 rounded-3xl bg-card shadow-soft p-4";
const row = "flex min-h-14 cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-muted";
const input =
  "min-h-12 w-full rounded-2xl border-2 border-border bg-card px-4 text-lg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** T-24: edit plan defaults of one template. Rules, thresholds and medicines are not editable here. */
export function TemplateEditor({ predloga, prilagoditev }: { predloga: Predloga; prilagoditev: Prilagoditev }) {
  const zacetna = uporabiPrilagoditev(predloga, prilagoditev);
  const [dni, setDni] = useState(String(zacetna.privzetoTrajanjeDni));
  const [vprasanja, setVprasanja] = useState(zacetna.vprasanja.filter((q) => q.privzetoIzbrano).map((q) => q.id));
  const [vaje, setVaje] = useState(
    Object.fromEntries(zacetna.vaje.map((v) => [v.id, { izbrana: v.privzetoIzbrano ?? true, ponovitve: v.ponovitve }])),
  );
  const [sporocilo, setSporocilo] = useState<{ ok: boolean; text: string }>();
  const [potrdiPonastavitev, setPotrdiPonastavitev] = useState(false);
  const [pending, start] = useTransition();

  const vnos: Prilagoditev = { privzetoTrajanjeDni: Number(dni), izbranaVprasanja: vprasanja, vaje };
  const napake = preveriPrilagoditev(predloga, vnos);
  const dnevna = predloga.vprasanja.filter((q) => q.pogostost === "dnevno" && vprasanja.includes(q.id)).length;
  const oznake = Object.fromEntries(predloga.vrednostiPacienta.map((v) => [v.kljuc, `«${v.oznaka.toLowerCase()}»`]));
  const toggle = (id: string) => setVprasanja((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  function shrani(o: Prilagoditev, ok: string) {
    setSporocilo(undefined);
    start(async () => {
      const res = await shraniPrilagoditev(predloga.id, o);
      setSporocilo(res.error ? { ok: false, text: res.error } : { ok: true, text: ok });
      if (!res.error && Object.keys(o).length === 0) {
        setDni(String(predloga.privzetoTrajanjeDni));
        setVprasanja(predloga.vprasanja.filter((q) => q.privzetoIzbrano).map((q) => q.id));
        setVaje(Object.fromEntries(predloga.vaje.map((v) => [v.id, { izbrana: v.privzetoIzbrano ?? true, ponovitve: v.ponovitve }])));
      }
      setPotrdiPonastavitev(false);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <section className={box}>
        <h2 className="text-2xl font-bold">Privzeto trajanje</h2>
        <label className="flex flex-col gap-2 text-lg font-semibold">
          Dni (1–{NAJVEC_DNI})
          <input className={input} type="number" inputMode="numeric" min={1} max={NAJVEC_DNI} value={dni} onChange={(e) => setDni(e.target.value)} />
        </label>
        <div className="flex flex-wrap gap-2">
          {HITRI_DNEVI.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDni(String(d))}
              aria-pressed={Number(dni) === d}
              className="min-h-12 rounded-2xl bg-card shadow-soft px-4 text-lg font-semibold aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              {d} dni
            </button>
          ))}
        </div>
        <p className="text-lg text-muted-foreground">Izvirno v predlogi: {predloga.privzetoTrajanjeDni} dni.</p>
      </section>

      <section className={box}>
        <h2 className="text-2xl font-bold">Vprašanja, ki so ob odpustu že označena</h2>
        <p className={dnevna > NAJVEC_DNEVNIH_VPRASANJ ? "text-lg font-semibold text-status-rdece" : "text-lg"}>
          Dnevnih vprašanj: {dnevna} od največ {NAJVEC_DNEVNIH_VPRASANJ}
        </p>
        {predloga.vprasanja.map((q) => (
          <label key={q.id} className={row}>
            <input type="checkbox" className="mt-1 size-6 shrink-0" checked={vprasanja.includes(q.id)} onChange={() => toggle(q.id)} />
            <span className="flex flex-col">
              <span className="text-lg">{vstaviVrednosti(q.besedilo, oznake)}</span>
              <span className="text-base text-muted-foreground">
                {q.pogostost === "tedensko" ? "Enkrat na teden" : "Vsak dan"}
                {q.opomba && ` · ${q.opomba}`}
              </span>
            </span>
          </label>
        ))}
      </section>

      <section className={box}>
        <h2 className="text-2xl font-bold">Vaje, ki so ob odpustu že označene</h2>
        {predloga.vaje.map((v) => (
          <div key={v.id} className="flex flex-col gap-2 border-t-2 pt-3 first-of-type:border-t-0 first-of-type:pt-0">
            <label className={row}>
              <input
                type="checkbox"
                className="mt-1 size-6 shrink-0"
                checked={vaje[v.id]?.izbrana ?? true}
                onChange={(e) => setVaje((s) => ({ ...s, [v.id]: { ...s[v.id], izbrana: e.target.checked } }))}
              />
              <span className="text-lg font-semibold">{v.naslov}</span>
            </label>
            <label className="flex flex-col gap-1 text-lg">
              Ponovitve ali čas
              <input
                className={input}
                value={vaje[v.id]?.ponovitve ?? ""}
                onChange={(e) => setVaje((s) => ({ ...s, [v.id]: { ...s[v.id], ponovitve: e.target.value } }))}
              />
            </label>
          </div>
        ))}
      </section>

      <p className="rounded-3xl bg-card shadow-soft p-4 text-lg">
        Opozorilna pravila, pragovi, besedila vprašanj in zdravila so zaklenjeni, ker izhajajo iz smernic. Sprememba velja
        za nove rehabilitacije; obstoječe ostanejo, kot so.
      </p>

      {napake.length > 0 && (
        <p role="alert" className="rounded-3xl border-2 border-status-rdece bg-status-rdece/10 p-4 text-lg font-semibold">
          {napake.join(" ")}
        </p>
      )}
      {sporocilo && (
        <p
          role="status"
          className={
            sporocilo.ok
              ? "rounded-3xl border-2 border-status-zeleno bg-status-zeleno/10 p-4 text-xl font-bold"
              : "rounded-3xl border-2 border-status-rdece bg-status-rdece/10 p-4 text-lg font-semibold"
          }
        >
          {sporocilo.text}
        </p>
      )}

      <BigButton onClick={() => shrani(vnos, "Shranjeno ✓")} disabled={pending || napake.length > 0}>
        {pending ? "Shranjujem …" : "Shrani"}
      </BigButton>
      {potrdiPonastavitev ? (
        <div className="flex flex-col gap-3 rounded-3xl bg-card border-2 border-status-rdece p-4">
          <p className="text-lg font-semibold">Ponastavim na izvirne nastavitve iz predloge?</p>
          <BigButton variant="danger" onClick={() => shrani({}, "Ponastavljeno na izvirnik ✓")} disabled={pending}>
            Da, ponastavi
          </BigButton>
          <BigButton variant="secondary" onClick={() => setPotrdiPonastavitev(false)}>
            Ne
          </BigButton>
        </div>
      ) : (
        <BigButton variant="secondary" onClick={() => setPotrdiPonastavitev(true)}>
          Ponastavi na izvirnik
        </BigButton>
      )}
    </div>
  );
}
