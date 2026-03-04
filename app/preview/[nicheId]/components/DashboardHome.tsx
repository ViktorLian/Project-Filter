'use client';
import Link from 'next/link';
import { ChevronRight, Receipt, Users, TrendingUp, Activity, Star } from 'lucide-react';
import type { Niche } from '@/lib/niches';
import { ACC, ACC_L, getKPIs, mkData, KPICard, StockChart } from './shared';
import { MODULE_DEFS } from './Sidebar';

export function DashboardHome({ nicheId, niche, onNav }: {
  nicheId: string; niche: Niche; onNav: (m: string) => void;
}) {
  const k = getKPIs(nicheId);
  const leadsData  = mkData(nicheId, 1, k.leads,  0.55);
  const incomeData = mkData(nicheId, 2, k.income, 0.44);

  const mockLeads = [
    { name: 'Kari Nordmann',    score: 87, status: 'Ny' },
    { name: 'Ole Persen',       score: 72, status: 'Kontaktet' },
    { name: 'Ingrid Haugen',    score: 91, status: 'Ny' },
    { name: 'Bjorn Andreassen', score: 65, status: 'Ny' },
  ];
  const mockInv = [
    { cust: 'Stein Olsen',  amt: 18750, due: '14.9.2026', paid: false },
    { cust: 'Tone Larsen',  amt: 9400,  due: '20.9.2026', paid: false },
    { cust: 'Erik Bakke',   amt: 22100, due: '5.9.2026',  paid: true  },
  ];

  const topMods = ['leads','invoices','cashflow','calendar'];

  return (
    <div className="space-y-4">
      {/* Quick-access tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {topMods.map(key => {
          const def = MODULE_DEFS[key]; if (!def) return null;
          const I = def.icon;
          return (
            <button key={key} onClick={()=>onNav(key)}
              className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:border-indigo-300 hover:shadow-sm transition-all text-left">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{backgroundColor:ACC_L,color:ACC}}><I className="h-4 w-4"/></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-700 truncate">{def.label}</p>
                <p className="text-xs text-slate-400 truncate">{def.sub}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0"/>
            </button>
          );
        })}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Leads denne maned"     value={String(k.leads)}  sub={`+${k.newLeads} denne uken`}  icon={Users}      trend="up"/>
        <KPICard label="Inntekter denne maned" value={`${k.income.toLocaleString('nb-NO')} kr`} sub="Fakturert" icon={TrendingUp}  trend="up"/>
        <KPICard label="Resultat"              value={`${k.result.toLocaleString('nb-NO')} kr`} sub={`Margin ${Math.round((k.result/k.income)*100)}%`} icon={Activity} trend="up"/>
        <KPICard label="Snitt lead-score"      value={`${k.avgScore}/100`} sub="AI-scoring"   icon={Star}      trend="neutral"/>
      </div>

      {/* Two independent stock charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StockChart title="Leads per maned"     subtitle="April 2025 – mars 2026" data={leadsData}/>
        <StockChart title="Inntekter per maned" subtitle="April 2025 – mars 2026" data={incomeData} suf=" kr"/>
      </div>

      {/* Recent leads + unpaid invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Users className="h-4 w-4" style={{color:ACC}}/> Siste leads
            </h3>
            <button onClick={()=>onNav('leads')} className="text-xs font-medium text-indigo-600 hover:underline">Se alle</button>
          </div>
          <div className="space-y-3">
            {mockLeads.map((l,i)=>(
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">{l.name.charAt(0)}</div>
                <p className="text-sm font-medium text-slate-700 flex-1 truncate">{l.name}</p>
                <span className="text-xs text-slate-400 mr-1">{l.status}</span>
                <span className="text-xs font-bold text-slate-600">{l.score}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 text-center mt-3">Demo-data – live data etter innlogging</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Receipt className="h-4 w-4" style={{color:ACC}}/> Ubetalte fakturaer
            </h3>
            <button onClick={()=>onNav('invoices')} className="text-xs font-medium text-indigo-600 hover:underline">Se alle</button>
          </div>
          <div className="space-y-3">
            {mockInv.map((inv,i)=>(
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Receipt className="h-3.5 w-3.5 text-slate-400"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{inv.cust}</p>
                  <p className="text-xs text-slate-400">Forfall: {inv.due}</p>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${inv.paid?'text-emerald-600':'text-red-500'}`}>{inv.amt.toLocaleString('nb-NO')} kr</span>
              </div>
            ))}
          </div>
          <button onClick={()=>onNav('invoices')} className="mt-4 w-full text-xs text-indigo-600 font-medium hover:underline">+ Ny faktura</button>
        </div>
      </div>
    </div>
  );
}
