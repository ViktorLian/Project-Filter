import Link from 'next/link';
import { Activity, TrendingUp, Globe, RefreshCw, Shield, ArrowRight, Zap } from 'lucide-react';

const SYSTEMS = [
  {
    icon: Activity,
    gradient: 'from-green-500 to-emerald-600',
    glow: 'shadow-green-500/20',
    title: 'Business Nervous System',
    tagline: 'Sanntids-overvåking av ALT',
    description:
      'Live dashboard over salg, drift, cash og risiko. Beslutnings-logg som lærer av seg selv. Prioriterings-maskin som alltid peker deg mot høyest ROI. Som Bloomberg – men for din bedrift.',
    metrics: ['Live signaler i sanntid', 'Beslutnings-logg', 'ROI-prioritering'],
    tier: 'Enterprise',
    tierColor: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  },
  {
    icon: TrendingUp,
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-orange-500/20',
    title: 'Profit Intelligence Layer',
    tagline: 'Margin som maskin',
    description:
      'Marginanalyse per jobbtype. 5 kalibrerte spaker som øker fortjeneste systematisk. AI-anbefalinger om nøyaktig hvilken jobb som stjeler penger fra deg – og hva du skal gjøre i stedet.',
    metrics: ['Margin per jobbtype', '5 profit-spaker', 'AI-anbefaling'],
    tier: 'Pro',
    tierColor: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
  },
  {
    icon: Globe,
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'shadow-blue-500/20',
    title: 'Market Domination Engine',
    tagline: 'Eig lokalmarkedet',
    description:
      'Score hvert bydel basert på etterspørsel vs. konkurranse. Penetrasjonsplan fase for fase. Kampanje-eksperiment lab som tester 100 varianter og velger vinneren automatisk.',
    metrics: ['Mikro-geografi scoring', 'Penetrasjonsplan', 'A/B-eksperiment lab'],
    tier: 'Pro',
    tierColor: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  },
  {
    icon: RefreshCw,
    gradient: 'from-teal-500 to-green-600',
    glow: 'shadow-teal-500/20',
    title: 'Self-Healing Company',
    tagline: 'Feil → fikset automatisk',
    description:
      'Systemet oppdager friksjon og ineffektivitet i sanntid. Foreslår og iverksetter auto-fixes. Dynamisk kapasitetskart redistribuerer ressurser dit det trengs. Bedriften reparerer seg selv.',
    metrics: ['Auto-deteksjon', 'AI-prosessoptimalisering', 'Ressurs-redistribusjon'],
    tier: 'Enterprise',
    tierColor: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  },
  {
    icon: Shield,
    gradient: 'from-red-500 to-rose-700',
    glow: 'shadow-red-500/20',
    title: 'Crisis-Proof Architecture',
    tagline: 'Overlever alt',
    description:
      'Krisesimulator tester worst-case scenarier. Automatisk bufferbygging holder deg flytende. Sårbarhetskart visualiserer svakheter. Rehabiliteringsmodus gjenoppretter bedriften fra bunn.',
    metrics: ['Krisesimulator', 'Auto-buffere', 'Sårbarhetskart'],
    tier: 'Enterprise',
    tierColor: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  },
];

export function SignatureSystems() {
  return (
    <section className="bg-slate-900 py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-sm font-medium text-rose-300 mb-6">
            <Zap className="h-4 w-4" />
            5 Signatur-systemer – dette er vår "Apple Moment"
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white max-w-3xl mx-auto leading-tight">
            Ikke funksjoner.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Systemer som endrer spillet.
            </span>
          </h2>
          <p className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Disse 5 systemene gjør FlowPilot til mer enn en SaaS. Det er infrastruktur for
            norske SMB-er som vil dominere – ikke bare overleve.
          </p>
        </div>

        {/* System cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SYSTEMS.slice(0, 3).map((sys) => {
            const Icon = sys.icon;
            return (
              <div
                key={sys.title}
                className={`relative rounded-3xl border border-white/8 bg-white/3 backdrop-blur-sm p-7 flex flex-col hover:border-white/15 hover:bg-white/5 transition-all duration-300 shadow-xl ${sys.glow}`}
              >
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${sys.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-white">{sys.title}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${sys.tierColor}`}>{sys.tier}</span>
                </div>
                <p className="text-sm font-semibold text-slate-300 mb-3">{sys.tagline}</p>
                <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-5">{sys.description}</p>
                <ul className="space-y-1.5">
                  {sys.metrics.map((m) => (
                    <li key={m} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          {SYSTEMS.slice(3).map((sys) => {
            const Icon = sys.icon;
            return (
              <div
                key={sys.title}
                className={`relative rounded-3xl border border-white/8 bg-white/3 backdrop-blur-sm p-7 flex flex-col hover:border-white/15 hover:bg-white/5 transition-all duration-300 shadow-xl ${sys.glow}`}
              >
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${sys.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-white">{sys.title}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${sys.tierColor}`}>{sys.tier}</span>
                </div>
                <p className="text-sm font-semibold text-slate-300 mb-3">{sys.tagline}</p>
                <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-5">{sys.description}</p>
                <ul className="space-y-1.5">
                  {sys.metrics.map((m) => (
                    <li key={m} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <p className="text-slate-400 text-base mb-6">Klar til å bygge et selvkorrigerende, profittstyrt og krisesikkert selskap?</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-900/40 hover:bg-blue-500 hover:scale-105 transition-all"
          >
            Start gratis i dag
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
