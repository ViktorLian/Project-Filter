'use client';

import { useState } from 'react';
import { Shield, Sparkles, ChevronRight, Lightbulb, MessageSquare, Copy, Check } from 'lucide-react';

const COMMON_OBJECTIONS = [
  'Det er for dyrt',
  'Vi har allerede en leverandÃ¸r',
  'Vi trenger tid til Ã¥ tenke',
  'Hva om det ikke fungerer?',
  'Vi har ikke budsjett nÃ¥',
  'Jeg mÃ¥ diskutere med ledelsen',
  'Dere er ukjente for oss',
  'Vi gjÃ¸r det selv',
];

type Response = {
  reframe: string;
  question: string;
  closer: string;
  replies: string[];
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button onClick={copy} className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors shrink-0">
      {copied ? <><Check className="h-3 w-3 text-green-500" /> Kopiert</> : <><Copy className="h-3 w-3" /> Kopier</>}
    </button>
  );
}

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
          message: `Du er en erfaren salgstrener for norske hÃ¥ndverks- og servicebedrifter. Kunden sier: "${objection}". ${context ? `Kontekst: ${context}.` : ''}

Gi meg NÃ˜YAKTIG dette formatet (bruk disse overskriftene):
Reframe: [omformuler innvendingen positivt i 1 setning]
SpÃ¸rsmÃ¥l: [ett spÃ¸rsmÃ¥l Ã¥ stille for Ã¥ forstÃ¥ dypere behov]
Avslutter: [en konkret avsluttingssetning]
Svar1: [et konkret eksempel pÃ¥ hva du kan si, 2-3 setninger, naturlig samtaletone]
Svar2: [et alternativt eksempel pÃ¥ hva du kan si, litt annerledes vinkling]

Svar pÃ¥ norsk bokmÃ¥l. VÃ¦r konkret og naturlig.`,
          history: [],
        }),
      });
      const d = await res.json();
      const text: string = d.reply || '';
      const reframe = text.match(/Reframe:\s*(.+)/i)?.[1]?.trim() ?? '';
      const question = text.match(/SpÃ¸rsmÃ¥l:\s*(.+)/i)?.[1]?.trim() ?? '';
      const closer = text.match(/Avslutter:\s*(.+)/i)?.[1]?.trim() ?? '';
      const svar1 = text.match(/Svar1:\s*(.+)/i)?.[1]?.split('\n')[0]?.trim() ?? '';
      const svar2 = text.match(/Svar2:\s*(.+)/i)?.[1]?.split('\n')[0]?.trim() ?? '';
      const replies = [svar1, svar2].filter(Boolean);
      const r: Response = { reframe, question, closer, replies };
      setResult(r);
      setHistory(prev => [{ objection, result: r }, ...prev.slice(0, 4)]);
    } catch {
      setResult({ reframe: 'Feil ved analyse â€“ sjekk Gemini API-nÃ¸kkel.', question: '', closer: '', replies: [] });
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Innvendings-Analysator</h1>
        <p className="text-slate-500 text-sm mt-0.5">FÃ¥ konkrete svar-forslag og strategi for Ã¥ hÃ¥ndtere kundens innvendinger</p>
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
          <label className="block text-xs font-medium text-slate-600 mb-1">Kontekst (anbefalt â€“ jo mer du legger inn, jo bedre svar)</label>
          <input
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="Eks: Tilbud pÃ¥ 95 000 kr for flislegging i 4 bad. Konkurrent tilbyr 80 000 kr."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-400 mt-1">ðŸ’¡ Beskriv gjerne bransjen din, kunden, prisen, og hva konkurrenten tilbyr â€“ da treffer AI-en mye bedre</p>
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
          {loading ? 'Genererer strategi...' : 'FÃ¥ respons-strategi + eksempel-svar'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 space-y-4">
          <h3 className="font-semibold text-blue-900">Strategi for: "{objection}"</h3>

          {/* Strategy cards */}
          <div className="grid gap-3">
            {[
              { label: 'Reframe innvendingen', icon: Lightbulb, val: result.reframe, color: 'text-amber-700 bg-amber-50 border-amber-200' },
              { label: 'SpÃ¸rsmÃ¥l Ã¥ stille', icon: MessageSquare, val: result.question, color: 'text-purple-700 bg-purple-50 border-purple-200' },
              { label: 'Avsluttingssetning', icon: ChevronRight, val: result.closer, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
            ].map(item => item.val ? (
              <div key={item.label} className={`rounded-lg border p-4 ${item.color}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1">
                    <item.icon className="h-3.5 w-3.5" />{item.label}
                  </p>
                  <CopyButton text={item.val} />
                </div>
                <p className="text-sm font-medium">"{item.val}"</p>
              </div>
            ) : null)}
          </div>

          {/* AI example replies */}
          {result.replies.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Eksempel-svar du kan bruke</p>
              {result.replies.map((reply, i) => (
                <div key={i} className="rounded-lg border border-blue-300 bg-white p-4">
                  <div className="flex items-start gap-2">
                    <div className="shrink-0 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</div>
                    <p className="text-sm text-slate-700 flex-1 leading-relaxed">"{reply}"</p>
                    <CopyButton text={reply} />
                  </div>
                </div>
              ))}
              <p className="text-xs text-slate-400">Klikk "Kopier" for Ã¥ bruke svaret direkte i chat, SMS eller telefon</p>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Tidligere analyser</h2>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="rounded-lg bg-slate-50 px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => { setObjection(h.objection); setResult(h.result); }}>
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
