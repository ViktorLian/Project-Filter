export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' })

// Returns live price data for Starter/Pro/Enterprise using lookup keys or fallback price IDs
export async function GET() {
  try {
    // Prefer lookup keys (set these in your Stripe products/prices) for dynamic mapping
    const starterKey = process.env.STRIPE_PRICE_LOOKUP_STARTER || process.env.STRIPE_PRICE_STARTER_ID || process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_ID
    const proKey = process.env.STRIPE_PRICE_LOOKUP_PRO || process.env.STRIPE_PRICE_PRO_ID || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ID
    const enterpriseKey = process.env.STRIPE_PRICE_LOOKUP_ENTERPRISE || process.env.STRIPE_PRICE_ENTERPRISE_ID || process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_ID

    const resolvePrice = async (key: string | undefined) => {
      if (!key) return null
      // If looks like a price ID start with price_
      if (key.startsWith('price_')) {
        const p = await stripe.prices.retrieve(key as string, { expand: ['product'] })
        return p
      }
      // Otherwise try lookup by lookup_key
      const list = await stripe.prices.list({ lookup_keys: [key], active: true, limit: 1, expand: ['data.product'] })
      return list.data[0] || null
    }

    const [starter, pro, enterprise] = await Promise.all([
      resolvePrice(starterKey),
      resolvePrice(proKey),
      resolvePrice(enterpriseKey),
    ])

    const format = (p: any) => {
      if (!p) return null
      const amount = p.unit_amount || 0
      const currency = (p.currency || 'nok').toUpperCase()
      return {
        id: p.id,
        display: Math.round(amount / 100).toLocaleString('no-NO'),
        amount,
        currency,
        product: p.product,
      }
    }

    return NextResponse.json({ starter: format(starter), pro: format(pro), enterprise: format(enterprise) })
  } catch (e) {
    console.error('[STRIPE PRICES ERROR]', e)
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 })
  }
}
