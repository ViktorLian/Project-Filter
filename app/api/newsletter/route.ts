import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function sendWelcomeEmail(to: string, name: string | null) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[EMAIL stub – no RESEND_API_KEY] Welcome email skipped for', to);
    return;
  }
  const firstName = name ? name.split(' ')[0] : 'der';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'FlowPilot <noreply@flowpilot.io>',
      to,
      subject: '🎉 Velkommen til FlowPilot-nyhetsbrevet!',
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#1e293b">
        <div style="background:linear-gradient(135deg,#1e40af,#7c3aed);padding:32px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700">Hei, ${firstName}! 👋</h1>
          <p style="color:#e0e7ff;margin:8px 0 0;font-size:15px">Du er nå med på nyhetsbrevet til FlowPilot</p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px;color:#475569;font-size:15px">Takk for at du meldte deg på! Her er hva du kan forvente å motta:</p>
          <ul style="padding-left:20px;color:#475569;font-size:14px;line-height:1.8">
            <li>💡 Tips og triks for å vokse bedriften din</li>
            <li>🚀 Nyheter om nye funksjoner i FlowPilot</li>
            <li>🎁 Eksklusive tilbud og rabatter for abonnenter</li>
            <li>📊 Bransjeinnsikt og salgsstrategier</li>
          </ul>
          <div style="margin:28px 0;padding:20px;background:#f0fdf4;border-radius:8px;border-left:4px solid #16a34a">
            <p style="margin:0;font-weight:700;color:#15803d;font-size:15px">Velkommensgave – eksklusiv abonnentrabatt</p>
            <p style="margin:6px 0 0;color:#166534;font-size:14px">Som ny abonnent får du <strong>10% ekstrarabatt</strong> som legges oppå vår allerede inkluderte 20% rabatt for 6-månedersplanen – totalt <strong>30% besparelse</strong>.</p>
            <p style="margin:8px 0 0;color:#166534;font-size:14px">Bruk koden <strong>FLOWSTART10</strong> ved bestilling. Tilbudet er gyldig i <strong>10 dager</strong> fra i dag.</p>
          </div>
          <a href="${process.env.NEXTAUTH_URL ?? 'https://flowpilot.no'}" style="display:inline-block;background:#1e40af;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Utforsk FlowPilot</a>
          <p style="margin:28px 0 0;font-size:12px;color:#94a3b8">Du kan melde deg av når som helst. Spørsmål? Svar på denne e-posten eller kontakt oss på flowpilot@hotmail.com</p>
        </div>
      </div>`,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('[RESEND welcome error]', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ugyldig e-post' }, { status: 400 });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const supabase = createAdminClient();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: normalizedEmail, name: name || null, subscribed_at: new Date().toISOString() });

    if (error) {
      console.error('Newsletter insert error:', error);
      return NextResponse.json({ error: 'Feil ved lagring' }, { status: 500 });
    }

    // Send welcome email (non-blocking — don't await to keep response fast)
    sendWelcomeEmail(normalizedEmail, name || null).catch(console.error);

    return NextResponse.json({ success: true, alreadySubscribed: false });
  } catch (err) {
    console.error('Newsletter error:', err);
    return NextResponse.json({ error: 'Intern feil' }, { status: 500 });
  }
}
