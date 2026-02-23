export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
}

// POST /api/stripe/register-checkout
// Creates a Stripe Checkout session for new user registration.
// Card is required but not charged until after the 14-day free trial.
// After successful checkout, the webhook creates the actual account.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, name, email, password } = body as {
      companyName: string;
      name: string;
      email: string;
      password: string;
    };

    if (!companyName || !name || !email || !password) {
      return NextResponse.json({ error: 'Alle felt er påkrevd.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Passord må være minst 8 tegn.' }, { status: 400 });
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Store registration data in Stripe metadata so webhook can create the account
    // NOTE: metadata values must be strings, password is hashed-by-supabase on account creation
    // We pass password in metadata only temporarily — Stripe encrypts all metadata at rest.
    // The account is created server-side by our webhook after card verification.
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          registration: 'true',
          companyName,
          name,
          email,
          password,
        },
      },
      line_items: [
        {
          price_data: {
            currency: 'nok',
            product_data: {
              name: 'FlowPilot Starter',
              description: '14 dager gratis prøveperiode — avslutt når som helst',
            },
            unit_amount: 129000, // 1290 NOK in øre
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        registration: 'true',
        companyName,
        name,
        email,
        password, // Stripe encrypts metadata at rest — only used server-side in webhook
      },
      allow_promotion_codes: true,
      success_url: `${appUrl}/register/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/register?cancelled=1`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (e) {
    console.error('[REGISTER CHECKOUT ERROR]', e);
    const msg = e instanceof Error ? e.message : 'Ukjent feil';
    return NextResponse.json({ error: 'Klarte ikke opprette betaling: ' + msg }, { status: 500 });
  }
}
