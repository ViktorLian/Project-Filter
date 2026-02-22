async function resend({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[EMAIL stub – no RESEND_API_KEY]', { to, subject });
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'FlowPilot <noreply@flowpilot.io>', to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('[RESEND ERROR]', err);
  }
}

/** Notify company owner of any new lead */
export async function notifyNewLead(to: string, leadId: string, companyName: string) {
  await resend({
    to,
    subject: `Ny henvendelse – ${companyName}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px">
      <h2 style="color:#1e40af">📋 Ny lead mottatt</h2>
      <p>Du har fått en ny prosjekthenvendelse via ${companyName}.</p>
      <p><a href="${process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads/${leadId}" style="background:#1e40af;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block">Se lead</a></p>
    </div>`,
  });
}

/** Notify company owner of a HIGH-quality lead (score >= 75) */
export async function notifyHighQualityLead(
  to: string,
  leadId: string,
  companyName: string,
  score: number,
  customerName?: string,
  customerEmail?: string,
  customerPhone?: string,
) {
  await resend({
    to,
    subject: `🔥 Høykvalitetslead (score ${score}) – ${companyName}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px">
      <h2 style="color:#16a34a">⭐ Høykvalitetslead mottatt!</h2>
      <p>En ny lead med høy score (${score}/100) har nettopp kommet inn via <strong>${companyName}</strong>.</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0">
        ${customerName ? `<tr><td style="padding:8px;border:1px solid #e2e8f0;color:#64748b">Navn</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600">${customerName}</td></tr>` : ''}
        ${customerEmail ? `<tr><td style="padding:8px;border:1px solid #e2e8f0;color:#64748b">E-post</td><td style="padding:8px;border:1px solid #e2e8f0"><a href="mailto:${customerEmail}">${customerEmail}</a></td></tr>` : ''}
        ${customerPhone ? `<tr><td style="padding:8px;border:1px solid #e2e8f0;color:#64748b">Telefon</td><td style="padding:8px;border:1px solid #e2e8f0"><a href="tel:${customerPhone}">${customerPhone}</a></td></tr>` : ''}
        <tr><td style="padding:8px;border:1px solid #e2e8f0;color:#64748b">Score</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:700;color:#16a34a">${score} / 100</td></tr>
      </table>
      <p><a href="${process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads/${leadId}" style="background:#16a34a;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block">Svar på lead nå</a></p>
      <p style="margin-top:16px;color:#64748b;font-size:12px">Tips: Firmaer som svarer innen 2 timer har 3x høyere sjanse for å vinne jobben.</p>
    </div>`,
  });
}

/** Send confirmation email to the customer who submitted the form */
export async function sendLeadConfirmation(
  to: string,
  customerName: string,
  companyName: string,
) {
  await resend({
    to,
    subject: `Vi har mottatt din henvendelse – ${companyName}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px">
      <h2 style="color:#1e40af">Takk for din henvendelse, ${customerName || 'der'}!</h2>
      <p><strong>${companyName}</strong> har mottatt din forespørsel og vil ta kontakt med deg så snart som mulig.</p>
      <p style="margin-top:24px;color:#64748b;font-size:12px">Denne e-posten ble sendt automatisk via FlowPilot.</p>
    </div>`,
  });
}
