'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle, ArrowRight, Zap, Bot, Calendar, Users,
  DollarSign, TrendingUp, Building2, Mail, Phone,
  BarChart3, Clock, Target, FileText, Link, Star, Bell
} from 'lucide-react';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS = [
  { n: 1, label: 'Velkommen' },
  { n: 2, label: 'Om bedriften' },
  { n: 3, label: 'Koble verktoy' },
  { n: 4, label: 'Mal' },
  { n: 5, label: 'Aktiver' },
  { n: 6, label: 'Ferdig' },
];

const SELLS_OPTIONS = ['Tjenester til bedrifter', 'Tjenester til privatpersoner', 'Produkter', 'Konsulent/radgivning', 'Bygg og anlegg'];
const CUSTOMER_OPTIONS = ['Privatpersoner (B2C)', 'Sma bedrifter', 'Store bedrifter', 'Kommuner/offentlig'];
const LEAD_OPTIONS = ['Jungeltelegrafen', 'Google / SEO', 'Facebook / Instagram', 'Messe / nettverk', 'Ingen fast kanal'];
const GOAL_OPTIONS = [
  { id: 'leads', label: 'Flere leads', icon: Target },
  { id: 'meetings', label: 'Flere mter', icon: Calendar },
  { id: 'sales', label: 'Mer salg', icon: TrendingUp },
  { id: 'less-admin', label: 'Mindre manuelt arbeid', icon: Clock },
];
const TOOLS = [
  { id: 'email', label: 'E-post', icon: Mail, desc: 'Send automatiske e-poster til leads' },
  { id: 'calendar', label: 'Kalender', icon: Calendar, desc: 'Synkroniser bookinger og pamiannelser' },
  { id: 'leads', label: 'Leads', icon: Users, desc: 'Automatisk lead-scoring og oppfølging' },
  { id: 'ads', label: 'Annonser', icon: BarChart3, desc: 'Koble Facebook/Google Ads (valgfritt)' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [answers, setAnswers] = useState({
    sells: '',
    customers: [] as string[],
    leads: '',
    connectedTools: [] as string[],
    goals: [] as string[],
  });

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const toggle = (key: 'customers' | 'connectedTools' | 'goals', val: string) => {
    setAnswers(p => ({
      ...p,
      [key]: p[key].includes(val) ? p[key].filter(x => x !== val) : [...p[key], val],
    }));
  };

  const next = () => setStep(s => Math.min(s + 1, 6) as Step);
  const back = () => setStep(s => Math.max(s - 1, 1) as Step);
  const finish = () => router.push('/dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
            <span className="text-white font-bold">FP</span>
          </div>
          <span className="text-xl font-bold text-slate-900">FlowPilot</span>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {STEPS.map(s => (
              <div key={s.n} className="flex flex-col items-center gap-1">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    s.n < step
                      ? 'bg-emerald-500 text-white'
                      : s.n === step
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {s.n < step ? <CheckCircle className="h-4 w-4" /> : s.n}
                </div>
                <span className="text-[10px] text-slate-400 hidden sm:block">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200 mt-2">
            <div className="h-1.5 rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-lg border border-slate-200 overflow-hidden">
          {/* Step 1 – Velkommen */}
          {step === 1 && (
            <div className="p-8 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 mb-5">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-3">
                Velkommen til FlowPilot
              </h1>
              <p className="text-slate-600 leading-relaxed mb-8">
                La oss sette opp systemet ditt pa 5 minutter — sa du kan begynne a fa flere kunder i dag.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Clock, label: '5 minutter' },
                  { icon: Bot, label: 'AI klar' },
                  { icon: TrendingUp, label: 'Mer salg' },
                ].map(f => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} className="rounded-xl bg-slate-50 p-3 text-center">
                      <Icon className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                      <p className="text-xs font-medium text-slate-700">{f.label}</p>
                    </div>
                  );
                })}
              </div>
              <button onClick={next} className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white hover:bg-blue-700 transition flex items-center justify-center gap-2">
                Start oppsett <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Step 2 – Om bedriften */}
          {step === 2 && (
            <div className="p-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 mb-4">
                <Building2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Fortell litt om bedriften din</h2>
              <p className="text-slate-500 text-sm mb-6">Vi tilpasser systemet basert pa svarene dine.</p>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Hva selger du?</label>
                  <div className="flex flex-wrap gap-2">
                    {SELLS_OPTIONS.map(o => (
                      <button key={o} onClick={() => setAnswers(p => ({ ...p, sells: o }))}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${answers.sells === o ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Hvem er kundene dine?</label>
                  <div className="flex flex-wrap gap-2">
                    {CUSTOMER_OPTIONS.map(o => (
                      <button key={o} onClick={() => toggle('customers', o)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${answers.customers.includes(o) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Hvor far du leads i dag?</label>
                  <div className="flex flex-wrap gap-2">
                    {LEAD_OPTIONS.map(o => (
                      <button key={o} onClick={() => setAnswers(p => ({ ...p, leads: o }))}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${answers.leads === o ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={back} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Tilbake</button>
                <button onClick={next} className="flex-1 rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 transition flex items-center justify-center gap-2">
                  Neste <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 – Koble verktoy */}
          {step === 3 && (
            <div className="p-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 mb-4">
                <Link className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Koble kontoene dine</h2>
              <p className="text-slate-500 text-sm mb-6">Dette gjor at FlowPilot kan jobbe for deg automatisk.</p>

              <div className="space-y-3">
                {TOOLS.map(t => {
                  const Icon = t.icon;
                  const on = answers.connectedTools.includes(t.id);
                  return (
                    <button key={t.id} onClick={() => toggle('connectedTools', t.id)}
                      className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition ${on ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-200'}`}>
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${on ? 'bg-blue-600' : 'bg-slate-100'}`}>
                        <Icon className={`h-5 w-5 ${on ? 'text-white' : 'text-slate-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${on ? 'text-blue-700' : 'text-slate-900'}`}>{t.label}</p>
                        <p className="text-xs text-slate-500">{t.desc}</p>
                      </div>
                      {on && <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={back} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Tilbake</button>
                <button onClick={next} className="flex-1 rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 transition flex items-center justify-center gap-2">
                  Koble <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4 – Mal */}
          {step === 4 && (
            <div className="p-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 mb-4">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Hva vil du oppna forst?</h2>
              <p className="text-slate-500 text-sm mb-6">Vi prioriterer systemet basert pa malet ditt.</p>

              <div className="grid grid-cols-2 gap-3">
                {GOAL_OPTIONS.map(g => {
                  const Icon = g.icon;
                  const on = answers.goals.includes(g.id);
                  return (
                    <button key={g.id} onClick={() => toggle('goals', g.id)}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-5 transition ${on ? 'border-purple-600 bg-purple-50' : 'border-slate-200 bg-white hover:border-purple-200'}`}>
                      <Icon className={`h-6 w-6 ${on ? 'text-purple-600' : 'text-slate-400'}`} />
                      <span className={`text-sm font-semibold ${on ? 'text-purple-700' : 'text-slate-700'}`}>{g.label}</span>
                      {on && <CheckCircle className="h-4 w-4 text-purple-500" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={back} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Tilbake</button>
                <button onClick={next} className="flex-1 rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 transition flex items-center justify-center gap-2">
                  Fortsett <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5 – Aktiver */}
          {step === 5 && (
            <div className="p-8 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-5">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Klar til a starte?</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                FlowPilot begynner na a analysere og optimalisere salget ditt basert pa informasjonen du ga.
              </p>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 text-left mb-8">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Oppsummering</p>
                <div className="space-y-2">
                  {answers.sells && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700">Selger: <strong>{answers.sells}</strong></span>
                    </div>
                  )}
                  {answers.leads && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700">Leads fra: <strong>{answers.leads}</strong></span>
                    </div>
                  )}
                  {answers.connectedTools.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700">Koblet: <strong>{answers.connectedTools.join(', ')}</strong></span>
                    </div>
                  )}
                  {answers.goals.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700">Mal: <strong>{answers.goals.join(', ')}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={back} className="flex-1 rounded-xl border border-slate-200 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Tilbake</button>
                <button onClick={next} className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 font-bold text-white hover:opacity-90 transition flex items-center justify-center gap-2">
                  Aktiver <Zap className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 6 – Ferdig */}
          {step === 6 && (
            <div className="p-8 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 mb-5">
                <Star className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Første steg fullført!</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Vi jobber nå med å skaffe deg ditt første resultat. Systemet er konfigurert og klart.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { label: 'AI-analyse', icon: Bot, color: 'text-blue-500', bg: 'bg-blue-100' },
                  { label: 'Oppfølging', icon: Bell, color: 'text-emerald-500', bg: 'bg-emerald-100' },
                  { label: 'Leads klar', icon: Users, color: 'text-purple-500', bg: 'bg-purple-100' },
                ].map(f => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} className="rounded-xl bg-slate-50 p-4 flex flex-col items-center gap-2">
                      <div className={`h-9 w-9 flex items-center justify-center rounded-lg ${f.bg}`}>
                        <Icon className={`h-5 w-5 ${f.color}`} />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">{f.label}</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">Aktiv</span>
                    </div>
                  );
                })}
              </div>

              <button onClick={finish} className="w-full rounded-xl bg-emerald-600 py-3.5 font-bold text-white hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                Ga til dashboard <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Step counter */}
        <p className="text-center text-xs text-slate-400 mt-4">Steg {step} av {STEPS.length}</p>
      </div>
    </div>
  );
}
