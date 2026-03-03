import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function sendViaResend(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[SERVICE INQUIRY EMAIL stub]', { to, subject });
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'FlowPilot <noreply@flowpilot.io>', to, subject, html }),
  });
  if (!res.ok) console.error('[RESEND service-inquiry error]', await res.text());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, company, industry, services, goals, budget, message } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Navn og e-post er påkrevd' }, { status: 400 });
    }

    const serviceList = Array.isArray(services) ? services.join(', ') : (services || 'Ikke oppgitt');
    const goalList = Array.isArray(goals) ? goals.join(', ') : (goals || 'Ikke oppgitt');

    // Email to FlowPilot owner
    await sendViaResend(
      'flowpilot@hotmail.com',
      `Ny tjenesteforespørsel fra ${name} – ${serviceList}`,
      `<div style="font-family:Arial,sans-serif;max-width:640px;color:#1e293b">
        <div style="background:#1e40af;padding:24px 32px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:18px;font-weight:700">Ny tjenesteforespørsel</h1>
          <p style="color:#bfdbfe;margin:4px 0 0;font-size:14px">Fra flowpilot.no kontaktskjema</p>
        </div>
        <div style="background:#fff;padding:24px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#64748b;width:140px;font-size:14px">Navn</td><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;font-size:14px">${name}</td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#64748b;font-size:14px">E-post</td><td style="padding:8px 12px;border:1px solid #e2e8f0;font-size:14px"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#64748b;font-size:14px">Telefon</td><td style="padding:8px 12px;border:1px solid #e2e8f0;font-size:14px">${phone || 'Ikke oppgitt'}</td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#64748b;font-size:14px">Bedrift</td><td style="padding:8px 12px;border:1px solid #e2e8f0;font-size:14px">${company || 'Ikke oppgitt'}</td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#64748b;font-size:14px">Bransje</td><td style="padding:8px 12px;border:1px solid #e2e8f0;font-size:14px">${industry || 'Ikke oppgitt'}</td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#64748b;font-size:14px">Tjenester</td><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;font-size:14px;color:#1e40af">${serviceList}</td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#64748b;font-size:14px">Mål</td><td style="padding:8px 12px;border:1px solid #e2e8f0;font-size:14px">${goalList}</td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#64748b;font-size:14px">Budsjett</td><td style="padding:8px 12px;border:1px solid #e2e8f0;font-size:14px">${budget || 'Ikke oppgitt'}</td></tr>
            ${message ? `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#64748b;font-size:14px">Melding</td><td style="padding:8px 12px;border:1px solid #e2e8f0;font-size:14px">${message}</td></tr>` : ''}
          </table>
          <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">Svar direkte til ${email} · Mottatt via flowpilot.no</p>
        </div>
      </div>`
    );

    // Confirmation email to the customer
    const firstName = name.split(' ')[0];
    await sendViaResend(
      email,
      'Vi har mottatt din forespørsel – FlowPilot',
      `<div style="font-family:Arial,sans-serif;max-width:600px;color:#1e293b">
        <div style="background:linear-gradient(135deg,#1e40af,#7c3aed);padding:32px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">Takk, ${firstName}!</h1>
          <p style="color:#e0e7ff;margin:8px 0 0;font-size:15px">Vi har mottatt din forespørsel</p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px;color:#475569;font-size:15px">Hei ${firstName},</p>
          <p style="margin:0 0 16px;color:#475569;font-size:15px">Vi har mottatt din forespørsel om <strong>${serviceList}</strong> og vil ta kontakt innen 24 timer.</p>
          <div style="margin:24px 0;padding:20px;background:#eff6ff;border-radius:8px;border-left:4px solid #1e40af">
            <p style="margin:0;font-weight:700;color:#1e3a8a;font-size:14px">Hva skjer videre?</p>
            <ol style="margin:10px 0 0;padding-left:18px;color:#1e40af;font-size:14px;line-height:1.8">
              <li>Vi gjennomgår forespørselen din</li>
              <li>Vi planlegger et gratis rådgivningsmøte</li>
              <li>Vi sender deg et skreddersydd tilbud</li>
            </ol>
          </div>
          <p style="margin:0 0 24px;color:#475569;font-size:14px">Har du spørsmål i mellomtiden? Svar på denne e-posten eller ring oss direkte.</p>
          <a href="https://flowpilot.no" style="display:inline-block;background:#1e40af;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Besøk FlowPilot</a>
          <p style="margin:28px 0 0;font-size:12px;color:#94a3b8">FlowPilot – automatiser og voks · flowpilot@hotmail.com</p>
        </div>
      </div>`
    );

    // Save to Supabase so you can view all inquiries in the dashboard
    try {
      const supabase = createAdminClient();
      await supabase.from('service_inquiries').insert({
        name, email, phone: phone || null, company: company || null,
        industry: industry || null, services: serviceList,
        goals: goalList, budget: budget || null,
        message: message || null, created_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.error('[SERVICE INQUIRY DB SAVE ERROR]', dbErr);
      // Non-fatal: emails already sent
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[SERVICE INQUIRY ERROR]', err);
    return NextResponse.json({ error: 'Intern feil' }, { status: 500 });
  }
}
