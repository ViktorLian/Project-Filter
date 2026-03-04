// Shared types, constants and utilities for all preview module components
import type { Niche } from '@/lib/niches';

export const ACC   = '#6366f1'; // indigo-500 – unified for ALL 19 niches
export const ACC_L = '#e0e7ff'; // indigo-100

export const MONTHS = ['Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Des','Jan','Feb','Mar'];

export function seed(id: string) {
  return id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
}

export function mkData(nicheId: string, key: number, base: number, pct = 0.45) {
  const s = seed(nicheId);
  return MONTHS.map((month, i) => {
    const trend = 1 + (i / 11) * pct;
    const noise = 1 + (((s * (i + 1) * (key + 7)) % 200) - 100) / 1000;
    return { month, value: Math.max(0, Math.round(base * trend * noise)) };
  });
}

export function getKPIs(id: string) {
  const s = seed(id);
  const income   = 38000 + (s * 380) % 62000;
  const leads    = 14 + (s % 22);
  const newLeads = 3 + (s % 9);
  const avgScore = 62 + (s % 28);
  const expense  = Math.round(income * (0.30 + (s % 8) * 0.02));
  return { income, expense, result: income - expense, leads, newLeads, avgScore };
}

// KPI Card
import { Activity, Star, TrendingUp, Users } from 'lucide-react';

export function KPICard({ label, value, sub, icon: Icon, trend = 'neutral' }: {
  label: string; value: string; sub: string; icon: React.ElementType; trend?: 'up'|'down'|'neutral';
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
      <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: ACC_L, color: ACC }}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-800 mt-0.5 leading-tight truncate">{value}</p>
        <p className={`text-xs mt-0.5 ${trend==='up'?'text-emerald-600':trend==='down'?'text-red-500':'text-slate-400'}`}>{sub}</p>
      </div>
    </div>
  );
}

export function KPIRow({ nicheId }: { nicheId: string }) {
  const k = getKPIs(nicheId);
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KPICard label="Leads denne maned"     value={String(k.leads)}  sub={`+${k.newLeads} denne uken`}  icon={Users}      trend="up" />
      <KPICard label="Inntekter denne maned" value={`${k.income.toLocaleString('nb-NO')} kr`} sub="Fakturert" icon={TrendingUp}  trend="up" />
      <KPICard label="Resultat"              value={`${k.result.toLocaleString('nb-NO')} kr`} sub={`Margin ${Math.round((k.result/k.income)*100)}%`} icon={Activity} trend="up" />
      <KPICard label="Snitt lead-score"      value={`${k.avgScore}/100`} sub="AI-scoring"   icon={Star}      trend="neutral"/>
    </div>
  );
}

// Stock area chart (one metric, 12 months)
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

export function StockChart({ title, subtitle, data, pre='', suf='' }: {
  title:string; subtitle:string;
  data:{month:string;value:number}[];
  pre?:string; suf?:string;
}) {
  const last  = data[data.length-1]?.value ?? 0;
  const first = data[0]?.value ?? 1;
  const pct   = Math.round(((last-first)/Math.max(first,1))*100);
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${pct>=0?'bg-emerald-50 text-emerald-700':'bg-red-50 text-red-600'}`}>
          {pct>=0?'+':''}{pct}% siste 12 mnd
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-900 mt-3 mb-4">{pre}{last.toLocaleString('nb-NO')}{suf}</p>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{top:4,right:4,left:-16,bottom:0}}>
            <defs>
              <linearGradient id={`g${title.replace(/\W/g,'')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={ACC} stopOpacity={0.18}/>
                <stop offset="95%" stopColor={ACC} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
            <XAxis dataKey="month" tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false}
              tickFormatter={v=>pre+v.toLocaleString('nb-NO')}/>
            <Tooltip
              contentStyle={{fontSize:12,borderRadius:8,border:'1px solid #e2e8f0'}}
              formatter={((v:number)=>[`${pre}${v.toLocaleString('nb-NO')}${suf}`,title]) as any}
            />
            <Area type="monotone" dataKey="value" stroke={ACC} strokeWidth={2}
              fill={`url(#g${title.replace(/\W/g,'')})`}
              dot={false} activeDot={{r:4,stroke:ACC,strokeWidth:2,fill:'#fff'}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Niche features panel
import { CheckCircle } from 'lucide-react';

export function NicheFeaturePanel({ niche }: { niche: Niche }) {
  if (!niche.nicheFeatures.length) return null;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">
        Spesialtjenester for {niche.name}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {niche.nicheFeatures.map(f => (
          <div key={f.name} className="flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{color:ACC}}/>
            <div>
              <p className="text-sm font-medium text-slate-700">{f.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
