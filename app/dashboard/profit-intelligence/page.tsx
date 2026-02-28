'use client';

import { useState } from 'react';
import { TrendingUp, DollarSign, Target, Zap, BarChart3, ArrowUpRight, Sparkles, PieChart } from 'lucide-react';

const JOB_TYPES = [
  { name: 'Rørleggerarbeid', revenue: 18500, cost: 9200, hours: 6, volume: 12 },
  { name: 'Varmepumpe inst.', revenue: 32000, cost: 21000, hours: 12, volume: 4 },
  { name: 'Tilsynsrunde', revenue: 2800, cost: 900, hours: 1.5, volume: 22 },
  { name: 'Akutt utrykning', revenue: 8500, cost: 2800, hours: 3, volume: 8 },
];

const LEVERS = [
  {
    id: 'price',
    title: '+10% prisøkning',
    icon: '💰',
    description: 'Hev snittprisen med 10% på alle jobber',
    gain: 38200,
    risk: 'Lav',
    riskColor: 'text-emerald-400',
    steps: ['Oppdater prislisten neste uke', 'Informer eksisterende kunder 14 dager i forveien'],
  },
  {
    id: 'volume',
    title: '+20% flere jobber / mnd',
    icon: '📈',
    description: 'Aktiver 3 nye salgskanaler + intensiver kampanje',
    gain: 54600,
    risk: 'Middels',
    riskColor: 'text-yellow-400',
    steps: ['Aktiver Google Ads', 'Sett opp referral-program', 'Følg opp 12 sovende leads'],
  },
  {
    id: 'cost',
    title: 'Kutt kostnader 8%',
    icon: '✂️',
    description: 'Reduser materiale- og transportkostnader',
    gain: 18700,
    risk: 'Lav',
    riskColor: 'text-emerald-400',
    steps: ['Bytt til ny materialeleverandør', 'Rute-optimaliser kjøring', 'Bulk-kjøp felles materiell'],
  },
  {
    id: 'upsell',
    title: 'Upsell 15% av kunder',
    icon: '🎯',
    description: 'Tilby serviceavtale / utvidet garantipakke',
    gain: 29400,
    risk: 'Lav',
    riskColor: 'text-emerald-400',
    steps: ['Lag en serviceavtale-pakke', 'Tilby ved fakturering', 'Aktiver AI upsell-script'],
  },
  {
    id: 'mix',
    title: 'Flytt jobbmiks mot høymargin',
    icon: '🔀',
    description: 'Prioriter "Tilsynsrunde" – høyest margin/time',
    gain: 22100,
    risk: 'Lav',
    riskColor: 'text-emerald-400',
    steps: ['Markedsfør tilsynsavtaler aktivt', 'Sett opp abonnementsmodell', 'Prioriter i salgspitch'],
  },
];

export default function ProfitIntelligencePage() {
  const [jobs, setJobs] = useState(JOB_TYPES);
  const [activeLever, setActiveLever] = useState<string | null>('price');

  const totalRevenue = jobs.reduce((s, j) => s + j.revenue * j.volume, 0);
  const totalCost = jobs.reduce((s, j) => s + j.cost * j.volume, 0);
  const totalProfit = totalRevenue - totalCost;
  const avgMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);

  const byMargin = [...jobs].sort((a, b) => {
    const ma = (a.revenue - a.cost) / a.revenue;
    const mb = (b.revenue - b.cost) / b.revenue;
    return mb - ma;
  });

  const lowestMarginJob = byMargin[byMargin.length - 1];
  const lowestMarginPct = (((lowestMarginJob.revenue - lowestMarginJob.cost) / lowestMarginJob.revenue) * 100).toFixed(0);
  const activeLeverData = LEVERS.find((l) => l.id === activeLever);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Profit Intelligence Layer</h1>
            <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs px-3 py-1 rounded-full font-semibold">Pro</span>
          </div>
          <p className="text-slate-400 text-sm">Margin som maskin – jakk hver krone systematisk</p>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total omsetning/mnd', value: `${(totalRevenue / 1000).toFixed(0)} k`, icon: DollarSign, color: 'text-blue-400' },
          { label: 'Total fortjeneste/mnd', value: `${(totalProfit / 1000).toFixed(0)} k`, icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Snittmargin', value: `${avgMargin}%`, icon: PieChart, color: 'text-purple-400' },
          { label: 'Jobber/mnd', value: jobs.reduce((s, j) => s + j.volume, 0).toString(), icon: Target, color: 'text-yellow-400' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 ${kpi.color}`} />
                <span className="text-xs text-slate-400 font-medium">{kpi.label}</span>
              </div>
              <p className="text-3xl font-extrabold text-white">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Jobbtype margin tabell */}
        <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            Marginanalyse per jobbtype
          </h2>
          <div className="space-y-3">
            {byMargin.map((j, i) => {
              const margin = ((j.revenue - j.cost) / j.revenue) * 100;
              const ratePerHour = (j.revenue - j.cost) / j.hours;
              const monthlyProfit = (j.revenue - j.cost) * j.volume;
              const isLowest = i === byMargin.length - 1;
              return (
                <div key={j.name} className={`rounded-xl p-4 border ${isLowest ? 'border-red-500/30 bg-red-500/5' : 'border-slate-700/50 bg-slate-900/40'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isLowest && <span className="text-xs text-red-400 font-bold">⚠</span>}
                      <span className="text-sm font-semibold text-white">{j.name}</span>
                    </div>
                    <span className={`text-sm font-bold ${margin > 55 ? 'text-emerald-400' : margin > 35 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {margin.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all ${margin > 55 ? 'bg-emerald-500' : margin > 35 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${margin}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>kr {ratePerHour.toFixed(0)}/t</span>
                    <span>kr {(monthlyProfit / 1000).toFixed(1)}k/mnd</span>
                    <span>{j.volume} jobb/mnd</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Marginspaker */}
        <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            Margin-spaker
          </h2>
          <div className="space-y-2 mb-4">
            {LEVERS.map((lever) => (
              <button
                key={lever.id}
                onClick={() => setActiveLever(lever.id === activeLever ? null : lever.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all
                  ${activeLever === lever.id ? 'border-blue-500/50 bg-blue-500/10' : 'border-slate-700 hover:border-slate-600 bg-slate-900/40'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{lever.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{lever.title}</p>
                    <p className="text-xs text-slate-400">{lever.description}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-xs font-bold text-emerald-400">+kr {(lever.gain / 1000).toFixed(0)}k/mnd</p>
                  <p className={`text-xs ${lever.riskColor}`}>{lever.risk} risiko</p>
                </div>
              </button>
            ))}
          </div>
          {activeLeverData && (
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-300 uppercase mb-2">Aksjonssteg – {activeLeverData.title}</p>
              <ul className="space-y-1">
                {activeLeverData.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircleIcon className="h-3 w-3 text-blue-400 mt-1 flex-shrink-0" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* AI Anbefalingscard */}
      <div className="bg-gradient-to-r from-orange-900/30 to-red-900/20 rounded-2xl border border-orange-700/30 p-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1">AI Profitt-anbefaling</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              <span className="font-semibold text-orange-300">"{lowestMarginJob.name}"</span> er jobbtypet med lavest margin ({lowestMarginPct}%).
              Vi anbefaler å enten heve prisen med 15–20%, eller vri mer kapasitet mot høymargin-jobber som "Tilsynsrunde".
              Estimert effekt: <span className="font-bold text-emerald-400">+kr {((parseFloat(lowestMarginPct) * 1.15 / 100) * lowestMarginJob.revenue * lowestMarginJob.volume / 1000).toFixed(0)}k/mnd</span> i økt fortjeneste.
            </p>
            <button className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-300 hover:text-orange-200">
              <ArrowUpRight className="h-4 w-4" />
              Aktiver prisøkning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
