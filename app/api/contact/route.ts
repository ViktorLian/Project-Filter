export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

async function sendViaResend(to: string, subject: string, html: string, replyTo?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[EMAIL stub – no RESEND_API_KEY] Skipping email to', to);
    return;
  }
  const body: Record<string, unknown> = {
    from: 'FlowPilot <noreply@flowpilot.io>',
    to,
    subject,
    html,
  };
  if (replyTo) body.reply_to = replyTo;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('[RESEND contact error]', err);
    throw new Error('Failed to send via Resend');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, company, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Manglende påkrevde felt' }, { status: 400 });
    }

    const msgHtml = (message as string).replace(/\n/g, '<br>');

    // Notification to FlowPilot
    await sendViaResend(
      'flowpilot@hotmail.com',
      `Ny kontakthenvendelse: ${name}`,
      `<div style="font-family:Arial,sans-serif;max-width:600px;color:#1e293b">
        <div style="background:#1e40af;padding:24px 32px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700">Ny kontakthenvendelse</h1>
        </div>
        <div style="background:#fff;padding:24px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;color:#64748b;font-size:14px;width:110px">Navn</td><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;font-size:14px">${name}</td></tr>
            <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;color:#64748b;font-size:14px">E-post</td><td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:14px"><a href="mailto:${email}" style="color:#1e40af">${email}</a></td></tr>
            <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;color:#64748b;font-size:14px">Bedrift</td><td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:14px">${company || '—'}</td></tr>
          </table>
          <p style="margin:0 0 8px;font-weight:600;color:#1e293b">Melding:</p>
          <div style="background:#f8fafc;padding:16px;border-radius:8px;color:#475569;font-size:14px;line-height:1.6">${msgHtml}</div>
          <p style="margin:20px 0 0;font-size:12px;color:#94a3b8">Svar direkte på denne e-posten for å nå ${name}</p>
        </div>
      </div>`,
      email,
    );

    // Confirmation to customer
    await sendViaResend(
      email as string,
      `Takk for henvendelsen, ${name}`,
      `<div style="font-family:Arial,sans-serif;max-width:600px;color:#1e293b">
        <div style="background:#1e40af;padding:24px 32px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700">Vi har mottatt henvendelsen din</h1>
        </div>
        <div style="background:#fff;padding:24px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
          <p style="margin:0 0 16px">Hei ${name},</p>
          <p style="margin:0 0 16px;color:#475569">Takk for at du tok kontakt med oss. Vi har mottatt meldingen din og vil svare deg så snart som mulig, vanligvis innen 1 virkedag.</p>
          <p style="margin:0 0 8px;font-weight:600;color:#1e293b">Din melding:</p>
          <div style="background:#f8fafc;padding:16px;border-radius:8px;color:#475569;font-size:14px;line-height:1.6;margin-bottom:24px">${msgHtml}</div>
          <p style="margin:0;font-size:12px;color:#94a3b8">FlowPilot — automatiser og voks</p>
        </div>
      </div>`,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Kunne ikke sende melding' }, { status: 500 });
  }
}
