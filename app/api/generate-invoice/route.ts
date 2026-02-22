export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { customerName, amount, invoiceNumber, businessName, businessEmail, dueDate, userId } =
      await req.json();

    if (!customerName || !amount || !invoiceNumber || !businessName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate PDF
    const doc = new PDFDocument({ size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {});

    // PDF Header
    doc.fontSize(24).font('Helvetica-Bold').text('FAKTURA', 50, 40);

    // Company Info
    doc.fontSize(10).font('Helvetica').text(`Fra: ${businessName}`, 50, 100);
    doc.text(`E-post: ${businessEmail}`, 50, 115);

    // Customer Info
    doc.fontSize(10).font('Helvetica-Bold').text('Fakturert til:', 50, 150);
    doc.fontSize(10).font('Helvetica').text(customerName, 50, 165);

    // Invoice Details
    const detailsY = 200;
    doc.fontSize(9).font('Helvetica');
    doc.text(`Fakturanummer: ${invoiceNumber}`, 50, detailsY);
    doc.text(`Utstedelsesdato: ${new Date().toLocaleDateString('no-NO')}`, 50, detailsY + 15);
    doc.text(`Forfallsdato: ${dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('no-NO')}`, 50, detailsY + 30);

    // Table Header
    const tableY = 280;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Beskrivelse', 50, tableY);
    doc.text('Beløp (NOK)', 400, tableY);

    // Divider
    doc.moveTo(50, tableY + 15).lineTo(550, tableY + 15).stroke();

    // Line Item
    doc.fontSize(10).font('Helvetica');
    doc.text('Tjenester', 50, tableY + 25);
    doc.text(amount.toLocaleString('no-NO'), 400, tableY + 25);

    // Total
    doc.moveTo(50, tableY + 55).lineTo(550, tableY + 55).stroke();
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('TOTALT:', 50, tableY + 65);
    doc.text(`${amount.toLocaleString('no-NO')} NOK`, 400, tableY + 65);

    // Footer
    doc.fontSize(9).font('Helvetica').text(
      'Betaling skal gjennomføres innen forfallsdato. Takk for samarbeidet!',
      50,
      700
    );

    doc.end();

    // Wait for PDF to finish
    await new Promise((resolve) => {
      doc.on('finish', resolve);
    });

    const pdfBuffer = Buffer.concat(chunks);

    // Store invoice in Supabase
    if (userId) {
      const supabase = createAdminClient();
      await supabase.from('invoices').insert({
        user_id: userId,
        invoice_number: invoiceNumber,
        customer_name: customerName,
        amount,
        sent_to_email: null,
        sent_date: new Date().toISOString(),
        paid: false,
        due_date: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=faktura-${invoiceNumber}.pdf`,
      },
    });
  } catch (e) {
    console.error('[INVOICE GENERATE ERROR]', e);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
