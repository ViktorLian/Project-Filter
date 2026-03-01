'use client';

import { useState } from 'react';
import { DemoBanner } from '@/components/ui/DemoBanner';
import { Clock, Zap, AlertCircle, CheckCircle, TrendingDown, TrendingUp, Phone, MessageSquare, Mail, Target, Award, Users } from 'lucide-react';

interface LeadEvent {
  id: string;
  name: string;
  source: 'phone' | 'form' | 'chat';
  time: string;
  responseTime: number | null; // minutes, null = not yet responded
  responded: boolean;
  respondedBy?: string;
}

const EVENTS: LeadEvent[] = [
  { id: 'e1', name: 'Bjørn Hansen', source: 'phone', time: '09:12', responseTime: 2, responded: true, respondedBy: 'Lars (deg)' },
  { id: 'e2', name: 'Anna Larsen', source: 'form', time: '09:45', responseTime: 8, responded: true, respondedBy: 'Lars (deg)' },
  { id: 'e3', name: 'Per Kristiansen', source: 'phone', time: '10:03', responseTime: 47, responded: true, respondedBy: 'Lars (deg)' },
  { id: 'e4', name: 'Kari Olsen', source: 'form', time: '10:31', responseTime: 3, responded: true, respondedBy: 'Lars (deg)' },
  { id: 'e5', name: 'Thomas Berg', source: 'chat', time: '11:15', responseTime: 94, responded: true, respondedBy: 'Lars (deg)' },
  { id: 'e6', name: 'Lise Johansen', source: 'phone', time: '13:22', responseTime: null, responded: false },
  { id: 'e7', name: 'Morten Nilsen', source: 'form', time: '14:00', responseTime: 5, responded: true, respondedBy: 'Lars (deg)' },
  { id: 'e8', name: 'Silje Andersen', source: 'chat', time: '14:45', responseTime: null, responded: false },
];

const DAILY_DATA = [
  { day: 'Man', avg: 12, goal: 5 },
  { day: 'Tir', avg: 8, goal: 5 },
  { day: 'Ons', avg: 4, goal: 5 },
  { day: 'Tor', avg: 6, goal: 5 },
  { day: 'Fre', avg: 15, goal: 5 },
  { day: 'Lør', avg: 42, goal: 5 },
  { day: 'Søn', avg: 0, goal: 5 },
];

const sourceIcon = { phone: Phone, form: Mail, chat: MessageSquare };
const sourceLabel = { phone: 'Telefon', form: 'Skjema', chat: 'Chat' };
const sourceColor = { phone: 'text-blue-600 bg-blue-50 border-blue-200', form: 'text-purple-600 bg-purple-50 border-purple-200', chat: 'text-emerald-600 bg-emerald-50 border-emerald-200' };

function ScoreBadge({ minutes }: { minutes: number | null }) {
  if (minutes === null) return <span className="text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">Venter...</span>;
  if (minutes <= 5) return <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">✅ {minutes} min</span>;
  if (minutes <= 15) return <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">⚠ {minutes} min</span>;
  return <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">🔴 {minutes} min</span>;
}

export default function SpeedToLeadPage() {
  const responded = EVENTS.filter((e) => e.responseTime !== null);
  const avg = responded.length > 0 ? Math.round(responded.reduce((s, e) => s + (e.responseTime ?? 0), 0) / responded.length) : 0;
  const within5 = responded.filter((e) => (e.responseTime ?? 999) <= 5).length;
  const missed = EVENTS.filter((e) => !e.responded).length;
  const pct5 = responded.length > 0 ? Math.round(within5 / responded.length * 100) : 0;

  const getColor = (min: number) => {
    if (min <= 5) return 'bg-emerald-500';
    if (min <= 15) return 'bg-amber-400';
    return 'bg-red-500';
  };

  const maxBar = Math.max(...DAILY_DATA.map(d => d.avg), 60);

  return (
    <div className="max-w-5xl mx-auto">
      <DemoBanner feature="Speed to Lead" />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Speed to Lead</h1>
          <p className="text-sm text-slate-500">Raskere respons = flere kunder. Mål: under 5 minutter.</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/dashboard/workflows" className="flex items-center gap-1.5 text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-xl font-medium transition">
            <Zap className="h-4 w-4 text-amber-500" /> Sett opp auto-svar
          </a>
        </div>
      </div>

      {/* Hero metric */}
      <div className={`rounded-2xl p-6 mb-6 ${avg <= 5 ? 'bg-emerald-50 border border-emerald-200' : avg <= 15 ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Gjennomsnittlig responstid i dag</p>
            <div className="flex items-end gap-3">
              <p className={`text-5xl font-black ${avg <= 5 ? 'text-emerald-700' : avg <= 15 ? 'text-amber-700' : 'text-red-700'}`}>{avg} min</p>
              <div className="mb-1">
                {avg <= 5
                  ? <div className="flex items-center gap-1 text-emerald-700 font-semibold text-sm"><CheckCircle className="h-5 w-5" /> Du er i toppklassen! 🏆</div>
                  : avg <= 15
                    ? <div className="flex items-center gap-1 text-amber-700 font-semibold text-sm"><AlertCircle className="h-5 w-5" /> Bra, men kan bli bedre</div>
                    : <div className="flex items-center gap-1 text-red-700 font-semibold text-sm"><AlertCircle className="h-5 w-5" /> For tregt – du mister kunder 🚨</div>
                }
                <p className="text-sm text-slate-500 mt-0.5">Mål: under 5 minutter</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className={`h-24 w-24 rounded-full flex items-center justify-center border-4 ${avg <= 5 ? 'border-emerald-500 bg-emerald-100' : avg <= 15 ? 'border-amber-400 bg-amber-100' : 'border-red-400 bg-red-100'}`}>
              <div className="text-center">
                <p className={`text-2xl font-black ${avg <= 5 ? 'text-emerald-700' : avg <= 15 ? 'text-amber-700' : 'text-red-700'}`}>{pct5}%</p>
                <p className="text-xs text-slate-600">under 5 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Leads i dag', value: EVENTS.length.toString(), icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Under 5 min', value: within5.toString(), icon: Zap, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Ikke besvart', value: missed.toString(), icon: AlertCircle, color: missed > 0 ? 'text-red-600 bg-red-50' : 'text-slate-500 bg-slate-100' },
          { label: 'Beste respons', value: `${Math.min(...responded.map(e => e.responseTime ?? 9999))} min`, icon: Award, color: 'text-purple-600 bg-purple-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}><Icon className="h-4 w-4" /></div>
              <p className="text-xl font-bold text-slate-900 mb-0.5">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Bar chart */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Responstid per dag</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="h-2 w-4 bg-blue-500 rounded-full inline-block" /> Faktisk</span>
              <span className="flex items-center gap-1"><span className="h-2 w-4 bg-emerald-300 rounded-full inline-block" /> Mål (5 min)</span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-32">
            {DAILY_DATA.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-500">{d.avg > 0 ? `${d.avg}m` : '—'}</span>
                <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                  <div
                    className={`w-full rounded-t-lg transition-all ${d.avg === 0 ? 'bg-slate-100' : getColor(d.avg)}`}
                    style={{ height: d.avg === 0 ? '4px' : `${Math.min(d.avg / maxBar * 80, 80)}px` }}
                  />
                </div>
                <span className="text-xs text-slate-400">{d.day}</span>
              </div>
            ))}
          </div>
          {/* Goal line indicator */}
          <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
            <Target className="h-3.5 w-3.5" />
            Mål: svar på alle leads innen 5 minutter
          </div>
        </div>

        {/* Unanswered */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Ikke besvart</h3>
          {missed === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm text-emerald-700 font-medium">Alle besvart! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {EVENTS.filter((e) => !e.responded).map((e) => {
                const Icon = sourceIcon[e.source];
                return (
                  <div key={e.id} className="border border-red-200 bg-red-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-900">{e.name}</span>
                      <span className="text-xs text-slate-400">{e.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${sourceColor[e.source]}`}>
                        <Icon className="h-3 w-3" />{sourceLabel[e.source]}
                      </span>
                      <button className="ml-auto text-xs bg-white text-red-700 border border-red-200 hover:bg-red-100 px-2 py-0.5 rounded-lg font-medium transition">
                        Svar nå
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lead log */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Leads i dag</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Lead</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Kilde</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Tidspunkt</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Responstid</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Besvart av</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {EVENTS.map((e) => {
              const Icon = sourceIcon[e.source];
              return (
                <tr key={e.id} className={`hover:bg-slate-50 transition ${!e.responded ? 'bg-red-50/40' : ''}`}>
                  <td className="px-4 py-3 font-medium text-slate-900">{e.name}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 text-xs w-fit px-2 py-0.5 rounded-full border ${sourceColor[e.source]}`}>
                      <Icon className="h-3 w-3" />{sourceLabel[e.source]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{e.time}</td>
                  <td className="px-4 py-3"><ScoreBadge minutes={e.responseTime} /></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{e.respondedBy ?? <span className="text-red-500 font-medium">— Ikke besvart</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Industry benchmark */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <TrendingDown className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">Visste du?</p>
            <p className="text-sm text-blue-700 mt-0.5">Bedrifter som svarer innen 5 minutter har <span className="font-bold">9x høyere sjanse</span> for å konvertere et lead sammenlignet med de som venter en time. Sett opp automatisk SMS-svar i Automatiseringer for å få null responstid.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
