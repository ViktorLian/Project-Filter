import { ArrowRight, Zap, Bot, Mail, MessageSquare, Calendar, BarChart3, FileText, CreditCard, Star, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <>
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-7xl px-6">
          <nav className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">FP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900">FlowPilot</span>
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">BETA</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Funksjoner</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Slik fungerer det</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Priser</a>
              <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Kontakt</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition hidden sm:block">Logg inn</Link>
              <Link href="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm">Proev gratis</Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-36">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300 mb-8">
              <Zap className="h-4 w-4" />
              Alt-i-ett plattform for norske bedrifter
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
              Automatiser veksten.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Selg smartere.
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
              FlowPilot samler lead-haandtering, AI-kundeservice, bookingsystem, SMS-paaminnnelser,
              fakturering og vekstautomatisering i en plattform. Fra forste kontakt til betalt faktura – helt automatisk.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-900/40 hover:bg-blue-500 hover:scale-105 transition-all"
              >
                Start 14-dagers gratis proeveperiode
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all"
              >
                Se hvordan det fungerer
              </a>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-400" />14 dager gratis</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-400" />Ingen binding</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-400" />Avbryt naar som helst</span>
            </div>
          </div>
          <div className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl mx-auto">
            {[
              { value: '10x', label: 'Raskere lead-haandtering' },
              { value: '80%', label: 'Faerre no-shows med SMS' },
              { value: '14d', label: 'Gratis proeveperiode' },
              { value: 'inf', label: 'Leads paa Enterprise' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-sm">
                <p className="text-3xl font-extrabold text-white">{s.value === 'inf' ? '\u221e' : s.value}</p>
                <p className="mt-1 text-xs text-slate-400 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section id="features" className="bg-slate-50 border-b border-slate-200 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-slate-500 mb-10">Alt du trenger i en plattform</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { icon: Bot, label: 'AI kundeservice-bot', color: 'bg-violet-100 text-violet-600' },
              { icon: Mail, label: 'E-postkampanjer', color: 'bg-blue-100 text-blue-600' },
              { icon: MessageSquare, label: 'SMS-paminnnelser', color: 'bg-green-100 text-green-600' },
              { icon: Calendar, label: 'Bookingsystem', color: 'bg-orange-100 text-orange-600' },
              { icon: BarChart3, label: 'ROI-tracking', color: 'bg-pink-100 text-pink-600' },
              { icon: FileText, label: 'Fakturering', color: 'bg-cyan-100 text-cyan-600' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-center hover:shadow-md transition">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold text-slate-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900">Slik fungerer FlowPilot</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">Fra lead til betalt kunde – automatisert fra start til slutt</p>
          </div>
          <div className="grid gap-10 md:grid-cols-4">
            {[
              { step: '01', title: 'Lead inn', desc: 'Kunder fyller ut ditt tilpassede skjema eller chatter med AI-boten paa nettsiden din.' },
              { step: '02', title: 'AI-scoring', desc: 'FlowPilot scorer og kategoriserer leaden automatisk basert paa svar og kontaktinfo.' },
              { step: '03', title: 'Automatisert oppfoelging', desc: 'E-post, SMS, booking-link eller betalingsforesprsel sendes automatisk.' },
              { step: '04', title: 'Betalt kunde', desc: 'Faktura sendes og betales. Du ser ROI og inntekter i sanntid paa dashbordet.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{step}</div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
                  <p className="mt-2 text-slate-600 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed features */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900">Kraftige funksjoner som leverer resultater</h2>
            <p className="mt-4 text-lg text-slate-600">Bygget for bedrifter som vil vokse uten aa ansette mer</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Bot, color: 'bg-violet-600', title: 'AI Kundeservice-bot', desc: 'Din 24/7 digitale selger. Svarer paa sporsmal, samler kontaktinfo og sender leads rett inn i systemet.' },
              { icon: Mail, color: 'bg-blue-600', title: 'Automatiske e-postkampanjer', desc: 'Personaliserte sekvenser til hele lead-listen. Velkomst og oppfoelging dag 1, 3, 7 og 14 – automatisk.' },
              { icon: MessageSquare, color: 'bg-green-600', title: 'SMS-paminnnelser', desc: 'Reduser no-shows med opptil 80%. Automatiske SMS-varsler dagen foer avtalen.' },
              { icon: Calendar, color: 'bg-orange-500', title: 'Bookingsystem med Google Kalender', desc: 'La kunder booke tid direkte fra nettsiden. Synkronisert med Google Kalender og automatisk bekreftelse.' },
              { icon: BarChart3, color: 'bg-pink-600', title: 'Lead ROI-tracking', desc: 'Se noeyaktig hvilke kanaler gir mest inntekter. Konverteringsrate og inntekt per lead paa ett sted.' },
              { icon: FileText, color: 'bg-cyan-600', title: 'Profesjonell fakturering', desc: 'Generer og send fakturaer paa sekunder. Automatiske betalingspaminnnelser og kontantstromsoversikt.' },
              { icon: CreditCard, color: 'bg-emerald-600', title: 'Betalingslink-generator', desc: 'Send kunden en betalingslink via e-post eller chat. Stripe-drevet, sikkert og lynraskt.' },
              { icon: Star, color: 'bg-yellow-500', title: 'AI lead-scoring', desc: 'Hvert lead scores 0-100 basert paa svar og atferd. Prioriter de hotteste leadsene.' },
              { icon: Zap, color: 'bg-indigo-600', title: 'No-show deteksjon', desc: 'Oppdager automatisk kunder som ikke moette opp. Sender rebook-lenke og logger alt.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="rounded-2xl bg-white border border-slate-200 p-6 hover:shadow-lg transition">
                <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
