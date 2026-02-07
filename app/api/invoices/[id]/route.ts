import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(req: any, { params }: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();

    if (!['DRAFT', 'SENT', 'PAID', 'OVERDUE'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[INVOICE STATUS UPDATE ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
