'use client';

import { useState } from 'react';
import { TrendingUp, Target, Calendar, ChevronRight, CheckCircle, Circle, Sparkles, Plus, Flag } from 'lucide-react';

interface Milestone {
  id: string;
  label: string;
  done: boolean;
}

interface Quarter {
  id: string;
  label: string;
  revenue: string;
  focus: string;
  milestones: Milestone[];
}

interface Year {
  year: number;
  quarters: Quarter[];
}

const DEFAULT_PLAN: Year[] = [
  {
    year: 1,
    quarters: [
      { id: 'y1q1', label: 'Q1', revenue: '500 000', focus: 'Bygge base', milestones: [
        { id: 'm1', label: 'Sett opp FlowPilot fullt ut', done: true },
        { id: 'm2', label: 'Fa inn 10 nye leads', done: true },
        { id: 'm3', label: 'Definere 3 kjernekunder', done: false },
      ]},
      { id: 'y1q2', label: 'Q2', revenue: '750 000', focus: 'Skalere salg', milestones: [
        { id: 'm4', label: 'Ansette forste selger', done: false },
        { id: 'm5', label: 'Automatisere oppfølging', done: false },
        { id: 'm6', label: 'Lansere lojalitetsprogram', done: false },
      ]},
      { id: 'y1q3', label: 'Q3', revenue: '1 000 000', focus: 'Konsolidering', milestones: [
        { id: 'm7', label: 'Na 50 aktive kunder', done: false },
        { id: 'm8', label: 'NPS > 70', done: false },
      ]},
      { id: 'y1q4', label: 'Q4', revenue: '1 500 000', focus: 'Vekst-push', milestones: [
        { id: 'm9', label: 'Lansere kampanje till eksisterende', done: false },
        { id: 'm10', label: 'Ar 1 evaluering', done: false },
      ]},
    ],
  },
  {
    year: 2,
    quarters: [
      { id: 'y2q1', label: 'Q1', revenue: '2 000 000', focus: 'Nytt marked', milestones: [
        { id: 'm11', label: 'Ekspandere til ny geografi', done: false },
        { id: 'm12', label: 'Partnerskapsavtale', done: false },
      ]},
      { id: 'y2q2', label: 'Q2', revenue: '2 500 000', focus: 'Team-vekst', milestones: [
        { id: 'm13', label: 'Ansette nr. 2 i teamet', done: false },
        { id: 'm14', label: 'CRM-rutiner pa plass', done: false },
      ]},
      { id: 'y2q3', label: 'Q3', revenue: '3 000 000', focus: 'Produkt-modenhet', milestones: [
        { id: 'm15', label: 'Standard tilbudspakke laget', done: false },
      ]},
      { id: 'y2q4', label: 'Q4', revenue: '3 500 000', focus: 'Rekord-kvartal', milestones: [
        { id: 'm16', label: 'Break-even pa alle ansatte', done: false },
        { id: 'm17', label: 'Ar 2 evaluering', done: false },
      ]},
    ],
  },
  {
    year: 3,
    quarters: [
      { id: 'y3q1', label: 'Q1', revenue: '4 500 000', focus: 'Marked-ledelse', milestones: [
        { id: 'm18', label: 'Kjent merkevare i bransjen', done: false },
      ]},
      { id: 'y3q2', label: 'Q2', revenue: '5 500 000', focus: 'Franchise/skala', milestones: [
        { id: 'm19', label: 'Vurder franchisemodell', done: false },
      ]},
      { id: 'y3q3', label: 'Q3', revenue: '6 500 000', focus: 'Systembygging', milestones: [
        { id: 'm20', label: 'Full SOP-dokumentasjon', done: false },
      ]},
      { id: 'y3q4', label: 'Q4', revenue: '8 000 000', focus: 'Exit-klar', milestones: [
        { id: 'm21', label: 'Verdsettelse evaluering', done: false },
        { id: 'm22', label: '3-ar feiring', done: false },
      ]},
    ],
  },
];

const YEAR_COLORS = ['blue', 'purple', 'emerald'];

export default function GrowthPlannerPage() {
  const [plan, setPlan] = useState<Year[]>(DEFAULT_PLAN);
  const [activeYear, setActiveYear] = useState(0);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTips, setAiTips] = useState<string[]>([]);

  const toggleMilestone = (yearIdx: number, qId: string, mId: string) => {
    setPlan(prev => prev.map((yr, yi) => yi !== yearIdx ? yr : {
      ...yr,
      quarters: yr.quarters.map(q => q.id !== qId ? q : {
        ...q,
        milestones: q.milestones.map(m => m.id !== mId ? m : { ...m, done: !m.done }),
      }),
    }));
  };

  const totalMilestones = plan.flatMap(y => y.quarters.flatMap(q => q.milestones));
  const doneMilestones = totalMilestones.filter(m => m.done);
  const progress = Math.round((doneMilestones.length / totalMilestones.length) * 100);

  const getAiTips = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setAiTips([
      `Fokuser pa gjentakende inntekter (abonnement) fremfor enkeltoppdrag — det gir deg mer forutsigbar vekst mot ar-3-malet.`,
      `Di storste risiko: kompetanseflaskehalsen. Dokumenter prosesser lopenende sa vekst ikke avhenger av en enkelt person.`,
      `For a na 8 MNOK i ar 3 ma snittkunden din vaere verdt ca. 40 000 kr/ar — vurder arskontrakter for toppsegmentet.`,
    ]);
    setAiLoading(false);
  };

  const colorMap: Record<string, string> = {
    blue: 'border-blue-300 bg-blue-50',
    purple: 'border-purple-300 bg-purple-50',
    emerald: 'border-emerald-300 bg-emerald-50',
  };
  const tabColorMap: Record<string, string> = {
    blue: 'bg-blue-600 text-white',
    purple: 'bg-purple-600 text-white',
    emerald: 'bg-emerald-600 text-white',
  };

  const yr = plan[activeYear];
  const col = YEAR_COLORS[activeYear];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <h1 className="text-2xl font-bold text-slate-900">Vekstplan</h1>
        </div>
        <p className="text-slate-500 text-sm">3-ars kvartalsvise milestoner, omsetningsgmaler og fokusomrader. Kryss av nar du nar dem.</p>
      </div>

      {/* Global progress */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-slate-700">Total framgang, 3 ar</p>
            <p className="text-xs text-slate-500">{doneMilestones.length} av {totalMilestones.length} milestoner fullført</p>
          </div>
          <span className="text-2xl font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Year tabs */}
      <div className="flex gap-2">
        {plan.map((y, i) => (
          <button key={i} onClick={() => setActiveYear(i)}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold transition ${activeYear === i ? tabColorMap[YEAR_COLORS[i]] : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <span className="block text-xs opacity-70 mb-0.5">AR {y.year}</span>
            <span>Mål: {y.quarters[3]?.revenue} kr</span>
          </button>
        ))}
      </div>

      {/* Quarters */}
      <div className="grid sm:grid-cols-2 gap-4">
        {yr.quarters.map(q => {
          const doneCount = q.milestones.filter(m => m.done).length;
          return (
            <div key={q.id} className={`rounded-xl border p-4 ${colorMap[col]}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{q.label}</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{q.focus}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Mal omsetning</p>
                  <p className="text-sm font-bold text-slate-900">{q.revenue} kr</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {q.milestones.map(m => (
                  <button key={m.id} onClick={() => toggleMilestone(activeYear, q.id, m.id)}
                    className="w-full flex items-center gap-2 text-left cursor-pointer hover:opacity-80 transition">
                    {m.done
                      ? <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                      : <Circle className="h-4 w-4 flex-shrink-0 text-slate-300" />}
                    <span className={`text-sm ${m.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{m.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/50 text-xs text-slate-500 flex justify-between">
                <span>{doneCount}/{q.milestones.length} fullført</span>
                {doneCount === q.milestones.length && <span className="text-emerald-600 font-semibold">Fullført!</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI tips */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <h2 className="text-sm font-bold text-slate-900">AI Vekstrad</h2>
        </div>
        <div className="flex gap-2">
          <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && getAiTips()}
            placeholder="Hva er din storste bekymring for veksten? (eks: vi vet ikke hvem vi skal selge til)"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
          <button onClick={getAiTips} disabled={aiLoading}
            className="flex-shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50">
            {aiLoading ? '...' : 'Analyser'}
          </button>
        </div>
        {aiTips.length > 0 && (
          <div className="mt-4 space-y-2">
            {aiTips.map((t, i) => (
              <div key={i} className="flex gap-3 rounded-xl bg-purple-50 border border-purple-100 p-3">
                <Flag className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">{t}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
