'use client';

import { useState } from 'react';
import { Brain, Search, BookOpen, Plus, Clock, Tag, User, MessageSquare, ChevronRight, Star, Lightbulb } from 'lucide-react';

type EntryType = 'customer' | 'decision' | 'lesson' | 'process' | 'note';

interface MemoryEntry {
  id: string;
  type: EntryType;
  title: string;
  content: string;
  tags: string[];
  date: string;
  related?: string;
}

const TYPE_CONFIG: Record<EntryType, { label: string; color: string; bg: string }> = {
  customer: { label: 'Kunde', color: 'text-blue-700', bg: 'bg-blue-100' },
  decision: { label: 'Beslutning', color: 'text-purple-700', bg: 'bg-purple-100' },
  lesson: { label: 'Laertepunkt', color: 'text-amber-700', bg: 'bg-amber-100' },
  process: { label: 'Prosess', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  note: { label: 'Notat', color: 'text-slate-700', bg: 'bg-slate-100' },
};

const DEMO: MemoryEntry[] = [
  {
    id: '1', type: 'customer', title: 'Kari Nordmann – baderom 2024',
    content: 'Krevende kunde. Viktig a sette tydelige forventninger om leveringstid fra start. Endte bra men vi ma ha skriftlig bekreftelse pa alle tillegg.',
    tags: ['baderom', 'oppfolging', 'kontrakt'], date: '2025-09-12', related: 'Faktura #1082',
  },
  {
    id: '2', type: 'decision', title: 'Beslutning: Sluttet a tilby «small jobs»',
    content: 'Jobber under 20 000 kr tar uforholdsmessig mye tid i planlegging og kommunikasjon. Fra Q3 2025 setter vi minste jobbstorrelse til 25 000 kr.',
    tags: ['strategi', 'prising', 'grense'], date: '2025-07-01',
  },
  {
    id: '3', type: 'lesson', title: 'Hva gikk galt med Bakke-prosjektet',
    content: 'Starte uten underskrevet kontrakt fordi kunden hastet. Ente med tvist om tillegg pa 45 000 kr. Leson: ALDRI start uten signert tilbud.',
    tags: ['kontrakt', 'risiko', 'takarbeid'], date: '2025-11-20',
  },
  {
    id: '4', type: 'process', title: 'Oppfolgingsrutine etter ferdig jobb',
    content: '1. Send sluttfaktura dag 0. 2. Ring kunde dag 3 for kvalitetskontroll. 3. Be om Google-anmeldelse dag 7. 4. Tilby neste sesong dag 30.',
    tags: ['rutine', 'kunde', 'oppfolging'], date: '2025-05-15',
  },
  {
    id: '5', type: 'customer', title: 'Erik Bakke AS – langtidskunde siden 2023',
    content: 'Betaler alltid innen 14 dager. Fore fint pa med julekort. Potensial for arskontrakt pa vedlikehold. Kontakt: erik@bakke.no / 900 12 345.',
    tags: ['VIP', 'takarbeid', 'arskontrakt'], date: '2024-01-10',
  },
];

export default function BusinessMemoryPage() {
  const [entries, setEntries] = useState<MemoryEntry[]>(DEMO);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | EntryType>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<MemoryEntry | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [thinking, setThinking] = useState(false);
  const [newEntry, setNewEntry] = useState({ type: 'note' as EntryType, title: '', content: '', tags: '' });

  const filtered = entries.filter(e =>
    (filterType === 'all' || e.type === filterType) &&
    (search === '' || e.title.toLowerCase().includes(search.toLowerCase()) || e.content.toLowerCase().includes(search.toLowerCase()) || e.tags.some(t => t.includes(search.toLowerCase())))
  );

  const askAI = async () => {
    if (!aiQuery.trim()) return;
    setThinking(true);
    setAiAnswer('');
    // Simulate AI searching memory
    await new Promise(r => setTimeout(r, 1200));
    const q = aiQuery.toLowerCase();
    const relevant = entries.filter(e =>
      e.content.toLowerCase().includes(q.split(' ')[0]) ||
      e.title.toLowerCase().includes(q.split(' ')[0]) ||
      e.tags.some(t => q.includes(t))
    );
    if (relevant.length > 0) {
      setAiAnswer(`Basert pa bedriftshukommelsen din: "${relevant[0].title}" (${relevant[0].date}) — ${relevant[0].content.slice(0, 200)}${relevant[0].content.length > 200 ? '...' : ''}`);
    } else {
      setAiAnswer('Ingen direkte treff i hukommelsen. Vurder a legge inn notater om dette emnet for fremtiden.');
    }
    setThinking(false);
  };

  const addEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setEntries(p => [{
      id: Date.now().toString(),
      type: newEntry.type,
      title: newEntry.title,
      content: newEntry.content,
      tags: newEntry.tags.split(',').map(t => t.trim()).filter(Boolean),
      date: new Date().toISOString().split('T')[0],
    }, ...p]);
    setNewEntry({ type: 'note', title: '', content: '', tags: '' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="h-5 w-5 text-purple-500" />
            <h1 className="text-2xl font-bold text-slate-900">Bedriftshukommelse</h1>
          </div>
          <p className="text-slate-500 text-sm">Alt du har laert, alle beslutninger og all kunnskap — sokt opp pa sekunder.</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition">
          <Plus className="h-4 w-4" /> Legg til minne
        </button>
      </div>

      {/* AI Search */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-white">
        <p className="text-sm font-semibold text-purple-200 mb-2">Spor bedriften din som en AI</p>
        <p className="text-lg font-bold mb-4">Hva gikk galt med kunde X? Hva bestemte vi om prising?</p>
        <div className="flex gap-2">
          <input
            value={aiQuery}
            onChange={e => setAiQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askAI()}
            placeholder="Still et sporsmal om bedriften din..."
            className="flex-1 rounded-xl bg-white/15 border border-white/25 px-4 py-2.5 text-sm text-white placeholder-purple-200 focus:outline-none focus:bg-white/20"
          />
          <button onClick={askAI} disabled={thinking}
            className="rounded-xl bg-white/20 hover:bg-white/30 px-4 py-2.5 text-sm font-semibold transition">
            {thinking ? 'Soker...' : 'Spor'}
          </button>
        </div>
        {aiAnswer && (
          <div className="mt-4 rounded-xl bg-white/10 border border-white/20 p-4 text-sm leading-relaxed text-purple-50">
            <Lightbulb className="h-4 w-4 inline-block mr-2 text-yellow-300" />
            {aiAnswer}
          </div>
        )}
      </div>

      {/* Filter + search */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'customer', 'decision', 'lesson', 'process', 'note'] as const).map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition ${filterType === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
            {t === 'all' ? 'Alle' : TYPE_CONFIG[t].label}
          </button>
        ))}
        <div className="flex-1 min-w-48">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Sok i hukommelsen..."
              className="flex-1 text-xs text-slate-700 bg-transparent focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-3">
        {filtered.map(e => {
          const tc = TYPE_CONFIG[e.type];
          return (
            <button key={e.id} onClick={() => setSelected(e)}
              className="w-full rounded-xl border border-slate-200 bg-white p-5 text-left hover:shadow-sm hover:border-purple-200 transition">
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${tc.bg} ${tc.color}`}>
                  {tc.label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{e.content}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {e.tags.map(t => (
                      <span key={t} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">#{t}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-400">{e.date}</p>
                  {e.related && <p className="text-xs text-blue-500 mt-1">{e.related}</p>}
                </div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400">
            Ingen minner funnet. Legg til det forste!
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_CONFIG[selected.type].bg} ${TYPE_CONFIG[selected.type].color}`}>
                {TYPE_CONFIG[selected.type].label}
              </span>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">{selected.title}</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{selected.content}</p>
            {selected.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {selected.tags.map(t => (
                  <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">#{t}</span>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-4">{selected.date}{selected.related && ` · ${selected.related}`}</p>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Nytt minne</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 text-xl">×</button>
            </div>
            <form onSubmit={addEntry} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Type</label>
                <select value={newEntry.type} onChange={e => setNewEntry(p => ({ ...p, type: e.target.value as EntryType }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  {(Object.entries(TYPE_CONFIG) as [EntryType, any][]).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Tittel</label>
                <input value={newEntry.title} onChange={e => setNewEntry(p => ({ ...p, title: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required placeholder="Beskrivende tittel" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Innhold</label>
                <textarea value={newEntry.content} onChange={e => setNewEntry(p => ({ ...p, content: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none" rows={4} required placeholder="Hva er viktig a huske?" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Tagger (kommaseparert)</label>
                <input value={newEntry.tags} onChange={e => setNewEntry(p => ({ ...p, tags: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="kontrakt, kunde, prising" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm text-slate-600">Avbryt</button>
                <button type="submit" className="flex-1 rounded-xl bg-purple-600 py-2.5 text-sm font-semibold text-white hover:bg-purple-700">Lagre minne</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
