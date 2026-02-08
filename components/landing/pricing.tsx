export function Pricing() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="text-3xl font-semibold">Simple, Transparent Pricing</h2>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <Plan title="Starter" price="500 NOK" features={[
            '50 leads / month',
            '20 invoices / month',
            'Basic cashflow tracking',
            'Email support',
          ]} />
          <Plan highlighted title="Pro" price="1,500 NOK" features={[
            'Unlimited leads',
            'Unlimited invoices',
            'Advanced analytics',
            'Zapier integration',
            'Priority support',
          ]} />
          <Plan title="Enterprise" price="3,500 NOK" features={[
            'Custom branding',
            'API access',
            'Dedicated account manager',
            'White-label options',
          ]} />
        </div>

        <p className="mt-8 text-sm text-slate-500">
          All plans include SSL security, daily backups, and 99.9% uptime.
        </p>
      </div>
    </section>
  )
}

function Plan({ title, price, features, highlighted }: any) {
  return (
    <div className={`rounded-xl border p-6 ${highlighted ? 'border-blue-600 shadow-md' : ''}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-4 text-3xl font-bold">{price}</p>
      <ul className="mt-6 space-y-2 text-sm text-slate-600">
        {features.map((f: string) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>
      <a
        href="/dashboard"
        className="mt-6 inline-block w-full rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700 transition"
      >
        Get Started
      </a>
    </div>
  )
}
