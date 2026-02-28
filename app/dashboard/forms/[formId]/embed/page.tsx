'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, CheckCheck, ExternalLink, Code2, Globe, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function FormEmbedPage({ params }: { params: { formId: string } }) {
  const [form, setForm] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/forms/${params.formId}`)
      .then(r => r.json())
      .then(d => setForm(d.form || d));
  }, [params.formId]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://flowpilot.no';
  const formUrl = form ? `${baseUrl}/f/${form.slug}` : '';

  const iframeCode = `<iframe
  src="${formUrl}"
  width="100%"
  height="700"
  frameborder="0"
  style="border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,.08)"
></iframe>`;

  const buttonCode = `<!-- Flytende "Fa tilbud"-knapp -->
<button onclick="document.getElementById('fp-modal').style.display='flex'"
  style="position:fixed;bottom:24px;right:24px;background:#2563eb;color:#fff;border:none;border-radius:50px;padding:14px 22px;font-size:15px;font-weight:600;cursor:pointer;box-shadow:0 4px 18px rgba(37,99,235,.4);z-index:9999">
  Fa tilbud
</button>
<div id="fp-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;align-items:center;justify-content:center;padding:16px"
  onclick="if(event.target===this)this.style.display='none'">
  <div style="background:#fff;border-radius:16px;width:100%;max-width:600px;overflow:hidden">
    <iframe src="${formUrl}" width="100%" height="650" frameborder="0"></iframe>
  </div>
</div>`;

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  if (!form) return <div className="p-8 text-slate-500 text-sm">Laster...</div>;

  return (
    <div className="max-w-3xl mx-auto pb-16 pt-2">
      <Link href={`/dashboard/forms/${params.formId}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition">
        <ArrowLeft className="h-4 w-4" /> Tilbake
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Embed skjema pa nettsiden</h1>
      <p className="text-slate-500 text-sm mb-6">{form.name}</p>

      <div className="space-y-5">
        {/* Direct link */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4 text-blue-600" />
            <h2 className="font-semibold text-slate-800">Direktelenke</h2>
          </div>
          <p className="text-sm text-slate-500 mb-3">Del denne lenken direkte via e-post, SMS eller sosiale medier.</p>
          <div className="flex items-center gap-2 flex-wrap">
            <code className="flex-1 min-w-0 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm text-slate-700 truncate">{formUrl}</code>
            <button onClick={() => copy(formUrl, 'url')}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-2.5 text-sm font-semibold transition whitespace-nowrap">
              {copied === 'url' ? <><CheckCheck className="h-4 w-4 text-emerald-600" /> Kopiert</> : <><Copy className="h-4 w-4" /> Kopier</>}
            </button>
            <a href={formUrl} target="_blank"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-2.5 text-sm font-semibold text-white transition whitespace-nowrap">
              <ExternalLink className="h-4 w-4" /> Apne
            </a>
          </div>
        </div>

        {/* Iframe */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-1">
            <Code2 className="h-4 w-4 text-purple-600" />
            <h2 className="font-semibold text-slate-800">Iframe-embed (anbefalt)</h2>
          </div>
          <p className="text-sm text-slate-500 mb-3">Lim inn direkte pa nettsiden. Fungerer i Webflow, WordPress, Wix, Framer og alle andre nettsidebyggere.</p>
          <pre className="rounded-lg bg-slate-900 text-emerald-400 text-xs p-4 overflow-x-auto mb-3 leading-relaxed">{iframeCode}</pre>
          <button onClick={() => copy(iframeCode, 'iframe')}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-semibold transition">
            {copied === 'iframe' ? <><CheckCheck className="h-4 w-4 text-emerald-600" /> Kopiert</> : <><Copy className="h-4 w-4" /> Kopier iframe-kode</>}
          </button>
        </div>

        {/* Popup button */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="h-4 w-4 text-emerald-600" />
            <h2 className="font-semibold text-slate-800">Flytende knapp (popup)</h2>
          </div>
          <p className="text-sm text-slate-500 mb-3">Legger til en "Fa tilbud"-knapp i hjornet pa nettsiden. Klikk apner skjemaet i en popup over siden.</p>
          <pre className="rounded-lg bg-slate-900 text-emerald-400 text-xs p-4 overflow-x-auto mb-3 leading-relaxed">{buttonCode}</pre>
          <button onClick={() => copy(buttonCode, 'button')}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-semibold transition">
            {copied === 'button' ? <><CheckCheck className="h-4 w-4 text-emerald-600" /> Kopiert</> : <><Copy className="h-4 w-4" /> Kopier popup-kode</>}
          </button>
        </div>

        {/* Platform instructions */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Slik gjor du det — steg for steg</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: 'Webflow', steps: ['Dra inn et "Embed"-element', 'Lim inn iframe-koden', 'Publiser siden'] },
              { title: 'WordPress', steps: ['Rediger siden i Gutenberg', 'Legg til "Custom HTML"-blokk', 'Lim inn iframe-koden', 'Publiser'] },
              { title: 'Wix', steps: ['Klikk + → Embed → HTML', 'Velg "Enter Code"', 'Lim inn iframe-koden', 'Publiser'] },
              { title: 'Framer', steps: ['Legg til "Embed"-komponent', 'Lim inn iframe URL direkte', 'Publiser prosjektet'] },
            ].map(p => (
              <div key={p.title} className="rounded-lg bg-white border border-blue-100 p-3">
                <p className="font-semibold text-slate-800 text-sm mb-2">{p.title}</p>
                <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                  {p.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Alle leads som fyller ut skjemaet scores automatisk og vises i dashbordet under <strong>Leads</strong>.
            Du far e-postvarsel ved hoy-kvalitet leads basert pa scøregrensen du satte i skjemaet.
          </p>
        </div>
      </div>
    </div>
  );
}
