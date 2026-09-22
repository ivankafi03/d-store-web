import { NextResponse } from 'next/server';
import { getDb, standardizeDuration, categorizeProduct } from '@/lib/db';

// Helper to strip redundant product name from variant name
function getCleanVariantName(variantName, productName) {
  if (!variantName) return '';
  const cleanStr = standardizeDuration(variantName);
  const pName = (productName || '').trim().toLowerCase();
  const vName = cleanStr.trim();
  if (pName && vName.toLowerCase().startsWith(pName)) {
    const stripped = vName.slice(pName.length).trim().replace(/^[-–:_\s/]+/, '');
    if (stripped) return standardizeDuration(stripped);
  }
  const words = pName.split(/\s+/);
  if (words.length > 1) {
    const firstWord = words[0];
    if (firstWord.length > 2 && vName.toLowerCase().startsWith(firstWord)) {
      const stripped = vName.slice(firstWord.length).trim().replace(/^[-–:_\s/]+/, '');
      if (stripped) return standardizeDuration(stripped);
    }
  }
  return standardizeDuration(vName);
}

export async function GET() {
  try {
    let rawItems = null;

    // 1. Coba tarik data live dari Google Spreadsheet Webhook
    const DEFAULT_SHEET_WEBHOOK = 'https://script.google.com/macros/s/AKfycbwHn2YFwV8udrqwbc8cwZUeBiXCPkZ3NtFRcxTtxMB1CI5knWee9JGl50GyqtAlUxs/exec';
    let webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK;
    if (!webhookUrl || typeof webhookUrl !== 'string' || !webhookUrl.startsWith('http') || webhookUrl.includes('undefined')) {
      webhookUrl = DEFAULT_SHEET_WEBHOOK;
    }

    let fetchDebug = { url: webhookUrl.slice(0, 50) + '...', error: null, itemsCount: 0 };

    if (webhookUrl) {
      try {
        const sheetRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'read_all' }),
          redirect: 'follow',
          cache: 'no-store'
        });
        const sheetData = await sheetRes.json();
        if (sheetData && sheetData.status === 'ok' && Array.isArray(sheetData.items) && sheetData.items.length > 0) {
          rawItems = sheetData.items;
          fetchDebug.itemsCount = rawItems.length;
        } else {
          fetchDebug.error = 'sheetData status: ' + (sheetData ? sheetData.status : 'null');
        }
      } catch (err) {
        console.warn('[Store API] Live Google Sheets fetch failed, falling back to local DB:', err.message);
        fetchDebug.error = err.message;
      }
    }

    const db = getDb();
    const categories = [
      { id: 'cat_1', name: 'AI Tools & Productivity' },
      { id: 'cat_2', name: 'Streaming & Entertainment' },
      { id: 'cat_3', name: 'Graphic, Design & Video' },
      { id: 'cat_4', name: 'Music & Audio' },
      { id: 'cat_5', name: 'Edukasi & Bahasa' },
      { id: 'cat_6', name: 'VPN & Security' },
      { id: 'cat_7', name: 'Office, Akun & Tools' }
    ];

    let publicProducts = [];

    if (rawItems && rawItems.length > 0) {
      // Kelompokkan data live dari spreadsheet
      const prodMap = new Map();
      for (const item of rawItems) {
        const pName = (item.productName || item.nama_produk || '').trim();
        if (!pName) continue;

        let pId = item.productId || item.id || pName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        // Gunakan fungsi kategorisasi terpadu agar kategori selalu akurat
        const catInfo = categorizeProduct(pName);
        const catId = catInfo.id;
        const finalCatName = catInfo.name;

        if (!prodMap.has(pId)) {
          prodMap.set(pId, {
            id: pId,
            name: pName,
            categoryId: catId,
            categoryName: finalCatName,
            variants: []
          });
        }

        const vName = standardizeDuration(item.variantName || item.nama_varian || 'Standar');
        const sellingPrice = Number(item.sellingPrice || item.harga_jual || item.price) || 0;
        const isAvail = item.isAvailable !== false && item.isAvailable !== 'false' && String(item.isAvailable).toLowerCase() !== 'kosong';

        prodMap.get(pId).variants.push({
          id: item.variantId || `${pId}_${prodMap.get(pId).variants.length}`,
          name: vName,
          cleanName: getCleanVariantName(vName, pName),
          price: sellingPrice,
          isAvailable: isAvail
        });
      }
      publicProducts = Array.from(prodMap.values());
    } else {
      // Gunakan database lokal db.json sebagai sumber data yang selalu siap
      const products = db.products || [];
      const variants = db.variants || [];

      for (const p of products) {
        if (p.isActive === false) continue;
        const pVars = variants.filter(v => v.productId === p.id);
        if (pVars.length === 0) continue;

        const catInfo = categorizeProduct(p.name);
        const catId = catInfo.id;
        const catName = catInfo.name;

        publicProducts.push({
          id: p.id,
          name: p.name,
          categoryId: catId,
          categoryName: catName,
          variants: pVars.map(v => {
            const vName = standardizeDuration(v.name);
            return {
              id: v.id,
              name: vName,
              cleanName: getCleanVariantName(vName, p.name),
              price: Number(v.price) || 0,
              isAvailable: v.isAvailable !== false
            };
          })
        });
      }
    }

    // Sort: produk yang memiliki varian ready ditaruh di prioritas atas
    publicProducts.sort((a, b) => {
      const aReady = a.variants.some(v => v.isAvailable);
      const bReady = b.variants.some(v => v.isAvailable);
      if (aReady && !bReady) return -1;
      if (!aReady && bReady) return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });

    return NextResponse.json({
      status: 'ok',
      storeName: 'D STORE',
      totalProducts: publicProducts.length,
      categories: categories,
      products: publicProducts,
      debug: fetchDebug
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=45',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    });
  } catch (err) {
    console.error('[Store API Error]', err);
    return NextResponse.json({ status: 'error', message: 'Gagal memuat katalog toko' }, { status: 500 });
  }
}
