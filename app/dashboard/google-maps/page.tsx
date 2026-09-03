import { CheckCircle2, Circle, MapPin, ShieldCheck } from 'lucide-react';

const tasks = [
  'Kontroller bedriftsnavn, kategori, telefon, nettsted og åpningstider',
  'Kartlegg tjenester og geografiske områder',
  'Lag plan for innlegg, bilder, spørsmål og svar',
  'Sett opp rutine for å be reelle kunder om anmeldelser',
  'Følg utviklingen i visninger, handlinger og lokale søk',
];

export default function GoogleMapsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-blue-600">Administrert tjeneste</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Google Maps og lokal synlighet</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Her samles arbeidet med Google-bedriftsprofilen. FlowPilot viser plan og status;
          endringer publiseres først etter at bedriften har gitt nødvendig tilgang.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-slate-900">Oppsettstatus</h2>
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            <Circle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Ikke tilkoblet</p>
              <p className="mt-1 leading-5">Google Business Profile-tilgang må avtales og godkjennes av kunden før arbeidet starter.</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Automatisk API-tilkobling er under utvikling. Ingen Google-data hentes eller endres fra denne siden ennå.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h2 className="font-semibold text-slate-900">Før oppstart</h2>
          </div>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />Kunden beholder eierskapet til profilen.</li>
            <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />FlowPilot gis kun nødvendig tilgang.</li>
            <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />Ingen rangering eller plassering garanteres.</li>
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Arbeidsplan</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {tasks.map((task) => (
            <div key={task} className="flex gap-3 rounded-lg border border-slate-100 p-4 text-sm text-slate-700">
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              {task}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
