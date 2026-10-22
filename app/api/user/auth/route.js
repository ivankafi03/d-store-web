import { NextResponse } from 'next/server';
import { 
  USER_COOKIE_NAME, 
  getUserFromRequest, 
  upsertGoogleUser, 
  createUserSessionToken, 
  decodeGoogleJwt,
  findUserByEmail,
  saveAllUsers,
  getAllUsers
} from '@/lib/userAuth';

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }
    return NextResponse.json({ authenticated: true, user });
  } catch (err) {
    console.error('[API User Auth GET Error]', err);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action } = body;

    // 1. LOGIN DENGAN GOOGLE
    if (action === 'google_login') {
      let googleProfile = null;

      // Jika menerima credential JWT dari Google Identity Services SDK
      if (body.credential) {
        googleProfile = decodeGoogleJwt(body.credential);
      } else if (body.profile && body.profile.email) {
        googleProfile = {
          email: body.profile.email,
          name: body.profile.name || body.profile.email.split('@')[0],
          picture: body.profile.picture || null,
          sub: body.profile.sub || body.profile.id || `google_${Date.now()}`
        };
      }

      if (!googleProfile || !googleProfile.email) {
        return NextResponse.json(
          { ok: false, error: 'Data profil Google tidak valid' },
          { status: 400 }
        );
      }

      // Validasi format email dasar
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(googleProfile.email)) {
        return NextResponse.json(
          { ok: false, error: 'Format email tidak valid' },
          { status: 400 }
        );
      }

      // Daftarkan atau update user
      const user = upsertGoogleUser(googleProfile);
      const token = createUserSessionToken(user);

      const response = NextResponse.json({
        ok: true,
        message: 'Login Google berhasil',
        user
      });

      // Simpan cookie sesi aman (30 hari)
      response.cookies.set({
        name: USER_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
      });

      return response;
    }

    // 2. LOGOUT
    if (action === 'logout') {
      const response = NextResponse.json({ ok: true, message: 'Berhasil keluar' });
      response.cookies.set({
        name: USER_COOKIE_NAME,
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      });
      return response;
    }

    // 3. UPDATE PROFIL (misal nomor WhatsApp pembeli)
    if (action === 'update_profile') {
      const currentUser = getUserFromRequest(request);
      if (!currentUser) {
        return NextResponse.json({ ok: false, error: 'Harap login terlebih dahulu' }, { status: 401 });
      }

      const users = getAllUsers();
      const idx = users.findIndex((u) => u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (idx >= 0) {
        if (body.phone !== undefined) users[idx].phone = String(body.phone).trim();
        if (body.name !== undefined && body.name.trim()) users[idx].name = body.name.trim();
        saveAllUsers(users);
        return NextResponse.json({ ok: true, user: users[idx] });
      }

      return NextResponse.json({ ok: false, error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ ok: false, error: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (err) {
    console.error('[API User Auth POST Error]', err);
    return NextResponse.json({ ok: false, error: 'Terjadi kesalahan sistem internal' }, { status: 500 });
  }
}
