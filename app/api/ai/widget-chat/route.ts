export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

function getGemini() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
}

const SYSTEM_PROMPT = `Du er FlowPilot sin vennlige salgsassistent pa nettsiden. Du hjelper besoekende med aa forsta produktet og velge riktig abonnement.

FLOWPILOT PLANER OG PRISER:

Starter - 1 290 kr/mnd (14 dagers gratis proveperiode)
- Opptil 100 leads per maned
- 2 tilpassede lead-skjemaer
- AI lead-scoring (0-100)
- Automatiske e-postsvar
- Faktura-generator (20 fakturaer/mnd)
- Kontantstrom-oversikt
- E-postsupport
Passer for: Nystartede bedrifter og frilansere

Pro - 2 590 kr/mnd (14 dagers gratis proveperiode) - MEST POPULAR
- Opptil 500 leads per maned
- 20 tilpassede lead-skjemaer
- AI lead-scoring og kategorisering
- Automatiske e-postkampanjer
- Bookingsystem med Google Kalender
- Lead ROI-tracking
- Ubegrenset fakturaer
- Prioritert support
Passer for: Voksende bedrifter med aktivt salg

Enterprise - 3 990 kr/mnd (14 dagers gratis proveperiode)
- Ubegrenset antall leads og skjemaer
- AI kundeservice-bot pa nettsiden
- Avansert kampanjestyring
- White-label muligheter
- Full API-tilgang
- Dedikert onboarding
- Team-administrasjon og rollestyring
- SLA-garanti og prioritert support
Passer for: Seriose vekstbedrifter og byraer

VIKTIG INFO:
- Alle planer inkluderer 14 dagers gratis proveperiode
- Du kan oppgradere eller nedgradere naar som helst
- Betaling via Stripe - trygt og sikkert
- Avbestilling direkte i dashboardet

REGLER FOR SVAR:
- Svar alltid paa norsk bokmal
- Hold svarene korte og vennlige (maks 3-5 setninger)
- Hvis noen er usikre paa plan, still 1 kort sporsmal for aa forsta behovet
- Anbefal ikke Enterprise til noen med under 100 leads per maned
- Oppfordre alltid til gratis proveperiode
- Ikke diskuter konkurrenter
- Ved teknisk support: be dem sende e-post til Flowpilot@hotmail.com`;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ reply: 'Skriv en melding for aa starte chatten.' });
    }
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        reply: 'Hei! Jeg er FlowPilot-assistenten. AI-chatten er ikke konfigurert enda, men du kan kontakte oss paa Flowpilot@hotmail.com.',
      });
    }

    const genAI = getGemini();
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const chatHistory = (history as { role: string; content: string }[])
      .slice(-10)
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: { maxOutputTokens: 300, temperature: 0.6 },
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text() || 'Beklager, proev igjen.';
    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error('[WIDGET CHAT ERROR]', e);
    return NextResponse.json({
      reply: 'Noe gikk galt. Send oss en e-post paa Flowpilot@hotmail.com saa hjelper vi deg.',
    });
  }
}
