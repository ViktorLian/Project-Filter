import { CheckCircle2, Circle, FileSearch, Globe2 } from 'lucide-react';

const workflow = [
  'Koble til og verifiser kundens nettsted',
  'Avklar tjenester, produkter, områder og søkeintensjon',
  'Godkjenn innholdsplan og publiseringsfrekvens',
  'Publiser via støttet integrasjon eller manuelt etter kontroll',
  'Mål indeksering, relevant trafikk og henvendelser',
];

export default function AutoSeoPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-blue-600">Krever oppsett</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">AutoSEO</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Planlegg og følg SEO-arbeidet fra ett sted. Publisering aktiveres først når nettsted,
          tilgang, innholdskrav og godkjenningsflyt er avklart.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <Globe2 className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-slate-900">Nettstedstilkobling</h2>
          </div>
          <div className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Ikke konfigurert</p>
            <p className="mt-1 leading-5">Ingen side publiseres automatisk før en støttet og testet integrasjon er satt opp.</p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <FileSearch className="h-5 w-5 text-emerald-600" />
            <h2 className="font-semibold text-slate-900">Kvalitetskontroll</h2>
          </div>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />Faktagrunnlag må komme fra kunden.</li>
            <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />Innhold gjennomgås før automatisk publisering aktiveres.</li>
            <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />Ingen plassering i søkeresultater garanteres.</li>
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Oppsett og drift</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {workflow.map((item) => (
            <div key={item} className="flex gap-3 rounded-lg border border-slate-100 p-4 text-sm text-slate-700">
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
