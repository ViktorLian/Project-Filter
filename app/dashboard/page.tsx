'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, Users, FileText, DollarSign, AlertCircle,
  ArrowUpRight, Bot, Bell, Briefcase, Star, Activity, ChevronRight, Zap
} from 'lucide-react';

type Lead = { id: string; created_at: string; status?: string; name?: string };
type Invoice = { id: string; amount: number; status: string; due_date?: string; customer?: { name: string } };

const quickLinks = [
  { label: 'Ny Lead', href: '/dashboard/leads', icon: FileText, color: 'bg-blue-500' },
  { label: 'Ny Faktura', href: '/dashboard/invoices', icon: DollarSign, color: 'bg-emerald-500' },
  { label: 'AI Assistent', href: '/dashboard/ai-assistant', icon: Bot, color: 'bg-purple-500' },
  { label: 'Kalender', href: '/dashboard/calendar', icon: Bell, color: 'bg-orange-500' },
];

export default function DashboardOverview() {
  const [health, setHealth] = useState<'GREEN' | 'YELLOW' | 'RED'>('GREEN');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/leads').then((r) => r.json()).catch(() => ({ leads: [] })),
      fetch('/api/cashflow/health').then((r) => r.json()).catch(() => ({ health: 'GREEN', income: 0, expense: 0 })),
      fetch('/api/invoices').then((r) => r.json()).catch(() => ({ invoices: [] })),
    ]).then(([l, c, i]) => {
      setLeads(l.leads || []);
      setInvoices(i.invoices || []);
      setHealth(c.health || 'GREEN');
      setIncome(c.income || 0);
      setExpense(c.expense || 0);
      setLoading(false);
    });
  }, []);

  const outstanding = invoices.filter((i) => i.status !== 'PAID');
  const outstandingAmount = outstanding.reduce((s, i) => s + (i.amount || 0), 0);
  const netProfit = income - expense;
  const newLeads = leads.filter((l) => {
    const d = new Date(l.created_at);
    const now = new Date();
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  });

  const healthConfig = {
    GREEN: { label: 'God økonomi', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: TrendingUp },
    YELLOW: { label: 'Sjekk økonomi', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: AlertCircle },
    RED: { label: 'Kritisk økonomi', color: 'text-red-600 bg-red-50 border-red-200', icon: TrendingDown },
  };
  const hc = healthConfig[health];
  const HealthIcon = hc.icon;

  const stats = [
    {
      label: 'Leads (30d)', value: leads.length, sub: `+${newLeads.length} denne uken`,
      icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', trend: newLeads.length > 0,
      href: '/dashboard/leads',
    },
    {
      label: 'Inntekter', value: `${income.toLocaleString('nb-NO')} kr`, sub: 'Denne måneden',
      icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: income > expense,
      href: '/dashboard/cashflow',
    },
    {
      label: 'Netto resultat', value: `${netProfit.toLocaleString('nb-NO')} kr`, sub: 'Inntekt minus utgifter',
      icon: Activity, color: netProfit >= 0 ? 'text-emerald-600' : 'text-red-600',
      bg: netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50', trend: netProfit >= 0,
      href: '/dashboard/cashflow',
    },
    {
      label: 'Ubetalte fakturaer', value: `${outstandingAmount.toLocaleString('nb-NO')} kr`,
      sub: `${outstanding.length} fakturaer venter`,
      icon: DollarSign, color: outstanding.length > 0 ? 'text-orange-600' : 'text-slate-600',
      bg: outstanding.length > 0 ? 'bg-orange-50' : 'bg-slate-50', trend: outstanding.length === 0,
      href: '/dashboard/invoices',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Oversikt</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('nb-NO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${hc.color}`}>
          <HealthIcon className="h-4 w-4" />
          {hc.label}
        </span>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickLinks.map(({ label, href, icon: Icon, color }) => (
          <Link key={href} href={href}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:shadow-md hover:border-slate-300 transition-all group"
          >
            <div className={`h-9 w-9 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
            <ChevronRight className="h-4 w-4 text-slate-400 ml-auto group-hover:text-slate-600" />
          </Link>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}
            className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-lg hover:border-slate-300 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
            {loading ? (
              <div className="h-8 w-24 bg-slate-100 rounded animate-pulse mb-1" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">{value}</p>
            )}
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Two columns: Recent Leads + Outstanding Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent leads */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <h2 className="font-semibold text-slate-800">Siste leads</h2>
            </div>
            <Link href="/dashboard/leads" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Se alle <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                    <div className="h-2 w-20 bg-slate-50 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : leads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Ingen leads ennå</div>
            ) : (
              leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-blue-600">
                      {(lead.name || 'L').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{lead.name || `Lead #${lead.id.slice(0, 6)}`}</p>
                    <p className="text-xs text-slate-400">{new Date(lead.created_at).toLocaleDateString('nb-NO')}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    lead.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                    lead.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {lead.status === 'ACCEPTED' ? 'Akseptert' : lead.status === 'REJECTED' ? 'Avvist' : 'Ny'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Unpaid invoices */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-500" />
              <h2 className="font-semibold text-slate-800">Ubetalte fakturaer</h2>
            </div>
            <Link href="/dashboard/invoices" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Se alle <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="h-6 w-24 bg-slate-100 rounded animate-pulse" />
                  <div className="h-6 w-16 bg-slate-50 rounded animate-pulse ml-auto" />
                </div>
              ))
            ) : outstanding.length === 0 ? (
              <div className="p-8 text-center">
                <Star className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Alle fakturaer er betalt</p>
              </div>
            ) : (
              outstanding.slice(0, 5).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{inv.customer?.name || 'Ukjent kunde'}</p>
                    <p className="text-xs text-slate-400">
                      Forfall: {inv.due_date ? new Date(inv.due_date).toLocaleDateString('nb-NO') : '—'}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-orange-600">
                    {(inv.amount || 0).toLocaleString('nb-NO')} kr
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI tip banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold">AI Salgsassistent klar</p>
            <p className="text-sm text-blue-100">Spar 1-2 timer daglig med automatisk CRM-oppdatering og oppfølging</p>
          </div>
        </div>
        <Link href="/dashboard/ai-assistant"
          className="flex-shrink-0 bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
        >
          Kom i gang
        </Link>
      </div>
    </div>
  );
}
