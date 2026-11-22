"use client";

import { useMemo } from "react";
import { BigButton } from "@/components/shell";
import { banka, sestaviNacrt, type Nacrt, type Pogostost, type VnosNacrta } from "@/lib/moduli";
import { IME_MODULA, nepotrjeno, type OdobritevVnos } from "@/app/nurse/odpust/_lib/dejstva";
import { PlanFacts } from "./plan-facts";
import { ErrorText } from "./ui";

const POGOSTOST: Record<Pogostost, string> = { dnevno: "vsak dan", vsak2dan: "vsak drugi dan", tedensko: "enkrat na teden" };

type Props = {
  value: OdobritevVnos;
  brezAtc: string[];
  onChange: (v: OdobritevVnos) => void;
  onApprove: () => void;
  approveLabel: string;
  /** Wizard only: continue with the template questions. */
  onSkip?: () => void;
  saving?: boolean;
  error?: string;
};

/**
 * Modular plan review (T-79): facts → plan composed by `sestaviNacrt`, reviewer
 * notes, remove items, approve. The server recomposes from the same facts.
 */
export function PlanReview({ value, brezAtc, onChange, onApprove, approveLabel, onSkip, saving, error }: Props) {
  const nacrt = useMemo(() => sestaviNacrt(value.dejstva, banka), [value.dejstva]);
  const odstrani = value.odstrani.filter((id) => nacrt.vnosi.some((v) => v.postavka.id === id));
  const ostane = nacrt.vnosi.filter((v) => !odstrani.includes(v.postavka.id));
  const toggle = (id: string) =>
    onChange({ ...value, odstrani: odstrani.includes(id) ? odstrani.filter((x) => x !== id) : [...odstrani, id] });

  return (
    <div className="flex flex-col gap-5">
      <div role="note" className="rounded-2xl border-2 border-status-rumeno bg-status-rumeno-bg p-4 text-lg text-status-rumeno">
        <p className="font-bold">Predlog programa, ni klinično potrjen.</p>
        <p>Vprašanja predlaga program iz diagnoz, posegov in zdravil. Pred uporabo jih mora pregledati specialist. Opozorila so v pomoč osebju, niso diagnoza.</p>
      </div>

      <PlanFacts value={value.dejstva} brezAtc={brezAtc} onChange={(dejstva) => onChange({ ...value, dejstva })} />

      <section className="flex flex-col gap-3">
        <h3 className="text-xl font-bold">Predlagana vprašanja ({ostane.length})</h3>
        <p className="text-lg">Moduli: {nacrt.moduli.map((m) => IME_MODULA.get(m) ?? m).join(", ")}</p>
        {nacrt.opozorila.map((o) => (
          <p key={o} className="rounded-xl border-2 border-status-rumeno bg-status-rumeno-bg p-3 text-lg text-status-rumeno">Opomba za pregled: {o}</p>
        ))}
        <ul className="flex flex-col gap-3">
          {nacrt.vnosi.map((vn) => (
            <Item key={vn.postavka.id} vn={vn} nacrt={nacrt} removed={odstrani.includes(vn.postavka.id)} onToggle={() => toggle(vn.postavka.id)} />
          ))}
        </ul>
      </section>

      <ErrorText>{error}</ErrorText>
      <BigButton onClick={onApprove} disabled={saving}>{saving ? "Shranjujem …" : approveLabel}</BigButton>
      {onSkip && (
        <BigButton variant="secondary" onClick={onSkip} disabled={saving}>Preskoči: samo vprašanja predloge</BigButton>
      )}
    </div>
  );
}

function Item({ vn, nacrt, removed, onToggle }: { vn: VnosNacrta; nacrt: Nacrt; removed: boolean; onToggle: () => void }) {
  const p = vn.postavka;
  const razlogi = nepotrjeno(vn, nacrt);
  const dni = vn.aktivniDnevi ? `, ${vn.aktivniDnevi[0]}.–${vn.aktivniDnevi[1]}. dan po odpustu` : "";
  return (
    <li className={`flex flex-col gap-2 rounded-2xl bg-card p-4 shadow-soft ${removed ? "opacity-60" : ""}`}>
      {removed && <p className="text-lg font-bold">Odstranjeno – pacient tega ne bo dobil</p>}
      <p className={`text-xl font-semibold ${removed ? "line-through" : ""}`}>{p.besedilo}</p>
      {vn.nadaljnje && <p className="text-base">Če je odgovor slab, še: »{vn.nadaljnje.besedilo}«</p>}
      <p className="text-base text-muted-foreground">
        {p.raven === 0 ? "Nujni znaki – vedno, ni mogoče odstraniti" : POGOSTOST[vn.pogostost] + dni}
        {vn.bistveno && p.raven !== 0 && " · bistveno"}
        {" · "}{vn.moduli.map((m) => IME_MODULA.get(m) ?? m).join(", ")}
      </p>
      <p className="text-base text-muted-foreground">Vir: {p.vir.opis}</p>
      {p.status === "validiran" && !p.licencaUrejena && (
        <p className="text-base font-semibold">Licenca še ni urejena, zato pacient tega še ne dobi.</p>
      )}
      {razlogi.length > 0 && (
        <p className="rounded-lg bg-status-rumeno-bg p-2 text-base font-semibold text-status-rumeno">
          Ni klinično potrjeno ({razlogi.join(", ")}). Naj pregleda specialist.
        </p>
      )}
      {p.raven !== 0 && (
        <button type="button" onClick={onToggle} className="min-h-12 w-fit rounded-xl border-2 border-border px-4 text-lg font-semibold hover:bg-muted">
          {removed ? "Vrni v načrt" : "Odstrani iz načrta"}
        </button>
      )}
    </li>
  );
}
