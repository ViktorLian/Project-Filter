import { NextResponse } from 'next/server';

/**
 * Retired for security: the former route copied the user's raw password into
 * Stripe metadata. Registration now happens through /api/register and billing
 * starts after the authenticated account exists.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Denne registreringsflyten er erstattet. Opprett konto før betaling.' },
    { status: 410 },
  );
}
