export function Problems() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-3xl font-semibold text-slate-900">
          Å drive bedrift skal ikke bety å håndtere ti forskjellige verktøy
        </h2>
        <p className="mt-6 text-slate-600">
          De fleste små og mellomstore bedrifter bruker for mye tid på systemer
          som ikke snakker sammen – og taper leads og penger på det.
        </p>

        <ul className="mt-10 grid gap-6 text-left md:grid-cols-2">
          <li className="rounded-lg border p-6 text-slate-700">Separate verktøy for leads, økonomi og fakturering</li>
          <li className="rounded-lg border p-6 text-slate-700">Manuell fakturering og oppfølging som tar tid</li>
          <li className="rounded-lg border p-6 text-slate-700">Ingen sanntidsoversikt over økonomisk helse</li>
          <li className="rounded-lg border p-6 text-slate-700">Leads blir borte fordi ingen følger raskt nok opp</li>
        </ul>
      </div>
    </section>
  )
}

