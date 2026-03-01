'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, TrendingDown, CheckCircle, BarChart3, ArrowRight, Zap } from 'lucide-react';

const SCENARIOS = [
  {
    id: 's1',
    title: 'Mister 30% av inntekt over natt',
    type: 'Inntektstap',
    probability: 18,
    impact: 'Kritisk',
    impactColor: 'text-red-400',
    monthsSurvival: 2.4,
    actions: [
      'Aktiver kostnadsreduksjonsplan (kutt 35%)',
      'Kontakt topp-5 kunder med økt servicetilbud',
      'Søk driftstilskudd hos Innovasjon Norge',
    ],
  },
  {
    id: 's2',
    title: 'Nøkkelpersonell slutter samtidig',
    type: 'Kapasitetskrise',
    probability: 12,
    impact: 'Høy',
    impactColor: 'text-orange-400',
    monthsSurvival: 3.8,
    actions: [
      'Aktivér vikar-nettverk (5 kvalifiserte kontakter)',
      'Dokumenter kritiske prosesser i Prosessbiblioteket',
      'Tilby retensjonsbonus til nøkkelansatte',
    ],
  },
  {
    id: 's3',
    title: 'Leverandør slutter å levere',
    type: 'Supply chain',
    probability: 8,
    impact: 'Middels',
    impactColor: 'text-yellow-400',
    monthsSurvival: 5.2,
    actions: [
      'Aktiver backup-leverandør (Lemco AS)',
      'Bestill 6-ukers lager umiddelbart',
      'Forhandle ny hovedavtale innen 14 dager',
    ],
  },
  {
    id: 's4',
    title: 'Negativ media-omtale / anmeldelseskampanje',
    type: 'Omdømmekrise',
    probability: 5,
    impact: 'Middels',
    impactColor: 'text-yellow-400',
    monthsSurvival: 4.1,
    actions: [
      'Aktiver krisekommunikasjonsmal (forberedt)',
      'Kontakt topp-10 fornøyde kunder for støtte',
      'Svar åpent på alle plattformer innen 2t',
    ],
  },
];

const BUFFERS = [
  { label: 'Likviditetsreserve', current: 112000, target: 200000, unit: 'kr', icon: '💰' },
  { label: 'Buffer-tid (mnd kapasitet)', current: 1.8, target: 3, unit: 'mnd', icon: '⏱' },
  { label: 'Backup-leverandører', current: 2, target: 3, unit: 'stk', icon: '🏭' },
  { label: 'Dokumenterte nødprosedyrer', current: 7, target: 12, unit: 'stk', icon: '📋' },
];

const rehab = [
  { step: 1, title: 'Stabiliser kontantstrøm', desc: 'Stopp alle ikke-essensielle utgifter', status: 'done' },
  { step: 2, title: 'Kartlegg eiendeler', desc: 'Identifiser alt som kan frigjøres', status: 'done' },
  { step: 3, title: 'Kontakt kunder', desc: 'Prioriter de med høyest betalingsevne', status: 'active' },
  { step: 4, title: 'Søk finansiering', desc: 'Kassekreditt + Innovasjon Norge', status: 'pending' },
  { step: 5, title: 'Gjenoppbygg kapasitet', desc: 'Gradvis ansettelse / vikar', status: 'pending' },
];

export default function CrisisProofPage() {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [simMode, setSimMode] = useState(false);

  const overallHealth = Math.round(
    buffers_score(BUFFERS)
  );

  function buffers_score(bufs: typeof BUFFERS) {
    return bufs.reduce((sum, b) => sum + (b.current / b.target) * 100, 0) / bufs.length;
  }

  return (
    <div className="min-h-full">
      {/* Dark header */}
      <div className="-mx-6 -mt-6 mb-6 px-6 pt-8 pb-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-9 w-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Crisis-Proof Architecture</h1>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs px-3 py-1 rounded-full font-semibold">Enterprise</span>
            </div>
            <p className="text-slate-400 text-sm ml-12">Bedriften overlever alt – automatisk</p>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full border-4 ${
              overallHealth > 70 ? 'border-emerald-500 text-emerald-400' :
              overallHealth > 40 ? 'border-yellow-500 text-yellow-400' : 'border-red-500 text-red-400'
            }`}>
              <span className="text-xl font-extrabold">{overallHealth.toFixed(0)}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Krisemotstand</p>
          </div>
        </div>
      </div>

      {/* Buffer-bygger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          Automatisk bufferbygging
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BUFFERS.map((buf) => {
            const pct = Math.min((buf.current / buf.target) * 100, 100);
            return (
              <div key={buf.label} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{buf.icon}</span>
                  <p className="text-xs font-semibold text-slate-700 leading-tight">{buf.label}</p>
                </div>
                <div className="flex items-end gap-1 mb-2">
                  <span className={`text-2xl font-extrabold ${pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {typeof buf.current === 'number' && buf.current >= 1000 ? `${(buf.current / 1000).toFixed(0)}k` : buf.current}
                  </span>
                  <span className="text-xs text-slate-400 mb-1">/ {typeof buf.target === 'number' && buf.target >= 1000 ? `${(buf.target / 1000).toFixed(0)}k` : buf.target} {buf.unit}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{pct.toFixed(0)}% av mål</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Krisesimulator */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Krisesimulator
            </h2>
            <button
              onClick={() => setSimMode(!simMode)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition border
                ${simMode ? 'bg-red-100 border-red-300 text-red-700' : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              {simMode ? '⚠ Sim aktiv' : 'Start simulasjon'}
            </button>
          </div>
          <div className="space-y-2 mb-4">
            {SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => setActiveScenario(sc)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all
                  ${activeScenario.id === sc.id ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{sc.title}</p>
                  <p className="text-xs text-slate-500">{sc.type} · Sannsynlighet: {sc.probability}%</p>
                </div>
                <span className={`text-xs font-bold ${sc.impactColor}`}>{sc.impact}</span>
              </button>
            ))}
          </div>
          {activeScenario && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-xs font-bold text-orange-700 mb-1">📋 Overlevelsesplan – {activeScenario.title}</p>
              <p className="text-xs text-slate-500 mb-3">Estimert overlevelse uten tiltak: <span className="font-bold text-slate-900">{activeScenario.monthsSurvival} mnd</span></p>
              <ul className="space-y-1.5">
                {activeScenario.actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="text-orange-400 font-bold mt-0.5">{i + 1}.</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Rehabiliteringsmodus */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-blue-500" />
            Rehabiliterings-modus
            <span className="text-xs text-slate-400 font-normal">Gjenopprett etter tap</span>
          </h2>
          <div className="space-y-3">
            {rehab.map((step, i) => (
              <div key={step.step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
                    ${step.status === 'done' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' :
                      step.status === 'active' ? 'bg-blue-500/20 border border-blue-500/50 text-blue-300 animate-pulse' :
                      'bg-slate-700 border border-slate-600 text-slate-500'}`}>
                    {step.status === 'done' ? '✓' : step.step}
                  </div>
                  {i < rehab.length - 1 && (
                    <div className={`w-px flex-1 my-1 ${step.status === 'done' ? 'bg-emerald-700' : 'bg-slate-700'}`} />
                  )}
                </div>
                <div className="pb-3">
                  <p className={`text-sm font-semibold ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>{step.title}</p>
                  <p className="text-xs text-slate-500">{step.desc}</p>
                  {step.status === 'active' && (
                    <span className="text-xs text-blue-400 font-semibold">← Aktiv nå</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs font-bold text-blue-700 mb-1">Sårbarhetskart</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Kundeavhengighet', score: 3, max: 5, bad: true },
                { label: 'Likviditetsrisiko', score: 2, max: 5, bad: true },
                { label: 'Leverandørrisiko', score: 1, max: 5, bad: false },
                { label: 'Personalrisiko', score: 4, max: 5, bad: true },
              ].map((v) => (
                  <div key={v.label} className="bg-white rounded-lg border border-slate-200 p-2">
                    <p className="text-xs text-slate-500 mb-1">{v.label}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: v.max }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-2 flex-1 rounded-sm ${idx < v.score ? (v.bad && idx >= 3 ? 'bg-red-500' : 'bg-yellow-500') : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
