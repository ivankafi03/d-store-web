import { NextResponse } from 'next/server';
import { 
  USER_COOKIE_NAME, 
  upsertGoogleUser, 
  createUserSessionToken,
  pullUsersFromGoogleSheet,
  pushUsersToGoogleSheet,
  isOwnerEmail
} from '@/lib/userAuth';

function sanitizeReturnTo(url) {
  if (!url || typeof url !== 'string' || url === '/') return '/store';
  const trimmed = url.trim();
  if (trimmed === '/' || !trimmed) return '/store';
  // Hanya izinkan path relatif internal lokal, cegah protocol-relative (//) atau skema luar
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('://')) {
    return trimmed;
  }
  return '/store';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const stateRaw = searchParams.get('state');

  let returnTo = '/store';
  let stateRedirectUri = null;
  if (stateRaw) {
    try {
      const parsed = JSON.parse(Buffer.from(stateRaw, 'base64url').toString('utf-8'));
      if (parsed?.returnTo) returnTo = sanitizeReturnTo(parsed.returnTo);
      if (parsed?.redirectUri) stateRedirectUri = parsed.redirectUri;
    } catch (e) {}
  }

  // Jika user membatalkan pilihan akun atau Google mengembalikan error
  if (error || !code) {
    console.warn('[Google OAuth Callback Error]', error);
    const errHtml = `<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8"></head>
<body>
<script>
  alert("Otorisasi Google dibatalkan atau gagal: ${escapeHtml(error || 'Tidak ada kode otorisasi')}");
  window.location.replace(${JSON.stringify(returnTo)});
</script>
</body>
</html>`;
    return new NextResponse(errHtml, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    const hostRaw = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const host = hostRaw.split(',')[0].trim();
    const protoRaw = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const proto = protoRaw.split(',')[0].trim();
    
    // Pastikan redirectUri persis sama dengan yang dikirim saat inisiasi auth
    const redirectUri = stateRedirectUri || `${proto}://${host}/api/auth/google/callback`;

    // 1. Exchange authorization code untuk Access Token & ID Token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('[Google OAuth Token Error]', tokenData);
      const errDesc = tokenData.error_description || tokenData.error || 'Gagal menukarkan kode Google';
      const failHtml = `<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8"></head>
<body>
<script>
  alert("Gagal autentikasi Google: ${escapeHtml(errDesc)}");
  window.location.replace(${JSON.stringify(returnTo)});
</script>
</body>
</html>`;
      return new NextResponse(failHtml, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // 2. Ambil User Profile dari Google UserInfo API
    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const profile = await userinfoRes.json();
    if (!profile || !profile.email) {
      console.error('[Google OAuth UserInfo Error]', profile);
      const failHtml = `<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8"></head>
<body>
<script>
  alert("Gagal membaca data profil akun Google.");
  window.location.replace(${JSON.stringify(returnTo)});
</script>
</body>
</html>`;
      return new NextResponse(failHtml, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // 3. Upsert user ke database sistem
    const googleProfile = {
      email: profile.email.toLowerCase().trim(),
      name: profile.name || profile.given_name || profile.email.split('@')[0],
      picture: profile.picture || null,
      sub: profile.sub || `google_${Date.now()}`
    };

    // Validasi Akses Editor: jika tujuan adalah URL editor, email harus sesuai hash ivankafipradana@gmail.com
    const isEditorDest = returnTo.includes('/editor') || returnTo.includes('/store/dev') || returnTo.includes('/d-workspace');
    if (isEditorDest && !isOwnerEmail(googleProfile.email)) {
      console.warn('[Security: Unauthorized editor attempt redirected to google.com]', googleProfile.email);
      const deniedResponse = NextResponse.redirect('https://www.google.com');
      deniedResponse.cookies.delete(USER_COOKIE_NAME);
      return deniedResponse;
    }

    // Tarik dulu data cloud agar user yang sudah terdaftar sebelumnya tidak tertimpa
    await pullUsersFromGoogleSheet().catch(() => {});

    const user = upsertGoogleUser(googleProfile);
    const sessionToken = createUserSessionToken(user);

    // Langsung simpan dan sinkronkan user baru ke Google Sheets database cloud
    await pushUsersToGoogleSheet().catch(() => {});

    // Cek protokol HTTPS secara akurat
    const isHttps = proto === 'https' || request.url.startsWith('https:');

    // 4. Return halaman sinkronisasi instan ke browser
    // Menyimpan langsung ke localStorage di sisi client lalu replace URL ke returnTo
    const safeUserJson = JSON.stringify(user).replace(/</g, '\\u003c');
    const safeReturnTo = JSON.stringify(returnTo).replace(/</g, '\\u003c');

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login Berhasil - D Store</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fafafa;">
  <div style="text-align: center; padding: 28px 24px; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); max-width: 320px; width: 90%;">
    <div style="width: 44px; height: 44px; border-radius: 50%; background: #18181b; color: white; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </div>
    <h3 style="margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #18181b;">Login Berhasil</h3>
    <p style="margin: 0; font-size: 12px; color: #71717a;">Menghubungkan akun ${escapeHtml(user.name)}...</p>
  </div>
  <script>
    try {
      localStorage.setItem('dstore_user_session', ${JSON.stringify(safeUserJson)});
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
    window.location.replace(${safeReturnTo});
  </script>
</body>
</html>`;

    const response = new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });

    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    });

    return response;
  } catch (err) {
    console.error('[Google OAuth Callback Exception]', err);
    const failHtml = `<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8"></head>
<body>
<script>
  alert("Terjadi kesalahan sistem saat proses masuk Google: ${escapeHtml(err.message || 'Error internal')}");
  window.location.replace(${JSON.stringify(returnTo)});
</script>
</body>
</html>`;
    return new NextResponse(failHtml, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}
