import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ugyldig e-post' }, { status: 400 });
    }
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        { email: email.toLowerCase().trim(), name: name || null, subscribed_at: new Date().toISOString() },
        { onConflict: 'email', ignoreDuplicates: true }
      );
    if (error) {
      console.error('Newsletter insert error:', error);
      return NextResponse.json({ error: 'Feil ved lagring' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Newsletter error:', err);
    return NextResponse.json({ error: 'Intern feil' }, { status: 500 });
  }
}
