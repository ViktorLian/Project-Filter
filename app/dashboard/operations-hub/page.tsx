'use client';

import { useState, useEffect } from 'react';
import { CheckSquare, Square, Plus, Trash2, RefreshCw, FileText, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

type CheckItem = { id: string; text: string; done: boolean };
type Section = { id: string; title: string; items: CheckItem[]; open: boolean };

const DEFAULT_SECTIONS: Section[] = [
  {
    id: 'morning', title: 'Morgenrutine', open: true,
    items: [
      { id: '1', text: 'Sjekk dagens kalender og avtaler', done: false },
      { id: '2', text: 'Gjennomgå nye leads fra gårsdagen', done: false },
      { id: '3', text: 'Svar på e-poster og meldinger', done: false },
      { id: '4', text: 'Prioriter dagens viktigste oppgaver', done: false },
    ],
  },
  {
    id: 'ops', title: 'Daglig drift', open: true,
    items: [
      { id: '5', text: 'Oppdater status på pågående jobber', done: false },
      { id: '6', text: 'Sjekk at alle ansatte har klare oppgaver', done: false },
      { id: '7', text: 'Registrer timer fra dagens arbeid', done: false },
    ],
  },
  {
    id: 'close', title: 'Sluttrutine', open: false,
    items: [
      { id: '8', text: 'Oppdater CRM med dagens aktivitet', done: false },
      { id: '9', text: 'Send faktura for ferdigstilte jobber', done: false },
      { id: '10', text: 'Planlegg morgendagens prioriteter', done: false },
    ],
  },
];

export default function OperationsHubPage() {
  const [sections, setSections] = useState<Section[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('ops-hub-sections') || 'null');
        if (saved) return saved;
      } catch { /* ignore */ }
    }
    return DEFAULT_SECTIONS;
  });
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<{ id: string; text: string; date: string }[]>([]);
  const [aiTip, setAiTip] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [newTask, setNewTask] = useState<Record<string, string>>({});

  // Persist to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ops-hub-sections', JSON.stringify(sections));
    }
  }, [sections]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('ops-hub-notes') || '[]');
        setNotes(saved);
      } catch { /* ignore */ }
    }
  }, []);

  function toggleItem(sectionId: string, itemId: string) {
    setSections(ss => ss.map(s => s.id !== sectionId ? s : {
      ...s, items: s.items.map(i => i.id !== itemId ? i : { ...i, done: !i.done }),
    }));
  }

  function addItem(sectionId: string) {
    const text = (newTask[sectionId] || '').trim();
    if (!text) return;
    setSections(ss => ss.map(s => s.id !== sectionId ? s : {
      ...s, items: [...s.items, { id: Date.now().toString(), text, done: false }],
    }));
    setNewTask(t => ({ ...t, [sectionId]: '' }));
  }

  function removeItem(sectionId: string, itemId: string) {
    setSections(ss => ss.map(s => s.id !== sectionId ? s : {
      ...s, items: s.items.filter(i => i.id !== itemId),
    }));
  }

  function toggleSection(sectionId: string) {
    setSections(ss => ss.map(s => s.id !== sectionId ? s : { ...s, open: !s.open }));
  }

  function resetAll() {
    setSections(ss => ss.map(s => ({
      ...s, items: s.items.map(i => ({ ...i, done: false })),
    })));
  }

  function saveNote() {
    if (!note.trim()) return;
    const updated = [{ id: Date.now().toString(), text: note, date: new Date().toLocaleDateString('nb-NO') }, ...notes].slice(0, 20);
    setNotes(updated);
    localStorage.setItem('ops-hub-notes', JSON.stringify(updated));
    setNote('');
  }

  function removeNote(id: string) {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem('ops-hub-notes', JSON.stringify(updated));
  }

  async function getAiTip() {
    setAiLoading(true);
    setAiTip('');
    const done = sections.flatMap(s => s.items.filter(i => i.done)).length;
    const total = sections.flatMap(s => s.items).length;
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Jeg driver en liten norsk servicebedrift. Jeg har fullført ${done} av ${total} daglige rutineoppgaver i dag.
Notater fra drift: ${(notes.slice(0, 2).map(n => n.text).join('. ') || 'Ingen')}

Gi meg 2-3 korte, konkrete driftstips for resten av dagen. Maks 120 ord. Norsk bokmål.`,
          history: [],
        }),
      });
      const data = await res.json();
      setAiTip(data.reply || 'Ingen tips tilgjengelig.');
    } finally { setAiLoading(false); }
  }

  const totalDone = sections.flatMap(s => s.items.filter(i => i.done)).length;
  const totalItems = sections.flatMap(s => s.items).length;
  const pct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Driftssentral</h1>
          <p className="text-slate-500 mt-1">Daglige rutiner, sjekklister og driftsnotater</p>
        </div>
        <div className="flex gap-2">
          <button onClick={resetAll}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Nullstill
          </button>
          <button onClick={getAiTip} disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50">
            <Sparkles className="h-4 w-4" />
            {aiLoading ? 'Tenker...' : 'AI-driftstips'}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">Daglig fremgang</span>
          <span className="text-sm font-bold text-blue-600">{totalDone} / {totalItems} ({pct}%)</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct === 100 && (
          <p className="text-emerald-600 text-sm font-semibold mt-2 text-center">Dagens rutiner fullført!</p>
        )}
      </div>

      {/* AI tip */}
      {aiTip && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-purple-700 mb-1 flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI-driftstips</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{aiTip}</p>
        </div>
      )}

      {/* Checklists */}
      <div className="space-y-3">
        {sections.map(section => {
          const done = section.items.filter(i => i.done).length;
          return (
            <div key={section.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-800">{section.title}</span>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    {done}/{section.items.length}
                  </span>
                </div>
                {section.open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>

              {section.open && (
                <div className="border-t border-slate-100">
                  {section.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 group transition-colors">
                      <button onClick={() => toggleItem(section.id, item.id)} className="shrink-0">
                        {item.done
                          ? <CheckSquare className="h-5 w-5 text-emerald-500" />
                          : <Square className="h-5 w-5 text-slate-300" />}
                      </button>
                      <span className={`text-sm flex-1 ${item.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {item.text}
                      </span>
                      <button onClick={() => removeItem(section.id, item.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50">
                    <input
                      value={newTask[section.id] || ''}
                      onChange={e => setNewTask(t => ({ ...t, [section.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addItem(section.id)}
                      placeholder="Legg til oppgave..."
                      className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
                    />
                    <button onClick={() => addItem(section.id)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <FileText className="h-4 w-4 text-slate-500" />
          <h2 className="font-semibold text-slate-800">Driftsnotater</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Skriv en driftsnote, heads-up for teamet, avvik eller observasjon..."
              rows={2}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"
            />
            <button onClick={saveNote}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors self-start">
              Lagre
            </button>
          </div>
          {notes.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notes.map(n => (
                <div key={n.id} className="flex items-start gap-3 bg-slate-50 rounded-lg px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">{n.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.date}</p>
                  </div>
                  <button onClick={() => removeNote(n.id)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {notes.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-4">Ingen notater ennå</p>
          )}
        </div>
      </div>
    </div>
  );
}
