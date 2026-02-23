export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createAdminClient } from '@/lib/supabase/admin';

function getGemini() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
}

export async function POST(request: NextRequest) {
  try {
    const { message, companyId, conversationHistory } = await request.json();

    // Fetch company settings from database
    const supabase = createAdminClient();
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
- Apningstider: ${company.opening_hours || 'Ikke oppgitt'}
- Tjenester: ${company.services || 'Ikke oppgitt'}

Instruksjoner:
1. Svar hoflig og hjelpsomt pa norsk
2. Anbefal a kontakte bedriften direkte for komplekse sporsmal
3. Hvis kunde gir navn/email/telefon, noter det (vi vil konvertere til lead)
4. Hold svar kort (maks 3 setninger per melding)
5. Bruk bedriftens tone og personlighet`;

    const genAI = getGemini();
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    // Convert conversation history to Gemini format
    const history = (conversationHistory || []).map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({ history, generationConfig: { maxOutputTokens: 200, temperature: 0.7 } });
    const result = await chat.sendMessage(message);
    const reply = result.response.text() || 'Beklager, jeg kunne ikke svare.';

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

    return NextResponse.json({ reply, capturedLead });
  } catch (error) {
    console.error('Customer chatbot error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
