'use client';

import { useState } from 'react';
import { CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/lib/stripe';

export default function SubscriptionRequired() {
  const [loading, setLoading] = useState<SubscriptionPlan | null>(null);
  const [error, setError] = useState('');

  async function startCheckout(planId: SubscriptionPlan) {
    setLoading(planId);
    setError('');
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    const data = await response.json();
    if (!response.ok || !data.url) {
      setError(data.error || 'Kunne ikke starte betaling.');
      setLoading(null);
      return;
    }
    window.location.assign(data.url);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Velg abonnement for å åpne FlowPilot</h1>
          <p className="mt-3 text-slate-600">
            Kontoen din er bevart, men betalte verktøy er låst når prøveperioden eller abonnementet ikke er aktivt.
          </p>
        </div>
        {error && <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">{error}</p>}
        <div className="grid gap-5 md:grid-cols-3">
          {(Object.entries(SUBSCRIPTION_PLANS) as [SubscriptionPlan, typeof SUBSCRIPTION_PLANS[SubscriptionPlan]][]).map(([key, plan]) => (
            <section key={key} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">{plan.name}</h2>
              <p className="mt-2 text-3xl font-bold text-slate-900">{plan.price.toLocaleString('nb-NO')} kr<span className="text-sm font-normal text-slate-500">/mnd</span></p>
              <ul className="my-6 space-y-2 text-sm text-slate-600">
                {plan.features.map(feature => <li key={feature}>• {feature}</li>)}
              </ul>
              <button
                onClick={() => startCheckout(key)}
                disabled={loading !== null}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {loading === key ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {loading === key ? 'Åpner betaling…' : 'Velg plan'}
              </button>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
