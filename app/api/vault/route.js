import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

/**
 * API untuk Gudang Akun Siap Pakai (Stock Vault)
 * GET: Mengambil daftar akun di gudang (ringkasan stok ready per varian & riwayat)
 * POST: Tambah batch akun, hapus akun, ambil akun (FIFO)
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get('variantId');

    const db = getDb();
    if (!Array.isArray(db.vault)) db.vault = [];

    // Hitung stok ready per varian
    const readyCounts = {};
    db.vault.forEach(item => {
      if (item.status === 'ready') {
        readyCounts[item.variantId] = (readyCounts[item.variantId] || 0) + 1;
      }
    });

    let items = db.vault;
    if (variantId) {
      items = items.filter(i => i.variantId === variantId);
    }

    return NextResponse.json({
      status: 'ok',
      totalItems: db.vault.length,
      readyCounts,
      items: items.slice().reverse()
    });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;
    const db = getDb();
    if (!Array.isArray(db.vault)) db.vault = [];

    // 1. Tambah batch akun ke gudang
    if (action === 'add_batch') {
      const { variantId, rawAccounts, supplier, costPrice } = body;
      if (!variantId || !rawAccounts) {
        return NextResponse.json({ status: 'error', message: 'Varian dan akun wajib diisi.' }, { status: 400 });
      }

      const v = (db.variants || []).find(item => item.id === variantId);
      const prod = v ? (db.products || []).find(p => p.id === v.productId) : null;
      const suppName = supplier || (v ? v.supplier : 'heavenprem');
      const cost = Number(costPrice) || (v ? Number(v.costPrice) : 0);

      // Pisahkan baris akun
      const lines = String(rawAccounts)
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

      if (lines.length === 0) {
        return NextResponse.json({ status: 'error', message: 'Tidak ada baris akun yang valid.' }, { status: 400 });
      }

      const added = [];
      const now = new Date().toISOString();

      lines.forEach(accountStr => {
        const id = `VLT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        const newItem = {
          id,
          variantId,
          productName: prod ? prod.name : 'Produk',
          variantName: v ? v.name : '-',
          account: accountStr,
          supplier: suppName,
          costPrice: cost,
          status: 'ready', // ready, sold, warranty_replaced
          createdAt: now,
          soldAt: null,
          saleId: null
        };
        db.vault.push(newItem);
        added.push(newItem);
      });

      // Jika sebelumnya varian kosong, otomatis jadikan ready karena ada stok baru
      if (v && !v.isAvailable) {
        v.isAvailable = true;
      }

      saveDb(db);

      return NextResponse.json({
        status: 'ok',
        message: `Berhasil menambahkan ${added.length} akun ke gudang.`,
        addedCount: added.length,
        items: added
      });
    }

    // 2. Ambil 1 akun ready untuk varian tertentu (FIFO)
    if (action === 'pop_ready') {
      const { variantId } = body;
      const readyIndex = db.vault.findIndex(i => i.variantId === variantId && i.status === 'ready');
      if (readyIndex === -1) {
        return NextResponse.json({ status: 'empty', message: 'Gudang akun untuk varian ini kosong.' });
      }

      const item = db.vault[readyIndex];
      return NextResponse.json({
        status: 'ok',
        item
      });
    }

    // 3. Hapus akun dari gudang
    if (action === 'delete') {
      const { id } = body;
      db.vault = db.vault.filter(i => i.id !== id);
      saveDb(db);
      return NextResponse.json({ status: 'ok', message: 'Akun dihapus dari gudang.' });
    }

    return NextResponse.json({ status: 'error', message: 'Aksi tidak dikenali.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
