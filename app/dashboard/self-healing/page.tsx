'use client';

import { useState } from 'react';
import { RefreshCw, Zap, CheckCircle, AlertCircle, Info, ArrowRight, Bot, Sparkles } from 'lucide-react';

const ISSUES = [
  {
    id: 'i1',
    severity: 'critical',
    title: 'Lead "Svensson & Co" ubesvart 72t',
    description: 'Høy-score lead (87) har ikke blitt kontaktet innen 4-timers-vinduet',
    autoFix: 'Send automatisk oppfølging + varsle selger nå',
    status: 'auto-fixing',
    eta: '2 min',
  },
  {
    id: 'i2',
    severity: 'high',
    title: 'Faktura #1039 forfalt 14 dager',
    description: 'Kunde har ikke respondert på 2 purringer. Vurderer inkasso.',
    autoFix: 'Eskaler til inkasso-mal + varsle regnskapsansvarlig',
    status: 'waiting',
    eta: null,
  },
  {
    id: 'i3',
    severity: 'medium',
    title: 'Kampanje konverterer 40% under mål',
    description: '"Mars 2026" kampanje: 1.2% CR mot mål 2.0%',
    autoFix: 'Bytt til variant B overskrift + øk budsjettet 20%',
    status: 'done',
    eta: null,
  },
  {
    id: 'i4',
    severity: 'low',
    title: 'Kalender har 3 ledige uker fremover',
    description: 'Kapasitetsunderskudd oppdaget 14 dager frem i tid',
    autoFix: 'Aktiver ny leads-kampanje for akutt-tjenester',
    status: 'waiting',
    eta: null,
  },
];

const PROCESSES = [
  { id: 'p1', name: 'Lead-til-tilbud prosess', efficiency: 92, lastOptimized: '3 dager siden', suggestion: null },
  { id: 'p2', name: 'Fakturering & oppfølging', efficiency: 67, lastOptimized: '12 dager siden', suggestion: 'Automatiser purring dag 7 og 14 etter forfall' },
  { id: 'p3', name: 'Google Ads → Lead-flow', efficiency: 55, lastOptimized: '21 dager siden', suggestion: 'Aktiver remarketing-segment for besøk uten konvertering' },
  { id: 'p4', name: 'Onboarding av nye kunder', efficiency: 81, lastOptimized: '5 dager siden', suggestion: null },
];

const orgChart = [
  { role: 'Daglig leder', name: 'Thomas E.', load: 88, loadColor: 'text-red-400', overflow: true },
  { role: 'Selger', name: 'Mari A.', load: 62, loadColor: 'text-yellow-400', overflow: false },
  { role: 'Montør senior', name: 'Jens O.', load: 95, loadColor: 'text-red-400', overflow: true },
  { role: 'Montør junior', name: 'Petter B.', load: 41, loadColor: 'text-emerald-400', overflow: false },
];

const severityClasses = {
  critical: { dot: 'bg-red-500', border: 'border-l-red-500', bg: 'bg-red-500/5', label: 'Kritisk', color: 'text-red-400' },
  high: { dot: 'bg-orange-500', border: 'border-l-orange-500', bg: 'bg-orange-500/5', label: 'Høy', color: 'text-orange-400' },
  medium: { dot: 'bg-yellow-500', border: 'border-l-yellow-500', bg: 'bg-yellow-500/5', label: 'Middels', color: 'text-yellow-400' },
  low: { dot: 'bg-blue-500', border: 'border-l-blue-500', bg: 'bg-blue-500/5', label: 'Lav', color: 'text-blue-400' },
};

export default function SelfHealingPage() {
  const [issues, setIssues] = useState(ISSUES);

  const applyFix = (id: string) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'done' } : i))
    );
  };

  const criticalCount = issues.filter((i) => i.severity === 'critical' && i.status !== 'done').length;

  return (
    <div className="min-h-full">
      {/* Dark header */}
      <div className="-mx-6 -mt-6 mb-6 px-6 pt-8 pb-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Self-Healing Company</h1>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs px-3 py-1 rounded-full font-semibold">Enterprise</span>
            </div>
            <p className="text-slate-400 text-sm ml-12">Feil oppdages og fikses automatisk – mens du sover</p>
          </div>
          {criticalCount > 0 && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-bold px-4 py-2 rounded-xl animate-pulse">
              ⚠ {criticalCount} kritiske problemer aktive
            </div>
          )}
        </div>
      </div>

      {/* Frisksjons-radar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          Automatisk friksjons-deteksjon
        </h2>
        <div className="space-y-3">
          {issues.map((issue) => {
            const s = severityClasses[issue.severity as keyof typeof severityClasses];
            const isDone = issue.status === 'done';
            const isFixing = issue.status === 'auto-fixing';
            return (
              <div key={issue.id} className={`border-l-4 ${s.border} ${s.bg} rounded-r-xl p-4 ${isDone ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${s.dot} ${isFixing ? 'animate-ping' : ''}`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold uppercase ${s.color}`}>{s.label}</span>
                        <p className="text-sm font-semibold text-slate-900">{issue.title}</p>
                        {isDone && <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{issue.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <Bot className="h-3 w-3 text-blue-400" />
                        <span className="text-blue-300 font-medium">Auto-fix: {issue.autoFix}</span>
                        {isFixing && <span className="text-yellow-400 font-semibold">↻ Kjører... ({issue.eta})</span>}
                      </div>
                    </div>
                  </div>
                  {!isDone && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => applyFix(issue.id)}
                        className="text-xs bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-600/30 text-emerald-300 px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1"
                      >
                        <Zap className="h-3 w-3" />
                        Fix nå
                      </button>
                      <button className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-500 px-3 py-1.5 rounded-lg transition">
                        Ignorer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Prosesseffektivitet */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            Prosess-restrukturering
          </h2>
          <div className="space-y-4">
            {PROCESSES.map((p) => (
              <div key={p.id} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                  <span className={`text-sm font-bold ${
                    p.efficiency > 80 ? 'text-emerald-400' : p.efficiency > 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>{p.efficiency}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${p.efficiency > 80 ? 'bg-emerald-500' : p.efficiency > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${p.efficiency}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Optimalisert: {p.lastOptimized}</span>
                  {p.suggestion && (
                    <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
                      <Info className="h-3 w-3" />
                      Forslag
                    </button>
                  )}
                </div>
                {p.suggestion && (
                  <div className="mt-2 text-xs text-slate-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    💡 {p.suggestion}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dynamisk org-kart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-cyan-500" />
            Dynamisk kapasitetskart
          </h2>
          <div className="space-y-3 mb-6">
            {orgChart.map((person) => (
              <div key={person.name} className={`rounded-xl p-4 border ${person.overflow ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{person.name}</p>
                    <p className="text-xs text-slate-500">{person.role}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-extrabold ${person.loadColor}`}>{person.load}%</p>
                    {person.overflow && <p className="text-xs text-red-400 font-semibold">Overbelastet</p>}
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${person.load > 90 ? 'bg-red-500' : person.load > 70 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                    style={{ width: `${person.load}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-xs font-bold text-yellow-700 mb-1">🔀 Ressurs-anbefaling</p>
            <p className="text-xs text-slate-700 leading-relaxed">
              "Petter B." er underbelastet (41%). FlowPilot foreslår å flytte 2 rørlegger-jobber fra "Jens O." til "Petter B." denne uken.
            </p>
            <button className="mt-2 text-xs text-yellow-300 hover:text-yellow-200 font-semibold flex items-center gap-1">
              Godkjenn omfordeling <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
