export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}

const SYSTEM_PROMPT = `Du er FlowPilot Assistant - en vennlig og hjelpsom chatbot.

OM FLOWPILOT:
FlowPilot er et CRM for norske sma bedrifter - handle verkere, konsulenter, frilansere og serviceyrker.

PRISING:
- Starter: 1 290 kr/mnd - 100 leads, 2 skjemaer, basis analyse
- Pro: 2 590 kr/mnd (POPULAER) - 500 leads, 20 skjemaer, AI, kampanjer
- Enterprise: 3 990 kr/mnd - Ubegrenset, full API, dedikert support

GRATIS TRIAL: 14 dager med full tilgang. Kort kreves, belastes ikke i prøveperioden.

INSTRUKSJONER:
- Svar kort og vennlig (maks 2-3 setninger)
- Forklar enkelt - ikke teknisk jargong
- Hvis de spor om kjop: Du kan starte pa flowpilot.no eller kontakt Flowpilot@hotmail.com
- Ver alltid positiv og hjelpsom
- Svar pa NORSK bokmal`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const openai = getOpenAI();
    const msgs = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...(messages as { role: string; content: string }[])
        .slice(-15)
        .map((m) => ({ role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user', content: m.content })),
    ];

    const result = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: msgs,
      max_tokens: 400,
      temperature: 0.7,
    });

    const reply = result.choices[0]?.message?.content || 'Beklager, fikk ikke svar.';
    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error('[CHATBOT ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
