import { Hero } from '@/components/landing/hero'
import { Problems } from '@/components/landing/problems'
import { Features } from '@/components/landing/features'
import { Pricing } from '@/components/landing/pricing'
import { FAQ } from '@/components/landing/faq'
import { Contact } from '@/components/landing/contact'
import { Footer } from '@/components/landing/footer'
import { ChatWidget } from '@/components/landing/ChatWidget'

export default function HomePage() {
  return (
    <main className="flex flex-col">
      <Hero />
      <Problems />
      <Features />
      <Pricing />
      <FAQ />
      <Contact />
      <Footer />
      <ChatWidget />
    </main>
  )
}

