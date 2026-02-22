'use client';

import { useState } from 'react';
import { Shield, Sparkles, ChevronRight, Lightbulb, MessageSquare } from 'lucide-react';

const COMMON_OBJECTIONS = [
  'Det er for dyrt',
  'Vi har allerede en leverandor',
  'Vi trenger tid til a tenke',
  'Hva om det ikke fungerer?',
  'Vi har ikke budsjett na',
  'Jeg ma diskutere med ledelsen',
];

type Response = { reframe: string; question: string; closer: string };

export default function ObjectionHandlerPage() {
  const [objection, setObjection] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState<Response | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ objection: string; result: Response }[]>([]);

  async function handle() {
    if (!objection.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Du er en erfaren salgstrener. Kunden sier: "${objection}". ${context ? `Kontekst: ${context}.` : ''}
Gi meg:
1. Reframe (omformuler innvendingen positivt, 1 setning)
2. Sporsmalet (et sporsmalet a stille for a forsta dypere behov)
3. Avslutter (en konkret avsluttingssetning)

Format: Reframe: ...\nSporsmalet: ...\nAvslutter: ...
Svar pa norsk.`,
          history: [],
        }),
      });
      const d = await res.json();
      const text: string = d.reply || '';
      const reframe = text.match(/Reframe:\s*(.+)/i)?.[1] ?? '';
      const question = text.match(/Sporsmalet:\s*(.+)/i)?.[1] ?? '';
      const closer = text.match(/Avslutter:\s*(.+)/i)?.[1] ?? '';
      const r = { reframe, question, closer };
      setResult(r);
      setHistory(prev => [{ objection, result: r }, ...prev.slice(0, 4)]);
    } catch {
      setResult({ reframe: 'Feil ved analyse.', question: '', closer: '' });
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Innvendings-Analyzer</h1>
        <p className="text-slate-500 text-sm mt-0.5">Fa AI-hjelp til a hamtere kundens innvendinger effektivt</p>
      </div>

      {/* Input */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-slate-800">Analyser innvending</h2>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Hva sier kunden?</label>
          <textarea
            value={objection}
            onChange={e => setObjection(e.target.value)}
            rows={2}
            placeholder='Eks: "Det er for dyrt sammenlignet med konkurrenten din"'
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Kontekst (valgfri)</label>
          <input
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="Eks: Tilbud pa 95 000 kr for flislegging i 4 bad"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Quick pick */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Vanlige innvendinger:</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_OBJECTIONS.map(o => (
              <button key={o} onClick={() => setObjection(o)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
                {o}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handle} disabled={loading || !objection.trim()}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
          <Sparkles className="h-4 w-4" />
          {loading ? 'Analyserer...' : 'Fa respons-strategi'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 space-y-4">
          <h3 className="font-semibold text-blue-900">Strategi for: "{objection}"</h3>
          {[
            { label: 'Reframe', icon: Lightbulb, val: result.reframe, color: 'text-amber-700 bg-amber-50 border-amber-200' },
            { label: 'Sporsmalet a stille', icon: MessageSquare, val: result.question, color: 'text-purple-700 bg-purple-50 border-purple-200' },
            { label: 'Avsluttingssetning', icon: ChevronRight, val: result.closer, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          ].map(item => item.val ? (
            <div key={item.label} className={`rounded-lg border p-4 ${item.color}`}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1 flex items-center gap-1">
                <item.icon className="h-3.5 w-3.5" />{item.label}
              </p>
              <p className="text-sm font-medium">"{item.val}"</p>
            </div>
          ) : null)}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Tidligere analyser</h2>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-700">"{h.objection}"</p>
                {h.result.reframe && <p className="text-xs text-slate-500 mt-1">{h.result.reframe}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
