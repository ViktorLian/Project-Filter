'use client';

import { useState, useEffect } from 'react';
import {
  Plus, CheckCircle2, Circle, Clock, AlertTriangle, Trash2,
  Pencil, X, Calendar, User, Flag, Search, ChevronDown, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Priority = 'low' | 'medium' | 'high' | 'urgent';
type Status = 'todo' | 'in_progress' | 'done';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  due_date?: string;
  assigned_to?: string;
  created_at: string;
}

const PRIORITIES: { value: Priority; label: string; color: string; dot: string }[] = [
  { value: 'low', label: 'Lav', color: 'text-slate-500 bg-slate-50 border-slate-200', dot: 'bg-slate-400' },
  { value: 'medium', label: 'Middels', color: 'text-blue-600 bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
  { value: 'high', label: 'Høy', color: 'text-orange-600 bg-orange-50 border-orange-200', dot: 'bg-orange-500' },
  { value: 'urgent', label: 'Haster', color: 'text-red-600 bg-red-50 border-red-200', dot: 'bg-red-500' },
];

const STATUSES: { value: Status; label: string; color: string }[] = [
  { value: 'todo', label: 'Gjøre', color: 'bg-slate-100 text-slate-600' },
  { value: 'in_progress', label: 'Pågår', color: 'bg-blue-100 text-blue-700' },
  { value: 'done', label: 'Ferdig', color: 'bg-emerald-100 text-emerald-700' },
];

const BLANK = { title: '', description: '', priority: 'medium' as Priority, status: 'todo' as Status, due_date: '', assigned_to: '' };

function PriorityBadge({ p }: { p: Priority }) {
  const cfg = PRIORITIES.find(x => x.value === p)!;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border', cfg.color)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch('/api/tasks');
    if (r.ok) { const d = await r.json(); setTasks(d.tasks ?? []); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditTask(null);
    setForm({ ...BLANK });
    setShowModal(true);
  }

  function openEdit(t: Task) {
    setEditTask(t);
    setForm({ title: t.title, description: t.description ?? '', priority: t.priority, status: t.status, due_date: t.due_date?.slice(0, 10) ?? '', assigned_to: t.assigned_to ?? '' });
    setShowModal(true);
  }

  async function save() {
    if (!form.title.trim()) return;
    setSaving(true);
    if (editTask) {
      await fetch(`/api/tasks/${editTask.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setSaving(false);
    setShowModal(false);
    load();
  }

  async function toggleDone(t: Task) {
    const newStatus: Status = t.status === 'done' ? 'todo' : 'done';
    setTasks(prev => prev.map(x => x.id === t.id ? { ...x, status: newStatus } : x));
    await fetch(`/api/tasks/${t.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    load();
  }

  async function deleteTask(id: string) {
    setTasks(prev => prev.filter(x => x.id !== id));
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  }

  const filtered = tasks.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.assigned_to ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const countByStatus = (s: Status) => tasks.filter(t => t.status === s).length;
  const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Oppgaver</h1>
          <p className="text-sm text-slate-500 mt-0.5">Hold oversikt over alt som skal gjøres</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm">
          <Plus className="h-4 w-4" /> Ny oppgave
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Å gjøre', value: countByStatus('todo'), icon: Circle, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
          { label: 'Pågår', value: countByStatus('in_progress'), icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Ferdig', value: countByStatus('done'), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Forfalt', value: overdue, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={cn('rounded-xl border p-4 flex items-center gap-3', bg)}>
            <Icon className={cn('h-5 w-5 flex-shrink-0', color)} />
            <div>
              <p className={cn('text-2xl font-bold', color)}>{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Søk oppgaver..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
          {(['all', ...STATUSES.map(s => s.value)] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s as any)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition', statusFilter === s ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100')}
            >
              {s === 'all' ? 'Alle' : STATUSES.find(x => x.value === s)?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Ingen oppgaver</p>
            <p className="text-slate-400 text-sm mt-1">Klikk "Ny oppgave" for å komme i gang</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(task => {
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
              return (
                <div key={task.id} className={cn('flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition group', task.status === 'done' && 'opacity-60')}>
                  <button onClick={() => toggleDone(task)} className="mt-0.5 flex-shrink-0">
                    {task.status === 'done'
                      ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      : <Circle className="h-5 w-5 text-slate-300 hover:text-blue-500 transition" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-medium text-slate-900 text-sm', task.status === 'done' && 'line-through text-slate-400')}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <PriorityBadge p={task.priority} />
                      {task.due_date && (
                        <span className={cn('flex items-center gap-1 text-xs', isOverdue ? 'text-red-500 font-semibold' : 'text-slate-400')}>
                          <Calendar className="h-3 w-3" />
                          {new Date(task.due_date).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })}
                          {isOverdue && ' · Forfalt'}
                        </span>
                      )}
                      {task.assigned_to && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <User className="h-3 w-3" />
                          {task.assigned_to}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">{editTask ? 'Rediger oppgave' : 'Ny oppgave'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tittel *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="F.eks: Ring Bjørn Hansen tilbake"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Beskrivelse</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Valgfri detaljer..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prioritet</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400">
                    {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400">
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Frist</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tildelt til</label>
                  <input value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                    placeholder="Navn på personen"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-5">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition">
                Avbryt
              </button>
              <button onClick={save} disabled={saving || !form.title.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition">
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {editTask ? 'Lagre' : 'Opprett'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
