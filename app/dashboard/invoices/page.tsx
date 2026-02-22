'use client';

import { useEffect, useState } from 'react';
import {
  Plus, Download, Search, Filter, CheckCircle, Clock, AlertTriangle,
  DollarSign, FileText, Eye, X, RefreshCw
} from 'lucide-react';

type Invoice = {
  id: string;
  invoice_number: number;
  amount: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  due_date: string;
  issued_date?: string;
  description?: string;
  customer?: { name: string; email?: string };
};

const STATUS_CFG = {
  PAID:    { label: 'Betalt',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  SENT:    { label: 'Sendt',     color: 'bg-blue-100 text-blue-700 border-blue-200',          icon: Clock },
  OVERDUE: { label: 'Forfalt',   color: 'bg-red-100 text-red-700 border-red-200',             icon: AlertTriangle },
  DRAFT:   { label: 'Utkast',    color: 'bg-slate-100 text-slate-600 border-slate-200',       icon: FileText },
};

const EMPTY_FORM = {
  customer_name: '', customer_email: '', amount: '', due_date: '',
  description: '', kid: '', status: 'SENT' as const,
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/invoices').catch(() => null);
    const json = res ? await res.json() : {};
    setInvoices(json.invoices || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createInvoice = async () => {
    if (!form.customer_name || !form.amount || !form.due_date) return;
    setSaving(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          amount: Number(form.amount),
          due_date: form.due_date,
          issued_date: new Date().toISOString().slice(0, 10),
          status: form.status,
          description: form.description,
          kid: form.kid,
        }),
      });
      if (res.ok) { setForm(EMPTY_FORM); setShowNew(false); load(); }
    } finally { setSaving(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const downloadPdf = async (id: string) => {
    setPdfLoading(id);
    try {
      const res = await fetch(`/api/invoices/${id}/pdf`);
      if (!res.ok) { alert('Kunne ikke generere PDF'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `faktura-${id.slice(0, 6)}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } finally { setPdfLoading(null); }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fakturaer</h1>
          <p className="text-slate-500 text-sm mt-0.5">Administrer og send fakturaer til kundene dine</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm">
          <Plus className="h-4 w-4" /> Ny faktura
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total fakturert', value: `${stats.total.toLocaleString('nb-NO')} kr`, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Betalt', value: `${stats.paid.toLocaleString('nb-NO')} kr`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Utestående', value: `${stats.outstanding.toLocaleString('nb-NO')} kr`, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Forfalte', value: `${stats.overdue} stk`, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(({ label, value, color, bg }) => (
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
        <div className="flex gap-2">
          {['ALL', 'SENT', 'PAID', 'OVERDUE', 'DRAFT'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                filterStatus === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
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
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Beløp</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Forfall</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}>
                  {Array(7).fill(0).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-slate-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                <FileText className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                <p className="font-medium">Ingen fakturaer funnet</p>
                <p className="text-sm mt-1">Opprett din første faktura ovenfor</p>
              </td></tr>
            ) : (
              filtered.map((inv) => {
                const sc = STATUS_CFG[inv.status] || STATUS_CFG.DRAFT;
                const StatusIcon = sc.icon;
                return (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-slate-500 text-xs">#{inv.invoice_number || inv.id.slice(0,6)}</td>
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
                      <select
                        value={inv.status}
                        onChange={e => updateStatus(inv.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-lg border font-medium cursor-pointer ${sc.color}`}
                      >
                        {Object.entries(STATUS_CFG).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => downloadPdf(inv.id)}
                        disabled={pdfLoading === inv.id}
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                        title="Last ned PDF"
                      >
                        {pdfLoading === inv.id
                          ? <RefreshCw className="h-3 w-3 animate-spin" />
                          : <Download className="h-3 w-3" />}
                        PDF
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* New invoice modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Ny faktura</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 block">Kundenavn *</label>
                  <input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                    placeholder="Ola Nordmann AS" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 block">E-post</label>
                  <input value={form.customer_email} onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))}
                    placeholder="kunde@firma.no" type="email" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 block">Beløp (kr) *</label>
                  <input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="5000" type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 block">Forfallsdato *</label>
                  <input value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                    type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 block">Beskrivelse</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Tjenester utfort i januar 2026..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 block">KID-nummer (valgfritt)</label>
                <input value={form.kid} onChange={e => setForm(f => ({ ...f, kid: e.target.value }))}
                  placeholder="Autogenereres hvis tomt" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-slate-400 mt-1">KID genereres automatisk fra innstillinger hvis felt er tomt</p>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setShowNew(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">
                Avbryt
              </button>
              <button onClick={createInvoice} disabled={saving || !form.customer_name || !form.amount || !form.due_date}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                {saving ? 'Oppretter...' : 'Opprett faktura'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
