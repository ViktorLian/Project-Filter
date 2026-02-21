// Pricing configuration - fetched from Stripe
export const PRICING_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 799,
    interval: 'month',
    stripeId: process.env.STRIPE_PRICE_STARTER_ID,
    features: [
      '50 leads/month',
      '20 invoices/month',
      'Basic cashflow tracking',
      'Email support',
      '1 user',
    ],
  },
  standard: {
    id: 'standard',
    name: 'Pro',
    price: 1999,
    interval: 'month',
    stripeId: process.env.STRIPE_PRICE_PRO_ID,
    features: [
      'Unlimited leads',
      'Unlimited invoices',
      'Advanced analytics',
      'Zapier integration',
      'Priority support',
      'CSV export',
      'Up to 3 users',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Enterprise',
    price: 4990,
    interval: 'month',
    stripeId: process.env.STRIPE_PRICE_ENTERPRISE_ID,
    features: [
      'Everything in Pro',
      'Custom user limits',
      'Priority support',
      'Custom integrations',
      'API access',
      'Dedicated support',
    ],
  },
};

export const TRIAL_DAYS = 14;

export type PlanId = keyof typeof PRICING_PLANS;
