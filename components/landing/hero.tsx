import { ArrowRight, BarChart3, FileText, Filter } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Manage Leads, Track Cashflow, Generate Invoices – All in One Platform
            </h1>
            <p className="mt-6 text-lg text-slate-600">
              FlowPilot helps modern businesses streamline operations with one
              unified system for lead management, financial insight, and billing.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/dashboard"
                className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                View Demo
              </a>
            </div>
          </div>

          <div className="relative rounded-xl border bg-white p-6 shadow-sm">
            <div className="grid grid-cols-3 gap-4 text-slate-700">
              <Feature icon={Filter} title="Project Filter" />
              <Feature icon={BarChart3} title="Cashflow" />
              <Feature icon={FileText} title="Invoices" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Feature({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border p-4 text-center">
      <Icon className="h-6 w-6 text-blue-600" />
      <span className="mt-2 text-sm font-medium">{title}</span>
    </div>
  )
}
