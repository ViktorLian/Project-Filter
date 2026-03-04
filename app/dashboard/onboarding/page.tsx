'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Zap, Star, Users, Bot, Bell, Loader2, Layers } from 'lucide-react';
import { QUIZ_QUESTIONS, NICHES, matchNiche, getNiche } from '@/lib/niches';

type QuizAnswers = Record<string, string>;

const TOTAL_STEPS = QUIZ_QUESTIONS.length + 2; // welcome + quiz questions + result

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0=welcome, 1..N=quiz, N+1=result
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [saving, setSaving] = useState(false);
  const [matchedNicheId, setMatchedNicheId] = useState<string | null>(null);

  const progress = (step / (TOTAL_STEPS - 1)) * 100;
  const isQuizStep = step >= 1 && step <= QUIZ_QUESTIONS.length;
  const currentQuestion = isQuizStep ? QUIZ_QUESTIONS[step - 1] : null;
  const isResultStep = step === QUIZ_QUESTIONS.length + 1;

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    if (step < QUIZ_QUESTIONS.length) {
      setStep(s => s + 1);
    } else {
      // Last quiz question answered — compute match and go to result
      const nicheId = matchNiche(newAnswers);
      setMatchedNicheId(nicheId);
      setStep(QUIZ_QUESTIONS.length + 1);
    }
  };

  async function handleConfirmNiche(nicheId: string) {
    setSaving(true);
    try {
      await fetch('/api/onboarding/niche', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicheId }),
      });
    } catch {
      // non-critical, continue
    }
    setSaving(false);
    router.push('/dashboard');
  }

  const matchedNiche = matchedNicheId ? getNiche(matchedNicheId) : null;

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <span className="text-white font-bold text-sm">FP</span>
          </div>
          <span className="text-xl font-bold text-white">FlowPilot</span>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">
              {step === 0 ? 'Kom i gang' : isResultStep ? 'Din nisje' : `Spørsmål ${step} av ${QUIZ_QUESTIONS.length}`}
            </span>
            <span className="text-xs text-slate-500">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 w-full rounded-full bg-slate-800">
            <div className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl shadow-black/40">

          {/* Step 0 – Velkommen */}
          {step === 0 && (
            <div className="p-8 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 mb-5 shadow-lg shadow-blue-900/40">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-3">
                Velkommen til FlowPilot
              </h1>
              <p className="text-slate-400 leading-relaxed mb-8">
                Svar på 4 raske spørsmål — vi konfigurerer systemet ditt automatisk for din bransje.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { label: '4 spørsmål', emoji: '⚡' },
                  { label: 'AI-match', emoji: '🤖' },
                  { label: 'Klar på sekunder', emoji: '🚀' },
                ].map(f => (
                  <div key={f.label} className="rounded-xl bg-slate-800 border border-slate-700 p-3 text-center">
                    <div className="text-2xl mb-1">{f.emoji}</div>
                    <p className="text-xs font-medium text-slate-300">{f.label}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep(1)}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 font-bold text-white hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
              >
                Start quiz <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Quiz steps */}
          {isQuizStep && currentQuestion && (
            <div className="p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">
                  Spørsmål {step} av {QUIZ_QUESTIONS.length}
                </p>
                <h2 className="text-xl font-bold text-white">{currentQuestion.question}</h2>
              </div>

              <div className="space-y-2.5">
                {currentQuestion.options.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(currentQuestion.id, opt.value)}
                    className="w-full flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-800 hover:border-blue-500 hover:bg-slate-700 p-4 text-left transition-all group"
                  >
                    <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-100 group-hover:text-white">{opt.label}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition -translate-x-1 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>

              {step > 1 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="mt-5 text-sm text-slate-500 hover:text-slate-300 transition"
                >
                  ← Tilbake
                </button>
              )}
            </div>
          )}

          {/* Result step */}
          {isResultStep && matchedNiche && (
            <div className="p-8">
              <div className="text-center mb-6">
                <div
                  className="inline-flex h-20 w-20 items-center justify-center rounded-2xl mb-4 text-4xl"
                  style={{ backgroundColor: matchedNiche.color + '22', border: `1px solid ${matchedNiche.color}44` }}
                >
                  <Layers className="h-8 w-8 text-blue-400" />
                </div>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">Din nisje er klar</p>
                <h2 className="text-2xl font-extrabold text-white">{matchedNiche.name}</h2>
                <p className="text-slate-400 mt-1 text-sm">{matchedNiche.tagline}</p>
              </div>

              {/* Features preview */}
              <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 mb-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                  Dine topp-funksjoner
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {matchedNiche.nicheFeatures.slice(0, 6).map(f => (
                    <div key={f.name} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-300 truncate">{f.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="rounded-xl bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-700/40 p-4 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Tilpasset nisje-pakke</p>
                  <p className="text-white font-bold">{matchedNiche.name}-pakken</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-white">{matchedNiche.priceMonthly.toLocaleString('nb-NO')} kr</p>
                  <p className="text-xs text-slate-400">per måned</p>
                </div>
              </div>

              <button
                onClick={() => handleConfirmNiche(matchedNiche.id)}
                disabled={saving}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 font-bold text-white hover:opacity-90 disabled:opacity-60 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
              >
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Lagrer...</> : <>Gå til dashboard <ArrowRight className="h-5 w-5" /></>}
              </button>

              <p className="text-center text-xs text-slate-500 mt-3">
                Du kan endre nisje i innstillinger når som helst
              </p>

              {/* Show other niches */}
              <div className="mt-5 border-t border-slate-800 pt-4">
                <p className="text-xs text-slate-500 mb-3">Passer ikke? Velg manuelt:</p>
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                  {NICHES.filter(n => n.id !== matchedNiche.id).map(n => (
                    <button
                      key={n.id}
                      onClick={() => setMatchedNicheId(n.id)}
                      className="rounded-lg bg-slate-800 border border-slate-700 hover:border-blue-500 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition"
                    >
                      {n.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          {isResultStep ? 'Ferdig! 🎉' : `Steg ${step + 1} av ${TOTAL_STEPS}`}
        </p>
      </div>
    </div>
  );
}
