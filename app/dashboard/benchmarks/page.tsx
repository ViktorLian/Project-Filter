'use client';

import { BarChart2, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

type Bench = { metric: string; yours: number; industry: number; unit: string; good: 'high' | 'low' };

const BENCHMARKS: Bench[] = [
  { metric: 'Vinnerrate', yours: 58, industry: 45, unit: '%', good: 'high' },
  { metric: 'Gjennomsnittsverdi per jobb', yours: 42000, industry: 38000, unit: 'kr', good: 'high' },
  { metric: 'Svarstid pa nye leads', yours: 3.2, industry: 6.5, unit: 'timer', good: 'low' },
  { metric: 'Leadstaprate', yours: 32, industry: 41, unit: '%', good: 'low' },
  { metric: 'Kundetilfredshet (NPS)', yours: 72, industry: 55, unit: 'poeng', good: 'high' },
  { metric: 'Gjentakende kunder', yours: 38, industry: 31, unit: '%', good: 'high' },
  { metric: 'Tilbud til avtale ratio', yours: 2.8, industry: 3.5, unit: 'dager', good: 'low' },
  { metric: 'Bruttomarginen per jobb', yours: 34, industry: 28, unit: '%', good: 'high' },
];

function compare(b: Bench): 'better' | 'worse' | 'equal' {
  const diff = b.yours - b.industry;
  if (Math.abs(diff) < 0.5) return 'equal';
  if (b.good === 'high') return diff > 0 ? 'better' : 'worse';
  return diff < 0 ? 'better' : 'worse';
}

export default function BenchmarksPage() {
  const better = BENCHMARKS.filter(b => compare(b) === 'better').length;
  const worse = BENCHMARKS.filter(b => compare(b) === 'worse').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bransje Benchmarks</h1>
        <p className="text-slate-500 text-sm mt-0.5">Se hvordan du presterer mot bransjesnittet for norske servicefirmaer</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Over snitt', val: better, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Under snitt', val: worse, icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Totale mott', val: BENCHMARKS.length, icon: BarChart2, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.val}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">Benchmark-tall er basert pa bransjedata fra norske SMB-servicefirmaer (bygg, roifor, renhold, VVS). Dine tall er demo-data — koble ekte data via Innstillinger.</p>
      </div>

      {/* Benchmarks list */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Metrikk</span>
            <span className="text-center">Ditt tall</span>
            <span className="text-center">Bransje snitt</span>
            <span className="text-center">Status</span>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {BENCHMARKS.map((b, i) => {
            const status = compare(b);
            const pct = Math.min(100, Math.round((b.yours / Math.max(b.yours, b.industry)) * 100));
            const industryPct = Math.min(100, Math.round((b.industry / Math.max(b.yours, b.industry)) * 100));
            return (
              <div key={i} className="px-5 py-4 hover:bg-slate-50">
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-semibold text-slate-800 text-sm">{b.metric}</span>
                  <div className="text-center">
                    <p className="font-bold text-slate-900 text-sm">{b.yours.toLocaleString()} {b.unit}</p>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-200">
                      <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500 text-sm">{b.industry.toLocaleString()} {b.unit}</p>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-200">
                      <div className="h-1.5 rounded-full bg-slate-400" style={{ width: `${industryPct}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    {status === 'better' && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <TrendingUp className="h-3 w-3" />Over snitt
                      </span>
                    )}
                    {status === 'worse' && (
                      <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-600">
                        <TrendingDown className="h-3 w-3" />Under snitt
                      </span>
                    )}
                    {status === 'equal' && (
                      <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        <Minus className="h-3 w-3" />Pa snitt
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
