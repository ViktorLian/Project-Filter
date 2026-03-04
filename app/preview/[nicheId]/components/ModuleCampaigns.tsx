'use client';
import { useState } from 'react';
import { Plus, Megaphone, Mail, Users, BarChart2, Pause, Play, Trash2 } from 'lucide-react';
import type { Niche } from '@/lib/niches';
import { ACC, mkData, StockChart, getKPIs } from './shared';

type CStatus = 'Aktiv'|'Pause'|'Utkast'|'Avsluttet';
const STATUS_COLORS: Record<CStatus,string> = {
  Aktiv:'bg-emerald-100 text-emerald-700',
  Pause:'bg-yellow-100 text-yellow-700',
  Utkast:'bg-slate-100 text-slate-600',
  Avsluttet:'bg-slate-200 text-slate-500',
};
type Campaign = { id:number; name:string; type:string; status:CStatus; sent:number; opened:number; clicked:number; started:string; };

const TYPES = ['E-post','SMS','Sosiale medier','Annonser','Push-varsel'];

function makeCampaigns(s:number): Campaign[] {
  const data:[string,string,CStatus,number,number,number][] = [
    ['Varkampanje 2026',        'E-post',          'Aktiv',    1240, 487, 124],
    ['Nyhetsbrev mars',         'E-post',          'Aktiv',     892, 312,  67],
    ['Tilbudskampanje',         'SMS',             'Pause',     450, 449, 189],
    ['Instagram organisk',      'Sosiale medier',  'Aktiv',       0,   0, 892],
    ['Google Ads Q1',           'Annonser',        'Avsluttet', 3200,   0, 441],
    ['Velkomst ny bruker',      'E-post',          'Utkast',      0,   0,   0],
  ];
  return data.map(([n,t,st,se,op,cl],i)=>({
    id:i+1, name:n as string, type:t as string, status:st as CStatus,
    sent:Number(se)+((s*(i+1)*2)%500),
    opened:Number(op)+((s*(i+1))%100),
    clicked:Number(cl)+((s*(i+2))%50),
    started:`${1+i*3}.2.2026`,
  }));
}

export function ModuleCampaigns({ nicheId, niche }: { nicheId:string; niche:Niche }) {
  const s = nicheId.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const [campaigns, setCampaigns] = useState<Campaign[]>(makeCampaigns(s));
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName]   = useState('');
  const [newType, setNewType]   = useState(TYPES[0]);
  const k = getKPIs(nicheId);
  const chartData = mkData(nicheId, 9, 800, 0.4);

  function togglePause(id:number) {
    setCampaigns(prev=>prev.map(c=>{
      if (c.id!==id) return c;
      return {...c, status: c.status==='Aktiv'?'Pause':'Aktiv' as CStatus};
    }));
  }
  function remove(id:number) { setCampaigns(prev=>prev.filter(c=>c.id!==id)); }
  function add() {
    if (!newName.trim()) return;
    setCampaigns(prev=>[{id:Date.now(),name:newName,type:newType,status:'Utkast',sent:0,opened:0,clicked:0,started:'4.3.2026'},...prev]);
    setNewName(''); setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <StockChart title="Kampanjerekkevidden per maned" subtitle="Apr 2025 – mars 2026" data={chartData} pre="" suf=" visninger"/>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><Megaphone className="h-4 w-4 text-indigo-500"/>Kampanjer ({campaigns.length})</h3>
          <button onClick={()=>setShowForm(v=>!v)} className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg" style={{backgroundColor:ACC}}>
            <Plus className="h-3.5 w-3.5"/> Ny kampanje
          </button>
        </div>

        {showForm && (
          <div className="p-4 border-b border-slate-100 bg-slate-50 grid grid-cols-2 sm:grid-cols-3 gap-2">
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Kampanjenavn *" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <select value={newType} onChange={e=>setNewType(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-2 outline-none">
              {TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={add} className="flex-1 text-xs font-semibold text-white py-2 rounded-lg" style={{backgroundColor:ACC}}>Opprett</button>
              <button onClick={()=>setShowForm(false)} className="text-xs text-slate-500 px-3 py-2 rounded-lg border border-slate-200 bg-white">Avbryt</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100">
              {['Kampanje','Type','Sendt','Apnet','Klikk','Status',''].map(h=>(
                <th key={h} className="px-4 py-2.5 text-xs font-semibold text-slate-500 text-left">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {campaigns.map(c=>{
                const ctr = c.sent>0 ? Math.round((c.clicked/c.sent)*100) : 0;
                return (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                      <p className="text-[10px] text-slate-400">Startet {c.started}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{c.type}</td>
                    <td className="px-4 py-3 text-xs text-slate-700 font-medium">{c.sent.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{c.opened.toLocaleString()} {c.sent>0?`(${Math.round((c.opened/c.sent)*100)}%)`:''}</td>
                    <td className="px-4 py-3 text-xs text-indigo-600 font-semibold">{c.clicked.toLocaleString()} {c.sent>0?`(${ctr}%)`:''}</td>
                    <td className="px-4 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status]}`}>{c.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {(c.status==='Aktiv'||c.status==='Pause') && (
                          <button onClick={()=>togglePause(c.id)} className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1">
                            {c.status==='Aktiv'?<Pause className="h-3 w-3"/>:<Play className="h-3 w-3"/>}
                            {c.status==='Aktiv'?'Pause':'Fortsett'}
                          </button>
                        )}
                        <button onClick={()=>remove(c.id)} className="text-slate-300 hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
