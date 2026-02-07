import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export type SubscriptionPlan = 'starter' | 'pro' | 'enterprise'

export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    price: 500,
    priceId: 'price_1SxRpVHTxh2T1zNz6jPfJtcD',
    limits: {
      leads: 100,
      forms: 2
    },
    features: [
      'Inntil 100 leads per måned',
      'Opptil 2 forms',
      'E-post notifikasjoner',
      'Grunnleggende analytics'
    ]
  },
  pro: {
    name: 'Pro',
    price: 1500,
    priceId: 'price_1SxRqIHTxh2T1zNz00HrfAlQ',
    limits: {
      leads: 500,
      forms: 20
    },
    features: [
      'Inntil 500 leads per måned',
      'Opptil 20 forms',
      'Avansert analytics',
      'Zapier integrasjon',
      'API tilgang',
      'E-post notifikasjoner'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 3500,
    priceId: 'price_1SxRqeHTxh2T1zNzRYKM4DUl',
    limits: {
      leads: 999999,
      forms: 999999
    },
    features: [
      'Ubegrensede leads',
      'Ubegrensede forms',
      'Avansert scoring og AI',
      'Full API tilgang',
      'Custom integrasjoner',
      'Dedikert support 24/7',
      'Onboarding hjelp'
    ]
  }
}
