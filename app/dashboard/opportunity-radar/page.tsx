'use client';

import { useState } from 'react';
import { Radar, DollarSign, TrendingUp, ArrowRight, Users, RefreshCw, Zap, Star, Clock, BarChart3, CheckCircle, ChevronRight } from 'lucide-react';

type OppType = 'upsell' | 'reactivate' | 'retention' | 'referral' | 'expansion';

interface Opportunity {
  id: string;
  type: OppType;
  title: string;
  description: string;
  potentialValue: number;
  confidence: number;
  effort: 'lav' | 'middels' | 'hoy';
  relatedTo: string;
  action: string;
  done: boolean;
}

const TYPE_CONFIG: Record<OppType, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  upsell: { label: 'Upsell', color: 'text-blue-700', bg: 'bg-blue-100', icon: TrendingUp },
  reactivate: { label: 'Reaktiver', color: 'text-amber-700', bg: 'bg-amber-100', icon: RefreshCw },
  retention: { label: 'Behold', color: 'text-purple-700', bg: 'bg-purple-100', icon: Users },
  referral: { label: 'Anbefaling', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: Star },
  expansion: { label: 'Ekspander', color: 'text-indigo-700', bg: 'bg-indigo-100', icon: Zap },
};

const DEMO_OPPS: Opportunity[] = [
  {
    id: '1', type: 'upsell', done: false,
    title: 'Erik Bakke AS er klar for arskontrakt',
    description: 'Kunden har booket 4 separate oppdrag siste 12 mnd. Et arsvedlikeholds-abonnement er mer forutsigbart for begge parter og gir 30-40% okonomisk oppsid.',
    potentialValue: 120000, confidence: 88, effort: 'lav', relatedTo: 'Erik Bakke AS',
    action: 'Ring og tilby arskontrakt pa 10 000 kr/mnd',
  },
  {
    id: '2', type: 'reactivate', done: false,
    title: 'Kari Nordmann — inaktiv i 8 maneder',
    description: 'Fullfort baderomsjobb i 2024, ingen kontakt siden. Standardsyklusen er at kunder trenger ny jobb innen 12-18 mnd. Riktig tidspunkt for utstrakt hand.',
    potentialValue: 45000, confidence: 65, effort: 'lav', relatedTo: 'Kari Nordmann',
    action: 'Send oppfolgings-SMS: "Hei, trenger du hjelp til noe i var?"',
  },
  {
    id: '3', type: 'retention', done: false,
    title: 'Ingrid Hansen har ikke fatt tilbakemeldingsskjema',
    description: 'Jobben ble fullfort for 3 uker siden uten oppfolgingsundersokelse. Manglende kontakt oker churn-risiko med 35%. Send undersokelse na.',
    potentialValue: 25000, confidence: 72, effort: 'lav', relatedTo: 'Ingrid Hansen',
    action: 'Send tilfredshetsskjema og be om Google-anmeldelse',
  },
  {
    id: '4', type: 'referral', done: false,
    title: 'Trond Olsen ga 5 stjerner — be om anbefaling',
    description: 'Kunden ga 5/5 pa tilfredshetsskjema for 2 uker siden men har ikke blitt spurt om anbefaling. Fornyde kunder anbefaler med 70% sannsynlighet nar de blir spurt.',
    potentialValue: 60000, confidence: 79, effort: 'lav', relatedTo: 'Trond Olsen',
    action: 'Kontakt og be om 1-2 anbefalings-navn',
  },
  {
    id: '5', type: 'expansion', done: false,
    title: 'Nabolaget til siste to prosjekter er uutnyttet',
    description: 'Jordal-området: du har gjennomført 3 synlige jobber de siste 6 mnd. Lokal synlighet gir typisk 15-20% organisk vekst når man aktivt promoterer i nærmiljøet.',
    potentialValue: 90000, confidence: 55, effort: 'middels', relatedTo: 'Jordal, Oslo',
    action: 'Distribuer flyers i nærmiljøet og be eksisterende kunder om omtale',
  },
];

export default function OpportunityRadarPage() {
  const [opps, setOpps] = useState<Opportunity[]>(DEMO_OPPS);
  const [filter, setFilter] = useState<'all' | OppType>('all');

  const toggle = (id: string) => setOpps(p => p.map(o => o.id === id ? { ...o, done: !o.done } : o));

  const visible = opps.filter(o => filter === 'all' || o.type === filter);
  const totalPotential = opps.filter(o => !o.done).reduce((s, o) => s + o.potentialValue, 0);
  const captured = opps.filter(o => o.done).reduce((s, o) => s + o.potentialValue, 0);

  const EFFORT_COLOR = { lav: 'text-emerald-600 bg-emerald-50', middels: 'text-amber-600 bg-amber-50', hoy: 'text-red-600 bg-red-50' };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="h-5 w-5 text-indigo-500" />
          <h1 className="text-2xl font-bold text-slate-900">Mulighetssensor</h1>
        </div>
        <p className="text-slate-500 text-sm">Systemet scanner kunder, historikk og aktivitet for skjulte inntektsmuligheter.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <DollarSign className="h-5 w-5 text-slate-400 mb-2" />
          <p className="text-2xl font-bold text-slate-900">{(totalPotential / 1000).toFixed(0)}K kr</p>
          <p className="text-xs text-slate-500 mt-0.5">Potensial igjen</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <CheckCircle className="h-5 w-5 text-emerald-500 mb-2" />
          <p className="text-2xl font-bold text-emerald-700">{(captured / 1000).toFixed(0)}K kr</p>
          <p className="text-xs text-slate-500 mt-0.5">Fanget</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <Zap className="h-5 w-5 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-slate-900">{opps.filter(o => !o.done).length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Aktive muligheter</p>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'upsell', 'reactivate', 'retention', 'referral', 'expansion'] as const).map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition ${filter === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
            {t === 'all' ? 'Alle' : TYPE_CONFIG[t].label}
          </button>
        ))}
      </div>

      {/* Opportunity cards */}
      <div className="space-y-3">
        {visible.map(opp => {
          const tc = TYPE_CONFIG[opp.type];
          const TypeIcon = tc.icon;
          return (
            <div key={opp.id} className={`rounded-xl border bg-white p-5 transition ${opp.done ? 'opacity-50 border-slate-100' : 'border-slate-200 hover:shadow-sm'}`}>
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${tc.bg}`}>
                  <TypeIcon className={`h-5 w-5 ${tc.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-900">{opp.title}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${tc.bg} ${tc.color}`}>{tc.label}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${EFFORT_COLOR[opp.effort]}`}>Innsats: {opp.effort}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{opp.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-700">{(opp.potentialValue / 1000).toFixed(0)}K kr potensial</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
                      <span className="text-xs text-slate-500">{opp.confidence}% sikkerhet</span>
                    </div>
                    <span className="text-xs text-slate-400">Relatert: {opp.relatedTo}</span>
                  </div>
                  {!opp.done && (
                    <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700 font-medium">
                      Handling: {opp.action}
                    </div>
                  )}
                </div>
                <button onClick={() => toggle(opp.id)}
                  className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition ${opp.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-emerald-400'}`}>
                  {opp.done && <CheckCircle className="h-4 w-4 text-white" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 text-center">Sensoren oppdateres automatisk nar du legger til kunder, fullforer jobber og mottar anmeldelser.</p>
    </div>
  );
}
