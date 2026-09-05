'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BarChart3, ChevronRight, FileText, GitBranch, LayoutDashboard, LogOut, Map, MessageSquare, Search, Settings, Star, Users, Zap } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

const entries = [
  { section: 'Kunder' },
  { href: '/dashboard/inbox', label: 'Innboks', icon: MessageSquare },
  { href: '/dashboard/customers', label: 'Kontakter', icon: Users },
  { href: '/dashboard/pipeline', label: 'Salgsmuligheter', icon: GitBranch },
  { section: 'Synlighet' },
  { href: '/dashboard/google-maps', label: 'Google-profil', icon: Map },
  { href: '/dashboard/auto-seo', label: 'SEO og innhold', icon: Search },
  { href: '/dashboard/review-gatekeeper', label: 'Anmeldelser', icon: Star },
  { section: 'Oppfølging' },
  { href: '/dashboard/workflows', label: 'Automatiseringer', icon: Zap },
  { href: '/dashboard/forms', label: 'Skjemaer', icon: FileText },
  { href: '/dashboard/analytics', label: 'Rapporter', icon: BarChart3 },
  { section: 'System' },
  { href: '/dashboard/settings', label: 'Innstillinger', icon: Settings },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const initials = (session?.user?.name || 'FP').split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  return <aside className={cn('sticky top-0 flex h-screen shrink-0 flex-col overflow-y-auto bg-[#1c1c27] text-slate-200 transition-all', collapsed ? 'w-16' : 'w-[220px]')}>
    <div className={cn('flex items-center gap-2.5 border-b border-white/10 px-3 py-4', collapsed && 'justify-center')}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">FP</span>{!collapsed && <div><p className="text-sm font-bold text-white">FlowPilot</p><p className="text-[10px] text-slate-500">Kundevekst</p></div>}<button onClick={() => setCollapsed(value => !value)} className={cn('ml-auto text-slate-500', collapsed && 'hidden')} aria-label="Skjul meny"><ChevronRight className="h-4 w-4 rotate-180" /></button></div>
    {collapsed && <button onClick={() => setCollapsed(false)} className="flex justify-center py-3 text-slate-500" aria-label="Vis meny"><ChevronRight className="h-4 w-4" /></button>}
    <nav className="flex-1 py-2"><Link href="/dashboard" className={linkClass(pathname === '/dashboard', collapsed)}><LayoutDashboard className="h-4 w-4 shrink-0" />{!collapsed && 'Oversikt'}</Link>{entries.map((entry, index) => 'section' in entry ? (!collapsed && <p key={`${entry.section}-${index}`} className="px-4 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-widest text-slate-600">{entry.section}</p>) : <Link key={entry.href} href={entry.href} className={linkClass(pathname.startsWith(entry.href), collapsed)} title={collapsed ? entry.label : undefined}><entry.icon className="h-4 w-4 shrink-0" />{!collapsed && entry.label}</Link>)}</nav>
    <div className="border-t border-white/10 p-3">{!collapsed && <div className="mb-3 flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">{initials}</span><div className="min-w-0"><p className="truncate text-xs font-semibold">{session?.user?.name || 'Bruker'}</p><p className="truncate text-[10px] text-slate-500">{session?.user?.email || ''}</p></div></div>}<button onClick={() => signOut({ callbackUrl: '/login' })} className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-500 hover:bg-white/5 hover:text-red-400', collapsed && 'justify-center')}><LogOut className="h-4 w-4" />{!collapsed && 'Logg ut'}</button></div>
  </aside>;
}

function linkClass(active: boolean, collapsed: boolean) { return cn('mx-2 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition', active ? 'bg-blue-600/20 text-blue-300' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200', collapsed && 'justify-center'); }
