import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const usersFilePath = path.join(process.cwd(), 'data/users.json');
export const USER_COOKIE_NAME = 'd_store_user_session';
const USER_SESSION_SECRET = process.env.USER_SESSION_SECRET || 'd_store_secret_jwt_user_key_2026_secured';

let memoryUsers = null;

/**
 * Membaca data seluruh pengguna dari data/users.json
 */
export function getAllUsers(forceReload = false) {
  try {
    if (fs.existsSync(usersFilePath)) {
      if (memoryUsers && !forceReload) {
        return memoryUsers;
      }
      const raw = fs.readFileSync(usersFilePath, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        memoryUsers = data;
        return data;
      }
    }
  } catch (err) {
    console.warn('[UserAuth] Gagal membaca data users.json:', err.message);
  }
  return memoryUsers || [];
}

/**
 * Menyimpan data seluruh pengguna ke data/users.json
 */
export function saveAllUsers(users) {
  memoryUsers = users;
  try {
    const dir = path.dirname(usersFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn('[UserAuth] Gagal menyimpan data users.json (Vercel read-only):', err.message);
    return true;
  }
}

/**
 * Mencari pengguna berdasarkan email
 */
export function findUserByEmail(email) {
  if (!email) return null;
  const users = getAllUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Mendaftarkan atau memperbarui pengguna dari data Google
 */
export function upsertGoogleUser(googleProfile) {
  const { email, name, picture, sub } = googleProfile;
  if (!email) throw new Error('Email Google diperlukan');

  const users = getAllUsers();
  const existingIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());

  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    // Update existing user
    const user = users[existingIndex];
    const isOwner = email.toLowerCase().trim() === 'ivankafipradana@gmail.com';
    user.name = name || user.name;
    user.picture = picture || user.picture;
    user.googleSub = sub || user.googleSub;
    if (isOwner) {
      user.role = 'owner';
      user.tier = 'Owner & Pengelola Toko';
      user.memberId = 'DST-OWNER-01';
    }
    user.lastLoginAt = now;
    users[existingIndex] = user;
    saveAllUsers(users);
    return user;
  } else {
    // Generate member code e.g. DST-58291
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const isOwner = email.toLowerCase().trim() === 'ivankafipradana@gmail.com';
    const newUser = {
      id: sub || `usr_${Date.now()}`,
      googleSub: sub || null,
      email: email.toLowerCase().trim(),
      name: name || email.split('@')[0],
      picture: picture || null,
      role: isOwner ? 'owner' : 'customer',
      tier: isOwner ? 'Owner & Pengelola Toko' : 'Member VIP',
      memberId: isOwner ? 'DST-OWNER-01' : `DST-${randomCode}`,
      phone: '',
      points: isOwner ? 999999 : 500, // Unlimited points for owner
      orders: [
        {
          id: `ORD-${Date.now().toString().slice(-6)}`,
          title: 'Garansi Proteksi Akun D Store Aktif',
          status: 'Aktif',
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          note: 'Status akun pembeli resmi terdaftar'
        }
      ],
      createdAt: now,
      lastLoginAt: now
    };
    users.push(newUser);
    saveAllUsers(users);
    return newUser;
  }
}

/**
 * Membuat HMAC Signed Session Token untuk pengguna
 */
export function createUserSessionToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    memberId: user.memberId,
    picture: user.picture,
    iat: Date.now(),
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000 // Berlaku 30 hari
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', USER_SESSION_SECRET).update(payloadStr).digest('base64url');
  return `${payloadStr}.${signature}`;
}

/**
 * Verifikasi Session Token Pengguna
 */
export function verifyUserSessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadStr, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', USER_SESSION_SECRET).update(payloadStr).digest('base64url');

  try {
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Mendapatkan sesi pengguna aktif dari request headers (Cookie)
 */
export function getUserFromRequest(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${USER_COOKIE_NAME}=([^;]+)`));
  const token = match ? decodeURIComponent(match[1]) : null;
  if (!token) return null;

  const session = verifyUserSessionToken(token);
  if (!session) return null;

  // Dapatkan profil terupdate dari data file
  const fullUser = findUserByEmail(session.email);
  return fullUser || session;
}

/**
 * Helper untuk decode JWT Google ID Token tanpa library eksternal
 */
export function decodeGoogleJwt(jwt) {
  if (!jwt || typeof jwt !== 'string') return null;
  const parts = jwt.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      name: payload.name,
      picture: payload.picture,
      given_name: payload.given_name,
      family_name: payload.family_name
    };
  } catch (err) {
    console.error('[UserAuth] Gagal decode Google JWT:', err);
    return null;
  }
}

/**
 * Sinkronisasi Catatan Langganan D-Workspace ke Pesanan Pengguna (data/users.json)
 */
export function syncCustomerNoteToUserOrder(note, action = 'upsert') {
  if (!note) return false;
  let targetEmail = (note.customerEmail || '').toLowerCase().trim();
  if (!targetEmail && note.accountDetails) {
    const emailMatch = note.accountDetails.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      targetEmail = emailMatch[0].toLowerCase().trim();
    }
  }

  if (!targetEmail) return false;

  const users = getAllUsers(true);

  if (action === 'delete') {
    let changed = false;
    for (const u of users) {
      if (Array.isArray(u.orders)) {
        const prevLen = u.orders.length;
        u.orders = u.orders.filter(o => o.noteId !== note.id && !o.items?.some(it => it.noteId === note.id));
        if (u.orders.length !== prevLen) changed = true;
      }
    }
    if (changed) saveAllUsers(users);
    return true;
  }

  const now = new Date();
  const formatWib = (dateObj) => {
    const d = dateObj ? new Date(dateObj) : new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} WIB`;
  };

  let userIndex = users.findIndex(u => u.email.toLowerCase() === targetEmail);
  if (userIndex === -1) {
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const isOwner = targetEmail === 'ivankafipradana@gmail.com';
    const newUser = {
      id: `usr_${Date.now()}`,
      googleSub: null,
      email: targetEmail,
      name: note.customerName || targetEmail.split('@')[0],
      picture: null,
      role: isOwner ? 'owner' : 'customer',
      tier: isOwner ? 'Owner & Pengelola Toko' : 'Member VIP',
      memberId: isOwner ? 'DST-OWNER-01' : `DST-${randomCode}`,
      phone: note.contact || '',
      points: isOwner ? 999999 : 500,
      orders: [],
      createdAt: now.toISOString(),
      lastLoginAt: now.toISOString()
    };
    users.push(newUser);
    userIndex = users.length - 1;
  }

  const user = users[userIndex];
  if (!Array.isArray(user.orders)) user.orders = [];

  const orderId = note.orderId || `DST-NOTE-${note.id}`;
  const existingOrderIndex = user.orders.findIndex(
    o => o.id === orderId || o.noteId === note.id || o.items?.some(it => it.noteId === note.id)
  );

  const duration = Number(note.durationDays) || 30;
  const startDateIso = note.startDate || now.toISOString();
  let expiredAtIso = note.expiredAt;
  if (!expiredAtIso) {
    const expDate = new Date(new Date(startDateIso).getTime() + duration * 86400000);
    expiredAtIso = expDate.toISOString();
  }

  const orderItem = {
    id: `item_${note.id}`,
    name: note.productName || 'Aplikasi Premium',
    variantName: note.variantName || '',
    quantity: 1,
    price: Number(note.price) || 0,
    subtotal: Number(note.price) || 0,
    durationDays: duration,
    warrantyDays: duration,
    startDate: startDateIso,
    expiredAt: expiredAtIso,
    warrantyExpiredAt: expiredAtIso,
    noteId: note.id,
    accountDetails: note.accountDetails || ''
  };

  const orderRecord = {
    id: orderId,
    noteId: note.id,
    orderTime: note.orderTime || formatWib(note.createdAt || now),
    createdAt: note.createdAt || now.toISOString(),
    items: [orderItem],
    totalAmount: Number(note.price) || 0,
    status: new Date(expiredAtIso) < now ? 'Kedaluwarsa' : 'Aktif',
    customerNotes: note.notes || '',
    phone: note.contact || user.phone || '',
    email: targetEmail,
    name: note.customerName || user.name || targetEmail.split('@')[0],
    title: `${note.productName || 'Aplikasi'}${note.variantName ? ` (${note.variantName})` : ''}`
  };

  if (existingOrderIndex >= 0) {
    orderRecord.id = user.orders[existingOrderIndex].id || orderRecord.id;
    orderRecord.orderTime = user.orders[existingOrderIndex].orderTime || orderRecord.orderTime;
    user.orders[existingOrderIndex] = orderRecord;
  } else {
    user.orders.unshift(orderRecord);
  }

  saveAllUsers(users);
  return true;
}
