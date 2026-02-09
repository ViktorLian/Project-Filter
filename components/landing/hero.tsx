import { ArrowRight, BarChart3, FileText, Filter, Menu } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <>
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <nav className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">FP</span>
              </div>
              <div>
                <span className="text-xl font-bold text-slate-900">FlowPilot</span>
                <p className="text-xs text-slate-500">3-in-1 Business Management</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">How It Works</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Pricing</a>
              <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Contact</a>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                Sign Up Free
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 mb-6">
                3-in-1 Platform
              </div>
              <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                FlowPilot
              </h1>
              <p className="mt-4 text-xl font-medium text-blue-600">
                Streamline Your Business Operations
              </p>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                One unified platform for lead management, financial insight, and professional invoicing.
                Stop juggling multiple tools and start growing your business.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center rounded-lg border-2 border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-all"
                >
                  See How It Works
                </a>
              </div>
              <p className="mt-4 text-sm text-slate-500">14-day free trial • No credit card required</p>
            </div>

            {/* Geometric Feature Bubbles - 6 circles */}
            <div className="relative h-[500px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-full w-full">
                  {/* Center large bubble */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl">
                    <div className="text-center text-white">
                      <p className="text-sm font-medium">All-in-One</p>
                      <p className="text-3xl font-bold">3 Tools</p>
                    </div>
                  </div>

                  {/* Top-left bubble - Lead Management */}
                  <div className="absolute left-[10%] top-[15%] flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg hover:scale-110 transition-transform">
                    <div className="text-center">
                      <Filter className="mx-auto h-8 w-8 text-slate-700" />
                      <p className="mt-2 text-xs font-semibold text-slate-700">Lead Management</p>
                    </div>
                  </div>

                  {/* Top-right bubble - Cashflow */}
                  <div className="absolute right-[10%] top-[20%] flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-lg hover:scale-110 transition-transform">
                    <div className="text-center">
                      <BarChart3 className="mx-auto h-8 w-8 text-emerald-700" />
                      <p className="mt-2 text-xs font-semibold text-emerald-700">Cashflow Tracking</p>
                    </div>
                  </div>

                  {/* Bottom-left bubble - Invoices */}
                  <div className="absolute bottom-[20%] left-[15%] flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg hover:scale-110 transition-transform">
                    <div className="text-center">
                      <FileText className="mx-auto h-8 w-8 text-blue-700" />
                      <p className="mt-2 text-xs font-semibold text-blue-700">Invoice Generation</p>
                    </div>
                  </div>

                  {/* Bottom-right bubble - Integration */}
                  <div className="absolute bottom-[15%] right-[15%] flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-200 shadow-lg hover:scale-110 transition-transform">
                    <div className="text-center">
                      <svg className="mx-auto h-7 w-7 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <p className="mt-1 text-xs font-semibold text-purple-700">Zapier</p>
                    </div>
                  </div>

                  {/* Top bubble - Analytics */}
                  <div className="absolute left-1/2 top-[5%] flex h-28 w-28 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 shadow-lg hover:scale-110 transition-transform">
                    <div className="text-center">
                      <svg className="mx-auto h-7 w-7 text-orange-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="mt-1 text-xs font-semibold text-orange-700">Analytics</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
