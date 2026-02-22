'use client';

import { useState } from 'react';
import { Megaphone, Mail, MessageSquare, Plus, Play, Pause, BarChart2, Users, X } from 'lucide-react';

type Campaign = {
  id: string; name: string; type: 'email' | 'sms'; status: 'aktiv' | 'pause' | 'utkast';
  sent: number; opened: number; leads: number; created: string;
};

const DEMO: Campaign[] = [
  { id: '1', name: 'Januar-tilbud 2025', type: 'email', status: 'aktiv', sent: 142, opened: 68, leads: 12, created: '2025-01-01' },
  { id: '2', name: 'SMS oppfolging uke 3', type: 'sms', status: 'pause', sent: 48, opened: 41, leads: 5, created: '2025-01-15' },
  { id: '3', name: 'Vintertilbud flislegging', type: 'email', status: 'utkast', sent: 0, opened: 0, leads: 0, created: '2025-01-19' },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEMO);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'email' as 'email' | 'sms', message: '' });

  function create() {
    if (!form.name.trim()) return;
    setCampaigns(prev => [{
      id: Date.now().toString(), name: form.name, type: form.type,
      status: 'utkast', sent: 0, opened: 0, leads: 0, created: new Date().toISOString().split('T')[0],
    }, ...prev]);
    setForm({ name: '', type: 'email', message: '' });
    setShowNew(false);
  }

  function toggleStatus(id: string) {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'aktiv' ? 'pause' : 'aktiv' } : c));
  }

  const statusColor = { aktiv: 'bg-emerald-100 text-emerald-700', pause: 'bg-amber-100 text-amber-700', utkast: 'bg-slate-100 text-slate-600' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kampanjer</h1>
          <p className="text-slate-500 text-sm mt-0.5">Administrer e-post- og SMS-kampanjer mot leads og kunder</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />Ny kampanje
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Totalt sendt', val: campaigns.reduce((s, c) => s + c.sent, 0), icon: Mail },
          { label: 'Total apningsrate', val: `${campaigns.length ? Math.round(campaigns.reduce((s, c) => s + (c.sent ? c.opened / c.sent : 0), 0) / campaigns.length * 100) : 0}%`, icon: BarChart2 },
          { label: 'Leads generert', val: campaigns.reduce((s, c) => s + c.leads, 0), icon: Users },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
              <s.icon className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-slate-900">{s.val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="divide-y divide-slate-100">
          {campaigns.map(c => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                {c.type === 'email' ? <Mail className="h-5 w-5 text-blue-600" /> : <MessageSquare className="h-5 w-5 text-emerald-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{c.name}</p>
                <p className="text-xs text-slate-500">{c.created} · {c.sent} sendt · {c.opened} apnet · {c.leads} leads</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[c.status]}`}>{c.status}</span>
              {c.status !== 'utkast' && (
                <button onClick={() => toggleStatus(c.id)} className="text-slate-400 hover:text-slate-700 transition-colors">
                  {c.status === 'aktiv' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* New campaign modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Ny kampanje</h3>
              <button onClick={() => setShowNew(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Kampanjenavn</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Eks: Februar-tilbud 2025"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as any }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="email">E-post</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Melding</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={4}
                  placeholder="Skriv meldingen her..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowNew(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Avbryt</button>
              <button onClick={create} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">Opprett</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
