const PROBLEMS = [
  {
    icon: '⏳',
    title: 'For mye tid på salg',
    desc: 'Du bruker timer på manuell oppfølging, tilbud og fakturering – tid du heller burde bruke på jobben.',
  },
  {
    icon: '📉',
    title: 'Leads blir borte',
    desc: 'Ingen system som fanger opp og følger opp leads automatisk. Kunder velger en konkurrent mens du sover.',
  },
  {
    icon: '🔀',
    title: 'For mange verktøy',
    desc: 'CRM ett sted, faktura et annet, oppfølging i hodet. Ingen oversikt – bare kaos og rot.',
  },
  {
    icon: '🤷',
    title: 'Jobber manuelt',
    desc: 'Alt gjøres for hånd. Ingen automatisering. Du er flaskehalsen i din egen bedrift.',
  },
];

export function Problems() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-500 mb-3">Kjenner du deg igjen?</p>
          <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">
            Bruker du for mye tid på salg —<br className="hidden sm:block" /> og får for lite igjen?
          </h2>
          <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            De fleste norske småbedrifter mister leads, glemmer oppfølging og bruker for mange separate verktøy.
            <strong className="text-slate-900"> FlowPilot fikser dette.</strong>
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {PROBLEMS.map(p => (
            <div key={p.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <span className="text-3xl flex-shrink-0">{p.icon}</span>
              <div>
                <p className="font-bold text-slate-900 mb-1">{p.title}</p>
                <p className="text-slate-600 text-sm leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-900 p-8 text-center text-white">
          <p className="text-xl font-bold mb-2">FlowPilot samler alt på ett sted</p>
          <p className="text-slate-300 text-sm mb-6">Leads · Oppfølging · Automatisering · AI-analyse · Dokumenter · Fakturering</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/register" className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500 transition">
              Start gratis prøve
            </a>
            <a href="#how-it-works" className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white hover:bg-white/15 transition">
              Se hvordan det fungerer
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

