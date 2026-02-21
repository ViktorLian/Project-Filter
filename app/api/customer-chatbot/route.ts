import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const { message, companyId, conversationHistory } = await request.json();

    // Fetch company settings from database
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Build system prompt from company settings
    const systemPrompt = `Du er AI-kundeservice for ${company.name}.
    
Bedriftsinfo:
- Telefon: ${company.phone || 'Ikke oppgitt'}
- Nettside: ${company.website || 'Ikke oppgitt'}
- Åpningstider: ${company.opening_hours || 'Ikke oppgitt'}
- Tjenester: ${company.services || 'Ikke oppgitt'}

Instruksjoner:
1. Svar høflig og hjelpsomt på norsk
2. Anbefal å kontakte bedriften direkte for komplekse spørsmål
3. Hvis kunde gir navn/email/telefon, noter det (vi vil konvertere til lead)
4. Hold svar kort (maks 3 setninger per melding)
5. Bruk bedriftens tone og personlighet`;

    // Convert message history to OpenAI format
    const conversationMessages = conversationHistory.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationMessages,
        { role: 'user', content: message }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    const reply = response.choices[0]?.message?.content || 'Beklager, jeg kunne ikke svare.';

    // Simple regex to detect if customer provided contact info
    const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = message.match(/\d{8,}/);
    const nameMatch = message.match(/mitt navn er (\w+)|jeg heter (\w+)/i);

    let capturedLead = null;
    if (emailMatch || phoneMatch || nameMatch) {
      capturedLead = {
        customer_email: emailMatch?.[0],
        customer_phone: phoneMatch?.[0],
        customer_name: nameMatch?.[1] || nameMatch?.[2],
        source: 'chatbot',
        status: 'new'
      };
    }

    return NextResponse.json({
      reply,
      capturedLead
    });
  } catch (error) {
    console.error('Customer chatbot error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
