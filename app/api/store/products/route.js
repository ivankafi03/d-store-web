import { NextResponse } from 'next/server';
import { getDb, standardizeDuration, categorizeProduct } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    const db = getDb(true);
    const products = Array.isArray(db.products) ? db.products : [];
    const variants = Array.isArray(db.variants) ? db.variants : [];
    const categories = Array.isArray(db.categories) ? db.categories : [
      { id: 'cat_1', name: 'AI Tools & Productivity' },
      { id: 'cat_2', name: 'Streaming & Entertainment' },
      { id: 'cat_3', name: 'Graphic, Design & Video' },
      { id: 'cat_4', name: 'Music & Audio' },
      { id: 'cat_5', name: 'Edukasi & Bahasa' },
      { id: 'cat_6', name: 'VPN & Security' },
      { id: 'cat_7', name: 'Office, Akun & Tools' }
    ];

    const publicProducts = [];

    for (const p of products) {
      if (p.isActive === false) continue;
      const pVars = variants.filter(v => v.productId === p.id);
      if (pVars.length === 0) continue;

      const catInfo = categorizeProduct(p.name);
      const catId = p.categoryId || catInfo.id;
      const catName = categories.find(c => c.id === catId)?.name || catInfo.name;

      publicProducts.push({
        id: p.id,
        name: p.name,
        brand: p.brand || p.name.toUpperCase(),
        categoryId: catId,
        categoryName: catName,
        price: p.price,
        description: p.description || `Layanan akun ${p.name} premium legal bergaransi resmi.`,
        variants: pVars.map(v => {
          const vName = standardizeDuration(v.name);
          return {
            id: v.id,
            name: vName,
            cleanName: v.duration || getCleanVariantName(vName, p.name),
            duration: v.duration || '',
            price: Number(v.price) || 0,
            costPrice: Number(v.costPrice) || 0,
            supplier: v.supplier || '',
            isAvailable: v.isAvailable !== false,
            supplierOffers: v.supplierOffers || []
          };
        })
      });
    }

    publicProducts.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

    return NextResponse.json({
      status: 'ok',
      storeName: 'D STORE',
      totalProducts: publicProducts.length,
      categories,
      products: publicProducts,
      rawProducts: products,
      rawVariants: variants,
      updatedAt: db.updatedAt || new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=15',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (err) {
    console.error('[Store API Error]', err);
    return NextResponse.json({ status: 'error', message: 'Gagal memuat katalog toko: ' + err.message }, { status: 500 });
  }
}
