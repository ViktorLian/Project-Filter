'use client';

import { useState } from 'react';
import { Map, Target, Rocket, BarChart3, ArrowUpRight, Star, Search, TrendingUp, Globe } from 'lucide-react';

const DISTRICTS = [
  { name: 'Sagene / Torshov', score: 91, demand: 'Høy', competition: 'Middels', leads: 14, potential: 42000, color: 'bg-emerald-500' },
  { name: 'Grünerløkka', score: 78, demand: 'Høy', competition: 'Høy', leads: 9, potential: 28000, color: 'bg-blue-500' },
  { name: 'Frogner', score: 65, demand: 'Middels', competition: 'Lav', leads: 6, potential: 52000, color: 'bg-yellow-500' },
  { name: 'Majorstuen', score: 43, demand: 'Middels', competition: 'Høy', leads: 3, potential: 18000, color: 'bg-orange-500' },
  { name: 'Bjerke', score: 87, demand: 'Høy', competition: 'Lav', leads: 11, potential: 35000, color: 'bg-emerald-500' },
  { name: 'Stovner', score: 34, demand: 'Lav', competition: 'Lav', leads: 2, potential: 12000, color: 'bg-red-500' },
];

const EXPERIMENTS = [
  { id: 'a1', title: 'Lead-magnet: "5 tips" PDF', variant: 'A – blå knapp', conversion: '4.2%', status: 'Vinner', statusColor: 'text-emerald-400' },
  { id: 'a2', title: 'Prisliste synlig / skjult', variant: 'A – synlig', conversion: '7.8%', status: 'Test pågår', statusColor: 'text-yellow-400' },
  { id: 'a3', title: 'Google Ads: Natt vs dag', variant: 'Dag-kampanje', conversion: '3.1%', status: 'Test pågår', statusColor: 'text-yellow-400' },
  { id: 'a4', title: 'E-postemnelinje – urgency', variant: 'B – "I dag siste dag"', conversion: '11.2%', status: 'Vinner', statusColor: 'text-emerald-400' },
];

const PLAN_STEPS = [
  { phase: '1', title: 'Dominér Sagene / Torshov', weeks: '1–4', action: 'Intensive Google Ads + 50 cold calls', expected: '+8 leads/uke' },
  { phase: '2', title: 'Ekspander til Bjerke', weeks: '5–8', action: 'Vervprogram + flyers i borettslag', expected: '+6 leads/uke' },
  { phase: '3', title: 'Penetrer Grünerløkka', weeks: '9–16', action: 'Partnerskap med eiendomsmeglere', expected: '+12 leads/uke' },
];

export default function MarketEnginePage() {
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICTS[0]);

  return (
    <div className="min-h-full">
      {/* Dark header */}
      <div className="-mx-6 -mt-6 mb-6 px-6 pt-8 pb-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-9 w-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Globe className="h-5 w-5 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Market Domination Engine</h1>
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-3 py-1 rounded-full font-semibold">Pro</span>
        </div>
        <p className="text-slate-400 text-sm ml-12">Eig lokalmarkedet – bydel for bydel</p>
      </div>

      {/* District grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Map className="h-4 w-4 text-cyan-500" />
            Mikro-geografi score – Oslo
          </h2>
          <div className="space-y-3">
            {DISTRICTS.map((d) => (
              <button
                key={d.name}
                onClick={() => setSelectedDistrict(d)}
                className={`w-full flex items-center gap-4 p-3 rounded-xl border text-left transition-all
                  ${selectedDistrict.name === d.name ? 'border-cyan-500/50 bg-cyan-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
              >
                <div className="w-10 text-center">
                  <span className={`text-lg font-extrabold ${
                    d.score >= 80 ? 'text-emerald-400' : d.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>{d.score}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{d.name}</p>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-xs text-slate-500">Etterspørsel: <span className="text-slate-700">{d.demand}</span></span>
                    <span className="text-xs text-slate-500">Konkurranse: <span className="text-slate-700">{d.competition}</span></span>
                  </div>
                </div>
                <div className="w-28 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.score}%` }} />
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-slate-900">{d.leads} leads</p>
                  <p className="text-xs text-emerald-400">+kr {(d.potential / 1000).toFixed(0)}k</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected district detail */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-yellow-500" />
            {selectedDistrict.name}
          </h2>
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center h-24 w-24 rounded-full border-4 ${
              selectedDistrict.score >= 80 ? 'border-emerald-500 text-emerald-400' :
              selectedDistrict.score >= 60 ? 'border-yellow-500 text-yellow-400' : 'border-red-500 text-red-400'}`}>
              <span className="text-3xl font-extrabold">{selectedDistrict.score}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Dominanspoeng</p>
          </div>
          <div className="space-y-3 mb-6">
            {[
              { label: 'Etterspørselsnivå', value: selectedDistrict.demand },
              { label: 'Konkurranse', value: selectedDistrict.competition },
              { label: 'Aktive leads', value: `${selectedDistrict.leads} leads` },
              { label: 'Potensial/mnd', value: `kr ${(selectedDistrict.potential / 1000).toFixed(0)}k` },
            ].map((r) => (
              <div key={r.label} className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs text-slate-500">{r.label}</span>
                <span className="text-sm font-semibold text-slate-900">{r.value}</span>
              </div>
            ))}
          </div>
          <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
            <Rocket className="h-4 w-4" />
            Dominer dette området
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Kampanje-eksperiment lab */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-purple-500" />
            Kampanje-eksperiment lab
          </h2>
          <div className="space-y-3">
            {EXPERIMENTS.map((exp) => (
              <div key={exp.id} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{exp.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{exp.variant}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-900">{exp.conversion}</p>
                    <p className={`text-xs font-semibold ${exp.statusColor}`}>{exp.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full border border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400 text-sm py-2.5 rounded-xl transition">
            + Start nytt eksperiment
          </button>
        </div>

        {/* Penetrasjonsplan */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Markeds-penetrasjonsplan
          </h2>
          <div className="space-y-4">
            {PLAN_STEPS.map((step, i) => (
              <div key={step.phase} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                    {step.phase}
                  </div>
                  <div className={`w-px h-full bg-slate-200 my-1`} />
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-slate-900">{step.title}</p>
                    <span className="text-xs text-slate-400">Uke {step.weeks}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{step.action}</p>
                  <p className="text-xs font-semibold text-emerald-600">Mål: {step.expected}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-2 w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-sm font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2">
            <Rocket className="h-4 w-4" />
            Aktiver penetrasjonsplan
          </button>
        </div>
      </div>
    </div>
  );
}
