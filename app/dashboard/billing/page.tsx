'use client'

import { useState } from 'react'
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/lib/stripe'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setIsLoading(true)
    setSelectedPlan(plan)

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })

      if (!response.ok) {
        throw new Error('Failed to create subscription')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Subscription error:', error)
      alert('Kunne ikke starte abonnement. Prøv igjen.')
      setIsLoading(false)
      setSelectedPlan(null)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Velg din plan</h1>
        <p className="mt-2 text-slate-600">
          Start med 14 dagers gratis prøveperiode
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {(Object.entries(SUBSCRIPTION_PLANS) as [SubscriptionPlan, typeof SUBSCRIPTION_PLANS[SubscriptionPlan]][]).map(
          ([key, plan]) => (
            <Card
              key={key}
              className={`relative ${
                key === 'pro' ? 'border-2 border-slate-900' : ''
              }`}
            >
              {key === 'pro' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-slate-900 px-4 py-1 text-sm font-medium text-white">
                    Populær
                  </span>
                </div>
              )}

              <CardHeader>
                <CardTitle>
                  <div className="text-2xl font-bold">{plan.name}</div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price} kr</span>
                    <span className="text-slate-600">/mnd</span>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(key)}
                  disabled={isLoading}
                  className="w-full"
                  variant={key === 'pro' ? 'default' : 'outline'}
                >
                  {isLoading && selectedPlan === key
                    ? 'Starter...'
                    : 'Start gratis prøveperiode'}
                </Button>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  )
}
