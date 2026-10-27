import crypto from 'crypto';
import { verifyUserSessionToken, USER_COOKIE_NAME, isOwnerEmail } from './userAuth.js';

// Fallback konfigurasi jika env lokal belum disetel
const DEFAULT_SALT = '23a235a7c0b2b33655e2a93de6e215d2';
const DEFAULT_HASH = '4ebba37cc0f3f06fc52d4d7125989866005325d68836486232677f77ef0d49a96d4b1670a437ba8768ae2fceeeecabf936b66be2ca6060cd330d5e8a4fd1239a';

let fallbackRuntimeSecret = null;
function getSecureFallbackSecret() {
  if (!fallbackRuntimeSecret) {
    fallbackRuntimeSecret = crypto.randomBytes(32).toString('hex');
  }
  return fallbackRuntimeSecret;
}

export const COOKIE_NAME = 'd_admin_session';

export function getSalt() {
  return process.env.ADMIN_PIN_SALT || DEFAULT_SALT;
}

export function getExpectedHash() {
  return process.env.ADMIN_PIN_HASH || DEFAULT_HASH;
}

export function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || getSecureFallbackSecret();
}

/**
 * Hash PIN menggunakan PBKDF2 (SHA-512, 100.000 iterasi)
 */
export function hashPin(pin, salt) {
  return crypto.pbkdf2Sync(String(pin), salt, 100000, 64, 'sha512').toString('hex');
}

/**
 * Verifikasi PIN yang dimasukkan dengan timing-safe comparison
 */
export function verifyPin(inputPin) {
  if (!inputPin) return false;
  const salt = getSalt();
  const expectedHash = getExpectedHash();
  const inputHash = hashPin(inputPin, salt);

  try {
    const expectedBuffer = Buffer.from(expectedHash, 'hex');
    const inputBuffer = Buffer.from(inputHash, 'hex');
    if (expectedBuffer.length !== inputBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, inputBuffer);
  } catch {
    return false;
  }
}

/**
 * Buat HMAC signed session token
 */
export function createSessionToken() {
  const secret = getSessionSecret();
  const payload = {
    role: 'superadmin',
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 hari
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payloadStr).digest('base64url');
  return `${payloadStr}.${signature}`;
}

/**
 * Verifikasi HMAC signature dan expiry dari session token
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadStr, signature] = parts;
  const secret = getSessionSecret();
  const expectedSig = crypto.createHmac('sha256', secret).update(payloadStr).digest('base64url');

  try {
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length) return false;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return false;

    return payload;
  } catch {
    return false;
  }
}

/**
 * Helper untuk Next.js Route Handlers: Cek apakah sesi admin valid
 */
export function isAuthenticatedRequest(request) {
  const cookieHeader = request.headers.get('cookie') || '';

  // 1. Cek sesi Google User ivankafipradana@gmail.com dengan verifikasi kriptografis HMAC SHA-256
  const userMatch = cookieHeader.match(new RegExp(`(?:^|;\\s*)${USER_COOKIE_NAME}=([^;]+)`));
  const userToken = userMatch ? decodeURIComponent(userMatch[1]) : null;
  if (userToken) {
    try {
      const verifiedUser = verifyUserSessionToken(userToken);
      if (verifiedUser && (verifiedUser.email?.toLowerCase().trim() === 'ivankafipradana@gmail.com' || isOwnerEmail(verifiedUser.email))) {
        return true;
      }
    } catch {}
  }

  // 2. Cek token admin session PIN
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  const token = match ? decodeURIComponent(match[1]) : null;
  if (!token) return false;
  return !!verifySessionToken(token);
}
