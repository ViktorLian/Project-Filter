export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTrialWelcomeEmail } from '@/lib/email'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
}

// Helper: create a full FlowPilot account from registration metadata
async function createAccountFromStripeMetadata(metadata: Record<string, string>, stripeCustomerId?: string) {
  const { companyName, name, email, password } = metadata;
  if (!email || !password || !companyName || !name) {
    console.error('[WEBHOOK] Missing registration metadata', { email: !!email, password: !!password, companyName: !!companyName });
    return;
  }

  const supabase = createAdminClient();

  // Check if account already exists (idempotency)
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingUser) {
    console.log('[WEBHOOK] Account already exists for', email);
    return;
  }

  // Create Supabase Auth user
  const { data: createdUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, business_name: companyName },
  });

  if (authError || !createdUser?.user) {
    console.error('[WEBHOOK] Auth user creation failed', authError);
    return;
  }

  // Create public.users record
  const { data: newUser, error: userError } = await supabase
    .from('users')
    .insert({
      auth_user_id: createdUser.user.id,
      email,
      business_name: companyName,
      stripe_customer_id: stripeCustomerId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (userError || !newUser) {
    console.error('[WEBHOOK] User record creation failed', userError);
    await supabase.auth.admin.deleteUser(createdUser.user.id);
    return;
  }

  // Create user_settings
  await supabase.from('user_settings').insert({
    user_id: newUser.id,
    alert_email: email,
    auto_reply_template: 'template_1',
    score_threshold: 80,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Create company with 14-day trial
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from('leads_companies').insert({
    user_id: newUser.id,
    name: companyName,
    subscription_status: 'trialing',
    subscription_plan: 'starter',
    trial_ends_at: trialEndsAt,
    stripe_customer_id: stripeCustomerId || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Send welcome email (non-blocking)
  sendTrialWelcomeEmail(email, name, companyName).catch(e =>
    console.error('[WEBHOOK] Welcome email failed', e)
  );

  console.log('[WEBHOOK] Account created for', email);
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const sig = req.headers.get('stripe-signature') || ''
  const body = await req.text()
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('[WEBHOOK] signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const metadata = session.metadata || {}
      const userId = metadata.userId || null
      const billingTerm = metadata.billingTerm || null

      // --- NEW REGISTRATION FLOW ---
      if (metadata.registration === 'true') {
        await createAccountFromStripeMetadata(
          metadata,
          typeof session.customer === 'string' ? session.customer : undefined
        );
        return NextResponse.json({ received: true });
      }

      // If prepaid purchase, create or update subscriptions table marking prepaid period
      if (billingTerm === 'prepaid6' && userId) {
        const now = new Date()
        const expiry = new Date(now)
        expiry.setMonth(expiry.getMonth() + 6)

        await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_subscription_id: `prepaid_${session.payment_intent || session.id}`,
            plan_id: metadata.plan || 'prepaid',
            trial_end_date: expiry.toISOString(),
            status: 'active',
          } as any, { onConflict: 'user_id' })
      }
    }
  } catch (e) {
    console.error('[WEBHOOK PROCESSING ERROR]', e)
  }

  return NextResponse.json({ received: true })
}
