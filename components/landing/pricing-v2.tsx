'use client'

import Link from 'next/link'
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/lib/stripe'

const descriptions: Record<SubscriptionPlan, string> = {
  starter: 'For enkeltpersonforetak som vil samle henvendelser på ett sted.',
  pro: 'For bedrifter som vil følge opp flere kunder og automatisere mer.',
  enterprise: 'For større behov, API-tilgang og tilpasset oppsett.',
}

export default function PricingV2() {
  return (
    <section id="pricing" className="bg-gradient-to-b from-white to-slate-50 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">Velg et nivå som passer behovet</h2>
          <p className="mt-4 text-lg text-slate-600">
            14 dagers prøveperiode. Du velger betalt abonnement når du vil fortsette.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {(Object.entries(SUBSCRIPTION_PLANS) as [SubscriptionPlan, typeof SUBSCRIPTION_PLANS[SubscriptionPlan]][]).map(([id, plan]) => (
            <article key={id} className={`relative rounded-2xl border bg-white p-7 shadow-sm ${id === 'pro' ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-200'}`}>
              {id === 'pro' && <span className="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">Mest valgt</span>}
              <h3 className="text-2xl font-semibold text-slate-900">{plan.name}</h3>
              <p className="mt-2 min-h-12 text-sm text-slate-600">{descriptions[id]}</p>
              <p className="mt-6 text-4xl font-bold text-slate-900">{plan.price.toLocaleString('nb-NO')} kr<span className="text-sm font-normal text-slate-500">/mnd</span></p>
              <p className="mt-1 text-xs text-slate-500">Eks. mva. Ingen bindingstid.</p>
              <ul className="my-7 space-y-3 text-sm text-slate-700">
                {plan.features.map(feature => <li key={feature} className="flex gap-2"><span className="text-emerald-600">✓</span><span>{feature}</span></li>)}
              </ul>
              <Link href={`/register?plan=${id}`} className={`block rounded-xl px-4 py-3 text-center font-semibold ${id === 'pro' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                Start prøveperiode
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-slate-500">
          Tilpassede integrasjoner og administrert markedsføring prises separat etter omfang.
        </p>
      </div>
    </section>
  )
}
