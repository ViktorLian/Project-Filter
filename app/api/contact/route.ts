export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { name, email, company, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send email to FlowPilot
    const emailHtml = `
      <h2>Ny henvendelse fra FlowPilot-kontaktskjema</h2>
      <p><strong>Navn:</strong> ${name}</p>
      <p><strong>E-post:</strong> ${email}</p>
      <p><strong>Bedrift:</strong> ${company || 'Ikke oppgitt'}</p>
      <p><strong>Melding:</strong></p>
      <p>${(message as string).replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>Svar direkte til ${email}</small></p>
    `

    await sendEmail(
      'Flowpilot@hotmail.com',
      `FlowPilot kontakt: ${name}`,
      emailHtml
    )

    // Send bekreftelse til kunden
    const confirmationHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
        <h2 style="color:#1e293b">Takk for henvendelsen, ${name}!</h2>
        <p style="color:#475569">Vi har mottatt meldingen din og tar kontakt så snart som mulig.</p>
        <p style="color:#475569"><strong>Din melding:</strong></p>
        <p style="color:#475569;background:#f8fafc;padding:16px;border-radius:8px">${(message as string).replace(/\n/g, '<br>')}</p>
        <p style="color:#94a3b8;font-size:13px;margin-top:30px">FlowPilot — automatiser og voks</p>
      </div>
    `

    await sendEmail(
      email as string,
      'Takk for at du tok kontakt med FlowPilot',
      confirmationHtml
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
