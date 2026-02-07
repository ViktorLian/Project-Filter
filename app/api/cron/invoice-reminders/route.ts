import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', 'SENT')
      .lt('due_date', today);

    if (error) throw error;

    for (const inv of data || []) {
      await supabase
        .from('invoices')
        .update({ status: 'OVERDUE' })
        .eq('id', inv.id);
    }

    return NextResponse.json({ processed: data?.length || 0 });
  } catch (e) {
    console.error('[INVOICE REMINDERS ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
