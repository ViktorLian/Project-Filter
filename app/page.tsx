import { Hero } from '@/components/landing/hero'
import { Manifesto } from '@/components/landing/Manifesto'
import { Problems } from '@/components/landing/problems'
import { Features } from '@/components/landing/features'
import { SignatureSystems } from '@/components/landing/SignatureSystems'
import { DemoVideo } from '@/components/landing/DemoVideo'
import { NicheSection } from '@/components/landing/NicheSection'
import { Pricing } from '@/components/landing/pricing'
import { FAQ } from '@/components/landing/faq'
import { Contact } from '@/components/landing/contact'
import { Footer } from '@/components/landing/footer'
import { ChatWidget } from '@/components/landing/ChatWidget'
import { NewsletterPopup } from '@/components/landing/NewsletterPopup'

export default function HomePage() {
  return (
    <main className="flex flex-col">
      <Hero />
      <Manifesto />
      <Problems />
      <SignatureSystems />
      <Features />
      <DemoVideo />
      <NicheSection />
      <Pricing />
      <FAQ />
      <Contact />
      <Footer />
      <ChatWidget />
      <NewsletterPopup />
    </main>
  )
}

