export const dynamic = 'force-dynamic';

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
      .from('invoices')
      .select('invoice_number,amount,status,due_date')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const csv = [
      'number,amount,status,due_date',
      ...(data || []).map(
        (i) => `${i.invoice_number},${i.amount},${i.status},${i.due_date}`
      ),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="invoices.csv"',
      },
    });
  } catch (e) {
    console.error('[INVOICE EXPORT ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
