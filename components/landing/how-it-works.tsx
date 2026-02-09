export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Create Your Forms',
      description: 'Design custom intake forms with our intuitive builder. Add questions, set scoring criteria, and embed anywhere.',
    },
    {
      number: '02',
      title: 'Qualify Leads Automatically',
      description: 'FlowPilot scores each submission based on your criteria. Focus on the highest-quality opportunities first.',
    },
    {
      number: '03',
      title: 'Track Your Finances',
      description: 'Monitor income and expenses in real-time. See your financial health status and runway at a glance.',
    },
    {
      number: '04',
      title: 'Generate & Send Invoices',
      description: 'Convert qualified leads to professional invoices. Generate PDFs and send via email with one click.',
    },
  ]

  return (
    <section id="how-it-works" className="bg-gradient-to-b from-slate-50 to-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900">How FlowPilot Works</h2>
          <p className="mt-4 text-lg text-slate-600">Get started in minutes, not hours</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              {/* Connector line (except last item) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent z-0" />
              )}
              
              <div className="relative bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-2xl font-bold text-white shadow-md">
                  {step.number}
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/register"
            className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all"
          >
            Start Your Free Trial
            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
