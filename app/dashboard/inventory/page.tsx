'use client';

import { useState, useEffect } from 'react';
import {
  Package, Plus, AlertTriangle, CheckCircle2,
  Search, Trash2, Pencil, X, Loader2, BarChart3, RefreshCw,
  Wrench, FileText, ArrowDownToLine, ArrowUpFromLine, QrCode,
  MapPin, ClipboardList, Activity, DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Item {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  quantity: number;
  unit: string;
  reorder_level: number;
  cost_price?: number;
  sell_price?: number;
  location?: string;
  supplier?: string;
  notes?: string;
}

const BLANK: Omit<Item, 'id'> = {
  name: '', sku: '', category: '', quantity: 0, unit: 'stk',
  reorder_level: 5, cost_price: undefined, sell_price: undefined, location: '', supplier: '', notes: '',
};

type Tab = 'varer' | 'assets' | 'innkjøp' | 'log';

const MOCK_ASSETS = [
  { id: 'a1', name: 'Bosch GBH 12V Borhammer', serial: 'BSH-2024-001', location: 'Lager A', status: 'Tilgjengelig', last_service: '2025-10-01', next_service: '2026-04-01', checked_out_to: null, qr: 'FP-A-0001' },
  { id: 'a2', name: 'Makita vinkelsliper 230mm', serial: 'MKT-2023-445', location: 'Ansatt: Ola', status: 'Utlånt', last_service: '2025-08-15', next_service: '2026-02-15', checked_out_to: 'Ola Nordmann', qr: 'FP-A-0002' },
  { id: 'a3', name: 'Stige 8m aluminium', serial: 'STG-2022-019', location: 'Lager B', status: 'Tilgjengelig', last_service: '2025-06-01', next_service: '2025-12-01', checked_out_to: null, qr: 'FP-A-0003' },
  { id: 'a4', name: 'Firmabil – Toyota Hilux NK 12345', serial: 'VIN-HLX-2021', location: 'Parkering', status: 'Tilgjengelig', last_service: '2025-11-01', next_service: '2026-05-01', checked_out_to: null, qr: 'FP-A-0004' },
];

const MOCK_POS = [
  { id: 'po1', supplier: 'Wurth AS', items: 3, total: 4500, status: 'Sendt', created: '2026-02-20', expected: '2026-03-05' },
  { id: 'po2', supplier: 'Byggmax', items: 7, total: 12800, status: 'Mottatt', created: '2026-02-10', expected: '2026-02-17' },
  { id: 'po3', supplier: 'Clas Ohlson', items: 2, total: 890, status: 'Utkast', created: '2026-02-28', expected: '—' },
];

const MOCK_LOG = [
  { id: 'l1', item: 'Sement 25kg', type: 'ut', qty: 5, user: 'Ola N.', reason: 'Jobb #204 – Frogner', date: '2026-02-28 14:32' },
  { id: 'l2', item: 'Gips 12mm', type: 'inn', qty: 20, user: 'Kari O.', reason: 'Mottak fra Byggmax PO#po2', date: '2026-02-17 09:10' },
  { id: 'l3', item: 'Treverk 36×98', type: 'ut', qty: 12, user: 'Ola N.', reason: 'Jobb #201 – Asker', date: '2026-02-14 11:00' },
  { id: 'l4', item: 'Skruer 4x50 (500pk)', type: 'ut', qty: 2, user: 'Thomas B.', reason: 'Jobb #200 – Oslo', date: '2026-02-11 08:45' },
  { id: 'l5', item: 'Silikon hvit', type: 'inn', qty: 10, user: 'System', reason: 'Oppstart – initial beholdning', date: '2026-01-02 10:00' },
];

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
  const [saleForm, setSaleForm] = useState({ qty: 1, note: '', type: 'ut' as 'inn' | 'ut' });
  const [saleSaving, setSaleSaving] = useState(false);
  const [tab, setTab] = useState<Tab>('varer');
  const [showPOModal, setShowPOModal] = useState(false);
  const [poForm, setPoForm] = useState({ supplier: '', notes: '' });

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    setLoading(true);
    const res = await fetch('/api/inventory');
    if (res.ok) { const d = await res.json(); setItems(d.items ?? []); }
    setLoading(false);
  }

  function openNew() { setEditItem(null); setForm(BLANK); setShowForm(true); }
  function openEdit(item: Item) {
    setEditItem(item);
    setForm({ name: item.name, sku: item.sku ?? '', category: item.category ?? '', quantity: item.quantity, unit: item.unit, reorder_level: item.reorder_level, cost_price: item.cost_price, sell_price: item.sell_price, location: item.location ?? '', supplier: item.supplier ?? '', notes: item.notes ?? '' });
    setShowForm(true);
  }

  async function saveForm(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    if (editItem) {
      const res = await fetch(`/api/inventory/${editItem.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { const d = await res.json(); setItems(prev => prev.map(i => i.id === editItem.id ? d.item : i)); }
    } else {
      const res = await fetch('/api/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { const d = await res.json(); setItems(prev => [d.item, ...prev]); }
    }
    setSaving(false); setShowForm(false);
  }

  async function adjustQty(id: string, delta: number) {
    const item = items.find(i => i.id === id); if (!item) return;
    const newQty = Math.max(0, item.quantity + delta);
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
    await fetch(`/api/inventory/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity: newQty }) });
  }

  async function logMovement(e: React.FormEvent) {
    e.preventDefault(); if (!saleItem) return;
    const delta = saleForm.type === 'ut' ? -saleForm.qty : saleForm.qty;
    const newQty = Math.max(0, saleItem.quantity + delta);
    setSaleSaving(true);
    await fetch(`/api/inventory/${saleItem.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity: newQty }) });
    setItems(prev => prev.map(i => i.id === saleItem.id ? { ...i, quantity: newQty } : i));
    setSaleSaving(false); setSaleItem(null); setSaleForm({ qty: 1, note: '', type: 'ut' });
  }

  async function deleteItem(id: string) {
    if (!confirm('Slett varen?')) return;
    setItems(prev => prev.filter(i => i.id !== id));
    await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
  }

  const lowStock = items.filter(i => i.quantity <= i.reorder_level);
  const totalValue = items.reduce((s, i) => s + ((i.cost_price ?? 0) * i.quantity), 0);
  const filtered = items.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || (item.sku ?? '').toLowerCase().includes(search.toLowerCase()) || (item.category ?? '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'low' ? item.quantity <= item.reorder_level : item.quantity > item.reorder_level);
    return matchSearch && matchFilter;
  });

  const TABS: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'varer', label: 'Varer', icon: Package, badge: items.length },
    { id: 'assets', label: 'Utstyr & Maskiner', icon: Wrench, badge: MOCK_ASSETS.length },
    { id: 'innkjøp', label: 'Innkjøpsordrer', icon: ClipboardList, badge: MOCK_POS.length },
    { id: 'log', label: 'Bevegelseslogg', icon: Activity, badge: MOCK_LOG.length },
  ];

  return (
    <div className="pb-10 space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Lager & Ressursstyring</h1>
          <p className="text-sm text-slate-500 mt-0.5">Varer, utstyr, innkjøp og bevegelseshistorikk</p>
        </div>
        <div className="flex gap-2">
          {tab === 'varer' && <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm"><Plus className="h-4 w-4" /> Ny vare</button>}
          {tab === 'innkjøp' && <button onClick={() => setShowPOModal(true)} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm"><Plus className="h-4 w-4" /> Ny innkjøpsordre</button>}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Varer registrert', value: items.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Lavt på lager', value: lowStock.length, icon: AlertTriangle, color: lowStock.length > 0 ? 'text-amber-600' : 'text-slate-400', bg: lowStock.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200' },
          { label: 'Lagerverdi', value: totalValue > 0 ? `${totalValue.toLocaleString('nb-NO')} kr` : '—', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Åpne PO-er', value: MOCK_POS.filter(p => p.status !== 'Mottatt').length, icon: ClipboardList, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={cn('rounded-xl border p-4 flex items-center gap-3', bg)}>
            <Icon className={cn('h-5 w-5 flex-shrink-0', color)} />
            <div><p className={cn('text-xl font-bold', color)}>{value}</p><p className="text-xs text-slate-500">{label}</p></div>
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && tab === 'varer' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-wrap items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span className="text-sm font-semibold text-amber-800">Lavt på lager:</span>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(i => <span key={i.id} className="text-xs bg-amber-100 border border-amber-300 text-amber-800 rounded-full px-2.5 py-1 font-medium">{i.name} — {i.quantity} {i.unit}</span>)}
          </div>
          <button onClick={() => { setTab('innkjøp'); setShowPOModal(true); }} className="ml-auto text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg transition">
            Opprett innkjøpsordre →
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap', tab === t.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100')}>
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full', tab === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600')}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Varer tab ─────────────────────────────────────────────── */}
      {tab === 'varer' && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input placeholder="Søk varer, SKU, kategori..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {(['all', 'low', 'ok'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-2 rounded-xl text-sm font-medium transition border', filter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300')}>
                {f === 'all' ? 'Alle' : f === 'low' ? '⚠ Lavt' : '✓ OK'}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center text-slate-400">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">{items.length === 0 ? 'Ingen varer ennå' : 'Ingen treff'}</p>
              {items.length === 0 && <p className="text-sm mt-1">Klikk "Ny vare" for å komme i gang</p>}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Vare</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Kategori</th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600">Beholdning</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Plassering</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Verdi</th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(item => {
                    const isLow = item.quantity <= item.reorder_level;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 group transition">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{item.name}</p>
                          {item.sku && <p className="text-xs text-slate-400 font-mono">SKU: {item.sku}</p>}
                          {item.supplier && <p className="text-xs text-slate-400">{item.supplier}</p>}
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{item.category || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => adjustQty(item.id, -1)} className="h-6 w-6 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 flex items-center justify-center font-bold transition">−</button>
                            <span className={cn('font-bold w-16 text-center text-sm', isLow ? 'text-amber-600' : 'text-slate-900')}>
                              {item.quantity} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                            </span>
                            <button onClick={() => adjustQty(item.id, 1)} className="h-6 w-6 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 flex items-center justify-center font-bold transition">+</button>
                          </div>
                          <div className="mt-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full', isLow ? 'bg-amber-400' : 'bg-emerald-500')} style={{ width: `${Math.min(100, (item.quantity / Math.max(item.reorder_level * 2, 1)) * 100)}%` }} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">
                          {item.location ? <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span> : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700 hidden sm:table-cell">
                          {item.cost_price ? `${(item.cost_price * item.quantity).toLocaleString('nb-NO')} kr` : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5"><AlertTriangle className="h-3 w-3" /> Lavt</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5"><CheckCircle2 className="h-3 w-3" /> OK</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => { setSaleItem(item); setSaleForm({ qty: 1, note: '', type: 'ut' }); }} title="Logg bevegelse" className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"><RefreshCw className="h-3.5 w-3.5" /></button>
                            <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"><Pencil className="h-3.5 w-3.5" /></button>
                            <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Assets tab ─────────────────────────────────────────────── */}
      {tab === 'assets' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Spor maskiner, firmabiler og verktøy med servicehistorikk og utlånslogg</p>
            <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"><Plus className="h-4 w-4" /> Nytt asset</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MOCK_ASSETS.map(a => {
              const serviceSoon = new Date(a.next_service) < new Date(Date.now() + 30 * 86400000);
              const serviceOverdue = new Date(a.next_service) < new Date();
              return (
                <div key={a.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-900">{a.name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{a.serial} · QR: {a.qr}</p>
                    </div>
                    <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border', a.status === 'Utlånt' ? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200')}>{a.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                    <div><p className="text-slate-400 mb-0.5">Plassering</p><p className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3" />{a.location}</p></div>
                    {a.checked_out_to && <div><p className="text-slate-400 mb-0.5">Sjekket ut til</p><p className="font-medium">{a.checked_out_to}</p></div>}
                    <div><p className="text-slate-400 mb-0.5">Siste service</p><p className="font-medium">{new Date(a.last_service).toLocaleDateString('nb-NO')}</p></div>
                    <div>
                      <p className="text-slate-400 mb-0.5">Neste service</p>
                      <p className={cn('font-medium', serviceOverdue ? 'text-red-600' : serviceSoon ? 'text-amber-600' : 'text-slate-700')}>
                        {new Date(a.next_service).toLocaleDateString('nb-NO')}
                        {serviceOverdue && ' ⚠ Forfalt'}{!serviceOverdue && serviceSoon && ' · Snart'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                    <button className="flex-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg py-1.5 transition">{a.status === 'Utlånt' ? 'Registrer innlevering' : 'Sjekk ut'}</button>
                    <button className="flex-1 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-1.5 transition flex items-center justify-center gap-1"><Wrench className="h-3 w-3" /> Logg service</button>
                    <button className="px-3 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-1.5 transition" title="QR-kode"><QrCode className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Innkjøp tab ─────────────────────────────────────────────── */}
      {tab === 'innkjøp' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Opprett innkjøpsordrer og spor mottaksstatus fra leverandører</p>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">PO-nr</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Leverandør</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Varer</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Opprettet</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Forventet</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_POS.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50 transition group">
                    <td className="px-4 py-3 font-mono text-slate-600 text-xs">{po.id.toUpperCase()}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{po.supplier}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{po.items}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{po.total.toLocaleString('nb-NO')} kr</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{po.created}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{po.expected}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border', po.status === 'Mottatt' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : po.status === 'Sendt' ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-slate-500 bg-slate-50 border-slate-200')}>{po.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition">
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition" title="PDF"><FileText className="h-3.5 w-3.5" /></button>
                        {po.status !== 'Mottatt' && <button className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition" title="Mottatt"><CheckCircle2 className="h-3.5 w-3.5" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Log tab ─────────────────────────────────────────────── */}
      {tab === 'log' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Alle inn- og utbevegelser, hvem som gjorde hva og hvorfor</p>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Dato</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Vare</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Type</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Antall</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Bruker</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Grunn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_LOG.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{l.date}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{l.item}</td>
                    <td className="px-4 py-3 text-center">
                      {l.type === 'inn' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5"><ArrowDownToLine className="h-3 w-3" /> Inn</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5"><ArrowUpFromLine className="h-3 w-3" /> Ut</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900">{l.qty}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{l.user}</td>
                    <td className="px-4 py-3 text-slate-500">{l.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Movement modal */}
      {saleItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSaleItem(null)}>
          <form onClick={e => e.stopPropagation()} onSubmit={logMovement} className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2"><RefreshCw className="h-5 w-5 text-blue-500" />Logg bevegelse</h2>
              <button type="button" onClick={() => setSaleItem(null)} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{saleItem.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">Nåværende: <strong>{saleItem.quantity} {saleItem.unit}</strong></p>
            </div>
            <div className="flex gap-2">
              {(['ut', 'inn'] as const).map(t => (
                <button key={t} type="button" onClick={() => setSaleForm(f => ({ ...f, type: t }))}
                  className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold border transition', saleForm.type === t ? (t === 'ut' ? 'bg-orange-600 text-white border-orange-600' : 'bg-emerald-600 text-white border-emerald-600') : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300')}>
                  {t === 'ut' ? <><ArrowUpFromLine className="h-4 w-4" />Ut</> : <><ArrowDownToLine className="h-4 w-4" />Inn</>}
                </button>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Antall</label>
              <input type="number" min="1" required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={saleForm.qty} onChange={e => setSaleForm(f => ({ ...f, qty: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Årsak</label>
              <input type="text" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400" placeholder="F.eks. Jobb #215 – Drammen" value={saleForm.note} onChange={e => setSaleForm(f => ({ ...f, note: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSaleItem(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Avbryt</button>
              <button type="submit" disabled={saleSaving} className={cn('flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition flex items-center justify-center gap-2 disabled:opacity-50', saleForm.type === 'ut' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-emerald-600 hover:bg-emerald-700')}>
                {saleSaving && <Loader2 className="h-4 w-4 animate-spin" />}Lagre
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PO Modal */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowPOModal(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2"><ClipboardList className="h-5 w-5 text-violet-500" />Ny innkjøpsordre</h2>
              <button onClick={() => setShowPOModal(false)} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            {lowStock.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-amber-800 mb-2">Varer med lavt lager:</p>
                <div className="flex flex-wrap gap-1.5">{lowStock.map(i => <span key={i.id} className="text-xs bg-white border border-amber-200 text-amber-700 rounded-full px-2 py-0.5">{i.name} ({i.quantity} igjen)</span>)}</div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Leverandør *</label>
              <input value={poForm.supplier} onChange={e => setPoForm(f => ({ ...f, supplier: e.target.value }))} placeholder="F.eks. Wurth AS, Byggmax..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Notater</label>
              <textarea value={poForm.notes} onChange={e => setPoForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Spesielle instruksjoner til leverandøren..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowPOModal(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Avbryt</button>
              <button onClick={() => { setTab('innkjøp'); setShowPOModal(false); }} disabled={!poForm.supplier} className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 py-2.5 text-sm font-semibold text-white transition">Opprett PO</button>
            </div>
          </div>
        </div>
      )}

      {/* Item form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <form onClick={e => e.stopPropagation()} onSubmit={saveForm} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-900">{editItem ? 'Rediger vare' : 'Ny vare'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Navn *</label>
                <input required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="F.eks. Sement 25kg" />
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">SKU</label><input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="SKU-001" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label><input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Bygningsmateriale" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Antall</label><input type="number" min="0" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Enhet</label><input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="stk, kg, m..." /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Bestillingsgrense</label><input type="number" min="0" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={form.reorder_level} onChange={e => setForm(f => ({ ...f, reorder_level: Number(e.target.value) }))} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Kostpris (kr)</label><input type="number" min="0" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={form.cost_price ?? ''} onChange={e => setForm(f => ({ ...f, cost_price: e.target.value ? Number(e.target.value) : undefined }))} placeholder="0" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Salgspris (kr)</label><input type="number" min="0" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={form.sell_price ?? ''} onChange={e => setForm(f => ({ ...f, sell_price: e.target.value ? Number(e.target.value) : undefined }))} placeholder="0" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Plassering</label><input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Lager A, hylle 3" /></div>
              <div className="col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">Leverandør</label><input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="Leverandør AS" /></div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Avbryt</button>
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition flex items-center justify-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}{editItem ? 'Lagre' : 'Legg til'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
