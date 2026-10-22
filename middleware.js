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

    // 1. Cek sesi Google User ivankafipradana@gmail.com
    const userMatch = cookieHeader.match(new RegExp(`(?:^|;\\s*)${USER_COOKIE_NAME}=([^;]+)`));
    const userToken = userMatch ? decodeURIComponent(userMatch[1]) : null;
    if (userToken) {
      try {
        const verifiedUser = verifyUserSessionToken(userToken);
        if (verifiedUser && verifiedUser.email?.toLowerCase().trim() === 'ivankafipradana@gmail.com') {
          return NextResponse.next();
        }
      } catch {}
    }

    // 2. Cek token admin session PIN
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`));
    const token = match ? decodeURIComponent(match[1]) : null;
    if (token) {
      try {
        const adminSession = verifySessionToken(token);
        if (adminSession) {
          return NextResponse.next();
        }
      } catch {}
    }

    // Blokir jika tidak memiliki autentikasi owner atau admin
    return NextResponse.json(
      { error: 'Akses ditolak (403 Forbidden). Anda harus login sebagai Pemilik Toko (ivankafipradana@gmail.com) untuk mengakses fitur ini.' },
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
