'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, MessageSquare, Calendar, Users, GitBranch,
  Receipt, Megaphone, Zap, FileText, Star,
  BarChart3, Bot, Settings, Package, Briefcase,
  Search, LogOut, DollarSign, Map, ChevronRight
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

// ─── Navigation structure ──────────────────────────────────────────────────────
// Top-level items: each goes to a hub page with tabs for sub-features

type NavSection = { section: string };
type NavItem = { section?: never; href: string; label: string; icon: React.ElementType; badge?: string; active?: (p: string) => boolean };
type NavEntry = NavSection | NavItem;

const NAV: NavEntry[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, active: (p) => p === '/dashboard' },

  { section: 'Operasjon' },
  { href: '/dashboard/inbox', label: 'Innboks', icon: MessageSquare, badge: 'NY' },
  { href: '/dashboard/calendar', label: 'Kalender', icon: Calendar },
  { href: '/dashboard/customers', label: 'Kontakter', icon: Users },
  { href: '/dashboard/pipeline', label: 'Muligheter', icon: GitBranch },
  { href: '/dashboard/jobs', label: 'Jobber', icon: Briefcase },

  { section: 'Økonomi' },
  { href: '/dashboard/invoices', label: 'Fakturaer', icon: Receipt },
  { href: '/dashboard/cashflow', label: 'Økonomi', icon: DollarSign },
  { href: '/dashboard/inventory', label: 'Lager', icon: Package },

  { section: 'Vekst' },
  { href: '/dashboard/campaigns', label: 'Markedsføring', icon: Megaphone },
  { href: '/dashboard/workflows', label: 'Automatisering', icon: Zap },
  { href: '/dashboard/forms', label: 'Skjemaer', icon: FileText },
  { href: '/dashboard/review-gatekeeper', label: 'Omdømme', icon: Star },

  { section: 'Innsikt' },
  { href: '/dashboard/analytics', label: 'Analyse', icon: BarChart3 },
  { href: '/dashboard/ai-assistant', label: 'AI Assistent', icon: Bot },
  { href: '/dashboard/google-maps', label: 'Google / SEO', icon: Map },

  { section: 'System' },
  { href: '/dashboard/settings', label: 'Innstillinger', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const q = search.toLowerCase().trim();

  const initials = (session?.user?.name || 'FP')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className={cn(
      'relative flex flex-col bg-[#1c1c27] text-slate-200 h-screen sticky top-0 flex-shrink-0 overflow-y-auto transition-all duration-200',
      collapsed ? 'w-[56px]' : 'w-[220px]'
    )}>

      {/* Logo */}
      <div className={cn('flex items-center gap-2.5 px-3 py-3.5 border-b border-white/8', collapsed && 'justify-center px-2')}>
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-900/40">
          <span className="text-white font-black text-xs tracking-tight">FP</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-[13px] font-bold text-white leading-tight">FlowPilot</p>
            <p className="text-[10px] text-slate-500">Growth OS</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn('ml-auto p-1 rounded-md hover:bg-white/8 text-slate-500 hover:text-slate-300 transition', collapsed && 'hidden')}
        >
          <ChevronRight className="h-3.5 w-3.5 rotate-180" />
        </button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button onClick={() => setCollapsed(false)} className="flex justify-center py-2 hover:bg-white/8 transition">
          <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
        </button>
      )}

      {/* Search */}
      {!collapsed && (
        <div className="px-2.5 py-2 border-b border-white/8">
          <div className="flex items-center gap-2 bg-white/6 rounded-lg px-2.5 py-1.5 border border-white/8">
            <Search className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Søk..."
              className="bg-transparent text-xs text-slate-300 placeholder-slate-600 outline-none w-full"
            />
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 py-1 overflow-y-auto">
        {NAV.filter(item => {
          if ('section' in item) return true;
          if (!q) return true;
          return item.label.toLowerCase().includes(q);
        }).map((item, idx) => {
          if ('section' in item) {
            if (collapsed) return null;
            return (
              <p key={idx} className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600 select-none">
                {item.section}
              </p>
            );
          }

          const Icon = item.icon;
          const isActive = item.active
            ? item.active(pathname)
            : (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-2.5 mx-1.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all group relative',
                isActive
                  ? 'bg-blue-600/20 text-blue-300'
                  : 'text-slate-400 hover:bg-white/6 hover:text-slate-200',
                collapsed && 'justify-center mx-1'
              )}
            >
              <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300')} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto text-[9px] font-bold bg-blue-500 text-white rounded-full px-1.5 py-0.5 leading-none">{item.badge}</span>
              )}
              {!collapsed && isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              )}
              {collapsed && (
                <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap text-xs bg-slate-800 text-slate-200 px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-white/8 px-2.5 py-2.5">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-[10px]">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-slate-200 truncate">{session?.user?.name || 'Bruker'}</p>
              <p className="text-[10px] text-slate-500 truncate">{session?.user?.email || ''}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-1.5 rounded-md hover:bg-white/8 text-slate-500 hover:text-red-400 transition"
              title="Logg ut"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex justify-center w-full py-1 hover:bg-white/8 rounded-md transition"
            title="Logg ut"
          >
            <LogOut className="h-4 w-4 text-slate-500 hover:text-red-400" />
          </button>
        )}
      </div>
    </aside>
  );
}


