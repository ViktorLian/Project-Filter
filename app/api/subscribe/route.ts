import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { stripe, SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    // Use NextAuth session instead of Supabase auth
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      )
    }
    
    // Use service role key to bypass RLS
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
    const userId = (session.user as any).id
    
    const { plan } = await request.json()
    
    if (!plan || !SUBSCRIPTION_PLANS[plan as SubscriptionPlan]) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }
    
    const selectedPlan = SUBSCRIPTION_PLANS[plan as SubscriptionPlan]
    
    // Get company - for now use first company or create with email-based slug
    const { data: companies } = await supabase
      .from('leads_companies')
      .select('*')
      .limit(1)
    
    let company = companies?.[0]
    
    // If no company exists, create one
    if (!company) {
      const slug = session.user.email?.split('@')[0].replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'company-' + Date.now()
      const { data: newCompany, error: createError } = await supabase
        .from('leads_companies')
        .insert({
          name: session.user.email?.split('@')[0] || 'My Company',
          slug: slug
        })
        .select()
        .single()
      
      if (createError) {
        console.error('Error creating company:', createError)
        return NextResponse.json(
          { error: 'Could not create company' },
          { status: 500 }
        )
      }
      
      company = newCompany
    }
    
    // Create Stripe Checkout session with dynamic price
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'nok',
            product_data: {
              name: selectedPlan.name,
              description: selectedPlan.features.join(', ')
            },
            unit_amount: selectedPlan.price * 100, // Convert kr to øre
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?canceled=true`,
      customer_email: session.user.email!,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId: userId,
          companyId: company.id,
          plan
        }
      },
      metadata: {
        userId: userId,
        companyId: company.id,
        plan
      }
    })
    
    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
