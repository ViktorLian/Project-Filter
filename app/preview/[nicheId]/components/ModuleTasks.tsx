'use client';
import { useState } from 'react';
import { Plus, Trash2, CheckSquare, Square, Flag, Calendar } from 'lucide-react';
import type { Niche } from '@/lib/niches';
import { ACC } from './shared';

type Priority = 'Hoy'|'Normal'|'Lav';
type Task = { id:number; title:string; due:string; priority:Priority; done:boolean; };

const PRI_COLORS: Record<Priority,string> = {
  Hoy:'text-red-600 bg-red-50',
  Normal:'text-yellow-600 bg-yellow-50',
  Lav:'text-slate-500 bg-slate-100',
};

const SAMPLE_TASKS: Task[] = [
  { id:1, title:'Ring tilbake til Kari Nordmann', due:'5.3.2026', priority:'Hoy', done:false },
  { id:2, title:'Send tilbud til ny interessent', due:'6.3.2026', priority:'Hoy', done:false },
  { id:3, title:'Oppdater prisliste for april', due:'10.3.2026', priority:'Normal', done:false },
  { id:4, title:'Gjennomgang av kontrakter Q1', due:'12.3.2026', priority:'Normal', done:true },
  { id:5, title:'Back up kundedatabase', due:'15.3.2026', priority:'Lav', done:false },
  { id:6, title:'Planlegg teammøte', due:'8.3.2026', priority:'Lav', done:true },
];

export function ModuleTasks({ nicheId, niche }: { nicheId:string; niche:Niche }) {
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);
  const [filter, setFilter] = useState<'Alle'|'Aktive'|'Fullforte'>('Alle');
  const [priFilter, setPriFilter] = useState<'Alle'|Priority>('Alle');
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDue, setNewDue] = useState('');
  const [newPri, setNewPri] = useState<Priority>('Normal');

  const filtered = tasks.filter(t => {
    const matchFilter = filter==='Alle' || (filter==='Aktive'&&!t.done) || (filter==='Fullforte'&&t.done);
    const matchPri = priFilter==='Alle' || t.priority===priFilter;
    return matchFilter && matchPri;
  });

  function toggle(id:number) {
    setTasks(prev=>prev.map(t=>t.id===id?{...t,done:!t.done}:t));
  }
  function remove(id:number) {
    setTasks(prev=>prev.filter(t=>t.id!==id));
  }
  function add() {
    if (!newTitle.trim()) return;
    setTasks(prev=>[{id:Date.now(),title:newTitle,due:newDue||'—',priority:newPri,done:false},...prev]);
    setNewTitle(''); setNewDue(''); setNewPri('Normal'); setShowForm(false);
  }

  const counts = { all:tasks.length, active:tasks.filter(t=>!t.done).length, done:tasks.filter(t=>t.done).length };

  return (
    <div className="space-y-4">
      {/* Stats pills */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { label:`Totalt (${counts.all})`, val:'Alle' as const },
          { label:`Aktive (${counts.active})`, val:'Aktive' as const },
          { label:`Fullforte (${counts.done})`, val:'Fullforte' as const },
        ].map(f=>(
          <button key={f.val} onClick={()=>setFilter(f.val)}
            className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-colors ${filter===f.val?'text-white border-transparent':'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'}`}
            style={filter===f.val?{backgroundColor:ACC,borderColor:ACC}:{}}>
            {f.label}
          </button>
        ))}
        <select value={priFilter} onChange={e=>setPriFilter(e.target.value as any)} className="ml-auto text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none">
          {(['Alle','Hoy','Normal','Lav'] as const).map(p=><option key={p}>{p}</option>)}
        </select>
        <button onClick={()=>setShowForm(v=>!v)} className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg" style={{backgroundColor:ACC}}>
          <Plus className="h-3.5 w-3.5"/> Ny oppgave
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Oppgave *" className="sm:col-span-2 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
          <input value={newDue} onChange={e=>setNewDue(e.target.value)} placeholder="Frist (dd.mm.åå)" className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400"/>
          <div className="flex gap-2">
            <select value={newPri} onChange={e=>setNewPri(e.target.value as Priority)} className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-2 outline-none">
              {(['Hoy','Normal','Lav'] as const).map(p=><option key={p}>{p}</option>)}
            </select>
            <button onClick={add} className="text-xs font-semibold text-white px-3 py-2 rounded-lg" style={{backgroundColor:ACC}}>Legg til</button>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-50">
        {filtered.length===0 && (
          <div className="p-8 text-center text-sm text-slate-400">Ingen oppgaver funnet</div>
        )}
        {filtered.map(task=>(
          <div key={task.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${task.done?'opacity-60':''}`}>
            <button onClick={()=>toggle(task.id)} className="flex-shrink-0 text-slate-400 hover:text-indigo-500 transition-colors">
              {task.done ? <CheckSquare className="h-5 w-5 text-indigo-500"/> : <Square className="h-5 w-5"/>}
            </button>
            <span className={`flex-1 text-sm ${task.done?'line-through text-slate-400':'text-slate-800 font-medium'}`}>
              {task.title}
            </span>
            {task.due!=='—' && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="h-3 w-3"/>{task.due}
              </span>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRI_COLORS[task.priority]}`}>
              {task.priority}
            </span>
            <button onClick={()=>remove(task.id)} className="text-slate-300 hover:text-red-400 transition-colors ml-1">
              <Trash2 className="h-4 w-4"/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
