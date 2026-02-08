export function HowItWorks() {
  const steps = [
    ['Create Your Forms', 'Design custom intake forms in minutes'],
    ['Qualify Leads', 'Automatic scoring helps you prioritize'],
    ['Track Finances', 'Monitor income and expenses in real time'],
    ['Generate Invoices', 'Convert leads into paid clients'],
  ]

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-semibold">How FlowPilot Works</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {steps.map(([title, desc], i) => (
            <div key={i} className="rounded-lg border p-6">
              <span className="text-sm font-semibold text-blue-600">
                Step {i + 1}
              </span>
              <h3 className="mt-2 font-medium">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
