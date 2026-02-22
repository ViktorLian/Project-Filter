export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Webhook endpoint for Zapier integration
// Sends new lead data to Zapier when a lead is created
export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = req.headers.get('authorization');
    const webhookSecret = process.env.ZAPIER_WEBHOOK_SECRET;

    if (!webhookSecret || authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json({ error: 'Missing leadId' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get lead with company and form info
    const { data: lead, error } = await supabase
      .from('leads_leads')
      .select(`
        *,
        company:leads_companies(*),
        form:leads_forms(*)
      `)
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Format data for Zapier
    const zapierPayload = {
      lead_id: lead.id,
      customer_name: lead.customer_name,
      customer_email: lead.customer_email,
      customer_phone: lead.customer_phone,
      company_name: lead.company?.name,
      form_name: lead.form?.name,
      status: lead.status,
      score: lead.score,
      risk_level: lead.risk_level,
      answers: lead.answers,
      created_at: lead.created_at,
      dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads/${lead.id}`,
    };

    // Send to Zapier webhook URL
    const zapierWebhookUrl = process.env.ZAPIER_WEBHOOK_URL;
    
    if (zapierWebhookUrl) {
      await fetch(zapierWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(zapierPayload),
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[ZAPIER WEBHOOK ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// GET endpoint for Zapier to test connection
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const webhookSecret = process.env.ZAPIER_WEBHOOK_SECRET;

    if (!webhookSecret || authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ 
      status: 'ok',
      message: 'Zapier webhook is configured correctly',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('[ZAPIER TEST ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
