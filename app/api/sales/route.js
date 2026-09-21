import { NextResponse } from 'next/server';
import { getDb, saveDb, getMonthlyAccountingReports } from '@/lib/db';

function calculateExpiry(durationStr) {
  const now = new Date();
  const lower = String(durationStr || '').toLowerCase().trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(lower)) return lower;

  let days = 30;
  const numMatch = lower.match(/^(\d+)/);
  const num = numMatch ? parseInt(numMatch[1], 10) : 1;

  if (lower.includes('th') || lower.includes('tahun') || lower.includes('y')) days = num * 365;
  else if (lower.includes('b') || lower.includes('bln') || lower.includes('bulan') || lower.includes('m')) days = num * 30;
  else if (lower.includes('h') || lower.includes('hr') || lower.includes('hari') || lower.includes('d')) days = num;
  else if (numMatch) days = num;

  const target = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return target.toISOString().slice(0, 10);
}

function getDaysRemaining(expiryStr) {
  if (!expiryStr) return 0;
  const target = new Date(expiryStr + 'T23:59:59');
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export async function GET() {
  const db = getDb();
  if (!Array.isArray(db.sales)) db.sales = [];
  if (!Array.isArray(db.warranties)) db.warranties = [];

  const sales = db.sales.map(s => {
    const days = getDaysRemaining(s.expiryDate);
    return {
      ...s,
      daysRemaining: days,
      isExpiringSoon: days >= 0 && days <= 3,
      isExpired: days < 0
    };
  });

  const totalRevenue = sales.reduce((sum, s) => sum + (Number(s.sellingPrice) || 0), 0);
  const totalCost = sales.reduce((sum, s) => sum + (Number(s.costPrice) || 0), 0);
  const totalProfit = sales.reduce((sum, s) => sum + (Number(s.profit) || 0), 0);
  const expiringSoonCount = sales.filter(s => s.isExpiringSoon).length;

  // Analisis Produk Terlaris
  const productMap = {};
  sales.forEach(s => {
    const key = s.productName || 'Lainnya';
    if (!productMap[key]) {
      productMap[key] = { name: key, count: 0, revenue: 0, profit: 0 };
    }
    productMap[key].count += 1;
    productMap[key].revenue += Number(s.sellingPrice) || 0;
    productMap[key].profit += Number(s.profit) || 0;
  });
  const topProducts = Object.values(productMap).sort((a, b) => b.count - a.count);

  // Analisis Supplier
  const supplierMap = {};
  sales.forEach(s => {
    const supp = s.supplier || 'heavenprem';
    if (!supplierMap[supp]) {
      supplierMap[supp] = { supplier: supp, salesCount: 0, profit: 0, warrantyCount: 0 };
    }
    supplierMap[supp].salesCount += 1;
    supplierMap[supp].profit += Number(s.profit) || 0;
  });

  db.warranties.forEach(w => {
    const supp = w.supplier || 'heavenprem';
    if (supplierMap[supp]) {
      supplierMap[supp].warrantyCount += 1;
    }
  });
  const supplierStats = Object.values(supplierMap).sort((a, b) => b.profit - a.profit);
  const monthlyReports = getMonthlyAccountingReports(db.sales || []);
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const currentMonthKey = `${currentYear}-${currentMonth}`;
  const currentMonthReport = monthlyReports.find(m => m.monthKey === currentMonthKey) || {
    monthKey: currentMonthKey,
    monthLabel: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    orderCount: 0,
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    marginPercent: 0
  };

  return NextResponse.json({
    sales: sales.reverse(),
    warranties: db.warranties.slice().reverse(),
    analytics: {
      topProducts,
      supplierStats
    },
    monthlyReports,
    currentMonthReport,
    totalRevenue,
    totalCost,
    totalProfit,
    expiringSoonCount,
    totalSales: sales.length,
    totalWarranties: db.warranties.length
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;
    const db = getDb();
    if (!Array.isArray(db.sales)) db.sales = [];
    if (!Array.isArray(db.warranties)) db.warranties = [];
    if (!Array.isArray(db.vault)) db.vault = [];

    // 1. Klaim Garansi & Penggantian Akun
    if (action === 'claim_warranty') {
      const { saleId, issue, newAccount, newVaultId, notes } = body;
      const sale = db.sales.find(s => s.id === saleId);
      if (!sale) {
        return NextResponse.json({ status: 'error', message: 'ID Pesanan tidak ditemukan.' }, { status: 404 });
      }

      let replacement = newAccount;
      if (newVaultId) {
        const vItem = db.vault.find(i => i.id === newVaultId && i.status === 'ready');
        if (vItem) {
          replacement = vItem.account;
          vItem.status = 'warranty_replaced';
          vItem.soldAt = new Date().toISOString();
          vItem.saleId = saleId;
        }
      }

      if (!replacement) {
        return NextResponse.json({ status: 'error', message: 'Akun pengganti wajib diisi.' }, { status: 400 });
      }

      const claimId = `WAR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const newClaim = {
        id: claimId,
        saleId,
        date: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
        productName: sale.productName,
        variantName: sale.variantName,
        buyer: sale.buyer,
        buyerPhone: sale.buyerPhone || '',
        buyerPlatform: sale.buyerPlatform || 'whatsapp',
        buyerContact: sale.buyerContact || sale.buyerPhone || '',
        supplier: sale.supplier || 'heavenprem',
        issue: issue || 'Akun bermasalah / reset password',
        oldAccount: sale.account,
        newAccount: replacement,
        notes: notes || '-',
        status: 'resolved'
      };

      db.warranties.push(newClaim);
      // Perbarui akun aktif di pesanan asli
      sale.account = replacement;
      sale.notes = `${sale.notes ? sale.notes + ' | ' : ''}Garansi ganti akun #${claimId}`;

      saveDb(db);
      return NextResponse.json({ status: 'ok', warranty: newClaim });
    }

    // 2. Transaksi Penjualan Baru
    const { variantId, account, duration, buyer, buyerPhone, buyerPlatform, buyerContact, sellingPrice, costPrice, notes, vaultId } = body;

    const v = (db.variants || []).find(item => item.id === variantId);
    const prod = v ? (db.products || []).find(p => p.id === v.productId) : null;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const code = Math.floor(1000 + Math.random() * 9000);
    const saleId = `SLS-${dateStr}-${code}`;

    const sell = sellingPrice !== undefined && !isNaN(sellingPrice) ? Number(sellingPrice) : (v ? v.price : 0);
    const cost = costPrice !== undefined && !isNaN(costPrice) ? Number(costPrice) : (v ? v.costPrice : 0);
    const profit = sell - cost;
    const expiryDate = calculateExpiry(duration || '30h');

    // Jika akun diambil dari gudang, update status gudang jadi terjual
    if (vaultId) {
      const vItem = db.vault.find(i => i.id === vaultId && i.status === 'ready');
      if (vItem) {
        vItem.status = 'sold';
        vItem.soldAt = new Date().toISOString();
        vItem.saleId = saleId;
      }

      // Cek apakah masih ada stok ready di gudang untuk varian ini
      const remainingReady = db.vault.filter(i => i.variantId === variantId && i.status === 'ready').length;
      if (remainingReady === 0 && v) {
        // Opsional: jika habis di gudang, Bos bisa tetap atur
      }
    }

    const platform = (buyerPlatform || 'whatsapp').toLowerCase();
    const rawContact = String(buyerContact || buyerPhone || '').trim();
    const cleanDigits = rawContact.replace(/[^0-9]/g, '');

    const newSale = {
      id: saleId,
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      variantId: variantId || '-',
      productName: prod ? prod.name : (v ? v.name : 'Produk Umum'),
      variantName: v ? v.name : '-',
      account: account || '-',
      duration: duration || '30 Hari',
      expiryDate,
      buyer: buyer || 'Pelanggan',
      buyerPlatform: platform,
      buyerContact: rawContact,
      buyerPhone: platform === 'whatsapp' && cleanDigits ? cleanDigits : rawContact,
      sellingPrice: sell,
      costPrice: cost,
      profit,
      supplier: v ? v.supplier : 'heavenprem',
      notes: notes || '-'
    };

    db.sales.push(newSale);
    saveDb(db);

    return NextResponse.json({ status: 'ok', sale: newSale });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
