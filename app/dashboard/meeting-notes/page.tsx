'use client';

import { useState } from 'react';
import { Mic, MicOff, Brain, Save, Clock, User, ChevronDown, Sparkles, FileText } from 'lucide-react';

type Note = {
  id: string;
  customer: string;
  date: string;
  rawText: string;
  summary?: string;
  todos?: string[];
  nextStep?: string;
};

const DEMO_NOTES: Note[] = [
  {
    id: '1', customer: 'Byggmester Hansen AS', date: '2025-01-20',
    rawText: 'Diskuterte nytt terrasseprosjekt. Kunden vil ha compositt dekke, ca 40 kvm. Budsjett rundt 80 000 kr. Onsker oppstart i mars.',
    summary: 'Terrasseprosjekt 40 kvm compositt dekke. Budsjett: 80 000 kr. Oppstart mars.',
    todos: ['Send tilbud innen fredag', 'Sjekk lager pa compositt', 'Avtal befaring 27. jan'],
    nextStep: 'Sende tilbud innen fredag 24. januar',
  },
  {
    id: '2', customer: 'Nilsen Eiendom', date: '2025-01-18',
    rawText: 'Telefonmote om flislegging i 3 bad. Kunden er usikker pa flisstorrelse. Viste frem katalog. Avventer tilbakemelding.',
    summary: '3 bad med flislegging. Kunden velger flisstorrelse. Avventer svar.',
    todos: ['Folgje opp onsdag', 'Forbered to prisalternativer (stor/liten flis)'],
    nextStep: 'Ringt pa onsdag 22. januar',
  },
];

export default function MeetingNotesPage() {
  const [notes, setNotes] = useState<Note[]>(DEMO_NOTES);
  const [input, setInput] = useState('');
  const [customer, setCustomer] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ summary: string; todos: string[]; nextStep: string } | null>(null);
  const [expanded, setExpanded] = useState<string | null>('1');

  async function analyze() {
    if (!input.trim()) return;
    setAnalyzing(true);
    setResult(null);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyser dette motereferatet og gi meg tilbake:
1. Et kort sammendrag (maks 2 setninger)
2. En liste med konkrete to-do oppgaver (nummerert)
3. Et klart neste steg

Motereferat: ${input}

Svar pa norsk, vær konkret og handlingsorientert.`,
          history: [],
        }),
      });
      const data = await res.json();
      const text: string = data.reply || '';
      // Parse response
      setResult({
        summary: text.split('\n')[0] || text.slice(0, 150),
        todos: text.match(/^\d\..+/gm) ?? ['Se gjennom notater'],
        nextStep: text.match(/neste steg[:\s]+(.+)/i)?.[1] ?? 'Se gjennom analyse',
      });
    } catch {
      setResult({ summary: 'Klarte ikke analysere. Sjekk at OpenAI API-nokkel er konfigurert.', todos: [], nextStep: '' });
    }
    setAnalyzing(false);
  }

  function save() {
    if (!result || !input.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      customer: customer || 'Ukjent kunde',
      date: new Date().toISOString().split('T')[0],
      rawText: input,
      ...result,
    };
    setNotes(prev => [note, ...prev]);
    setInput('');
    setCustomer('');
    setResult(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Motereferater</h1>
        <p className="text-slate-500 text-sm mt-0.5">Skriv inn hva som ble diskutert — AI lager sammendrag og oppgaveliste</p>
      </div>

      {/* New note */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-purple-600" />
          <h2 className="font-semibold text-slate-800">Nytt motereferat</h2>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Kunde / firma</label>
          <input
            value={customer}
            onChange={e => setCustomer(e.target.value)}
            placeholder="Eks: Ola Nordmanns Bygg AS"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Hva ble diskutert?</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={5}
            placeholder="Eks: Vi snakket om nytt kjokken i huset deres. Kunden vil ha hvite fronter, komfyrtopp fra Miele, og benkeplate i granitt. Budsjett 120 000 kr inkludert montering. Onkser oppstart i april..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={analyze}
            disabled={analyzing || !input.trim()}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            {analyzing ? 'Analyserer...' : 'Analyser med AI'}
          </button>
          {result && (
            <button
              onClick={save}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              Lagre referat
            </button>
          )}
        </div>

        {result && (
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Sammendrag</p>
              <p className="text-sm text-slate-800">{result.summary}</p>
            </div>
            {result.todos.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">To-do</p>
                <ul className="space-y-1">
                  {result.todos.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.nextStep && (
              <div>
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Neste steg</p>
                <p className="text-sm font-medium text-slate-800">{result.nextStep}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Previous notes */}
      <div>
        <h2 className="font-semibold text-slate-800 mb-3">Tidligere referater</h2>
        <div className="space-y-3">
          {notes.map(note => (
            <div key={note.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === note.id ? null : note.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-800 text-sm">{note.customer}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" />{note.date}</p>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${expanded === note.id ? 'rotate-180' : ''}`} />
              </button>
              {expanded === note.id && (
                <div className="border-t border-slate-100 px-5 py-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Radata</p>
                    <p className="text-sm text-slate-600 italic">{note.rawText}</p>
                  </div>
                  {note.summary && (
                    <div className="rounded-lg bg-slate-50 p-3 space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">AI Sammendrag</p>
                      <p className="text-sm text-slate-800">{note.summary}</p>
                      {note.todos && note.todos.length > 0 && (
                        <ul className="space-y-1 mt-2">
                          {note.todos.map((t, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                              {t}
                            </li>
                          ))}
                        </ul>
                      )}
                      {note.nextStep && (
                        <p className="text-sm font-semibold text-blue-700 mt-1"> Neste: {note.nextStep}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
