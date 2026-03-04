'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ChevronRight, ArrowLeft, Loader2, ArrowRight, Layers } from 'lucide-react';
import { NICHES, getNiche, NICHE_CATEGORIES } from '@/lib/niches';

function RegisterFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const nicheFromUrl = params.get('niche') || '';
  const inviteToken = params.get('invite') || '';
  const cancelled = params.get('cancelled') === '1';

  const preselectedNiche = nicheFromUrl ? getNiche(nicheFromUrl) : null;

  const [step, setStep] = useState<'niche' | 'form'>(
    preselectedNiche || inviteToken ? 'form' : 'niche'
  );
  const [selectedNicheId, setSelectedNicheId] = useState(nicheFromUrl || 'rorlegger');
  const [nicheFilter, setNicheFilter] = useState('Alle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ companyName: '', name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const selectedNiche = getNiche(selectedNicheId) || NICHES[0];

  const filteredNiches = nicheFilter === 'Alle' ? NICHES : NICHES.filter(n => n.category === nicheFilter);
  const allCategories = ['Alle', ...NICHE_CATEGORIES];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passordene stemmer ikke overens.'); return; }
    if (form.password.length < 8) { setError('Passord må være minst 8 tegn.'); return; }
    setLoading(true);

    if (inviteToken) {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, companyName: form.name, inviteToken }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) { setError(data.error || 'Feil ved registrering'); return; }
      router.push('/login?invited=1');
      return;
    }

    const res = await fetch('/api/stripe/register-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: form.companyName,
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        plan: selectedNicheId,
        nicheId: selectedNicheId,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.url) { setError(data.error || 'Klarte ikke starte registrering.'); return; }
    window.location.href = data.url;
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-900/40">
          <span className="text-white font-bold text-sm">FP</span>
        </div>
        <span className="text-2xl font-bold text-white">FlowPilot</span>
      </Link>

      {cancelled && (
        <div className="mb-4 rounded-xl border border-amber-700/40 bg-amber-900/20 px-4 py-3 text-sm text-amber-300 max-w-md w-full text-center">
          Betalingen ble avbrutt. Ingen belastning ble gjort.
        </div>
      )}

      {/* STEP 1: Niche selection */}
      {step === 'niche' && !inviteToken && (
        <div className="w-full max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Velg din bransje</h1>
            <p className="text-slate-400 mt-2">Vi tilpasser hele systemet for din nisje — 14 dager gratis</p>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setNicheFilter(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  nicheFilter === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-blue-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mb-6">
            {filteredNiches.map(niche => (
              <div
                key={niche.id}
                onClick={() => { setSelectedNicheId(niche.id); setStep('form'); }}
                className={`relative rounded-xl border p-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                  selectedNicheId === niche.id
                    ? 'border-blue-500 bg-blue-900/20 shadow-blue-900/30 shadow-md'
                    : 'border-slate-700 bg-slate-900 hover:border-blue-600/50'
                }`}
                style={selectedNicheId === niche.id ? { boxShadow: `0 4px 20px ${niche.color}30` } : {}}
              >
                {niche.popular && (
                  <div className="absolute -top-2 -right-2 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-white">
                    POPULÆR
                  </div>
                )}
                <div className="h-8 w-8 mb-2 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-white leading-tight">{niche.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{niche.priceMonthly.toLocaleString('nb-NO')} kr/mnd</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-blue-400 font-medium">
                  Velg <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500">
            Har du allerede konto? <Link href="/login" className="text-blue-400 hover:underline font-medium">Logg inn</Link>
          </p>
        </div>
      )}

      {/* STEP 2: Registration form */}
      {(step === 'form' || inviteToken) && (
        <div className="w-full max-w-md">
          {!inviteToken && (
            <button onClick={() => setStep('niche')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-5 transition">
              <ArrowLeft className="h-4 w-4" /> Tilbake til bransjevalg
            </button>
          )}

          {inviteToken ? (
            <div className="rounded-xl border border-emerald-700/40 bg-emerald-900/20 px-4 py-3 mb-5 text-sm text-emerald-300">
              <p className="font-semibold">Du er invitert til et team!</p>
              <p className="text-xs mt-0.5 text-emerald-400">Opprett konto for å få tilgang — gratis, inkludert i abonnementet.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0">
                  <Layers className="h-4 w-4 text-slate-300" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Valgt nisje</p>
                  <p className="font-bold text-white text-sm">
                    {selectedNiche.name} — {selectedNiche.priceMonthly.toLocaleString('nb-NO')} kr/mnd
                  </p>
                </div>
              </div>
              <button onClick={() => setStep('niche')} className="text-xs text-blue-400 hover:underline font-medium">Endre</button>
            </div>
          )}

          {/* Features preview */}
          {!inviteToken && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 mb-5">
              <p className="text-xs text-slate-500 mb-2">Inkludert i pakken:</p>
              <div className="grid grid-cols-2 gap-1.5">
                {selectedNiche.nicheFeatures.slice(0, 4).map(f => (
                  <div key={f.name} className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="truncate">{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl shadow-black/40 p-6">
            <h2 className="text-xl font-bold text-white mb-1">{inviteToken ? 'Bli med i teamet' : 'Opprett din konto'}</h2>
            <p className="text-sm text-slate-400 mb-5">
              {inviteToken ? 'Fyll inn dine opplysninger for å starte.' : '14 dager gratis — kortet belastes ikke nå.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="rounded-lg border border-red-800/40 bg-red-900/20 px-3 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}
              {!inviteToken && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Bedriftsnavn *</label>
                  <input value={form.companyName} onChange={set('companyName')} required placeholder="Nordmann Rørlegger AS"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 text-white px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Ditt navn *</label>
                <input value={form.name} onChange={set('name')} required placeholder="Ola Nordmann"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 text-white px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">E-post *</label>
                <input type="email" value={form.email} onChange={set('email')} required placeholder="ola@bedrift.no"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 text-white px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Telefon</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+47 900 00 000"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 text-white px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Passord * (min. 8 tegn)</label>
                <input type="password" value={form.password} onChange={set('password')} required minLength={8} placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 text-white px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Bekreft passord *</label>
                <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 text-white px-3 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2 mt-1 shadow-lg shadow-blue-900/30">
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Behandler...</>
                  : inviteToken
                    ? 'Bli med i teamet'
                    : <> Start 14 dager gratis <ArrowRight className="h-4 w-4" /></>
                }
              </button>
              {!inviteToken && (
                <div className="rounded-lg border border-emerald-800/30 bg-emerald-900/20 px-3 py-2 text-xs text-emerald-400 text-center">
                  <strong>Kortet belastes IKKE nå.</strong> Abonnementet starter automatisk etter 14 dager.
                </div>
              )}
              <p className="text-xs text-center text-slate-500 mt-1">
                Ved å registrere deg godtar du våre{' '}
                <Link href="/terms" target="_blank" className="text-blue-400 hover:underline">Brukervilkår</Link>{' '}
                og{' '}
                <Link href="/privacy" target="_blank" className="text-blue-400 hover:underline">Personvernserklæring</Link>.
              </p>
            </form>
          </div>

          <p className="text-center text-sm text-slate-500 mt-4">
            Har du allerede konto?{' '}
            <Link href="/login" className="text-blue-400 hover:underline font-medium">Logg inn her</Link>
          </p>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center text-slate-400">Laster...</div>}>
      <RegisterFlow />
    </Suspense>
  );
}
