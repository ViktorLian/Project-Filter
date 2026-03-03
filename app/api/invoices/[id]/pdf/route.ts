export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

function generateKID(prefix: string, invoiceNum: number): string {
  const base = `${prefix}${String(invoiceNum).padStart(5, '0')}`;
  let sum = 0;
  let alt = false;
  for (let i = base.length - 1; i >= 0; i--) {
    let n = parseInt(base[i]);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  const check = (10 - (sum % 10)) % 10;
  return base + check;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createAdminClient();
    const companyId = (session.user as any).companyId;

    // Get invoice
    const { data: inv } = await supabase
      .from('invoices')
      .select('*, customer:invoice_customers(*)')
      .eq('id', params.id)
      .eq('company_id', companyId)
      .single();

    if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Get company/settings for bank info
    const { data: company } = await supabase
      .from('leads_companies')
      .select('name, bank_account, kid_prefix, address, org_number, invoice_email')
      .eq('id', companyId)
      .single();

    const kidPrefix = company?.kid_prefix || String(new Date().getFullYear());
    const kid = generateKID(kidPrefix, inv.invoice_number || 1);

    // Build HTML for PDF (browser-print style)
    const html = `<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="utf-8">
<title>Faktura #${inv.invoice_number || inv.id.slice(0, 6)}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #1e293b; background: #fff; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
  .company-name { font-size: 24px; font-weight: 700; color: #1e40af; }
  .company-info { color: #64748b; font-size: 12px; line-height: 1.6; margin-top: 4px; }
  .invoice-title { text-align: right; }
  .invoice-title h1 { font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
  .invoice-title .invoice-number { font-size: 13px; color: #64748b; margin-top: 4px; }
  .divider { height: 3px; background: linear-gradient(90deg, #3b82f6, #8b5cf6); border-radius: 2px; margin: 20px 0; }
  .billing { display: flex; justify-content: space-between; margin: 24px 0; }
  .billing-block h3 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 8px; }
  .billing-block p { font-size: 13px; color: #0f172a; line-height: 1.6; }
  .dates { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; display: flex; gap: 32px; }
  .date-item label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; display: block; margin-bottom: 2px; }
  .date-item span { font-size: 13px; font-weight: 600; color: #0f172a; }
  table { width: 100%; border-collapse: collapse; margin-top: 24px; }
  thead tr { background: #0f172a; color: white; }
  thead th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  tbody tr { border-bottom: 1px solid #f1f5f9; }
  tbody tr:hover { background: #f8fafc; }
  tbody td { padding: 12px 14px; font-size: 13px; }
  .amount-row td { font-weight: 600; }
  tfoot { background: #f8fafc; }
  tfoot td { padding: 12px 14px; font-weight: 700; font-size: 16px; border-top: 2px solid #e2e8f0; }
  .total-label { text-align: right; color: #64748b; }
  .total-value { color: #0f172a; font-size: 18px; }
  .payment { background: linear-gradient(135deg, #eff6ff, #f0fdf4); border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin-top: 32px; }
  .payment h3 { font-weight: 700; color: #1e40af; margin-bottom: 12px; }
  .payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .payment-item label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; display: block; margin-bottom: 2px; }
  .payment-item span { font-size: 14px; font-weight: 700; color: #0f172a; font-family: monospace; }
  .kid-highlight { background: #1e40af; color: white !important; padding: 4px 10px; border-radius: 6px; }
  .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  .status-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .status-PAID { background: #dcfce7; color: #166534; }
  .status-SENT { background: #dbeafe; color: #1e40af; }
  .status-OVERDUE { background: #fee2e2; color: #991b1b; }
  .status-DRAFT { background: #f1f5f9; color: #64748b; }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="company-name">${company?.name || 'Din Bedrift AS'}</div>
    <div class="company-info">
      ${company?.address || ''}<br>
      ${company?.org_number ? `Org.nr: ${company.org_number}` : ''}<br>
      ${company?.invoice_email || ''}
    </div>
  </div>
  <div class="invoice-title">
    <h1>FAKTURA</h1>
    <div class="invoice-number">#${inv.invoice_number || inv.id.slice(0, 6)}</div>
    <div style="margin-top:8px">
      <span class="status-badge status-${inv.status}">
        ${inv.status === 'PAID' ? 'Betalt' : inv.status === 'SENT' ? 'Sendt' : inv.status === 'OVERDUE' ? 'Forfalt' : 'Utkast'}
      </span>
    </div>
  </div>
</div>

<div class="divider"></div>

<div class="billing">
  <div class="billing-block">
    <h3>Fakturert til</h3>
    <p><strong>${inv.customer?.name || 'Ukjent kunde'}</strong></p>
    <p>${inv.customer?.email || ''}</p>
    <p>${inv.customer?.phone || ''}</p>
    <p>${inv.customer?.address || ''}</p>
  </div>
  <div class="dates">
    <div class="date-item">
      <label>Fakturadato</label>
      <span>${inv.issued_date ? new Date(inv.issued_date).toLocaleDateString('nb-NO') : new Date().toLocaleDateString('nb-NO')}</span>
    </div>
    <div class="date-item">
      <label>Forfallsdato</label>
      <span>${inv.due_date ? new Date(inv.due_date).toLocaleDateString('nb-NO') : '—'}</span>
    </div>
  </div>
</div>

${(() => {
      const lineItems: Array<{ description: string; qty: number; unit: string; unit_price: number }> =
        Array.isArray(inv.line_items) && inv.line_items.length > 0 ? inv.line_items : [];
      const vatPct: number = typeof inv.vat_pct === 'number' ? inv.vat_pct : 25;

      if (lineItems.length > 0) {
        const subtotal = lineItems.reduce((s: number, l: { qty: number; unit_price: number }) => s + (Number(l.qty) * Number(l.unit_price)), 0);
        const vatAmt   = subtotal * (vatPct / 100);
        const total    = subtotal + vatAmt;

        const rows = lineItems.map((l: { description: string; qty: number; unit: string; unit_price: number }) => `
          <tr class="amount-row">
            <td>${l.description}</td>
            <td style="text-align:right">${Number(l.qty).toLocaleString('nb-NO')}</td>
            <td style="text-align:center">${l.unit}</td>
            <td style="text-align:right">${Number(l.unit_price).toLocaleString('nb-NO')} kr</td>
            <td style="text-align:right">${(Number(l.qty) * Number(l.unit_price)).toLocaleString('nb-NO')} kr</td>
          </tr>`).join('');

        return `
<table>
  <thead>
    <tr>
      <th>Beskrivelse</th>
      <th style="text-align:right;width:70px">Antall</th>
      <th style="text-align:center;width:60px">Enhet</th>
      <th style="text-align:right;width:100px">Enhetspris</th>
      <th style="text-align:right;width:110px">Sum</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
  <tfoot>
    <tr>
      <td colspan="4" class="total-label" style="font-size:13px;font-weight:500;color:#64748b">Subtotal eks. MVA</td>
      <td style="text-align:right;font-size:13px;font-weight:600;color:#0f172a">${subtotal.toLocaleString('nb-NO')} kr</td>
    </tr>
    <tr>
      <td colspan="4" class="total-label" style="font-size:13px;font-weight:500;color:#64748b">MVA ${vatPct}%</td>
      <td style="text-align:right;font-size:13px;font-weight:600;color:#0f172a">${vatAmt.toLocaleString('nb-NO')} kr</td>
    </tr>
    <tr>
      <td colspan="4" class="total-label" style="font-size:16px;font-weight:700;color:#0f172a">Totalt inkl. MVA</td>
      <td class="total-value" style="text-align:right">${total.toLocaleString('nb-NO')} kr</td>
    </tr>
  </tfoot>
</table>`;
      }

      // Fallback: single description + amount (old invoices)
      return `
<table>
  <thead><tr><th>Beskrivelse</th><th style="text-align:right">Beløp inkl. MVA</th></tr></thead>
  <tbody>
    <tr class="amount-row">
      <td>${inv.description || 'Tjenester'}</td>
      <td style="text-align:right">${(inv.amount || 0).toLocaleString('nb-NO')} kr</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td class="total-label">Totalt å betale</td>
      <td class="total-value" style="text-align:right">${(inv.amount || 0).toLocaleString('nb-NO')} kr</td>
    </tr>
  </tfoot>
</table>`;
    })()}

<div class="payment">
  <h3>Betalingsinformasjon</h3>
  <div class="payment-grid">
    <div class="payment-item">
      <label>Kontonummer</label>
      <span>${company?.bank_account || 'Ikke konfigurert (sett i Innstillinger)'}</span>
    </div>
    <div class="payment-item">
      <label>KID-nummer</label>
      <span class="kid-highlight">${kid}</span>
    </div>
    <div class="payment-item">
      <label>Beloep</label>
      <span>${(inv.amount || 0).toLocaleString('nb-NO')} kr</span>
    </div>
    <div class="payment-item">
      <label>Betalingsfrist</label>
      <span>${inv.due_date ? new Date(inv.due_date).toLocaleDateString('nb-NO') : '—'}</span>
    </div>
  </div>
</div>

<div class="footer">
  <p>Takk for at du handler med oss! Sporsmol? Ta kontakt pa ${company?.invoice_email || 'din e-post'}</p>
  <p style="margin-top:4px">${company?.name || 'Din Bedrift AS'} &bull; Generert av FlowPilot</p>
</div>

<script>window.print();</script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="faktura-${inv.invoice_number || inv.id.slice(0, 6)}.html"`,
      },
    });
  } catch (e) {
    console.error('[PDF ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
