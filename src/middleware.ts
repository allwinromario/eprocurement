import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = request.nextUrl

  // If not authenticated, redirect to login
  if (!token && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based route protection
  if (pathname.startsWith('/dashboard/superadmin') && token?.role !== 'SUPERADMIN') {
    return NextResponse.redirect(new URL('/dashboard/not-authorized', request.url))
  }
  if (pathname.startsWith('/dashboard/admin') && token?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard/not-authorized', request.url))
  }
  if (pathname.startsWith('/dashboard/vendor') && token?.role !== 'VENDOR') {
    return NextResponse.redirect(new URL('/dashboard/not-authorized', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
} 