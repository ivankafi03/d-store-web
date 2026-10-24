import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get('returnTo') || '/store';
  
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID belum disetel' }, { status: 500 });
  }

  // Ambil origin host request saat ini (bersihkan jika ada multi proxy hop)
  const hostRaw = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const host = hostRaw.split(',')[0].trim();
  const protoRaw = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const proto = protoRaw.split(',')[0].trim();
  const redirectUri = `${proto}://${host}/api/auth/google/callback`;

  // State untuk menyimpan redirect URL kembali dan redirectUri yang digunakan
  const state = Buffer.from(JSON.stringify({ returnTo, redirectUri })).toString('base64url');

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('prompt', 'select_account'); // Memaksa browser menampilkan pilihan akun yang ada di perangkat
  authUrl.searchParams.set('access_type', 'online');
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
