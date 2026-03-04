'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Bell, Search, ChevronRight, Zap } from 'lucide-react';
import { NICHES } from '@/lib/niches';
import { Sidebar, NICHE_ICONS } from './components/Sidebar';
import { DashboardHome }    from './components/DashboardHome';
import { ModuleLeads }      from './components/ModuleLeads';
import { ModuleTasks }      from './components/ModuleTasks';
import { ModuleInvoices }   from './components/ModuleInvoices';
import { ModuleCalendar }   from './components/ModuleCalendar';
import { ModuleCustomers }  from './components/ModuleCustomers';
import { ModuleCashflow }   from './components/ModuleCashflow';
import { ModuleProposals }  from './components/ModuleProposals';
import { ModuleInventory }  from './components/ModuleInventory';
import { ModulePipeline }   from './components/ModulePipeline';
import { ModuleCampaigns }  from './components/ModuleCampaigns';
import { ModuleGeneric }    from './components/ModuleGeneric';
import { ACC } from './components/shared';

function ModuleTitle({ active }: { active: string }) {
  const labels: Record<string, string> = {
    dashboard: 'Oversikt',
    leads: 'Leads',
    tasks: 'Oppgaver',
    invoices: 'Fakturaer',
    calendar: 'Kalender',
    customers: 'Kunder',
    cashflow: 'Kontantstrom',
    proposals: 'Tilbud',
    inventory: 'Lagerstyring',
    pipeline: 'Pipeline',
    campaigns: 'Kampanjer',
  };
  return <>{labels[active] ?? active.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</>;
}

export default function PreviewPage() {
  const params = useParams<{ nicheId: string }>();
  const nicheId = params?.nicheId ?? 'restaurant';
  const niche = NICHES.find(n => n.id === nicheId) ?? NICHES[0];
  const NicheIcon = NICHE_ICONS[nicheId] ?? Zap;
  const [active, setActive] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function renderModule() {
    switch (active) {
      case 'dashboard': return <DashboardHome  nicheId={nicheId} niche={niche} onNav={setActive} />;
      case 'leads':     return <ModuleLeads     nicheId={nicheId} niche={niche} />;
      case 'tasks':     return <ModuleTasks     nicheId={nicheId} niche={niche} />;
      case 'invoices':  return <ModuleInvoices  nicheId={nicheId} niche={niche} />;
      case 'calendar':  return <ModuleCalendar  nicheId={nicheId} niche={niche} />;
      case 'customers': return <ModuleCustomers nicheId={nicheId} niche={niche} />;
      case 'cashflow':  return <ModuleCashflow  nicheId={nicheId} niche={niche} />;
      case 'proposals': return <ModuleProposals nicheId={nicheId} niche={niche} />;
      case 'inventory': return <ModuleInventory nicheId={nicheId} niche={niche} />;
      case 'pipeline':  return <ModulePipeline  nicheId={nicheId} niche={niche} />;
      case 'campaigns': return <ModuleCampaigns nicheId={nicheId} niche={niche} />;
      default:          return <ModuleGeneric   nicheId={nicheId} niche={niche} moduleKey={active} />;
    }
  }

  const monthlyPrice = 349 + (nicheId.length * 17) % 300;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={[
          'fixed lg:static inset-y-0 left-0 z-30 w-64 transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <Sidebar niche={niche} active={active} onSelect={k => { setActive(k); setSidebarOpen(false); }} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 flex-shrink-0">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <div className="w-5 h-0.5 bg-slate-600 mb-1" />
            <div className="w-5 h-0.5 bg-slate-600 mb-1" />
            <div className="w-5 h-0.5 bg-slate-600" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <NicheIcon className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-700">{niche.name}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-slate-900">
              <ModuleTitle active={active} />
            </span>
          </div>

          <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-wider">
            Demo
          </span>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              placeholder="Sok..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 rounded-lg outline-none w-40 focus:w-52 transition-all text-slate-700"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-slate-100">
            <Bell className="h-4 w-4 text-slate-500" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>

          {/* Avatar */}
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: ACC }}
          >
            D
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderModule()}
        </main>

        {/* Footer CTA */}
        <footer className="border-t border-slate-200 bg-white px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-500">
            Dette er en{' '}
            <span className="font-semibold text-slate-700">gratis demo</span>{' '}
            av FlowPilot for {niche.name.toLowerCase()}
          </div>
          <a
            href="/register"
            className="flex items-center gap-2 text-xs font-bold text-white px-4 py-2 rounded-lg"
            style={{ backgroundColor: ACC }}
          >
            Start gratis fra {monthlyPrice} kr/mnd
            <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </footer>
      </div>
    </div>
  );
}
