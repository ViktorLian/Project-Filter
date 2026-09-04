import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY')
    stripeClient = new Stripe(key, { apiVersion: '2023-10-16' })
  }
  return stripeClient
}

export type SubscriptionPlan = 'starter' | 'pro' | 'enterprise'

/**
 * Én autoritativ priskilde for hele FlowPilot.
 * De tekniske nøklene beholdes for kompatibilitet med eksisterende kunder og
 * Stripe-webhooks. Navnene som vises til kunden er Basis, Vekst og Pro.
 */
export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Basis',
    price: 899,
    limits: { leads: 100, forms: 2 },
    features: [
      'Inntil 100 henvendelser per måned',
      'Kontakter, innboks og enkel salgspipeline',
      'Opptil 2 kontaktskjemaer',
      'Varsel om nye henvendelser',
      'Automatisk mottaksbekreftelse',
      'Månedlig resultatrapport',
    ],
  },
  pro: {
    name: 'Vekst',
    price: 1990,
    limits: { leads: 500, forms: 20 },
    features: [
      'Alt i Basis',
      'Inntil 500 henvendelser per måned',
      'Automatisk oppfølging av ubesvarte leads og tilbud',
      'Kundeanmeldelser og Google-anmeldelsesflyt',
      'Google-bedriftsprofil og lokal synlighet',
      'Servicepåminnelser og gjenaktivering av kunder',
      'AI-chat og SEO-oversikt',
    ],
  },
  enterprise: {
    name: 'Pro',
    price: 3990,
    limits: { leads: 999999, forms: 999999 },
    features: [
      'Alt i Vekst',
      'Ubegrensede henvendelser og skjemaer',
      'AutoSEO og planlagt faginnhold',
      'Synlighet i Google og AI-baserte søk',
      'Avanserte automatiseringer, API og webhooks',
      'Utvidet rapportering og prioriterte varsler',
      'Prioritert onboarding og support',
    ],
  },
} as const
