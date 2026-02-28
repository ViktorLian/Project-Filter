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
          const { companyName, name, email, password, plan } = meta

          // Check if user already exists (idempotency)
          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle()

          if (!existingUser) {
            // 1. Create Supabase Auth user (so signInWithPassword works)
            const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
              email,
              password,
              email_confirm: true,
              user_metadata: { name, business_name: companyName },
            })

            if (authErr || !authUser?.user) {
              console.error('[WEBHOOK] Failed to create Auth user:', authErr)
              break
            }

            // 2. Create company with correct plan
            const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            const { data: company, error: companyErr } = await supabaseAdmin
              .from('leads_companies')
              .insert({
                name: companyName,
                subscription_status: session.subscription ? 'active' : 'trialing',
                subscription_plan: plan || 'starter',
                trial_ends_at: trialEndsAt,
                stripe_customer_id: session.customer as string || null,
                stripe_subscription_id: session.subscription as string || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select('id')
              .single()

            if (companyErr || !company) {
              console.error('[WEBHOOK] Failed to create company:', companyErr)
              await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
              break
            }

            // 3. Create public.users record linked to the Auth user
            const { error: userErr } = await supabaseAdmin
              .from('users')
              .insert({
                id: company.id,          // user.id == company.id (FlowPilot convention)
                auth_user_id: authUser.user.id,
                name,
                email,
                business_name: companyName,
                company_id: company.id,
                role: 'admin',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })

            if (userErr) {
              console.error('[WEBHOOK] Failed to create user record:', userErr)
            } else {
              // Also insert leads_companies user_id link
              await supabaseAdmin
                .from('leads_companies')
                .update({ user_id: company.id })
                .eq('id', company.id)
              console.log('[WEBHOOK] Account created for', email, 'plan:', plan || 'starter')
            }
          } else {
            console.log('[WEBHOOK] Account already exists for', email)
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
