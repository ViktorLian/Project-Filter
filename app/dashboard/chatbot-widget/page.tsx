'use client';

import { useState } from 'react';
import {
  Bot, Copy, Check, Code2, Palette, MessageSquare, Zap, Globe, 
  Settings, Eye, ChevronRight, Send, X, Sparkles, CheckCircle2,
  ToggleLeft, ToggleRight, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'konfigurer' | 'preview' | 'installer';

const COLOR_OPTIONS = [
  { label: 'Blå', value: '#2563eb' },
  { label: 'Fiolett', value: '#7c3aed' },
  { label: 'Grønn', value: '#16a34a' },
  { label: 'Rød', value: '#dc2626' },
  { label: 'Orange', value: '#ea580c' },
  { label: 'Slate', value: '#334155' },
];

export default function ChatbotWidgetPage() {
  const [tab, setTab] = useState<Tab>('konfigurer');
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewInput, setPreviewInput] = useState('');
  const [previewMessages, setPreviewMessages] = useState([
    { role: 'bot', text: '' }, // filled from config
  ]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [config, setConfig] = useState({
    botName: 'Assistent',
    greeting: 'Hei! Hvordan kan jeg hjelpe deg i dag? 👋',
    color: '#2563eb',
    persona: 'Du er en hjelpsom norsk kundeserviceassistent for en bedrift. Svar alltid kort, vennlig og profesjonelt på norsk. Svar kun på spørsmål relatert til bedriften.',
    fallback: 'Det er jeg dessverre usikker på! Ta gjerne kontakt direkte på telefon eller e-post og vi hjelper deg. 😊',
    collectEmail: true,
    showAvatar: true,
    position: 'right' as 'right' | 'left',
    bubbleText: 'Spør oss 💬',
    knowledgeBase: '',
  });

  const initMessages = [{ role: 'bot', text: config.greeting }];
  const [msgs, setMsgs] = useState(initMessages);

  function updateConfig<K extends keyof typeof config>(key: K, val: typeof config[K]) {
    setConfig(prev => ({ ...prev, [key]: val }));
    if (key === 'greeting') setMsgs([{ role: 'bot', text: val as string }]);
  }

  async function sendPreview() {
    if (!previewInput.trim() || previewLoading) return;
    const text = previewInput.trim();
    setPreviewInput('');
    setMsgs(prev => [...prev, { role: 'user', text }]);
    setPreviewLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: [],
          systemPrompt: config.persona + (config.knowledgeBase ? `\n\nKunnskap om bedriften:\n${config.knowledgeBase}` : ''),
        }),
      });
      const d = await res.json();
      setMsgs(prev => [...prev, { role: 'bot', text: d.reply || config.fallback }]);
    } catch {
      setMsgs(prev => [...prev, { role: 'bot', text: config.fallback }]);
    }
    setPreviewLoading(false);
  }

  const embedCode = `<!-- FlowPilot Chatbot Widget -->
<script>
  window.FlowPilotConfig = {
    botName: "${config.botName}",
    greeting: "${config.greeting.replace(/"/g, '\\"')}",
    color: "${config.color}",
    position: "${config.position}",
    bubbleText: "${config.bubbleText}",
    collectEmail: ${config.collectEmail},
    endpoint: "https://app.flowpilot.no/api/widget/chat",
  };
</script>
<script src="https://app.flowpilot.no/widget.js" async></script>`;

  function copyCode() {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function saveConfig() {
    // persist config in localStorage for now (could POST to API)
    localStorage.setItem('fp_widget_config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'konfigurer', label: 'Konfigurer', icon: Settings },
    { id: 'preview', label: 'Forhåndsvisning', icon: Eye },
    { id: 'installer', label: 'Installer på nettside', icon: Code2 },
  ];

  return (
    <div className="max-w-5xl pb-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bot className="h-5 w-5 text-violet-600" /> AI Chatbot Widget
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Installer en smart AI-chatbot på bedriftens nettside på under 2 minutter. Kunder stiller spørsmål — boten svarer 24/7.
          </p>
        </div>
        <button onClick={saveConfig} className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm', saved ? 'bg-emerald-600 text-white' : 'bg-violet-600 hover:bg-violet-700 text-white')}>
          {saved ? <><CheckCircle2 className="h-4 w-4" /> Lagret!</> : <><Sparkles className="h-4 w-4" /> Lagre konfig</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition', tab === t.id ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100')}>
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      {/* ── Konfigurer ─────────────────────────── */}
      {tab === 'konfigurer' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2"><MessageSquare className="h-4 w-4 text-violet-500" /> Identitet</h3>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Bot-navn</label>
                <input value={config.botName} onChange={e => updateConfig('botName', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400" placeholder="F.eks. Sofia, Hjelper, Assistent" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Velkomstmelding</label>
                <textarea value={config.greeting} onChange={e => updateConfig('greeting', e.target.value)} rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 resize-none" placeholder="Hei! Kan jeg hjelpe deg?" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Boble-tekst (chat-knapp)</label>
                <input value={config.bubbleText} onChange={e => updateConfig('bubbleText', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400" placeholder="Spør oss 💬" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Reservemelding (når AI er usikker)</label>
                <textarea value={config.fallback} onChange={e => updateConfig('fallback', e.target.value)} rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 resize-none" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Settings className="h-4 w-4 text-violet-500" /> Innstillinger</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Samle e-post fra besøkende</p>
                  <p className="text-xs text-slate-400">Spør om e-posten ved start</p>
                </div>
                <button onClick={() => updateConfig('collectEmail', !config.collectEmail)} className={cn('transition', config.collectEmail ? 'text-violet-600' : 'text-slate-300')}>
                  {config.collectEmail ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Vis avatar-ikon</p>
                  <p className="text-xs text-slate-400">Bot-ikon i chat-bublen</p>
                </div>
                <button onClick={() => updateConfig('showAvatar', !config.showAvatar)} className={cn('transition', config.showAvatar ? 'text-violet-600' : 'text-slate-300')}>
                  {config.showAvatar ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Posisjon på skjerm</p>
                <div className="flex gap-2">
                  {(['right', 'left'] as const).map(p => (
                    <button key={p} onClick={() => updateConfig('position', p)} className={cn('flex-1 py-1.5 rounded-lg text-sm font-medium border transition', config.position === p ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300')}>
                      {p === 'right' ? 'Høyre' : 'Venstre'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Palette className="h-4 w-4 text-violet-500" /> Utseende</h3>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Fargetema</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button key={c.value} onClick={() => updateConfig('color', c.value)}
                      className={cn('w-8 h-8 rounded-full border-2 transition', config.color === c.value ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-105')}
                      style={{ background: c.value }} title={c.label} />
                  ))}
                </div>
              </div>

              {/* Live mini-preview */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Forhåndsvisning</label>
                <div className="relative bg-slate-100 rounded-xl h-[200px] overflow-hidden border border-slate-200">
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                  {/* Chat window */}
                  <div className="absolute bottom-3 right-3 w-[180px]">
                    <div className="rounded-xl shadow-lg overflow-hidden" style={{ borderColor: config.color + '40', border: '1px solid' }}>
                      <div className="px-3 py-2 flex items-center gap-2" style={{ background: config.color }}>
                        {config.showAvatar && <div className="h-5 w-5 rounded-full bg-white/30 flex items-center justify-center"><Bot className="h-3 w-3 text-white" /></div>}
                        <span className="text-white text-xs font-semibold truncate">{config.botName || 'Assistent'}</span>
                      </div>
                      <div className="bg-white p-2">
                        <div className="bg-slate-100 text-slate-700 text-[10px] rounded-lg px-2 py-1.5 max-w-[90%]">{config.greeting.slice(0, 60)}{config.greeting.length > 60 && '...'}</div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-1.5">
                      <div className="text-[10px] text-white font-medium py-1.5 px-3 rounded-full shadow-lg" style={{ background: config.color }}>{config.bubbleText.slice(0, 20)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Zap className="h-4 w-4 text-violet-500" /> AI Persona & Kunnskap</h3>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">System-prompt (instruksjon til AI)</label>
                <textarea value={config.persona} onChange={e => updateConfig('persona', e.target.value)} rows={4} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 resize-none font-mono text-xs" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Kunnskapsbase (lim inn info om bedriften)</label>
                <textarea value={config.knowledgeBase} onChange={e => updateConfig('knowledgeBase', e.target.value)} rows={4} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 resize-none" placeholder={`F.eks:
Bedriftsnavn: Bakken Rør AS
Tjenester: Rørlegger, baderom, varme
Åpningstider: Man-Fre 08-16
Pris: Fra 990 kr/t + mva
Telefon: 400 00 001`} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview tab ─────────────────────────── */}
      {tab === 'preview' && (
        <div className="flex flex-col items-center gap-4">
          <div className="bg-slate-100 rounded-2xl border border-slate-200 w-full max-w-md overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ background: config.color }}>
              {config.showAvatar && (
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div>
                <p className="text-white font-semibold text-sm">{config.botName || 'Assistent'}</p>
                <p className="text-white/70 text-xs">● Online nå</p>
              </div>
              <button className="ml-auto text-white/70 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            {/* Messages */}
            <div className="bg-white h-[380px] overflow-y-auto p-4 space-y-3">
              {msgs.map((m, i) => (
                <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {m.role === 'bot' && config.showAvatar && (
                    <div className="h-6 w-6 rounded-full flex-shrink-0 mr-2 mt-1 flex items-center justify-center" style={{ background: config.color }}>
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className={cn('max-w-[78%] text-sm px-3 py-2 rounded-2xl', m.role === 'user' ? 'text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm')} style={m.role === 'user' ? { background: config.color } : {}}>
                    {m.text}
                  </div>
                </div>
              ))}
              {previewLoading && (
                <div className="flex items-center gap-1 px-3 py-2 bg-slate-100 rounded-2xl rounded-bl-sm w-fit">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                </div>
              )}
            </div>
            {/* Input */}
            <div className="bg-white border-t border-slate-200 p-3 flex gap-2">
              <input
                value={previewInput} onChange={e => setPreviewInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendPreview()}
                placeholder="Skriv en melding..."
                className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-400"
              />
              <button onClick={sendPreview} disabled={previewLoading} style={{ background: config.color }} className="p-2 rounded-xl text-white disabled:opacity-50 flex-shrink-0 transition hover:opacity-90">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
          <button onClick={() => { setMsgs([{ role: 'bot', text: config.greeting }]); }} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition">
            <RefreshCw className="h-3.5 w-3.5" /> Nullstill samtale
          </button>
          <p className="text-xs text-slate-400 text-center max-w-sm">Dette er en live forhåndsvisning av boten med din konfigurasjon. Prøv å stille spørsmål som en ekte besøkende ville gjort.</p>
        </div>
      )}

      {/* ── Installer tab ─────────────────────────── */}
      {tab === 'installer' && (
        <div className="space-y-5 max-w-2xl">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-800 text-sm">Klar til å installere!</p>
              <p className="text-xs text-emerald-700 mt-0.5">Kopier koden under og lim den inn rett før <code className="bg-emerald-100 px-1 rounded">&lt;/body&gt;</code> taggen på nettsiden din. Boten er live innen sekunder.</p>
            </div>
          </div>

          {/* Code block */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
              <span className="text-xs text-slate-400 font-mono">index.html / footer.php / layout.tsx ...</span>
              <button onClick={copyCode} className={cn('flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition', copied ? 'bg-emerald-600/20 text-emerald-400' : 'bg-white/10 text-slate-300 hover:bg-white/15')}>
                {copied ? <><Check className="h-3.5 w-3.5" /> Kopiert!</> : <><Copy className="h-3.5 w-3.5" /> Kopier kode</>}
              </button>
            </div>
            <pre className="text-xs text-slate-300 font-mono p-5 overflow-x-auto leading-relaxed whitespace-pre-wrap">{embedCode}</pre>
          </div>

          {/* Platform guides */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Plattform-guider</h3>
            <div className="space-y-2">
              {[
                { name: 'WordPress', steps: 'Utseende → Redigér → footer.php → lim inn før </body>' },
                { name: 'Squarespace', steps: 'Nettstedinnstillinger → Avansert → Kodeinspeksjon → Bunntekst' },
                { name: 'Wix', steps: 'Innstillinger → Avansert → Brukerdefinert kode → Last ned siden' },
                { name: 'Shopify', steps: 'Nettbutikk → Temaer → Rediger kode → theme.liquid → før </body>' },
                { name: 'Webflow', steps: 'Prosjektinnstillinger → Tilpasset kode → Footer-kode' },
                { name: 'HTML / egenutviklet', steps: 'Lim inn direkte i <body>-seksjonens bunn' },
              ].map(p => (
                <div key={p.name} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <Globe className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.steps}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
            <p className="text-sm font-semibold text-violet-800 mb-1">Egnet for alle kunder på FlowPilot</p>
            <p className="text-xs text-violet-700">Hver bedrift som bruker FlowPilot kan installere sin egen tilpassede chatbot med unik konfigurasjon. Samtalene loggføres og leads havner automatisk i CRM-et.</p>
          </div>
        </div>
      )}
    </div>
  );
}
