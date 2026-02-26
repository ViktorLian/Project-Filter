'use client';

import { useState } from 'react';
import { Star, Phone, Save, CheckCircle } from 'lucide-react';

export default function SettingsEditor({
  googleReviewUrl,
  smsPhone,
}: {
  googleReviewUrl?: string;
  smsPhone?: string;
}) {
  const [reviewUrl, setReviewUrl] = useState(googleReviewUrl || '');
  const [phone, setPhone] = useState(smsPhone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ google_review_url: reviewUrl, sms_phone: phone }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || 'Feil'); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError('Nettverksfeil'); }
    finally { setSaving(false); }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-yellow-500" />
        <h2 className="font-semibold text-slate-800">Varsler og anmeldelser</h2>
      </div>

      {/* Google Review URL */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
          Google Review-lenke
        </label>
        <input
          value={reviewUrl}
          onChange={e => setReviewUrl(e.target.value)}
          placeholder="https://g.page/r/DIN-KODE/review"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-slate-400 mt-1">
          Finn den i Google Business Profile → Del bedriften → Kopiér anmeldelseslenken.
          Sendes automatisk til kunder 2 dager etter en jobb er fullført.
        </p>
      </div>

      {/* SMS Phone */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
          Telefonnummer for SMS-varsler
        </label>
        <div className="flex gap-2 items-center">
          <Phone className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+47 900 00 000"
            type="tel"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Nummeret som mottar SMS-varsler fra kalenderen. 
          <span className="text-orange-500 font-medium"> Krever Twilio-integrasjon for faktisk sending – kontakt support for oppsett.</span>
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {saved ? 'Lagret!' : saving ? 'Lagrer…' : 'Lagre endringer'}
      </button>
    </div>
  );
}
