import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: any, { params }: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    const supabase = createAdminClient();
    const body = await req.json();

    const { data: lead, error: leadError } = await supabase
      .from('leads_leads')
      .select('*')
      .eq('id', params.leadId)
      .eq('company_id', companyId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Check if customer exists
    let customer;
    const { data: existingCustomer } = await supabase
      .from('invoice_customers')
      .select('*')
      .eq('email', lead.customer_email)
      .eq('company_id', companyId)
      .single();

    if (existingCustomer) {
      customer = existingCustomer;
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('invoice_customers')
        .insert({
          name: lead.customer_name || 'Unknown',
          email: lead.customer_email,
          company_id: companyId,
        })
        .select()
        .single();

      if (customerError) throw customerError;
      customer = newCustomer;
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        company_id: companyId,
        customer_id: customer.id,
        amount: body.amount,
        issued_date: new Date().toISOString().slice(0, 10),
        due_date: body.due_date,
        status: 'DRAFT',
        description: body.description || `Lead: ${lead.customer_name}`,
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    return NextResponse.json({ success: true, invoice });
  } catch (e) {
    console.error('[LEAD CONVERT ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
