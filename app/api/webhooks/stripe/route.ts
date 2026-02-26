export const dynamic = 'force-dynamic';
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  })
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
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
      process.env.STRIPE_WEBHOOK_SECRET!
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

        // ── New registration flow ──
        if (meta.registration === 'true' && meta.email && meta.companyName) {
          const { companyName, name, email, password } = meta

          // Check if user already exists (idempotency)
          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single()

          if (!existingUser) {
            const hashedPassword = await bcrypt.hash(password, 10)

            // Create company
            const { data: company, error: companyErr } = await supabaseAdmin
              .from('leads_companies')
              .insert({
                name: companyName,
                subscription_status: 'trial',
                subscription_plan: 'starter',
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
              })
              .select('id')
              .single()

            if (companyErr || !company) {
              console.error('[WEBHOOK] Failed to create company:', companyErr)
              break
            }

            // Create user
            const { error: userErr } = await supabaseAdmin
              .from('users')
              .insert({
                name,
                email,
                password: hashedPassword,
                company_id: company.id,
                role: 'admin',
              })

            if (userErr) {
              console.error('[WEBHOOK] Failed to create user:', userErr)
            }
          }
          break
        }

        // ── Existing company subscription update ──
        const { companyId, plan } = meta
        if (companyId) {
          await supabaseAdmin
            .from('leads_companies')
            .update({
              subscription_status: 'active',
              subscription_plan: plan || 'starter',
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
        const status = subscription.status === 'active' ? 'active' : 'inactive'

        await supabaseAdmin
          .from('leads_companies')
          .update({
            subscription_status: status,
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
