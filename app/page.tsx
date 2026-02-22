import { Hero } from '@/components/landing/hero'
import { Problems } from '@/components/landing/problems'
import { Pricing } from '@/components/landing/pricing'
import { FAQ } from '@/components/landing/faq'
import { Contact } from '@/components/landing/contact'
import { Footer } from '@/components/landing/footer'

export default function HomePage() {
  return (
    <main className="flex flex-col">
      <Hero />
      <Problems />
      <Pricing />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  )
}

