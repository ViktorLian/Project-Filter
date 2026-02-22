export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { leadId, leadEmail, leadName, user_id } = body

    const token = crypto.randomBytes(16).toString('hex')

    await supabaseAdmin.from('lead_surveys').insert({ lead_id: leadId, user_id, survey_token: token, sent_date: new Date(), survey_type: 'why_rejected' })

    const surveyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/survey/${token}`

    const emailBody = `
      <h2>Vi mister deg! 😢</h2>
      <p>Hei ${leadName},</p>
      <p>Vi merket at du valgte en annen løsning. Vi vil gjerne lære og bli bedre!</p>
      <p><a href="${surveyUrl}?reason=price">Pris var for høy</a></p>
      <p><a href="${surveyUrl}?reason=features">Mangler features</a></p>
      <p><a href="${surveyUrl}?reason=support">Dårlig support</a></p>
      <p><a href="${surveyUrl}?reason=other">Annet</a></p>
    `

    await transporter.sendMail({ to: leadEmail, subject: 'Hva mangler hos oss? 🤔', html: emailBody })

    return NextResponse.json({ survey_sent: true })
  } catch (e) {
    console.error('[SEND SURVEY ERROR]', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
