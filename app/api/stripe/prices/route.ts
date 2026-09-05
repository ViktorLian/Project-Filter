export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe';

/**
 * Public price catalogue. Checkout uses the same SUBSCRIPTION_PLANS object,
 * so displayed prices cannot drift from the amount sent to Stripe.
 *
 * Stripe Checkout creates recurring price_data for each session. Therefore
 * permanent Stripe Price IDs are intentionally not required here.
 */
export async function GET() {
  return NextResponse.json(
    Object.fromEntries(
      Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => [id, {
        id,
        name: plan.name,
        display: plan.price.toLocaleString('no-NO'),
        amount: plan.price * 100,
        currency: 'NOK',
        interval: 'month',
      }]),
    ),
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' } },
  );
}
