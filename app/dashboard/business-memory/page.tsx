'use client';

import { useState, useEffect, useMemo } from 'react';
import { Brain, Search, Plus, Tag, Trash2, Edit3, X, Save, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

type EntryType = 'decision' | 'win' | 'failure' | 'learning' | 'note' | 'customer';

interface BrainEntry {
  id: string;
  type: EntryType;
  title: string;
  content: string;
  tags: string[];
  date: string;
  related?: string;
  created_at?: string;
}

const TYPE_CONFIG: Record<EntryType, { label: string; color: string; bg: string; border: string; dot: string }> = {
  win:      { label: 'Seier',      color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-500' },
  decision: { label: 'Beslutning', color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    dot: 'bg-blue-500' },
  failure:  { label: 'Laering',    color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30',     dot: 'bg-red-500' },
  learning: { label: 'Innsikt',    color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   dot: 'bg-amber-500' },
  customer: { label: 'Kunde',      color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/30',  dot: 'bg-purple-500' },
  note:     { label: 'Notat',      color: 'text-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-600/30',   dot: 'bg-slate-500' },
};

const EMPTY = (): Omit<BrainEntry, 'id' | 'created_at'> => ({
  type: 'note', title: '', content: '', tags: [], date: new Date().toISOString().slice(0, 10),
});

export default function BusinessMemoryPage() {
  const [entries, setEntries] = useState<BrainEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | EntryType>('all');
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<BrainEntry | null>(null);
  const [form, setForm] = useState(EMPTY());
  const [tagInput, setTagInput] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/brain')
      .then(r => r.json())
      .then(data => { setEntries(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const notify = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const openNew = () => { setEditEntry(null); setForm(EMPTY()); setTagInput(''); setShowForm(true); };
  const openEdit = (e: BrainEntry) => {
    setEditEntry(e);
    setForm({ type: e.type, title: e.title, content: e.content, tags: e.tags ?? [], date: e.date, related: e.related ?? '' });
    setTagInput('');
    setShowForm(true);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t] }));
    setTagInput('');
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editEntry) {
        const res = await fetch(`/api/brain/${editEntry.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
        });
        const data = await res.json();
        setEntries(es => es.map(e => e.id === editEntry.id ? data : e));
        notify('Oppdatert');
      } else {
        const res = await fetch('/api/brain', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
        });
        const data = await res.json();
        setEntries(es => [data, ...es]);
        notify('Lagret');
      }
      setShowForm(false);
    } catch { notify('Feil ved lagring', false); }
    setSaving(false);
  };

  const del = async (id: string) => {
    if (!confirm('Slett denne oppforingen?')) return;
    await fetch(`/api/brain/${id}`, { method: 'DELETE' });
    setEntries(es => es.filter(e => e.id !== id));
    notify('Slettet');
  };

  const filtered = useMemo(() => entries.filter(e => {
    const matchType = filterType === 'all' || e.type === filterType;
    const q = search.toLowerCase();
    const matchSearch = !q || e.title.toLowerCase().includes(q) || e.content?.toLowerCase().includes(q) || e.tags?.some(t => t.includes(q));
    return matchType && matchSearch;
  }), [entries, filterType, search]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto">

        {toast && (
          <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold ${toast.ok ? 'bg-emerald-600' : 'bg-red-600'}`}>
            {toast.ok ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {toast.msg}
          </div>
        )}

        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Brain className="h-5 w-5 text-purple-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Second Brain</span>
            </div>
            <h1 className="text-3xl font-black text-white">Bedriftshukommelse</h1>
            <p className="text-slate-400 text-sm mt-1">Beslutninger, innsikt og kundekunnskap  aldri glem viktige erfaringer</p>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white px-4 py-2.5 rounded-xl font-semibold transition">
            <Plus className="h-4 w-4" /> Ny oppforing
          </button>
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Sok i hukommelsen..."
              className="w-full bg-slate-800 border border-slate-700 text-white pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', ...Object.keys(TYPE_CONFIG)] as const).map(t => (
              <button key={t} onClick={() => setFilterType(t as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${filterType === t ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>
                {t === 'all' ? 'Alle' : TYPE_CONFIG[t as EntryType].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
          {(Object.entries(TYPE_CONFIG) as [EntryType, typeof TYPE_CONFIG[EntryType]][]).map(([t, c]) => {
            const count = entries.filter(e => e.type === t).length;
            return (
              <div key={t} className={`${c.bg} border ${c.border} rounded-xl p-3 text-center`}>
                <p className={`text-xl font-black ${c.color}`}>{count}</p>
                <p className="text-xs text-slate-400">{c.label}</p>
              </div>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Ingen oppforinger enna</p>
            <p className="text-sm mt-1">Legg til beslutninger, seire og laerdommer</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(e => {
              const cfg = TYPE_CONFIG[e.type] ?? TYPE_CONFIG.note;
              const open = expandedId === e.id;
              return (
                <div key={e.id} className={`${cfg.bg} border ${cfg.border} rounded-2xl overflow-hidden transition`}>
                  <button className="w-full text-left px-5 py-4 flex items-start gap-3" onClick={() => setExpandedId(open ? null : e.id)}>
                    <span className={`mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-xs text-slate-500">{e.date}</span>
                        {e.related && <span className="text-xs text-slate-500 italic">{e.related}</span>}
                      </div>
                      <p className="font-bold text-white mt-0.5 truncate">{e.title}</p>
                      {!open && e.content && <p className="text-slate-400 text-sm truncate mt-0.5">{e.content}</p>}
                    </div>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <button onClick={ev => { ev.stopPropagation(); openEdit(e); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition">
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={ev => { ev.stopPropagation(); del(e.id); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </button>
                  {open && (
                    <div className="px-5 pb-4 border-t border-white/5">
                      {e.content && <p className="text-slate-300 text-sm mt-3 whitespace-pre-line leading-relaxed">{e.content}</p>}
                      {(e.tags ?? []).length > 0 && (
                        <div className="flex gap-1.5 mt-3 flex-wrap">
                          {e.tags.map(tag => (
                            <span key={tag} className="flex items-center gap-1 bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-full text-xs">
                              <Tag className="h-2.5 w-2.5" /> {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-700">
              <h2 className="font-bold text-white">{editEntry ? 'Rediger oppforing' : 'Ny oppforing'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(TYPE_CONFIG) as [EntryType, typeof TYPE_CONFIG[EntryType]][]).map(([t, c]) => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${form.type === t ? `${c.bg} ${c.border} ${c.color}` : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>
                    {c.label}
                  </button>
                ))}
              </div>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Tittel *" className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-purple-500" />
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Hva skjedde? Hva laerte du?" rows={4}
                className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-purple-500 resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-purple-500" />
                <input value={form.related ?? ''} onChange={e => setForm(f => ({ ...f, related: e.target.value }))}
                  placeholder="Relatert (valgfri)" className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-purple-500" />
              </div>
              <div className="flex gap-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}}
                  placeholder="Legg til tag" className="flex-1 bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-purple-500" />
                <button onClick={addTag} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm text-white transition">
                  <Tag className="h-4 w-4" />
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {form.tags.map(t => (
                    <span key={t} onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))}
                      className="flex items-center gap-1 bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded-full text-xs cursor-pointer hover:bg-red-600/30 hover:text-red-300 transition">
                      {t} <X className="h-2.5 w-2.5" />
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-slate-700">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition">Avbryt</button>
              <button onClick={save} disabled={saving || !form.title.trim()}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editEntry ? 'Oppdater' : 'Lagre'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
