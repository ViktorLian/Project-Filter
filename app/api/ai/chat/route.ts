export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

function getOpenAI() {
  const { default: OpenAI } = require('openai');
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `Du er en ekspert AI salgsassistent for FlowPilot CRM, et norsk SaaS-produkt for sma og mellomstore bedrifter.
Du hjelper bedriftseiere med:
- Skriving av profesjonelle oppfolgingsepost pa norsk (bokmaal)
- Salgsargumenter og pitches
- Moteplaner og forberedelser
- Analyse av salgsmuligheter
- Strategier for leadsgenerering og oppfolging
- CRM-tips og beste praksis

Svar alltid pa norsk bokmaal. Vaer konkret, profesjonell og handlingsorientert.
Slipp emojier i svarene. Hold svarene konsise men innholdsrike.`;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { message, history = [] } = await req.json();
    if (!message) return NextResponse.json({ error: 'Missing message' }, { status: 400 });

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        reply: 'AI-funksjonen krever en OpenAI API-nokkel. Legg til OPENAI_API_KEY i miljovariabler for a aktivere AI Salgsassistent.',
      });
    }

    const openai = getOpenAI();

    const chatHistory = history.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...chatHistory,
        { role: 'user', content: message },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message?.content || 'Beklager, fikk ikke svar fra AI.';
    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error('[AI CHAT ERROR]', e);
    return NextResponse.json({
      reply: `AI feil: ${e.message || 'Ukjent feil'}. Sjekk at OPENAI_API_KEY er konfigurert.`,
    });
  }
}
