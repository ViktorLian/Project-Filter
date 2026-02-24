export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}

const SYSTEM_PROMPT = `Du er FlowPilot sin vennlige salgsassistent på nettsiden. Du hjelper besøkende med å forstå produktet og velge riktig abonnement.

FLOWPILOT PLANER OG PRISER:

Starter – 1 290 kr/mnd (14 dagers gratis prøveperiode)
- Opptil 50 leads per måned
- 2 tilpassede lead-skjemaer
- 10 fakturaer per måned
- AI lead-scoring (0–100)
- Automatiske e-postsvar
- E-postsupport
Passer for: Nystartede bedrifter og frilansere

Pro – 2 590 kr/mnd (14 dagers gratis prøveperiode) – MEST POPULÆR
- Opptil 300 leads per måned
- 10 tilpassede lead-skjemaer
- Ubegrensede fakturaer
- AI lead-scoring og kategorisering
- Automatiske e-postkampanjer (maks 3 aktive)
- Chatbot på din nettside (maks 1)
- Bookingsystem med kalender
- Lead ROI-tracking
- Prioritert support
Passer for: Voksende bedrifter med aktivt salg

Enterprise – 3 990 kr/mnd (14 dagers gratis prøveperiode)
- Ubegrenset antall leads, skjemaer og kampanjer
- Ubegrensede chatboter på nettside
- AI-tilpasset opplæring av chatbot
- White-label muligheter (eget domene/logo)
- Full API-tilgang for egne integrasjoner
- Dedikert onboarding og strategisesjon
- Team-administrasjon og rollestyring
- Skreddersydde integrasjoner
- SLA-garanti + 1-times responstid
Passer for: Seriøse vekstbedrifter og byråer

TILLEGGSTJENESTER (for alle planer):
- Proff Digital Pakke: Fra 10 000 kr/mnd – Google Ads + SEO + SoMe + Google Maps (annonsebudsjett kommer i tillegg)
- Nettside med FlowPilot: Fra 9 900 kr (engangsbetaling)
- Google Ads alene: Fra 4 500 kr/mnd
- SEO: Fra 3 500 kr/mnd
- Sosiale medier + Meta Ads: Fra 3 900 kr/mnd
- Anmeldelsesbooster: 1 900 kr/mnd

VIKTIG INFO:
- Alle planer inkluderer 14 dagers gratis prøveperiode
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
      return NextResponse.json({ reply: 'Skriv en melding for aa starte chatten.' });
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        reply: 'Hei! Jeg er FlowPilot-assistenten. AI-chatten er ikke konfigurert enda, men du kan kontakte oss på Flowpilot@hotmail.com.',
      });
    }

    const openai = getOpenAI();
    const msgs = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...(history as { role: string; content: string }[])
        .slice(-15)
        .map((m) => ({ role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user', content: m.content })),
      { role: 'user' as const, content: message },
    ];

    const result = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: msgs,
      max_tokens: 400,
      temperature: 0.6,
    });

    const reply = result.choices[0]?.message?.content || 'Beklager, proev igjen.';
    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error('[WIDGET CHAT ERROR]', e);
    return NextResponse.json({
      reply: 'Noe gikk galt. Send oss en e-post på Flowpilot@hotmail.com saa hjelper vi deg.',
    });
  }
}
