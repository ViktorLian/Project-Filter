export const dynamic = 'force-dynamic';
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { requireEnv, requireStripeSecretKey } from '@/lib/env'

function getStripe() {
  return new Stripe(requireStripeSecretKey(), {
    apiVersion: '2023-10-16',
  })
}

function getSupabaseAdmin() {
  return createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  )
}

export async function POST(request: Request) {
  const stripe = getStripe()
  const supabaseAdmin = getSupabaseAdmin()
  
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      requireEnv('STRIPE_WEBHOOK_SECRET')
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const meta = session.metadata || {}

        // Accounts are created before checkout. Passwords must never travel
        // through Stripe metadata.
        const { companyId, plan } = meta
        if (companyId) {
          const stripeSubscription = typeof session.subscription === 'string'
            ? await stripe.subscriptions.retrieve(session.subscription)
            : null

          await supabaseAdmin
            .from('leads_companies')
            .update({
              subscription_status: stripeSubscription?.status || 'inactive',
              subscription_plan: plan || 'starter',
              trial_ends_at: stripeSubscription?.trial_end
                ? new Date(stripeSubscription.trial_end * 1000).toISOString()
                : null,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              updated_at: new Date().toISOString()
            })
            .eq('id', companyId)
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await supabaseAdmin
          .from('leads_companies')
          .update({
            subscription_status: subscription.status,
            trial_ends_at: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await supabaseAdmin
          .from('leads_companies')
          .update({
            subscription_status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
