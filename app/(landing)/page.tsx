'use client'

import { Hero } from '@/components/landing/hero'
import { Problems } from '@/components/landing/problems'
import { FeaturesOverview } from '@/components/landing/features-overview'
import { HowItWorks } from '@/components/landing/how-it-works'
import { DetailedFeatures } from '@/components/landing/detailed-features'
import { Pricing } from '@/components/landing/pricing'
import { FAQ } from '@/components/landing/faq'
import { Contact } from '@/components/landing/contact'
import { Footer } from '@/components/landing/footer'

export default function LandingPage() {
  return (
    <main className="flex flex-col">
      <Hero />
      <Problems />
      <FeaturesOverview />
      <HowItWorks />
      <DetailedFeatures />
      <Pricing />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  )
}
