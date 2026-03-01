'use client';

import { useState } from 'react';
import { Wand2, Sparkles, Copy, Check, RefreshCw } from 'lucide-react';

const CONTENT_TYPES = [
  { id: 'facebook_ad', label: 'Facebook-annonse' },
  { id: 'google_ad', label: 'Google-annonsetekst' },
  { id: 'instagram_caption', label: 'Instagram-tekst' },
  { id: 'sms', label: 'SMS-kampanje' },
  { id: 'email_subject', label: 'E-post-emnelinje (5 forslag)' },
  { id: 'google_review_request', label: 'Anmeldelsesforespørsel' },
  { id: 'before_after_post', label: 'Før/etter innlegg' },
  { id: 'seasonal_promo', label: 'Sesongkampanje' },
];

const TONES = [
  { id: 'professional', label: 'Profesjonell' },
  { id: 'friendly', label: 'Vennlig' },
  { id: 'urgent', label: 'Hastedrivende' },
  { id: 'local', label: 'Lokal / nærmiljø' },
  { id: 'trustworthy', label: 'Tillitsbyggende' },
];

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}
      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors">
      {done ? <><Check className="h-3 w-3 text-green-500" />Kopiert</> : <><Copy className="h-3 w-3" />Kopier</>}
    </button>
  );
}

type GeneratedItem = { label: string; content: string };

export default function CreativeGeneratorPage() {
  const [contentType, setContentType] = useState('facebook_ad');
  const [tone, setTone] = useState('friendly');
  const [industry, setIndustry] = useState('');
  const [service, setService] = useState('');
  const [usp, setUsp] = useState('');
  const [area, setArea] = useState('');
  const [results, setResults] = useState<GeneratedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState(2);
  const [validationError, setValidationError] = useState('');

  async function generate() {
    setValidationError('');
    if (!industry || !service) {
      setValidationError('Du må fylle inn bransje og tjeneste/produkt før du kan generere innhold.');
      return;
    }
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Du er en reklamekopist for norske SMB-bedrifter.

Lag ${variants} varianter av: "${CONTENT_TYPES.find(t => t.id === contentType)?.label}"
Bransje/type: ${industry}
Tjeneste/produkt: ${service}
Unikt salgsargument: ${usp || 'ikke oppgitt'}
Område: ${area || 'Norge'}
Tone: ${TONES.find(t => t.id === tone)?.label}

Format – én variant per seksjon:
VARIANT 1:
[innholdet]

VARIANT 2:
[innholdet]

Norsk bokmål. Konkret, engasjerende og klar for bruk uten endringer.`,
          history: [],
        }),
      });
      const data = await res.json();
      const text: string = data.reply || '';
      const matches = Array.from(text.matchAll(/VARIANT\s*(\d+):\s*([\s\S]+?)(?=VARIANT\s*\d+:|$)/gi));
      const items: GeneratedItem[] = [];
      for (const m of matches) {
        items.push({ label: `Variant ${m[1]}`, content: m[2].trim() });
      }
      if (items.length === 0) {
        items.push({ label: 'Generert tekst', content: text.trim() });
      }
      setResults(items);
    } finally { setLoading(false); }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kreativ Generator</h1>
        <p className="text-slate-500 mt-1">AI lager annonsekopi, innlegg og e-posttekster klare til bruk</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
        {/* Content type */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Hva vil du lage?</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {CONTENT_TYPES.map(ct => (
              <button key={ct.id} onClick={() => setContentType(ct.id)}
                className={`rounded-lg border p-2.5 text-left text-xs transition-all ${contentType === ct.id ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}>
                {ct.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Tone</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map(t => (
              <button key={t.id} onClick={() => setTone(t.id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-all ${tone === t.id ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Bransje *</label>
            <input value={industry} onChange={e => setIndustry(e.target.value)}
              placeholder="Eks: Rørlegger, maler, elektriker..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Tjeneste / kampanje *</label>
            <input value={service} onChange={e => setService(e.target.value)}
              placeholder="Eks: Baderomrenovering, vårrengjøring..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Unikt salgsargument</label>
            <input value={usp} onChange={e => setUsp(e.target.value)}
              placeholder="Eks: Garanti i 10 år, gratis befaring, fast pris..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Antall varianter</label>
            <select value={variants} onChange={e => setVariants(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
              {[1, 2, 3].map(n => <option key={n} value={n}>{n} variant{n > 1 ? 'er' : ''}</option>)}
            </select>
          </div>
        </div>

        <button onClick={generate} disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm">
          <Wand2 className="h-4 w-4" />
          {loading ? 'Genererer...' : 'Generer innhold'}
        </button>

        {validationError && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            ⚠️ {validationError}
          </p>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((r, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-700">{r.label}</span>
                <div className="flex items-center gap-3">
                  <CopyBtn text={r.content} />
                  <button onClick={generate} disabled={loading} title="Regenerer"
                    className="text-slate-400 hover:text-slate-700 transition-colors">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{r.content}</p>
            </div>
          ))}
          <p className="text-xs text-slate-400 text-center">Klikk "Kopier" for å bruke direkte i Facebook Ads Manager, e-post eller SMS-system</p>
        </div>
      )}

      {results.length === 0 && !loading && (
        <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 p-8 text-center">
          <Wand2 className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Fyll inn info og klikk Generer</p>
          <p className="text-slate-400 text-sm mt-1">AI lager ferdig annonsekopi du kan bruke direkte</p>
        </div>
      )}
    </div>
  );
}
