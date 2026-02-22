export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PRICING_PLANS, TRIAL_DAYS, PlanId } from '@/lib/pricing'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    // Use NextAuth session
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      )
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    const { planId } = await request.json()
    
    if (!planId || !PRICING_PLANS[planId as PlanId]) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    const plan = PRICING_PLANS[planId as PlanId];
    const userId = (session.user as any).id;
    
    // Get user
    const { data: userData } = await supabase
      .from('users')
      .select('id, email, business_name, auth_user_id')
      .eq('id', userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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
        metadata: {
          user_id: userData.id,
          business_name: userData.business_name,
        },
      });
      customerId = customer.id;

      await supabase
        .from('stripe_customers')
        .insert({
          user_id: userData.id,
          stripe_customer_id: customerId,
        });
    }

    // Calculate trial end date (14 days from now)
    const trialEnd = Math.floor(
      (Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000) / 1000
    );

    // Create subscription with trial
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: plan.stripeId,
        },
      ],
      trial_end: trialEnd,
      metadata: {
        user_id: userData.id,
        plan_id: planId,
      },
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
    });

    // Save subscription
    await supabase
      .from('subscriptions')
      .upsert({
        user_id: userData.id,
        stripe_subscription_id: subscription.id,
        plan_id: planId,
        trial_end_date: new Date(trialEnd * 1000).toISOString(),
        status: subscription.status,
      });

    // Send trial email
    await sendTrialStartedEmail(userData.email, userData.business_name, planId);

    return NextResponse.json({ 
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        trial_end: new Date(trialEnd * 1000).toISOString(),
        plan: planId,
      }
    });
  } catch (error) {
    console.error('[SUBSCRIBE ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to create subscription: ' + (error instanceof Error ? error.message : 'Unknown error') },
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
