import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    const supabase = createAdminClient();

    // Get all transactions for company
    const { data, error } = await supabase
      .from('cashflow_transactions')
      .select('direction, amount')
      .eq('company_id', companyId);

    if (error) {
      console.error('[CASHFLOW HEALTH ERROR]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate totals
    let income = 0;
    let expense = 0;

    data?.forEach((t) => {
      if (t.direction === 'IN') {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });

    const net = income - expense;

    // Determine health status
    let health = 'GREEN';
    if (net < 0) {
      health = 'RED';
    } else if (net < income * 0.15) {
      health = 'YELLOW';
    }

    // Calculate runway (months)
    const runway = expense === 0 ? 0 : Math.floor(net / expense);

    // Update metrics table
    await supabase.from('cashflow_metrics').upsert({
      company_id: companyId,
      monthly_burn: expense,
      monthly_runway: runway,
      health_status: health,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      income,
      expense,
      net,
      health,
      runway,
    });
  } catch (e) {
    console.error('[CASHFLOW HEALTH ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
