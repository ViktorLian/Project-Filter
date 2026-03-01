'use client';

import { useState } from 'react';
import { DemoBanner } from '@/components/ui/DemoBanner';
import {
  Zap, Plus, Play, Pause, MoreHorizontal, Mail, Phone, MessageSquare,
  Clock, ChevronRight, ArrowRight, Tag, Star, Check, X, GitBranch,
  Webhook, Users, AlertCircle, Search, Copy, ToggleLeft, ToggleRight
} from 'lucide-react';

type WorkflowStatus = 'active' | 'paused' | 'draft';

interface Step {
  type: 'trigger' | 'condition' | 'action' | 'delay';
  label: string;
  detail?: string;
  icon: React.ElementType;
  color: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  trigger: string;
  stepsCount: number;
  enrolled: number;
  successRate: number;
  lastRun: string;
  category: string;
  steps: Step[];
}

const WORKFLOWS: Workflow[] = [
  {
    id: 'w1',
    name: 'Missed Call – Text Back',
    description: 'Sender automatisk SMS innen 30 sekunder når et anrop går tapt',
    status: 'active',
    trigger: 'Tapt anrop',
    stepsCount: 3,
    enrolled: 47,
    successRate: 91,
    lastRun: '2 min siden',
    category: 'Salg',
    steps: [
      { type: 'trigger', label: 'Tapt anrop', detail: 'Når kunden ringer og ingen svarer', icon: Phone, color: 'bg-orange-100 text-orange-600 border-orange-200' },
      { type: 'delay', label: 'Vent 30 sek', detail: 'Forsinkelse før neste steg', icon: Clock, color: 'bg-slate-100 text-slate-600 border-slate-200' },
      { type: 'action', label: 'Send SMS', detail: '"Hei! Vi så at du ringte. Ring oss tilbake eller svar her 😊"', icon: MessageSquare, color: 'bg-blue-100 text-blue-600 border-blue-200' },
    ],
  },
  {
    id: 'w2',
    name: 'Ny Lead – Velkomstsekvens',
    description: 'Tar vare på nye leads med tre automatiske e-poster over 7 dager',
    status: 'active',
    trigger: 'Nytt lead opprettet',
    stepsCount: 5,
    enrolled: 123,
    successRate: 74,
    lastRun: '15 min siden',
    category: 'Markedsføring',
    steps: [
      { type: 'trigger', label: 'Nytt lead', detail: 'Skjema fylt ut eller manuelt opprettet', icon: Users, color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
      { type: 'action', label: 'Send velkomstepost', detail: 'E-post: "Takk for henvendelsen – vi er på saken!"', icon: Mail, color: 'bg-blue-100 text-blue-600 border-blue-200' },
      { type: 'delay', label: 'Vent 3 dager', icon: Clock, color: 'bg-slate-100 text-slate-600 border-slate-200' },
      { type: 'condition', label: 'Åpnet e-post?', detail: 'Ja → fortsett / Nei → send SMS-purring', icon: GitBranch, color: 'bg-purple-100 text-purple-600 border-purple-200' },
      { type: 'action', label: 'Legg til i pipeline', detail: 'Flytt til "Kontaktet – venter på svar"', icon: Tag, color: 'bg-amber-100 text-amber-600 border-amber-200' },
    ],
  },
  {
    id: 'w3',
    name: 'Anmeldelsesforespørsel',
    description: 'Ber om Google-anmeldelse 2 dager etter at jobb er merket fullført',
    status: 'active',
    trigger: 'Jobb fullført',
    stepsCount: 4,
    enrolled: 215,
    successRate: 63,
    lastRun: '1t siden',
    category: 'Omdømme',
    steps: [
      { type: 'trigger', label: 'Jobb fullført', detail: 'Status satt til "Fullført"', icon: Check, color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
      { type: 'delay', label: 'Vent 2 dager', icon: Clock, color: 'bg-slate-100 text-slate-600 border-slate-200' },
      { type: 'action', label: 'Send SMS med lenke', detail: '"Tusen takk for oppdraget! Kan du gi oss en rask anmeldelse?"', icon: Star, color: 'bg-amber-100 text-amber-600 border-amber-200' },
      { type: 'action', label: 'Oppdater kontakt', detail: 'Legg til tag "Anmeldelse bedt om"', icon: Tag, color: 'bg-blue-100 text-blue-600 border-blue-200' },
    ],
  },
  {
    id: 'w4',
    name: 'Purring på faktura',
    description: 'Automatisk purring 14 og 21 dager etter forfall',
    status: 'active',
    trigger: 'Faktura forfalt',
    stepsCount: 4,
    enrolled: 31,
    successRate: 82,
    lastRun: '3t siden',
    category: 'Økonomi',
    steps: [
      { type: 'trigger', label: 'Faktura forfalt', detail: '14 dager etter forfall', icon: AlertCircle, color: 'bg-red-100 text-red-600 border-red-200' },
      { type: 'action', label: 'Send e-postpurring', detail: 'Mild: "Hei, vi håper alt er bra – liten påminnelse"', icon: Mail, color: 'bg-blue-100 text-blue-600 border-blue-200' },
      { type: 'delay', label: 'Vent 7 dager', icon: Clock, color: 'bg-slate-100 text-slate-600 border-slate-200' },
      { type: 'action', label: 'Send SMS-purring', detail: 'Tydeligere: "Vennligst betal innen 3 dager"', icon: MessageSquare, color: 'bg-orange-100 text-orange-600 border-orange-200' },
    ],
  },
  {
    id: 'w5',
    name: 'Reaktivering av sovende kunder',
    description: 'Tar kontakt med kunder som ikke har vært aktive på 90 dager',
    status: 'paused',
    trigger: 'Ingen aktivitet 90 dager',
    stepsCount: 3,
    enrolled: 0,
    successRate: 44,
    lastRun: '14 dager siden',
    category: 'Salg',
    steps: [
      { type: 'trigger', label: '90 dager inaktiv', icon: Clock, color: 'bg-slate-100 text-slate-600 border-slate-200' },
      { type: 'action', label: 'Send reaktiverings-SMS', detail: '"Lenge siden vi jobbet sammen – kan vi hjelpe igjen?"', icon: MessageSquare, color: 'bg-blue-100 text-blue-600 border-blue-200' },
      { type: 'action', label: 'Legg til oppgave', detail: 'Opprett oppfølgingsoppgave for salgsansvarlig', icon: Tag, color: 'bg-purple-100 text-purple-600 border-purple-200' },
    ],
  },
  {
    id: 'w6',
    name: 'Webhook til eksternt system',
    description: 'Sender data til tredjepart (f.eks. Zapier, Make) ved nytt salg',
    status: 'draft',
    trigger: 'Nytt salg registrert',
    stepsCount: 2,
    enrolled: 0,
    successRate: 0,
    lastRun: '—',
    category: 'Integrasjon',
    steps: [
      { type: 'trigger', label: 'Nytt salg', icon: Tag, color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
      { type: 'action', label: 'Send webhook', detail: 'POST til https://hooks.zapier.com/...', icon: Webhook, color: 'bg-slate-100 text-slate-600 border-slate-200' },
    ],
  },
];

const statusColors: Record<WorkflowStatus, string> = {
  active: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  paused: 'text-amber-700 bg-amber-50 border-amber-200',
  draft: 'text-slate-600 bg-slate-100 border-slate-200',
};

const statusLabels: Record<WorkflowStatus, string> = {
  active: '● Aktiv', paused: '⏸ Pauset', draft: '✏ Utkast',
};

export default function WorkflowsPage() {
  const [selected, setSelected] = useState<Workflow>(WORKFLOWS[0]);
  const [search, setSearch] = useState('');

  const filtered = WORKFLOWS.filter(
    (w) => !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="-mx-6 -mt-6 px-6 py-2.5 border-b border-amber-200 bg-amber-50 mb-0">
        <DemoBanner feature="Automatiseringer" />
      </div>
      <div className="flex h-[calc(100vh-136px)] -mx-6 overflow-hidden">
      {/* Left: Workflow list */}
      <div className="w-80 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="px-4 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-bold text-slate-900">Automatiseringer</h1>
            <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
              <Plus className="h-3.5 w-3.5" /> Ny
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Søk i automatiseringer..." className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelected(w)}
              className={`w-full text-left px-4 py-3 border-b border-slate-50 transition
                ${selected.id === w.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-slate-50'}`}
            >
              <div className="flex items-start justify-between mb-1">
                <span className={`text-sm font-semibold text-slate-900 pr-2`}>{w.name}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${statusColors[w.status]}`}>{statusLabels[w.status]}</span>
              </div>
              <p className="text-xs text-slate-500 mb-1.5 line-clamp-1">{w.description}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{w.stepsCount} steg</span>
                <span>{w.enrolled} registrert</span>
                {w.successRate > 0 && <span className="text-emerald-600 font-medium">{w.successRate}% suksess</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Center: Workflow detail / visual */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-0.5">{selected.name}</h2>
            <p className="text-sm text-slate-500">{selected.description}</p>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            {selected.status === 'active' ? (
              <button className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-medium transition">
                <Pause className="h-3.5 w-3.5" /> Pause
              </button>
            ) : (
              <button className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-medium transition">
                <Play className="h-3.5 w-3.5" /> Aktiver
              </button>
            )}
            <button className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg font-medium transition">
              <Copy className="h-3.5 w-3.5" /> Duplikat
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 grid grid-cols-4 gap-4">
          {[
            { label: 'Registrert', value: selected.enrolled.toString() },
            { label: 'Fullført', value: selected.enrolled > 0 ? Math.round(selected.enrolled * selected.successRate / 100).toString() : '—' },
            { label: 'Suksessrate', value: selected.successRate > 0 ? `${selected.successRate}%` : '—' },
            { label: 'Siste kjøring', value: selected.lastRun },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Visual steps */}
        <div className="px-6 pb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Arbeidsflyt</p>
          <div className="space-y-0">
            {selected.steps.map((step, i) => {
              const Icon = step.icon;
              const typeLabels: Record<string, string> = {
                trigger: 'UTLØSER', condition: 'BETINGELSE', action: 'HANDLING', delay: 'FORSINKELSE',
              };
              return (
                <div key={i} className="flex items-start gap-0">
                  <div className="flex flex-col items-center">
                    <div className={`h-10 w-10 rounded-xl border-2 flex items-center justify-center flex-shrink-0 ${step.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {i < selected.steps.length - 1 && (
                      <div className="w-0.5 h-8 bg-slate-200 flex-shrink-0" />
                    )}
                  </div>
                  <div className="ml-4 pb-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-slate-400 tracking-wide">{typeLabels[step.type]}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                    {step.detail && <p className="text-xs text-slate-500 mt-0.5">{step.detail}</p>}
                  </div>
                </div>
              );
            })}
          </div>
          <button className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold">
            <Plus className="h-4 w-4" /> Legg til steg
          </button>
        </div>
      </div>

      {/* Right: Templates */}
      <div className="w-64 flex-shrink-0 border-l border-slate-200 bg-white p-4 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Maler</p>
        <div className="space-y-2">
          {[
            { name: 'Missed Call Text Back', cat: 'Salg', icon: '📞' },
            { name: 'Ny Lead Velkomst', cat: 'Markedsføring', icon: '👋' },
            { name: 'Google Anmeldelse', cat: 'Omdømme', icon: '⭐' },
            { name: 'Fakturapur ring', cat: 'Økonomi', icon: '💰' },
            { name: 'Fødselsdags-SMS', cat: 'Relasjoner', icon: '🎂' },
            { name: 'Sesong-kampanje', cat: 'Markedsføring', icon: '📣' },
            { name: 'Reaktivering', cat: 'Salg', icon: '🔁' },
            { name: 'Ny jobb opprettet', cat: 'Drift', icon: '🔧' },
          ].map((t) => (
            <button key={t.name} className="w-full text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 p-3 rounded-xl transition">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-base">{t.icon}</span>
                <p className="text-xs font-semibold text-slate-800">{t.name}</p>
              </div>
              <p className="text-xs text-slate-400 pl-6">{t.cat}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
