import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
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
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/register', '/dashboard/:path*']
}
