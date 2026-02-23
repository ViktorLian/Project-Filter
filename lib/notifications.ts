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
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#1e293b">
      <div style="background:#1e40af;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700">Ny lead mottatt</h1>
        <p style="color:#bfdbfe;margin:4px 0 0;font-size:14px">${companyName}</p>
      </div>
      <div style="background:#fff;padding:24px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
        <p style="margin:0 0 20px;color:#475569">Du har mottatt en ny prosjekthenvendelse. Åpne dashboardet for å se detaljer og ta kontakt raskt.</p>
        <a href="${process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads/${leadId}" style="display:inline-block;background:#1e40af;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Se lead i dashboardet</a>
        <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">FlowPilot – automatisk varsel</p>
      </div>
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
    subject: `Høykvalitetslead (score ${score}/100) – ${companyName}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#1e293b">
      <div style="background:#16a34a;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700">Høykvalitetslead mottatt</h1>
        <p style="color:#bbf7d0;margin:4px 0 0;font-size:14px">${companyName} – score ${score}/100</p>
      </div>
      <div style="background:#fff;padding:24px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
        <p style="margin:0 0 20px;color:#475569">En ny lead med høy score har kommet inn. Kontakt dem raskt – bedrifter som svarer innen 2 timer har 3x høyere sjansefor å vinne jobben.</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          ${customerName ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;color:#64748b;font-size:14px;width:120px">Navn</td><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;font-size:14px">${customerName}</td></tr>` : ''}
          ${customerEmail ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;color:#64748b;font-size:14px">E-post</td><td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:14px"><a href="mailto:${customerEmail}" style="color:#1e40af">${customerEmail}</a></td></tr>` : ''}
          ${customerPhone ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;color:#64748b;font-size:14px">Telefon</td><td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:14px"><a href="tel:${customerPhone}" style="color:#1e40af">${customerPhone}</a></td></tr>` : ''}
          <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;color:#64748b;font-size:14px">Lead score</td><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:700;font-size:14px;color:#16a34a">${score} / 100</td></tr>
        </table>
        <a href="${process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads/${leadId}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Svar på lead nå</a>
        <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">FlowPilot – automatisk varsel</p>
      </div>
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
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#1e293b">
      <div style="background:#1e40af;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700">Henvendelse mottatt</h1>
      </div>
      <div style="background:#fff;padding:24px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
        <p style="margin:0 0 16px">Hei ${customerName || 'der'},</p>
        <p style="margin:0 0 16px;color:#475569"><strong>${companyName}</strong> har mottatt din forespørsel og vil ta kontakt med deg så snart som mulig.</p>
        <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">Denne e-posten ble sendt automatisk via FlowPilot.</p>
      </div>
    </div>`,
  });
}

/** Send Google review request to customer after job completion */
export async function sendReviewRequest(
  to: string,
  customerName: string,
  companyName: string,
  googleReviewUrl: string | null,
) {
  const reviewLink = googleReviewUrl || 'https://g.page/r/review';
  await resend({
    to,
    subject: `Takk for at du valgte ${companyName} – legg igjen en anmeldelse`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#1e293b">
      <div style="background:#16a34a;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700">Jobben er fullfort</h1>
        <p style="color:#bbf7d0;margin:4px 0 0;font-size:14px">${companyName}</p>
      </div>
      <div style="background:#fff;padding:24px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
        <p style="margin:0 0 16px">Hei ${customerName || 'der'},</p>
        <p style="margin:0 0 20px;color:#475569">Takk for at du valgte <strong>${companyName}</strong>. Vi haper du er fornyd med arbeidet.</p>
        <p style="margin:0 0 20px;color:#475569">Kunne du ta deg 1 minutt til aa legge igjen en anmeldelse pa Google? Det hjelper oss enormt og betyr veldig mye.</p>
        <a href="${reviewLink}" style="display:inline-block;background:#16a34a;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Legg igjen anmeldelse pa Google</a>
        <p style="margin:20px 0 0;font-size:12px;color:#94a3b8">Denne e-posten ble sendt automatisk via FlowPilot etter at jobben ble markert som fullfort.</p>
      </div>
    </div>`,
  });
}
