export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}

const SYSTEM_PROMPT = `Du er en ekspert AI salgsassistent for FlowPilot CRM, et norsk SaaS-produkt for sma og mellomstore bedrifter.
Du hjelper bedriftseiere med:
- Skriving av profesjonelle oppfolgingse-poster pa norsk bokmal
- Salgsargumenter og pitches
- Moteplaner og forberedelser
- Analyse av salgsmuligheter
- Strategier for leadsgenerering og oppfolging
- CRM-tips og beste praksis

Svar alltid pa norsk bokmal. Ver konkret, profesjonell og handlingsorientert.
Hold svarene konsise men innholdsrike. Ingen emojier.`;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { message, history = [] } = await req.json();
    if (!message) return NextResponse.json({ error: 'Missing message' }, { status: 400 });

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        reply: 'AI-funksjonen krever en OpenAI API-nokkel. Legg til OPENAI_API_KEY i miljovariabler for a aktivere AI Salgsassistent.',
      });
    }

    const openai = getOpenAI();
    const msgs = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...(history as { role: string; content: string }[])
        .slice(-20)
        .map((m) => ({ role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user', content: m.content })),
      { role: 'user' as const, content: message },
    ];

    const result = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: msgs,
      max_tokens: 800,
      temperature: 0.7,
    });

    const reply = result.choices[0]?.message?.content || 'Beklager, fikk ikke svar fra AI.';
    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error('[AI CHAT ERROR]', e);
    return NextResponse.json({
      reply: 'AI svarte ikke. Sjekk at OPENAI_API_KEY er konfigurert i Vercel-innstillinger.',
    });
  }
}
