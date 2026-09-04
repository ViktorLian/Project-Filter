export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js'
import { requireEnv } from '@/lib/env';
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

function getStripe() {
  const Stripe = require('stripe');
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY er ikke konfigurert');
  return new Stripe(key, { apiVersion: '2023-10-16' });
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions as any) as any;

    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });
    }

    const supabase = createClient(
      requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { planId } = await request.json();

    const { SUBSCRIPTION_PLANS: PLANS } = await import('@/lib/stripe');
    if (!planId || !(PLANS as any)[planId]) {
      return NextResponse.json({ error: 'Ugyldig plan' }, { status: 400 });
    }

    const { SUBSCRIPTION_PLANS } = await import('@/lib/stripe');
    const plan = (SUBSCRIPTION_PLANS as any)[planId];
    const userId = (session.user as any).id;

    // Get user info
    const { data: userData } = await supabase
      .from('users')
      .select('id, email, business_name, company_id')
      .eq('id', userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'Bruker ikke funnet' }, { status: 404 });
    }

    const companyId = userData.company_id || userData.id;

    const stripe = getStripe();
    const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Create or get Stripe customer
    let customerId = '';
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', userData.id)
      .single();

    if (existingCustomer?.stripe_customer_id) {
      customerId = existingCustomer.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: { user_id: userData.id, business_name: userData.business_name },
      });
      customerId = customer.id;
      await supabase.from('stripe_customers').insert({ user_id: userData.id, stripe_customer_id: customerId });
    }

    // Use Checkout Session - handles payment collection before trial starts
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'nok',
          unit_amount: plan.price * 100,
          recurring: { interval: 'month' },
          product_data: {
            name: `FlowPilot ${plan.name}`,
            metadata: { plan_id: planId },
          },
        },
        quantity: 1,
      }],
      subscription_data: {
        metadata: { user_id: userData.id, company_id: companyId, plan_id: planId },
      },
      metadata: { companyId, plan: planId },
      success_url: `${origin}/dashboard/settings?subscription=success&plan=${planId}`,
      cancel_url: `${origin}/pricing?cancelled=true`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url, success: true });
  } catch (error) {
    console.error('[SUBSCRIBE ERROR]', error);
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : 'Ukjent feil ved abonnement') },
      { status: 500 }
    );
  }
}
