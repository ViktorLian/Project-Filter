import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { publicLeadSubmissionSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = publicLeadSubmissionSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid submission data' },
        { status: 400 }
      );
    }

    const { formId, answers, customerName, customerEmail, customerPhone } =
      parsed.data;

    const supabase = createAdminClient();

    // Get form with company info
    const { data: form, error: formError } = await supabase
      .from('leads_forms')
      .select('*, company:leads_companies(*)')
      .eq('id', formId)
      .eq('is_active', true)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Create lead
    const { data: lead, error: leadError } = await supabase
      .from('leads_leads')
      .insert({
        company_id: form.company_id,
        form_id: form.id,
        customer_name: customerName ?? null,
        customer_email: customerEmail ?? null,
        customer_phone: customerPhone ?? null,
        answers: answers,
      })
      .select()
      .single();

    if (leadError) throw leadError;

    // Trigger Zapier webhook for new lead
    try {
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/zapier`;
      const webhookSecret = process.env.ZAPIER_WEBHOOK_SECRET;
      
      if (webhookSecret) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${webhookSecret}`,
          },
          body: JSON.stringify({ leadId: lead.id }),
        });
      }
    } catch (webhookError) {
      // Don't fail lead creation if webhook fails
      console.error('[ZAPIER WEBHOOK TRIGGER ERROR]', webhookError);
    }

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (e) {
    console.error('[LEAD SUBMISSION ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    const supabase = createAdminClient();

    const { data: leads, error } = await supabase
      .from('leads_leads')
      .select('*, form:leads_forms(*)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ leads });
  } catch (e) {
    console.error('[GET LEADS ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
