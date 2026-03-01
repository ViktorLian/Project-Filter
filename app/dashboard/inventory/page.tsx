'use client';

import { useState, useEffect } from 'react';
import {
  Package, Plus, AlertTriangle, TrendingDown, CheckCircle2,
  Search, Trash2, Pencil, X, Loader2, BarChart3, ShoppingCart
} from 'lucide-react';

interface Item {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  quantity: number;
  unit: string;
  reorder_level: number;
  cost_price?: number;
  location?: string;
  supplier?: string;
  notes?: string;
}

const BLANK: Omit<Item, 'id'> = {
  name: '', sku: '', category: '', quantity: 0, unit: 'stk',
  reorder_level: 5, cost_price: undefined, location: '', supplier: '', notes: '',
};

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [form, setForm] = useState<Omit<Item, 'id'>>(BLANK);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'low' | 'ok'>('all');
  const [saleItem, setSaleItem] = useState<Item | null>(null);
  const [saleForm, setSaleForm] = useState({ qty: 1, note: '' });
  const [saleSaving, setSaleSaving] = useState(false);

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    setLoading(true);
    const res = await fetch('/api/inventory');
    if (res.ok) { const d = await res.json(); setItems(d.items ?? []); }
    setLoading(false);
  }

  function openNew() {
    setEditItem(null);
    setForm(BLANK);
    setShowForm(true);
  }

  function openEdit(item: Item) {
    setEditItem(item);
    setForm({ name: item.name, sku: item.sku ?? '', category: item.category ?? '', quantity: item.quantity, unit: item.unit, reorder_level: item.reorder_level, cost_price: item.cost_price, location: item.location ?? '', supplier: item.supplier ?? '', notes: item.notes ?? '' });
    setShowForm(true);
  }

  async function saveForm(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (editItem) {
      const res = await fetch(`/api/inventory/${editItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const d = await res.json();
        setItems((prev) => prev.map((i) => i.id === editItem.id ? d.item : i));
      }
    } else {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { const d = await res.json(); setItems((prev) => [d.item, ...prev]); }
    }
    setSaving(false);
    setShowForm(false);
  }

  async function adjustQty(id: string, delta: number) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newQty = Math.max(0, item.quantity + delta);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: newQty } : i));
    await fetch(`/api/inventory/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQty }),
    });
  }

  async function logSale(e: React.FormEvent) {
    e.preventDefault();
    if (!saleItem) return;
    const newQty = Math.max(0, saleItem.quantity - saleForm.qty);
    setSaleSaving(true);
    const res = await fetch(`/api/inventory/${saleItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQty }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => i.id === saleItem.id ? { ...i, quantity: newQty } : i));
    }
    setSaleSaving(false);
    setSaleItem(null);
    setSaleForm({ qty: 1, note: '' });
  }

  async function deleteItem(id: string) {
    if (!confirm('Slett denne varen?')) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
  }

  const lowStock = items.filter((i) => i.quantity <= i.reorder_level);
  const totalValue = items.reduce((s, i) => s + ((i.cost_price ?? 0) * i.quantity), 0);

  const filtered = items.filter((item) => {
    const matchSearch = !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.sku ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (item.category ?? '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'low' ? item.quantity <= item.reorder_level : item.quantity > item.reorder_level);
    return matchSearch && matchFilter;
  });

  return (
    <div className="pb-10 pt-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lager & Ressurser</h1>
          <p className="text-slate-500 text-sm mt-0.5">Hold oversikt over materialer, utstyr og beholdning</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition shadow">
          <Plus className="h-4 w-4" /> Legg til vare
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Varer totalt</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{items.length}</p>
        </div>
        <div className={`rounded-xl border-2 bg-white p-4 ${lowStock.length > 0 ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={`h-4 w-4 ${lowStock.length > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lavt lager</span>
          </div>
          <p className={`text-2xl font-bold ${lowStock.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{lowStock.length}</p>
          {lowStock.length > 0 && <p className="text-xs text-amber-600 mt-0.5">Må bestilles snart</p>}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lagerverdi</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {totalValue > 0 ? `${totalValue.toLocaleString('nb-NO')} kr` : '—'}
          </p>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Varer som bør bestilles:
          </p>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((i) => (
              <span key={i.id} className="inline-flex items-center gap-1 text-xs rounded-full bg-amber-100 border border-amber-300 text-amber-800 px-2.5 py-1 font-medium">
                {i.name} — {i.quantity} {i.unit} igjen
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters + search */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Søk varer, SKU, kategori..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {(['all', 'low', 'ok'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition border ${filter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
          >
            {f === 'all' ? 'Alle' : f === 'low' ? '⚠ Lavt' : '✓ OK'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center text-slate-400">
          {items.length === 0 ? (
            <>
              <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Ingen varer ennå</p>
              <p className="text-sm mt-1">Legg til materialer, utstyr eller andre ressurser</p>
            </>
          ) : 'Ingen treff på søket'}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Vare</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Kategori</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Beholdning</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Leverandør</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Kostpris</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const isLow = item.quantity <= item.reorder_level;
                return (
                  <tr key={item.id} className="hover:bg-slate-50 group transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{item.name}</p>
                      {item.sku && <p className="text-xs text-slate-400">SKU: {item.sku}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{item.category || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => adjustQty(item.id, -1)} className="h-6 w-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold transition">−</button>
                        <span className={`font-bold w-12 text-center ${isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                          {item.quantity} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                        </span>
                        <button onClick={() => adjustQty(item.id, 1)} className="h-6 w-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold transition">+</button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{item.supplier || '—'}</td>
                    <td className="px-4 py-3 text-right text-slate-700 hidden sm:table-cell">
                      {item.cost_price ? `${item.cost_price.toLocaleString('nb-NO')} kr` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                          <AlertTriangle className="h-3 w-3" /> Lavt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                          <CheckCircle2 className="h-3 w-3" /> OK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => { setSaleItem(item); setSaleForm({ qty: 1, note: '' }); }}
                          title="Logg salg / bruk"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition">
                          <ShoppingCart className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Log sale modal */}
      {saleItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSaleItem(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={logSale}
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-emerald-500" />
                <h2 className="font-bold text-lg text-slate-900">Logg salg / bruk</h2>
              </div>
              <button type="button" onClick={() => setSaleItem(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{saleItem.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">Nåværende beholdning: <span className="font-bold text-slate-700">{saleItem.quantity} {saleItem.unit}</span></p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Antall solgt / brukt
              </label>
              <input
                type="number"
                min="1"
                max={saleItem.quantity}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={saleForm.qty}
                onChange={(e) => setSaleForm((f) => ({ ...f, qty: Number(e.target.value) }))}
              />
              {saleForm.qty > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Ny beholdning: <span className="font-semibold">{Math.max(0, saleItem.quantity - saleForm.qty)} {saleItem.unit}</span>
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Notat (valgfritt)</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="f.eks. Solgt til prosjekt #14, brukt på jobb..."
                value={saleForm.note}
                onChange={(e) => setSaleForm((f) => ({ ...f, note: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setSaleItem(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Avbryt</button>
              <button type="submit" disabled={saleSaving || saleForm.qty < 1} className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition flex items-center justify-center gap-2">
                {saleSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                Registrer salg
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveForm}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-900">{editItem ? 'Rediger vare' : 'Ny vare'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700 block mb-1">Navn *</label>
                <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="f.eks. Sement 25kg" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">SKU / Artikkelnr</label>
                <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} placeholder="SKU-001" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Kategori</label>
                <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Bygningsmateriale" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Antall</label>
                <input type="number" min="0" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Enhet</label>
                <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="stk, kg, liter..." />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Bestillingsgrense</label>
                <input type="number" min="0" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.reorder_level} onChange={(e) => setForm((f) => ({ ...f, reorder_level: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Kostpris (kr)</label>
                <input type="number" min="0" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.cost_price ?? ''} onChange={(e) => setForm((f) => ({ ...f, cost_price: e.target.value ? Number(e.target.value) : undefined }))} placeholder="0" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Plassering</label>
                <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Lager A, hylle 3" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700 block mb-1">Leverandør</label>
                <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.supplier} onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))} placeholder="Leverandør AS" />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Avbryt</button>
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition flex items-center justify-center gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editItem ? 'Lagre endringer' : 'Legg til'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
