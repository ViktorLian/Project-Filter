import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { customer, description, industry } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'OpenAI ikke konfigurert' }, { status: 503 });

    const openai = new OpenAI({ apiKey });

    const prompt = `Lag et profesjonelt tilbud for:
Kunde: ${customer || 'Ukjent'}
Beskrivelse: ${description || 'Generelt servicearbeid'}
Bransje: ${industry || 'Servicebasert'}

Returner kun gyldig JSON: {"title": "...", "description": "...", "lineItems": [{"description": "...", "qty": 1, "unitPrice": 0}]}
Lag 2-4 linjeelementer med realistiske norske priser.`;

    const result = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Du er en profesjonell tilbudsbygger for norske servicefirmaer. Svar kun med gyldig JSON.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const text = result.choices[0]?.message?.content || '{}';
    try {
      return NextResponse.json(JSON.parse(text));
    } catch {
      return NextResponse.json({ title: 'AI-generert tilbud', description: text, lineItems: [] });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
