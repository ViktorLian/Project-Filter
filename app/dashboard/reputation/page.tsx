'use client';

import { useState } from 'react';
import { Star, TrendingUp, MessageSquare, Send, CheckCircle, AlertTriangle, ExternalLink, Copy, RefreshCw, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

const REVIEW_TEMPLATES = [
  {
    id: 'general',
    label: 'Standard',
    msg: 'Hei {navn}! Vi er så glad for at du valgte oss til jobben. Hvis du er fornøyd – ville det bety veldig mye for oss om du tok ett minutt til å legge igjen en anmeldelse på Google. Takk! 🙏\n👉 {link}',
  },
  {
    id: 'followup',
    label: 'Oppfølging',
    msg: 'Hei {navn} 😊 Vi håper alt er bra! Vi sender denne som en vennlig påminnelse — din mening betyr alt for oss. Legg gjerne igjen en liten anmeldelse her: {link}',
  },
  {
    id: 'vip',
    label: 'VIP-kunde',
    msg: 'Hei {navn}! Som en av våre mest verdsatte kunder ønsker vi å høre hva du synes. Din anmeldelse hjelper oss å bli enda bedre og hjelper andre å finne oss. {link} — takk på forhånd! ⭐',
  },
];

const MOCK_REVIEWS = [
  { id: 1, name: 'Kari Nordmann', stars: 5, text: 'Fantastisk jobb! Veldig fornøyd med resultatet og profesjonell kommunikasjon.', date: '2025-02-10', platform: 'Google', responded: false },
  { id: 2, name: 'Erik Hansen', stars: 4, text: 'God jobb, men litt forsinkelse i starten. Sluttproduktet var bra.', date: '2025-01-28', platform: 'Google', responded: true },
  { id: 3, name: 'Lise Bakke', stars: 5, text: 'Anbefaler sterkt! Rask, ryddig og til god pris.', date: '2025-01-15', platform: 'Google', responded: false },
  { id: 4, name: 'Per Olsen', stars: 2, text: 'Ikke fornøyd med kommunikasjonen underveis. Resultat var ok.', date: '2025-01-05', platform: 'Google', responded: false },
  { id: 5, name: 'Anja Rud', stars: 5, text: 'Beste håndverkere vi har brukt! Kommer definitivt tilbake.', date: '2024-12-20', platform: 'Google', responded: true },
];

function StarRow({ stars, total = 5 }: { stars: number; total?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
      ))}
    </div>
  );
}

export default function ReputationPage() {
  const [selectedTpl, setSelectedTpl] = useState(REVIEW_TEMPLATES[0]);
  const [customMsg, setCustomMsg] = useState('');
  const [googleLink, setGoogleLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [replyText, setReplyText] = useState<{ [id: number]: string }>({});
  const [replying, setReplying] = useState<number | null>(null);

  const avgRating = reviews.reduce((a, r) => a + r.stars, 0) / reviews.length;
  const dist = [5, 4, 3, 2, 1].map(s => ({ stars: s, count: reviews.filter(r => r.stars === s).length }));
  const unresponded = reviews.filter(r => !r.responded && r.stars <= 3).length;

  const renderedMsg = (selectedTpl.msg + (customMsg ? '\n\n' + customMsg : ''))
    .replace('{link}', googleLink || 'https://g.page/r/YOURCODE')
    .replace('{navn}', '[kundenavn]');

  const copy = () => {
    navigator.clipboard.writeText(renderedMsg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const markResponded = (id: number) => {
    setReviews(rv => rv.map(r => r.id === id ? { ...r, responded: true } : r));
    setReplying(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-5 w-5 text-amber-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Omdømme</span>
          </div>
          <h1 className="text-3xl font-black text-white">Reputation Command Center</h1>
          <p className="text-slate-400 text-sm mt-1">Full kontroll på anmeldelser, NPS og omdømme — alt på ett sted</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
            <p className="text-4xl font-black text-amber-400">{avgRating.toFixed(1)}</p>
            <StarRow stars={Math.round(avgRating)} />
            <p className="text-xs text-slate-400 mt-1">Snittkarakter</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 text-center">
            <p className="text-4xl font-black text-white">{reviews.length}</p>
            <p className="text-xs text-slate-400 mt-2">Totale anmeldelser</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
            <p className="text-4xl font-black text-emerald-400">{reviews.filter(r => r.responded).length}</p>
            <p className="text-xs text-slate-400 mt-2">Besvart</p>
          </div>
          {unresponded > 0 ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center">
              <p className="text-4xl font-black text-red-400">{unresponded}</p>
              <p className="text-xs text-slate-400 mt-2">Negative ubesvart</p>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
              <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Ingen ubesvart negativt</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Rating distribution */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="font-bold text-white mb-4">Fordeling</h3>
            <div className="space-y-2">
              {dist.map(({ stars, count }) => (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex gap-0.5 w-20 flex-shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < stars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                    ))}
                  </div>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-2 rounded-full ${stars >= 4 ? 'bg-emerald-500' : stars === 3 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 w-4">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review request builder */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Send className="h-4 w-4 text-blue-400" /> Anmeldelsesforespørsel
            </h3>
            <input value={googleLink} onChange={e => setGoogleLink(e.target.value)}
              placeholder="Din Google-anmeldelseslenke…"
              className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-xl text-sm mb-3 focus:outline-none focus:border-blue-500" />
            <div className="flex gap-2 mb-3">
              {REVIEW_TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setSelectedTpl(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${selectedTpl.id === t.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400 hover:text-white'}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-300 whitespace-pre-line leading-relaxed min-h-28 mb-3 text-xs">
              {renderedMsg}
            </div>
            <button onClick={copy}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition ${copied ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
              {copied ? <><CheckCircle className="h-4 w-4" /> Kopiert!</> : <><Copy className="h-4 w-4" /> Kopier melding</>}
            </button>
          </div>
        </div>

        {/* Reviews list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Anmeldelser</h3>
            <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
              <RefreshCw className="h-3.5 w-3.5" /> Synkroniser
            </button>
          </div>
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className={`border rounded-2xl p-4 ${!r.responded && r.stars <= 3 ? 'bg-red-500/5 border-red-500/30' : 'bg-slate-800/60 border-slate-700/50'}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StarRow stars={r.stars} />
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${r.platform === 'Google' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>{r.platform}</span>
                      {!r.responded && r.stars <= 3 && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">Ubesvart</span>}
                    </div>
                    <p className="font-semibold text-white text-sm">{r.name}</p>
                    <p className="text-slate-400 text-sm">{r.text}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-500">{r.date}</p>
                    <div className="flex gap-1 mt-2 justify-end">
                      {r.responded ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle className="h-3.5 w-3.5" /> Besvart</span>
                      ) : (
                        <button onClick={() => setReplying(replying === r.id ? null : r.id)}
                          className="flex items-center gap-1 text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 px-2 py-1 rounded-lg transition">
                          <MessageSquare className="h-3 w-3" /> Svar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {replying === r.id && (
                  <div className="mt-3 border-t border-slate-700 pt-3">
                    <textarea value={replyText[r.id] ?? ''}
                      onChange={e => setReplyText(p => ({ ...p, [r.id]: e.target.value }))}
                      placeholder="Skriv svar til kunden..." rows={2}
                      className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-500 mb-2" />
                    <button onClick={() => markResponded(r.id)}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition">
                      <CheckCircle className="h-3.5 w-3.5" /> Marker som besvart
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
