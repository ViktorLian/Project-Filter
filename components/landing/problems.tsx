export function Problems() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-3xl font-semibold text-slate-900">
          Running a business shouldn't mean juggling tools
        </h2>
        <p className="mt-6 text-slate-600">
          Most small and medium businesses struggle with fragmented systems that
          slow down growth and hide critical insights.
        </p>

        <ul className="mt-10 grid gap-6 text-left md:grid-cols-2">
          <li className="rounded-lg border p-6">Multiple tools for leads, finances, and billing</li>
          <li className="rounded-lg border p-6">Manual invoice creation and follow-ups</li>
          <li className="rounded-lg border p-6">No real-time overview of financial health</li>
          <li className="rounded-lg border p-6">Lost leads due to slow response times</li>
        </ul>
      </div>
    </section>
  )
}
