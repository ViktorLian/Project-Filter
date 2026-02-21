import { NextResponse } from 'next/server'
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
    const { campaignId } = body
    if (!campaignId) return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 })

    const { data: campaign } = await supabaseAdmin.from('email_campaigns').select('*').eq('id', campaignId).single()
    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

    // Fetch group leads
    const { data: group } = await supabaseAdmin.from('lead_groups').select('*').eq('id', campaign.group_id).single()
    const leadIds = group?.lead_ids || []
    if (leadIds.length === 0) return NextResponse.json({ sent: 0 })

    const { data: leads } = await supabaseAdmin.from('leads').select('*').in('id', leadIds)

    let sent = 0
    for (const lead of leads || []) {
      const bodyHtml = campaign.body.replace('{{name}}', lead.customer_name || '').replace('{{email}}', lead.customer_email || '')
      try {
        await transporter.sendMail({ to: lead.customer_email, subject: campaign.subject, html: bodyHtml })
        sent++
      } catch (e) {
        console.error('Email send failed for', lead.customer_email, e)
      }
    }

    await supabaseAdmin.from('email_campaigns').update({ sent: true }).eq('id', campaignId)

    return NextResponse.json({ sent })
  } catch (e) {
    console.error('[GROUP EMAIL CAMPAIGN ERROR]', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
