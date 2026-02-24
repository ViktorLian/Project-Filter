'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Send, Download, Eye, Sparkles, FileText, Clock, CheckCircle, XCircle, Receipt } from 'lucide-react';

type Proposal = {
  id: string;
  title: string;
  customer_name: string;
  customer_email?: string;
  amount: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  valid_until?: string;
  description?: string;
  items?: ProposalItem[];
  created_at: string;
};

type ProposalItem = {
  description: string;
  quantity: number;
  unit_price: number;
};

const STATUS_CFG = {
  DRAFT:    { label: 'Utkast',    color: 'bg-slate-100 text-slate-600 border-slate-200' },
  SENT:     { label: 'Sendt',     color: 'bg-blue-100 text-blue-700 border-blue-200' },
  ACCEPTED: { label: 'Akseptert', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Avvist',    color: 'bg-red-100 text-red-700 border-red-200' },
};

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', customer_name: '', customer_email: '', description: '' });
  const [items, setItems] = useState<ProposalItem[]>([{ description: '', quantity: 1, unit_price: 0 }]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proposals');
      const json = await res.json();
      setProposals(json.proposals || []);
    } catch { setProposals([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const totalAmount = items.reduce((s, i) => s + (i.quantity * i.unit_price), 0);

  const aiGenerate = async () => {
    if (!form.description) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: form.description, customer: form.customer_name }),
      });
      const json = await res.json();
      if (json.items) setItems(json.items);
      if (json.title) setForm(f => ({ ...f, title: json.title }));
    } finally { setGenerating(false); }
  };

  const save = async (sendNow = false) => {
    const res = await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, items, amount: totalAmount, status: sendNow ? 'SENT' : 'DRAFT' }),
    });
    if (res.ok) { setShowNew(false); load(); }
  };

  async function createInvoiceFromProposal(p: Proposal) {
    setCreatingInvoice(p.id);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: p.customer_name,
          customer_email: p.customer_email || '',
          amount: String(p.amount || 0),
          due_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
          description: p.title,
          status: 'SENT',
        }),
      });
      if (res.ok) {
        window.location.href = '/dashboard/invoices';
      }
    } finally {
      setCreatingInvoice(null);
    }
  }

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/proposals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const stats = {
    total: proposals.length,
    accepted: proposals.filter(p => p.status === 'ACCEPTED').length,
    value: proposals.filter(p => p.status === 'ACCEPTED').reduce((s, p) => s + (p.amount || 0), 0),
    rate: proposals.length ? Math.round((proposals.filter(p => p.status === 'ACCEPTED').length / proposals.filter(p => p.status !== 'DRAFT').length) * 100) || 0 : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tilbud</h1>
          <p className="text-slate-500 text-sm mt-0.5">Lag og send profesjonelle tilbud — gjerne med AI-hjelp</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm">
          <Plus className="h-4 w-4" /> Nytt tilbud
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Totalt tilbud', value: stats.total },
          { label: 'Akseptert', value: stats.accepted },
          { label: 'Akseptert verdi', value: `${stats.value.toLocaleString('nb-NO')} kr` },
          { label: 'Konverteringsrate', value: `${stats.rate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500 font-medium">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Proposals list */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Alle tilbud</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-slate-50 rounded animate-pulse" />
                </div>
              </div>
            ))
          ) : proposals.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Ingen tilbud ennå</p>
              <p className="text-slate-400 text-sm mt-1">Klikk "Nytt tilbud" for å komme i gang</p>
            </div>
          ) : (
            proposals.map(p => {
              const sc = STATUS_CFG[p.status] || STATUS_CFG.DRAFT;
              return (
                <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{p.title}</p>
                    <p className="text-xs text-slate-400">{p.customer_name} &bull; {new Date(p.created_at).toLocaleDateString('nb-NO')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{(p.amount || 0).toLocaleString('nb-NO')} kr</p>
                  </div>
                  <select value={p.status} onChange={e => updateStatus(p.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-lg border font-medium ${sc.color}`}>
                    {Object.entries(STATUS_CFG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                  {p.status === 'ACCEPTED' && (
                    <button
                      onClick={() => createInvoiceFromProposal(p)}
                      disabled={creatingInvoice === p.id}
                      title="Lag faktura fra dette tilbudet"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition disabled:opacity-60 whitespace-nowrap"
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      {creatingInvoice === p.id ? 'Oppretter...' : 'Lag faktura'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Nytt tilbud</h2>
              <button onClick={() => setShowNew(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1">Tittel</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Tilbud på baderomrenovering"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1">Kunde</label>
                  <input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                    placeholder="Navn på kunde"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1">Beskriv jobben detaljert — jo mer info, jo bedre AI-tilbud</label>
                <div className="flex gap-2">
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3} placeholder="Eks: Bytte baderomsfliser i 2 bad (ca 12 kvm). Riv eksisterende fliser. Ny dusj med glassdør. Nytt toalett (Ifø). Male tak og vegger. Kunden bor i Lillestrøm, enebolig fra 1985. Budsjettforventning ca 80 000 kr inkl. mva."
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  <button onClick={aiGenerate} disabled={generating || !form.description}
                    className="flex-shrink-0 flex flex-col items-center gap-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-xs font-medium">
                    <Sparkles className="h-4 w-4" />
                    {generating ? 'AI...' : 'AI fyll'}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">💡 Beskriv arbeidsomfang, kvm, materialer, sted og budsjettforventning for best mulig AI-generert tilbud</p>
              </div>

              {/* Items */}
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-2">Poster</label>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <input value={item.description} onChange={e => {
                        const copy = [...items]; copy[i].description = e.target.value; setItems(copy);
                      }} placeholder="Beskrivelse" className="col-span-6 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input value={item.quantity} type="number" min={1} onChange={e => {
                        const copy = [...items]; copy[i].quantity = Number(e.target.value); setItems(copy);
                      }} className="col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input value={item.unit_price} type="number" min={0} onChange={e => {
                        const copy = [...items]; copy[i].unit_price = Number(e.target.value); setItems(copy);
                      }} placeholder="Pris" className="col-span-3 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="col-span-1 text-slate-400 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setItems([...items, { description: '', quantity: 1, unit_price: 0 }])}
                    className="text-xs text-blue-600 font-medium hover:underline">+ Legg til post</button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                <span className="font-semibold text-slate-700">Totalt</span>
                <span className="text-2xl font-bold text-slate-900">{totalAmount.toLocaleString('nb-NO')} kr</span>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-100">
              <button onClick={() => save(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">
                Lagre som utkast
              </button>
              <button onClick={() => save(true)} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <Send className="h-4 w-4" /> Send til kunde
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
