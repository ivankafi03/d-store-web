import { NextResponse } from 'next/server';
import { USER_COOKIE_NAME, verifyUserSessionToken } from './lib/userAuth';
import { COOKIE_NAME as ADMIN_COOKIE_NAME, verifySessionToken } from './lib/auth';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Hanya berlaku di production (Vercel)
  const isProduction = process.env.VERCEL === '1';
  if (!isProduction) return NextResponse.next();

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/store', request.url));
  }

  // Cek apakah request ke API sensitif / internal
  if (
    pathname.startsWith('/api/scraper') || 
    pathname.startsWith('/api/products') || 
    pathname.startsWith('/api/sales') || 
    pathname.startsWith('/api/vault') || 
    pathname.startsWith('/api/sync')
  ) {
    // GET ke /api/products selalu diizinkan untuk toko online publik membaca katalog
    if (pathname === '/api/products' && request.method === 'GET') {
      return NextResponse.next();
    }

    const cookieHeader = request.headers.get('cookie') || '';

    // Verifikasi akses: jika sudah membawa cookie session user atau admin, loloskan ke Route Handler
    // (Route Handler /api/products sendiri yang akan memverifikasi integritas autentikasinya)
    if (userToken || token) {
      return NextResponse.next();
    }

    // Blokir hanya jika tidak ada session sama sekali
    return NextResponse.json(
      { error: 'Akses ditolak (403 Forbidden). Harap login terlebih dahulu.' },
      { status: 403 }
    );
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
  ]
};
