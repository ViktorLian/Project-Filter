'use client';

import { useState } from 'react';
import { Bell, Plus, Calendar, Building2, CheckCircle, AlertTriangle, Clock, Trash2, RefreshCw } from 'lucide-react';

type Contract = {
  id: string;
  name: string;
  customer: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expiring' | 'expired';
  reminderSent: boolean;
};

const DEMO: Contract[] = [
  { id: '1', name: 'Vedlikeholdsavtale – Bygg AS', customer: 'Bygg AS', type: 'Vedlikehold', startDate: '2025-01-01', endDate: '2026-03-15', status: 'expiring', reminderSent: false },
  { id: '2', name: 'Serviceavtale – Nordic Hus', customer: 'Nordic Hus', type: 'Service', startDate: '2024-06-01', endDate: '2026-06-01', status: 'active', reminderSent: true },
  { id: '3', name: 'Årskontrakt – Larsen Eiendom', customer: 'Larsen Eiendom', type: 'Årskontrakt', startDate: '2024-01-01', endDate: '2025-12-31', status: 'expired', reminderSent: true },
  { id: '4', name: 'Rammeavtale – Johansen & Sønner', customer: 'Johansen & Sønner', type: 'Rammeavtale', startDate: '2025-03-01', endDate: '2026-04-01', status: 'expiring', reminderSent: false },
];

const STATUS_STYLES: Record<Contract['status'], { bg: string; text: string; icon: React.ElementType; label: string }> = {
  active: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle, label: 'Aktiv' },
  expiring: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: AlertTriangle, label: 'Utloper snart' },
  expired: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: Clock, label: 'Utgatt' },
};

export default function ContractRemindersPage() {
  const [contracts, setContracts] = useState<Contract[]>(DEMO);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState<'all' | Contract['status']>('all');

  const getDaysLeft = (end: string) => {
    const diff = Math.ceil((new Date(end).getTime() - Date.now()) / 86400000);
    return diff;
  };

  const sendReminder = (id: string) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, reminderSent: true } : c));
  };

  const filtered = filter === 'all' ? contracts : contracts.filter(c => c.status === filter);
  const expiring = contracts.filter(c => c.status === 'expiring').length;
  const expired = contracts.filter(c => c.status === 'expired').length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kontraktpåminnelser</h1>
          <p className="text-slate-500 text-sm mt-0.5">Hold oversikt over kontrakter som utloper – aldri gå glipp av fornyelse</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" /> Ny kontrakt
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-white border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Totalt</p>
          <p className="text-3xl font-bold text-slate-900">{contracts.length}</p>
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <p className="text-xs text-amber-600 font-medium uppercase tracking-wide mb-1">Utloper snart</p>
          <p className="text-3xl font-bold text-amber-700">{expiring}</p>
        </div>
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
          <p className="text-xs text-red-600 font-medium uppercase tracking-wide mb-1">Utgatt</p>
          <p className="text-3xl font-bold text-red-700">{expired}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'active', 'expiring', 'expired'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}
          >
            {f === 'all' ? 'Alle' : STATUS_STYLES[f].label}
          </button>
        ))}
      </div>

      {/* Contract list */}
      <div className="space-y-3">
        {filtered.map(contract => {
          const days = getDaysLeft(contract.endDate);
          const s = STATUS_STYLES[contract.status];
          const Icon = s.icon;
          return (
            <div key={contract.id} className={`rounded-xl border p-5 bg-white ${contract.status === 'expiring' ? 'border-amber-200' : contract.status === 'expired' ? 'border-red-200' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{contract.name}</h3>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${s.bg} ${s.text} border`}>
                      <Icon className="h-3 w-3" /> {s.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{contract.customer}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{contract.startDate} – {contract.endDate}</span>
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{contract.type}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-sm font-bold ${days < 0 ? 'text-red-600' : days < 30 ? 'text-amber-600' : 'text-slate-600'}`}>
                    {days < 0 ? `Utgatt ${Math.abs(days)} dager siden` : `${days} dager igjen`}
                  </span>
                  {!contract.reminderSent ? (
                    <button
                      onClick={() => sendReminder(contract.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                    >
                      <Bell className="h-3 w-3" /> Send påminnelse
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                      <CheckCircle className="h-3.5 w-3.5" /> Påminnelse sendt
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowNew(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Ny kontrakt</h2>
            <form className="space-y-3" onSubmit={e => { e.preventDefault(); setShowNew(false); }}>
              <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Kontraktnavn" required />
              <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Kundenavn" required />
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option>Vedlikehold</option><option>Service</option><option>Årskontrakt</option><option>Rammeavtale</option><option>Annet</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-slate-500">Startdato</label><input type="date" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
                <div><label className="text-xs text-slate-500">Sluttdato</label><input type="date" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowNew(false)} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50">Avbryt</button>
                <button type="submit" className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700">Lagre kontrakt</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
