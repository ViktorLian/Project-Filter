import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

type InvoiceInput = {
  customer_id: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  amount: number;
  due_date: string;
  issued_date: string;
  description?: string;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    const body: InvoiceInput = await req.json();

    // Validate input
    if (!body.amount || !body.due_date || !body.issued_date || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        company_id: companyId,
        customer_id: body.customer_id || null,
        status: body.status,
        amount: body.amount,
        due_date: body.due_date,
        issued_date: body.issued_date,
        description: body.description || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[INVOICE POST ERROR]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, invoice: data });
  } catch (e) {
    console.error('[INVOICE POST ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('invoices')
      .select('*, customer:invoice_customers(*)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[INVOICE GET ERROR]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ invoices: data || [] });
  } catch (e) {
    console.error('[INVOICE GET ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
