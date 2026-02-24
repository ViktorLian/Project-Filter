export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase'

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { leadName, leadEmail, leadMessage, leadPhone, user_id, lead_id } = body

    const prompt = `Analyser denne lead-henvendelsen:\nNavn: ${leadName}\nE-post: ${leadEmail}\nMelding: ${leadMessage}\nTelefon: ${leadPhone}\n\nReturner JSON med nokler: summary, category (price_sensitive|urgent|high_value|standard), sentiment (positive|neutral|negative), action_items (array), response_template (string)`

    const openai = getOpenAI();
    const result = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Du er en norsk B2B salgsanalytiker. Svar kun med gyldig JSON.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
    const text = result.choices[0]?.message?.content || '{}';

    let analysis = {}
    try { analysis = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}') } catch (e) { analysis = { summary: text } }

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
