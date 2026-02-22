export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

type TransactionInput = {
  direction: 'IN' | 'OUT';
  amount: number;
  category: string;
  description?: string;
  occurred_at: string;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // TEMP: Allow testing without auth
    if (!session) {
      // Demo mode - return mock success
      const body: TransactionInput = await req.json();
      return NextResponse.json({ success: true, data: { id: 'demo-' + Date.now(), ...body } });
    }

    const companyId = (session.user as any).companyId;
    const body: TransactionInput = await req.json();

    // Validate input
    if (!body.direction || !body.amount || !body.category || !body.occurred_at) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('cashflow_transactions')
      .insert({
        company_id: companyId,
        direction: body.direction,
        amount: body.amount,
        category: body.category,
        description: body.description || null,
        occurred_at: body.occurred_at,
      })
      .select()
      .single();

    if (error) {
      console.error('[CASHFLOW POST ERROR]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, transaction: data });
  } catch (e) {
    console.error('[CASHFLOW POST ERROR]', e);
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
      .from('cashflow_transactions')
      .select('*')
      .eq('company_id', companyId)
      .order('occurred_at', { ascending: false });

    if (error) {
      console.error('[CASHFLOW GET ERROR]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ transactions: data || [] });
  } catch (e) {
    console.error('[CASHFLOW GET ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
