import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { customer, description, industry } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'OpenAI ikke konfigurert' }, { status: 503 });

    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 600,
      messages: [
        { role: 'system', content: 'Du er en profesjonell tilbudsbygger for norske servicefirmaer. Skriv alltid pa norsk bokmal.' },
        { role: 'user', content: `Lag et profesjonelt tilbud for:
Kunde: ${customer || 'Ukjent'}
Beskrivelse: ${description || 'Generelt servicearbeid'}
Bransje: ${industry || 'Servicebasert'}

Returner JSON: {"title": "...", "description": "...", "lineItems": [{"description": "...", "qty": 1, "unitPrice": 0}]}
Lag 2-4 linjeelementer med realistiske norske priser.` },
      ],
    });

    const text = completion.choices[0].message.content ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return NextResponse.json(JSON.parse(jsonMatch[0]));
    }
    return NextResponse.json({ title: 'AI-generert tilbud', description: text, lineItems: [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
