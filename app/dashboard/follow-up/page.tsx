'use client';

import { useEffect, useState } from 'react';
import { Bell, Send, Clock, User, CheckCircle, RefreshCw, Zap, Mail } from 'lucide-react';

type FollowUp = {
  id: string;
  lead_name: string;
  lead_email?: string;
  last_contact: string;
  days_since: number;
  score?: number;
  suggested_action: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'done' | 'snoozed';
};

const PRIORITY_CFG = {
  high:   { label: 'Hoy prioritet',    color: 'bg-red-100 text-red-700 border-red-200',       dot: 'bg-red-500' },
  medium: { label: 'Medium prioritet', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  low:    { label: 'Lav prioritet',    color: 'bg-slate-100 text-slate-600 border-slate-200',  dot: 'bg-slate-400' },
};

export default function FollowUpPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [tab, setTab] = useState<'pending' | 'done'>('pending');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/follow-up');
      const json = await res.json();
      setFollowUps(json.followUps || []);
    } catch { setFollowUps([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const sendFollowUp = async (id: string, email: string, name: string) => {
    setSending(id);
    try {
      await fetch('/api/follow-up/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, email, name }),
      });
      load();
    } finally { setSending(null); }
  };

  const markDone = async (id: string) => {
    await fetch(`/api/follow-up/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });
    load();
  };

  const filtered = followUps.filter(f => tab === 'pending' ? f.status === 'pending' : f.status === 'done');
  const high = followUps.filter(f => f.priority === 'high' && f.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Smart Oppfolging</h1>
          <p className="text-slate-500 text-sm mt-0.5">AI-drevet system for optimal oppfolgingstiming</p>
        </div>
        <div className="flex items-center gap-2">
          {high > 0 && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
              <Bell className="h-4 w-4" />
              {high} hoy prioritet
            </span>
          )}
          <button onClick={load} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['pending', 'done'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
              tab === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}>
            {t === 'pending' ? 'Venter' : 'Utfort'}
            <span className="ml-2 text-xs opacity-75">({followUps.filter(f => t === 'pending' ? f.status === 'pending' : f.status === 'done').length})</span>
          </button>
        ))}
      </div>

      {/* AI Banner */}
      {tab === 'pending' && (
        <div className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white flex items-center gap-3">
          <Zap className="h-8 w-8 text-purple-200 flex-shrink-0" />
          <div>
            <p className="font-semibold">AI analyserer optimalt tidspunkt</p>
            <p className="text-sm text-purple-100 mt-0.5">Systemet beregner nar hver lead er mest mottagelig basert pa atferd, score og tid siden siste kontakt</p>
          </div>
        </div>
      )}

      {/* Follow-up list */}
      <div className="space-y-3">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="h-4 w-48 bg-slate-100 rounded animate-pulse mb-2" />
              <div className="h-3 w-64 bg-slate-50 rounded animate-pulse" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <CheckCircle className="h-12 w-12 text-emerald-200 mx-auto mb-3" />
            <p className="font-semibold text-slate-600">
              {tab === 'pending' ? 'Ingen oppfolginger venter' : 'Ingen fullforte oppfolginger'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {tab === 'pending' ? 'Systemet analyserer leads automatisk' : 'Utforte oppfolginger vises her'}
            </p>
          </div>
        ) : (
          filtered.map(f => {
            const pc = PRIORITY_CFG[f.priority];
            return (
              <div key={f.id} className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${pc.dot}`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-900">{f.lead_name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${pc.color}`}>
                          {pc.label}
                        </span>
                      </div>
                      {f.lead_email && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mb-2">
                          <Mail className="h-3 w-3" />{f.lead_email}
                        </p>
                      )}
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        {f.days_since} dager siden siste kontakt
                      </p>
                      <p className="text-sm text-blue-700 font-medium mt-2 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        {f.suggested_action}
                      </p>
                    </div>
                  </div>
                  {tab === 'pending' && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {f.lead_email && (
                        <button
                          onClick={() => sendFollowUp(f.id, f.lead_email!, f.lead_name)}
                          disabled={sending === f.id}
                          className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                        >
                          {sending === f.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                          Send e-post
                        </button>
                      )}
                      <button onClick={() => markDone(f.id)}
                        className="flex items-center gap-1.5 text-xs border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 font-medium">
                        <CheckCircle className="h-3 w-3" /> Merk utfort
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
