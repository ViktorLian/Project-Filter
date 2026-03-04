'use client';
import { useState } from 'react';
import { Plus, ChevronRight, FileText } from 'lucide-react';
import type { Niche } from '@/lib/niches';
import { ACC } from './shared';

type PropStatus = 'Kladd'|'Sendt'|'Akseptert'|'Avvist';
const STATUS_COLORS: Record<PropStatus,string> = {
  Kladd:'bg-slate-100 text-slate-600',
  Sendt:'bg-blue-100 text-blue-700',
  Akseptert:'bg-emerald-100 text-emerald-700',
  Avvist:'bg-red-100 text-red-600',
};
type Proposal = { id:number; nr:string; customer:string; title:string; amount:number; date:string; status:PropStatus; };

function makeProposals(s:number): Proposal[] {
  const data:[string,string,number,PropStatus][] = [
    ['Kari Nordmann','Arsavtale premium',   44000, 'Akseptert'],
    ['Ole Hansen',   'Engangstjeneste',      8900,  'Sendt'],
    ['Ingrid Berg',  'Utvidet pakke 3 mnd', 21000,  'Kladd'],
    ['Bjorn Larsen', 'Startpakke',           6500,  'Avvist'],
    ['Tone Johansen','Arsavtale basis',     18000,  'Akseptert'],
    ['Erik Dahl',    'Demo til tilbud',      3000,  'Sendt'],
  ];
  return data.map(([c,t,a,st],i)=>({
    id:i+1, nr:`TIL-${200+i}`, customer:c as string, title:t as string,
    amount: Number(a) + ((s*(i+1)*5)%8000),
    date:`${10+i}.2.2026`, status:st as PropStatus,
  }));
}

export function ModuleProposals({ nicheId, niche }: { nicheId:string; niche:Niche }) {
  const s = nicheId.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const [proposals, setProposals] = useState<Proposal[]>(makeProposals(s));
  const [showForm, setShowForm] = useState(false);
  const [newCust, setNewCust]   = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newAmt, setNewAmt]     = useState('');
  const [filter, setFilter]     = useState<PropStatus|'Alle'>('Alle');

  const filtered = filter==='Alle' ? proposals : proposals.filter(p=>p.status===filter);
  const totalAccepted = proposals.filter(p=>p.status==='Akseptert').reduce((a,p)=>a+p.amount,0);
  const pipeline      = proposals.filter(p=>p.status==='Sendt').reduce((a,p)=>a+p.amount,0);

  function add() {
    if (!newCust.trim()||!newTitle.trim()) return;
    const nr = `TIL-${300+proposals.length}`;
    setProposals(prev=>[{id:Date.now(),nr,customer:newCust,title:newTitle,amount:Number(newAmt)||0,date:'4.3.2026',status:'Kladd'},...prev]);
    setNewCust(''); setNewTitle(''); setNewAmt(''); setShowForm(false);
  }
  function setStatus(id:number, st:PropStatus) {
    setProposals(prev=>prev.map(p=>p.id===id?{...p,status:st}:p));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Vunnet verdi',   val:`${totalAccepted.toLocaleString('nb-NO')} kr`, color:'text-emerald-700' },
          { label:'I pipeline',     val:`${pipeline.toLocaleString('nb-NO')} kr`,      color:'text-blue-700' },
          { label:'Totale tilbud',  val:String(proposals.length),                      color:'text-slate-800' },
        ].map(c=>(
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className={`text-base font-bold ${c.color}`}>{c.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Tilbud ({filtered.length})</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {(['Alle','Kladd','Sendt','Akseptert','Avvist'] as const).map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${filter===f?'text-white border-transparent':'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                style={filter===f?{backgroundColor:ACC}:{}}>{f}</button>
            ))}
            <button onClick={()=>setShowForm(v=>!v)} className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg" style={{backgroundColor:ACC}}>
              <Plus className="h-3.5 w-3.5"/> Nytt tilbud
            </button>
          </div>
        </div>

        {showForm && (
          <div className="p-4 border-b border-slate-100 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input value={newCust} onChange={e=>setNewCust(e.target.value)} placeholder="Kunde *" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Tilbudstittel *" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <input value={newAmt} onChange={e=>setNewAmt(e.target.value)} placeholder="Verdi (kr)" type="number" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
            <div className="flex gap-2">
              <button onClick={add} className="flex-1 text-xs font-semibold text-white py-2 rounded-lg" style={{backgroundColor:ACC}}>Opprett</button>
              <button onClick={()=>setShowForm(false)} className="text-xs text-slate-500 px-3 py-2 rounded-lg border border-slate-200 bg-white">Avbryt</button>
            </div>
          </div>
        )}

        <div className="divide-y divide-slate-50">
          {filtered.map(p=>(
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
              <FileText className="h-5 w-5 text-slate-300 flex-shrink-0"/>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{p.customer}</p>
                <p className="text-xs text-slate-400">{p.nr} — {p.title} — {p.date}</p>
              </div>
              <p className="text-sm font-bold text-slate-700 hidden sm:block">{p.amount.toLocaleString('nb-NO')} kr</p>
              <select value={p.status} onChange={e=>setStatus(p.id, e.target.value as PropStatus)}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border-0 outline-none cursor-pointer ${STATUS_COLORS[p.status]}`}>
                {(['Kladd','Sendt','Akseptert','Avvist'] as const).map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          ))}
          {filtered.length===0 && <div className="p-8 text-center text-sm text-slate-400">Ingen tilbud funnet</div>}
        </div>
      </div>
    </div>
  );
}
