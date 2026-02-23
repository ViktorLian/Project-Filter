export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

function getGemini() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
}

const SYSTEM_PROMPT = `Du er FlowPilot sin vennlige salgsassistent på nettsiden. Du hjelper besøkende med å forstå produktet og velge riktig abonnement.

FLOWPILOT PLANER OG PRISER:

Starter – 1 290 kr/mnd (14 dagers gratis prøve)
- Opptil 100 leads per måned
- 2 tilpassede lead-skjemaer
- AI lead-scoring (0–100)
- Automatiske e-postsvar
- Faktura-generator (20 fakturaer/mnd)
- Kontantstrøm-oversikt
- E-postsupport
Passer for: Nystartede bedrifter og frilansere

Pro – 2 590 kr/mnd (14 dagers gratis prøve) – MEST POPULÆR
- Opptil 500 leads per måned
- 20 tilpassede lead-skjemaer
- AI lead-scoring og kategorisering
- Automatiske e-postkampanjer
- Bookingsystem med Google Kalender
- Lead ROI-tracking
- Ubegrenset fakturaer
- Prioritert support
Passer for: Voksende bedrifter med aktivt salg

Enterprise – 3 990 kr/mnd (14 dagers gratis prøve)
- Ubegrenset antall leads og skjemaer
- AI kundeservice-bot på nettsiden
- Avansert kampanjestyring
- White-label muligheter
- Full API-tilgang
- Dedikert onboarding
- Team-administrasjon og rollestyring
- SLA-garanti og prioritert support
Passer for: Seriøse vekstbedrifter og byråer

VIKTIG INFO:
- Alle planer inkluderer 14 dagers gratis prøveperiode – ingen bindingstid
- Du kan oppgradere eller nedgradere når som helst
- Betaling via Stripe – trygt og sikkert
- Avbestilling direkte i dashboardet

REGLER FOR SVAR:
- Svar alltid på norsk bokmål
- Hold svarene korte og vennlige (maks 3–5 setninger)
- Hvis noen er usikre på plan, still 1 kort spørsmål for å forstå behovet
- Anbefal ikke Enterprise til noen med under 100 leads per måned
- Oppfordre alltid til gratis prøveperiode
- Ikke diskuter konkurrenter
- Ved teknisk support: be dem sende e-post til Flowpilot@hotmail.com`;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ reply: 'Skriv en melding for å starte chatten.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        reply: 'Hei! Jeg er FlowPilot-assistenten. AI-chatten er ikke konfigurert enda, men du kan kontakte oss på Flowpilot@hotmail.com.',
      });
    }

    const genAI = getGemini();
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const chatHistory = (history as { role: string; content: string }[])
      .slice(-10)
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const reply = result.response.text() || 'Beklager, prøv igjen.';

    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error('[WIDGET CHAT ERROR]', e);
    return NextResponse.json({
      reply: 'Noe gikk galt. Send oss en e-post på Flowpilot@hotmail.com så hjelper vi deg.',
    });
  }
}

const SYSTEM_PROMPT = `Du er FlowPilot sin vennlige salgsassistent på nettsiden. Du hjelper besøkende med å forstå produktet og velge riktig abonnement.

FLOWPILOT PLANER OG PRISER:

🟢 Starter – 1 290 kr/mnd (14 dagers gratis prøve)
- Opptil 100 leads per måned
- 2 tilpassede lead-skjemaer
- AI lead-scoring (0–100)
- Automatiske e-postsvar
- Faktura-generator (20 fakturaer/mnd)
- Kontantstrøm-oversikt
- E-postsupport
Passer for: Nystartede bedrifter og frilansere

🔵 Pro – 2 590 kr/mnd (14 dagers gratis prøve)  ⭐ MEST POPULÆR
- Opptil 500 leads per måned
- 20 tilpassede lead-skjemaer
- AI lead-scoring og kategorisering
- Automatiske e-postkampanjer
- Bookingsystem med Google Kalender
- Lead ROI-tracking
- No-show deteksjon
- Ubegrenset fakturaer
- Prioritert support
Passer for: Voksende bedrifter med aktivt salg

🟣 Enterprise – 3 990 kr/mnd (14 dagers gratis prøve)
- Ubegrenset antall leads
- Ubegrenset antall skjemaer
- AI kundeservice-bot på nettsiden
- Avansert e-postkampanjestyring
- White-label muligheter
- Full API-tilgang
- Dedikert onboarding
- Custom integrasjoner
- Team-administrasjon og rolle-styring
- SLA-garanti og prioritert support
Passer for: Seriøse vekstbedrifter og byråer

VIKTIG INFO:
- Alle planer inkluderer 14 dagers gratis prøveperiode – ingen bindingstid
- Du kan oppgradere eller nedgradere planen din når som helst
- Betaling skjer via Stripe (trygt og sikkert)
- Avbestilling kan gjøres direkte i dashboardet

REGLER FOR SVAR:
- Svar alltid på norsk bokmål
- Hold svarene korte og vennlige (maks 3–5 setninger)
- Hvis noen er usikre på plan, still 1 kort spørsmål for å forstå hva de trenger
- Anbefal aldri Enterprise til noen med under 100 leads/mnd
- Oppfordre alltid til å starte gratis prøveperiode
- Ikke diskuter konkurrenter
- Hvis spørsmålet handler om teknisk feil eller support, be dem sende e-post til Flowpilot@hotmail.com`;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ reply: 'Skriv en melding for å starte chatten.' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        reply: 'Hei! Jeg er FlowPilot-assistenten. For øyeblikket er AI-chatten ikke tilgjengelig, men du kan kontakte oss på Flowpilot@hotmail.com for hjelp.',
      });
    }

    const openai = getOpenAI();

    const chatHistory = (history as { role: string; content: string }[])
      .slice(-10) // keep last 10 messages for context
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...chatHistory,
        { role: 'user', content: message },
      ],
      max_tokens: 300,
      temperature: 0.6,
    });

    const reply = response.choices[0]?.message?.content || 'Beklager, prøv igjen.';
    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error('[WIDGET CHAT ERROR]', e);
    return NextResponse.json({
      reply: 'Noe gikk galt. Send oss en e-post på Flowpilot@hotmail.com så hjelper vi deg!',
    });
  }
}
