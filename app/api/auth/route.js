import { NextResponse } from 'next/server';
import { verifyPin, createSessionToken, COOKIE_NAME, isAuthenticatedRequest } from '@/lib/auth';

export async function GET(request) {
  const isAuth = isAuthenticatedRequest(request);
  return NextResponse.json({ authenticated: isAuth });
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, pin } = body;

    if (action === 'login') {
      if (!pin || typeof pin !== 'string') {
        return NextResponse.json({ ok: false, error: 'PIN wajib diisi' }, { status: 400 });
      }

      const isValid = verifyPin(pin.trim());
      if (!isValid) {
        return NextResponse.json({ ok: false, error: 'PIN salah. Akses ditolak.' }, { status: 401 });
      }

      const token = createSessionToken();
      const response = NextResponse.json({ ok: true, message: 'Autentikasi berhasil' });

      // Simpan cookie HttpOnly yang aman
      response.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 hari
        path: '/'
      });

      return response;
    }

    if (action === 'logout') {
      const response = NextResponse.json({ ok: true, message: 'Berhasil keluar' });
      response.cookies.set({
        name: COOKIE_NAME,
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      });
      return response;
    }

    return NextResponse.json({ ok: false, error: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (err) {
    console.error('[API Auth Error]', err);
    return NextResponse.json({ ok: false, error: 'Terjadi kesalahan internal' }, { status: 500 });
  }
}
