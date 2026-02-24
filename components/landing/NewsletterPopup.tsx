'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Sparkles, Gift } from 'lucide-react';

export function NewsletterPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // Show popup after 8 seconds, only if not already dismissed
    const dismissed = localStorage.getItem('fp_newsletter_dismissed');
    const subscribed = localStorage.getItem('fp_newsletter_subscribed');
    if (dismissed || subscribed) return;
    const timer = setTimeout(() => setShow(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem('fp_newsletter_dismissed', '1');
    setShow(false);
  }

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const json = await res.json();
      if (res.ok) {
        setStatus('success');
        localStorage.setItem('fp_newsletter_subscribed', '1');
        setMsg(json.alreadySubscribed
          ? 'Du er allerede påmeldt – vi gleder oss til å holde deg oppdatert! 🎉'
          : 'Du er påmeldt! Sjekk e-posten din for velkomstbrev og rabattkode. 🎉');
      } else {
        setStatus('error');
        setMsg(json.error || 'Noe gikk galt, prøv igjen.');
      }
    } catch {
      setStatus('error');
      setMsg('Noe gikk galt, prøv igjen.');
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Top banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">FlowPilot-nyhetsbrevet</span>
          </div>
          <p className="text-blue-100 text-sm">Nye funksjoner, tips og eksklusive tilbud – rett i innboksen din</p>
        </div>

        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
          aria-label="Lukk"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 py-6">
          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Takk for påmeldingen!</h3>
              <p className="text-slate-600 text-sm mb-4">{msg}</p>
              <button
                onClick={() => setShow(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Lukk
              </button>
            </div>
          ) : (
            <>
              {/* Benefits */}
              <ul className="space-y-2 mb-5">
                {[
                  { icon: '🚀', text: 'Nye funksjoner annonsert først' },
                  { icon: '🎯', text: 'Tips for bedre leads og vekst' },
                  { icon: Gift, text: '30% rabatt ved bestilling de neste 3 månedene', highlight: true },
                ].map((item, i) => (
                  <li key={i} className={`flex items-center gap-3 text-sm rounded-lg px-3 py-2 ${item.highlight ? 'bg-amber-50 border border-amber-200 text-amber-800 font-medium' : 'text-slate-600'}`}>
                    <span className="text-base">
                      {typeof item.icon === 'string' ? item.icon : <Gift className="h-4 w-4 text-amber-600" />}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>

              <form onSubmit={subscribe} className="space-y-3">
                <input
                  type="text"
                  placeholder="Fornavn (valgfritt)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="E-postadresse *"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {status === 'error' && (
                  <p className="text-red-600 text-xs">{msg}</p>
                )}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition disabled:opacity-60"
                >
                  {status === 'loading' ? 'Melder på...' : 'Meld meg på gratis →'}
                </button>
              </form>

              <p className="text-center text-xs text-slate-400 mt-3">
                Sendes ca. hver 3. uke. Du kan melde deg av når som helst.
              </p>

              <button
                onClick={dismiss}
                className="w-full mt-2 text-xs text-slate-400 hover:text-slate-600 transition"
              >
                Nei takk, jeg er ikke interessert
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
