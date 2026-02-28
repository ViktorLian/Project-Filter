'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';

const PLANS = [
  {
    key: 'starter',
    title: 'Starter',
    price: '1 290',
    period: 'kr/mnd',
    description: 'Perfekt for nystartede bedrifter',
    features: ['50 leads/mnd', '2 skjemaer', 'AI lead-scoring', 'E-postsvar', '10 fakturaer/mnd'],
    highlight: false,
  },
  {
    key: 'pro',
    title: 'Pro',
    price: '2 590',
    period: 'kr/mnd',
    description: 'For voksende bedrifter',
    badge: 'MEST POPULÆR',
    features: ['300 leads/mnd', '10 skjemaer', 'AI scoring + kategorisering', 'E-postkampanjer', 'Ubegrensede fakturaer'],
    highlight: true,
  },
  {
    key: 'enterprise',
    title: 'Enterprise',
    price: '3 990',
    period: 'kr/mnd',
    description: 'For seriøse vekstbedrifter',
    features: ['Ubegrenset leads', 'Ubegrenset skjemaer', 'White-label', 'Dedikert support', 'Full API-tilgang'],
    highlight: false,
  },
];

function RegisterFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const planFromUrl = params.get('plan') || '';
  const inviteToken = params.get('invite') || '';
  const cancelled = params.get('cancelled') === '1';

  const [step, setStep] = useState<'plan' | 'form'>(planFromUrl && PLANS.find(p => p.key === planFromUrl) ? 'form' : 'plan');
  const [selectedPlan, setSelectedPlan] = useState(planFromUrl || 'pro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ companyName: '', name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const selectedPlanData = PLANS.find(p => p.key === selectedPlan) || PLANS[1];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passordene stemmer ikke overens.'); return; }
    if (form.password.length < 8) { setError('Passord må være minst 8 tegn.'); return; }
    setLoading(true);

    // Invite flow — no payment
    if (inviteToken) {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, companyName: form.name, inviteToken }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) { setError(data.error || 'Feil ved registrering'); return; }
      router.push('/login?invited=1');
      return;
    }

    // Normal flow → Stripe checkout
    const res = await fetch('/api/stripe/register-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: form.companyName,
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        plan: selectedPlan,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.url) { setError(data.error || 'Klarte ikke starte registrering.'); return; }
    window.location.href = data.url;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">FP</span>
        </div>
        <span className="text-2xl font-bold text-slate-900">FlowPilot</span>
      </Link>

      {cancelled && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 max-w-md w-full text-center">
          Betalingen ble avbrutt. Ingen belastning ble gjort.
        </div>
      )}

      {/* STEP 1: Plan selection */}
      {step === 'plan' && !inviteToken && (
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Velg din plan</h1>
            <p className="text-slate-500 mt-2">14 dagers gratis prøveperiode — avslutt når som helst</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map(plan => (
              <div key={plan.key}
                onClick={() => { setSelectedPlan(plan.key); setStep('form'); }}
                className={`relative rounded-2xl border-2 p-6 flex flex-col cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                  plan.highlight ? 'border-blue-600 shadow-lg bg-gradient-to-b from-blue-50 to-white scale-[1.02]' : 'border-slate-200 bg-white hover:border-blue-300'
                }`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-0.5 text-xs font-bold text-white">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-900">{plan.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5 mb-3">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 text-sm ml-1">{plan.period}</span>
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`mt-5 w-full rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                    plan.highlight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Velg {plan.title} <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-slate-400 mt-6">
            Har du allerede konto? <Link href="/login" className="text-blue-600 hover:underline font-medium">Logg inn</Link>
          </p>
        </div>
      )}

      {/* STEP 2: Registration form */}
      {(step === 'form' || inviteToken) && (
        <div className="w-full max-w-md">
          {!inviteToken && (
            <button onClick={() => setStep('plan')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition">
              <ArrowLeft className="h-4 w-4" /> Tilbake til planvalg
            </button>
          )}

          {inviteToken ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 mb-5 text-sm text-emerald-800">
              <p className="font-semibold">Du er invitert til et team!</p>
              <p className="text-xs mt-0.5">Opprett konto for å få tilgang — gratis, inkludert i abonnementet.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Valgt plan</p>
                <p className="font-bold text-slate-900">{selectedPlanData.title} — {selectedPlanData.price} kr/mnd</p>
              </div>
              <button onClick={() => setStep('plan')} className="text-xs text-blue-600 hover:underline font-medium">Endre</button>
            </div>
          )}

          <div className="rounded-2xl bg-white border border-slate-200 shadow-xl p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">{inviteToken ? 'Bli med i teamet' : 'Opprett din konto'}</h2>
            <p className="text-sm text-slate-500 mb-5">
              {inviteToken ? 'Fyll inn dine opplysninger for å starte.' : '14 dager gratis — kortet belastes ikke nå.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              {!inviteToken && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Bedriftsnavn *</label>
                  <input value={form.companyName} onChange={set('companyName')} required placeholder="Nordmann Rørlegger AS"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Ditt navn *</label>
                <input value={form.name} onChange={set('name')} required placeholder="Ola Nordmann"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">E-post *</label>
                <input type="email" value={form.email} onChange={set('email')} required placeholder="ola@bedrift.no"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Telefon</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+47 900 00 000"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Passord * (min. 8 tegn)</label>
                <input type="password" value={form.password} onChange={set('password')} required minLength={8} placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Bekreft passord *</label>
                <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2 mt-1">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Behandler...</> : inviteToken ? 'Bli med i teamet' : 'Gå til betaling →'}
              </button>
              {!inviteToken && (
                <p className="text-xs text-center text-slate-400">
                  Kortet belastes ikke i 14 dager. Avslutt når som helst.
                </p>
              )}
            </form>
          </div>

          <p className="text-center text-sm text-slate-500 mt-4">
            Har du allerede konto?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">Logg inn her</Link>
          </p>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Laster...</div>}>
      <RegisterFlow />
    </Suspense>
  );
}
