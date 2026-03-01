'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';

const LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/inbox': 'Innboks',
  '/dashboard/calendar': 'Kalender',
  '/dashboard/customers': 'Kontakter',
  '/dashboard/pipeline': 'Muligheter / Pipeline',
  '/dashboard/jobs': 'Jobber',
  '/dashboard/invoices': 'Fakturaer',
  '/dashboard/cashflow': 'Økonomi',
  '/dashboard/inventory': 'Lager',
  '/dashboard/campaigns': 'Markedsføring',
  '/dashboard/workflows': 'Automatisering',
  '/dashboard/forms': 'Skjemaer',
  '/dashboard/review-gatekeeper': 'Omdømme',
  '/dashboard/analytics': 'Analyse',
  '/dashboard/ai-assistant': 'AI Assistent',
  '/dashboard/google-maps': 'Google / SEO',
  '/dashboard/settings': 'Innstillinger',
};

function getLabel(pathname: string) {
  if (LABELS[pathname]) return LABELS[pathname];
  const seg = pathname.split('/').pop() || '';
  return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
}

export default function Topbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const initials = (session?.user?.name || 'FP')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-12 bg-white border-b border-slate-100 flex items-center justify-between px-5 flex-shrink-0">
      {/* Page title */}
      <h2 className="text-[13px] font-semibold text-slate-700">{getLabel(pathname)}</h2>

      {/* Right side */}
      <div className="flex items-center gap-1.5">
        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition">
          <Search className="h-4 w-4" />
        </button>
        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition relative">
          <Bell className="h-4 w-4" />
        </button>
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center ml-1">
          <span className="text-white font-bold text-[10px]">{initials}</span>
        </div>
      </div>
    </header>
  );
}
