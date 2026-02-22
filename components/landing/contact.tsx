'use client'

import { useState } from 'react'

export function Contact() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      company: formData.get('company'),
      message: formData.get('message'),
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to send message')

      setSuccess(true)
      ;(e.target as HTMLFormElement).reset()
    } catch (err) {
      setError('Klarte ikke sende meldingen. Send oss en e-post direkte på Flowpilot@hotmail.com')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="bg-gradient-to-b from-white to-slate-50 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900">Ta kontakt</h2>
          <p className="mt-4 text-lg text-slate-600">
            Har du spørsmål? Vi svarer raskt. Send oss en melding så tar vi kontakt.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-4 rounded-lg">
                ✓ Meldingen er sendt! Vi tar kontakt så snart som mulig.
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Navn
              </label>
              <input
                id="name"
                name="name"
                required
                className="w-full rounded-lg border border-slate-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                placeholder="Ola Nordmann"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                E-postadresse
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-slate-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                placeholder="ola@bedriften.no"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
                Bedriftsnavn (valgfritt)
              </label>
              <input
                id="company"
                name="company"
                className="w-full rounded-lg border border-slate-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                placeholder="Din bedrift AS"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                Melding
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full rounded-lg border border-slate-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition resize-none"
                placeholder="Fortell oss hva du trenger hjelp med..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-6 py-4 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
            >
              {loading ? 'Sender...' : 'Send melding'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600">
              Eller send e-post direkte til{' '}
              <a href="mailto:Flowpilot@hotmail.com" className="font-semibold text-blue-600 hover:text-blue-700">
                Flowpilot@hotmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
