'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Plus, ArrowUpCircle, ArrowDownCircle, FileSpreadsheet
} from 'lucide-react';

type Dir = 'IN' | 'OUT';
type Transaction = { id: string; direction: Dir; amount: number; category: string; description: string; occurred_at: string };

const INCOME_CATS = ['Salg', 'Faktura', 'Tjeneste', 'Prosjekt', 'Annet inntekt'];
const EXPENSE_CATS = ['Materiell', 'Lønn', 'Underentreprenør', 'Transport', 'Markedsføring', 'Forsikring', 'Leie', 'Utstyr', 'Annet utgift'];

const DEMO: Transaction[] = [
  { id: '1', direction: 'IN', amount: 45000, category: 'Faktura', description: 'Kari Nordmann – Baderom renovering', occurred_at: '2026-02-18' },
  { id: '2', direction: 'OUT', amount: 12000, category: 'Materiell', description: 'Fliser og plater – Maxbo', occurred_at: '2026-02-17' },
  { id: '3', direction: 'IN', amount: 28500, category: 'Faktura', description: 'Erik Bakke AS – Takarbeid', occurred_at: '2026-02-15' },
  { id: '4', direction: 'OUT', amount: 45000, category: 'Lønn', description: 'Lonnsutbetaling – ansatt 1', occurred_at: '2026-02-15' },
  { id: '5', direction: 'OUT', amount: 5200, category: 'Transport', description: 'Diesel + bompenger', occurred_at: '2026-02-10' },
  { id: '6', direction: 'IN', amount: 62000, category: 'Prosjekt', description: 'Nordic Tak – Fasade prosjekt', occurred_at: '2026-02-08' },
  { id: '7', direction: 'OUT', amount: 8900, category: 'Markedsføring', description: 'Facebook Ads – februar', occurred_at: '2026-02-05' },
  { id: '8', direction: 'OUT', amount: 3500, category: 'Forsikring', description: 'Yrkesskadeforsikring', occurred_at: '2026-02-01' },
  { id: '9', direction: 'IN', amount: 19000, category: 'Salg', description: 'Maling innvendig – Ingrid Hansen', occurred_at: '2026-01-28' },
  { id: '10', direction: 'OUT', amount: 22000, category: 'Underentreprenør', description: 'Elektriker AS – UE-oppdrag', occurred_at: '2026-01-25' },
];

const MONTHLY = [
  { month: 'Aug', income: 82000, expense: 54000 },
  { month: 'Sep', income: 94000, expense: 61000 },
  { month: 'Okt', income: 71000, expense: 48000 },
  { month: 'Nov', income: 108000, expense: 72000 },
  { month: 'Des', income: 62000, expense: 40000 },
  { month: 'Jan', income: 95000, expense: 65000 },
  { month: 'Feb', income: 154500, expense: 96600 },
];

const CAT_COLORS: Record<string, string> = {
  Faktura: '#3b82f6', Salg: '#10b981', Prosjekt: '#8b5cf6', 'Annet inntekt': '#06b6d4', Tjeneste: '#f59e0b',
  Materiell: '#ef4444', Lønn: '#f97316', Underentreprenør: '#ec4899', Transport: '#6366f1',
  Markedsføring: '#14b8a6', Forsikring: '#84cc16', Leie: '#a78bfa', Utstyr: '#fb923c', 'Annet utgift': '#94a3b8',
};

function fmt(n: number) { return n.toLocaleString('no-NO') + ' kr'; }

function exportCSV(rows: Transaction[]) {
  const csv = 'Dato,Retning,Kategori,Beskrivelse,Belop\n' +
    rows.map(t => `${t.occurred_at},${t.direction === 'IN' ? 'Inntekt' : 'Utgift'},${t.category},"${t.description}",${t.amount}`).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `cashflow-${new Date().toISOString().slice(0,7)}.csv`; a.click();
}

export default function CashflowPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(DEMO);
  const [showForm, setShowForm] = useState(false);
  const [filterDir, setFilterDir] = useState<'ALL' | Dir>('ALL');
  const [filterCat, setFilterCat] = useState('ALL');
  const [tx, setTx] = useState({ direction: 'IN' as Dir, amount: '', category: 'Faktura', description: '', occurred_at: new Date().toISOString().split('T')[0] });

  const income = transactions.filter(t => t.direction === 'IN').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.direction === 'OUT').reduce((s, t) => s + t.amount, 0);
  const net = income - expense;
  const margin = income > 0 ? Math.round((net / income) * 100) : 0;

  const expCats = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.direction === 'OUT').forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  const filtered = transactions.filter(t =>
    (filterDir === 'ALL' || t.direction === filterDir) &&
    (filterCat === 'ALL' || t.category === filterCat)
  );

  const maxM = Math.max(...MONTHLY.map(m => m.income));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTransactions(prev => [{ id: Date.now().toString(), direction: tx.direction, amount: Number(tx.amount), category: tx.category, description: tx.description, occurred_at: tx.occurred_at }, ...prev]);
    setTx({ direction: 'IN', amount: '', category: 'Faktura', description: '', occurred_at: new Date().toISOString().split('T')[0] });
    setShowForm(false);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kontantstrom og okonomi</h1>
          <p className="text-slate-500 text-sm">Full oversikt over inntekter, utgifter og lønnsomhet</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCSV(transactions)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-blue-300 transition">
            <FileSpreadsheet className="h-4 w-4" /> Eksporter CSV
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
            <Plus className="h-4 w-4" /> Ny transaksjon
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Inntekter', value: fmt(income), sub: 'Denne perioden', color: 'text-emerald-600', icon: <ArrowUpCircle className="h-5 w-5 text-emerald-500" /> },
          { label: 'Utgifter', value: fmt(expense), sub: 'Denne perioden', color: 'text-red-500', icon: <ArrowDownCircle className="h-5 w-5 text-red-400" /> },
          { label: 'Netto resultat', value: fmt(net), sub: net >= 0 ? 'Overskudd' : 'Underskudd', color: net >= 0 ? 'text-emerald-700' : 'text-red-700', icon: <DollarSign className={`h-5 w-5 ${net >= 0 ? 'text-emerald-500' : 'text-red-400'}`} /> },
          { label: 'Fortjenestemargin', value: `${margin}%`, sub: margin > 30 ? 'God margin' : margin > 10 ? 'Middels' : 'Lav margin', color: margin > 30 ? 'text-emerald-700' : margin > 10 ? 'text-amber-600' : 'text-red-600', icon: <TrendingUp className="h-5 w-5 text-blue-500" /> },
        ].map(k => (
          <div key={k.label} className="rounded-xl bg-white border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{k.label}</p>
              {k.icon}
            </div>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-slate-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className="rounded-xl bg-white border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Inntekt vs. utgift – siste 7 maneder</h2>
        <div className="flex items-end gap-3">
          {MONTHLY.map(m => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 items-end" style={{ height: 120 }}>
                <div className="flex-1 rounded-t-sm bg-emerald-400" style={{ height: `${(m.income / maxM) * 120}px` }} title={fmt(m.income)} />
                <div className="flex-1 rounded-t-sm bg-red-300" style={{ height: `${(m.expense / maxM) * 120}px` }} title={fmt(m.expense)} />
              </div>
              <span className="text-xs text-slate-500 font-medium">{m.month}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-6 mt-3">
          <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="block h-3 w-3 rounded bg-emerald-400" /> Inntekt</span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="block h-3 w-3 rounded bg-red-300" /> Utgift</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category breakdown */}
        <div className="rounded-xl bg-white border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Utgiftsfordeling</h2>
          <div className="space-y-3">
            {expCats.map(([cat, amt]) => (
              <div key={cat}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">{cat}</span>
                  <span className="font-semibold text-slate-700">{fmt(amt)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100">
                  <div className="h-1.5 rounded-full" style={{ width: `${(amt / expense) * 100}%`, backgroundColor: CAT_COLORS[cat] || '#94a3b8' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200">
          <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-wrap gap-2">
            <h2 className="text-base font-semibold">Transaksjoner</h2>
            <div className="flex gap-2">
              <select value={filterDir} onChange={e => setFilterDir(e.target.value as any)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-600">
                <option value="ALL">Alle</option><option value="IN">Inntekter</option><option value="OUT">Utgifter</option>
              </select>
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-600">
                <option value="ALL">Alle kategorier</option>
                {[...new Set(transactions.map(t => t.category))].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
            {filtered.map(t => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition">
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${t.direction === 'IN' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {t.direction === 'IN' ? <ArrowUpCircle className="h-5 w-5 text-emerald-600" /> : <ArrowDownCircle className="h-5 w-5 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{t.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: CAT_COLORS[t.category] || '#94a3b8' }}>{t.category}</span>
                    <span className="text-xs text-slate-400">{t.occurred_at}</span>
                  </div>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${t.direction === 'IN' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {t.direction === 'IN' ? '+' : '-'}{t.amount.toLocaleString('no-NO')} kr
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Ny transaksjon</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {(['IN', 'OUT'] as Dir[]).map(d => (
                  <button key={d} type="button" onClick={() => setTx(p => ({ ...p, direction: d, category: d === 'IN' ? 'Faktura' : 'Materiell' }))}
                    className={`rounded-xl border py-3 text-sm font-semibold transition ${tx.direction === d ? (d === 'IN' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-red-500 text-white border-red-500') : 'bg-white text-slate-600 border-slate-200'}`}>
                    {d === 'IN' ? '+ Inntekt' : '- Utgift'}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs text-slate-500">Kategori</label>
                <select value={tx.category} onChange={e => setTx(p => ({ ...p, category: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  {(tx.direction === 'IN' ? INCOME_CATS : EXPENSE_CATS).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">Beskrivelse</label>
                <input value={tx.description} onChange={e => setTx(p => ({ ...p, description: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="f.eks. Faktura – Kari Nordmann" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Belop (kr)</label>
                  <input type="number" value={tx.amount} onChange={e => setTx(p => ({ ...p, amount: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="0" required min="1" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Dato</label>
                  <input type="date" value={tx.occurred_at} onChange={e => setTx(p => ({ ...p, occurred_at: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm text-slate-600 hover:bg-slate-50">Avbryt</button>
                <button type="submit" className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Lagre</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}