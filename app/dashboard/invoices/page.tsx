'use client';

import { useEffect, useState } from 'react';
import {
  Plus, Download, Search, CheckCircle, Clock, AlertTriangle,
  FileText, X, RefreshCw, Trash2,
} from 'lucide-react';

type LineItem = {
  description: string;
  qty: number;
  unit: string;
  unit_price: number;
};

type Invoice = {
  id: string;
  invoice_number: number;
  amount: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  due_date: string;
  issued_date?: string;
  description?: string;
  line_items?: LineItem[] | null;
  vat_pct?: number;
  customer?: { name: string; email?: string };
};

const STATUS_CFG = {
  PAID:    { label: 'Betalt',  color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  SENT:    { label: 'Sendt',   color: 'bg-blue-100 text-blue-700 border-blue-200',          icon: Clock },
  OVERDUE: { label: 'Forfalt', color: 'bg-red-100 text-red-700 border-red-200',             icon: AlertTriangle },
  DRAFT:   { label: 'Utkast',  color: 'bg-slate-100 text-slate-600 border-slate-200',       icon: FileText },
};

const UNITS = ['timer', 'stk', 'dag', 'm²', 'm', 'ls', 'tonn', 'km'];

const EMPTY_LINE: LineItem = { description: '', qty: 1, unit: 'stk', unit_price: 0 };

const EMPTY_FORM = {
  customer_name: '', customer_email: '', due_date: '',
  description: '', status: 'SENT' as const, vat_pct: 25,
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [lines, setLines] = useState<LineItem[]>([{ ...EMPTY_LINE }]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/invoices').catch(() => null);
    const json = res ? await res.json() : {};
    setInvoices(json.invoices || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Line item helpers
  const updateLine = (i: number, field: keyof LineItem, value: string | number) =>
    setLines(ls => ls.map((l, idx) => idx === i ? { ...l, [field]: value } : l));

  const addLine = () => setLines(ls => [...ls, { ...EMPTY_LINE }]);
  const removeLine = (i: number) => setLines(ls => ls.filter((_, idx) => idx !== i));

  const subtotal = lines.reduce((s, l) => s + (Number(l.qty) * Number(l.unit_price)), 0);
  const vatAmt = subtotal * (form.vat_pct / 100);
  const total = subtotal + vatAmt;

  const openNew = () => {
    setForm(EMPTY_FORM);
    setLines([{ ...EMPTY_LINE }]);
    setSaveError('');
    setShowNew(true);
  };

  const createInvoice = async () => {
    if (!form.customer_name || !form.due_date) return;
    const validLines = lines.filter(l => l.description.trim() && Number(l.unit_price) > 0);
    if (validLines.length === 0) { setSaveError('Legg til minst én varelinje med beskrivelse og pris.'); return; }
    setSaving(true); setSaveError('');
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          due_date: form.due_date,
          issued_date: new Date().toISOString().slice(0, 10),
          status: form.status,
          description: form.description || validLines[0].description,
          line_items: validLines,
          vat_pct: form.vat_pct,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setSaveError(json.error || 'Noe gikk galt'); return; }
      setShowNew(false);
      load();
    } catch { setSaveError('Nettverksfeil – prøv igjen'); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const openPdf = (id: string) => {
    window.open(`/api/invoices/${id}/pdf`, '_blank');
  };

  const filtered = invoices.filter((inv) => {
    const matchSearch = (inv.customer?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (inv.description || '').toLowerCase().includes(search.toLowerCase()) ||
      String(inv.invoice_number).includes(search);
    const matchStatus = filterStatus === 'ALL' || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: invoices.reduce((s, i) => s + (i.amount || 0), 0),
    paid: invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + (i.amount || 0), 0),
    outstanding: invoices.filter(i => i.status !== 'PAID').reduce((s, i) => s + (i.amount || 0), 0),
    overdue: invoices.filter(i => i.status === 'OVERDUE').length,
  };

  function exportCSV() {
    const rows = [
      ['Fakturanr', 'Kunde', 'E-post', 'Status', 'Beløp', 'Forfallsdato', 'Utstedelsesdato', 'Beskrivelse'],
      ...invoices.map(inv => [
        inv.invoice_number, inv.customer?.name || '', inv.customer?.email || '',
        STATUS_CFG[inv.status]?.label || inv.status, inv.amount,
        inv.due_date, inv.issued_date || '', inv.description || '',
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `fakturaer_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fakturaer</h1>
          <p className="text-slate-500 text-sm mt-0.5">Administrer og send fakturaer til kundene dine</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition shadow-sm">
            <Download className="h-4 w-4" /> Eksporter CSV
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm">
            <Plus className="h-4 w-4" /> Ny faktura
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total fakturert', value: `${stats.total.toLocaleString('nb-NO')} kr`, color: 'text-blue-600' },
          { label: 'Betalt',          value: `${stats.paid.toLocaleString('nb-NO')} kr`,  color: 'text-emerald-600' },
          { label: 'Utestående',      value: `${stats.outstanding.toLocaleString('nb-NO')} kr`, color: 'text-orange-600' },
          { label: 'Forfalte',        value: `${stats.overdue} stk`, color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className={`text-xs font-semibold uppercase tracking-wide ${color} mb-1`}>{label}</div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Søk etter kunde, beskrivelse eller fakturanr..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'SENT', 'PAID', 'OVERDUE', 'DRAFT'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                filterStatus === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}>
              {s === 'ALL' ? 'Alle' : STATUS_CFG[s as keyof typeof STATUS_CFG]?.label ?? s}
            </button>
          ))}
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Invoice list */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kunde</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Beskrivelse</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Beløp inkl. MVA</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Forfall</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <tr key={i}>{Array(7).fill(0).map((_, j) => (
                  <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                ))}</tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                <FileText className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                <p className="font-medium">Ingen fakturaer funnet</p>
                <p className="text-sm mt-1">Opprett din første faktura ovenfor</p>
              </td></tr>
            ) : filtered.map((inv) => {
              const sc = STATUS_CFG[inv.status] || STATUS_CFG.DRAFT;
              return (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-mono text-slate-500 text-xs">#{inv.invoice_number || inv.id.slice(0, 6)}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">{inv.customer?.name || '—'}</p>
                    {inv.customer?.email && <p className="text-xs text-slate-400">{inv.customer.email}</p>}
                  </td>
                  <td className="px-5 py-4 text-slate-500 max-w-48 truncate">{inv.description || '—'}</td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-900">
                    {(inv.amount || 0).toLocaleString('nb-NO')} kr
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString('nb-NO') : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <select value={inv.status} onChange={e => updateStatus(inv.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-lg border font-medium cursor-pointer ${sc.color}`}>
                      {Object.entries(STATUS_CFG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => openPdf(inv.id)}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
                      title="Åpne / skriv ut PDF">
                      <Download className="h-3 w-3" /> PDF
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── New invoice modal ── */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col">

            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <h2 className="text-lg font-bold text-slate-900">Ny faktura</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">

              {/* Customer + dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 block">Kundenavn *</label>
                  <input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                    placeholder="Ola Nordmann AS"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 block">E-post</label>
                  <input value={form.customer_email} type="email" onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))}
                    placeholder="kunde@firma.no"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 block">Forfallsdato *</label>
                  <input value={form.due_date} type="date" onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 block">MVA %</label>
                  <select value={form.vat_pct} onChange={e => setForm(f => ({ ...f, vat_pct: Number(e.target.value) }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value={25}>25% (standard)</option>
                    <option value={15}>15% (mat)</option>
                    <option value={12}>12% (persontransport)</option>
                    <option value={0}>0% (fritatt)</option>
                  </select>
                </div>
              </div>

              {/* Optional general description */}
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 block">Overordnet beskrivelse (valgfri)</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="F.eks. «Rørleggerarbeid – Storgata 5, januar 2026»"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Varelinjer *</label>
                  <button onClick={addLine}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                    <Plus className="h-3.5 w-3.5" /> Legg til linje
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  {/* Headers */}
                  <div className="grid grid-cols-[1fr_80px_80px_100px_80px_32px] gap-2 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <span>Beskrivelse</span><span>Antall</span><span>Enhet</span><span>Enhetspris</span><span className="text-right">Sum</span><span></span>
                  </div>

                  {lines.map((line, i) => (
                    <div key={i} className="grid grid-cols-[1fr_80px_80px_100px_80px_32px] gap-2 px-3 py-2 items-center border-t border-slate-100">
                      <input value={line.description} onChange={e => updateLine(i, 'description', e.target.value)}
                        placeholder="Rørleggerarbeid…"
                        className="border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                      <input value={line.qty} type="number" min={0} step={0.5}
                        onChange={e => updateLine(i, 'qty', e.target.value)}
                        className="border border-slate-200 rounded px-2 py-1.5 text-sm w-full text-right focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <select value={line.unit} onChange={e => updateLine(i, 'unit', e.target.value)}
                        className="border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <input value={line.unit_price} type="number" min={0}
                        onChange={e => updateLine(i, 'unit_price', e.target.value)}
                        placeholder="850"
                        className="border border-slate-200 rounded px-2 py-1.5 text-sm w-full text-right focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <span className="text-right text-sm font-semibold text-slate-700">
                        {(Number(line.qty) * Number(line.unit_price)).toLocaleString('nb-NO')} kr
                      </span>
                      <button onClick={() => lines.length > 1 && removeLine(i)} disabled={lines.length <= 1}
                        className="text-slate-300 hover:text-red-500 disabled:opacity-30 transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {/* Totals */}
                  <div className="border-t-2 border-slate-200 bg-slate-50 px-3 py-2 space-y-1">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Subtotal eks. MVA</span>
                      <span className="font-medium">{subtotal.toLocaleString('nb-NO')} kr</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>MVA {form.vat_pct}%</span>
                      <span className="font-medium">{vatAmt.toLocaleString('nb-NO')} kr</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-200">
                      <span>Totalt inkl. MVA</span>
                      <span>{total.toLocaleString('nb-NO')} kr</span>
                    </div>
                  </div>
                </div>
              </div>

              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{saveError}</div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-100 shrink-0">
              <button onClick={() => setShowNew(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">
                Avbryt
              </button>
              <button onClick={createInvoice}
                disabled={saving || !form.customer_name || !form.due_date}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                {saving ? 'Oppretter…' : `Opprett faktura – ${total.toLocaleString('nb-NO')} kr`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
