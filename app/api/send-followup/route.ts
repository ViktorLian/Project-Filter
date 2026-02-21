import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
})

export async function POST() {
  try {
    const { data: pending } = await supabaseAdmin
      .from('followup_campaigns')
      .select('*, lead:lead_id(*)')
      .eq('sent', false)
      .lte('next_send_date', new Date().toISOString())

    if (!pending || pending.length === 0) return NextResponse.json({ sent: 0 })

    for (const campaign of pending) {
      const lead = campaign.lead
      // find template for step
      const { data: template } = await supabaseAdmin.from('followup_templates').select('*').eq('user_id', campaign.user_id).eq('step_number', campaign.step).single()
      if (!template) continue

      const body = template.body.replace('{{name}}', lead.customer_name || '').replace('{{email}}', lead.customer_email || '')

      await transporter.sendMail({ to: lead.customer_email, subject: template.subject, html: body })

      await supabaseAdmin.from('followup_campaigns').update({ sent: true }).eq('id', campaign.id)
    }

    return NextResponse.json({ sent: pending.length })
  } catch (e) {
    console.error('[SEND FOLLOWUP ERROR]', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
