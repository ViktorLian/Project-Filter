import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    if (error) throw error;

    const csv = [
      'date,type,category,amount,description',
      ...(data || []).map(
        (t) =>
          `${t.occurred_at},${t.direction},${t.category},${t.amount},"${
            t.description || ''
          }"`
      ),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="cashflow.csv"',
      },
    });
  } catch (e) {
    console.error('[CASHFLOW EXPORT ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
