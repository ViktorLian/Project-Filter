'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FileText, BarChart3, Settings, DollarSign, Receipt,
  Users, Briefcase, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Bot, Brain, Calendar, Map, Zap, TrendingUp, Target, BookOpen,
  MessageSquare, Star, Bell, RefreshCw, Lightbulb, PieChart,
  ClipboardList, Award, Shield, Rocket, Activity, Gift, Sparkles, GraduationCap,
  HelpCircle, Mail, Calculator, Wand2, Clock, Megaphone, Layout
} from 'lucide-react';

interface NavItem { href: string; label: string; icon: React.ElementType }
interface NavGroup { label: string; icon: React.ElementType; color: string; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    label: 'Hoved',
    icon: LayoutDashboard,
    color: 'text-blue-400',
    items: [
      { href: '/dashboard', label: 'Oversikt', icon: LayoutDashboard },
      { href: '/dashboard/analytics', label: 'Analyse', icon: BarChart3 },
      { href: '/dashboard/kpi-tracker', label: 'KPI-oversikt', icon: Target },
      { href: '/dashboard/calendar', label: 'Kalender', icon: Calendar },
    ],
  },
  {
    label: 'Salg',
    icon: Target,
    color: 'text-emerald-400',
    items: [
      { href: '/dashboard/leads', label: 'Leads', icon: FileText },
      { href: '/dashboard/customers', label: 'Kunder', icon: Users },
      { href: '/dashboard/proposals', label: 'Tilbud', icon: ClipboardList },
      { href: '/dashboard/follow-up', label: 'Smart Oppfølging', icon: Bell },
    ],
  },
  {
    label: 'Økonomi',
    icon: DollarSign,
    color: 'text-yellow-400',
    items: [
      { href: '/dashboard/jobs', label: 'Jobber', icon: Briefcase },
      { href: '/dashboard/invoices', label: 'Fakturaer', icon: Receipt },
      { href: '/dashboard/cashflow', label: 'Cash Flow', icon: TrendingUp },
      { href: '/dashboard/profit-tracker', label: 'Fortjenestesporing', icon: PieChart },
      { href: '/dashboard/price-calculator', label: 'Prisskalkulator', icon: Calculator },
      { href: '/dashboard/regnskap', label: 'Regnskap', icon: Receipt },
      { href: '/dashboard/time-tracking', label: 'Timeregistrering', icon: Clock },
    ],
  },
  {
    label: 'AI Verktøy',
    icon: Brain,
    color: 'text-purple-400',
    items: [
      { href: '/dashboard/ai-assistant', label: 'AI Salgsassistent', icon: Bot },
      { href: '/dashboard/ai-crm', label: 'AI CRM Autofill', icon: Brain },
      { href: '/dashboard/win-loss', label: 'Vinn/Tap Analyse', icon: PieChart },
      { href: '/dashboard/meeting-notes', label: 'Møtenotat AI', icon: MessageSquare },
      { href: '/dashboard/objection-handler', label: 'Innvending Analyse', icon: Shield },
      { href: '/dashboard/business-memory', label: 'Bedriftshukommelse', icon: Brain },
      { href: '/dashboard/decision-assistant', label: 'Beslutningsassistent', icon: HelpCircle },
      { href: '/dashboard/opportunity-radar', label: 'Mulighetssensor', icon: BarChart3 },
      { href: '/dashboard/business-coach', label: 'Bedriftscoach', icon: Sparkles },
      { href: '/dashboard/norsk-bi', label: 'Norsk Markedsdata', icon: Activity },
    ],
  },
  {
    label: 'Automatisering',
    icon: Zap,
    color: 'text-orange-400',
    items: [
      { href: '/dashboard/forms', label: 'Skjemaer', icon: FileText },
      { href: '/dashboard/campaigns', label: 'Kampanjer', icon: Rocket },
      { href: '/dashboard/campaign-builder', label: 'Kampanjebygger', icon: Megaphone },
      { href: '/dashboard/creative-generator', label: 'Kreativ Generator', icon: Wand2 },
      { href: '/dashboard/contract-reminders', label: 'Kontraktpåminnelser', icon: Bell },
      { href: '/dashboard/lost-leads', label: 'Tapte Leads', icon: RefreshCw },
      { href: '/dashboard/feedback', label: 'Tilbakemeldinger', icon: Star },
      { href: '/dashboard/email-sequences', label: 'E-postsekvenser', icon: Mail },
    ],
  },
  {
    label: 'Vekst',
    icon: TrendingUp,
    color: 'text-pink-400',
    items: [
      { href: '/dashboard/google-maps', label: 'Google Maps', icon: Map },
      { href: '/dashboard/growth-playbook', label: 'Vekstplan', icon: Lightbulb },
      { href: '/dashboard/roi-tracker', label: 'ROI Oversikt', icon: Award },
      { href: '/dashboard/benchmarks', label: 'Bransje­sammenligning', icon: Activity },
      { href: '/dashboard/upsell-coach', label: 'Vekst-coach', icon: Sparkles },
      { href: '/dashboard/referral', label: 'Vervprogram', icon: Gift },
      { href: '/dashboard/growth-planner', label: 'Vekstplaner', icon: TrendingUp },
      { href: '/dashboard/negotiation-coach', label: 'Forhandlingscoach', icon: MessageSquare },
      { href: '/dashboard/marketing-calendar', label: 'Markedskalender', icon: Calendar },
    ],
  },
  {
    label: 'System',
    icon: Settings,
    color: 'text-slate-400',
    items: [
      { href: '/dashboard/onboarding', label: 'Kom i gang', icon: GraduationCap },
      { href: '/dashboard/manual', label: 'Brukermanual', icon: BookOpen },
      { href: '/dashboard/team', label: 'Team og roller', icon: Users },
      { href: '/dashboard/process-vault', label: 'Prosessbibliotek', icon: ClipboardList },
      { href: '/dashboard/risk-monitor', label: 'Risikomonitor', icon: Shield },
      { href: '/dashboard/acquisition-readiness', label: 'Selskapsberedskap', icon: Award },
      { href: '/dashboard/operations-hub', label: 'Driftssentral', icon: Layout },
      { href: '/dashboard/settings', label: 'Innstillinger', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Hoved: true, Salg: true, 'Økonomi': true,
    'AI Verktøy': false, Automatisering: false, Vekst: false, System: true,
  });

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-slate-900 text-slate-100 transition-all duration-300 ease-in-out',
        'h-screen sticky top-0 flex-shrink-0 overflow-y-auto',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-4 border-b border-slate-800',
        collapsed && 'justify-center px-2'
      )}>
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">FP</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate">FlowPilot</h1>
            <p className="text-xs text-slate-400">CRM & AI</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-5 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 border border-slate-600 text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-lg"
        title={collapsed ? 'Utvid meny' : 'Minimer meny'}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Nav */}
      <nav className="flex-1 py-2 space-y-0.5">
        {navGroups.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = openGroups[group.label] ?? true;
          const hasActive = group.items.some((item) =>
            item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
          );

          return (
            <div key={group.label}>
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider transition-colors',
                    hasActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <GroupIcon className={cn('h-3 w-3', group.color)} />
                    {group.label}
                  </div>
                  {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              )}

              {(isOpen || collapsed) && (
                <div className={cn('space-y-0.5', !collapsed ? 'px-2' : 'px-1 py-1')}>
                  {group.items.map((item) => {
                    const isActive =
                      item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          'flex items-center gap-2.5 rounded-lg py-2 text-sm font-medium transition-all group',
                          collapsed ? 'justify-center px-2' : 'px-3',
                          isActive
                            ? 'bg-blue-600/15 text-blue-300 border border-blue-600/25'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100 border border-transparent'
                        )}
                      >
                        <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-blue-400' : 'group-hover:text-slate-200')} />
                        {!collapsed && <span className="truncate text-sm">{item.label}</span>}
                        {!collapsed && isActive && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="px-4 py-3 border-t border-slate-800">
          <p className="text-xs text-slate-600 text-center">FlowPilot &copy; 2026</p>
        </div>
      )}
    </aside>
  );
}
