export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { leadName, leadEmail, leadMessage, leadPhone, user_id, lead_id } = body

    const prompt = `Analyze this lead inquiry:\nName: ${leadName}\nEmail: ${leadEmail}\nMessage: ${leadMessage}\nPhone: ${leadPhone}\n\nReturn JSON with keys: summary, category (price_sensitive|urgent|high_value|standard), sentiment (positive|neutral|negative), action_items (array), response_template (string)`

    const resp = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    })

    const text = resp.choices?.[0]?.message?.content || '{}'
    let analysis = {}
    try { analysis = JSON.parse(text) } catch (e) { analysis = { summary: text } }

    // Save to Supabase
    await supabaseAdmin.from('lead_analysis').insert({
      user_id,
      lead_id,
      ai_summary: (analysis as any).summary || null,
      ai_category: (analysis as any).category || null,
      ai_sentiment: (analysis as any).sentiment || null,
      action_items: (analysis as any).action_items || null,
    })

    // Upsert into group (auto-grouping by category)
    if ((analysis as any).category) {
      const category = (analysis as any).category
      const { data: group } = await supabaseAdmin
        .from('lead_groups')
        .select('id, lead_ids')
        .eq('category', category)
        .eq('user_id', user_id)
        .single()

      if (group) {
        await supabaseAdmin.from('lead_groups').update({ lead_ids: [...(group.lead_ids || []), lead_id] }).eq('id', group.id)
      } else {
        await supabaseAdmin.from('lead_groups').insert({ user_id, category, group_name: category, lead_ids: [lead_id] })
      }
    }

    return NextResponse.json({ analysis })
  } catch (e) {
    console.error('[ANALYZE LEAD ERROR]', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
