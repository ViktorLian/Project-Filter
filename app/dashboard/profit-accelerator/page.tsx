'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, AlertTriangle, CheckCircle, Zap, ArrowUpRight, BarChart3, Target, ChevronRight } from 'lucide-react';

type JobType = { name: string; avgRevenue: number; avgCost: number; avgHours: number; volume: number; };

const DEFAULT_JOBS: JobType[] = [
  { name: 'Baderom-renovering', avgRevenue: 85000, avgCost: 48000, avgHours: 120, volume: 4 },
  { name: 'Malerjobb innvendig', avgRevenue: 18000, avgCost: 10000, avgHours: 24, volume: 8 },
  { name: 'Kjøkkenmontering', avgRevenue: 45000, avgCost: 28000, avgHours: 60, volume: 3 },
  { name: 'Vedlikeholdsoppdrag', avgRevenue: 6500, avgCost: 3200, avgHours: 8, volume: 14 },
];

const MARGIN_LEVERS = [
  { id: 'price', label: 'Øk prisen 10%', icon: DollarSign, color: 'text-emerald-400', description: 'Mest effektiv enkeltfaktor. 10% prisøkning → 30-50% mer profitt om kostnader er faste.', impact: 'very_high' },
  { id: 'volume', label: 'Øk volum 20%', icon: TrendingUp, color: 'text-blue-400', description: 'Krev bedre markedsføring og salg. Fungerer best i kombinasjon med kapasitetsoptimalisering.', impact: 'high' },
  { id: 'costs', label: 'Kutt materialkost 8%', icon: AlertTriangle, color: 'text-amber-400', description: 'Forhandle med leverandører, bruk innkjøpskollektiv og standardiser materiallister.', impact: 'medium' },
  { id: 'upsell', label: 'Mersalg 15% av kunder', icon: Zap, color: 'text-purple-400', description: 'Strukturert mersalg i avslutningsfasen. Eksisterende kunder kjøper 60% letter enn nye.', impact: 'high' },
  { id: 'mix', label: 'Flytt miks mot høymarginjobber', icon: Target, color: 'text-pink-400', description: 'Prioriter jobber med > 40% bruttomarg. Avvis eller priser opp lavmarginjobber.', impact: 'high' },
];

const IMPACT_CONFIG = { very_high: 'Svært høy', high: 'Høy', medium: 'Medium', low: 'Lav' };

function fmt(n: number) { return Math.round(n).toLocaleString('nb-NO') + ' kr'; }
function pct(n: number) { return `${Math.round(n)}%`; }

export default function ProfitAcceleratorPage() {
  const [jobs, setJobs] = useState<JobType[]>(DEFAULT_JOBS);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [activeLever, setActiveLever] = useState<string | null>(null);

  const setJob = (i: number, k: keyof JobType, v: number) => {
    setJobs(js => js.map((j, idx) => idx === i ? { ...j, [k]: v } : j));
  };

  const metrics = useMemo(() => {
    return jobs.map(j => {
      const gross = (j.avgRevenue - j.avgCost) * j.volume;
      const margin = j.avgRevenue > 0 ? ((j.avgRevenue - j.avgCost) / j.avgRevenue) * 100 : 0;
      const rph = j.avgHours > 0 ? (j.avgRevenue - j.avgCost) / j.avgHours : 0;
      return { ...j, gross, margin, rph };
    });
  }, [jobs]);

  const totalRevenue = metrics.reduce((a, j) => a + j.avgRevenue * j.volume, 0);
  const totalProfit = metrics.reduce((a, j) => a + j.gross, 0);
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Scenarios
  const s_price = metrics.reduce((a, j) => a + (j.avgRevenue * 1.1 - j.avgCost) * j.volume, 0);
  const s_volume = metrics.reduce((a, j) => a + j.gross * 1.2, 0);
  const s_costs = metrics.reduce((a, j) => a + (j.avgRevenue - j.avgCost * 0.92) * j.volume, 0);
  const s_upsell = totalProfit + totalRevenue * 0.15 * 0.45;  // 15% upsell at 45% margin
  const levers: Record<string, number> = { price: s_price, volume: s_volume, costs: s_costs, upsell: s_upsell, mix: totalProfit * 1.18 };

  const marginColor = (m: number) => m >= 40 ? 'text-emerald-400' : m >= 25 ? 'text-amber-400' : 'text-red-400';
  const marginBg = (m: number) => m >= 40 ? 'bg-emerald-500' : m >= 25 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lønnsomhet</span>
            <span className="text-xs font-bold bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">Pro</span>
          </div>
          <h1 className="text-3xl font-black text-white">Profit Accelerator</h1>
          <p className="text-slate-400 text-sm mt-1">Systematisk jakt på margin — se hva som faktisk driver lønnsomheten din</p>
        </div>

        {/* KPI overview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-white">{fmt(totalRevenue)}</p>
            <p className="text-xs text-slate-400 mt-1">Total månedsinntekt</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 text-center">
            <p className={`text-3xl font-black ${marginColor(avgMargin)}`}>{fmt(totalProfit)}</p>
            <p className="text-xs text-slate-400 mt-1">Bruttoresultat</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 text-center">
            <p className={`text-3xl font-black ${marginColor(avgMargin)}`}>{pct(avgMargin)}</p>
            <p className="text-xs text-slate-400 mt-1">Gjennomsnittlig margin</p>
          </div>
        </div>

        {/* Job type analysis */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Jobbtype-analyse</h3>
            <p className="text-xs text-slate-400">Klikk en rad for å redigere</p>
          </div>
          <div className="space-y-3">
            {metrics.sort((a, b) => b.margin - a.margin).map((j, i) => {
              const origIdx = jobs.findIndex(jb => jb.name === j.name);
              const isEdit = editIdx === origIdx;
              return (
                <div key={j.name}>
                  <button className="w-full" onClick={() => setEditIdx(isEdit ? null : origIdx)}>
                    <div className="flex items-center gap-3 text-left">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold text-white">{j.name}</span>
                          <span className={`text-xs font-bold ${marginColor(j.margin)}`}>{pct(j.margin)} margin</span>
                          <span className="text-xs text-slate-500">×{j.volume}/mnd</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-2 rounded-full ${marginBg(j.margin)}`} style={{ width: `${Math.min(j.margin, 100)}%` }} />
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-white">{fmt(j.gross)}</p>
                        <p className="text-xs text-slate-400">{Math.round(j.rph)} kr/t</p>
                      </div>
                    </div>
                  </button>
                  {isEdit && (
                    <div className="mt-3 bg-slate-900/60 border border-slate-700 rounded-xl p-4 grid grid-cols-2 gap-4">
                      {[
                        { label: 'Inntekt pr. jobb (kr)', key: 'avgRevenue' as keyof JobType },
                        { label: 'Kostnad pr. jobb (kr)', key: 'avgCost' as keyof JobType },
                        { label: 'Timer pr. jobb', key: 'avgHours' as keyof JobType },
                        { label: 'Antall pr. måned', key: 'volume' as keyof JobType },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="text-xs text-slate-400">{f.label}</label>
                          <input type="number" value={jobs[origIdx][f.key] as number}
                            onChange={e => setJob(origIdx, f.key, +e.target.value)}
                            className="w-full mt-1 bg-slate-800 border border-slate-600 text-white px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Margin levers */}
        <div>
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" /> Margin-løftestenger
          </h3>
          <div className="space-y-3">
            {MARGIN_LEVERS.map(lever => {
              const newProfit = levers[lever.id] ?? totalProfit;
              const gain = newProfit - totalProfit;
              const Icon = lever.icon;
              const isActive = activeLever === lever.id;
              return (
                <div key={lever.id}
                  className={`border rounded-2xl p-4 cursor-pointer transition ${isActive ? 'bg-slate-700/60 border-slate-500' : 'bg-slate-800/60 border-slate-700/50 hover:border-slate-600'}`}
                  onClick={() => setActiveLever(isActive ? null : lever.id)}>
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 flex-shrink-0 ${lever.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white">{lever.label}</span>
                        <span className="text-xs text-slate-500">Effekt: {IMPACT_CONFIG[lever.impact as keyof typeof IMPACT_CONFIG]}</span>
                      </div>
                      {isActive && <p className="text-slate-400 text-sm mt-1">{lever.description}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-emerald-400 font-bold text-sm">+{fmt(gain)}/mnd</p>
                      <p className="text-xs text-slate-500">+{pct((gain / totalProfit) * 100)}</p>
                    </div>
                    <ArrowUpRight className={`h-4 w-4 flex-shrink-0 ${lever.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best lever CTA */}
        <div className="bg-gradient-to-r from-emerald-900/40 to-blue-900/40 border border-emerald-700/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="h-6 w-6 text-emerald-400" />
            <h3 className="font-bold text-white text-lg">FlowPilot-anbefaling</h3>
          </div>
          <p className="text-slate-300 text-sm mb-4">
            Din <span className="text-amber-400 font-semibold">Vedlikeholdsoppdrag</span> har lavest margin ({pct(metrics.find(m => m.name.includes('Vedlikeholds'))?.margin ?? 0)}).
            Enten øk prisen 15–20% eller slutt å ta disse — og bruk kapasiteten på baderoms-jobber som gir 3× mer lønnsomhet per time.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a href="/dashboard/digital-twin"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
              Simuler i Digital Tvilling <ChevronRight className="h-4 w-4" />
            </a>
            <a href="/dashboard/price-calculator"
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
              Prisskalkulator
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
