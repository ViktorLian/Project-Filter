'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Lock, CheckCircle, ArrowRight, Zap, Star, Crown } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '1 290',
    icon: Zap,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    features: [
      '100 leads/mnd',
      '2 lead-skjemaer',
      'AI lead-scoring',
      'Automatiske e-postsvar',
      '20 fakturaer/mnd',
      'Kontantstrom-oversikt',
      'E-postsupport',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '2 590',
    icon: Star,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    badge: 'Mest populaer',
    features: [
      '500 leads/mnd',
      '20 lead-skjemaer',
      'AI scoring og kategorisering',
      'Automatiske e-postkampanjer',
      'Bookingsystem med Google Kalender',
      'Lead ROI-tracking',
      'Ubegrenset fakturaer',
      'Kampanjer og drip-sekvenser',
      'Vekst-coach og planlegger',
      'Forhandlingscoach',
      'Digital Tvilling simulator',
      'Profit Accelerator',
      'Omdømme-sentral',
      'Finansierings-hub',
      'Prioritert support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '3 990',
    icon: Crown,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    features: [
      'Ubegrenset leads og skjemaer',
      'AI kundeservice-bot',
      'Avansert kampanjestyring',
      'FlowPilot Score™ (live forretningshelse)',
      'Business Genome (DNA-kart)',
      'Autonom Backoffice (alle auto-regler)',
      'Benchmark Network',
      'White-label muligheter',
      'Full API-tilgang',
      'Dedikert onboarding',
      'Team-administrasjon og roller',
      'SLA-garanti',
      'Tilpassede integrasjoner',
    ],
  },
];

const planOrder = ['starter', 'pro', 'enterprise'];

function UpgradeContent() {
  const params = useSearchParams();
  const requiredPlan = params.get('required') ?? 'pro';
  const feature = params.get('feature') ?? 'denne funksjonen';

  const requiredIdx = planOrder.indexOf(requiredPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-start py-16 px-4">
      {/* Lock badge */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 shadow-sm">
          <Lock className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Oppgradering krevd</h1>
        <p className="text-slate-500 max-w-md text-base">
          <span className="font-semibold text-slate-800">{feature}</span> er tilgjengelig fra{' '}
          <span className="font-semibold capitalize text-blue-700">{requiredPlan}</span>-planen og oppover.
          Velg planen som passer for deg nedenfor.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-5 w-full max-w-4xl mb-10">
        {PLANS.map((plan, i) => {
          const Icon = plan.icon;
          const isRequired = plan.id === requiredPlan;
          const isHigher = i >= requiredIdx;
          return (
            <div key={plan.id}
              className={`relative rounded-2xl border-2 bg-white p-6 flex flex-col transition-all ${isRequired ? 'border-blue-500 shadow-lg shadow-blue-100 scale-105' : 'border-slate-200'}`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow">
                  {plan.badge}
                </div>
              )}
              {isRequired && (
                <div className="absolute -top-3 right-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow">
                  Krevd
                </div>
              )}
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${plan.bg}`}>
                <Icon className={`h-5 w-5 ${plan.color}`} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h2>
              <p className="text-3xl font-extrabold text-slate-900 mb-1">{plan.price} <span className="text-base font-normal text-slate-500">kr/mnd</span></p>
              <p className="text-xs text-slate-400 mb-4">14 dager gratis prøveperiode</p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${isHigher ? 'text-emerald-500' : 'text-slate-300'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              {isHigher ? (
                <Link href={`/dashboard/settings?upgrade=${plan.id}`}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${isRequired ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  Velg {plan.name} <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <div className="rounded-xl py-3 text-center text-sm text-slate-400 bg-slate-50">
                  Din navarende plan
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-sm text-slate-400">
        Spørsmål? <a href="mailto:flowpilot@hotmail.com" className="text-blue-600 hover:underline">Kontakt oss</a>
      </p>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">Laster...</p></div>}>
      <UpgradeContent />
    </Suspense>
  );
}
