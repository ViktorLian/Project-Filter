export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

function getGemini() {
  if (!process.env.GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY');
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const SYSTEM_PROMPT = `Du er FlowPilot Assistant - en vennlig og hjelpsom chatbot.

OM FLOWPILOT:
FlowPilot er et CRM for norske sma bedrifter - handle verkere, konsulenter, frilansere og serviceyrker.

PRISING:
- Starter: 1 290 kr/mnd - 100 leads, 2 skjemaer, basis analyse
- Pro: 2 590 kr/mnd (POPULAER) - 500 leads, 20 skjemaer, AI, kampanjer
- Enterprise: 3 990 kr/mnd - Ubegrenset, full API, dedikert support

GRATIS TRIAL: 14 dager med full tilgang. Kort kreves, belastes ikke i proveperioden.

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

    const genAI = getGemini();
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const lastMessage = messages[messages.length - 1]?.content || '';

    const chat = model.startChat({ history, generationConfig: { maxOutputTokens: 300, temperature: 0.7 } });
    const result = await chat.sendMessage(lastMessage);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error('[CHATBOT ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
