import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // المسارات العامة التي لا تحتاج تسجيل دخول
  const publicPaths = ['/auth/login', '/auth/signup', '/auth/reset', '/favicon.ico']

  if (!session && !publicPaths.some(path => pathname.startsWith(path))) {
    const loginUrl = new URL('/auth/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  if (session && publicPaths.some(path => pathname.startsWith(path))) {
    const homeUrl = new URL('/', req.url)
    return NextResponse.redirect(homeUrl)
  }

  return res
}

export const config = {
  matcher: ['/', '/((?!api|_next|static|favicon.ico).*)'],
}