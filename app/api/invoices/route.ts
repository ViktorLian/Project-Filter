export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

type LineItem = {
  description: string;
  qty: number;
  unit: string;       // timer, stk, m², m, dag, etc
  unit_price: number;
};

type InvoiceInput = {
  customer_name?: string;
  customer_email?: string;
  customer_id?: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  amount?: number;
  due_date: string;
  issued_date?: string;
  description?: string;
  line_items?: LineItem[];
  vat_pct?: number; // default 25
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const companyId = (session.user as any).companyId;
    const body: InvoiceInput = await req.json();

    if (!body.due_date) {
      return NextResponse.json({ error: 'Forfallsdato er påkrevd' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Resolve or create customer
    let customerId = body.customer_id || null;
    if (!customerId && body.customer_name) {
      const { data: existing } = await supabase
        .from('invoice_customers')
        .select('id')
        .eq('company_id', companyId)
        .ilike('name', body.customer_name.trim())
        .single();

      if (existing) {
        customerId = existing.id;
      } else {
        const { data: newCust } = await supabase
          .from('invoice_customers')
          .insert({ company_id: companyId, name: body.customer_name.trim(), email: body.customer_email || null })
          .select('id')
          .single();
        customerId = newCust?.id || null;
      }
    }

    // Compute amount from line items if provided
    const vatPct = body.vat_pct ?? 25;
    let amount = body.amount || 0;
    if (body.line_items && body.line_items.length > 0) {
      const subtotal = body.line_items.reduce((s, l) => s + (l.qty * l.unit_price), 0);
      amount = subtotal * (1 + vatPct / 100);
    }

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        company_id: companyId,
        customer_id: customerId,
        status: body.status || 'SENT',
        amount: Math.round(amount * 100) / 100,
        due_date: body.due_date,
        issued_date: body.issued_date || new Date().toISOString().slice(0, 10),
        description: body.description || null,
        line_items: body.line_items || null,
        vat_pct: vatPct,
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
