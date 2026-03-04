'use client';
import { useState } from 'react';
import { Plus, Search, Mail, Phone, Star, ChevronRight, UserCheck, UserX, Clock, Download } from 'lucide-react';
import type { Niche } from '@/lib/niches';
import { ACC, ACC_L, getKPIs, mkData, KPIRow, StockChart } from './shared';

const STATUSES = ['Ny','Kontaktet','Akseptert','Avvist','Venter'] as const;
type Status = typeof STATUSES[number];

const STATUS_COLORS: Record<Status,string> = {
  Ny:'bg-blue-100 text-blue-700',
  Kontaktet:'bg-purple-100 text-purple-700',
  Akseptert:'bg-emerald-100 text-emerald-700',
  Avvist:'bg-red-100 text-red-700',
  Venter:'bg-yellow-100 text-yellow-700',
};

type Lead = { id:number; name:string; email:string; phone:string; score:number; status:Status; source:string; date:string; };

function makeLeads(s: number): Lead[] {
  const names = ['Kari Nordmann','Ole Hansen','Ingrid Berg','Bjorn Larsen','Tone Johansen','Erik Dahl','Mari Olsen','Simen Haug','Lena Strand','Anders Nygaard'];
  const sources = ['Nettskjema','Google','Instagram','Anbefaling','Ring'];
  return names.map((name,i)=>({
    id: i+1, name,
    email: `${name.split(' ')[0].toLowerCase()}@example.com`,
    phone: `+47 9${String(s+i*7).slice(-2)} ${String(45+i*3).slice(-2)} ${String(78+i).slice(-3)}`.slice(0,15),
    score: 50 + ((s*i*3)%45),
    status: STATUSES[i%STATUSES.length],
    source: sources[i%sources.length],
    date: `${2+(i%25)}.3.2026`,
  }));
}

export function ModuleLeads({ nicheId, niche }: { nicheId:string; niche:Niche }) {
  const s = nicheId.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const [leads, setLeads] = useState<Lead[]>(makeLeads(s));
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<Status|'Alle'>('Alle');
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState(''); const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState(''); const [newSource, setNewSource] = useState('Nettskjema');
  const k = getKPIs(nicheId);
  const chartData = mkData(nicheId, 1, k.leads, 0.55);

  const filtered = leads.filter(l=>{
    const q = search.toLowerCase();
    const matchQ = !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.phone.includes(q);
    const matchS = filterStatus==='Alle' || l.status===filterStatus;
    return matchQ && matchS;
  });

  function addLead() {
    if (!newName.trim()) return;
    setLeads(prev=>[{id:Date.now(),name:newName,email:newEmail,phone:newPhone,score:72,status:'Ny',source:newSource,date:'4.3.2026'},...prev]);
    setNewName(''); setNewEmail(''); setNewPhone(''); setShowForm(false);
  }

  function changeStatus(id:number, status:Status) {
    setLeads(prev=>prev.map(l=>l.id===id?{...l,status}:l));
  }

  return (
    <div className="space-y-4">
      <KPIRow nicheId={nicheId}/>
      <StockChart title="Leads per maned" subtitle="April 2025 – mars 2026" data={chartData}/>

      <div className="bg-white rounded-xl border border-slate-200">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Alle leads ({filtered.length})</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Sok..." className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400 w-44"/>
            </div>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value as any)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none">
              {['Alle',...STATUSES].map(s=><option key={s}>{s}</option>)}
            </select>
            <button onClick={()=>setShowForm(v=>!v)} className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg" style={{backgroundColor:ACC}}>
              <Plus className="h-3.5 w-3.5"/> Ny lead
            </button>
          </div>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="p-4 border-b border-slate-100 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Navn *" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <input value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="E-post" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <input value={newPhone} onChange={e=>setNewPhone(e.target.value)} placeholder="Tlf" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <div className="flex gap-2">
              <button onClick={addLead} className="flex-1 text-xs font-semibold text-white py-2 rounded-lg" style={{backgroundColor:ACC}}>Legg til</button>
              <button onClick={()=>setShowForm(false)} className="text-xs text-slate-500 px-3 py-2 rounded-lg border border-slate-200 bg-white">Avbryt</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 text-left">
              {['Navn','Kontakt','Kilde','Score','Status',''].map(h=>(
                <th key={h} className="px-4 py-2.5 text-xs font-semibold text-slate-500">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(l=>(
                <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">{l.name.charAt(0)}</div>
                      <div><p className="font-medium text-slate-800 text-xs">{l.name}</p><p className="text-[10px] text-slate-400">{l.date}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3"/>{l.email}</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3"/>{l.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs text-slate-600">{l.source}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 bg-slate-100 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-indigo-500" style={{width:`${l.score}%`}}/></div>
                      <span className="text-xs font-semibold text-slate-700">{l.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select value={l.status} onChange={e=>changeStatus(l.id,e.target.value as Status)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border-0 outline-none cursor-pointer ${STATUS_COLORS[l.status]}`}>
                      {STATUSES.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-indigo-600 font-medium hover:underline">Aapen</button>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">Ingen leads funnet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
