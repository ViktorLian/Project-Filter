'use client';

import { useState } from 'react';
import {
  TrendingUp, Zap, DollarSign, Clock, Users, BarChart3, Star, ArrowRight,
  CheckCircle, Lock, ChevronRight, Sparkles, Bot, Bell, FileText, Target,
  Brain, Map, CreditCard, RefreshCw, Award
} from 'lucide-react';

type Impact = 'high' | 'medium' | 'low';

interface Tip {
  id: string;
  title: string;
  description: string;
  impact: Impact;
  gain: string;
  action: string;
  href: string;
  icon: React.ElementType;
  activated: boolean;
  category: string;
}

const TIPS: Tip[] = [
  {
    id: 'follow-up',
    title: 'Aktiver Smart Oppfølging',
    description: 'Systemet sender automatisk oppfølgings-SMS og e-post til leads som ikke har svart. Gjennomsnittlig økning: 34% flere bookinger.',
    impact: 'high',
    gain: '+34% bookinger',
    action: 'Sett opp nå',
    href: '/dashboard/follow-up',
    icon: Bell,
    activated: false,
    category: 'Salg',
  },
  {
    id: 'proposals',
    title: 'Send digitale tilbud',
    description: 'Erstatt Word-dokumenter med profesjonelle digitale tilbud med én-klikk aksept. Kunder godtar 2x raskere.',
    impact: 'high',
    gain: '+2x raskere aksept',
    action: 'Prøv tilbud',
    href: '/dashboard/proposals',
    icon: FileText,
    activated: false,
    category: 'Salg',
  },
  {
    id: 'invoices',
    title: 'Automatiser fakturering',
    description: 'Generer og send faktura direkte fra jobber. Spar 3–5 timer per uke på manuell fakturering.',
    impact: 'high',
    gain: '3–5 timer/uke spart',
    action: 'Koble fakturaer',
    href: '/dashboard/invoices',
    icon: CreditCard,
    activated: true,
    category: 'Økonomi',
  },
  {
    id: 'campaigns',
    title: 'Start en SMS-kampanje',
    description: 'Send en tilbudskampanje til eksisterende kunder. 78% åpningsrate på SMS vs. 22% for e-post.',
    impact: 'high',
    gain: '78% åpningsrate',
    action: 'Lag kampanje',
    href: '/dashboard/campaigns',
    icon: Zap,
    activated: false,
    category: 'Automatisering',
  },
  {
    id: 'ai-assistant',
    title: 'La AI skrive salgstekster',
    description: 'AI-assistenten skriver profesjonelle tilbudstekster, e-poster og svar til kunder på sekunder.',
    impact: 'medium',
    gain: '60% raskere skriving',
    action: 'Bruk AI nå',
    href: '/dashboard/ai-assistant',
    icon: Bot,
    activated: false,
    category: 'AI Verktøy',
  },
  {
    id: 'google-maps',
    title: 'Optimaliser Google Maps-profilen',
    description: 'Bedrifter med komplett GMB-profil får 7x flere klikk. La oss sjekke og forbedre din profil.',
    impact: 'medium',
    gain: '7x flere klikk',
    action: 'Sjekk profil',
    href: '/dashboard/google-maps',
    icon: Map,
    activated: false,
    category: 'Vekst',
  },
  {
    id: 'lost-leads',
    title: 'Gjenvin tapte leads',
    description: 'Bruk AI til å lage personlige gjenvinningsmelding til leads som sa nei. Gjennomsnittet henter inn 12–18%.',
    impact: 'medium',
    gain: '12–18% gjenvunnet',
    action: 'Start gjenvinning',
    href: '/dashboard/lost-leads',
    icon: RefreshCw,
    activated: false,
    category: 'Salg',
  },
  {
    id: 'roi-tracker',
    title: 'Mål avkastning på markedsføring',
    description: 'Se nøyaktig hvilke kanaler (Facebook, Google, word-of-mouth) som gir flest leads og beste ROI.',
    impact: 'low',
    gain: 'Stopp pengesluk',
    action: 'Se ROI',
    href: '/dashboard/roi-tracker',
    icon: BarChart3,
    activated: false,
    category: 'Vekst',
  },
  {
    id: 'feedback',
    title: 'Samle automatiske attester',
    description: 'Send kundetilfredshet-undersøkelse 24 timer etter fullført jobb. Bruk svarene til å vinne neste kunde.',
    impact: 'low',
    gain: 'Mer tillit = mer salg',
    action: 'Aktiver',
    href: '/dashboard/feedback',
    icon: Star,
    activated: false,
    category: 'Automatisering',
  },
  {
    id: 'growth-playbook',
    title: 'Følg vekstplanen din',
    description: 'Du har en skreddersydd vekstplan basert på bransjen din. Gjennomsnitt: +22% inntekt på 90 dager.',
    impact: 'medium',
    gain: '+22% inntekt/90 dager',
    action: 'Åpne planen',
    href: '/dashboard/growth-playbook',
    icon: Award,
    activated: false,
    category: 'Vekst',
  },
];

const IMPACT_COLORS: Record<Impact, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-blue-100 text-blue-700 border-blue-200',
};
const IMPACT_LABELS: Record<Impact, string> = {
  high: 'Høy effekt',
  medium: 'Middels effekt',
  low: 'Lav effekt',
};

const CATEGORIES = ['Alle', 'Salg', 'Økonomi', 'Automatisering', 'AI Verktøy', 'Vekst'];

export default function UpsellCoachPage() {
  const [filter, setFilter] = useState('Alle');
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visible = TIPS.filter(t =>
    !dismissed.includes(t.id) &&
    (filter === 'Alle' || t.category === filter)
  );

  const activated = TIPS.filter(t => t.activated).length;
  const potential = TIPS.filter(t => !t.activated).length;

  const prioritized = [...visible].sort((a, b) => {
    const order: Record<Impact, number> = { high: 0, medium: 1, low: 2 };
    return order[a.impact] - order[b.impact];
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h1 className="text-2xl font-bold text-slate-900">Vekst-coach</h1>
        </div>
        <p className="text-slate-500 text-sm">
          AI analyserer din bruk og forteller deg nøyaktig hva du skal gjøre for å tjene mer og spare tid.
        </p>
      </div>

      {/* Progress banner */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-purple-200 mb-1">Appen din er ikke ferdig optimalisert</p>
            <p className="text-2xl font-bold">{activated} av {TIPS.length} funksjoner aktivert</p>
            <p className="text-sm text-purple-200 mt-1">Du har {potential} ubrukte muligheter til å vokse</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <div className="h-3 w-48 rounded-full bg-white/20">
              <div
                className="h-3 rounded-full bg-white transition-all"
                style={{ width: `${(activated / TIPS.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-purple-200">{Math.round((activated / TIPS.length) * 100)}% av potensialet brukt</p>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition ${
              filter === c
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Tips list */}
      <div className="space-y-3">
        {prioritized.map((tip, i) => {
          const Icon = tip.icon;
          return (
            <div
              key={tip.id}
              className={`rounded-xl bg-white border p-5 transition hover:shadow-sm ${
                tip.activated ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Rank */}
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  {tip.activated
                    ? <CheckCircle className="h-5 w-5 text-emerald-500" />
                    : <Icon className="h-5 w-5 text-slate-600" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-900">{tip.title}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${IMPACT_COLORS[tip.impact]}`}>
                      {IMPACT_LABELS[tip.impact]}
                    </span>
                    {tip.activated && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        Aktivert
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{tip.description}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-xs font-semibold text-emerald-700">{tip.gain}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {!tip.activated && (
                    <>
                      <a
                        href={tip.href}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                      >
                        {tip.action} <ArrowRight className="h-3 w-3" />
                      </a>
                      <button
                        onClick={() => setDismissed(p => [...p, tip.id])}
                        className="text-[11px] text-slate-400 hover:text-slate-600 transition"
                      >
                        Ikke nå
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {prioritized.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
            <p className="font-semibold text-slate-900">Alt er optimalisert</p>
            <p className="text-sm text-slate-500 mt-1">Du bruker alle anbefalte funksjoner i denne kategorien.</p>
          </div>
        )}
      </div>

      {/* AI insight card */}
      <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-purple-600">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-purple-900 mb-1">AI-analyse av din bedrift</p>
            <p className="text-sm text-purple-800 leading-relaxed">
              Basert på din bransje og aktivitetsnivå ser vi at{' '}
              <strong>automatisk oppfølging av leads</strong> er det enkelttiltaket som vil gi deg størst avkastning.
              Bedrifter i din kategori øker bookingene med 25–40% innen 60 dager etter aktivering.
            </p>
            <a href="/dashboard/follow-up" className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-purple-700 hover:text-purple-900 transition">
              Aktiver nå <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
