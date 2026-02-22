import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { supabaseAdmin } from '@/lib/supabase'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
})

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    const { data: inactive } = await supabaseAdmin
      .from('subscription_activity')
      .select('*, user:users(*)')
      .lt('last_login', cutoff)
      .eq('is_churning_notified', false)

    if (!inactive || inactive.length === 0) return NextResponse.json({ notified: 0 })

    for (const row of inactive) {
      const emailBody = `
        <h2>Vi mister deg! 😢</h2>
        <p>Hei ${row.user?.first_name || row.user?.business_name || 'kunde'},</p>
        <p>Vi merket at du ikke har brukt FlowPilot på 2 uker.</p>
        <div style="background: #4CAF50; color: white; padding: 20px; border-radius: 5px; text-align: center;">
          <h3>3 MÅNEDER GRATIS</h3>
          <p>Kom tilbake og få 3 gratis måneder!</p>
          <a href="https://flowpilot.no/reactivate" style="background: white; color: #4CAF50; padding: 10px 20px; text-decoration: none; border-radius: 3px; display: inline-block;">Reaktiver nå</a>
        </div>
      `

      await transporter.sendMail({ to: row.user?.email, subject: 'Vi mister deg - 3 måneder gratis! 🎁', html: emailBody })

      await supabaseAdmin.from('subscription_activity').update({ is_churning_notified: true }).eq('id', row.id)
    }

    return NextResponse.json({ notified: inactive.length })
  } catch (e) {
    console.error('[DETECT CHURN ERROR]', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
