'use client';

import { useState } from 'react';
import { Brain, User, Building, Mail, Phone, MapPin, FileText, Sparkles, Check } from 'lucide-react';

type CRMEntry = {
  customer: string; email: string; phone: string; address: string;
  industry: string; notes: string; nextStep: string; status: string;
};

const empty: CRMEntry = { customer: '', email: '', phone: '', address: '', industry: '', notes: '', nextStep: '', status: 'Ny' };

export default function AiCrmPage() {
  const [rawInput, setRawInput] = useState('');
  const [entry, setEntry] = useState<CRMEntry>(empty);
  const [filling, setFilling] = useState(false);
  const [saved, setSaved] = useState(false);

  async function autofill() {
    if (!rawInput.trim()) return;
    setFilling(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Ekstraher CRM-informasjon fra denne teksten og returner som JSON:
${rawInput}

Returner BARE gyldig JSON (ingen forklaring) med disse feltene:
{"customer":"","email":"","phone":"","address":"","industry":"","notes":"","nextStep":"","status":""}

Status skal vaere en av: Ny, Kontaktet, Kvalifisert, Tilbud sendt, Vunnet, Tapt.
Fyll inn sa mye du kan basert pa teksten.`,
          history: [],
        }),
      });
      const d = await res.json();
      try {
        const jsonMatch = d.reply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setEntry({ ...empty, ...parsed });
        }
      } catch { /* ignore parse error */ }
    } catch { /* ignore */ }
    setFilling(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI CRM Autofyll</h1>
        <p className="text-slate-500 text-sm mt-0.5">Lim inn notater eller e-poster — AI fyller ut CRM-felter automatisk</p>
      </div>

      {/* Raw input */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h2 className="font-semibold text-slate-800">Lim inn radata</h2>
        </div>
        <textarea
          value={rawInput}
          onChange={e => setRawInput(e.target.value)}
          rows={5}
          placeholder="Lim inn e-post, samtalenotater, visittkortinfo eller annen tekst om kunden her. AI vil trekke ut relevant informasjon..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={autofill}
          disabled={filling || !rawInput.trim()}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          {filling ? 'Fyller ut...' : 'Autofyll CRM'}
        </button>
      </div>

      {/* CRM Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <h2 className="font-semibold text-slate-800">CRM-felt</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { key: 'customer', label: 'Kundenavn', icon: User, placeholder: 'Ola Nordmanns Bygg' },
            { key: 'email', label: 'E-post', icon: Mail, placeholder: 'ola@bygg.no' },
            { key: 'phone', label: 'Telefon', icon: Phone, placeholder: '+47 900 00 000' },
            { key: 'industry', label: 'Bransje', icon: Building, placeholder: 'Bygg og anlegg' },
            { key: 'address', label: 'Adresse', icon: MapPin, placeholder: 'Oslogata 1, 0101 Oslo' },
            { key: 'status', label: 'Status', icon: FileText, placeholder: 'Ny' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                <f.icon className="h-3 w-3" />{f.label}
              </label>
              <input
                value={(entry as any)[f.key]}
                onChange={e => setEntry(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Notater</label>
          <textarea value={entry.notes} onChange={e => setEntry(p => ({ ...p, notes: e.target.value }))} rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Neste steg</label>
          <input value={entry.nextStep} onChange={e => setEntry(p => ({ ...p, nextStep: e.target.value }))}
            placeholder="Eks: Ring fredag kl 10"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          {saved ? <Check className="h-4 w-4" /> : null}
          {saved ? 'Lagret!' : 'Lagre til CRM'}
        </button>
      </div>
    </div>
  );
}
