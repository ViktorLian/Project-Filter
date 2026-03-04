'use client';
import { useState } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import type { Niche } from '@/lib/niches';
import { ACC } from './shared';

type Stage = 'lead'|'proposal'|'contract'|'won'|'lost';
const STAGES: { key:Stage; label:string; color:string }[] = [
  { key:'lead',     label:'Lead',      color:'bg-slate-100   text-slate-700'   },
  { key:'proposal', label:'Tilbud',    color:'bg-blue-100    text-blue-700'    },
  { key:'contract', label:'Kontrakt',  color:'bg-indigo-100  text-indigo-700'  },
  { key:'won',      label:'Vunnet',    color:'bg-emerald-100 text-emerald-700' },
  { key:'lost',     label:'Tapt',      color:'bg-red-100     text-red-600'     },
];
type Card = { id:number; name:string; stage:Stage; value:number; company:string; };

function makeCards(s:number): Card[] {
  const data:[string,string,number,Stage][] = [
    ['Kari Nordmann',   'NorCo AS',     45000, 'proposal'],
    ['Ole Hansen',      'HansenTech',   18000, 'lead'],
    ['Ingrid Berg',     'Berg & Co',    72000, 'contract'],
    ['Bjorn Larsen',    'Larsen Grupp', 33000, 'won'],
    ['Tone Johansen',   'ToneBygg',     21000, 'lead'],
    ['Erik Dahl',       'Dahl Digital', 55000, 'proposal'],
    ['Mari Olsen',      'Olsen Media',  14000, 'lost'],
    ['Stig Pettersen',  'Petter AS',    88000, 'contract'],
  ];
  return data.map(([n,c,v,st],i)=>({
    id:i+1, name:n as string, company:c as string,
    value: Number(v)+((s*(i+1)*3)%20000),
    stage:st as Stage,
  }));
}

export function ModulePipeline({ nicheId, niche }: { nicheId:string; niche:Niche }) {
  const s = nicheId.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const [cards, setCards] = useState<Card[]>(makeCards(s));
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName]   = useState('');
  const [newComp, setNewComp]   = useState('');
  const [newVal, setNewVal]     = useState('');

  function advance(id:number) {
    setCards(prev=>prev.map(c=>{
      if (c.id!==id) return c;
      const idx = STAGES.findIndex(s=>s.key===c.stage);
      const next = STAGES[Math.min(idx+1, STAGES.length-1)];
      return {...c, stage:next.key};
    }));
  }
  function add() {
    if (!newName.trim()) return;
    setCards(prev=>[{id:Date.now(),name:newName,company:newComp,value:Number(newVal)||0,stage:'lead'},...prev]);
    setNewName(''); setNewComp(''); setNewVal(''); setShowForm(false);
  }

  const totalPipeline = cards.filter(c=>c.stage!=='lost').reduce((a,c)=>a+c.value,0);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {STAGES.filter(s=>s.key!=='lost').concat(STAGES.filter(s=>s.key==='lost')).slice(0,4).map(st=>{
          const stCards = cards.filter(c=>c.stage===st.key);
          const val = stCards.reduce((a,c)=>a+c.value,0);
          return (
            <div key={st.key} className="bg-white rounded-xl border border-slate-200 p-3 text-center">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
              <p className="text-sm font-bold text-slate-800 mt-1">{stCards.length} leads</p>
              <p className="text-xs text-slate-400">{val.toLocaleString('nb-NO')} kr</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Total pipeline: <span className="font-bold text-slate-800">{totalPipeline.toLocaleString('nb-NO')} kr</span></p>
        <button onClick={()=>setShowForm(v=>!v)} className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg" style={{backgroundColor:ACC}}>
          <Plus className="h-3.5 w-3.5"/> Ny lead
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Navn *" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
          <input value={newComp} onChange={e=>setNewComp(e.target.value)} placeholder="Bedrift" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
          <input value={newVal} onChange={e=>setNewVal(e.target.value)} placeholder="Verdi (kr)" type="number" className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
          <div className="flex gap-2">
            <button onClick={add} className="flex-1 text-xs font-semibold text-white py-2 rounded-lg" style={{backgroundColor:ACC}}>Legg til</button>
            <button onClick={()=>setShowForm(false)} className="text-xs text-slate-500 px-3 py-2 rounded-lg border border-slate-200 bg-white">Avbryt</button>
          </div>
        </div>
      )}

      {/* Kanban columns */}
      <div className="grid grid-cols-5 gap-3 overflow-x-auto pb-2 min-w-[800px]">
        {STAGES.map(st=>{
          const stCards = cards.filter(c=>c.stage===st.key);
          return (
            <div key={st.key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                <span className="text-xs text-slate-400">{stCards.length}</span>
              </div>
              <div className="flex flex-col gap-2 min-h-[200px]">
                {stCards.map(card=>(
                  <div key={card.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                    <p className="text-xs font-semibold text-slate-800 truncate">{card.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{card.company}</p>
                    <p className="text-xs font-bold text-indigo-600 mt-1">{card.value.toLocaleString('nb-NO')} kr</p>
                    {st.key!=='won' && st.key!=='lost' && (
                      <button onClick={()=>advance(card.id)}
                        className="mt-2 w-full text-[10px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-1 rounded-lg flex items-center justify-center gap-0.5 transition-colors">
                        Flytt fram <ChevronRight className="h-3 w-3"/>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
