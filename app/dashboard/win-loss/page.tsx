'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Trophy, XCircle, Brain, ChevronRight, Sparkles } from 'lucide-react';

const WINS = [
  { id: '1', customer: 'Byggmester Hansen', value: 85000, reason: 'Rask respons, god pris', date: '2025-01-15' },
  { id: '2', customer: 'Villa Solberg', value: 42000, reason: 'Anbefalte fra nabo, profesjonell befaring', date: '2025-01-10' },
  { id: '3', customer: 'Eiendom Nilsen', value: 128000, reason: 'Laveste tilbud, godt omdoemme', date: '2024-12-18' },
];
const LOSSES = [
  { id: '1', customer: 'Bygg & Bo', value: 67000, reason: 'Dyrere enn konkurrent', date: '2025-01-12' },
  { id: '2', customer: 'Hus Larsen', value: 35000, reason: 'Konkurrent leverte raskere', date: '2025-01-08' },
];

export default function WinLossPage() {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const totalWon = WINS.reduce((s, w) => s + w.value, 0);
  const totalLost = LOSSES.reduce((s, l) => s + l.value, 0);
  const winRate = Math.round((WINS.length / (WINS.length + LOSSES.length)) * 100);

  async function getAnalysis() {
    setLoading(true);
    const prompt = `Analyser disse vinn/tap-dataene for et servicefirma og gi konkrete anbefalinger:
Vunnet: ${WINS.map(w => `${w.customer} (${w.value} kr) - Arsak: ${w.reason}`).join(', ')}
Tapt: ${LOSSES.map(l => `${l.customer} (${l.value} kr) - Arsak: ${l.reason}`).join(', ')}
Total vinnerrate: ${winRate}%
Hva monsteret viser og hva de bor fokusere pa for a vinne mer. Vær konkret og handlingsorientert. Maks 200 ord.`;
    try {
      const res = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: prompt, history: [] }) });
      const d = await res.json();
      setAnalysis(d.reply || 'Ingen analyse tilgjengelig');
    } catch { setAnalysis('Kunne ikke hente analyse. Sjekk OpenAI-konfigurasjon.'); }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vinn/Tap Analyse</h1>
        <p className="text-slate-500 text-sm mt-0.5">Forsta hva som driver seire og tap i salgsprosessen</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Vunnet', val: WINS.length, sub: `${(totalWon/1000).toFixed(0)} 000 kr`, icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Tapt', val: LOSSES.length, sub: `${(totalLost/1000).toFixed(0)} 000 kr`, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Vinnerrate', val: `${winRate}%`, sub: 'Av alle tilbud', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Tapt verdi', val: `${(totalLost/1000).toFixed(0)}K`, sub: 'Potensial tapte', icon: TrendingDown, color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            <p className="text-xs font-medium text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Wins */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-emerald-600" />
            <h2 className="font-semibold text-slate-800">Vunnede saker</h2>
          </div>
          <div className="space-y-3">
            {WINS.map(w => (
              <div key={w.id} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{w.customer}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{w.reason}</p>
                </div>
                <span className="text-sm font-bold text-emerald-700">+{(w.value/1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>

        {/* Losses */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="h-5 w-5 text-red-500" />
            <h2 className="font-semibold text-slate-800">Tapte saker</h2>
          </div>
          <div className="space-y-3">
            {LOSSES.map(l => (
              <div key={l.id} className="flex items-start gap-3 p-3 rounded-lg bg-red-50">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{l.customer}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{l.reason}</p>
                </div>
                <span className="text-sm font-bold text-red-600">-{(l.value/1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="rounded-xl border border-purple-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <h2 className="font-semibold text-slate-800">AI Analyse</h2>
          </div>
          <button onClick={getAnalysis} disabled={loading} className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition-colors">
            <Sparkles className="h-4 w-4" />
            {loading ? 'Analyserer...' : 'Analyser et monster'}
          </button>
        </div>
        {analysis ? (
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{analysis}</p>
        ) : (
          <p className="text-sm text-slate-400">Klikk "Analyser et monster" for a fa AI-innsikt basert pa dine vinn/tap-data.</p>
        )}
      </div>
    </div>
  );
}
