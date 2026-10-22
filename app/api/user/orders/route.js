import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isAuthenticatedRequest } from '@/lib/auth';
import { 
  USER_COOKIE_NAME, 
  verifyUserSessionToken, 
  getAllUsers, 
  saveAllUsers, 
  findUserByEmail,
  syncCustomerNoteToUserOrder
} from '@/lib/userAuth';
import { getDb, saveDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

function parseDurationDays(str) {
  if (!str) return 30;
  const lower = String(str).toLowerCase().trim();
  const numMatch = lower.match(/(\d+)\s*(hari|day|days|bulan|bln|month|months|tahun|thn|th|year|years|minggu|week|weeks|hr|h|d|m|y)?/i);
  if (!numMatch) return 30;
  const num = parseInt(numMatch[1], 10);
  const unit = (numMatch[2] || '').toLowerCase();
  if (unit.startsWith('hari') || unit.startsWith('day') || unit === 'h' || unit === 'hr' || unit === 'd') return num;
  if (unit.startsWith('minggu') || unit.startsWith('week')) return num * 7;
  if (unit.startsWith('tahun') || unit.startsWith('th') || unit.startsWith('year') || unit === 'y') return num * 365;
  if (unit.startsWith('bulan') || unit.startsWith('bln') || unit.startsWith('month') || unit === 'm') return num * 30;
  return num > 0 ? (num <= 12 ? num * 30 : num) : 30;
}

function formatWibTime(dateObj) {
  const d = dateObj || new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
}

// GET: Ambil daftar pesanan pembeli
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE_NAME)?.value;
    const session = verifyUserSessionToken(token);
    const isAdmin = isAuthenticatedRequest(request);

    const { searchParams } = new URL(request.url);
    const emailQuery = searchParams.get('email');
    const targetEmail = (emailQuery || session?.email || '').toLowerCase().trim();

    if (!targetEmail) {
      return NextResponse.json({ ok: false, error: 'Email pembeli diperlukan' }, { status: 400 });
    }

    // Sinkronisasi otomatis dari db.customerNotes jika ada catatan untuk targetEmail ini
    try {
      const db = getDb();
      if (Array.isArray(db.customerNotes)) {
        const matchingNotes = db.customerNotes.filter(n => {
          const cEmail = (n.customerEmail || '').toLowerCase().trim();
          if (cEmail && cEmail === targetEmail) return true;
          if (n.accountDetails && n.accountDetails.toLowerCase().includes(targetEmail)) return true;
          return false;
        });
        for (const note of matchingNotes) {
          syncCustomerNoteToUserOrder(note, 'upsert');
        }
      }
    } catch (syncErr) {
      console.warn('[Sync Customer Notes on Orders GET Error]', syncErr.message);
    }

    const user = findUserByEmail(targetEmail);
    if (!user) {
      return NextResponse.json({ ok: true, orders: [] });
    }

    return NextResponse.json({
      ok: true,
      orders: user.orders || []
    });
  } catch (err) {
    console.error('[API Orders GET Error]', err);
    return NextResponse.json({ ok: false, error: 'Gagal mengambil data pesanan' }, { status: 500 });
  }
}

// POST: Buat pesanan baru, catat waktu & apa yg dibeli, dan OTOMATIS TERSAMBUNG ke Buku Catatan D-Workspace
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      items = [], 
      totalAmount = 0, 
      customerNotes = '', 
      phone = '', 
      name = '', 
      email = '' 
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, error: 'Daftar produk pesanan kosong' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE_NAME)?.value;
    const session = verifyUserSessionToken(token);

    const targetEmail = (email || session?.email || '').toLowerCase().trim();
    const targetName = (name || session?.name || targetEmail.split('@')[0] || 'Pembeli D Store').trim();
    const targetPhone = String(phone || '').trim();

    const now = new Date();
    const nowIso = now.toISOString();
    const orderTimeStr = formatWibTime(now);
    const orderId = `DST-ORD-${Date.now().toString().slice(-6)}`;

    // 1. Siapkan DB dan Buku Catatan Seller
    const db = getDb();
    if (!Array.isArray(db.customerNotes)) db.customerNotes = [];

    const createdNotes = [];
    const orderItems = [];

    // 2. Loop setiap item yang dibeli pembeli
    for (const item of items) {
      const qty = Number(item.quantity) || 1;
      const itemName = (item.name || 'Aplikasi Premium').trim();
      const variantName = (item.variantName || '').trim();
      const itemPrice = Number(item.price) || 0;
      const durationDays = parseDurationDays(variantName || itemName);

      const expDate = new Date(now.getTime() + durationDays * 86400000);
      const expDateIso = expDate.toISOString();

      const noteId = `note_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

      // Entry Catatan Seller di D-Workspace
      const sellerNote = {
        id: noteId,
        orderId,
        customerName: targetName,
        customerEmail: targetEmail,
        contactType: 'whatsapp',
        contact: targetPhone || 'Menunggu kontak',
        productId: item.productId || item.id || '',
        productName: itemName,
        variantName: variantName,
        accountDetails: 'Menunggu pengiriman kredensial akun oleh Seller',
        supplier: 'Order Toko Online',
        price: itemPrice * qty,
        durationDays,
        warrantyDays: durationDays,
        startDate: nowIso,
        expiredAt: expDateIso,
        warrantyExpiredAt: expDateIso,
        orderTime: orderTimeStr,
        source: 'store_checkout',
        warrantyCount: 0,
        warrantyMax: 1,
        notes: customerNotes ? `Catatan Pembeli: ${customerNotes.trim()}` : `Pesanan Baru dari Toko Online (ID: ${orderId})`,
        createdAt: nowIso,
        updatedAt: nowIso
      };

      db.customerNotes.unshift(sellerNote);
      createdNotes.push(sellerNote);

      // Data item untuk riwayat pesanan pembeli
      orderItems.push({
        id: item.id || `item_${Date.now()}`,
        name: itemName,
        variantName,
        quantity: qty,
        price: itemPrice,
        subtotal: itemPrice * qty,
        durationDays,
        warrantyDays: durationDays,
        startDate: nowIso,
        expiredAt: expDateIso,
        warrantyExpiredAt: expDateIso,
        noteId
      });
    }

    // Simpan ke Buku Catatan Seller
    saveDb(db);

    // 3. Catat ke Profil Pembeli (data/users.json)
    const newOrder = {
      id: orderId,
      orderTime: orderTimeStr,
      createdAt: nowIso,
      items: orderItems,
      totalAmount: Number(totalAmount) || orderItems.reduce((s, i) => s + i.subtotal, 0),
      status: 'Aktif',
      customerNotes: customerNotes.trim(),
      phone: targetPhone,
      email: targetEmail,
      name: targetName,
      title: orderItems.map(i => `${i.name}${i.variantName ? ` (${i.variantName})` : ''}`).join(', ')
    };

    if (targetEmail) {
      const users = getAllUsers();
      const userIndex = users.findIndex(u => u.email.toLowerCase() === targetEmail);

      if (userIndex >= 0) {
        if (!Array.isArray(users[userIndex].orders)) {
          users[userIndex].orders = [];
        }
        users[userIndex].orders.unshift(newOrder);
        if (targetPhone && !users[userIndex].phone) {
          users[userIndex].phone = targetPhone;
        }
        users[userIndex].points = (users[userIndex].points || 0) + 100;
        saveAllUsers(users);
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'Pesanan berhasil dibuat dan tersambung ke Buku Catatan D-Workspace',
      order: newOrder,
      orderId,
      orderTime: orderTimeStr,
      createdNotesCount: createdNotes.length
    });
  } catch (err) {
    console.error('[API Orders POST Error]', err);
    return NextResponse.json({ ok: false, error: 'Gagal membuat pesanan' }, { status: 500 });
  }
}
