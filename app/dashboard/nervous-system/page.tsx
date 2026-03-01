'use client';

import { useState, useEffect } from 'react';
import {
  Activity, TrendingUp, AlertTriangle,
  DollarSign, Zap, Brain, ArrowUpRight, RefreshCw, Bell,
  Target, Flame
} from 'lucide-react';

const SIGNALS = [
  {
    id: 'cash',
    label: 'Kontantstrøm',
    icon: DollarSign,
    value: '+14 200 kr',
    trend: '+8%',
    status: 'good',
    detail: 'Bedre enn fjoråret samme periode',
  },
  {
    id: 'leads',
    label: 'Aktive leads',
    icon: Target,
    value: '23',
    trend: '+5 i dag',
    status: 'good',
    detail: '6 høy-score leads krever oppfølging',
  },
  {
    id: 'stress',
    label: 'Operasjonell stress',
    icon: Flame,
    value: '62 / 100',
    trend: '+12%',
    status: 'warning',
    detail: 'Kapasitet begynner å strammes',
  },
  {
    id: 'sales',
    label: 'Salgsmomentum',
    icon: TrendingUp,
    value: '78 / 100',
    trend: '+3 pkt',
    status: 'good',
    detail: 'Stigende trend siste 14 dager',
  },
  {
    id: 'risk',
    label: 'Risikosignal',
    icon: AlertTriangle,
    value: 'Moderat',
    trend: '2 nye varsler',
    status: 'warning',
    detail: 'En nøkkelkunde har ikke svart på 10 dager',
  },
  {
    id: 'efficiency',
    label: 'Driftseffektivitet',
    icon: Zap,
    value: '84%',
    trend: 'Stabil',
    status: 'good',
    detail: 'Automatisering håndler 84% av repetitive oppgaver',
  },
];

const ALERTS = [
  { level: 'high', text: 'Lead "Rørlegger Oslo" har ikke fått oppfølging på 48t', time: '2t siden', action: 'Følg opp nå' },
  { level: 'medium', text: 'Faktura #1042 er 7 dager forsinket – kr 18 500', time: '4t siden', action: 'Send purring' },
  { level: 'low', text: 'Ny 5-stjerne anmeldelse på Google', time: '6t siden', action: 'Svar nå' },
  { level: 'high', text: 'Kontantstrøm under 30-dagers snitt', time: '1d siden', action: 'Analyser' },
  { level: 'medium', text: 'Kampanje "Vinter 2026" konverterer lavere enn forventet', time: '1d siden', action: 'Optimaliser' },
];

const DECISIONS = [
  {
    decision: 'Senke pris på rørleggjertjenester 10%',
    date: '12. feb',
    outcome: 'Leads +34%, margin -6%',
    verdict: 'Positiv netto',
    color: 'text-emerald-400',
  },
  {
    decision: 'Stoppe Facebook-kampanje',
    date: '28. jan',
    outcome: 'Leados ned 18, spart kr 4 200/mnd',
    verdict: 'Nøytral',
    color: 'text-yellow-400',
  },
  {
    decision: 'Ansette vikar for 3 uker',
    date: '15. jan',
    outcome: 'Leverage +22%, kostnad kr 28 000',
    verdict: 'Positiv netto',
    color: 'text-emerald-400',
  },
];

const statusColors = {
  good: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  danger: 'bg-red-50 border-red-200 text-red-700',
};

const alertColors = {
  high: 'border-l-red-500 bg-red-500/5',
  medium: 'border-l-yellow-500 bg-yellow-500/5',
  low: 'border-l-emerald-500 bg-emerald-500/5',
};

const alertDotColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-emerald-500',
};

export default function NervousSystemPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => { setLastUpdated(new Date()); setPulse(true); setTimeout(() => setPulse(false), 600); }, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="min-h-full">
      {/* Dark header – bleeds edge to edge by negating parent padding */}
      <div className="-mx-6 -mt-6 mb-6 px-6 pt-8 pb-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Activity className="h-5 w-5 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Business Nervous System</h1>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs px-3 py-1 rounded-full font-semibold">Enterprise</span>
            </div>
            <p className="text-slate-400 text-sm ml-12">Sansesystemet til bedriften din – alt i sanntid</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border transition-all
              ${pulse ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300' : 'bg-white/5 border-white/15 text-slate-400'}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live · {lastUpdated.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button onClick={() => { setLastUpdated(new Date()); setPulse(true); setTimeout(() => setPulse(false), 600); }}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-slate-300 text-sm px-3 py-1.5 rounded-lg transition">
              <RefreshCw className="h-3.5 w-3.5" /> Oppdater
            </button>
          </div>
        </div>
      </div>

      {/* Live Signal Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {SIGNALS.map((sig) => {
          const Icon = sig.icon;
          return (
            <div key={sig.id} className={`rounded-2xl border p-5 ${statusColors[sig.status as keyof typeof statusColors]}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide opacity-80">{sig.label}</span>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                  ${sig.trend.startsWith('+') ? 'bg-emerald-500/20 text-emerald-300' : sig.trend.startsWith('-') ? 'bg-red-500/20 text-red-300' : 'bg-slate-700/50 text-slate-400'}`}>
                  {sig.trend}
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mb-1">{sig.value}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{sig.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Situasjonsvarsler */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="h-4 w-4 text-yellow-500" />
              Situasjonsvarsler
            </h2>
            <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold">
              {ALERTS.filter(a => a.level === 'high').length} kritiske
            </span>
          </div>
          <div className="space-y-3">
            {ALERTS.map((alert, i) => (
              <div key={i} className={`border-l-4 rounded-r-xl p-4 ${alertColors[alert.level as keyof typeof alertColors]}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${alertDotColors[alert.level as keyof typeof alertDotColors]}`} />
                    <div>
                      <p className="text-sm text-slate-800 font-medium">{alert.text}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{alert.time}</p>
                    </div>
                  </div>
                  <button className="text-xs text-blue-400 hover:text-blue-300 whitespace-nowrap font-medium flex items-center gap-1 flex-shrink-0">
                    {alert.action}
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Beslutningssporing */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-5">
            <Brain className="h-4 w-4 text-purple-500" />
            Beslutnings-logg
            <span className="text-xs text-slate-500 font-normal ml-1">Bedriften lærer av seg selv</span>
          </h2>
          <div className="space-y-4">
            {DECISIONS.map((d, i) => (
              <div key={i} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm font-semibold text-slate-900">{d.decision}</p>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{d.date}</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">{d.outcome}</p>
                <span className={`text-xs font-bold ${d.color}`}>{d.verdict}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full text-center text-xs text-blue-600 hover:text-blue-700 font-medium py-2 border border-slate-200 rounded-lg hover:border-blue-300 transition">
            + Logg ny beslutning
          </button>
        </div>
      </div>

      {/* ROI-fokus maskin */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Prioriterings-maskin</h2>
          <span className="text-xs text-slate-500">Høyest ROI-fokus akkurat nå</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { rank: '#1', action: 'Ring lead "Bjørn Hansen" – score 94', roi: '+kr 42 000 estimert', icon: '📞' },
            { rank: '#2', action: 'Send purring på faktura #1042 – forfalt', roi: '+kr 18 500 umiddelbart', icon: '📄' },
            { rank: '#3', action: 'Aktiver sove-kampanje "Mars høysesong"', roi: '+kr 8 200 / uke est.', icon: '🚀' },
          ].map((p) => (
            <div key={p.rank} className="bg-blue-50 rounded-xl border border-blue-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{p.icon}</span>
                <span className="text-xs font-bold text-blue-600 uppercase">{p.rank} Prioritet</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-2">{p.action}</p>
              <p className="text-xs text-emerald-600 font-bold">{p.roi}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
