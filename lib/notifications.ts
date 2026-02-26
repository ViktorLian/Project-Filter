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
        <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700">Jobben er fullført</h1>
        <p style="color:#bbf7d0;margin:4px 0 0;font-size:14px">${companyName}</p>
      </div>
      <div style="background:#fff;padding:24px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
        <p style="margin:0 0 16px">Hei ${customerName || 'der'},</p>
        <p style="margin:0 0 20px;color:#475569">Takk for at du valgte <strong>${companyName}</strong>. Vi håper du er fornøyd med arbeidet.</p>
        <p style="margin:0 0 20px;color:#475569">Kunne du ta deg 1 minutt til å legge igjen en anmeldelse på Google? Det hjelper oss enormt og betyr veldig mye.</p>
        <a href="${reviewLink}" style="display:inline-block;background:#16a34a;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Legg igjen anmeldelse på Google</a>
        <p style="margin:20px 0 0;font-size:12px;color:#94a3b8">Denne e-posten ble sendt automatisk via FlowPilot etter at jobben ble markert som fullført.</p>
      </div>
    </div>`,
  });
}

// ─── Trial onboarding email sequences ───────────────────────────────────────

function trialBase(title: string, subtitle: string, body: string, ctaText: string, ctaUrl: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
    <div style="background:linear-gradient(135deg,#1e40af,#7c3aed);padding:28px 32px;border-radius:10px 10px 0 0">
      <div style="color:#93c5fd;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">FlowPilot</div>
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;line-height:1.3">${title}</h1>
      <p style="color:#bfdbfe;margin:6px 0 0;font-size:14px">${subtitle}</p>
    </div>
    <div style="background:#fff;padding:28px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 10px 10px">
      ${body}
      <div style="margin-top:28px">
        <a href="${ctaUrl}" style="display:inline-block;background:#1e40af;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">${ctaText}</a>
      </div>
      <p style="margin:24px 0 0;font-size:11px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:16px">
        FlowPilot · Du mottar denne e-posten fordi du registrerte deg for en gratis prøveperiode.<br>
        <a href="${ctaUrl}/dashboard/settings" style="color:#94a3b8">Administrer varslinger</a>
      </p>
    </div>
  </div>`;
}

const APP_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://flowpilot.no';

/** Day 1 – Welcome */
export async function sendTrialDay1(to: string, name: string) {
  const firstName = (name || '').split(' ')[0] || 'der';
  await resend({
    to,
    subject: `Velkommen til FlowPilot, ${firstName}! Her er det første du bør gjøre`,
    html: trialBase(
      `Velkommen, ${firstName}!`,
      'La oss komme i gang – det tar 5 minutter',
      `<p style="margin:0 0 16px">Du har nå 14 dager gratis tilgang til FlowPilot. La oss sørge for at du får mest mulig ut av prøveperioden.</p>
      <p style="margin:0 0 8px;font-weight:700;color:#0f172a">Det første du bør gjøre:</p>
      <ol style="padding-left:20px;margin:0 0 16px;color:#475569;line-height:1.8">
        <li><strong>Fyll inn bedriftsinformasjon</strong> under Innstillinger (brukes på fakturaer og tilbud)</li>
        <li><strong>Opprett ditt første lead</strong> – gå til Leads og klikk "Ny lead"</li>
        <li><strong>Del kundeskjemaet ditt</strong> – finn lenken under Skjemaer og del den med kunder</li>
      </ol>
      <p style="margin:0;color:#475569">Har du spørsmål? Svar på denne e-posten – vi hjelper deg gjerne.</p>`,
      'Gå til dashboardet mitt',
      `${APP_URL}/dashboard`,
    ),
  });
}

/** Day 3 – Tips on leads */
export async function sendTrialDay3(to: string, name: string) {
  const firstName = (name || '').split(' ')[0] || 'der';
  await resend({
    to,
    subject: `${firstName}, visste du at du kan automatisere oppfølging av leads?`,
    html: trialBase(
      'Spar tid med automatisk oppfølging',
      'Slik bruker du leads på best mulig måte',
      `<p style="margin:0 0 16px">Du har vært inne 3 dager – flott! Her er et tips som sparer deg for timer med manuelt arbeid.</p>
      <p style="margin:0 0 8px;font-weight:700;color:#0f172a">Lead Score – la systemet prioritere for deg:</p>
      <p style="margin:0 0 16px;color:#475569">FlowPilot scorer alle leads automatisk basert på hva de svarer i skjemaet. Leads med høy score (70+) er kunder som er klare til å kjøpe nå.</p>
      <p style="margin:0 0 8px;font-weight:700;color:#0f172a">Slik bruker du det:</p>
      <ol style="padding-left:20px;margin:0 0 16px;color:#475569;line-height:1.8">
        <li>Sorter leads på score i dashboard</li>
        <li>Ring de med høyest score først</li>
        <li>Bruk notatfeltet til å logge samtaler</li>
        <li>Oppdater status til "Vant" eller "Tapt" etter oppfølging</li>
      </ol>`,
      'Se leadene mine',
      `${APP_URL}/dashboard/leads`,
    ),
  });
}

/** Day 7 – Invoice feature */
export async function sendTrialDay7(to: string, name: string) {
  const firstName = (name || '').split(' ')[0] || 'der';
  await resend({
    to,
    subject: `${firstName}, har du sendt din første faktura i FlowPilot?`,
    html: trialBase(
      'Fakturaer som ser profesjonelle ut',
      'Lag, send og følg opp fakturaer på minutter',
      `<p style="margin:0 0 16px">Halvveis i prøveperioden! På tide å prøve fakturafunksjonen.</p>
      <p style="margin:0 0 8px;font-weight:700;color:#0f172a">Hva du kan gjøre:</p>
      <ul style="padding-left:20px;margin:0 0 16px;color:#475569;line-height:1.8">
        <li>Lag fakturaer med varelinjer, timer og timepris</li>
        <li>MVA beregnes automatisk (25%, 15% eller 0%)</li>
        <li>Last ned som PDF med en klikk</li>
        <li>KID-nummer genereres automatisk fra innstillingene dine</li>
        <li>Hold oversikt over hva som er betalt og hva som forfaller</li>
      </ul>
      <p style="margin:0;color:#475569">Tips: Fyll inn kontonummer og org.nr under Innstillinger → Fakturering – da ser fakturaen din helt profesjonell ut.</p>`,
      'Opprett min første faktura',
      `${APP_URL}/dashboard/invoices`,
    ),
  });
}

/** Day 14 – Trial ending */
export async function sendTrialDay14(to: string, name: string) {
  const firstName = (name || '').split(' ')[0] || 'der';
  await resend({
    to,
    subject: `${firstName}, prøveperioden din utløper om 1 dag`,
    html: trialBase(
      'Prøveperioden nærmer seg slutten',
      'Ikke mist tilgangen til dataene dine',
      `<p style="margin:0 0 16px">Hei ${firstName}, den gratis prøveperioden din utløper i morgen.</p>
      <p style="margin:0 0 16px;color:#475569">For å fortsette å bruke FlowPilot og beholde alle leads, fakturaer, kunder og innstillinger du har satt opp – trenger du å aktivere abonnementet.</p>
      <p style="margin:0 0 8px;font-weight:700;color:#0f172a">FlowPilot Starter – 1 290 kr/mnd:</p>
      <ul style="padding-left:20px;margin:0 0 16px;color:#475569;line-height:1.8">
        <li>Ubegrenset leads og fakturaer</li>
        <li>Automatisk lead-scoring</li>
        <li>PDF-fakturaer med KID og MVA</li>
        <li>Kundeskjema på nettstedet ditt</li>
        <li>Kalender og jobbhåndtering</li>
      </ul>
      <p style="margin:0;color:#dc2626;font-weight:600">Hvis du ikke fornyer, mister du tilgang til alt du har lagt inn.</p>`,
      'Aktiver abonnement nå',
      `${APP_URL}/dashboard/settings`,
    ),
  });
}
