'use client';
import {
  Wrench, Zap, Hammer, Paintbrush, Sparkles, Scissors, Heart,
  Dumbbell, BookOpen, Monitor, Home, Building2, Receipt, Truck,
  Car, Megaphone, Smile, Scale, Leaf,
  Users, TrendingUp, CheckCircle, Settings, Mail, BarChart3, Package,
  Clock, MessageSquare, UserCheck, RefreshCw, Star, Shield, Calendar,
  ListChecks, FileText, Layers, LayoutDashboard, Globe, Bot, Cpu,
  LogOut,
} from 'lucide-react';
import type { Niche } from '@/lib/niches';
import { ACC } from './shared';

export const NICHE_ICONS: Record<string, React.ElementType> = {
  rorlegger: Wrench, elektriker: Zap, snekker: Hammer, maler: Paintbrush,
  rengjoring: Sparkles, frisor: Scissors, hudpleie: Heart,
  'personlig-trener': Dumbbell, regnskapsforer: BookOpen, 'it-konsulent': Monitor,
  eiendomsmegler: Home, vaktmester: Building2, restaurant: Receipt,
  transport: Truck, bilverksted: Car, markedsbyra: Megaphone,
  tannlege: Smile, advokat: Scale, landbruk: Leaf,
};

export const MODULE_DEFS: Record<string, { label: string; icon: React.ElementType; group: string; sub: string }> = {
  leads:               { label: 'Leads',           icon: Users,           group: 'SALG',    sub: 'Innkomne henvendelser' },
  invoices:            { label: 'Fakturaer',        icon: Receipt,         group: 'SALG',    sub: 'Fakturering og betaling' },
  proposals:           { label: 'Tilbud',           icon: FileText,        group: 'SALG',    sub: 'Kalkyler og tilbud' },
  pipeline:            { label: 'Pipeline',         icon: Layers,          group: 'SALG',    sub: 'Salgspipeline' },
  customers:           { label: 'Kunder',           icon: UserCheck,       group: 'SALG',    sub: 'Kunderegister' },
  cashflow:            { label: 'Kontantstrom',     icon: TrendingUp,      group: 'OKONOMI', sub: 'Okonomioversikt' },
  inventory:           { label: 'Lager',            icon: Package,         group: 'DRIFT',   sub: 'Produkt og materiell' },
  tasks:               { label: 'Oppgaver',         icon: ListChecks,      group: 'DRIFT',   sub: 'Oppgavebehandling' },
  calendar:            { label: 'Kalender',         icon: Calendar,        group: 'DRIFT',   sub: 'Timebok og avtaler' },
  'time-tracking':     { label: 'Timeregistrering', icon: Clock,           group: 'DRIFT',   sub: 'Timer og fakturering' },
  jobs:                { label: 'Oppdrag',          icon: Wrench,          group: 'DRIFT',   sub: 'Jobbstyring' },
  forms:               { label: 'Skjemaer',         icon: LayoutDashboard, group: 'VEKST',   sub: 'Kontaktskjemaer' },
  workflows:           { label: 'Automatisering',   icon: RefreshCw,       group: 'VEKST',   sub: 'Automatiske flyter' },
  campaigns:           { label: 'Kampanjer',        icon: Megaphone,       group: 'VEKST',   sub: 'E-post og SMS' },
  'social-planner':    { label: 'Sosiale medier',   icon: MessageSquare,   group: 'VEKST',   sub: 'Innholdsplanlegging' },
  'email-sequences':   { label: 'E-postsekvenser',  icon: Mail,            group: 'VEKST',   sub: 'Automatisk oppfolging' },
  'review-gatekeeper': { label: 'Omdoemme',         icon: Star,            group: 'VEKST',   sub: 'Google-anmeldelser' },
  'google-maps':       { label: 'Google / SEO',     icon: Globe,           group: 'VEKST',   sub: 'Synlighet pa nett' },
  analytics:           { label: 'Analyse',          icon: BarChart3,       group: 'INNSIKT', sub: 'Statistikk og KPIer' },
  'ai-assistant':      { label: 'AI Assistent',     icon: Bot,             group: 'INNSIKT', sub: 'AI-drevet innsikt' },
  'chatbot-widget':    { label: 'Chatbot Widget',   icon: Cpu,             group: 'INNSIKT', sub: 'Automatisk svar' },
  'client-portal':     { label: 'Kundeportal',      icon: Shield,          group: 'SYSTEM',  sub: 'Sikker dokumentdeling' },
  settings:            { label: 'Innstillinger',    icon: Settings,        group: 'SYSTEM',  sub: 'Kontoinnstillinger' },
};

export function Sidebar({ niche, active, onSelect }: {
  niche: Niche; active: string; onSelect: (m: string) => void;
}) {
  const always = ['analytics', 'ai-assistant', 'settings'];
  const keys = [...niche.modules, ...always.filter(k => !niche.modules.includes(k))];
  const grouped: Record<string, string[]> = {};
  for (const key of keys) {
    const def = MODULE_DEFS[key]; if (!def) continue;
    if (!grouped[def.group]) grouped[def.group] = [];
    grouped[def.group].push(key);
  }
  return (
    <aside className="w-56 flex-shrink-0 bg-slate-900 flex flex-col h-full">
      <div className="h-14 flex items-center px-4 gap-2.5 border-b border-slate-800 flex-shrink-0">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{backgroundColor:ACC}}>FP</div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm">FlowPilot</p>
          <p className="text-slate-400 text-[10px] truncate">{niche.name}</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <button onClick={()=>onSelect('dashboard')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 ${active==='dashboard'?'bg-indigo-600 text-white font-medium':'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
          <LayoutDashboard className="h-4 w-4 flex-shrink-0"/><span className="truncate">Dashboard</span>
        </button>
        {Object.entries(grouped).map(([grp,gkeys])=>(
          <div key={grp} className="pt-4">
            <p className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">{grp}</p>
            {gkeys.map(key=>{
              const def=MODULE_DEFS[key]; if(!def) return null;
              const I=def.icon;
              return (
                <button key={key} onClick={()=>onSelect(key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 ${active===key?'bg-indigo-600 text-white font-medium':'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <I className="h-4 w-4 flex-shrink-0"/><span className="truncate">{def.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-slate-800 p-3 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{backgroundColor:ACC}}>D</div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-200 text-xs font-medium">Demo-konto</p>
            <p className="text-slate-500 text-[10px] truncate">demo@flowpilot.no</p>
          </div>
          <LogOut className="h-3.5 w-3.5 text-slate-500 flex-shrink-0"/>
        </div>
      </div>
    </aside>
  );
}
