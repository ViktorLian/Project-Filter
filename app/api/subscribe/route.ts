export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { TRIAL_DAYS } from '@/lib/pricing'

function getStripe() {
  const Stripe = require('stripe');
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY er ikke konfigurert');
  return new Stripe(key, { apiVersion: '2023-10-16' });
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

    // Validate stripeId is set
    const priceId = plan?.priceId;
    if (!priceId) {
      return NextResponse.json(
        { error: `Stripe Price ID mangler for plan "${planId}".` },
        { status: 500 }
      );
    }

    // Get user info
    const { data: userData } = await supabase
      .from('users')
      .select('id, email, business_name')
      .eq('id', userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'Bruker ikke funnet' }, { status: 404 });
    }

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
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { user_id: userData.id, plan_id: planId },
      },
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

async function sendTrialStartedEmail(
  email: string,
  businessName: string,
  planId: string
) {
  const plan = PRICING_PLANS[planId as PlanId];
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Trial Started! 🎉</h2>
      <p>Hei ${businessName},</p>
      <p>Du har startet en <strong>${TRIAL_DAYS} dagers gratis trial</strong> på <strong>${plan.name}</strong> planen!</p>
      
      <h3>Din trial ender: ${trialEnd.toLocaleDateString('no-NO')}</h3>
      
      <p>Etter trialen vil kortet ditt bli belastet <strong>${plan.price},-/måned</strong>.</p>
      
      <h3>Du kan:</h3>
      <ul>
        <li><a href="https://app.flowpilot.io/dashboard/billing">Endre plan eller avbryte her</a></li>
        <li><a href="https://app.flowpilot.io/dashboard/settings">Se dine innstillinger</a></li>
        <li>Kontakt oss på support@flowpilot.io hvis du har spørsmål</li>
      </ul>
      
      <p>Vi gleder oss til å hjelpe deg!</p>
      <p>FlowPilot Team</p>
    </div>
  `;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@flowpilot.io',
        to: email,
        subject: `Trial startet på ${plan.name} plan - 14 dager gratis`,
        html: emailHtml,
      }),
    });
  } catch (error) {
    console.error('Error sending trial email:', error);
  }
}
