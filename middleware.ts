import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { readEnv } from '@/lib/env'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const token = await getToken({ 
    req: request,
    secret: readEnv('NEXTAUTH_SECRET'),
    secureCookie: request.nextUrl.protocol === 'https:',
  })

  // Logged-in users should go straight to dashboard from public pages
  if (token && (path === '/' || path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protect dashboard routes — unauthenticated users go to login
  if (!token && path.startsWith('/dashboard')) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(url)
  }

  // Dashboard APIs must be protected as well as dashboard pages. Public
  // capture endpoints, auth, billing and signed webhooks are intentionally
  // excluded because they have their own access controls.
  const publicApiPrefixes = [
    '/api/auth',
    '/api/register',
    '/api/contact',
    '/api/newsletter',
    '/api/service-inquiry',
    '/api/forms/submit',
    '/api/capture-chat-lead',
    '/api/customer-chatbot',
    '/api/feedback-surveys',
    '/api/record-survey-response',
    '/api/stripe',
    '/api/webhooks',
    '/api/cron',
    '/api/subscribe',
    '/api/subscription',
    '/api/team/join',
    '/api/integrations/orders/completed',
  ]
  const isPublicFormSubmission = /^\/api\/forms\/[^/]+\/submit$/.test(path)
  const isProtectedApi = path.startsWith('/api/') &&
    !isPublicFormSubmission &&
    !publicApiPrefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`))

  if (isProtectedApi) {
    if (!token) {
      return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
    }

    const companyId = token.companyId || token.id
    const supabaseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL')
    const serviceKey = readEnv('SUPABASE_SERVICE_ROLE_KEY')
    if (!companyId || !supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Abonnementskontroll er ikke konfigurert' }, { status: 503 })
    }

    const subscriptionResponse = await fetch(
      `${supabaseUrl}/rest/v1/leads_companies?id=eq.${encodeURIComponent(String(companyId))}&select=subscription_status,trial_ends_at&limit=1`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        cache: 'no-store',
      }
    )

    if (!subscriptionResponse.ok) {
      return NextResponse.json({ error: 'Kunne ikke kontrollere abonnement' }, { status: 503 })
    }

    const [company] = await subscriptionResponse.json() as Array<{
      subscription_status?: string
      trial_ends_at?: string | null
    }>
    const trialActive = company?.subscription_status === 'trialing' &&
      Boolean(company.trial_ends_at) &&
      new Date(company.trial_ends_at as string) > new Date()
    const hasAccess = company?.subscription_status === 'active' || trialActive

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Aktivt abonnement kreves', code: 'SUBSCRIPTION_REQUIRED' },
        { status: 402 }
      )
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/register', '/dashboard/:path*', '/api/:path*']
}
