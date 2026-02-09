import { Filter, BarChart3, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function FeaturesOverview() {
  return (
    <section id="features" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900">Three Powerful Tools, One Platform</h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need to manage leads, track finances, and invoice clients - seamlessly integrated.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card
            icon={Filter}
            title="Lead Management"
            description="Capture and qualify leads automatically"
            points={[
              'Custom intake forms',
              'Automatic lead scoring',
              'Real-time dashboard',
              'Email notifications',
            ]}
            color="blue"
          />
          <Card
            icon={BarChart3}
            title="Cashflow Tracking"
            description="Monitor your financial health in real-time"
            points={[
              'Income & expense tracking',
              'Health status indicator',
              'Runway calculations',
              'CSV export for accounting',
            ]}
            color="emerald"
          />
          <Card
            icon={FileText}
            title="Invoice Generation"
            description="Create and send professional invoices"
            points={[
              'PDF invoice creation',
              'Automated email delivery',
              'Payment status tracking',
              'Convert leads to invoices',
            ]}
            color="purple"
          />
        </div>
      </div>
    </section>
  )
}

function Card({ icon: Icon, title, description, points, color }: any) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    emerald: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
  }

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all hover:border-slate-300">
      <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-md transition-transform group-hover:scale-110`}>
        <Icon className="h-7 w-7 text-white" />
      </div>
      <h3 className="mt-6 text-2xl font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <ul className="mt-6 space-y-3 text-sm text-slate-700">
        {points.map((p: string) => (
          <li key={p} className="flex items-start gap-2">
            <svg className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className="mt-6 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
      >
        Get Started
        <ArrowRight className="ml-1 h-4 w-4" />
      </Link>
    </div>
  )
}
