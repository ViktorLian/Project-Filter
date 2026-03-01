'use client';

import { useState } from 'react';
import {
  Plus, Copy, ExternalLink, TrendingUp, Users, DollarSign,
  ChevronRight, Edit2, Search, ArrowUpRight, CheckCircle,
  Clock, XCircle, MoreHorizontal, Link, Share2, Gift
} from 'lucide-react';

interface Affiliate {
  id: string;
  name: string;
  email: string;
  code: string;
  commissionPct: number;
  totalSales: number;
  totalRevenue: number;
  pendingPayout: number;
  paidOut: number;
  clicks: number;
  joinedAt: string;
  status: 'active' | 'pending' | 'inactive';
}

const AFFILIATES: Affiliate[] = [
  { id: 'a1', name: 'Martin Vold', email: 'martin@vold.no', code: 'MARTIN20', commissionPct: 20, totalSales: 14, totalRevenue: 189000, pendingPayout: 4200, paidOut: 33600, clicks: 312, joinedAt: 'Okt 2025', status: 'active' },
  { id: 'a2', name: 'Sara Holm', email: 'sara@holm.no', code: 'SARA15', commissionPct: 15, totalSales: 9, totalRevenue: 92000, pendingPayout: 1800, paidOut: 12000, clicks: 198, joinedAt: 'Nov 2025', status: 'active' },
  { id: 'a3', name: 'Kjell Bakke', email: 'kjell@bakke.no', code: 'KJELL20', commissionPct: 20, totalSales: 3, totalRevenue: 28500, pendingPayout: 950, paidOut: 4750, clicks: 87, joinedAt: 'Des 2025', status: 'active' },
  { id: 'a4', name: 'Ingrid Dahl', email: 'ingrid@dahl.no', code: 'INGRID10', commissionPct: 10, totalSales: 1, totalRevenue: 9900, pendingPayout: 0, paidOut: 990, clicks: 45, joinedAt: 'Jan 2026', status: 'pending' },
  { id: 'a5', name: 'Ole Stølen', email: 'ole@stolen.no', code: 'OLE15', commissionPct: 15, totalSales: 0, totalRevenue: 0, pendingPayout: 0, paidOut: 0, clicks: 12, joinedAt: 'Jan 2026', status: 'inactive' },
];

const statusColors = {
  active: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  inactive: 'text-slate-500 bg-slate-100 border-slate-200',
};
const statusLabels = { active: '● Aktiv', pending: '⏳ Venter', inactive: '○ Inaktiv' };

export default function AffiliatesPage() {
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = AFFILIATES.filter(
    (a) => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = AFFILIATES.reduce((s, a) => s + a.totalRevenue, 0);
  const totalSales = AFFILIATES.reduce((s, a) => s + a.totalSales, 0);
  const totalPending = AFFILIATES.reduce((s, a) => s + a.pendingPayout, 0);
  const activeCount = AFFILIATES.filter((a) => a.status === 'active').length;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(`https://flowpilot.no/r/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Affiliate-program</h1>
          <p className="text-sm text-slate-500">Få andre til å selge FlowPilot for deg</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
        >
          <Plus className="h-4 w-4" /> Ny partner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Aktive partnere', value: activeCount.toString(), icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total omsetting', value: `kr ${(totalRevenue / 1000).toFixed(0)}k`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Totale salg', value: totalSales.toString(), icon: Gift, color: 'text-purple-600 bg-purple-50' },
          { label: 'Utestående utbetaling', value: `kr ${totalPending.toLocaleString('nb')}`, icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xl font-bold text-slate-900 mb-0.5">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Slik fungerer affiliate-programmet</h3>
            <p className="text-sm text-slate-600">Partnere får en unik lenke. Når noen registrerer seg via lenken og blir betalende kunde, utbetales provisjon automatisk.</p>
          </div>
          <div className="flex items-center gap-4 ml-6 flex-shrink-0 text-center">
            {['Partner deler lenke', 'Ny kunde registrerer seg', 'Automatisk provisjon'].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="text-center">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mx-auto mb-1">{i + 1}</div>
                  <p className="text-xs text-slate-700 w-20">{s}</p>
                </div>
                {i < 2 && <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Søk i partnere..." className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Partner</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Lenke</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Provisjon</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Salg</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Inntekt</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Utestående</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-700">{a.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{a.name}</p>
                      <p className="text-xs text-slate-400">{a.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <code className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">{a.code}</code>
                    <button
                      onClick={() => copyCode(a.code)}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                      title="Kopier lenke"
                    >
                      {copied === a.code ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{a.clicks} klikk</p>
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-slate-900">{a.commissionPct}%</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-slate-900">{a.totalSales}</span>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  kr {a.totalRevenue.toLocaleString('nb')}
                </td>
                <td className="px-4 py-3">
                  {a.pendingPayout > 0
                    ? <span className="text-amber-700 font-semibold">kr {a.pendingPayout.toLocaleString('nb')}</span>
                    : <span className="text-slate-400">—</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColors[a.status]}`}>{statusLabels[a.status]}</span>
                </td>
                <td className="px-4 py-3">
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payout section */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Utbetaling</h3>
            <p className="text-sm text-slate-500">Totalt utestående: <span className="font-semibold text-amber-600">kr {totalPending.toLocaleString('nb')}</span></p>
          </div>
          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
            <DollarSign className="h-4 w-4" /> Betal ut alle
          </button>
        </div>
      </div>
    </div>
  );
}
