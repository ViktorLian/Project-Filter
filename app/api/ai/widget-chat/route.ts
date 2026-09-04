export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { readEnv } from '@/lib/env';

function getOpenAI() {
  return new OpenAI({ apiKey: readEnv('OPENAI_API_KEY')! });
}

const SYSTEM_PROMPT = `Du er FlowPilot sin vennlige salgsassistent på nettsiden. Du hjelper besøkende med å forstå produktet og velge riktig abonnement.

FLOWPILOT PLANER OG PRISER:

Basis – 899 kr/mnd
- Inntil 100 henvendelser per måned
- Kontakter, innboks og enkel salgspipeline
- Opptil 2 kontaktskjemaer
- Varsel og automatisk mottaksbekreftelse
- Månedlig resultatrapport

Vekst – 1 990 kr/mnd – MEST POPULÆR
- Alt i Basis og inntil 500 henvendelser
- Oppfølging av ubesvarte leads og tilbud
- Kundeanmeldelser og Google-anmeldelsesflyt
- Servicepåminnelser og gjenaktivering
- AI-chat og SEO-oversikt

Pro – 3 990 kr/mnd
- Alt i Vekst og ubegrensede henvendelser og skjemaer
- AutoSEO og planlagt faginnhold
- Synlighetsarbeid for Google og AI-baserte søk
- API, webhooks og avanserte automatiseringer
- Prioritert onboarding og support

Nettsider og større spesialintegrasjoner prises separat etter avtalt omfang.

VIKTIG INFO:
- Alle planer inkluderer 14 dagers gratis prøveperiode
- Du kan oppgradere eller nedgradere når som helst
- Betaling via Stripe – trygt og sikkert
- Avbestilling direkte i dashboardet

REGLER FOR SVAR:
- Svar alltid på norsk bokmål
- Hold svarene korte og vennlige (maks 3–5 setninger)
- Hvis noen er usikre på plan, still 1 kort spørsmål for å forstå behovet
- Anbefal ikke Pro uten et konkret behov for AutoSEO, API eller ubegrenset volum
- Oppfordre alltid til gratis prøveperiode
- Ikke diskuter konkurrenter
- Ved teknisk support: be dem sende e-post til Flowpilot@hotmail.com`;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ reply: 'Skriv en melding for aa starte chatten.' });
    }
    if (!readEnv('OPENAI_API_KEY')) {
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
