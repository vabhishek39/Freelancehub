import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
    const payload = await decrypt(session);
    if (payload.role !== 'admin') return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect freelancer routes
  if (pathname.startsWith('/freelancer')) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
    const payload = await decrypt(session);
    if (payload.role !== 'freelancer') return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect client routes
  if (pathname.startsWith('/client')) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
    const payload = await decrypt(session);
    if (payload.role !== 'client') return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/freelancer/:path*', '/client/:path*'],
};
