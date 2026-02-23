'use client';

import { useState, useEffect } from 'react';
import { Brain, CheckCircle, Circle, AlertTriangle, ArrowRight, Sparkles, TrendingUp, Users, DollarSign, Calendar, RefreshCw } from 'lucide-react';

interface Focus {
  priority: number;
  title: string;
  why: string;
  action: string;
  impact: 'hoy' | 'middels';
}

interface WeeklyCoach {
  greeting: string;
  status: 'god' | 'varsler' | 'kritisk';
  summary: string;
  focuses: Focus[];
  tip: string;
  challenge: string;
}

const WEEKLY: WeeklyCoach = {
  greeting: 'God mandag',
  status: 'varsler',
  summary: 'Du har 3 ubesvarte leads fra siste uke og 2 fakturaer som er forfalt. Cashflow er ok, men salgspipelinen er tynn. Prioriter konvertering denne uka.',
  focuses: [
    {
      priority: 1,
      title: 'Svar pa de 3 ubesvarte leadsene',
      why: 'Leads som besvares innen 24 timer konverterer 3x bedre enn de som venter.',
      action: 'Ga til Leads → filtrer pa "Ny" → ring de med hoyest score forst.',
      impact: 'hoy',
    },
    {
      priority: 2,
      title: 'Send purring pa 2 forfalte fakturaer',
      why: 'Total utestaaende: ca. 28 500 kr. Disse pengene er dine – fa dem inn.',
      action: 'Ga til Fakturaer → "Forfalt" → send purring med ett klikk.',
      impact: 'hoy',
    },
    {
      priority: 3,
      title: 'Sett opp en automatisk e-postsekvens',
      why: 'Bedrifter med automatisk oppfolging far 40% fler gjentakende kunder.',
      action: 'Ga til E-postsekvenser → velg malen "Etter fullfort jobb".',
      impact: 'middels',
    },
  ],
  tip: 'Bed om referanser fra dine 3 beste kunder i dag. Et enkelt kjem: "Kjenner du noen som trenger dette?" kan gi deg 1-2 nye jobber denne maneden.',
  challenge: 'Ukens utfordring: Kontakt EN gammel kunde du ikke har hort fra pa 60+ dager. Si hei — ikke selg.',
};

const KPI_CARDS = [
  { label: 'Leads denne uka', value: '7', change: '+2', good: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Ubesvarte leads', value: '3', change: 'Maa fikses', good: false, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Inntekt denne uka', value: '42 500 kr', change: '+8%', good: true, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Bookinger neste uke', value: '4', change: 'Bra pace', good: true, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
];

export default function BusinessCoachPage() {
  const [doneTasks, setDoneTasks] = useState<number[]>([]);
  const [loadingRefresh, setLoadingRefresh] = useState(false);

  const toggleTask = (p: number) => setDoneTasks(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const refresh = async () => {
    setLoadingRefresh(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoadingRefresh(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="h-5 w-5 text-blue-500" />
            <h1 className="text-2xl font-bold text-slate-900">Bedriftscoach</h1>
          </div>
          <p className="text-slate-500 text-sm">Din personlige ukentlige strategirad basert pa status i bedriften din.</p>
        </div>
        <button onClick={refresh} disabled={loadingRefresh}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loadingRefresh ? 'animate-spin' : ''}`} />
          Oppdater
        </button>
      </div>

      {/* KPI row */}
      <div className="grid sm:grid-cols-4 gap-3">
        {KPI_CARDS.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${k.bg}`}>
                <Icon className={`h-4 w-4 ${k.color}`} />
              </div>
              <p className="text-xl font-bold text-slate-900">{k.value}</p>
              <p className="text-xs text-slate-500">{k.label}</p>
              <span className={`mt-1 inline-block text-xs font-semibold ${k.good ? 'text-emerald-600' : 'text-amber-600'}`}>{k.change}</span>
            </div>
          );
        })}
      </div>

      {/* Weekly status */}
      <div className={`rounded-xl border p-5 ${WEEKLY.status === 'god' ? 'border-emerald-200 bg-emerald-50' : WEEKLY.status === 'varsler' ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
        <div className="flex items-start gap-3">
          <Sparkles className={`h-5 w-5 flex-shrink-0 mt-0.5 ${WEEKLY.status === 'god' ? 'text-emerald-600' : WEEKLY.status === 'varsler' ? 'text-amber-600' : 'text-red-600'}`} />
          <div>
            <p className="text-sm font-bold text-slate-900">{WEEKLY.greeting} — her er din status</p>
            <p className="text-sm text-slate-700 mt-1 leading-relaxed">{WEEKLY.summary}</p>
          </div>
        </div>
      </div>

      {/* Focus areas */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Prioriteringsliste denne uka</h2>
        <div className="space-y-3">
          {WEEKLY.focuses.map(f => {
            const done = doneTasks.includes(f.priority);
            return (
              <div key={f.priority} className={`rounded-xl border bg-white p-5 transition ${done ? 'opacity-60 border-slate-200' : 'border-blue-200 shadow-sm'}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleTask(f.priority)} className="flex-shrink-0 mt-0.5">
                    {done ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-300 hover:text-blue-400 transition" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-400">#{f.priority}</span>
                      <p className={`text-sm font-bold ${done ? 'line-through text-slate-400' : 'text-slate-900'}`}>{f.title}</p>
                      <span className={`ml-auto flex-shrink-0 text-xs font-semibold rounded-full px-2 py-0.5 ${f.impact === 'hoy' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {f.impact === 'hoy' ? 'Hoy effekt' : 'Middels effekt'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-2">{f.why}</p>
                    <div className="flex items-center gap-2 text-xs text-blue-700">
                      <ArrowRight className="h-3 w-3 flex-shrink-0" />
                      <span>{f.action}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tip & challenge */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <p className="text-sm font-bold text-slate-900">Ukens vekstrad</p>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{WEEKLY.tip}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-bold text-slate-900">Ukens utfordring</p>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{WEEKLY.challenge}</p>
        </div>
      </div>
    </div>
  );
}
