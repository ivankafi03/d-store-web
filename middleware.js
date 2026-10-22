import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Redirect root ke /store
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/store', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/']
};
