export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' })

export async function POST(req: Request) {
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

      // If prepaid purchase, create or update subscriptions table marking prepaid period
      if (billingTerm === 'prepaid6' && userId) {
        const now = new Date()
        const expiry = new Date(now)
        expiry.setMonth(expiry.getMonth() + 6)

        // Upsert into subscriptions table (cast to any to satisfy PostgREST typings)
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

      // For subscription mode Stripe will send invoice.payment_succeeded and subscription.created events
    }
  } catch (e) {
    console.error('[WEBHOOK PROCESSING ERROR]', e)
  }

  return NextResponse.json({ received: true })
}
