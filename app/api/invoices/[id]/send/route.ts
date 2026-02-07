import { createAdminClient } from '@/lib/supabase/admin';
import { sendInvoiceEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

export async function POST(_: any, { params }: any) {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('invoices')
      .select('*, customer:invoice_customers(*), company:companies(*)')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (!data.customer?.email) {
      return NextResponse.json(
        { error: 'Customer has no email' },
        { status: 400 }
      );
    }

    await sendInvoiceEmail(
      data.customer.email,
      `Faktura #${data.invoice_number} fra ${data.company.name}`,
      `<p>Vedlagt faktura.</p>`,
      Buffer.from('')
    );

    await supabase
      .from('invoices')
      .update({ status: 'SENT' })
      .eq('id', params.id);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[SEND INVOICE ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
