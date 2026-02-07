import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { renderToStream } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/invoices/InvoicePDF';

export async function GET(_: any, { params }: { params: { id: string } }) {
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

    const stream = await renderToStream(
      <InvoicePDF invoice={data} company={data.company} />
    );

    return new NextResponse(stream as any, {
      headers: { 'Content-Type': 'application/pdf' },
    });
  } catch (e) {
    console.error('[INVOICE PDF ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
