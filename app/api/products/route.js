import { NextResponse } from 'next/server';
import { getDb, saveDb, pushToGoogleSheet, standardizeDuration } from '@/lib/db';

export async function GET() {
  const db = getDb();
  return NextResponse.json({
    status: 'ok',
    categories: db.categories || [],
    products: db.products || [],
    variants: db.variants || [],
    blacklistedProducts: db.blacklistedProducts || [],
    blacklistedVariants: db.blacklistedVariants || []
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;
    const db = getDb();

    if (action === 'toggle_stock') {
      const { variantId, isAvailable } = body;
      const v = (db.variants || []).find(item => item.id === variantId);
      if (!v) return NextResponse.json({ status: 'error', message: 'Varian tidak ditemukan' }, { status: 404 });

      v.isAvailable = !!isAvailable;
      if (Array.isArray(v.supplierOffers)) {
        const currentSupp = v.supplier ? v.supplier.toLowerCase() : '';
        const match = v.supplierOffers.find(o => o.supplier.toLowerCase() === currentSupp);
        if (match) match.isAvailable = v.isAvailable;
      }

      saveDb(db);
      // Auto-sync ke Google Spreadsheet di latar belakang
      pushToGoogleSheet().catch(err => console.warn('Background sync failed:', err.message));

      return NextResponse.json({ status: 'ok', variant: v });
    }

    if (action === 'update_price') {
      const { variantId, sellingPrice, costPrice, supplier } = body;
      const v = (db.variants || []).find(item => item.id === variantId);
      if (!v) return NextResponse.json({ status: 'error', message: 'Varian tidak ditemukan' }, { status: 404 });

      if (sellingPrice !== undefined) v.price = Number(sellingPrice);
      if (costPrice !== undefined) v.costPrice = Number(costPrice);
      if (supplier) v.supplier = String(supplier).trim();

      if (!Array.isArray(v.supplierOffers)) v.supplierOffers = [];
      const cleanSupp = (v.supplier || 'heavenprem').toLowerCase();
      const existing = v.supplierOffers.find(o => o.supplier.toLowerCase() === cleanSupp);
      if (existing) {
        existing.costPrice = v.costPrice;
        existing.isAvailable = v.isAvailable !== false;
      } else {
        v.supplierOffers.push({
          supplier: v.supplier || 'heavenprem',
          costPrice: v.costPrice,
          isAvailable: v.isAvailable !== false,
          updatedAt: new Date().toISOString()
        });
      }

      saveDb(db);
      pushToGoogleSheet().catch(err => console.warn('Background sync failed:', err.message));

      return NextResponse.json({ status: 'ok', variant: v });
    }

    if (action === 'select_supplier') {
      const { variantId, supplier } = body;
      const v = (db.variants || []).find(item => item.id === variantId);
      if (!v) return NextResponse.json({ status: 'error', message: 'Varian tidak ditemukan' }, { status: 404 });
      
      const offer = (v.supplierOffers || []).find(o => o.supplier.toLowerCase() === String(supplier).toLowerCase());
      if (!offer) return NextResponse.json({ status: 'error', message: 'Tawaran toko tidak ditemukan' }, { status: 404 });
      
      v.supplier = offer.supplier;
      v.costPrice = offer.costPrice;
      v.isAvailable = offer.isAvailable !== false;
      v.isSupplierLocked = true;
      
      saveDb(db);
      pushToGoogleSheet().catch(err => console.warn('Background sync failed:', err.message));
      return NextResponse.json({ status: 'ok', variant: v });
    }

    if (action === 'upsert_supplier') {
      const { variantId, supplier, costPrice, isAvailable, contact } = body;
      const v = (db.variants || []).find(item => item.id === variantId);
      if (!v) return NextResponse.json({ status: 'error', message: 'Varian tidak ditemukan' }, { status: 404 });

      if (!Array.isArray(v.supplierOffers)) v.supplierOffers = [];
      const cleanSupp = (supplier || 'heavenprem').trim();
      const cost = Number(costPrice) || 0;
      const avail = isAvailable !== false;
      const suppContact = contact ? String(contact).trim() : '';

      const idx = v.supplierOffers.findIndex(o => o.supplier.toLowerCase() === cleanSupp.toLowerCase());
      if (idx >= 0) {
        v.supplierOffers[idx].costPrice = cost;
        v.supplierOffers[idx].isAvailable = avail;
        if (suppContact) v.supplierOffers[idx].contact = suppContact;
        v.supplierOffers[idx].updatedAt = new Date().toISOString();
      } else {
        v.supplierOffers.push({
          supplier: cleanSupp,
          costPrice: cost,
          isAvailable: avail,
          contact: suppContact,
          updatedAt: new Date().toISOString()
        });
      }

      v.supplierOffers.sort((a, b) => a.costPrice - b.costPrice);

      // Cari toko termurah yang ready
      const best = v.supplierOffers.find(o => o.isAvailable);
      if (best) {
        v.supplier = best.supplier;
        v.costPrice = best.costPrice;
        v.isAvailable = true;
      } else if (v.supplierOffers.length > 0) {
        v.supplier = v.supplierOffers[0].supplier;
        v.costPrice = v.supplierOffers[0].costPrice;
        v.isAvailable = false;
      }

      saveDb(db);
      pushToGoogleSheet().catch(err => console.warn('Background sync failed:', err.message));

      return NextResponse.json({ status: 'ok', variant: v, offers: v.supplierOffers });
    }

    if (action === 'add_product') {
      const { productName, categoryName, variantName, sellingPrice, costPrice, supplier } = body;
      if (!productName || !variantName) {
        return NextResponse.json({ status: 'error', message: 'Nama produk dan varian wajib diisi' }, { status: 400 });
      }

      let cat = (db.categories || []).find(c => c.name.toLowerCase() === (categoryName || '').toLowerCase());
      if (!cat) {
        cat = { id: `cat_${Date.now()}`, name: categoryName || 'Umum' };
        db.categories.push(cat);
      }

      let prod = (db.products || []).find(p => p.name.toLowerCase() === productName.toLowerCase());
      if (!prod) {
        prod = {
          id: `prod_${Date.now()}`,
          categoryId: cat.id,
          name: productName.trim(),
          description: 'Ditambahkan via Web Dashboard',
          isActive: true
        };
        db.products.push(prod);
      }

      const cost = Number(costPrice) || 0;
      const sell = Number(sellingPrice) || 0;
      const supp = (supplier || 'heavenprem').trim();

      const newVar = {
        id: `var_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        productId: prod.id,
        name: variantName.trim(),
        price: sell,
        costPrice: cost,
        supplier: supp,
        isAvailable: true,
        supplierOffers: [
          { supplier: supp, costPrice: cost, isAvailable: true, updatedAt: new Date().toISOString() }
        ]
      };
      db.variants.push(newVar);

      saveDb(db);
      pushToGoogleSheet().catch(err => console.warn('Background sync failed:', err.message));

      return NextResponse.json({ status: 'ok', product: prod, variant: newVar });
    }

    if (action === 'bulk_update_prices') {
      const {
        mode = 'add_to_cost',
        amount = 1000,
        randomMin = 1000,
        randomMax = 3000,
        roundTo = 500,
        categoryFilter = 'all',
        supplierFilter = 'all',
        variantIds = null
      } = body;

      const products = db.products || [];
      const variants = db.variants || [];

      const targets = variants.filter(v => {
        if (Array.isArray(variantIds) && variantIds.length > 0) {
          return variantIds.includes(v.id);
        }
        if (supplierFilter !== 'all') {
          const vSupp = (v.supplier || '').toLowerCase();
          const suppMatch = vSupp === supplierFilter.toLowerCase()
            || (Array.isArray(v.supplierOffers) && v.supplierOffers.some(
              o => (o.supplier || '').toLowerCase() === supplierFilter.toLowerCase()
            ));
          if (!suppMatch) return false;
        }
        if (categoryFilter !== 'all') {
          const p = products.find(prod => prod.id === v.productId);
          if (!p || p.categoryId !== categoryFilter) return false;
        }
        return true;
      });

      if (targets.length === 0) {
        return NextResponse.json({ status: 'error', message: 'Tidak ada varian yang sesuai dengan filter' }, { status: 400 });
      }

      const step = Math.max(100, Number(roundTo) || 500);
      let updatedCount = 0;

      for (const v of targets) {
        const cost = Number(v.costPrice) || 0;
        const currentSell = Number(v.price) || 0;
        let newSell = currentSell;

        if (mode === 'add_to_cost') {
          newSell = cost + Number(amount || 0);
        } else if (mode === 'add_to_selling') {
          newSell = currentSell + Number(amount || 0);
        } else if (mode === 'random_margin') {
          const minVal = Math.min(Number(randomMin) || 1000, Number(randomMax) || 3000);
          const maxVal = Math.max(Number(randomMin) || 1000, Number(randomMax) || 3000);
          const minSteps = Math.floor(minVal / step);
          const maxSteps = Math.floor(maxVal / step);
          const chosenStep = Math.floor(Math.random() * (maxSteps - minSteps + 1)) + minSteps;
          newSell = cost + (chosenStep * step);
        } else if (mode === 'percent_cost') {
          const pct = Number(amount) || 10;
          newSell = Math.round((cost * (1 + pct / 100)) / step) * step;
        }

        newSell = Math.round(newSell / step) * step;

        if (newSell <= cost) {
          newSell = cost + step;
        }
        if (newSell <= 0) {
          newSell = step;
        }

        v.price = newSell;
        updatedCount++;
      }

      saveDb(db);
      pushToGoogleSheet().catch(err => console.warn('Background sync failed:', err.message));

      return NextResponse.json({
        status: 'ok',
        updatedCount,
        variants: db.variants
      });
    }

    if (action === 'delete_variant') {
      const { variantId, blacklist = true } = body;
      const v = (db.variants || []).find(item => item.id === variantId);
      if (!v) return NextResponse.json({ status: 'error', message: 'Varian tidak ditemukan' }, { status: 404 });

      const prod = (db.products || []).find(p => p.id === v.productId);
      const prodName = prod ? prod.name : '';

      if (blacklist) {
        if (!Array.isArray(db.blacklistedVariants)) db.blacklistedVariants = [];
        const already = db.blacklistedVariants.some(
          bv => bv.productName?.toLowerCase().trim() === prodName.toLowerCase().trim() &&
                standardizeDuration(bv.variantName?.toLowerCase().trim()) === standardizeDuration(v.name.toLowerCase().trim())
        );
        if (!already) {
          db.blacklistedVariants.push({
            id: `bl_v_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            variantId: v.id,
            productId: v.productId,
            productName: prodName,
            variantName: v.name,
            deletedAt: new Date().toISOString()
          });
        }
      }

      db.variants = (db.variants || []).filter(item => item.id !== variantId);

      // Jika produk tidak punya varian lagi, hapus juga produknya agar tidak jadi produk kosong phantom
      const remaining = db.variants.filter(item => item.productId === v.productId);
      if (remaining.length === 0 && prod) {
        db.products = (db.products || []).filter(p => p.id !== prod.id);
      }

      saveDb(db);
      pushToGoogleSheet().catch(err => console.warn('Background sync failed:', err.message));
      return NextResponse.json({
        status: 'ok',
        deletedVariantId: variantId,
        blacklistedVariants: db.blacklistedVariants || [],
        products: db.products || [],
        variants: db.variants || []
      });
    }

    if (action === 'delete_product') {
      const { productId, blacklist = true } = body;
      const prod = (db.products || []).find(p => p.id === productId);
      if (!prod) return NextResponse.json({ status: 'error', message: 'Produk tidak ditemukan' }, { status: 404 });

      if (blacklist) {
        if (!Array.isArray(db.blacklistedProducts)) db.blacklistedProducts = [];
        if (!db.blacklistedProducts.some(bp => (bp.name || bp).toLowerCase().trim() === prod.name.toLowerCase().trim())) {
          db.blacklistedProducts.push({
            id: `bl_p_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            productId: prod.id,
            name: prod.name,
            deletedAt: new Date().toISOString()
          });
        }

        // Blacklist juga seluruh varian miliknya
        const prodVariants = (db.variants || []).filter(v => v.productId === prod.id);
        if (!Array.isArray(db.blacklistedVariants)) db.blacklistedVariants = [];
        for (const v of prodVariants) {
          const already = db.blacklistedVariants.some(
            bv => bv.productName?.toLowerCase().trim() === prod.name.toLowerCase().trim() &&
                  standardizeDuration(bv.variantName?.toLowerCase().trim()) === standardizeDuration(v.name.toLowerCase().trim())
          );
          if (!already) {
            db.blacklistedVariants.push({
              id: `bl_v_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              variantId: v.id,
              productId: prod.id,
              productName: prod.name,
              variantName: v.name,
              deletedAt: new Date().toISOString()
            });
          }
        }
      }

      db.products = (db.products || []).filter(p => p.id !== productId);
      db.variants = (db.variants || []).filter(v => v.productId !== productId);

      saveDb(db);
      pushToGoogleSheet().catch(err => console.warn('Background sync failed:', err.message));
      return NextResponse.json({
        status: 'ok',
        deletedProductId: productId,
        blacklistedProducts: db.blacklistedProducts || [],
        blacklistedVariants: db.blacklistedVariants || [],
        products: db.products || [],
        variants: db.variants || []
      });
    }

    if (action === 'restore_blacklist') {
      const { id, type } = body; // type: 'product' atau 'variant'
      if (type === 'product') {
        db.blacklistedProducts = (db.blacklistedProducts || []).filter(bp => (bp.id || bp) !== id && (bp.name || bp) !== id);
      } else {
        db.blacklistedVariants = (db.blacklistedVariants || []).filter(bv => bv.id !== id && bv.variantId !== id);
      }
      saveDb(db);
      return NextResponse.json({
        status: 'ok',
        blacklistedProducts: db.blacklistedProducts || [],
        blacklistedVariants: db.blacklistedVariants || []
      });
    }

    if (action === 'clear_blacklist') {
      db.blacklistedProducts = [];
      db.blacklistedVariants = [];
      saveDb(db);
      return NextResponse.json({ status: 'ok' });
    }

    return NextResponse.json({ status: 'error', message: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
