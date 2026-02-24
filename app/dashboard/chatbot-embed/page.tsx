'use client';

import { useState, useEffect } from 'react';
import { Bot, Copy, Check, Code, Globe, Sparkles, Settings, Eye } from 'lucide-react';
import Link from 'next/link';

export default function ChatbotEmbedPage() {
  const [companyId, setCompanyId] = useState('');
  const [embedColor, setEmbedColor] = useState('#2563eb');
  const [botName, setBotName] = useState('Din Assistent');
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'iframe'>('script');

  useEffect(() => {
    // Get companyId from session
    fetch('/api/me')
      .then(r => r.json())
      .then(d => { if (d?.companyId) setCompanyId(d.companyId); })
      .catch(() => {});
  }, []);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://flowpilot.no';

  const scriptCode = `<!-- FlowPilot Chatbot Widget -->
<script>
  window.FlowPilotConfig = {
    companyId: "${companyId || 'DIN_COMPANY_ID'}",
    botName: "${botName}",
    color: "${embedColor}",
    position: "bottom-right"
  };
  (function() {
    var s = document.createElement('script');
    s.src = "${baseUrl}/widget.js";
    s.async = true;
    document.head.appendChild(s);
  })();
</script>`;

  const iframeCode = `<!-- FlowPilot Chatbot Iframe -->
<iframe
  src="${baseUrl}/chatbot/${companyId || 'DIN_COMPANY_ID'}?color=${encodeURIComponent(embedColor)}&name=${encodeURIComponent(botName)}"
  width="400"
  height="600"
  frameborder="0"
  style="border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.15);"
  title="Chat med oss"
></iframe>`;

  function copyScript() {
    navigator.clipboard.writeText(scriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  }
  function copyIframe() {
    navigator.clipboard.writeText(iframeCode);
    setCopiedIframe(true);
    setTimeout(() => setCopiedIframe(false), 2000);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Bot className="h-7 w-7 text-blue-600" /> Chatbot på din nettside
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Legg din AI-chatbot inn på din egen nettside med ett copy-paste kodesnippet.
          Boten svarer på spørsmål om bedriften din og hjelper med å fange nye leads automatisk.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { step: '1', label: 'Tilpass boten', desc: 'Sett navn og farge nedenfor', icon: Settings },
          { step: '2', label: 'Kopier koden', desc: 'Velg script- eller iframe-format', icon: Code },
          { step: '3', label: 'Lim inn på nettside', desc: 'Fungerer med alle plattformer', icon: Globe },
        ].map(item => (
          <div key={item.step} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center mx-auto mb-2">
              {item.step}
            </div>
            <p className="font-semibold text-slate-800 text-sm">{item.label}</p>
            <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Customize */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" /> Tilpass chatboten
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Bot-navn</label>
            <input
              value={botName}
              onChange={e => setBotName(e.target.value)}
              placeholder="F.eks. Hjelper, Support, Assistent"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Knappefarge</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={embedColor}
                onChange={e => setEmbedColor(e.target.value)}
                className="h-9 w-12 rounded-lg border border-slate-200 cursor-pointer p-0.5"
              />
              <input
                value={embedColor}
                onChange={e => setEmbedColor(e.target.value)}
                placeholder="#2563eb"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        {companyId && (
          <div className="text-xs text-slate-400">
            Din bedrifts-ID: <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{companyId}</span>
          </div>
        )}
        {!companyId && (
          <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Bedrifts-ID lastes automatisk når du er logget inn.
          </div>
        )}
      </div>

      {/* Code tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('script')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'script' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Script (anbefalt)
          </button>
          <button
            onClick={() => setActiveTab('iframe')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'iframe' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Iframe
          </button>
        </div>

        <div className="p-5">
          {activeTab === 'script' && (
            <>
              <p className="text-sm text-slate-600 mb-3">
                Lim inn denne koden rett før <code className="bg-slate-100 px-1 rounded">&lt;/body&gt;</code> på alle sider av nettsiden din.
                Chatboten vises som en knapp nederst til høyre.
              </p>
              <div className="relative">
                <pre className="bg-slate-900 text-green-300 rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap">
                  {scriptCode}
                </pre>
                <button
                  onClick={copyScript}
                  className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs text-white transition-colors"
                >
                  {copiedScript ? <><Check className="h-3.5 w-3.5 text-green-400" /> Kopiert!</> : <><Copy className="h-3.5 w-3.5" /> Kopier</>}
                </button>
              </div>
            </>
          )}

          {activeTab === 'iframe' && (
            <>
              <p className="text-sm text-slate-600 mb-3">
                Bruk iframe hvis du vil vise chatboten innebygd på en bestemt plass på siden (f.eks. i en kontaktwidget).
              </p>
              <div className="relative">
                <pre className="bg-slate-900 text-green-300 rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap">
                  {iframeCode}
                </pre>
                <button
                  onClick={copyIframe}
                  className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs text-white transition-colors"
                >
                  {copiedIframe ? <><Check className="h-3.5 w-3.5 text-green-400" /> Kopiert!</> : <><Copy className="h-3.5 w-3.5" /> Kopier</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Platform guides */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-teal-500" /> Plattform-guider
        </h2>
        <div className="space-y-3 text-sm text-slate-600">
          {[
            { platform: 'WordPress', desc: 'Gå til Utseende → Tema-editor → footer.php og lim inn koden rett før </body>. Eller bruk pluginen "Insert Headers and Footers".' },
            { platform: 'Wix', desc: 'Gå til Innstillinger → Avansert → Custom Code. Velg "Body – end" og lim inn koden.' },
            { platform: 'Squarespace', desc: 'Gå til Innstillinger → Avansert → Kodeinjeksjon. Lim inn koden i "Bunntekst"-feltet.' },
            { platform: 'Webflow', desc: 'Prosjektinnstillinger → Custom Code → Footer code. Lim inn koden der.' },
            { platform: 'HTML-side', desc: 'Åpne HTML-filen din og lim inn koden rett før </body>-taggen. Fungerer umiddelbart.' },
          ].map(item => (
            <div key={item.platform} className="flex gap-3">
              <span className="font-semibold text-slate-800 w-28 shrink-0">{item.platform}</span>
              <span>{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Preview note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Eye className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-800 text-sm">Forhåndsvisning</p>
          <p className="text-blue-700 text-sm mt-1">
            Boten bruker informasjonen du har lagt inn under{' '}
            <Link href="/dashboard/settings" className="underline">Innstillinger</Link>{' '}
            (åpningstider, tjenester, telefon osv.) for å svare kundene dine. Jo mer info du legger inn, desto bedre svar gir boten.
          </p>
        </div>
      </div>
    </div>
  );
}
