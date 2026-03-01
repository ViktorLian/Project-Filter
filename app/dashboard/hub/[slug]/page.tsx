'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import * as Icons from 'lucide-react';

type HubModule = { href: string; icon: keyof typeof Icons; label: string; desc: string; color: string };
type HubConfig = { title: string; subtitle: string; modules: HubModule[] };

const HUBS: Record<string, HubConfig> = {
  operasjon: {
    title: 'Operasjon',
    subtitle: 'Styr daglig drift, kommunikasjon og oppgaver på ett sted',
    modules: [
      { href: '/dashboard/inbox', icon: 'Inbox', label: 'Innboks', desc: 'SMS, e-post, WhatsApp, Instagram og Facebook i én tråd', color: 'text-blue-600 bg-blue-50 border-blue-200' },
      { href: '/dashboard/calendar', icon: 'Calendar', label: 'Kalender', desc: 'Booking, avtaler og teamkalender med synkronisering', color: 'text-violet-600 bg-violet-50 border-violet-200' },
      { href: '/dashboard/customers', icon: 'Users', label: 'Kontakter / CRM', desc: 'Full kundedatabase med tilpassede felt, tagger og smarte lister', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
      { href: '/dashboard/pipeline', icon: 'GitBranch', label: 'Pipeline', desc: 'Visuell salgskanban – flytt leads fra NY til SOLGT med ett klikk', color: 'text-orange-600 bg-orange-50 border-orange-200' },
      { href: '/dashboard/jobs', icon: 'Briefcase', label: 'Jobber', desc: 'Opprett, tildel og følg opp alle jobber i bedriften', color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
      { href: '/dashboard/tasks', icon: 'CheckSquare', label: 'Oppgaver', desc: 'Intern oppgaveliste med prioritet, frist og ansvarlig person', color: 'text-pink-600 bg-pink-50 border-pink-200' },
      { href: '/dashboard/speed-to-lead', icon: 'Zap', label: 'Speed to Lead', desc: 'Automatisk varsling når nye leads kommer – svar innen 5 min', color: 'text-red-600 bg-red-50 border-red-200' },
    ],
  },
  okonomi: {
    title: 'Økonomi',
    subtitle: 'Fakturaer, lager, tilbud og komplett finansoversikt',
    modules: [
      { href: '/dashboard/invoices', icon: 'Receipt', label: 'Fakturaer', desc: 'Lag og send profesjonelle fakturaer med MVA direkte til kunden', color: 'text-blue-600 bg-blue-50 border-blue-200' },
      { href: '/dashboard/cashflow', icon: 'TrendingUp', label: 'Cashflow', desc: 'Likviditetsprognose, inntektshistorikk og utgiftsanalyse', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
      { href: '/dashboard/inventory', icon: 'Package', label: 'Lager', desc: 'World-class lagersystem – spor varer, leverandører og innkjøpsordrer', color: 'text-orange-600 bg-orange-50 border-orange-200' },
      { href: '/dashboard/proposals', icon: 'FileCheck', label: 'Tilbud', desc: 'Profesjonelle tilbud med kalkulasjonsmotor og digital signatur', color: 'text-violet-600 bg-violet-50 border-violet-200' },
      { href: '/dashboard/cashflow', icon: 'PieChart', label: 'Budsjett', desc: 'Sett månedlige mål og følg cost vs revenue i sanntid', color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
      { href: '/dashboard/invoices', icon: 'CreditCard', label: 'Betalinger', desc: 'Oversikt over alle transaksjoner, abonnementer og rabattkoder', color: 'text-pink-600 bg-pink-50 border-pink-200' },
    ],
  },
  vekst: {
    title: 'Vekst',
    subtitle: 'Markedsføring, automatisering og omdømmestyring',
    modules: [
      { href: '/dashboard/campaigns', icon: 'Megaphone', label: 'Kampanjer', desc: 'E-postkampanjer, SMS-blaster og nyhetsbrev med drag-and-drop', color: 'text-blue-600 bg-blue-50 border-blue-200' },
      { href: '/dashboard/workflows', icon: 'Zap', label: 'Automatisering', desc: 'Bygg regler: Hvis X skjer → Gjør Y → Vent 2 dager → Gjør Z', color: 'text-violet-600 bg-violet-50 border-violet-200' },
      { href: '/dashboard/forms', icon: 'FileText', label: 'Skjemaer', desc: 'Lag leadsskjemaer, undersøkelser og integrer på nettsiden din', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
      { href: '/dashboard/review-gatekeeper', icon: 'Star', label: 'Omdømme', desc: 'Send automatiske anmeldelsesforespørsler til Google og Trustpilot', color: 'text-orange-600 bg-orange-50 border-orange-200' },
      { href: '/dashboard/social-planner', icon: 'Share2', label: 'Sosiale medier', desc: 'Planlegg og publiser til Instagram, Facebook og LinkedIn', color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
      { href: '/dashboard/affiliates', icon: 'Users2', label: 'Affiliates', desc: 'Ambassadørprogram – la kunder tjene provisjon ved å anbefale deg', color: 'text-pink-600 bg-pink-50 border-pink-200' },
      { href: '/dashboard/email-sequences', icon: 'Mail', label: 'E-postsekvenser', desc: 'Automatiske dryppssekvenser som varmes opp og konverterer', color: 'text-red-600 bg-red-50 border-red-200' },
    ],
  },
  innsikt: {
    title: 'Innsikt',
    subtitle: 'Data, AI og strategisk intelligens for bedriften din',
    modules: [
      { href: '/dashboard/analytics', icon: 'BarChart3', label: 'Analyse', desc: 'Konverteringsrate, lead-kilder og fullstendig ytelsesoversikt', color: 'text-blue-600 bg-blue-50 border-blue-200' },
      { href: '/dashboard/ai-assistant', icon: 'Bot', label: 'AI Assistent', desc: 'Din egne AI-rådgiver tilpasset bedriftens data og nisje', color: 'text-violet-600 bg-violet-50 border-violet-200' },
      { href: '/dashboard/google-maps', icon: 'Map', label: 'Google / SEO', desc: 'Administrer Google-profilen og overvåk rangeringer', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
      { href: '/dashboard/creative-generator', icon: 'Sparkles', label: 'Kreativ Generator', desc: 'AI lager ferdig annonsekopi, SMS og Instagram-tekster', color: 'text-orange-600 bg-orange-50 border-orange-200' },
      { href: '/dashboard/kpi-tracker', icon: 'Target', label: 'KPI-tracker', desc: 'Sett mål og følg fremgang på tvers av hele bedriften', color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
      { href: '/dashboard/norsk-bi', icon: 'BarChart2', label: 'Business Intelligence', desc: 'Dyp lønnsomhetsanalyse, benchmarking og vedidatamatrise', color: 'text-pink-600 bg-pink-50 border-pink-200' },
    ],
  },
};

export default function HubPage() {
  const params = useParams();
  const slug = String(params?.slug ?? '');
  const hub = HUBS[slug];

  if (!hub) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-slate-500">Hub-siden ble ikke funnet.</p>
        <Link href="/dashboard" className="text-blue-600 underline mt-4 block">Tilbake til dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition">
        <ArrowLeft className="h-4 w-4" /> Tilbake til dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{hub.title}</h1>
        <p className="text-slate-500 mt-1">{hub.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hub.modules.map(({ href, icon, label, desc, color }) => {
          const IconComp = (Icons as any)[icon] as React.ElementType;
          return (
            <Link
              key={href + label}
              href={href}
              className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-150"
            >
              <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl border mb-3 ${color}`}>
                {IconComp && <IconComp className="h-5 w-5" />}
              </div>
              <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition">{label}</p>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
