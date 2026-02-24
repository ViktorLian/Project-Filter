'use client';

import { useState } from 'react';
import { Rocket, Sparkles, ChevronRight, Check, ArrowRight, Target } from 'lucide-react';

type Step = { title: string; desc: string; done: boolean };
type Play = { id: string; title: string; tag: string; color: string; steps: Step[] };

const PLAYBOOKS: Play[] = [
  {
    id: 'first-sale', title: 'Lukk ditt første salg raskere', tag: 'Salgsstrategi', color: 'blue',
    steps: [
      { title: 'Sett opp et innhentingsskjema', desc: 'Opprett et skjema med 3-5 sporsmål som kvalifiserer kunden.', done: true },
      { title: 'Aktiver smart oppfølging', desc: 'Koble skjema til automatisk oppfølging etter 48 timer.', done: true },
      { title: 'Lag ditt beste tilbud', desc: 'Bruk Tilbudsbygger for å lage et profesjonelt tilbud.', done: false },
      { title: 'Ring innen 2 timer', desc: 'Ring nye leads innen 2 timer for 3x høyere konvertering.', done: false },
    ],
  },
  {
    id: 'referral', title: 'Bygg et råsterkt anbefalingssystem', tag: 'Vekst', color: 'emerald',
    steps: [
      { title: 'Send tilbakemeldingsskjema etter hvert oppdrag', desc: 'Bruk innebygd feedback etter jobb-fullførelse.', done: false },
      { title: 'Identifiser dine promotører (score 9-10)', desc: 'Filtrer kunder med høy score i Kunder-oversikten.', done: false },
      { title: 'Tilby anbefaling-bonus', desc: 'Send e-post til promotører med bonus per ny kunde de sender.', done: false },
      { title: 'Mål og juster', desc: 'Bruk Analytics for å se effekten etter 30 dager.', done: false },
    ],
  },
  {
    id: 'ai-upsell', title: 'Upsell med AI-innsikt', tag: 'AI + Salg', color: 'purple',
    steps: [
      { title: 'Analyser kundenes kjøpshistorikk', desc: 'Se hvilke kunder som har bestilt til lav pris.', done: false },
      { title: 'Be AI om upsell-forslag', desc: 'Bruk AI Assistent med prompt: "Gi upsell-forslag for [kunde]"', done: false },
      { title: 'Send personalisert tilbud', desc: 'Bruk Kampanje-verktøyet for å sende målrettet e-post.', done: false },
    ],
  },
];

export default function GrowthPlaybookPage() {
  const [plays, setPlays] = useState(PLAYBOOKS);
  const [active, setActive] = useState('first-sale');
  const [generating, setGenerating] = useState(false);
  const [aiPlay, setAiPlay] = useState('');

  function toggleStep(playId: string, stepIdx: number) {
    setPlays(prev => prev.map(p => p.id !== playId ? p : {
      ...p, steps: p.steps.map((s, i) => i === stepIdx ? { ...s, done: !s.done } : s),
    }));
  }

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  async function generatePlay() {
    setGenerating(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Generer en vekst-playbook for et lite servicefirma (håndverk, bygg, renhold). Gi 5 konkrete steg med tittel og beskrivelse. Svar på norsk.',
          history: [],
        }),
      });
      const d = await res.json();
      setAiPlay(d.reply || '');
    } catch { setAiPlay('Kunne ikke generere playbook.'); }
    setGenerating(false);
  }

  const currentPlay = plays.find(p => p.id === active);
  const progress = currentPlay ? Math.round(currentPlay.steps.filter(s => s.done).length / currentPlay.steps.length * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vekst-Playbook</h1>
        <p className="text-slate-500 text-sm mt-0.5">Trinn-for-trinn planer for å vokse virksomheten</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Playbook list */}
        <div className="space-y-3">
          {plays.map(p => {
            const done = p.steps.filter(s => s.done).length;
            return (
              <button key={p.id} onClick={() => setActive(p.id)}
                className={`w-full text-left rounded-xl border p-4 transition-all ${active === p.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${colorMap[p.color] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>{p.tag}</span>
                <p className="font-semibold text-slate-800 text-sm mt-2">{p.title}</p>
                <p className="text-xs text-slate-500 mt-1">{done}/{p.steps.length} steg fullført</p>
                <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                  <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${Math.round(done / p.steps.length * 100)}%` }} />
                </div>
              </button>
            );
          })}
          <button onClick={generatePlay} disabled={generating}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-purple-300 bg-purple-50 py-4 text-sm font-semibold text-purple-600 hover:bg-purple-100 disabled:opacity-50 transition-colors">
            <Sparkles className="h-4 w-4" />
            {generating ? 'Genererer...' : 'Generer AI-playbook'}
          </button>
        </div>

        {/* Active playbook */}
        <div className="lg:col-span-2 space-y-4">
          {currentPlay && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${colorMap[currentPlay.color]}`}>{currentPlay.tag}</span>
                  <h2 className="font-bold text-slate-900 text-lg mt-1">{currentPlay.title}</h2>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{progress}%</p>
                  <p className="text-xs text-slate-500">Fullført</p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="space-y-3">
                {currentPlay.steps.map((step, i) => (
                  <div key={i}
                    onClick={() => toggleStep(currentPlay.id, i)}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${step.done ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${step.done ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                      {step.done && <Check className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${step.done ? 'text-emerald-800 line-through' : 'text-slate-800'}`}>{step.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aiPlay && (
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2 flex items-center gap-1"><Rocket className="h-3.5 w-3.5" />AI-generert playbook</p>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{aiPlay}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
