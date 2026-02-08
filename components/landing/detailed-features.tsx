export function DetailedFeatures() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-6 space-y-20">
        <Block
          title="Project Filter – Smarter Lead Management"
          items={[
            'Form builder with conditional logic',
            'Automatic lead scoring',
            'Acceptance rate analytics',
            'Webhook automation via Zapier',
            'Simple embed code',
          ]}
        />
        <Block
          title="Cashflow Tracker – Know Your Financial Health"
          items={[
            'Green / Yellow / Red health status',
            'Income & expense categorization',
            'Monthly and yearly reports',
            'Runway calculation',
            'Real-time charts',
          ]}
        />
        <Block
          title="Invoice Generator – Get Paid Faster"
          items={[
            'Professional PDF templates',
            'Automated email delivery',
            'Customer database',
            'Overdue invoice detection',
            'One-click lead conversion',
          ]}
        />
      </div>
    </section>
  )
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-2xl font-semibold">{title}</h3>
      <ul className="mt-6 grid gap-4 md:grid-cols-2 text-slate-600">
        {items.map(i => (
          <li key={i} className="rounded-lg border bg-white p-4">
            {i}
          </li>
        ))}
      </ul>
    </div>
  )
}
