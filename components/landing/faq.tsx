export function FAQ() {
  const items = [
    ['Can I cancel anytime?', 'Yes, there are no long-term contracts.'],
    ['Is my data secure?', 'Yes. We use bank-level encryption via Supabase.'],
    ['Do you offer a free trial?', 'Yes, 14 days with no credit card required.'],
    ['Can I import existing data?', 'Yes, CSV import is supported.'],
    ['What payment methods do you accept?', 'All major cards via Stripe.'],
    ['Is there a setup fee?', 'No. Get started immediately.'],
  ]

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-3xl font-semibold text-center">Frequently Asked Questions</h2>
        <div className="mt-10 space-y-4">
          {items.map(([q, a]) => (
            <div key={q} className="rounded-lg border bg-white p-4">
              <p className="font-medium">{q}</p>
              <p className="mt-2 text-sm text-slate-600">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
