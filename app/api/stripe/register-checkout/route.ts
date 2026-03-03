export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
}

// 3 canonical plan tiers that map to Stripe price IDs
const PLAN_CONFIGS: Record<string, { name: string; amount: number; priceId: string }> = {
  starter:    { name: 'FlowPilot Starter',   amount: 129000, priceId: process.env.STRIPE_PRICE_ID_STARTER    || 'price_1SxRpVHTxh2T1zNz6jPfJtcD' },
  pro:        { name: 'FlowPilot Pro',        amount: 259000, priceId: process.env.STRIPE_PRICE_ID_PRO       || 'price_1SxRqIHTxh2T1zNz00HrfAlQ' },
  enterprise: { name: 'FlowPilot Enterprise', amount: 399000, priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || 'price_1SxRqeHTxh2T1zNzRYKM4DUl' },
};

// All 18 niche IDs → map to the Pro tier by default
const NICHE_PLAN_MAP: Record<string, string> = {};
const NICHE_IDS = [
  'rorlegger','elektriker','maler','snekker','renholder','friseur','tannlege',
  'lege','advokat','regnskapsforer','eiendomsmegler','bilverksted','restaurant',
  'treningssenter','barnehage','fotograf','konsulent','nettbutikk',
];
NICHE_IDS.forEach(id => { NICHE_PLAN_MAP[id] = 'pro'; });

function resolvePlanKey(planOrNiche: string): string {
  if (PLAN_CONFIGS[planOrNiche]) return planOrNiche;
  if (NICHE_PLAN_MAP[planOrNiche]) return NICHE_PLAN_MAP[planOrNiche];
  return 'pro'; // sensible default
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, name, email, password, phone, plan, nicheId } = body as {
      companyName: string; name: string; email: string; password: string;
      phone?: string; plan?: string; nicheId?: string;
    };

    if (!companyName || !name || !email || !password) {
      return NextResponse.json({ error: 'Alle felt er påkrevd.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Passord må være minst 8 tegn.' }, { status: 400 });
    }

    // Resolve the plan: prefer nicheId, then plan field, then default 'pro'
    const planKey = resolvePlanKey(nicheId || plan || 'pro');
    const planConfig = PLAN_CONFIGS[planKey];
    const resolvedNicheId = nicheId || (NICHE_IDS.includes(plan || '') ? plan : null) || '';

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Try live priceId first, fall back to inline price_data
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    try {
      await stripe.prices.retrieve(planConfig.priceId);
      lineItems = [{ price: planConfig.priceId, quantity: 1 }];
    } catch {
      lineItems = [{
        price_data: {
          currency: 'nok',
          product_data: { name: planConfig.name, description: `FlowPilot for ${resolvedNicheId || planKey} — 14 dager gratis prøveperiode` },
          unit_amount: planConfig.amount,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }];
    }

    const meta: Record<string, string> = {
      registration: 'true',
      companyName, name, email,
      password,   // stored encrypted in Stripe metadata, only read server-side in webhook
      plan: planKey,
      nicheId: resolvedNicheId,
      ...(phone ? { phone } : {}),
    };

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      subscription_data: { trial_period_days: 14, metadata: meta },
      line_items: lineItems,
      metadata: meta,
      allow_promotion_codes: true,
      success_url: `${appUrl}/register/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/register?cancelled=1&plan=${planKey}`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (e: any) {
    console.error('[REGISTER CHECKOUT ERROR]', e);
    return NextResponse.json({ error: e.message || 'Klarte ikke starte registrering. Prøv igjen.' }, { status: 500 });
  }
}
