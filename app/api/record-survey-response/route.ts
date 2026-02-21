import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token, reason, detail } = body
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

    await supabaseAdmin.from('lead_surveys').update({ response: { reason, detail }, sent_date: new Date() }).eq('survey_token', token)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[RECORD SURVEY ERROR]', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
