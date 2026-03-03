import { ArrowRight, Zap, Bot, Mail, MessageSquare, Calendar, BarChart3, FileText, CheckCircle, Activity, Shield, TrendingUp, Globe, RefreshCw, Brain } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <>
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#0a0f1a]/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6">
          <nav className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-900/40">
                <span className="text-white font-bold text-sm">FP</span>
              </div>
              <span className="text-xl font-bold text-white">FlowPilot</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-400 hover:text-blue-400 transition">Funksjoner</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-400 hover:text-blue-400 transition">Slik fungerer det</a>
              <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-blue-400 transition">Priser</a>
              <a href="#contact" className="text-sm font-medium text-slate-400 hover:text-blue-400 transition">Kontakt</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition hidden sm:block">Logg inn</Link>
              <Link href="/register" className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition shadow-lg shadow-blue-900/30">Prøv gratis</Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0a0f1a]">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px]" />
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-36">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300 mb-8 backdrop-blur-sm">
              <Zap className="h-4 w-4" />
              Bygget for norske vekstbedrifter
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
              Ikke bare et verktøy.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400">
                Infrastruktur.
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
              CRM-systemet som faktisk er <strong className="text-white">tilpasset din bransje</strong>. Velg din nisje og få
              et komplett operativsystem — leads, oppfølging, booking, faktura og AI — alt i én plattform.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-900/40 hover:opacity-90 hover:scale-105 transition-all"
              >
                Start 14 dagers gratis prøveperiode
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-8 py-4 text-base font-semibold text-slate-200 hover:bg-slate-700 hover:border-slate-600 transition-all backdrop-blur-sm"
              >
                Se hvordan det fungerer
              </a>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-400" />14 dager gratis</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-400" />Ingen binding</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-400" />Avslutt når som helst</span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl mx-auto">
            {[
              { value: '18+', label: 'Nisje-pakker' },
              { value: '50+', label: 'Moduler og systemer' },
              { value: 'Kr 0', label: 'Oppstartsgebyr' },
              { value: '24/7', label: 'Selvkorrigerende AI' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center backdrop-blur-sm">
                <p className="text-3xl font-extrabold text-white">{s.value}</p>
                <p className="mt-1 text-xs text-slate-400 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature stripe */}
      <section id="features" className="bg-slate-900/80 border-y border-slate-800 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-slate-500 mb-10">Alt du trenger i én plattform – over 50 moduler</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { icon: Activity, label: 'Business Nervesystem', color: 'bg-emerald-500/10 text-emerald-400', border: 'border-emerald-500/20' },
              { icon: TrendingUp, label: 'Profit Intelligence', color: 'bg-orange-500/10 text-orange-400', border: 'border-orange-500/20' },
              { icon: Globe, label: 'Market Domination', color: 'bg-cyan-500/10 text-cyan-400', border: 'border-cyan-500/20' },
              { icon: RefreshCw, label: 'Self-Healing Company', color: 'bg-teal-500/10 text-teal-400', border: 'border-teal-500/20' },
              { icon: Shield, label: 'Crisis-Proof Arkitektur', color: 'bg-red-500/10 text-red-400', border: 'border-red-500/20' },
              { icon: Bot, label: 'AI Kundeservice', color: 'bg-violet-500/10 text-violet-400', border: 'border-violet-500/20' },
              { icon: Mail, label: 'E-postkampanjer', color: 'bg-blue-500/10 text-blue-400', border: 'border-blue-500/20' },
              { icon: MessageSquare, label: 'SMS-påminnelser', color: 'bg-emerald-500/10 text-emerald-400', border: 'border-emerald-500/20' },
              { icon: Calendar, label: 'Bookingsystem', color: 'bg-yellow-500/10 text-yellow-400', border: 'border-yellow-500/20' },
              { icon: BarChart3, label: 'ROI-sporing', color: 'bg-pink-500/10 text-pink-400', border: 'border-pink-500/20' },
              { icon: FileText, label: 'Fakturering', color: 'bg-indigo-500/10 text-indigo-400', border: 'border-indigo-500/20' },
              { icon: Brain, label: 'AI Analyse', color: 'bg-purple-500/10 text-purple-400', border: 'border-purple-500/20' },
            ].map(({ icon: Icon, label, color, border }) => (
              <div key={label} className={`flex flex-col items-center gap-3 rounded-2xl border ${border} bg-slate-900 p-4 text-center hover:bg-slate-800 transition`}>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-slate-300 leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-[#0a0f1a] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white">Slik fungerer FlowPilot</h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">Fra lead til betalt kunde – automatisert fra start til slutt</p>
          </div>
          <div className="grid gap-10 md:grid-cols-4">
            {[
              { step: '01', title: 'Lead inn', desc: 'Kunder fyller ut ditt tilpassede skjema eller chatter med AI-boten på nettsiden din.', color: 'from-blue-600 to-blue-500' },
              { step: '02', title: 'AI-scoring', desc: 'FlowPilot scorer og kategoriserer leaden automatisk basert på svar og kontaktinfo.', color: 'from-cyan-600 to-cyan-500' },
              { step: '03', title: 'Automatisert oppfølging', desc: 'E-post, SMS, booking-lenke eller betalingsforespørsel sendes automatisk.', color: 'from-purple-600 to-purple-500' },
              { step: '04', title: 'Betalt kunde', desc: 'Faktura sendes og betales. Du ser ROI og inntekter i sanntid på dashbordet.', color: 'from-emerald-600 to-emerald-500' },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="flex flex-col items-start gap-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg`}>{step}</div>
                <div>
                  <h3 className="font-bold text-white text-lg">{title}</h3>
                  <p className="mt-2 text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
