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
  await sendEmail(to, '🚀 Velkommen til FlowPilot – din 14-dagers prøveperiode har startet!', `
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
