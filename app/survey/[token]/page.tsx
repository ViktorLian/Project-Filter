"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SurveyPage({ params, searchParams }: any) {
  const token = params.token
  const reasonQuery = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('reason') : ''
  const [selectedReason, setSelectedReason] = useState(reasonQuery || '')
  const [detail, setDetail] = useState('')
  const [sent, setSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    await fetch('/api/record-survey-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, reason: selectedReason, detail })
    })
    setSent(true)
    setTimeout(() => router.push('/'), 2000)
  }

  if (sent) return (<div style={{ maxWidth: 600, margin: '50px auto', padding: 20 }}><h2>Takk — vi setter pris på tilbakemeldingen!</h2></div>)

  return (
    <div style={{ maxWidth: 600, margin: '50px auto', padding: 20 }}>
      <h2>Hva manglet? Vi vil bli bedre!</h2>
      <div style={{ marginTop: 30 }}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <input type="radio" name="reason" value="price" onChange={e => setSelectedReason(e.target.value)} /> Pris var for høy
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <input type="radio" name="reason" value="features" onChange={e => setSelectedReason(e.target.value)} /> Mangler features
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <input type="radio" name="reason" value="support" onChange={e => setSelectedReason(e.target.value)} /> Dårlig support
        </label>
      </div>
      <textarea placeholder="Fortell oss mer..." value={detail} onChange={e => setDetail(e.target.value)} style={{ width: '100%', height: 100, marginTop: 20 }} />
      <button onClick={handleSubmit} style={{ marginTop: 20, padding: '10px 20px' }}>Send feedback</button>
    </div>
  )
}
