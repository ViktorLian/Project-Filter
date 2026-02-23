export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

function getGemini() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
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
Ingen emojier i svarene. Hold svarene konsise men innholdsrike.`;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { message, history = [] } = await req.json();
    if (!message) return NextResponse.json({ error: 'Missing message' }, { status: 400 });

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        reply: 'AI-funksjonen krever en Gemini API-nokkel. Legg til GEMINI_API_KEY i miljovariabler for a aktivere AI Salgsassistent.',
      });
    }

    const genAI = getGemini();
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    // Convert history to Gemini format
    const chatHistory = (history as { role: string; content: string }[])
      .slice(-12)
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text() || 'Beklager, fikk ikke svar fra AI.';
    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error('[AI CHAT ERROR]', e);
    return NextResponse.json({
      reply: `AI svarte ikke. Sjekk at GEMINI_API_KEY er konfigurert i Vercel-innstillinger.`,
    });
  }
}
