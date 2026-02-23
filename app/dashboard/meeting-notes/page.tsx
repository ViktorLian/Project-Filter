'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Brain, Save, Clock, User, ChevronDown, Sparkles, FileText, Square } from 'lucide-react';

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
    rawText: 'Diskuterte nytt terrasseprosjekt. Kunden vil ha compositt dekke, ca 40 kvm. Budsjett rundt 80 000 kr. Ã˜nsker oppstart i mars.',
    summary: 'Terrasseprosjekt 40 kvm compositt dekke. Budsjett: 80 000 kr. Oppstart mars.',
    todos: ['Send tilbud innen fredag', 'Sjekk lager pÃ¥ compositt', 'Avtal befaring 27. jan'],
    nextStep: 'Sende tilbud innen fredag 24. januar',
  },
  {
    id: '2', customer: 'Nilsen Eiendom', date: '2025-01-18',
    rawText: 'TelefonmÃ¸te om flislegging i 3 bad. Kunden er usikker pÃ¥ flisstÃ¸rrelse. Viste frem katalog. Avventer tilbakemelding.',
    summary: '3 bad med flislegging. Kunden velger flisstÃ¸rrelse. Avventer svar.',
    todos: ['FÃ¸lge opp onsdag', 'Forbered to prisalternativer (stor/liten flis)'],
    nextStep: 'Ringe pÃ¥ onsdag 22. januar',
  },
];

export default function MeetingNotesPage() {
  const [notes, setNotes] = useState<Note[]>(DEMO_NOTES);
  const [input, setInput] = useState('');
  const [customer, setCustomer] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ summary: string; todos: string[]; nextStep: string } | null>(null);
  const [expanded, setExpanded] = useState<string | null>('1');
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState('');
  const recognitionRef = useRef<any>(null);

  // Speech-to-text via Web Speech API (built into Chrome/Edge â€“ no API key needed)
  function toggleRecording() {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError('Mikrofon-transkribering stÃ¸ttes kun i Chrome og Edge. Skriv inn tekst manuelt.');
      return;
    }

    setMicError('');
    const recognition = new SpeechRecognition();
    recognition.lang = 'nb-NO';
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t + ' ';
        } else {
          interim = t;
        }
      }
      setInput(prev => {
        const base = prev.replace(/\s*\[â€¦\]$/, '').trimEnd();
        return (base + ' ' + finalTranscript + (interim ? `[â€¦]` : '')).trim();
      });
    };

    recognition.onerror = (event: any) => {
      setMicError('Mikrofonfeil: ' + event.error);
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
      // Remove interim placeholder
      setInput(prev => prev.replace(/\s*\[â€¦\]$/, '').trim());
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  async function analyze() {
    if (!input.trim()) return;
    setAnalyzing(true);
    setResult(null);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyser dette mÃ¸tereferatet og gi meg tilbake:
1. Et kort sammendrag (maks 2 setninger)
2. En nummerert liste med konkrete to-do oppgaver
3. Neste steg

MÃ¸tereferat: ${input}

Svar pÃ¥ norsk, vÃ¦r konkret og handlingsorientert.`,
          history: [],
        }),
      });
      const data = await res.json();
      const text: string = data.reply || '';
      setResult({
        summary: text.split('\n')[0] || text.slice(0, 150),
        todos: text.match(/^\d\..+/gm) ?? ['Se gjennom notater'],
        nextStep: text.match(/neste steg[:\s]+(.+)/i)?.[1] ?? 'Se gjennom analyse',
      });
    } catch {
      setResult({ summary: 'Klarte ikke analysere. Sjekk at Gemini API-nÃ¸kkel er konfigurert.', todos: [], nextStep: '' });
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
        <h1 className="text-2xl font-bold text-slate-900">MÃ¸tereferater</h1>
        <p className="text-slate-500 text-sm mt-0.5">Skriv inn eller dikter hva som ble diskutert â€” AI lager sammendrag og oppgaveliste</p>
      </div>

      {/* New note */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          <h2 className="font-semibold text-slate-800">Nytt mÃ¸tereferat</h2>
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
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-600">Hva ble diskutert?</label>
            <button
              onClick={toggleRecording}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                recording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
              title={recording ? 'Stopp opptak' : 'Start mikrofon (Chrome/Edge)'}
            >
              {recording ? (
                <><Square className="h-3 w-3" /> Stopp opptak</>
              ) : (
                <><Mic className="h-3 w-3" /> Bruk mikrofon</>
              )}
            </button>
          </div>
          {micError && (
            <p className="text-xs text-amber-600 mb-1">{micError}</p>
          )}
          {recording && (
            <div className="flex items-center gap-2 text-xs text-red-600 mb-1 font-medium">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Tar opp â€“ snakk nÃ¥, FlowPilot lytter...
            </div>
          )}
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={5}
            placeholder="Eks: Vi snakket om nytt kjÃ¸kken. Kunden vil ha hvite fronter, komfyrtopp fra Miele, og benkeplate i granitt. Budsjett 120 000 kr inkl. montering. Ã˜nsker oppstart i april..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-400 mt-1">ðŸ’¡ Jo mer detaljert du skriver/sier, jo bedre blir AI-analysen</p>
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
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">RÃ¥data</p>
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
                        <p className="text-sm font-semibold text-blue-700 mt-1">â†’ Neste: {note.nextStep}</p>
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
