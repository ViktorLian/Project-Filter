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
  HelpCircle, Mail, Calculator, Wand2, Clock, Megaphone, Layout,
  Package, CheckSquare, FlaskConical, AlertTriangle, GitBranch, BookMarked,
  Gauge, Sliders, Dna, Landmark, Cpu, TrendingDown, Globe, Flame, Search, Share2
} from 'lucide-react';

interface NavItem { href: string; label: string; icon: React.ElementType }
interface NavGroup { label: string; icon: React.ElementType; color: string; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    label: '🔥 Signatur',
    icon: Flame,
    color: 'text-rose-400',
    items: [
      { href: '/dashboard/nervous-system', label: 'Business Nervesystem', icon: Activity },
      { href: '/dashboard/profit-intelligence', label: 'Profit Intelligence', icon: TrendingUp },
      { href: '/dashboard/market-engine', label: 'Market Domination', icon: Globe },
      { href: '/dashboard/self-healing', label: 'Self-Healing Company', icon: RefreshCw },
      { href: '/dashboard/crisis-proof', label: 'Crisis-Proof Arch.', icon: Shield },
    ],
  },
  {
    label: 'Oversikt',
    icon: LayoutDashboard,
    color: 'text-blue-400',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/analytics', label: 'Analyse', icon: BarChart3 },
      { href: '/dashboard/kpi-tracker', label: 'KPI-oversikt', icon: Target },
      { href: '/dashboard/calendar', label: 'Kalender', icon: Calendar },
      { href: '/dashboard/speed-to-lead', label: 'Speed to Lead', icon: Zap },
    ],
  },
  {
    label: 'Samtaler & CRM',
    icon: MessageSquare,
    color: 'text-cyan-400',
    items: [
      { href: '/dashboard/inbox', label: 'Innboks', icon: MessageSquare },
      { href: '/dashboard/leads', label: 'Leads', icon: FileText },
      { href: '/dashboard/customers', label: 'Kunder', icon: Users },
      { href: '/dashboard/proposals', label: 'Tilbud', icon: ClipboardList },
      { href: '/dashboard/pipeline', label: 'Jobbpipeline', icon: GitBranch },
      { href: '/dashboard/follow-up', label: 'Smart Oppfølging', icon: Bell },
    ],
  },
  {
    label: 'Markedsføring',
    icon: Megaphone,
    color: 'text-pink-400',
    items: [
      { href: '/dashboard/social-planner', label: 'Social Planner', icon: Share2 },
      { href: '/dashboard/campaigns', label: 'Kampanjer', icon: Rocket },
      { href: '/dashboard/campaign-builder', label: 'Kampanjebygger', icon: Megaphone },
      { href: '/dashboard/creative-generator', label: 'Kreativ Generator', icon: Wand2 },
      { href: '/dashboard/email-sequences', label: 'E-postsekvenser', icon: Mail },
      { href: '/dashboard/marketing-calendar', label: 'Markedskalender', icon: Calendar },
      { href: '/dashboard/google-maps', label: 'Google Maps', icon: Map },
    ],
  },
  {
    label: 'Automatisering',
    icon: Zap,
    color: 'text-orange-400',
    items: [
      { href: '/dashboard/workflows', label: 'Arbeidsflyt-bygger', icon: Zap },
      { href: '/dashboard/forms', label: 'Skjemaer', icon: FileText },
      { href: '/dashboard/chatbot-embed', label: 'Chatbot på nettside', icon: Bot },
      { href: '/dashboard/auto-backoffice', label: 'Autonom Backoffice', icon: Cpu },
      { href: '/dashboard/contract-reminders', label: 'Kontraktpåminnelser', icon: Bell },
      { href: '/dashboard/lost-leads', label: 'Tapte Leads', icon: RefreshCw },
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
    label: 'Omdømme',
    icon: Star,
    color: 'text-amber-400',
    items: [
      { href: '/dashboard/review-gatekeeper', label: 'Review Gatekeeper', icon: Shield },
      { href: '/dashboard/reputation', label: 'Omdømme-sentral', icon: Star },
      { href: '/dashboard/feedback', label: 'Tilbakemeldinger', icon: Star },
      { href: '/dashboard/tilleggstjenester', label: 'Tilleggstjenester', icon: Star },
    ],
  },
  {
    label: 'AI Verktøy',
    icon: Brain,
    color: 'text-purple-400',
    items: [
      { href: '/dashboard/fp-score', label: 'FlowPilot Score™', icon: Gauge },
      { href: '/dashboard/business-genome', label: 'Business Genome', icon: Dna },
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
    label: 'Vekst',
    icon: TrendingUp,
    color: 'text-emerald-400',
    items: [
      { href: '/dashboard/digital-twin', label: 'Digital Tvilling', icon: Sliders },
      { href: '/dashboard/profit-accelerator', label: 'Profit Accelerator', icon: TrendingDown },
      { href: '/dashboard/affiliates', label: 'Affiliate-program', icon: Gift },
      { href: '/dashboard/communities', label: 'Communities', icon: Users },
      { href: '/dashboard/funding', label: 'Finansierings-hub', icon: Landmark },
      { href: '/dashboard/roi-tracker', label: 'ROI Oversikt', icon: Award },
      { href: '/dashboard/benchmarks', label: 'Bransjesammenligning', icon: Activity },
      { href: '/dashboard/referral', label: 'Vervprogram', icon: Gift },
      { href: '/dashboard/growth-playbook', label: 'Vekstplan', icon: Lightbulb },
      { href: '/dashboard/growth-planner', label: 'Vekstplaner', icon: TrendingUp },
      { href: '/dashboard/upsell-coach', label: 'Vekst-coach', icon: Sparkles },
      { href: '/dashboard/negotiation-coach', label: 'Forhandlingscoach', icon: MessageSquare },
    ],
  },
  {
    label: 'Drift & System',
    icon: Settings,
    color: 'text-slate-400',
    items: [
      { href: '/dashboard/client-portal', label: 'Kundeportal', icon: Globe },
      { href: '/dashboard/team', label: 'Team og roller', icon: Users },
      { href: '/dashboard/inventory', label: 'Lager & Ressurser', icon: Package },
      { href: '/dashboard/process-vault', label: 'Prosessbibliotek', icon: ClipboardList },
      { href: '/dashboard/procedures', label: 'Prosedyre-bank', icon: BookMarked },
      { href: '/dashboard/operations-hub', label: 'Driftssentral', icon: Layout },
      { href: '/dashboard/compliance', label: 'Compliance & HMS', icon: Shield },
      { href: '/dashboard/risk', label: 'Risiko-register', icon: AlertTriangle },
      { href: '/dashboard/risk-monitor', label: 'Risikomonitor', icon: Shield },
      { href: '/dashboard/acquisition-readiness', label: 'Selskapsberedskap', icon: Award },
      { href: '/dashboard/revenue-lab', label: 'Inntekt & Vekst', icon: FlaskConical },
      { href: '/dashboard/onboarding', label: 'Kom i gang', icon: GraduationCap },
      { href: '/dashboard/manual', label: 'Brukermanual', icon: BookOpen },
      { href: '/dashboard/settings', label: 'Innstillinger', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    '🔥 Signatur': false, 'Oversikt': true, 'Samtaler & CRM': false,
    'Markedsføring': false, 'Automatisering': false, 'Økonomi': false,
    'Omdømme': false, 'Vekst': false, 'AI Verktøy': false, 'Drift & System': false,
  });

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => {
      const isCurrentlyOpen = !!prev[label];
      // Close all, then toggle clicked one (single-open accordion)
      const allClosed = Object.fromEntries(Object.keys(prev).map((k) => [k, false]));
      return { ...allClosed, [label]: !isCurrentlyOpen };
    });

  const q = search.toLowerCase().trim();

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

      {/* Search bar */}
      {!collapsed && (
        <div className="px-3 py-2 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Søk i meny..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
            />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-2 space-y-0.5">
        {navGroups.map((group) => {
          const GroupIcon = group.icon;
          // Filter items by search
          const filteredItems = q
            ? group.items.filter((i) => i.label.toLowerCase().includes(q))
            : group.items;
          if (q && filteredItems.length === 0) return null;
          // When searching, always expand; otherwise use state
          const isOpen = q ? true : (openGroups[group.label] ?? true);
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
                  {filteredItems.map((item) => {
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
