'use client';

import { useState, useMemo } from 'react';
import { Sliders, TrendingUp, DollarSign, Users, Zap, BarChart3, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

type Scenario = {
  name: string;
  pricePerJob: number;
  jobsPerMonth: number;
  teamSize: number;
  costPerJob: number;
  marketingSpend: number;
  conversionRate: number;
  avgUpsell: number;
};

const PRESETS: Scenario[] = [
  { name: 'Konservativ', pricePerJob: 18000, jobsPerMonth: 8, teamSize: 2, costPerJob: 10000, marketingSpend: 3000, conversionRate: 20, avgUpsell: 500 },
  { name: 'Nåsituasjon', pricePerJob: 25000, jobsPerMonth: 14, teamSize: 3, costPerJob: 13000, marketingSpend: 6000, conversionRate: 30, avgUpsell: 1200 },
  { name: 'Vekstmodus', pricePerJob: 28000, jobsPerMonth: 22, teamSize: 5, costPerJob: 14000, marketingSpend: 12000, conversionRate: 40, avgUpsell: 2000 },
];

function calc(s: Scenario) {
  const grossRevenue = s.pricePerJob * s.jobsPerMonth;
  const upsellRevenue = s.jobsPerMonth * s.avgUpsell;
  const totalRevenue = grossRevenue + upsellRevenue;
  const directCosts = s.costPerJob * s.jobsPerMonth;
  const totalCosts = directCosts + s.marketingSpend + s.teamSize * 55000;
  const profit = totalRevenue - totalCosts;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  const revenuePerEmployee = totalRevenue / Math.max(s.teamSize, 1);
  const leadsNeeded = s.conversionRate > 0 ? Math.ceil((s.jobsPerMonth / (s.conversionRate / 100))) : 0;
  const yearlyRevenue = totalRevenue * 12;
  const yearlyProfit = profit * 12;
  const roiMarketing = s.marketingSpend > 0 ? ((grossRevenue - s.marketingSpend) / s.marketingSpend) * 100 : 0;
  return { grossRevenue, upsellRevenue, totalRevenue, directCosts, totalCosts, profit, margin, revenuePerEmployee, leadsNeeded, yearlyRevenue, yearlyProfit, roiMarketing };
}

function fmt(n: number) { return Math.round(n).toLocaleString('nb-NO') + ' kr'; }
function fmtPct(n: number) { return `${Math.round(n)}%`; }

function Slider({ label, value, min, max, step = 1, unit = '', onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
        <span className="text-sm font-bold text-white bg-slate-700 px-2 py-0.5 rounded-lg">{value.toLocaleString('nb-NO')}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500" />
      <div className="flex justify-between text-xs text-slate-600">
        <span>{min.toLocaleString()}{unit}</span><span>{max.toLocaleString()}{unit}</span>
      </div>
    </div>
  );
}

export default function DigitalTwinPage() {
  const [scenario, setScenario] = useState<Scenario>({ ...PRESETS[1] });
  const [compare, setCompare] = useState<Scenario>({ ...PRESETS[0] });
  const [showCompare, setShowCompare] = useState(false);

  const set = (k: keyof Scenario) => (v: number) => setScenario(s => ({ ...s, [k]: v }));
  const setC = (k: keyof Scenario) => (v: number) => setCompare(s => ({ ...s, [k]: v }));

  const m = useMemo(() => calc(scenario), [scenario]);
  const mc = useMemo(() => calc(compare), [compare]);

  const healthColor = m.margin >= 30 ? 'text-emerald-400' : m.margin >= 15 ? 'text-amber-400' : 'text-red-400';
  const healthLabel = m.margin >= 30 ? 'God lønnsomhet' : m.margin >= 15 ? 'Akseptabel margin' : 'Lav margin – juster variabler';

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sliders className="h-5 w-5 text-purple-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Digital Tvilling</span>
            </div>
            <h1 className="text-3xl font-black text-white">Forretnings-simulator</h1>
            <p className="text-slate-400 text-sm mt-1">Test strategier, priser og vekstscenarier — uten risiko</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {PRESETS.map(p => (
              <button key={p.name} onClick={() => setScenario({ ...p })}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition ${scenario.name === p.name ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-blue-500 hover:text-white'}`}>
                {p.name}
              </button>
            ))}
            <button onClick={() => setShowCompare(!showCompare)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition ${showCompare ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-purple-500 hover:text-white'}`}>
              {showCompare ? 'Skjul sammenligning' : 'Sammenlign scenarier'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-400" /> Juster variabler
              </h3>
              <div className="space-y-5">
                <Slider label="Pris per jobb" value={scenario.pricePerJob} min={5000} max={100000} step={1000} unit=" kr" onChange={set('pricePerJob')} />
                <Slider label="Jobber per mnd" value={scenario.jobsPerMonth} min={1} max={60} onChange={set('jobsPerMonth')} />
                <Slider label="Teamstørrelse" value={scenario.teamSize} min={1} max={20} onChange={set('teamSize')} />
                <Slider label="Kostnad per jobb" value={scenario.costPerJob} min={1000} max={80000} step={500} unit=" kr" onChange={set('costPerJob')} />
                <Slider label="Markedsføring/mnd" value={scenario.marketingSpend} min={0} max={50000} step={500} unit=" kr" onChange={set('marketingSpend')} />
                <Slider label="Konverteringsrate" value={scenario.conversionRate} min={1} max={80} unit="%" onChange={set('conversionRate')} />
                <Slider label="Gjennomsn. mersalg" value={scenario.avgUpsell} min={0} max={10000} step={100} unit=" kr" onChange={set('avgUpsell')} />
              </div>
            </div>

            {showCompare && (
              <div className="bg-purple-900/20 rounded-2xl border border-purple-700/40 p-5">
                <h3 className="font-bold text-purple-300 mb-4">Sammenligning-scenario</h3>
                <div className="space-y-5">
                  <Slider label="Pris per jobb" value={compare.pricePerJob} min={5000} max={100000} step={1000} unit=" kr" onChange={setC('pricePerJob')} />
                  <Slider label="Jobber per mnd" value={compare.jobsPerMonth} min={1} max={60} onChange={setC('jobsPerMonth')} />
                  <Slider label="Kostnad per jobb" value={compare.costPerJob} min={1000} max={80000} step={500} unit=" kr" onChange={setC('costPerJob')} />
                  <Slider label="Konverteringsrate" value={compare.conversionRate} min={1} max={80} unit="%" onChange={setC('conversionRate')} />
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="xl:col-span-2 space-y-4">
            {/* Health indicator */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-5 flex items-center gap-4">
              <div className={`text-5xl font-black ${healthColor}`}>{fmtPct(m.margin)}</div>
              <div>
                <p className={`font-bold text-lg ${healthColor}`}>{healthLabel}</p>
                <p className="text-slate-400 text-sm">Nettoresultat: {fmt(m.profit)} / mnd</p>
              </div>
              {m.margin < 10 && (
                <div className="ml-auto flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-2 rounded-xl text-sm">
                  <AlertTriangle className="h-4 w-4" /> Øk pris eller reduser kostnader
                </div>
              )}
            </div>

            {/* KPI grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Månedsinntekt', value: fmt(m.totalRevenue), sub: showCompare ? `vs ${fmt(mc.totalRevenue)}` : undefined, icon: DollarSign, color: 'text-emerald-400' },
                { label: 'Månedsresultat', value: fmt(m.profit), sub: showCompare ? (m.profit > mc.profit ? `+${fmt(m.profit - mc.profit)} mer` : fmt(m.profit - mc.profit)) : undefined, icon: TrendingUp, color: m.profit >= 0 ? 'text-emerald-400' : 'text-red-400' },
                { label: 'Leads trengs', value: m.leadsNeeded.toString(), sub: `for ${scenario.jobsPerMonth} jobber/mnd`, icon: Users, color: 'text-blue-400' },
                { label: 'Omsetning/ansatt', value: fmt(m.revenuePerEmployee), sub: 'pr. mnd', icon: BarChart3, color: 'text-purple-400' },
              ].map(k => {
                const Icon = k.icon;
                return (
                  <div key={k.label} className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`h-4 w-4 ${k.color}`} />
                      <span className="text-xs text-slate-400 font-medium">{k.label}</span>
                    </div>
                    <p className={`text-xl font-black ${k.color}`}>{k.value}</p>
                    {k.sub && <p className="text-xs text-slate-500 mt-0.5">{k.sub}</p>}
                  </div>
                );
              })}
            </div>

            {/* Yearly projection */}
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-700/30 p-5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" /> 12-måneders prognose
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Total årsomsetning</p>
                  <p className="text-2xl font-black text-blue-400">{fmt(m.yearlyRevenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Årsresultat</p>
                  <p className={`text-2xl font-black ${m.yearlyProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(m.yearlyProfit)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Markedsf. ROI</p>
                  <p className={`text-2xl font-black ${m.roiMarketing >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>{fmtPct(m.roiMarketing)}</p>
                </div>
              </div>
            </div>

            {/* Revenue waterfall */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-5">
              <h3 className="font-bold text-white mb-4">Inntektsstruktur</h3>
              <div className="space-y-2">
                {[
                  { label: 'Jobber × pris', value: m.grossRevenue, color: 'bg-blue-500', pct: (m.grossRevenue / m.totalRevenue) * 100 },
                  { label: 'Mersalg', value: m.upsellRevenue, color: 'bg-purple-500', pct: (m.upsellRevenue / m.totalRevenue) * 100 },
                  { label: '− Direkte kostnader', value: -m.directCosts, color: 'bg-red-500', pct: (m.directCosts / m.totalRevenue) * 100 },
                  { label: '− Markedsføring', value: -scenario.marketingSpend, color: 'bg-orange-500', pct: (scenario.marketingSpend / m.totalRevenue) * 100 },
                  { label: '− Lønnskostnad', value: -(scenario.teamSize * 55000), color: 'bg-rose-600', pct: (scenario.teamSize * 55000 / m.totalRevenue) * 100 },
                  { label: '= Nettoresultat', value: m.profit, color: m.profit >= 0 ? 'bg-emerald-500' : 'bg-red-700', pct: Math.abs((m.profit / m.totalRevenue) * 100) },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-36 flex-shrink-0">{row.label}</span>
                    <div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-4 rounded-full ${row.color}`} style={{ width: `${Math.min(Math.abs(row.pct), 100)}%` }} />
                    </div>
                    <span className={`text-xs font-bold w-28 text-right flex-shrink-0 ${row.value >= 0 ? 'text-slate-300' : 'text-red-400'}`}>{fmt(row.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-5">
              <h3 className="font-bold text-white mb-3">System-innsikt</h3>
              <div className="space-y-2">
                {[
                  m.margin < 20 && { type: 'warn', msg: `Marginen på ${fmtPct(m.margin)} er under 20%. Vurder å øke prisen med ${fmt(Math.round(scenario.costPerJob * 0.25))} for å nå 30% margin.` },
                  m.leadsNeeded > 50 && { type: 'warn', msg: `Du trenger ${m.leadsNeeded} leads/mnd. Vurder å øke konverteringsraten over ${scenario.conversionRate}% — 1% mer gir ${scenario.jobsPerMonth * 0.01} ekstra jobber/mnd.` },
                  scenario.teamSize > 0 && m.revenuePerEmployee < 80000 && { type: 'warn', msg: `Omsetning per ansatt (${fmt(m.revenuePerEmployee)}) er lavt. Norsk snitt for håndverksbedrifter er ca 95 000 kr/mnd.` },
                  m.margin >= 30 && { type: 'good', msg: `${fmtPct(m.margin)} margin er over bransjesnitt. Neste steg: bruk overskuddet til markedsføring for å skalere volum.` },
                  m.roiMarketing > 400 && { type: 'good', msg: `Markedsf. ROI på ${fmtPct(m.roiMarketing)} er svært bra. Dobling av budsjett vil gi ca ${fmt(m.grossRevenue)} ekstra inntekt.` },
                ].filter(Boolean).map((insight: any, i) => insight && (
                  <div key={i} className={`flex items-start gap-2 text-sm rounded-xl p-3 ${insight.type === 'good' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>
                    {insight.type === 'good' ? <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                    {insight.msg}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
