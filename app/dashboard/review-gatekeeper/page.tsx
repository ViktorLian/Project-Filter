'use client';

import { useState } from 'react';
import {
  Star, Shield, TrendingUp, ExternalLink, Settings, Send,
  AlertCircle, CheckCircle, BarChart2, MessageSquare, Mail, Phone,
  ChevronRight, Edit2, ToggleLeft, ToggleRight, Users, Filter
} from 'lucide-react';

interface ReviewRequest {
  id: string;
  name: string;
  via: 'sms' | 'email';
  sentAt: string;
  internalScore: number | null;
  redirected: boolean;
  feedback?: string;
  status: 'sent' | 'responded' | 'pending';
}

const REQUESTS: ReviewRequest[] = [
  { id: 'r1', name: 'Bjørn Hansen', via: 'sms', sentAt: '20. jan, 10:30', internalScore: 5, redirected: true, status: 'responded' },
  { id: 'r2', name: 'Anna Larsen', via: 'email', sentAt: '20. jan, 09:00', internalScore: 4, redirected: true, status: 'responded' },
  { id: 'r3', name: 'Per Kristiansen', via: 'sms', sentAt: '19. jan, 14:15', internalScore: 2, redirected: false, feedback: 'Håndverkeren var 45 min forsinket og prisen ble høyere enn tilbudet', status: 'responded' },
  { id: 'r4', name: 'Kari Olsen', via: 'email', sentAt: '19. jan, 11:00', internalScore: 5, redirected: true, status: 'responded' },
  { id: 'r5', name: 'Thomas Berg', via: 'sms', sentAt: '18. jan, 16:00', internalScore: null, redirected: false, status: 'sent' },
  { id: 'r6', name: 'Lise Johansen', via: 'email', sentAt: '18. jan, 09:30', internalScore: 3, redirected: false, feedback: 'Jobben tok lengre tid enn forventet, men resultatet var ok', status: 'responded' },
  { id: 'r7', name: 'Morten Nilsen', via: 'sms', sentAt: '17. jan, 12:00', internalScore: 5, redirected: true, status: 'responded' },
  { id: 'r8', name: 'Silje Andersen', via: 'email', sentAt: '17. jan, 10:00', internalScore: null, redirected: false, status: 'pending' },
];

const StarRow = ({ score }: { score: number | null }) => {
  if (!score) return <span className="text-xs text-slate-400">—</span>;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= score ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
      ))}
    </div>
  );
};

export default function ReviewGatekeeperPage() {
  const [threshold, setThreshold] = useState(4);
  const [activeView, setActiveView] = useState<'dashboard' | 'requests' | 'templates'>('dashboard');

  const responded = REQUESTS.filter((r) => r.internalScore !== null);
  const avg = responded.length > 0 ? responded.reduce((s, r) => s + (r.internalScore ?? 0), 0) / responded.length : 0;
  const redirected = REQUESTS.filter((r) => r.redirected).length;
  const blocked = REQUESTS.filter((r) => r.internalScore !== null && r.internalScore < threshold && !r.redirected).length;
  const negativeFeedback = REQUESTS.filter((r) => r.feedback);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Review Gatekeeper</h1>
          </div>
          <p className="text-sm text-slate-500">Filtrer negative anmeldelser før de treffer Google</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('templates')}
            className="flex items-center gap-1.5 text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-xl font-medium transition"
          >
            <Edit2 className="h-4 w-4" /> Maler
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
            <Send className="h-4 w-4" /> Send forespørsel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {(['dashboard', 'requests', 'templates'] as const).map((t) => (
          <button key={t} onClick={() => setActiveView(t)}
            className={`text-sm font-medium px-4 py-1.5 rounded-lg transition ${activeView === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t === 'dashboard' ? '📊 Oversikt' : t === 'requests' ? '📋 Forespørsler' : '✉️ Maler'}
          </button>
        ))}
      </div>

      {activeView === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Sendt totalt', value: REQUESTS.length.toString(), icon: '📤', color: 'bg-blue-50 text-blue-700' },
              { label: 'Google-videresend', value: `${redirected} (${Math.round(redirected / REQUESTS.length * 100)}%)`, icon: '✅', color: 'bg-emerald-50 text-emerald-700' },
              { label: 'Blokkert (intern)', value: blocked.toString(), icon: '🛡️', color: 'bg-amber-50 text-amber-700' },
              { label: 'Snittkarakter', value: `${avg.toFixed(1)} ⭐`, icon: '⭐', color: 'bg-yellow-50 text-yellow-700' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className={`text-xl font-bold mb-0.5 ${s.color.split(' ')[1]}`}>{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Slik fungerer det</h3>
            <div className="flex items-start gap-4">
              {[
                { step: '1', title: 'Jobb fullført', desc: 'Kunden mottar automatisk SMS/e-post etter ferdig jobb', icon: CheckCircle, color: 'bg-blue-600' },
                { step: '2', title: 'Intern vurdering', desc: 'Kunden gir en privat stjerne-vurdering (1–5)', icon: Star, color: 'bg-purple-600' },
                { step: '3', title: 'Smart filtrering', desc: `${threshold}+ stjerner → Google. Under ${threshold} → privat tilbakemelding til deg`, icon: Shield, color: 'bg-amber-600' },
                { step: '4', title: 'God omdømme', desc: 'Google-siden fylles kun med positive anmeldelser', icon: TrendingUp, color: 'bg-emerald-600' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex-1">
                    <div className={`h-9 w-9 rounded-full ${item.color} flex items-center justify-center mb-2`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-0.5">{item.title}</p>
                    <p className="text-xs text-slate-600">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Threshold setting */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Videresendingsgrense</h3>
                <p className="text-sm text-slate-500">Kunder med {threshold}+ stjerner videresendes til Google</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} onClick={() => setThreshold(i)} className={`h-8 w-8 rounded-lg flex items-center justify-center transition ${i <= threshold ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      <Star className="h-4 w-4 fill-current" />
                    </button>
                  ))}
                </div>
                <span className="text-sm text-slate-500">{threshold}/5 er grense</span>
              </div>
            </div>
          </div>

          {/* Negative feedback to handle */}
          {negativeFeedback.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Intern tilbakemelding å håndtere</h3>
              </div>
              <div className="space-y-3">
                {negativeFeedback.map((r) => (
                  <div key={r.id} className="border border-amber-200 bg-amber-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{r.name}</span>
                        <StarRow score={r.internalScore} />
                      </div>
                      <span className="text-xs text-slate-400">{r.sentAt}</span>
                    </div>
                    <p className="text-sm text-slate-700 mb-3 italic">"{r.feedback}"</p>
                    <div className="flex gap-2">
                      <button className="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition">Ring opp</button>
                      <button className="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition">Send unnskyldning</button>
                      <button className="text-xs bg-white border border-slate-200 hover:bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium transition">Be om ny sjanse</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeView === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Kunde</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Via</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Sendt</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Intern vurdering</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Videresendt</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {REQUESTS.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-900">{r.name}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      {r.via === 'sms' ? <Phone className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                      {r.via.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{r.sentAt}</td>
                  <td className="px-4 py-3"><StarRow score={r.internalScore} /></td>
                  <td className="px-4 py-3">
                    {r.redirected
                      ? <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Ja – Google</span>
                      : <span className="text-xs text-slate-400">Nei</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${r.status === 'responded' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : r.status === 'sent' ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-slate-500 bg-slate-100 border-slate-200'}`}>
                      {r.status === 'responded' ? '✓ Besvart' : r.status === 'sent' ? '⏳ Venter' : '📤 Sendt'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeView === 'templates' && (
        <div className="space-y-4">
          {[
            { name: 'Anmeldelsesforespørsel – SMS (standard)', channel: 'SMS', content: 'Hei [navn]! Takk for at du valgte oss 😊 Kan du ta 30 sek og gi oss en rask tilbakemelding? [lenke] Vi setter stor pris på det!' },
            { name: 'Anmeldelsesforespørsel – E-post', channel: 'E-post', content: 'Hei [navn], takk for at du brukte oss nylig! Jobben er ferdig og vi håper du er fornøyd. Vi vil gjerne høre din mening – ta en rask stjernevurdering her: [lenke]' },
            { name: 'Google-videresendings-SMS', channel: 'SMS', content: 'Tusen takk for 5 stjerner! 🙏 Vil du dele opplevelsen på Google? Det hjelper andre finne oss: [google-lenke]' },
            { name: 'Intern tilbakemelding – oppfølging', channel: 'SMS', content: 'Hei [navn], vi ser du hadde noen innspill på jobben vi gjorde 🙏 Vi tar dette på alvor og ønsker å rette opp. Kan vi ringe deg?' },
          ].map((t, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{t.channel}</span>
              </div>
              <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-3">"{t.content}"</p>
              <button className="mt-2 text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
                <Edit2 className="h-3.5 w-3.5" /> Rediger mal
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
