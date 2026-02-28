'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ArrowUpRight, Zap, Target, BarChart3, Shield, Activity, ChevronRight } from 'lucide-react';

type ScoreDimension = {
  key: string;
  label: string;
  score: number;
  max: number;
  status: 'green' | 'yellow' | 'red';
  insight: string;
  action: string;
  href: string;
  icon: string;
};

type ScoreData = {
  total: number;
  grade: string;
  gradeColor: string;
  dimensions: ScoreDimension[];
  trend: number;
  updatedAt: string;
};

function ScoreRing({ score, size = 140 }: { score: number; size?: number }) {
  const r = size / 2 - 12;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100) / 100;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth={10} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  );
}

const ICONS: Record<string, React.ElementType> = {
  TrendingUp, BarChart3, Activity, Shield, CheckCircle, Target
};

export default function FlowPilotScorePage() {
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    try {
      const r = await fetch('/api/fp-score');
      if (r.ok) setData(await r.json());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="text-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white font-bold text-lg">FP</span>
        </div>
        <p className="text-slate-400 text-sm">Beregner FlowPilot Score...</p>
      </div>
    </div>
  );

  const score = data?.total ?? 0;
  const grade = data?.grade ?? 'N/A';
  const gradeColor = data?.gradeColor ?? 'text-slate-400';

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">FP</span>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">FlowPilot Score™</span>
          </div>
          <h1 className="text-3xl font-black text-white">Din bedrifts driftscore</h1>
          <p className="text-slate-400 text-sm mt-1">Beregnet live fra alle dine data — som en kredittscore for bedriften</p>
        </div>
        <button onClick={load} disabled={refreshing}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm border border-slate-700 transition">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Oppdater
        </button>
      </div>

      {/* Main score */}
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl border border-slate-700/50 p-8 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5" />
        <div className="relative flex items-center gap-8 flex-wrap">
          <div className="relative flex-shrink-0">
            <ScoreRing score={score} size={160} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-white">{score}</span>
              <span className="text-xs text-slate-400 font-medium">av 100</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-5xl font-black ${gradeColor}`}>{grade}</span>
              {(data?.trend ?? 0) !== 0 && (
                <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${(data?.trend ?? 0) > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {(data?.trend ?? 0) > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {Math.abs(data?.trend ?? 0)} pst
                </div>
              )}
            </div>
            <p className="text-slate-300 text-lg font-medium mb-1">
              {score >= 80 ? 'Bedriften din presterer svært bra!' : score >= 60 ? 'Solid drift — rom for forbedring.' : score >= 40 ? 'Treffer svake punkter — handle nå.' : 'Kritisk - umiddelbar oppmerksomhet kreves.'}
            </p>
            <p className="text-slate-500 text-sm">Sist oppdatert: nå</p>
          </div>

          {/* Score breakdown bar */}
          <div className="w-full mt-4">
            <div className="flex rounded-full overflow-hidden h-3 bg-slate-800">
              {(data?.dimensions ?? []).map(d => (
                <div key={d.key}
                  style={{ width: `${(d.score / d.max) * (100 / (data?.dimensions?.length ?? 1))}%`,
                    backgroundColor: d.status === 'green' ? '#10b981' : d.status === 'yellow' ? '#f59e0b' : '#ef4444' }}
                  title={`${d.label}: ${d.score}/${d.max}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dimensions grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {(data?.dimensions ?? []).map(d => {
          const Icon = ICONS[d.icon] ?? Activity;
          const pct = Math.round((d.score / d.max) * 100);
          const statusColors = {
            green: { ring: 'ring-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'bg-emerald-500', badge: 'bg-emerald-500/20 text-emerald-400' },
            yellow: { ring: 'ring-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400', bar: 'bg-amber-500', badge: 'bg-amber-500/20 text-amber-400' },
            red: { ring: 'ring-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400', bar: 'bg-red-500', badge: 'bg-red-500/20 text-red-400' },
          }[d.status];

          return (
            <div key={d.key} className={`bg-slate-800/60 rounded-2xl border border-slate-700/50 ring-1 ${statusColors.ring} p-5 hover:bg-slate-800/80 transition`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-xl ${statusColors.bg}`}>
                  <Icon className={`h-5 w-5 ${statusColors.text}`} />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors.badge}`}>
                  {d.status === 'green' ? 'OK' : d.status === 'yellow' ? 'Advarsel' : 'Kritisk'}
                </span>
              </div>
              <h3 className="font-bold text-white mb-1">{d.label}</h3>
              <div className="flex items-end gap-2 mb-2">
                <span className={`text-3xl font-black ${statusColors.text}`}>{d.score}</span>
                <span className="text-slate-500 text-sm mb-0.5">/ {d.max}</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full mb-3">
                <div className={`h-1.5 rounded-full transition-all ${statusColors.bar}`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-slate-400 text-xs mb-3 leading-relaxed">{d.insight}</p>
              {d.action && (
                <Link href={d.href}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition">
                  <Zap className="h-3 w-3" /> {d.action} <ChevronRight className="h-3 w-3 ml-auto" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* What this means */}
      <div className="bg-slate-800/40 rounded-2xl border border-slate-700/40 p-6">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-400" /> Hva betyr scoren din?
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { range: '80–100', label: 'Elite', desc: 'Top 10% av norske SMB', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
            { range: '60–79', label: 'Solid', desc: 'Over snittet', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
            { range: '40–59', label: 'Middels', desc: 'Forbedringspotensial', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
            { range: '0–39', label: 'Kritisk', desc: 'Handle umiddelbart', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
          ].map(g => (
            <div key={g.range} className={`rounded-xl border p-3 ${g.bg}`}>
              <span className={`text-xs font-bold ${g.color}`}>{g.range}</span>
              <p className={`font-bold text-sm ${g.color} mt-0.5`}>{g.label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{g.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-slate-500 text-xs mt-4">
          FlowPilot Score™ beregnes fra reell aktivitet: leads, pipeline, likviditet, compliance, oppgaver og risiko.
          Scoren oppdateres automatisk når du bruker systemet.
        </p>
      </div>
    </div>
  );
}
