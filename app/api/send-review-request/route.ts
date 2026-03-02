export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { leadId, customerName, customerEmail, businessName, userId } = await req.json();

    if (!customerEmail || !businessName) {
      return NextResponse.json({ error: 'Mangler påkrevde felt' }, { status: 400 });
    }

    const mapsSearchUrl = `https://www.google.com/maps/search/${encodeURIComponent(businessName)}`;

    const html = `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px">
<div style="max-width:600px;margin:0 auto;background:white;padding:30px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
  <h2 style="color:#333">Takk for samarbeidet! 🙏</h2>
  <p>Hei ${customerName || 'der'},</p>
  <p>Vi håper du ble fornøyd med tjenestene våre. En Google-anmeldelse tar bare 30 sekunder og hjelper oss enormt!</p>
  <center><a href="${mapsSearchUrl}" style="display:inline-block;background:#4CAF50;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;font-weight:bold;margin:20px 0">⭐ Gi oss en anmeldelse</a></center>
  <p style="color:#666;font-size:14px">Har du spørsmål? Bare svar på denne e-posten.</p>
  <p>Med vennlig hilsen,<br><strong>${businessName}</strong></p>
  <p style="color:#999;font-size:12px">Sendt via FlowPilot</p>
</div></body></html>`;

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'FlowPilot <no-reply@flowpilot.no>',
          to: [customerEmail],
          subject: `Hva synes du om ${businessName}? ⭐`,
          html,
        }),
      });
    }

    const supabase = createAdminClient();
    if (leadId || userId) {
      try {
        await supabase.from('review_requests').insert({
          user_id: userId,
          lead_id: leadId || null,
          customer_email: customerEmail,
          customer_name: customerName,
          sent_at: new Date().toISOString(),
          link_clicked: false,
          review_left: false,
        });
      } catch (_e) { /* ignore */ }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[REVIEW REQUEST ERROR]', e);
    return NextResponse.json({ error: 'Feil ved sending' }, { status: 500 });
  }
}
