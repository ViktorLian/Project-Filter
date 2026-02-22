'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Loader2, Star } from 'lucide-react';

export default function SurveyPage({ params }: any) {
  const token = params.token;
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [form, setForm] = useState({
    rating: 0, wentWell: '', improvements: '', wouldRecommend: '', additionalComments: '',
  });

  useEffect(() => {
    if (!token) return;
    fetch(`/api/feedback-surveys/${token}`)
      .then(r => r.json())
      .then(json => {
        if (json.alreadyCompleted) setAlreadyDone(true);
        else if (json.survey) setSurvey(json.survey);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async () => {
    if (form.rating === 0) return;
    setSubmitting(true);
    const res = await fetch(`/api/feedback-surveys/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) setDone(true);
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
    </div>
  );

  if (alreadyDone) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-10 text-center shadow-lg">
        <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Allerede besvart</h2>
        <p className="mt-2 text-slate-500">Du har allerede svart på denne undersøkelsen. Takk!</p>
      </div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-10 text-center shadow-lg">
        <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Tusen takk!</h2>
        <p className="mt-2 text-slate-500">Din tilbakemelding er mottatt og hjelper oss å bli bedre.</p>
        <div className="mt-6 flex justify-center gap-1">
          {[1,2,3,4,5].map(s => (
            <Star key={s} className={`h-7 w-7 ${s <= Math.round(form.rating / 2) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`} />
          ))}
        </div>
      </div>
    </div>
  );

  if (!survey) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-10 text-center shadow-lg">
        <p className="text-slate-500">Undersøkelsen ble ikke funnet eller er utløpt.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 mb-4">
            <span className="text-white font-bold text-xl">FP</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Gi oss din tilbakemelding</h1>
          <p className="mt-2 text-slate-500">
            Hei {survey.customer?.name || ''}! Hvordan var opplevelsen med <strong>{survey.job?.job_title || 'jobben'}</strong>?
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">
              1. På en skala fra 1–10, hvor fornøyd er du totalt sett? *
            </label>
            <div className="flex gap-2 flex-wrap">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button key={n} onClick={() => setForm({ ...form, rating: n })}
                  className={`w-10 h-10 rounded-lg text-sm font-bold transition ${form.rating === n ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {n}
                </button>
              ))}
            </div>
            {form.rating > 0 && (
              <p className="mt-2 text-xs text-slate-500">
                {form.rating >= 9 ? '😊 Flott! Du er en ambassadør.' : form.rating >= 7 ? '🙂 Bra – men vi kan alltid bli bedre.' : '😕 Vi beklager. Vi tar dette på alvor.'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">2. Hva fungerte bra?</label>
            <textarea value={form.wentWell} onChange={e => setForm({ ...form, wentWell: e.target.value })}
              placeholder="F.eks. rask responstid, god kommunikasjon..." rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">3. Hva kan vi forbedre?</label>
            <textarea value={form.improvements} onChange={e => setForm({ ...form, improvements: e.target.value })}
              placeholder="Dine forslag er verdifulle for oss..." rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">4. Vil du anbefale oss til andre?</label>
            <div className="flex gap-3">
              {['Ja, absolutt', 'Kanskje', 'Nei'].map(opt => (
                <button key={opt} onClick={() => setForm({ ...form, wouldRecommend: opt })}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${form.wouldRecommend === opt ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">5. Andre kommentarer?</label>
            <textarea value={form.additionalComments} onChange={e => setForm({ ...form, additionalComments: e.target.value })}
              placeholder="Noe annet du vil dele med oss..." rows={2}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none" />
          </div>

          <button onClick={handleSubmit} disabled={submitting || form.rating === 0}
            className="w-full rounded-xl bg-blue-600 py-4 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? 'Sender...' : 'Send tilbakemelding'}
          </button>
          <p className="text-center text-xs text-slate-400">Tilbakemeldingen din brukes kun til å forbedre tjenesten.</p>
        </div>
      </div>
    </div>
  );
}

