'use client'

export function Contact() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-semibold">Get in Touch</h2>
        <p className="mt-4 text-slate-600">
          Contact us for custom enterprise solutions or general questions.
        </p>

        <form className="mt-8 grid gap-4">
          <input className="rounded-md border p-3" placeholder="Name" />
          <input className="rounded-md border p-3" placeholder="Email" />
          <input className="rounded-md border p-3" placeholder="Company" />
          <textarea className="rounded-md border p-3" placeholder="Message" rows={4} />
          <button className="rounded-md bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition">
            Send Message
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          Or email us directly: Flowpilot@hotmail.com
        </p>
      </div>
    </section>
  )
}
