'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, X, BookOpen, Edit3, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORIES = ['HMS', 'Salg', 'Kundeservice', 'Prosjektledelse', 'HR', 'Økonomi', 'IT', 'Generelt'];

type Procedure = {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  responsible: string;
  version: number;
  updated_at: string;
};

const EMPTY = { title: '', category: 'Generelt', content: '', tags: '', responsible: '', version: 1 };

export default function ProceduresPage() {
  const [items, setItems] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Alle');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Procedure | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function load() {
    setLoading(true);
    const r = await fetch('/api/procedures');
    if (r.ok) setItems(await r.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setEditItem(null); setForm({ ...EMPTY }); setShowModal(true); }
  function openEdit(p: Procedure) {
    setEditItem(p);
    setForm({ title: p.title, category: p.category, content: p.content, tags: (p.tags ?? []).join(', '), responsible: p.responsible ?? '', version: p.version ?? 1 });
    setShowModal(true);
  }

  async function save() {
    setSaving(true);
    const body = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    const url = editItem ? `/api/procedures/${editItem.id}` : '/api/procedures';
    await fetch(url, { method: editItem ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setSaving(false);
    setShowModal(false);
    load();
  }

  async function del(id: string) {
    if (!confirm('Slett prosedyre?')) return;
    await fetch(`/api/procedures/${id}`, { method: 'DELETE' });
    load();
  }

  const filtered = items.filter(p => {
    const s = search.toLowerCase();
    const m = !s || p.title.toLowerCase().includes(s) || p.content?.toLowerCase().includes(s) || (p.tags ?? []).some(t => t.toLowerCase().includes(s));
    const c = catFilter === 'Alle' || p.category === catFilter;
    return m && c;
  });

  const catCounts: Record<string, number> = {};
  items.forEach(p => { catCounts[p.category] = (catCounts[p.category] ?? 0) + 1; });

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prosedyre-bank</h1>
          <p className="text-slate-500 text-sm mt-0.5">Alle "slik gjor vi det her"-rutiner samlet ett sted</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          <Plus className="h-4 w-4" /> Ny prosedyre
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[['Alle', items.length], ...Object.entries(catCounts).slice(0, 3)].map(([cat, count]) => (
          <button key={cat} onClick={() => setCatFilter(String(cat))}
            className={`rounded-xl border p-3 text-left transition ${catFilter === cat ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
            <p className="text-lg font-bold text-slate-900">{count}</p>
            <p className="text-xs text-slate-500 truncate">{cat}</p>
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Sok i prosedyrer..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Alle</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Laster prosedyrer...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
          <BookOpen className="h-10 w-10 mb-3 opacity-30" />
          <p className="font-medium">Ingen prosedyrer enda</p>
          <p className="text-sm">Klikk "Ny prosedyre" for a starte</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm transition">
              <div className="flex items-center px-4 py-3 cursor-pointer" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{p.title}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{p.category}</span>
                    <span className="text-xs text-slate-400">v{p.version ?? 1}</span>
                  </div>
                  {p.responsible && <p className="text-xs text-slate-500 mt-0.5">Ansvarlig: {p.responsible}</p>}
                  {(p.tags ?? []).length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {p.tags.map(t => <span key={t} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{t}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button onClick={e => { e.stopPropagation(); openEdit(p); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); del(p.id); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  {expanded === p.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </div>
              </div>
              {expanded === p.id && p.content && (
                <div className="border-t border-slate-100 px-4 py-3 bg-slate-50">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{p.content}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{editItem ? 'Rediger prosedyre' : 'Ny prosedyre'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tittel *</label>
                <input value={form.title} onChange={set('title')} placeholder="F.eks. Sakshåndtering ved kundeklage" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori</label>
                  <select value={form.category} onChange={set('category')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ansvarlig</label>
                  <input value={form.responsible} onChange={set('responsible')} placeholder="Navn / stilling" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Innhold / Steg</label>
                <textarea value={form.content} onChange={set('content')} rows={10} placeholder={"Steg 1: ...\nSteg 2: ...\nSteg 3: ..."} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tags (kommaseparert)</label>
                <input value={form.tags} onChange={set('tags')} placeholder="klage, kunde, refusjon" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 p-5 pt-0">
              <button onClick={save} disabled={saving || !form.title}
                className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition">
                {saving ? 'Lagrer...' : editItem ? 'Lagre endringer' : 'Opprett prosedyre'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-5 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition">Avbryt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
