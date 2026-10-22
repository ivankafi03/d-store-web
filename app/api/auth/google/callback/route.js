import { NextResponse } from 'next/server';
import { 
  USER_COOKIE_NAME, 
  upsertGoogleUser, 
  createUserSessionToken 
} from '@/lib/userAuth';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const stateRaw = searchParams.get('state');

  let returnTo = '/store';
  if (stateRaw) {
    try {
      const parsed = JSON.parse(Buffer.from(stateRaw, 'base64url').toString('utf-8'));
      if (parsed?.returnTo) returnTo = parsed.returnTo;
    } catch (e) {}
  }

  if (error || !code) {
    console.warn('[Google OAuth Callback Error]', error);
    return NextResponse.redirect(new URL(returnTo, request.url));
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const redirectUri = `${proto}://${host}/api/auth/google/callback`;

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
      return NextResponse.redirect(new URL(returnTo, request.url));
    }

    // 2. Ambil User Profile dari Google UserInfo API
    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const profile = await userinfoRes.json();
    if (!profile || !profile.email) {
      console.error('[Google OAuth UserInfo Error]', profile);
      return NextResponse.redirect(new URL(returnTo, request.url));
    }

    // 3. Upsert user ke database sistem
    const googleProfile = {
      email: profile.email.toLowerCase().trim(),
      name: profile.name || profile.given_name || profile.email.split('@')[0],
      picture: profile.picture || null,
      sub: profile.sub || `google_${Date.now()}`
    };

    const user = upsertGoogleUser(googleProfile);
    const sessionToken = createUserSessionToken(user);

    // 4. Redirect ke halaman asal dengan cookie session aktif
    const redirectResponse = NextResponse.redirect(new URL(returnTo, request.url));
    redirectResponse.cookies.set({
      name: USER_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    });

    return redirectResponse;
  } catch (err) {
    console.error('[Google OAuth Callback Exception]', err);
    return NextResponse.redirect(new URL(returnTo, request.url));
  }
}
