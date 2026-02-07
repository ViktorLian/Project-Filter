import nodemailer from 'nodemailer'

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

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
    await transporter.sendMail({
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
    await transporter.sendMail({
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
