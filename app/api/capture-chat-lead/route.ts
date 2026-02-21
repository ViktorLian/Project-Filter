import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const {
      companyId,
      customer_name,
      customer_email,
      customer_phone,
      source,
      status,
      conversation
    } = await request.json();

    // Get user_id from company
    const { data: company } = await supabase
      .from('companies')
      .select('user_id')
      .eq('id', companyId)
      .single();

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Create lead from chatbot conversation
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        user_id: company.user_id,
        company_id: companyId,
        customer_name: customer_name || 'Chat-besøkende',
        customer_email,
        customer_phone,
        status: status || 'new',
        notes: `Chatbot-samtale: ${conversation?.map((m: any) => `${m.sender}: ${m.text}`).join('\n') || 'Ingen transkripsjon'}`,
        answers: {
          source: 'chatbot',
          captured_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating lead from chat:', error);
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      );
    }

    // Trigger Zapier webhook if configured
    if (process.env.ZAPIER_WEBHOOK_URL) {
      await fetch(process.env.ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'chatbot',
          company_id: companyId,
          lead_id: lead.id,
          customer_name,
          customer_email,
          customer_phone,
          captured_at: new Date().toISOString()
        })
      }).catch(() => {}); // Non-blocking
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Takk! Vi har mottatt ditt spørsmål og vil kontakte deg snart.'
    });
  } catch (error) {
    console.error('Capture chat lead error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
