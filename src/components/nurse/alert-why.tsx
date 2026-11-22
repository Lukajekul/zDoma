import type { ZakajOpozorilo } from "@/app/nurse/_lib/zakaj";
import { formatDate } from "@/lib/format";
import type { Zamujeno } from "@/lib/moduli/danes";
import { OZNAKA_OPOMBA } from "@/lib/moduli/oznake";
import type { Vir } from "@/lib/templates";

// "Zakaj opozorilo?" behind each plan-based alert (T-81): module, answer,
// rule and question source, with unconfirmed sources marked for review.

function VirVrstica({ naslov, vir }: { naslov: string; vir: Vir }) {
  const link = vir.url?.startsWith("https://") ? vir.url : undefined;
  return (
    <div className="space-y-1">
      <dt className="font-semibold">{naslov}</dt>
      <dd className="wrap-break-word">
        {link ? <a className="underline" href={link} rel="noreferrer" target="_blank">{vir.opis}</a> : vir.opis}
      </dd>
      <dd>
        {vir.potrjeno ? (
          <span className="font-semibold">Potrjen vir ✓</span>
        ) : (
          <span className="inline-block rounded-lg border-2 border-amber-600 px-2 py-0.5 font-semibold text-amber-900 dark:text-amber-200">
            Predlog – potrebuje pregled strokovnjaka
          </span>
        )}
      </dd>
    </div>
  );
}

export function AlertWhy({ zakaj }: { zakaj: ZakajOpozorilo }) {
  const drugi = zakaj.moduli.filter((m) => m !== zakaj.modul);
  return (
    <details className="rounded-2xl border-2 border-border">
      <summary className="min-h-12 cursor-pointer px-3 py-3 font-semibold">Zakaj opozorilo?</summary>
      <dl className="space-y-3 px-3 pb-3">
        <div className="space-y-1">
          <dt className="font-semibold">Vprašanje</dt>
          <dd className="wrap-break-word">{zakaj.vprasanje}</dd>
          <dd>Odgovor {formatDate(zakaj.datum)}: <strong>{zakaj.odgovor}</strong></dd>
        </div>
        <div className="space-y-1">
          <dt className="font-semibold">Modul</dt>
          <dd>
            {zakaj.modul}
            {drugi.length > 0 && <> (pravilo imajo tudi: {drugi.join(", ")}; velja strožja meja)</>}
          </dd>
          <dd className="text-muted-foreground">Načrt vprašanj, različica {zakaj.planVerzija}</dd>
        </div>
        <VirVrstica naslov="Vir pravila" vir={zakaj.vir} />
        <VirVrstica naslov="Vir vprašanja" vir={zakaj.virVprasanja} />
        <p className="rounded-xl bg-muted p-3">{OZNAKA_OPOMBA}</p>
      </dl>
    </details>
  );
}

const korakBesedilo: Record<Zamujeno["korak"], string> = {
  opomnik: "Pacient dobi ponovni opomnik.",
  zadolzenec: "Obvesti se zadolženec.",
  osebje: "Na vrsti je osebje: pokličite pacienta.",
};

export function MissedCheckins({ zamujeno }: { zamujeno: Zamujeno }) {
  const nujno = zamujeno.korak === "osebje";
  return (
    <section
      aria-labelledby="zamujeni"
      className={`space-y-1 rounded-3xl p-4 shadow-soft ${nujno ? "border-2 border-amber-600 bg-card" : "bg-card"}`}
    >
      <h2 className="text-xl font-bold" id="zamujeni">Zamujeni dnevni pregledi</h2>
      <p className="font-semibold">{zamujeno.besedilo}</p>
      <p>{korakBesedilo[zamujeno.korak]}</p>
    </section>
  );
}
