'use client';

import { useState } from 'react';
import { CheckCircle, ArrowRight, ArrowLeft, Globe, TrendingUp, Search, Share2, Star, Zap, Users, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const SERVICES_OPTIONS = [
  { id: 'nettside', label: 'Nettside', icon: Globe, desc: 'Profesjonell nettside som konverterer' },
  { id: 'google-ads', label: 'Google Ads', icon: TrendingUp, desc: 'Annonser som gir jobber' },
  { id: 'seo', label: 'SEO', icon: Search, desc: 'Bli funnet organisk på Google' },
  { id: 'sosiale-medier', label: 'Sosiale medier', icon: Share2, desc: 'Bygg merkevare på nett' },
  { id: 'anmeldelsesbooster', label: 'Anmeldelsesbooster', icon: Star, desc: 'Flere 5-stjerners anmeldelser' },
  { id: 'flowpilot', label: 'FlowPilot CRM', icon: Zap, desc: 'Automatiser leads og oppfølging' },
  { id: 'radgivning', label: 'Gratis rådgivning', icon: MessageCircle, desc: 'Hva passer best for meg?' },
];

const GOALS_OPTIONS = [
  'Skaffe flere kunder og leads',
  'Øke omsetningen',
  'Spare tid på administrasjon',
  'Forbedre nettsynligheten',
  'Automatisere oppfølging',
  'Bygge merkevare',
];

const BUDGET_OPTIONS = [
  'Under 2 000 kr/mnd',
  '2 000 – 5 000 kr/mnd',
  '5 000 – 10 000 kr/mnd',
  'Over 10 000 kr/mnd',
  'Engangsprosjekt (nettside)',
  'Usikker – trenger rådgivning',
];

const INDUSTRIES = [
  'Håndverk / Bygg',
  'Rørlegger / VVS',
  'Elektro',
  'Rengjøring',
  'Eiendom / Megling',
  'Helse / Velvære',
  'Restaurant / Mat',
  'Konsulent / Rådgiver',
  'Transport / Logistikk',
  'Annet',
];

type FormData = {
  services: string[];
  goals: string[];
  budget: string;
  company: string;
  industry: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};

const EMPTY: FormData = {
  services: [], goals: [], budget: '', company: '', industry: '',
  name: '', email: '', phone: '', message: '',
};

export default function BliKundePage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const toggle = (field: 'services' | 'goals', val: string) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val],
    }));
  };

  const submit = async () => {
    if (!form.name || !form.email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/service-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Takk, {form.name.split(' ')[0]}!</h1>
          <p className="text-slate-500 mb-6">Vi har mottatt forespørselen din og tar kontakt innen 24 timer. Sjekk e-posten din for bekreftelse.</p>
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition">
            Tilbake til forsiden <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Logo + back */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="text-2xl font-extrabold text-blue-700 tracking-tight">FlowPilot</Link>
          <span className="text-sm text-slate-400">Steg {step} av 4</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-1.5 mb-8">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

          {/* Step 1: Services */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Hva kan vi hjelpe deg med?</h2>
              <p className="text-slate-500 text-sm mb-6">Velg én eller flere tjenester du er interessert i.</p>
              <div className="grid grid-cols-1 gap-3">
                {SERVICES_OPTIONS.map(s => {
                  const Icon = s.icon;
                  const sel = form.services.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggle('services', s.id)}
                      className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${sel ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sel ? 'bg-blue-100' : 'bg-slate-100'}`}>
                        <Icon className={`h-5 w-5 ${sel ? 'text-blue-600' : 'text-slate-500'}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{s.label}</p>
                        <p className="text-slate-500 text-xs">{s.desc}</p>
                      </div>
                      {sel && <CheckCircle className="ml-auto h-5 w-5 text-blue-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => form.services.length > 0 && setStep(2)}
                disabled={form.services.length === 0}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-40"
              >
                Neste <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Step 2: Goals + Budget */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Hva er dine viktigste mål?</h2>
              <p className="text-slate-500 text-sm mb-5">Velg alt som passer.</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {GOALS_OPTIONS.map(g => {
                  const sel = form.goals.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => toggle('goals', g)}
                      className={`rounded-xl border-2 p-3 text-sm text-left transition-all ${sel ? 'border-blue-500 bg-blue-50 font-semibold text-blue-700' : 'border-slate-200 text-slate-700 hover:border-blue-300'}`}
                    >
                      {sel && '✓ '}{g}
                    </button>
                  );
                })}
              </div>
              <h3 className="font-semibold text-slate-900 mb-3 text-sm">Hva er omtrentlig budsjett?</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {BUDGET_OPTIONS.map(b => (
                  <button
                    key={b}
                    onClick={() => setForm(f => ({ ...f, budget: b }))}
                    className={`rounded-xl border-2 p-3 text-sm text-left transition-all ${form.budget === b ? 'border-blue-500 bg-blue-50 font-semibold text-blue-700' : 'border-slate-200 text-slate-700 hover:border-blue-300'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                  <ArrowLeft className="h-4 w-4" /> Tilbake
                </button>
                <button onClick={() => setStep(3)} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition">
                  Neste <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Company info */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Litt om bedriften din</h2>
              <p className="text-slate-500 text-sm mb-6">Dette hjelper oss å gi deg den beste rådgivningen.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Bedriftsnavn</label>
                  <input
                    type="text"
                    placeholder="Eks: Hansen Rørlegger AS"
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bransje</label>
                  <div className="grid grid-cols-2 gap-2">
                    {INDUSTRIES.map(ind => (
                      <button
                        key={ind}
                        onClick={() => setForm(f => ({ ...f, industry: ind }))}
                        className={`rounded-xl border-2 px-3 py-2 text-sm text-left transition-all ${form.industry === ind ? 'border-blue-500 bg-blue-50 font-semibold text-blue-700' : 'border-slate-200 text-slate-700 hover:border-blue-300'}`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Ekstra kommentar (valgfritt)</label>
                  <textarea
                    placeholder="Fortell oss mer om hva du trenger..."
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                  <ArrowLeft className="h-4 w-4" /> Tilbake
                </button>
                <button onClick={() => setStep(4)} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition">
                  Neste <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Contact info */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Kontaktinformasjon</h2>
              <p className="text-slate-500 text-sm mb-6">Vi tar kontakt innen 24 timer for et gratis rådgivningsmøte.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Fullt navn *</label>
                  <input
                    type="text"
                    placeholder="Eks: Ola Nordmann"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">E-postadresse *</label>
                  <input
                    type="email"
                    placeholder="ola@bedrift.no"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Telefonnummer (valgfritt)</label>
                  <input
                    type="tel"
                    placeholder="+47 900 00 000"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>
              {/* Summary */}
              <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                <p className="font-semibold text-slate-700 mb-2">Oppsummering</p>
                <p className="text-slate-500"><span className="font-medium text-slate-700">Tjenester:</span> {form.services.map(s => SERVICES_OPTIONS.find(o => o.id === s)?.label).join(', ') || '–'}</p>
                <p className="text-slate-500"><span className="font-medium text-slate-700">Budsjett:</span> {form.budget || '–'}</p>
              </div>
              {status === 'error' && (
                <p className="mt-3 text-sm text-red-600">Noe gikk galt, prøv igjen.</p>
              )}
              <div className="flex gap-3 mt-5">
                <button onClick={() => setStep(3)} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                  <ArrowLeft className="h-4 w-4" /> Tilbake
                </button>
                <button
                  onClick={submit}
                  disabled={!form.name || !form.email || status === 'loading'}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-40"
                >
                  {status === 'loading' ? 'Sender...' : 'Send forespørsel'} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-center text-xs text-slate-400">
                Ingen spam. Ingen forpliktelser. Vi respekterer personvernet ditt.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
