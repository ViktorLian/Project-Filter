import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import PDFDocument from 'pdfkit';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Allow testing without session
    if (!session) {
      return NextResponse.json({ 
        success: true, 
        message: 'Demo mode - PDF generation would happen here',
        pdfUrl: '/demo-invoice.pdf'
      });
    }

    const { invoiceId } = await req.json();
    const companyId = (session.user as any).companyId;
    const supabase = createAdminClient();

    // Get invoice data
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*, customer:invoice_customers(*)')
      .eq('id', invoiceId)
      .eq('company_id', companyId)
      .single();

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Get company settings for bank account and KID
    const { data: company } = await supabase
      .from('leads_companies')
      .select('*')
      .eq('id', companyId)
      .single();

    // Generate KID number (format: YYYY + invoice_number padded)
    const year = new Date().getFullYear();
    const kidNumber = `${year}${String(invoice.invoice_number).padStart(6, '0')}`;

    // Create PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    // Header
    doc.fontSize(24).text('FAKTURA', { align: 'center' });
    doc.moveDown();

    // Company info
    doc.fontSize(12).text(company?.name || 'Your Company', { align: 'left' });
    doc.fontSize(10).text(company?.address || 'Address here');
    doc.text(company?.org_number || 'Org nr: XXX XXX XXX');
    doc.moveDown();

    // Invoice details
    doc.fontSize(14).text(`Faktura #${invoice.invoice_number}`);
    doc.fontSize(10).text(`Dato: ${new Date(invoice.issued_date).toLocaleDateString('no-NO')}`);
    doc.text(`Forfallsdato: ${new Date(invoice.due_date).toLocaleDateString('no-NO')}`);
    doc.text(`KID: ${kidNumber}`);
    doc.moveDown();

    // Customer info
    doc.text('Faktureres til:');
    doc.text(invoice.customer?.name || 'Customer name');
    if (invoice.customer?.email) doc.text(invoice.customer.email);
    if (invoice.customer?.address) doc.text(invoice.customer.address);
    doc.moveDown(2);

    // Line items
    doc.fontSize(12).text('Beskrivelse', 50, doc.y);
    doc.text('Beløp', 450, doc.y - 12, { align: 'right' });
    doc.moveDown(0.5);
    doc.strokeColor('#000000').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    doc.fontSize(10).text(invoice.description || 'Tjenester', 50, doc.y);
    doc.text(`${invoice.amount.toLocaleString('no-NO')} kr`, 450, doc.y - 12, { align: 'right' });
    doc.moveDown(2);

    // Totals
    doc.fontSize(12).text('Totalt eks. MVA:', 350, doc.y);
    doc.text(`${invoice.amount.toLocaleString('no-NO')} kr`, 450, doc.y - 14, { align: 'right' });
    doc.moveDown(0.5);
    
    const mva = Math.round(invoice.amount * 0.25);
    doc.text('MVA (25%):', 350, doc.y);
    doc.text(`${mva.toLocaleString('no-NO')} kr`, 450, doc.y - 14, { align: 'right' });
    doc.moveDown(0.5);
    
    const total = invoice.amount + mva;
    doc.fontSize(14).text('Totalt inkl. MVA:', 350, doc.y);
    doc.text(`${total.toLocaleString('no-NO')} kr`, 450, doc.y - 16, { align: 'right' });
    doc.moveDown(2);

    // Payment info
    doc.fontSize(10).text('Betalingsinformasjon:', { underline: true });
    doc.text(`Kontonummer: ${company?.bank_account || '1234 56 78901'}`);
    doc.text(`KID: ${kidNumber}`);
    doc.text(`Betalingsfrist: ${new Date(invoice.due_date).toLocaleDateString('no-NO')}`);

    doc.end();

    // Wait for PDF to finish
    await new Promise((resolve) => doc.on('end', resolve));

    const pdfBuffer = Buffer.concat(chunks);

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (e) {
    console.error('[PDF GENERATION ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
