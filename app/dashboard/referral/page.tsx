'use client';

import { useState } from 'react';
import {
  Gift, Users, Copy, Check, Share2, ArrowRight, Star, TrendingUp,
  Mail, MessageSquare, Link as LinkIcon, Trophy, ChevronRight
} from 'lucide-react';

const DEMO_REFERRALS = [
  { name: 'Kari Normann', email: 'kari@bygg.no', status: 'paid', joined: '2026-02-10', reward: 'Gratis maned' },
  { name: 'Erik Bakke', email: 'erik@takfirma.no', status: 'trial', joined: '2026-02-15', reward: 'Venter' },
  { name: 'Ingrid Hansen', email: 'ingrid@maling.no', status: 'registered', joined: '2026-02-19', reward: 'Venter' },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  registered: { label: 'Registrert', color: 'bg-slate-100 text-slate-600' },
  trial: { label: 'Prøver', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Betaler – du vant!', color: 'bg-emerald-100 text-emerald-700' },
};

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  const [tab, setTab] = useState<'link' | 'email'>('link');

  const referralLink = 'https://flowpilot.no/register?ref=DEMO123';

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSent(p => [...p, emailInput.trim()]);
      setEmailInput('');
    }
  };

  const paid = DEMO_REFERRALS.filter(r => r.status === 'paid').length;
  const pending = DEMO_REFERRALS.filter(r => r.status !== 'paid').length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Gift className="h-5 w-5 text-pink-500" />
          <h1 className="text-2xl font-bold text-slate-900">Vervprogram</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Inviter en bedriftsvenn til FlowPilot — dere begge får én gratis maned.
        </p>
      </div>

      {/* Hero banner */}
      <div className="rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-pink-200 text-sm font-medium mb-1">Fordel for begge parter</p>
            <h2 className="text-3xl font-extrabold">Du vervet → du sparer</h2>
            <p className="text-pink-100 mt-2 text-sm leading-relaxed">
              For hver venn som registrerer seg og aktiverer et abonnement,
              får dere begge <strong>én gratis maned</strong> lagt til kontoen.
            </p>
            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-2xl font-bold">{paid}</p>
                <p className="text-xs text-pink-200">Vellykkede verv</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{pending}</p>
                <p className="text-xs text-pink-200">Under behandling</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{paid}</p>
                <p className="text-xs text-pink-200">Gratis maneder opptjent</p>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 bg-white/15 rounded-2xl p-5 text-center min-w-32">
            <Trophy className="h-10 w-10 text-yellow-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">Topp vervar</p>
            <p className="text-xs text-pink-200 mt-0.5">3+ verv = bonusmaned</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Invitert totalt', value: String(DEMO_REFERRALS.length + sent.length) },
          { icon: TrendingUp, label: 'Konverteringsrate', value: `${Math.round((paid / (DEMO_REFERRALS.length || 1)) * 100)}%` },
          { icon: Gift, label: 'Gratis maneder', value: String(paid) },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5">
              <Icon className="h-5 w-5 text-slate-400 mb-2" />
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Invite section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Send invitasjon</h3>
        <div className="flex gap-2 border-b border-slate-100 mb-5">
          {[
            { key: 'link', label: 'Delbar lenke', icon: LinkIcon },
            { key: 'email', label: 'Send via e-post', icon: Mail },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
                  tab === t.key ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'link' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Del denne lenken med venner og bekjente som driver bedrift:</p>
            <div className="flex gap-2">
              <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-mono truncate">
                {referralLink}
              </div>
              <button
                onClick={copyLink}
                className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  copied ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? <><Check className="h-4 w-4" /> Kopiert</> : <><Copy className="h-4 w-4" /> Kopier</>}
              </button>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition">
                <MessageSquare className="h-4 w-4 text-green-500" /> Del via SMS
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition">
                <Mail className="h-4 w-4 text-blue-500" /> Del via e-post
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition">
                <Share2 className="h-4 w-4 text-purple-500" /> Del
              </button>
            </div>
          </div>
        )}

        {tab === 'email' && (
          <form onSubmit={sendInvite} className="space-y-3">
            <p className="text-sm text-slate-600">Vi sender en personlig invitasjon med ditt navn p vegne av deg:</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="venn@firma.no"
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
              <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
                Send
              </button>
            </div>
            {sent.length > 0 && (
              <div className="space-y-1">
                {sent.map(e => (
                  <div key={e} className="flex items-center gap-2 text-sm text-emerald-700">
                    <Check className="h-4 w-4" /> Invitasjon sendt til {e}
                  </div>
                ))}
              </div>
            )}
          </form>
        )}
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Slik fungerer det</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Del lenken', desc: 'Kopier din unike referral-lenke og del med venner som driver bedrift.' },
            { step: '2', title: 'De registrerer seg', desc: 'Vennen din starter sin 14-dagers gratis prøveperiode.' },
            { step: '3', title: 'Dere begge vinner', desc: 'Nar de oppgraderer til betalt, fa dere begge 1 maned gratis!' },
          ].map(s => (
            <div key={s.step} className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                {s.step}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{s.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral history */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">Dine verv</h3>
          <span className="text-xs text-slate-400">{DEMO_REFERRALS.length + sent.length} totalt</span>
        </div>
        <div className="divide-y divide-slate-50">
          {DEMO_REFERRALS.map(r => {
            const s = STATUS_MAP[r.status];
            return (
              <div key={r.email} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-sm font-bold">
                  {r.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.email} · Invitert {r.joined}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${s.color}`}>
                  {s.label}
                </span>
                <div className="text-xs text-slate-500 hidden sm:block">{r.reward}</div>
              </div>
            );
          })}
          {DEMO_REFERRALS.length === 0 && sent.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">
              Ingen verv enda. Del lenken din for å komme i gang!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
