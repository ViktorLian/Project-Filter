import PDFDocument from 'pdfkit';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'leadId required' }, { status: 400 });
    }

    // Fetch lead data
    const { data: lead, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Create PDF in memory
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Add content
    doc.fontSize(20).text('Lead Report', 100, 100);
    doc.fontSize(12);
    doc.text(`Name: ${lead.customer_name}`, 100, 150);
    doc.text(`Email: ${lead.customer_email}`, 100, 170);
    doc.text(`Phone: ${lead.customer_phone}`, 100, 190);
    doc.text(`Score: ${lead.score}/100`, 100, 210);
    doc.text(`Status: ${lead.status}`, 100, 230);
    doc.text(`Date: ${new Date(lead.created_at).toLocaleDateString()}`, 100, 250);

    doc.end();

    // Wait for PDF to complete and build buffer
    const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('finish', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));
    });

    const uint8 = new Uint8Array(pdfBuffer);
    return new NextResponse(uint8, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="lead-${leadId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('[PDF ERROR]', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
