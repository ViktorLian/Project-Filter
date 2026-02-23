'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, RefreshCw, BookOpen, Target, TrendingUp, Lightbulb } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

const SUGGESTIONS = [
  'Skriv en oppfølgingse-post til en lead som ikke har svart på 5 dager',
  'Hva er de beste argumentene for å velge vårt Pro-abonnement?',
  'Analyser hva jeg bør fokusere på for å øke salget denne måneden',
  'Lag et script for å ta kontakt med en ny lead via telefon',
  'Hjelp meg med å forberede meg til et salgsmøte i morgen',
  'Hvilke signaler viser at en lead er klar til å kjøpe?',
];

const QUICK_PROMPTS = [
  { icon: BookOpen, label: 'Oppfølgingse-post', prompt: 'Skriv en profesjonell oppfølgingepost på norsk til en lead som viste interesse men ikke svarte siste uke. Gjør den varm og personlig.' },
  { icon: Target, label: 'Salgsargumenter', prompt: 'List opp de 5 sterkeste salgsargumentene for FlowPilot CRM til en rørlegger-bedrift med 3-10 ansatte.' },
  { icon: TrendingUp, label: 'Vekststrategi', prompt: 'Gi meg en konkret 3-stegs strategi for å øke antall leads denne måneden.' },
  { icon: Lightbulb, label: 'Møteplan', prompt: 'Hjelp meg forberede et salgsmøte. Hva er de 5 viktigste spørsmålene jeg bør stille kunden?' },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hei! Jeg er din personlige AI salgsassistent. Jeg kan hjelpe deg med oppfølgingse-post, salgsargumenter, møteplaner, analyser og mye mer. Hva kan jeg hjelpe deg med i dag?',
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: msg, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: messages.slice(-10) }),
      });
      const json = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: json.reply || 'Beklager, kunne ikke generere svar. Sjekk at OpenAI API-nokkel er konfigurert.',
        ts: Date.now(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Feil ved tilkobling til AI. Sjekk at OPENAI_API_KEY er satt i miljovariabler.',
        ts: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Salgsassistent</h1>
          <p className="text-slate-500 text-sm mt-0.5">Din personlige AI-drevne salgshjelper</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-medium">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          AI aktiv
        </div>
      </div>

      {/* Quick prompts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
          <button key={label} onClick={() => send(prompt)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all text-left">
            <Icon className="h-4 w-4 flex-shrink-0 text-blue-500" />
            <span className="font-medium text-xs">{label}</span>
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                : 'bg-gradient-to-br from-slate-600 to-slate-700'
            }`}>
              {msg.role === 'assistant'
                ? <Sparkles className="h-4 w-4 text-white" />
                : <User className="h-4 w-4 text-white" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'assistant'
                ? 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm'
                : 'bg-blue-600 text-white rounded-tr-sm'
            }`}>
              {msg.content}
              <div className={`text-xs mt-1 ${msg.role === 'assistant' ? 'text-slate-400' : 'text-blue-200'}`}>
                {new Date(msg.ts).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="my-3 flex gap-2 overflow-x-auto pb-1">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => send(s)}
            className="flex-shrink-0 text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-200 transition-all">
            {s.length > 50 ? s.slice(0, 50) + '...' : s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Still et sporsmal eller be om hjelp..."
          className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition font-medium text-sm">
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
