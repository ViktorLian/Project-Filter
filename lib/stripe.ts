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

export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    price: 499,
    limits: { leads: 100, forms: 2 },
    features: [
      'Inntil 100 henvendelser per måned',
      'Opptil 2 kontaktskjemaer',
      'E-postvarsler',
      'Grunnleggende oversikt og rapportering',
    ],
  },
  pro: {
    name: 'Pro',
    price: 1499,
    limits: { leads: 500, forms: 20 },
    features: [
      'Inntil 500 henvendelser per måned',
      'Opptil 20 kontaktskjemaer',
      'AI-assistert prioritering',
      'Oppfølgingsflyter og kampanjer',
      'Anmeldelsesforespørsler',
      'Prioritert support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 2499,
    limits: { leads: 999999, forms: 999999 },
    features: [
      'Alt i Pro',
      'Ubegrensede henvendelser og skjemaer',
      'API og webhooks',
      'Avansert rapportering',
      'Tilpasset oppsett etter avtale',
      'Prioritert support',
    ],
  },
} as const
