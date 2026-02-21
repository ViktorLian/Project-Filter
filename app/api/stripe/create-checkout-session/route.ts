import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' })

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await req.json()
    const { priceId, billingTerm, plan } = body as { priceId: string; billingTerm: 'monthly' | 'prepaid6'; plan?: string }
    if (!priceId || !billingTerm) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

    // Retrieve price to get currency and unit amount
    const price = await stripe.prices.retrieve(priceId)
    if (!price) return NextResponse.json({ error: 'Price not found' }, { status: 404 })

    const sessAny: any = session
    const userId = sessAny?.user?.id || sessAny?.user?.sub || null

    if (billingTerm === 'monthly') {
      const checkout = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: { userId: String(userId), plan: plan || '' },
        success_url: process.env.NEXT_PUBLIC_APP_URL + '/dashboard?upgrade=success',
        cancel_url: process.env.NEXT_PUBLIC_APP_URL + '/dashboard?upgrade=cancel',
      })
      return NextResponse.json({ url: checkout.url })
    }

    // prepaid 6 months: charge upfront amount = unit_amount * 6 * 0.8 (20% discount)
    const unit = price.unit_amount || 0
    const prepaidAmount = Math.round(unit * 6 * 0.8)
    const productName = (price.product as any)?.name || plan || 'FlowPilot plan'

    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: price.currency || 'nok',
            product_data: { name: `${productName} — 6 months (20% off)` },
            unit_amount: prepaidAmount,
          },
          quantity: 1,
        },
      ],
      metadata: { userId: String(userId), billingTerm: 'prepaid6', originalPriceId: priceId, plan: plan || '' },
      success_url: process.env.NEXT_PUBLIC_APP_URL + '/dashboard?upgrade=success',
      cancel_url: process.env.NEXT_PUBLIC_APP_URL + '/dashboard?upgrade=cancel',
    })

    return NextResponse.json({ url: checkout.url })
  } catch (e) {
    console.error('[CREATE CHECKOUT ERROR]', e)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
