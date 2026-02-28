export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
}

const PLAN_CONFIGS: Record<string, { name: string; amount: number; priceId: string }> = {
  starter:    { name: 'FlowPilot Starter',   amount: 129000, priceId: 'price_1SxRpVHTxh2T1zNz6jPfJtcD' },
  pro:        { name: 'FlowPilot Pro',        amount: 259000, priceId: 'price_1SxRqIHTxh2T1zNz00HrfAlQ' },
  enterprise: { name: 'FlowPilot Enterprise', amount: 399000, priceId: 'price_1SxRqeHTxh2T1zNzRYKM4DUl' },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, name, email, password, phone, plan = 'starter' } = body as {
      companyName: string; name: string; email: string; password: string; phone?: string; plan?: string;
    };

    if (!companyName || !name || !email || !password) {
      return NextResponse.json({ error: 'Alle felt er påkrevd.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Passord må være minst 8 tegn.' }, { status: 400 });
    }

    const planKey = PLAN_CONFIGS[plan] ? plan : 'starter';
    const planConfig = PLAN_CONFIGS[planKey];
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
          product_data: { name: planConfig.name, description: '14 dager gratis prøveperiode — avslutt når som helst' },
          unit_amount: planConfig.amount,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }];
    }

    const registrationMeta: Record<string, string> = {
      registration: 'true',
      companyName, name, email,
      password,   // Stripe encrypts metadata at rest — only used server-side in webhook
      plan: planKey,
      ...(phone ? { phone } : {}),
    };

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      subscription_data: { trial_period_days: 14, metadata: registrationMeta },
      line_items: lineItems,
      metadata: registrationMeta,
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