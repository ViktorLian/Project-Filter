import { Hero } from '@/components/landing/hero'
import { Problems } from '@/components/landing/problems'
import { FeaturesOverview } from '@/components/landing/features-overview'
import { HowItWorks } from '@/components/landing/how-it-works'
import { DetailedFeatures } from '@/components/landing/detailed-features'
import { Pricing } from '@/components/landing/pricing'
import { FAQ } from '@/components/landing/faq'
import { Contact } from '@/components/landing/contact'
import { Footer } from '@/components/landing/footer'

export default function HomePage() {
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

          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Filter and Qualify <br />
            <span className="text-slate-900">Project Leads Automatically</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Stop wasting time on unqualified leads. ProjectFilter helps you capture, score, and prioritize the projects that matter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg h-12 px-8">
              <Link href="/dashboard/billing">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8">
              <a href="#pricing">View Pricing</a>
            </Button>
          </div>
          <p className="mt-4 text-sm text-slate-500">14-day free trial • No credit card required</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose ProjectFilter?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to streamline your project inquiry process
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-slate-900 mb-4" />
                <CardTitle>Smart Forms</CardTitle>
                <CardDescription>
                  Create custom intake forms that automatically qualify leads based on your criteria
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-slate-900 mb-4" />
                <CardTitle>Lead Scoring</CardTitle>
                <CardDescription>
                  Automatically score and prioritize leads so you can focus on the best opportunities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Mail className="h-10 w-10 text-slate-900 mb-4" />
                <CardTitle>Instant Notifications</CardTitle>
                <CardDescription>
                  Get notified immediately when high-quality leads come in
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-slate-900 mb-4" />
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Enterprise-grade security with 99.9% uptime guarantee
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-slate-900 mb-4" />
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Work together with your team to manage and respond to leads
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-slate-900 mb-4" />
                <CardTitle>Integrations</CardTitle>
                <CardDescription>
                  Connect with Zapier, webhooks, and your favorite tools
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-slate-600">Choose the plan that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {(Object.entries(SUBSCRIPTION_PLANS) as [keyof typeof SUBSCRIPTION_PLANS, typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS]][]).map(([key, plan]) => (
              <Card key={key} className={key === 'pro' ? 'border-2 border-slate-900 relative' : ''}>
                {key === 'pro' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-slate-900 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price} kr</span>
                    <span className="text-slate-600">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={key === 'pro' ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/dashboard/billing">Start Free Trial</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
export default function HomePage() {
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

              </div>
              <span className="font-semibold">ProjectFilter</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-600">
              <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-900">Terms</Link>
              <a href="mailto:Flowpilot@hotmail.com" className="hover:text-slate-900">Contact</a>
            </div>
            <p className="text-sm text-slate-500">
              © 2026 ProjectFilter. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
