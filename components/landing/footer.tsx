'use client';
import { useState } from 'react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'ok' : 'err');
    } catch { setStatus('err'); }
  }

  return (
    <footer className="border-t bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-6 space-y-8">
        {/* Newsletter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-200 rounded-2xl bg-white px-6 py-5">
          <div>
            <p className="font-semibold text-slate-800">Meld deg på nyhetsbrev</p>
            <p className="text-sm text-slate-500 mt-0.5">Få tips om vekst, salg og smarte verktøy for din bedrift</p>
          </div>
          {status === 'ok' ? (
            <p className="text-emerald-600 font-medium text-sm">Takk! Du er nå påmeldt.</p>
          ) : (
            <form onSubmit={subscribe} className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Din e-post"
                required
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-60"
              />
              <button type="submit" disabled={status === 'loading'}
                className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                {status === 'loading' ? '...' : 'Meld på'}
              </button>
            </form>
          )}
        </div>
        {/* Bottom row */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} FlowPilot. Alle rettigheter forbeholdt.
          </p>
          <div className="flex gap-4 text-sm text-slate-600">
            <a href="#features" className="hover:text-blue-600">Funksjoner</a>
            <a href="#pricing" className="hover:text-blue-600">Priser</a>
            <a href="#contact" className="hover:text-blue-600">Kontakt</a>
            <a href="/login" className="hover:text-blue-600">Logg inn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

