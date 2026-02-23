import nodemailer from 'nodemailer'

// Gmail SMTP configuration - lazy init to avoid module-level env issues
function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

// Generic email sending function
export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('SMTP not configured - skipping email')
    return
  }

  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html
    })
    console.log('Email sent to', to)
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

export async function sendLeadNotification(lead: {
  name: string
  email: string
  company?: string
  formName: string
  companyOwnerEmail: string
}) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('SMTP not configured - skipping email')
    return
  }

  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_USER,
      to: lead.companyOwnerEmail,
      subject: `New Lead: ${lead.name}`,
      html: `
        <h2>New Lead Submitted</h2>
        <p><strong>Form:</strong> ${lead.formName}</p>
        <p><strong>Name:</strong> ${lead.name}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        ${lead.company ? `<p><strong>Company:</strong> ${lead.company}</p>` : ''}
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads">View in Dashboard</a></p>
      `
    })
    console.log('Email notification sent')
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}

export async function sendInvoiceEmail(
  to: string,
  subject: string,
  html: string,
  pdfBuffer: Buffer
) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('SMTP not configured - skipping invoice email')
    return
  }

  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
      attachments: [
        {
          filename: 'invoice.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    })
    console.log('Invoice email sent to', to)
  } catch (error) {
    console.error('Failed to send invoice email:', error)
    throw error
  }
}

export async function sendTrialWelcomeEmail(to: string, name: string, businessName: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://flowpilot.no'
  const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  const trialEndFormatted = trialEnd.toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' })

  await sendEmail(to, `Velkommen til FlowPilot – proveperioden din er aktivert`, `
<!DOCTYPE html>
<html lang="no">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#1e40af,#1d4ed8);padding:40px 40px 32px;text-align:center">
          <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:20px">
            <div style="background:rgba(255,255,255,0.15);border-radius:10px;padding:8px 12px;font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.5px">FP</div>
            <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px">FlowPilot</span>
          </div>
          <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:800;line-height:1.3">Velkommen, ${name}.</h1>
          <p style="color:#bfdbfe;margin:10px 0 0;font-size:15px">Kontoen til ${businessName} er aktivert.</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:36px 40px">

          <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.7">
            Din 14-dagers gratis proveperiode er na i gang. Du har full tilgang til alle verktoy og funksjoner i FlowPilot.
            Abonnementet treer ikke i kraft for etter at proveperioden er over.
          </p>

          <!-- Trial box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;margin:24px 0">
            <tr>
              <td style="padding:20px 24px">
                <p style="margin:0 0 12px;font-weight:700;color:#1e3a8a;font-size:14px;text-transform:uppercase;letter-spacing:0.05em">Din proveperiode</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;color:#475569;font-size:14px">Start:</td>
                    <td style="padding:6px 0;color:#1e293b;font-weight:600;font-size:14px;text-align:right">${new Date().toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#475569;font-size:14px">Utloper:</td>
                    <td style="padding:6px 0;color:#1e293b;font-weight:600;font-size:14px;text-align:right">${trialEndFormatted}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#475569;font-size:14px">Abonnement starter:</td>
                    <td style="padding:6px 0;color:#1e293b;font-weight:600;font-size:14px;text-align:right">${trialEndFormatted}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#475569;font-size:14px">Belopet faktureres:</td>
                    <td style="padding:6px 0;color:#1e293b;font-weight:600;font-size:14px;text-align:right">1 290 kr/mnd (Starter) eller valgt plan</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- What's included -->
          <p style="margin:24px 0 12px;font-weight:700;color:#1e293b;font-size:15px">Hva er inkludert:</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${[
              'AI lead-scoring og automatisk behandling',
              'Tilpassede lead-skjemaer for nettsiden',
              'Automatiske e-postsvar til kunder',
              'Faktura-generator med KID-nummer og MVA',
              'Kontantstrom-oversikt og fortjeneste per jobb',
              'Bookingsystem og kalender',
              'Smart oppfolging av ubesvarte leads',
              'AI salgsassistent og vekstverktoy',
            ].map(f => `
            <tr>
              <td style="padding:7px 0;font-size:14px;color:#475569">
                <span style="display:inline-block;width:18px;height:18px;background:#dcfce7;border-radius:50%;text-align:center;line-height:18px;font-size:11px;color:#16a34a;font-weight:700;margin-right:10px">&#10003;</span>
                ${f}
              </td>
            </tr>`).join('')}
          </table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 24px">
            <tr>
              <td align="center">
                <a href="${appUrl}/dashboard" style="display:inline-block;background:#1e40af;color:#ffffff;padding:16px 40px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.02em">
                  Ga til dashboardet ditt
                </a>
              </td>
            </tr>
          </table>

          <!-- Legal -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;margin-top:32px">
            <tr>
              <td style="padding:24px 0 0">
                <p style="margin:0 0 10px;font-size:12px;color:#94a3b8;line-height:1.7">
                  <strong style="color:#64748b">Viktig informasjon om abonnementet ditt:</strong><br>
                  Proveperioden varer i 14 dager fra registreringsdato og utloper ${trialEndFormatted}.
                  Etter proveperiodens slutt trer abonnementet automatisk i kraft, og du faktureres for valgt plan via Stripe.
                  Du kan avbestille abonnementet naar som helst innen proveperiodens utlop uten kostnad.
                  Avbestilling gjores direkte i dashboardet under Innstillinger.
                </p>
                <p style="margin:0 0 10px;font-size:12px;color:#94a3b8;line-height:1.7">
                  Abonnementet fornyes automatisk hver maned. Du kan oppgradere, nedgradere eller avbestille naar som helst.
                  Ingen bindingstid. Betaling behandles sikkert av Stripe.
                </p>
                <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.7">
                  Kontakt: <a href="mailto:Flowpilot@hotmail.com" style="color:#3b82f6">Flowpilot@hotmail.com</a> |
                  Denne e-posten ble sendt automatisk ved opprettelse av konto pa FlowPilot.
                </p>
              </td>
            </tr>
          </table>

        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>
  `)
}
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
      <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:40px 32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800">Velkommen til FlowPilot!</h1>
        <p style="color:#bfdbfe;margin:8px 0 0">14-dagers gratis prøveperiode aktivert</p>
      </div>
      <div style="padding:32px">
        <p style="color:#1e293b;font-size:16px">Hei ${name}! 👋</p>
        <p style="color:#475569">Du og ${businessName} er nå i gang med FlowPilot. Her er hva du kan gjøre med en gang:</p>
        <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:20px 0">
          <p style="margin:0 0 12px;font-weight:700;color:#1e293b">✅ Inkludert i prøveperioden:</p>
          <ul style="margin:0;padding-left:20px;color:#475569;line-height:2">
            <li>Opprett og publiser lead-skjemaer</li>
            <li>AI-scoret lead-behandling</li>
            <li>Automatiske e-postsvar til kunder</li>
            <li>Faktura og kontantstrøm-oversikt</li>
            <li>Booking-system og kalender</li>
            <li>SMS-påminnelser og no-show-deteksjon</li>
          </ul>
        </div>
        <a href="${appUrl}/dashboard" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px">Gå til dashbordet →</a>
        <p style="color:#94a3b8;font-size:13px;margin-top:24px">Prøveperioden din utløper om 14 dager. Du vil bli fakturert automatisk via Stripe hvis du ikke kansellerer. Ingen bindingstid.</p>
      </div>
    </div>
  `)
}

export async function sendTrialExpiryWarningEmail(to: string, name: string, daysLeft: number) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://flowpilot.no'
  await sendEmail(to, `⚠️ Prøveperioden din utløper om ${daysLeft} dager`, `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1e293b">Hei ${name},</h2>
      <p style="color:#475569">Din gratis prøveperiode på FlowPilot utløper om <strong>${daysLeft} dag${daysLeft !== 1 ? 'er' : ''}</strong>.</p>
      <p style="color:#475569">Oppgrader nå for å beholde alle dine leads, skjemaer og data.</p>
      <a href="${appUrl}/dashboard/billing" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700">Oppgrader nå →</a>
    </div>
  `)
}
