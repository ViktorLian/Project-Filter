'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const inviteToken = params.get('invite') || '';
  const cancelled = params.get('cancelled') === '1';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ companyName: '', name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm(current => ({ ...current, [key]: event.target.value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passordene stemmer ikke overens.');
    if (form.password.length < 8) return setError('Passordet må være minst 8 tegn.');
    setLoading(true);
    const response = await fetch('/api/register', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ companyName: inviteToken ? form.name : form.companyName, name: form.name, email: form.email, phone: form.phone, password: form.password, inviteToken: inviteToken || undefined }),
    });
    const data = await response.json();
    if (!response.ok) { setLoading(false); setError(data.error || 'Klarte ikke å opprette kontoen.'); return; }
    const login = await signIn('credentials', { redirect: false, email: form.email, password: form.password });
    setLoading(false);
    router.push(login?.error ? '/login?registered=1' : '/dashboard');
  }

  return <main className="min-h-screen bg-[#0a0f1a] px-4 py-10"><div className="mx-auto w-full max-w-md">
    <Link href="/" className="mb-8 flex items-center justify-center gap-2"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">FP</span><span className="text-2xl font-bold text-white">FlowPilot</span></Link>
    {cancelled && <p className="mb-4 rounded-xl border border-amber-700/40 bg-amber-900/20 px-4 py-3 text-center text-sm text-amber-300">Betalingen ble avbrutt. Ingen belastning ble gjort.</p>}
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <h1 className="text-2xl font-bold text-white">{inviteToken ? 'Bli med i teamet' : 'Opprett konto'}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-400">{inviteToken ? 'Fyll inn opplysningene dine for å få tilgang.' : 'Prøv FlowPilot i 14 dager uten betalingskort. Bedriftsinformasjon og AutoSEO-oppsett fylles inn etter innlogging.'}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {error && <p className="rounded-lg border border-red-800/40 bg-red-900/20 px-3 py-2 text-sm text-red-400">{error}</p>}
        {!inviteToken && <Field label="Bedriftsnavn" value={form.companyName} onChange={set('companyName')} placeholder="Bedriften AS" />}
        <Field label="Ditt navn" value={form.name} onChange={set('name')} placeholder="Ola Nordmann" />
        <Field label="E-post" type="email" value={form.email} onChange={set('email')} placeholder="ola@bedrift.no" />
        <Field label="Telefon (valgfritt)" type="tel" required={false} value={form.phone} onChange={set('phone')} placeholder="+47 900 00 000" />
        <Field label="Passord (minst 8 tegn)" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" minLength={8} />
        <Field label="Bekreft passord" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="••••••••" minLength={8} />
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50">{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Oppretter konto...</> : <>{inviteToken ? 'Bli med i teamet' : 'Start prøveperioden'} <ArrowRight className="h-4 w-4" /></>}</button>
        {!inviteToken && <p className="text-center text-xs leading-5 text-slate-400">Ingen automatisk belastning etter registrering. Betaling starter bare dersom du selv velger et abonnement og fullfører Stripe Checkout.</p>}
        <p className="text-center text-xs text-slate-500">Ved registrering godtar du <Link href="/terms" className="text-blue-400">brukervilkårene</Link> og <Link href="/privacy" className="text-blue-400">personvernserklæringen</Link>.</p>
      </form>
    </section>
    <p className="mt-5 text-center text-sm text-slate-500">Har du allerede konto? <Link href="/login" className="font-medium text-blue-400">Logg inn</Link></p>
  </div></main>;
}

function Field({ label, required = true, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="block text-xs font-semibold text-slate-300">{label}{required && ' *'}<input {...props} required={required} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" /></label>;
}

export default function RegisterPage() { return <Suspense fallback={<div className="min-h-screen bg-[#0a0f1a]" />}><RegisterForm /></Suspense>; }
