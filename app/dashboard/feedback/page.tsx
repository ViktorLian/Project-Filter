'use client';

import { useState } from 'react';
import { Star, Send, CheckCircle, ThumbsUp, ExternalLink, Copy, Clock, TrendingUp } from 'lucide-react';

type Survey = {
  id: string;
  customer: string;
  job: string;
  sentAt: string;
  completedAt?: string;
  rating?: number;
  whatWorked?: string;
  improvement?: string;
  nps?: number;
  approved: boolean;
};

const DEMO: Survey[] = [
  { id: '1', customer: 'Kari Nordmann', job: 'Baderom renovering', sentAt: '2026-02-18', completedAt: '2026-02-19', rating: 5, whatWorked: 'Rask og profesjonell jobb, veldig fornøyd med resultatet!', improvement: 'Kunne ringt me dag i forveien', nps: 9, approved: true },
  { id: '2', customer: 'Erik Bakke AS', job: 'Takarbeid', sentAt: '2026-02-17', completedAt: '2026-02-18', rating: 4, whatWorked: 'God kvalitet og pris', improvement: 'Litt forsinkelse', nps: 8, approved: false },
  { id: '3', customer: 'Ingrid Hansen', job: 'Maling innvendig', sentAt: '2026-02-16', completedAt: undefined, rating: undefined, approved: false },
  { id: '4', customer: 'Olav Svensson', job: 'Elektriker oppdrag', sentAt: '2026-02-15', completedAt: '2026-02-15', rating: 5, whatWorked: 'Ekstrem rask respons og stod for det de lovet', nps: 10, approved: true },
];

export default function FeedbackPage() {
  const [surveys, setSurveys] = useState<Survey[]>(DEMO);
  const [tab, setTab] = useState<'overview' | 'testimonials' | 'send'>('overview');
  const [copied, setCopied] = useState<string | null>(null);

  const completed = surveys.filter(s => s.completedAt);
  const avgRating = completed.length ? (completed.reduce((s, c) => s + (c.rating ?? 0), 0) / completed.length).toFixed(1) : '–';
  const avgNps = completed.filter(c => c.nps).length ? (completed.reduce((s, c) => s + (c.nps ?? 0), 0) / completed.filter(c => c.nps).length).toFixed(1) : '–';
  const approved = surveys.filter(s => s.approved);

  const toggleApprove = (id: string) => setSurveys(prev => prev.map(s => s.id === id ? { ...s, approved: !s.approved } : s));

  const copyLink = (id: string) => {
    const link = `${window.location.origin}/survey/${id}`;
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const renderStars = (n: number) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`h-4 w-4 ${i < n ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
  ));

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tilbakemeldinger og Attester</h1>
        <p className="text-slate-500 text-sm mt-0.5">Samle inn kundetilbakemeldinger automatisk etter fullfort jobb og bygg omdommeprofil</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl bg-white border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Sendt totalt</p>
          <p className="text-3xl font-bold text-slate-900">{surveys.length}</p>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Svarprosent</p>
          <p className="text-3xl font-bold text-slate-900">{Math.round((completed.length / surveys.length) * 100)}%</p>
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <p className="text-xs text-amber-600 font-medium uppercase tracking-wide mb-1">Snitt vurdering</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-amber-700">{avgRating}</p>
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          </div>
        </div>
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">NPS Score</p>
          <p className="text-3xl font-bold text-blue-700">{avgNps}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {(['overview', 'testimonials', 'send'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t === 'overview' ? 'Svar-oversikt' : t === 'testimonials' ? `Attester (${approved.length})` : 'Send undersokelse'}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="space-y-3">
          {surveys.map(survey => (
            <div key={survey.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{survey.customer}</h3>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{survey.job}</span>
                    {survey.completedAt
                      ? <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle className="h-3 w-3" /> Besvart</span>
                      : <span className="flex items-center gap-1 text-xs text-amber-600"><Clock className="h-3 w-3" /> Venter</span>}
                  </div>
                  {survey.rating && <div className="flex mb-2">{renderStars(survey.rating)}</div>}
                  {survey.whatWorked && (
                    <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 mb-2 leading-relaxed">"{survey.whatWorked}"</p>
                  )}
                  {survey.improvement && (
                    <p className="text-xs text-slate-500 italic">Forbedring: {survey.improvement}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {survey.nps && <span className="text-sm font-bold text-blue-600">NPS: {survey.nps}/10</span>}
                  <div className="flex gap-2">
                    {survey.completedAt && (
                      <button onClick={() => toggleApprove(survey.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${survey.approved ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                        {survey.approved ? 'Godkjent' : 'Godkjenn'}
                      </button>
                    )}
                    <button onClick={() => copyLink(survey.id)}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 transition flex items-center gap-1">
                      <Copy className="h-3 w-3" />{copied === survey.id ? 'Kopiert!' : 'Kopiér lenke'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Testimonials tab */}
      {tab === 'testimonials' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
            <strong>Godkjente attester</strong> vises her og kan kopieres til nettside, Google og sosiale medier.
          </div>
          {approved.length === 0 && <p className="text-slate-400 text-sm">Ingen godkjente attester enda. Godkjenn svar i Svar-oversikt.</p>}
          {approved.map(s => (
            <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex mb-3">{renderStars(s.rating ?? 5)}</div>
              <p className="text-slate-700 text-sm leading-relaxed mb-3">"{s.whatWorked}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{s.customer}</p>
                  <p className="text-xs text-slate-400">{s.job}</p>
                </div>
                <div className="flex gap-2">
                  <a href={`https://www.google.com/search?q=din+bedrift+reviews`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-blue-300 transition">
                    <ExternalLink className="h-3.5 w-3.5" /> Del pa Google
                  </a>
                  <button onClick={() => copyLink(s.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition">
                    <Copy className="h-3.5 w-3.5" /> Kopiér tekst
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send tab */}
      {tab === 'send' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700">
            <strong>Automatisk utsending:</strong> Undersokelser sendes automatisk til kunden 24 timer etter at en jobb markeres som fullfort. Du kan ogsa sende manuelt nedenfor.
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4">
            <h2 className="font-semibold">Send manuell undersokelse</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-slate-500">Kundenavn</label><input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Ola Nordmann" /></div>
              <div><label className="text-xs text-slate-500">E-post</label><input type="email" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="ola@firma.no" /></div>
              <div><label className="text-xs text-slate-500">Jobbtype</label><input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="f.eks. Baderom renovering" /></div>
              <div><label className="text-xs text-slate-500">Fullfort dato</label><input type="date" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            </div>
            <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
              <Send className="h-4 w-4" /> Send undersokelse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
