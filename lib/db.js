import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data/db.json');

// Cache in-memory untuk serverless Vercel
let memoryDb = null;

export function getDb(forceReload = false) {
  try {
    if (fs.existsSync(dataFilePath)) {
      const stats = fs.statSync(dataFilePath);
      if (memoryDb && !forceReload && memoryDb._mtime === stats.mtimeMs) {
        return memoryDb;
      }
      const raw = fs.readFileSync(dataFilePath, 'utf-8');
      memoryDb = JSON.parse(raw);
      memoryDb._mtime = stats.mtimeMs;
      return memoryDb;
    }
  } catch (err) {
    console.warn('[DB] Gagal membaca data file, membuat struktur default:', err.message);
  }

  memoryDb = {
    categories: [
      { id: 'cat_1', name: 'AI Tools & Productivity' },
      { id: 'cat_2', name: 'Streaming & Entertainment' },
      { id: 'cat_3', name: 'Graphic, Design & Video' },
      { id: 'cat_4', name: 'Music & Audio' }
    ],
    products: [],
    variants: [],
    sales: []
  };
  return memoryDb;
}

/**
 * Standardize duration strings into international digital abbreviations
 * hari -> d, bulan -> m, tahun -> y, minggu -> w
 */
export function standardizeDuration(name) {
  if (!name || typeof name !== 'string') return name;
  let s = name;
  
  // Replace X hari / Hari / HARI -> Xd
  s = s.replace(/(\d+)\s*(?:hari|Hari|HARI)\b/gi, '$1d');
  
  // Replace X bulan / Bulan / BULAN / bln / Bln -> Xm
  s = s.replace(/(\d+)\s*(?:bulan|Bulan|BULAN|bln|Bln)\b/gi, '$1m');
  
  // Replace X tahun / Tahun / TAHUN / thn / Thn -> Xy
  s = s.replace(/(\d+)\s*(?:tahun|Tahun|TAHUN|thn|Thn)\b/gi, '$1y');

  // Replace X minggu / Minggu / mgg -> Xw
  s = s.replace(/(\d+)\s*(?:minggu|Minggu|MINGGU|mgg|Mgg)\b/gi, '$1w');
  
  // Replace X day / days -> Xd
  s = s.replace(/(\d+)\s*(?:day|days)\b/gi, '$1d');
  
  // Replace X month / months -> Xm
  s = s.replace(/(\d+)\s*(?:month|months)\b/gi, '$1m');
  
  // Replace X year / years -> Xy
  s = s.replace(/(\d+)\s*(?:year|years)\b/gi, '$1y');

  // Replace X week / weeks -> Xw
  s = s.replace(/(\d+)\s*(?:week|weeks)\b/gi, '$1w');

  return s;
}

export function categorizeProduct(name) {
  if (!name || typeof name !== 'string') return { id: 'cat_7', name: 'Office, Akun & Tools' };
  const n = name.toLowerCase().trim();

  // 1. Streaming & Entertainment (cat_2)
  if (/netflix|disney|youtube|prime video|prime|vidio|viu|wetv|hbo|bstation|iqiyi|youku|moviebox|loklok|drakor|gagaoo|catchplay|dramabox|reelshort|melolo|wibuku|viki|vision\+|apple tv|mubi|mangotv|iflix|crunchyroll|dramaku|shortmax|sereal|snackvideo/i.test(n)) {
    return { id: 'cat_2', name: 'Streaming & Entertainment' };
  }

  // 2. Music & Audio (cat_4)
  if (/spotify|apple music|deezer|resso|joox|tidal|soundcloud/i.test(n)) {
    return { id: 'cat_4', name: 'Music & Audio' };
  }

  // 3. Graphic, Design & Video (cat_3)
  if (/canva|capcut|adobe|alight motion|picsart|meitu|wink|remini|ibis paint|snow|epik|vsco|scrl|polar studio|dazzcam|lightroom|photoshop|figma|corel/i.test(n)) {
    return { id: 'cat_3', name: 'Graphic, Design & Video' };
  }

  // 4. VPN & Security (cat_6)
  if (/vpn|surfshark|express vpn|hma vpn|nord|warp/i.test(n)) {
    return { id: 'cat_6', name: 'VPN & Security' };
  }

  // 5. Edukasi & Bahasa (cat_5)
  if (/duolingo|grammarly|scribd|quizlet|kahoot|quillbot|kilonotes|turnitin|ruangguru|fizzo novel/i.test(n)) {
    return { id: 'cat_5', name: 'Edukasi & Bahasa' };
  }

  // 6. AI Tools & Productivity (cat_1)
  if (/chatgpt|gemini|grok|perplexity|freedomgpt|google colab|claude|leonardo|kling|viggle|suno|heygen|krea|manus|aifiesta|anijam|base44|captions|chatly|clico|creaa|domo|ecombos|emergent|flora|framer|freebeat|gamma|genmotions|hailuo|hedra|higgsfield|hyperwrite|kapwing|magichlight|mootion|morphic|ninjachat|oneover|openart|recraft|reve|rork|scispace|seedance|supercool|uncensored|venice|videoinu|viewmax|wayin|youmind|dropshot|cuty|deepseek|midjourney|copilot|elevenlabs|lumalabs|runway|apikey|token|opus|sonet|gpt/i.test(n)) {
    return { id: 'cat_1', name: 'AI Tools & Productivity' };
  }

  // 7. Office, Akun & Tools (cat_7)
  return { id: 'cat_7', name: 'Office, Akun & Tools' };
}

export function saveDb(data) {
  if (data && Array.isArray(data.variants)) {
    for (const v of data.variants) {
      if (v.name) v.name = standardizeDuration(v.name);
    }
  }
  memoryDb = data;
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // Pada environment Vercel serverless filesystem bersifat read-only
    console.warn('[DB] File write skipped (Vercel serverless):', err.message);
  }
}

export const DEFAULT_SHEET_WEBHOOK = 'https://script.google.com/macros/s/AKfycbwHn2YFwV8udrqwbc8cwZUeBiXCPkZ3NtFRcxTtxMB1CI5knWee9JGl50GyqtAlUxs/exec';

/**
 * Menarik data langsung dari Google Spreadsheet Cloud
 */
export async function pullFromGoogleSheet() {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK || DEFAULT_SHEET_WEBHOOK;
  if (!webhookUrl) return { success: false, message: 'URL Webhook belum diatur' };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'read_all' }),
      redirect: 'follow',
      cache: 'no-store'
    });

    const data = await res.json();
    if (data.status === 'ok' && Array.isArray(data.items)) {
      mergeSheetIntoDb(data.items);
      return { success: true, count: data.items.length, items: data.items };
    }
    return { success: false, message: 'Data kosong atau format respon tidak sesuai' };
  } catch (err) {
    console.error('[Google Sheets Pull Error]', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Mengunggah data seluruh katalog ke Google Spreadsheet Cloud
 */
export async function pushToGoogleSheet() {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK || DEFAULT_SHEET_WEBHOOK;
  if (!webhookUrl) return { success: false, message: 'URL Webhook belum diatur' };

  const db = getDb(true);
  const items = [];

  for (const prod of db.products || []) {
    const cat = (db.categories || []).find(c => c.id === prod.categoryId);
    const catName = cat ? cat.name : 'Umum';
    const vars = (db.variants || []).filter(v => v.productId === prod.id);

    if (vars.length === 0) {
      items.push({
        productId: prod.id,
        category: catName,
        productName: prod.name,
        variantId: '-',
        variantName: '-',
        supplier: 'heavenprem',
        costPrice: 0,
        sellingPrice: 0,
        isAvailable: prod.isActive !== false,
        supplierOffers: '-'
      });
    } else {
      for (const v of vars) {
        const offers = Array.isArray(v.supplierOffers) && v.supplierOffers.length > 0
          ? v.supplierOffers
          : [{ supplier: v.supplier || 'heavenprem', costPrice: v.costPrice || 0, isAvailable: v.isAvailable !== false }];
        const offerStr = offers.map(o => `${o.supplier}: Rp${(o.costPrice || 0).toLocaleString('id-ID')} (${o.isAvailable ? 'Ready' : 'Kosong'})`).join(' | ');

        items.push({
          productId: prod.id,
          category: catName,
          productName: prod.name,
          variantId: v.id,
          variantName: v.name,
          supplier: v.supplier || 'heavenprem',
          costPrice: Number(v.costPrice) || 0,
          sellingPrice: Number(v.price) || 0,
          isAvailable: v.isAvailable !== false,
          supplierOffers: offerStr
        });
      }
    }
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sync_all', items }),
      redirect: 'follow'
    });
    const result = await res.json().catch(() => ({ status: 'ok' }));
    return { success: true, count: items.length, result };
  } catch (err) {
    console.error('[Google Sheets Push Error]', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Membuat sheet/tab baru di Google Spreadsheet Cloud
 */
export async function createSheetInGoogle(sheetName, headers = []) {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK || DEFAULT_SHEET_WEBHOOK;
  if (!webhookUrl) return { success: false, message: 'URL Webhook belum diatur' };
  if (!sheetName) return { success: false, message: 'Nama sheet wajib diisi' };

  try {
    const defaultHeaders = ['ID', 'Nama', 'Keterangan', 'Status', 'Tanggal Update'];
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'create_sheet', 
        sheetName: sheetName.trim(),
        headers: headers.length > 0 ? headers : defaultHeaders
      })
    });
    const result = await res.json().catch(() => ({ status: 'ok' }));
    return { success: true, message: `Sheet "${sheetName}" berhasil dibuat di Google Spreadsheet!`, result };
  } catch (err) {
    console.error('[Create Sheet Error]', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Menambahkan kolom baru ke tabel utama Google Spreadsheet
 */
export async function addColumnInGoogle(columnName, defaultValue = '-') {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK || DEFAULT_SHEET_WEBHOOK;
  if (!webhookUrl) return { success: false, message: 'URL Webhook belum diatur' };
  if (!columnName) return { success: false, message: 'Nama kolom wajib diisi' };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'add_column', 
        columnName: columnName.trim(),
        defaultValue
      })
    });
    const result = await res.json().catch(() => ({ status: 'ok' }));
    return { success: true, message: `Kolom "${columnName}" berhasil ditambahkan ke Google Spreadsheet!`, result };
  } catch (err) {
    console.error('[Add Column Error]', err.message);
    return { success: false, error: err.message };
  }
}

export function getMonthlyAccountingReports(salesList = null) {
  const db = getDb();
  const sales = salesList || db.sales || [];
  const monthlyMap = {};

  sales.forEach(s => {
    const d = s.createdAt ? new Date(s.createdAt) : new Date();
    const dateObj = isNaN(d.getTime()) ? new Date() : d;
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthLabel = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = {
        monthKey,
        monthLabel,
        year,
        monthNumber: month + 1,
        orderCount: 0,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        marginPercent: 0
      };
    }

    const rev = Number(s.sellingPrice) || 0;
    const cost = Number(s.costPrice) || 0;
    const profit = Number(s.profit) || (rev - cost);

    monthlyMap[monthKey].orderCount += 1;
    monthlyMap[monthKey].totalRevenue += rev;
    monthlyMap[monthKey].totalCost += cost;
    monthlyMap[monthKey].totalProfit += profit;
  });

  return Object.values(monthlyMap)
    .map(m => ({
      ...m,
      marginPercent: m.totalRevenue > 0 ? Math.round((m.totalProfit / m.totalRevenue) * 100) : 0
    }))
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey));
}

/**
 * Generate binary buffer Excel (.xlsx) dengan 3 worksheet rapi termasuk Pembukuan Bulanan
 */
export function exportToExcelBuffer() {
  const XLSX = require('xlsx');
  const db = getDb();

  const wb = XLSX.utils.book_new();

  // Sheet 1: Katalog & Harga
  const catalogRows = [];
  for (const p of db.products || []) {
    const cat = (db.categories || []).find(c => c.id === p.categoryId);
    const vars = (db.variants || []).filter(v => v.productId === p.id);
    for (const v of vars) {
      catalogRows.push({
        'Kategori': cat ? cat.name : 'Umum',
        'Nama Produk': p.name,
        'Varian': v.name,
        'Supplier Aktif': v.supplier || 'heavenprem',
        'Harga Modal (Rp)': Number(v.costPrice) || 0,
        'Harga Jual (Rp)': Number(v.price) || 0,
        'Untung / Margin (Rp)': (Number(v.price) || 0) - (Number(v.costPrice) || 0),
        'Status Stok': v.isAvailable !== false ? 'READY' : 'KOSONG'
      });
    }
  }
  const wsCatalog = XLSX.utils.json_to_sheet(catalogRows);
  XLSX.utils.book_append_sheet(wb, wsCatalog, 'Katalog Produk');

  // Sheet 2: Pembukuan Bulanan Toko (Laba Rugi Bulanan)
  const monthlyData = getMonthlyAccountingReports(db.sales || []);
  const monthlyRows = monthlyData.map((m, idx) => ({
    'No': idx + 1,
    'Periode Bulan': m.monthLabel,
    'Jumlah Transaksi': m.orderCount,
    'Total Omzet Penjualan (Rp)': m.totalRevenue,
    'Total Modal Kulakan (Rp)': m.totalCost,
    'Laba Bersih Toko (Rp)': m.totalProfit,
    'Margin Keuntungan (%)': `${m.marginPercent}%`,
    'Status Kinerja Toko': m.totalProfit > 0 ? 'PROFIT SURPLUS' : (m.totalProfit === 0 ? 'BEP (BALIK MODAL)' : 'DEFISIT / RUGI')
  }));
  const wsMonthly = XLSX.utils.json_to_sheet(monthlyRows.length > 0 ? monthlyRows : [{ 'Catatan': 'Belum ada transaksi penjualan untuk direkap' }]);
  XLSX.utils.book_append_sheet(wb, wsMonthly, 'Pembukuan Bulanan');

  // Sheet 3: Rekap Log Penjualan Detail
  const salesRows = (db.sales || []).map((s, idx) => ({
    'No': idx + 1,
    'Tanggal Transaksi': s.createdAt ? new Date(s.createdAt).toLocaleDateString('id-ID') : '-',
    'Nomor Pesanan': s.id || '-',
    'Produk': s.productName || '-',
    'Varian': s.variantName || '-',
    'Nama Pembeli': s.buyer || '-',
    'Kontak Pembeli': s.buyerContact || s.buyerPhone || '-',
    'Platform': s.buyerPlatform || 'WhatsApp',
    'Kredensial Akun': s.account || '-',
    'Durasi': s.duration || '-',
    'Harga Jual (Rp)': Number(s.sellingPrice) || 0,
    'Harga Modal (Rp)': Number(s.costPrice) || 0,
    'Untung Bersih (Rp)': Number(s.profit) || 0,
    'Status Garansi': s.isExpired ? 'EXPIRED' : (s.daysRemaining !== undefined ? `${s.daysRemaining} Hari Lagi` : 'AKTIF')
  }));
  const wsSales = XLSX.utils.json_to_sheet(salesRows.length > 0 ? salesRows : [{ 'Catatan': 'Belum ada data penjualan tersimpan' }]);
  XLSX.utils.book_append_sheet(wb, wsSales, 'Detail Transaksi');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buf;
}

/**
 * Menyinkronkan baris-baris spreadsheet ke dalam database
 * - Mendukung update harga, status ready/kosong, nama produk & varian
 * - Mendukung penambahan toko/supplier baru langsung dari spreadsheet
 * - Mendukung penambahan produk dan varian baru langsung dari spreadsheet
 * - Otomatis menghapus supplier yang sudah dibuang di spreadsheet (seperti Toko A, Toko B, Ipan)
 * - Menjaga kategori tetap rapi tanpa duplikasi
 */
export function mergeSheetIntoDb(sheetItems) {
  if (!Array.isArray(sheetItems) || sheetItems.length === 0) return 0;

  const db = getDb();
  let updatedCount = 0;

  // 1. Kumpulkan daftar supplier aktif dari spreadsheet + default supplier bot
  const activeSuppliersMap = new Map();
  activeSuppliersMap.set('heavenprem', 'heavenprem');
  activeSuppliersMap.set('ziem7_bot', 'Ziem7_bot');
  activeSuppliersMap.set('buatprem_bot', 'buatprem_bot');

  for (const row of sheetItems) {
    if (row.supplier && String(row.supplier).trim()) {
      const s = String(row.supplier).trim();
      activeSuppliersMap.set(s.toLowerCase(), s);
    }
  }

  // 2. Standardisasi Kategori (Hapus duplikasi seperti cat_ai, cat_1789...)
  const standardCategories = [
    { id: 'cat_1', name: 'AI Tools & Productivity' },
    { id: 'cat_2', name: 'Streaming & Entertainment' },
    { id: 'cat_3', name: 'Graphic, Design & Video' },
    { id: 'cat_4', name: 'Music & Audio' },
    { id: 'cat_5', name: 'Edukasi & Bahasa' },
    { id: 'cat_6', name: 'VPN & Security' },
    { id: 'cat_7', name: 'Office, Akun & Tools' }
  ];

  const categoryMap = new Map();
  for (const sc of standardCategories) {
    categoryMap.set(sc.name.toLowerCase(), sc);
    categoryMap.set(sc.id, sc);
  }

  const resolveCategory = (rawCatName) => {
    const cleanName = (rawCatName || 'Office, Akun & Tools').trim();
    const lower = cleanName.toLowerCase();

    if (/ai|artificial|prompt|generator/i.test(lower)) return categoryMap.get('cat_1');
    if (/stream|film|movie|nonton/i.test(lower)) return categoryMap.get('cat_2');
    if (/design|video|graphic|edit/i.test(lower)) return categoryMap.get('cat_3');
    if (/music|audio|lagu|musik/i.test(lower)) return categoryMap.get('cat_4');
    if (/edukasi|bahasa|education|study/i.test(lower)) return categoryMap.get('cat_5');
    if (/vpn|security|keamanan/i.test(lower)) return categoryMap.get('cat_6');
    if (/office|tools|akun|umum/i.test(lower)) return categoryMap.get('cat_7');

    for (const [key, val] of categoryMap.entries()) {
      if (key === lower || lower.includes(key) || key.includes(lower)) {
        return val;
      }
    }

    const newCat = { id: `cat_${Date.now()}_${Math.floor(Math.random() * 100)}`, name: cleanName };
    categoryMap.set(lower, newCat);
    categoryMap.set(newCat.id, newCat);
    standardCategories.push(newCat);
    return newCat;
  };

  db.categories = standardCategories;

  // 3. Bersihkan supplierOffers lama di semua varian (Hapus toko yang sudah dibuang dari spreadsheet)
  for (const v of db.variants || []) {
    if (Array.isArray(v.supplierOffers)) {
      v.supplierOffers = v.supplierOffers.filter(o => 
        o.supplier && activeSuppliersMap.has(String(o.supplier).trim().toLowerCase())
      );
    }
    // Jika supplier varian mengarah ke toko yang sudah dihapus, arahkan ke supplier valid
    if (v.supplier && !activeSuppliersMap.has(String(v.supplier).trim().toLowerCase())) {
      const validOffer = v.supplierOffers?.[0];
      v.supplier = validOffer ? validOffer.supplier : 'heavenprem';
      if (validOffer) v.costPrice = validOffer.costPrice;
    }
  }

  // 4. Proses baris-baris dari spreadsheet
  for (const row of sheetItems) {
    const prodName = (row.productName || '').trim();
    const varName = standardizeDuration((row.variantName || '').trim());
    if (!prodName && !varName) continue;

    const catObj = resolveCategory(row.category);
    const supplierName = activeSuppliersMap.get((row.supplier || 'heavenprem').trim().toLowerCase()) || (row.supplier || 'heavenprem').trim();
    const costPrice = Number(row.costPrice) || 0;
    const sellingPrice = Number(row.sellingPrice) || (costPrice + 3000);
    const isAvailable = row.isAvailable !== false && String(row.isAvailable).toLowerCase() !== 'false' && String(row.isAvailable).toLowerCase() !== 'kosong';

    // A. Cari atau buat Produk
    let prod = null;
    if (row.productId && row.productId !== '-') {
      prod = (db.products || []).find(p => p.id === row.productId);
    }
    if (!prod && prodName) {
      prod = (db.products || []).find(p => p.name.trim().toLowerCase() === prodName.toLowerCase());
    }

    if (!prod) {
      const newProdId = (row.productId && row.productId !== '-') ? row.productId : `prod_sheet_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      prod = {
        id: newProdId,
        categoryId: catObj.id,
        name: prodName || varName,
        description: `Akun Premium Resmi & Bergaransi D Store`,
        isActive: true
      };
      if (!Array.isArray(db.products)) db.products = [];
      db.products.push(prod);
    } else {
      if (prodName) prod.name = prodName;
      prod.categoryId = catObj.id;
    }

    // B. Cari atau buat Varian
    let v = null;
    if (row.variantId && row.variantId !== '-') {
      v = (db.variants || []).find(item => item.id === row.variantId);
    }
    if (!v && varName) {
      v = (db.variants || []).find(item => item.productId === prod.id && item.name.trim().toLowerCase() === varName.toLowerCase());
    }

    if (v) {
      if (varName && varName !== '-') v.name = varName;
      v.productId = prod.id;
      if (!isNaN(sellingPrice) && sellingPrice > 0) v.price = sellingPrice;
      if (!isNaN(costPrice)) v.costPrice = costPrice;
      v.supplier = supplierName;
      v.isAvailable = isAvailable;

      if (!Array.isArray(v.supplierOffers)) v.supplierOffers = [];
      const sIdx = v.supplierOffers.findIndex(o => o.supplier.toLowerCase() === supplierName.toLowerCase());
      if (sIdx >= 0) {
        v.supplierOffers[sIdx].costPrice = costPrice;
        v.supplierOffers[sIdx].isAvailable = isAvailable;
        v.supplierOffers[sIdx].updatedAt = new Date().toISOString();
      } else {
        v.supplierOffers.push({
          supplier: supplierName,
          costPrice,
          isAvailable,
          updatedAt: new Date().toISOString()
        });
      }
      v.supplierOffers.sort((a, b) => a.costPrice - b.costPrice);
      updatedCount++;
    } else if (varName && varName !== '-') {
      // Tambah varian baru dari spreadsheet
      const newVarId = (row.variantId && row.variantId !== '-') ? row.variantId : `var_sheet_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const newVar = {
        id: newVarId,
        productId: prod.id,
        name: varName,
        price: sellingPrice,
        costPrice: costPrice,
        supplier: supplierName,
        isSupplierLocked: false,
        isAvailable,
        supplierOffers: [
          {
            supplier: supplierName,
            costPrice,
            isAvailable,
            updatedAt: new Date().toISOString()
          }
        ]
      };
      if (!Array.isArray(db.variants)) db.variants = [];
      db.variants.push(newVar);
      updatedCount++;
    }
  }

  // 5. Pastikan semua produk yang ada di db mengarah ke kategori valid
  for (const p of db.products || []) {
    if (!standardCategories.some(c => c.id === p.categoryId)) {
      const resolved = resolveCategory(p.name);
      p.categoryId = resolved.id;
    }
  }

  saveDb(db);
  return updatedCount;
}

export function normalizeKeyword(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/1/g, 'i')
    .replace(/0/g, 'o')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/nya\b/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function findMatchingProductOrVariant(query, dbInstance) {
  if (!query) return null;
  const rawQ = query.trim().toLowerCase();
  const cleanQ = normalizeKeyword(query);
  if (!cleanQ) return null;

  const db = dbInstance || getDb();
  const products = db.products || [];
  const variants = db.variants || [];

  // 1. Cek kecocokan nama produk
  for (const p of products) {
    const pNorm = normalizeKeyword(p.name);
    if (pNorm === cleanQ || pNorm.includes(cleanQ) || cleanQ.includes(pNorm)) {
      const vars = variants.filter(v => v.productId === p.id);
      return { product: p, variant: vars[0] || null, allVariants: vars };
    }
  }

  // 2. Cek kecocokan nama varian
  for (const v of variants) {
    const vNorm = normalizeKeyword(v.name);
    const p = products.find(prod => prod.id === v.productId);
    const pNorm = p ? normalizeKeyword(p.name) : '';
    const combinedNorm = `${pNorm}${vNorm}`;

    if (vNorm.includes(cleanQ) || combinedNorm.includes(cleanQ) || cleanQ.includes(vNorm)) {
      return { product: p, variant: v, allVariants: p ? variants.filter(x => x.productId === p.id) : [v] };
    }
  }

  // 3. Fallback kata per kata
  const words = rawQ.split(/\s+/).map(w => normalizeKeyword(w)).filter(w => w.length >= 3);
  for (const word of words) {
    for (const p of products) {
      if (normalizeKeyword(p.name).includes(word)) {
        const vars = variants.filter(v => v.productId === p.id);
        return { product: p, variant: vars[0] || null, allVariants: vars };
      }
    }
  }

  return null;
}

export function getOwnerProfile() {
  const db = getDb();
  if (!db.ownerProfile) {
    db.ownerProfile = { name: '', callSign: 'Bos' };
  }
  return db.ownerProfile;
}

export function updateOwnerProfile(data) {
  const db = getDb();
  if (!db.ownerProfile) db.ownerProfile = { name: '', callSign: 'Bos' };
  if (data.name) db.ownerProfile.name = data.name;
  if (data.callSign) db.ownerProfile.callSign = data.callSign;
  saveDb(db);
  return db.ownerProfile;
}
