import { Filter, BarChart3, FileText } from 'lucide-react'

export function FeaturesOverview() {
  return (
    <section id="features" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <Card
            icon={Filter}
            title="Project Filter"
            points={[
              'Custom intake forms',
              'Automatic lead scoring',
              'Real-time analytics',
              'Embeddable anywhere',
            ]}
          />
          <Card
            icon={BarChart3}
            title="Cashflow Tracker"
            points={[
              'Income & expense tracking',
              'Financial health status',
              'Runway projections',
              'CSV export',
            ]}
          />
          <Card
            icon={FileText}
            title="Invoice Generator"
            points={[
              'Professional PDF invoices',
              'Email delivery',
              'Status tracking',
              'Lead-to-invoice conversion',
            ]}
          />
        </div>
      </div>
    </section>
  )
}

function Card({ icon: Icon, title, points }: any) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <Icon className="h-6 w-6 text-blue-600" />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {points.map((p: string) => (
          <li key={p}>• {p}</li>
        ))}
      </ul>
    </div>
  )
}
