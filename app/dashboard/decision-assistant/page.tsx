'use client';

import { useState } from 'react';
import {
  HelpCircle, TrendingUp, TrendingDown, BarChart3, Send, Loader2,
  CheckCircle, XCircle, ArrowRight, Lightbulb, Clock, DollarSign, Users
} from 'lucide-react';

const QUICK_QUESTIONS = [
  'Bor jeg ansette en person til na?',
  'Bor jeg oke prisen pa tjenestene mine?',
  'Bor jeg investere i ny utstyr denne maneden?',
  'Bor jeg sette av mer tid til markedsforing?',
  'Bor jeg ta pa meg dette storprosjektet?',
  'Bor jeg tilby rabatt til denne kunden?',
];

const DEMO_DECISIONS: { q: string; pros: string[]; cons: string[]; rec: string; confScore: number }[] = [
  {
    q: 'Bor jeg ansette en person til na?',
    pros: [
      'Ordreboking er 87% full siste 3 mnd — kapasiteten er et flaskehals',
      'Du mister estimert 2-3 jobber per mnd pa grunn av manglende kapasitet',
      'Lonnskostnaden (+45 000 kr/mnd) dekkes allerede av tapte inntekter',
    ],
    cons: [
      'Kontantstrom er -12% siste mnd — buffer bor byes opp forst',
      'Ansettelse tar 4-8 uker — ma startes umiddelbart',
      'Ukjent risiko: ny ansatt kan svekke kvalitet kortsiktig',
    ],
    rec: 'Anbefalingen er JA — men vent 30 dager til kontantstrommen er stabilisert. Start annonsering na slik at du er klar til a ansette neste maned.',
    confScore: 74,
  },
];

interface Answer {
  pros: string[];
  cons: string[];
  rec: string;
  confScore: number;
}

export default function DecisionAssistantPage() {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);

  const analyze = async (q = question) => {
    if (!q.trim()) return;
    setQuestion(q);
    setLoading(true);
    setAnswer(null);
    await new Promise(r => setTimeout(r, 1800));
    const demo = DEMO_DECISIONS.find(d => d.q === q);
    if (demo) {
      setAnswer({ pros: demo.pros, cons: demo.cons, rec: demo.rec, confScore: demo.confScore });
    } else {
      setAnswer({
        pros: [
          'Kan forsterke posisjon i markedet hvis timing er riktig',
          'Frigjor kapasitet pa et omrade med vist ettersporsrel',
          'Konsistent med kortsiktig mal om vekst',
        ],
        cons: [
          'Risiko: usikkert marked de neste 2-3 mnd',
          'Krever initial investering med uklart tidsperspektiv for ROI',
          'Alternativkostnad: ressurser bindes opp fra andre muligheter',
        ],
        rec: 'Moderat anbefaling. Gjennomfor beslutningen hvis du har 3+ maneders okonomisk buffer og klar operasjonsplan. Sett en tydelig stoppunkt pa 60 dager for evaluering.',
        confScore: 62,
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="h-5 w-5 text-blue-500" />
          <h1 className="text-2xl font-bold text-slate-900">Beslutningsassistent</h1>
        </div>
        <p className="text-slate-500 text-sm">Stil et beslutningsspørsmål — fa databaserte fordeler, ulemper og anbefaling.</p>
      </div>

      {/* Input */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <label className="text-xs font-semibold text-slate-500">Hva lurer du pa?</label>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          rows={2}
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="Bor jeg ansette, oke prisen, investere i utstyr...?"
        />
        <label className="text-xs font-semibold text-slate-500 mt-3 block">Ekstra kontekst (valgfritt)</label>
        <textarea
          value={context}
          onChange={e => setContext(e.target.value)}
          rows={2}
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="F.eks. vi har 3 ansatte, 2 mnd buffer i kassen, oppdragsboking er full..."
        />
        <button onClick={() => analyze()}
          disabled={loading || !question.trim()}
          className="mt-4 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyserer...</> : <><Send className="h-4 w-4" /> Analyser beslutning</>}
        </button>
      </div>

      {/* Quick questions */}
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-2">Vanlige spørsmål</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map(q => (
            <button key={q} onClick={() => analyze(q)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-blue-300 hover:text-blue-700 transition">
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Answer */}
      {loading && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-8 text-center">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-blue-700">Analyserer bedriftsdata og kontekst...</p>
        </div>
      )}

      {answer && !loading && (
        <div className="space-y-4">
          {/* Confidence */}
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 mb-1">Analysetillit</p>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: `${answer.confScore}%` }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-700">{answer.confScore}%</p>
          </div>

          {/* Pros & Cons */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
              <div className="flex items-center gap-1.5 mb-3">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-700">Argumenter FOR</p>
              </div>
              <ul className="space-y-2">
                {answer.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <ArrowRight className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
              <div className="flex items-center gap-1.5 mb-3">
                <XCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm font-semibold text-red-700">Argumenter MOT</p>
              </div>
              <ul className="space-y-2">
                {answer.cons.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <ArrowRight className="h-3 w-3 text-red-400 mt-0.5 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendation */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-blue-800">Anbefaling</p>
            </div>
            <p className="text-sm text-blue-900 leading-relaxed">{answer.rec}</p>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Dette er et beslutningsverktoy — den endelige avgjorselen er alltid din.
          </p>
        </div>
      )}
    </div>
  );
}
