import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Hanya berlaku di production (Vercel)
  const isProduction = process.env.VERCEL === '1';
  if (!isProduction) return NextResponse.next();

  // Blokir akses ke admin dashboard dari internet
  // Admin hanya boleh diakses di localhost
  if (pathname === '/' || pathname.startsWith('/api/scraper') || pathname.startsWith('/api/products') || pathname.startsWith('/api/sales') || pathname.startsWith('/api/vault') || pathname.startsWith('/api/sync') || pathname.startsWith('/api/chat') || pathname.startsWith('/api/promo')) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    const host = request.headers.get('host') || '';

    // Izinkan jika akses dari Vercel internal (preview/build checks)
    const isVercelInternal = request.headers.get('x-vercel-id') && !ip;

    if (!isVercelInternal && pathname === '/') {
      // Redirect root ke /store
      return NextResponse.redirect(new URL('/store', request.url));
    }

    if (!isVercelInternal && pathname !== '/') {
      // Blokir API admin di production
      return NextResponse.json(
        { error: 'Endpoint ini hanya tersedia di environment lokal.' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/api/scraper/:path*',
    '/api/products/:path*',
    '/api/sales/:path*',
    '/api/vault/:path*',
    '/api/sync/:path*',
    '/api/chat/:path*',
    '/api/promo/:path*',
  ]
};
