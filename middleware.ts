import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // TEMPORARY: Disabled for local testing
  return NextResponse.next()
  
  /* const path = request.nextUrl.pathname
  
  // Skip auth check in development mode for easy testing
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }
  
  // Protect dashboard routes
  if (path.startsWith('/dashboard')) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    if (!token) {
      // Not logged in - redirect to login
      const url = new URL('/login', request.url)
      url.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(url)
    }
  }
  
  return NextResponse.next() */
}

export const config = {
  matcher: ['/dashboard/:path*']
}
