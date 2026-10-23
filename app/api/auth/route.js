import { NextResponse } from 'next/server';
import { verifyPin, createSessionToken, COOKIE_NAME, isAuthenticatedRequest } from '@/lib/auth';

// Rate limiting in-memory untuk mencegah serangan brute-force PIN
const loginAttempts = new Map();

function getClientIp(request) {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1'
  );
}

export async function GET(request) {
  const isAuth = isAuthenticatedRequest(request);
  return NextResponse.json({ authenticated: isAuth });
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, pin } = body;

    if (action === 'login') {
      const ip = getClientIp(request);
      const now = Date.now();
      const attempt = loginAttempts.get(ip) || { count: 0, lockUntil: 0 };

      // Cek apakah IP sedang dikunci karena terlalu banyak percobaan salah
      if (attempt.lockUntil > now) {
        const remainingSeconds = Math.ceil((attempt.lockUntil - now) / 1000);
        return NextResponse.json({ 
          ok: false, 
          error: `Terlalu banyak percobaan salah. Akun dikunci sementara. Silakan coba lagi dalam ${remainingSeconds} detik.` 
        }, { status: 429 });
      }

      if (!pin || typeof pin !== 'string') {
        return NextResponse.json({ ok: false, error: 'PIN wajib diisi' }, { status: 400 });
      }

      const isValid = verifyPin(pin.trim());
      if (!isValid) {
        attempt.count += 1;
        // Jika gagal 5 kali berturut-turut, kunci IP selama 10 menit
        if (attempt.count >= 5) {
          attempt.lockUntil = now + 10 * 60 * 1000;
        }
        loginAttempts.set(ip, attempt);

        // Tambahkan delay buatan 600ms untuk memperlambat automated script brute-force
        await new Promise(r => setTimeout(r, 600));

        const sisaPercobaan = Math.max(0, 5 - attempt.count);
        const errorMsg = attempt.count >= 5 
          ? 'PIN salah 5 kali berturut-turut. Akses dikunci selama 10 menit.' 
          : `PIN salah. Sisa kesempatan: ${sisaPercobaan} kali.`;

        return NextResponse.json({ ok: false, error: errorMsg }, { status: 401 });
      }

      // Login berhasil, reset penghitung kegagalan
      loginAttempts.delete(ip);

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
