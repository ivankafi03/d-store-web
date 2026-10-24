import { NextResponse } from 'next/server';
import { getDb, saveDb, pushToGoogleSheet, pushNotesToGoogleSheet, pullNotesFromGoogleSheet, standardizeDuration } from '@/lib/db';
import { isAuthenticatedRequest } from '@/lib/auth';
import { getAllUsers, syncCustomerNoteToUserOrder, deleteUserByEmail, pushUsersToGoogleSheet, pullUsersFromGoogleSheet } from '@/lib/userAuth';

export async function GET(request) {
  const isAuth = isAuthenticatedRequest(request);
  const host = request?.headers?.get('host') || '';
  const isLocalOrDev = process.env.NODE_ENV !== 'production' && (host.includes('localhost') || host.includes('192.168.') || host.includes('127.0.0.1'));

  if (!isAuth && !isLocalOrDev) {
    return NextResponse.json({ status: 'error', message: 'Akses ditolak. Sesi admin diperlukan.' }, { status: 401 });
  }

  let db = getDb(true);

  // Jika customerNotes kosong (misal baru deploy di Vercel) atau ada parameter pull_cloud=1,
  // coba sinkronkan data dari cloud Google Sheets
  try {
    const url = request ? new URL(request.url) : null;
    const forcePull = url?.searchParams?.get('pull_cloud') === '1';
    if (forcePull || process.env.VERCEL || (!db.customerNotes || db.customerNotes.length === 0)) {
      await Promise.allSettled([
        pullNotesFromGoogleSheet(),
        pullUsersFromGoogleSheet()
      ]);
      db = getDb(true);
    }
  } catch (err) {
    // abaikan jika jaringan cloud lambat/gagal
  }

  const allUsers = getAllUsers(true);
  const registeredUsers = allUsers.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    tier: u.tier,
    phone: u.phone || ''
  }));

  return NextResponse.json({
    status: 'ok',
    categories: db.categories || [],
    products: db.products || [],
    variants: db.variants || [],
    suppliers: db.suppliers || [],
    customerNotes: db.customerNotes || [],
    registeredUsers,
    blacklistedProducts: db.blacklistedProducts || [],
    blacklistedVariants: db.blacklistedVariants || [],
    categoryOverrides: db.categoryOverrides || {}
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

export async function POST(request) {
  const isAuth = isAuthenticatedRequest(request);
  const host = request.headers.get('host') || '';
  const isLocalOrDev = process.env.NODE_ENV !== 'production' && (host.includes('localhost') || host.includes('192.168.') || host.includes('127.0.0.1'));

  if (!isAuth && !isLocalOrDev) {
    return NextResponse.json({ status: 'error', message: 'Akses ditolak. Sesi tidak sah.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;
    const db = getDb(true);

    if (action === 'sync_category_overrides') {
      const { overrides } = body;
      if (overrides && typeof overrides === 'object') {
        db.categoryOverrides = {
          ...(db.categoryOverrides || {}),
          ...overrides
        };
        for (const [prodId, data] of Object.entries(overrides)) {
          const p = (db.products || []).find(item => item.id === prodId || item.sku === prodId);
          if (p) {
            if (data.image) p.image = data.image;
            if (data.name) p.name = data.name;
            if (data.brand) p.brand = data.brand;
            if (data.price) p.price = Number(data.price);
          }
        }
        saveDb(db);
        return NextResponse.json({ status: 'ok', categoryOverrides: db.categoryOverrides });
      }
      return NextResponse.json({ status: 'ok', categoryOverrides: db.categoryOverrides || {} });
    }

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

    if (action === 'toggle_product_stock') {
      const { productId, isAvailable } = body;
      const prod = (db.products || []).find(p => p.id === productId);
      if (!prod) return NextResponse.json({ status: 'error', message: 'Produk tidak ditemukan' }, { status: 404 });

      const avail = !!isAvailable;
      const prodVariants = (db.variants || []).filter(v => v.productId === productId);
      for (const v of prodVariants) {
        v.isAvailable = avail;
        if (Array.isArray(v.supplierOffers)) {
          const currentSupp = v.supplier ? v.supplier.toLowerCase() : '';
          const match = v.supplierOffers.find(o => o.supplier.toLowerCase() === currentSupp);
          if (match) match.isAvailable = avail;
        }
      }

      saveDb(db);
      pushToGoogleSheet().catch(err => console.warn('Background sync failed:', err.message));
      return NextResponse.json({ status: 'ok', variants: db.variants });
    }

    if (action === 'update_product') {
      const { productId, name, description, categoryId, image, brand, price } = body;
      let prod = (db.products || []).find(p => p.id === productId);
      if (!prod) {
        // Jika belum ada di list products (misalnya produk bawaan curated SKU), buat entri baru
        prod = {
          id: productId || `prod_${Date.now()}`,
          name: name ? name.trim() : 'Produk',
          categoryId: categoryId || 'cat_1',
          image: image || null,
          brand: brand || null,
          price: price ? Number(price) : null
        };
        db.products = db.products || [];
        db.products.push(prod);
      } else {
        if (name) prod.name = name.trim();
        if (description !== undefined) prod.description = description.trim();
        if (categoryId) prod.categoryId = categoryId;
        if (image !== undefined) prod.image = image;
        if (brand !== undefined) prod.brand = brand;
        if (price !== undefined) prod.price = Number(price);
      }

      saveDb(db);
      pushToGoogleSheet().catch(err => console.warn('Background sync failed:', err.message));
      return NextResponse.json({ status: 'ok', product: prod });
    }

    if (action === 'update_price' || action === 'update_variant') {
      const { variantId, sellingPrice, price, costPrice, supplier, variantName, name } = body;
      const v = (db.variants || []).find(item => item.id === variantId);
      if (!v) return NextResponse.json({ status: 'error', message: 'Varian tidak ditemukan' }, { status: 404 });

      const newName = (variantName || name || '').trim();
      if (newName) {
        v.name = standardizeDuration(newName);
      }
      const newSell = sellingPrice !== undefined ? Number(sellingPrice) : (price !== undefined ? Number(price) : undefined);
      if (newSell !== undefined && !isNaN(newSell)) v.price = newSell;
      if (costPrice !== undefined && !isNaN(Number(costPrice))) v.costPrice = Number(costPrice);
      if (supplier !== undefined && String(supplier).trim()) v.supplier = String(supplier).trim();

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

    if (action === 'add_supplier') {
      const { name, code, contact, type, link, note } = body;
      if (!name || !name.trim()) {
        return NextResponse.json({ status: 'error', message: 'Nama toko kulak wajib diisi' }, { status: 400 });
      }
      if (!Array.isArray(db.suppliers)) db.suppliers = [];
      const cleanCode = (code || name).toLowerCase().replace(/[^a-z0-9]/g, '');
      const newSupp = {
        id: `supp_${Date.now()}`,
        name: name.trim(),
        code: cleanCode || `supp_${Date.now()}`,
        contact: contact ? contact.trim() : '',
        type: type || 'bot',
        link: link ? link.trim() : (contact?.startsWith('@') ? `https://t.me/${contact.replace('@','')}` : ''),
        note: note ? note.trim() : ''
      };
      db.suppliers.push(newSupp);
      saveDb(db);
      return NextResponse.json({ status: 'ok', supplier: newSupp, suppliers: db.suppliers });
    }

    if (action === 'update_supplier') {
      const { id, name, code, contact, type, link, note } = body;
      if (!Array.isArray(db.suppliers)) db.suppliers = [];
      const supp = db.suppliers.find(s => s.id === id || s.code === code);
      if (!supp) return NextResponse.json({ status: 'error', message: 'Toko kulak tidak ditemukan' }, { status: 404 });
      if (name) supp.name = name.trim();
      if (contact !== undefined) supp.contact = contact.trim();
      if (type) supp.type = type;
      if (link !== undefined) supp.link = link.trim();
      if (note !== undefined) supp.note = note.trim();
      saveDb(db);
      return NextResponse.json({ status: 'ok', supplier: supp, suppliers: db.suppliers });
    }

    if (action === 'delete_supplier') {
      const { id, code } = body;
      if (!Array.isArray(db.suppliers)) db.suppliers = [];
      db.suppliers = db.suppliers.filter(s => s.id !== id && s.code !== code);
      saveDb(db);
      return NextResponse.json({ status: 'ok', suppliers: db.suppliers });
    }

    if (action === 'add_variant') {
      const { productId, variantName, sellingPrice, costPrice, supplier } = body;
      if (!productId || !variantName) {
        return NextResponse.json({ status: 'error', message: 'Produk dan nama varian wajib diisi' }, { status: 400 });
      }

      const prod = (db.products || []).find(p => p.id === productId);
      if (!prod) {
        return NextResponse.json({ status: 'error', message: 'Produk tidak ditemukan' }, { status: 404 });
      }

      const cost = Number(costPrice) || 0;
      const sell = Number(sellingPrice) || 0;
      const supp = (supplier || 'heavenprem').trim();
      const cleanVarName = standardizeDuration(variantName.trim());

      const newVar = {
        id: `var_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        productId: prod.id,
        name: cleanVarName,
        price: sell,
        costPrice: cost,
        supplier: supp,
        isAvailable: true,
        supplierOffers: [
          { supplier: supp, costPrice: cost, isAvailable: true, updatedAt: new Date().toISOString() }
        ]
      };
      if (!Array.isArray(db.variants)) db.variants = [];
      db.variants.push(newVar);

      saveDb(db);
      pushToGoogleSheet().catch(err => console.warn('Background sync failed:', err.message));

      return NextResponse.json({ status: 'ok', variant: newVar, variants: db.variants });
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

    // -------------------------------------------------------------
    // FITUR: BUKU CATATAN CERDAS (ORDER / CUSTOMER SUBSCRIPTION NOTEBOOK)
    // -------------------------------------------------------------
    if (action === 'add_customer_note') {
      const {
        customerName = '',
        customerEmail = '',
        contactType = 'whatsapp',
        contact = '',
        productId = '',
        productName = '',
        variantName = '',
        accountDetails = '',
        supplier = '',
        price = 0,
        durationDays = 30,
        startDate,
        expiredDate,
        notes = '',
        warrantyCount = 0,
        warrantyMax = 1
      } = body;

      if (!Array.isArray(db.customerNotes)) db.customerNotes = [];

      const now = new Date();
      const start = startDate ? new Date(startDate) : now;
      let exp;
      if (expiredDate) {
        exp = new Date(expiredDate);
      } else {
        exp = new Date(start.getTime() + (Number(durationDays) || 30) * 86400000);
      }

      // Deteksi otomatis email dari accountDetails jika customerEmail belum diisi
      let finalEmail = (customerEmail || '').trim();
      if (!finalEmail && accountDetails) {
        const emailMatch = accountDetails.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) {
          finalEmail = emailMatch[0].trim();
        }
      }

      const newNote = {
        id: `note_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        orderId: `DST-NOTE-${Date.now().toString().slice(-6)}`,
        customerName: customerName.trim(),
        customerEmail: finalEmail,
        contactType: contactType === 'telegram' ? 'telegram' : 'whatsapp',
        contact: contact.trim(),
        productId: productId || '',
        productName: productName.trim() || 'Aplikasi Premium',
        variantName: variantName.trim() || '',
        accountDetails: accountDetails.trim(),
        supplier: supplier.trim(),
        price: Number(price) || 0,
        durationDays: Number(durationDays) || 30,
        startDate: start.toISOString(),
        expiredAt: exp.toISOString(),
        warrantyCount: Math.max(0, Number(warrantyCount) || 0),
        warrantyMax: Number(warrantyMax) || 1,
        notes: notes.trim(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };

      db.customerNotes.unshift(newNote);
      saveDb(db);

      // Sinkronisasi otomatis ke data/users.json agar langsung muncul di pesanan akun target
      try {
        syncCustomerNoteToUserOrder(newNote, 'upsert');
      } catch (syncErr) {
        console.warn('[Sync Customer Note Error]', syncErr.message);
      }

      // Backup otomatis ke Google Spreadsheet Cloud
      await Promise.allSettled([
        pushNotesToGoogleSheet(db.customerNotes),
        pushUsersToGoogleSheet()
      ]);

      return NextResponse.json({ status: 'ok', note: newNote, customerNotes: db.customerNotes });
    }

    if (action === 'update_customer_note') {
      const { id, ...fields } = body;
      if (!Array.isArray(db.customerNotes)) db.customerNotes = [];
      const note = db.customerNotes.find(n => n.id === id);
      if (!note) return NextResponse.json({ status: 'error', message: 'Catatan tidak ditemukan' }, { status: 404 });

      if (fields.customerName !== undefined) note.customerName = fields.customerName.trim();
      if (fields.customerEmail !== undefined) note.customerEmail = fields.customerEmail.trim();
      if (fields.contactType !== undefined) note.contactType = fields.contactType;
      if (fields.contact !== undefined) note.contact = fields.contact.trim();
      if (fields.productName !== undefined) note.productName = fields.productName.trim();
      if (fields.variantName !== undefined) note.variantName = fields.variantName.trim();
      if (fields.accountDetails !== undefined) {
        note.accountDetails = fields.accountDetails.trim();
        // Jika customerEmail belum ada, coba deteksi dari accountDetails
        if (!note.customerEmail) {
          const emailMatch = note.accountDetails.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
          if (emailMatch) {
            note.customerEmail = emailMatch[0].trim();
          }
        }
      }
      if (fields.supplier !== undefined) note.supplier = fields.supplier.trim();
      if (fields.price !== undefined) note.price = Number(fields.price) || 0;
      if (fields.notes !== undefined) note.notes = fields.notes.trim();
      if (fields.warrantyCount !== undefined) note.warrantyCount = Math.max(0, Number(fields.warrantyCount) || 0);
      if (fields.warrantyMax !== undefined) note.warrantyMax = Number(fields.warrantyMax) || 1;
      if (fields.expiredAt !== undefined) note.expiredAt = new Date(fields.expiredAt).toISOString();
      if (fields.durationDays !== undefined) note.durationDays = Number(fields.durationDays) || 30;
      note.updatedAt = new Date().toISOString();

      saveDb(db);

      // Sinkronisasi pembaruan ke akun target
      try {
        syncCustomerNoteToUserOrder(note, 'upsert');
      } catch (syncErr) {
        console.warn('[Sync Customer Note Error]', syncErr.message);
      }

      // Backup otomatis ke Google Spreadsheet Cloud
      await Promise.allSettled([
        pushNotesToGoogleSheet(db.customerNotes),
        pushUsersToGoogleSheet()
      ]);

      return NextResponse.json({ status: 'ok', note, customerNotes: db.customerNotes });
    }

    if (action === 'update_warranty_count') {
      const { id, delta = 0, count } = body;
      if (!Array.isArray(db.customerNotes)) db.customerNotes = [];
      const note = db.customerNotes.find(n => n.id === id);
      if (!note) return NextResponse.json({ status: 'error', message: 'Catatan tidak ditemukan' }, { status: 404 });

      if (count !== undefined) {
        note.warrantyCount = Math.max(0, Number(count) || 0);
      } else {
        note.warrantyCount = Math.max(0, (Number(note.warrantyCount) || 0) + Number(delta));
      }
      note.updatedAt = new Date().toISOString();
      saveDb(db);
      try {
        syncCustomerNoteToUserOrder(note, 'upsert');
      } catch (syncErr) {
        console.warn('[Sync Customer Note Error]', syncErr.message);
      }
      pushNotesToGoogleSheet(db.customerNotes).catch(() => {});
      return NextResponse.json({ status: 'ok', note, customerNotes: db.customerNotes });
    }

    if (action === 'delete_customer_note') {
      const { id } = body;
      if (!Array.isArray(db.customerNotes)) db.customerNotes = [];
      if (!Array.isArray(db.deletedNoteIds)) db.deletedNoteIds = [];
      const targetNote = db.customerNotes.find(n => n.id === id);

      if (id && !db.deletedNoteIds.includes(id)) {
        db.deletedNoteIds.push(id);
      }
      if (targetNote?.orderId && !db.deletedNoteIds.includes(targetNote.orderId)) {
        db.deletedNoteIds.push(targetNote.orderId);
      }

      db.customerNotes = db.customerNotes.filter(n => n.id !== id);
      saveDb(db);

      try {
        syncCustomerNoteToUserOrder(targetNote || { id }, 'delete');
      } catch (syncErr) {
        console.warn('[Sync Customer Note Delete Error]', syncErr.message);
      }

      await Promise.allSettled([
        pushNotesToGoogleSheet(db.customerNotes),
        pushUsersToGoogleSheet()
      ]);

      return NextResponse.json({ 
        status: 'ok', 
        customerNotes: db.customerNotes,
        deletedNoteIds: db.deletedNoteIds 
      });
    }

    if (action === 'delete_user') {
      const { email } = body;
      const cleanEmail = (email || '').toLowerCase().trim();
      if (!cleanEmail) {
        return NextResponse.json({ status: 'error', message: 'Email pengguna diperlukan' }, { status: 400 });
      }
      if (cleanEmail === 'ivankafipradana@gmail.com') {
        return NextResponse.json({ status: 'error', message: 'Akun Owner tidak dapat dihapus' }, { status: 403 });
      }

      const success = deleteUserByEmail(cleanEmail);
      const remainingUsers = getAllUsers(true);
      await pushUsersToGoogleSheet(remainingUsers).catch(() => {});
      return NextResponse.json({
        status: 'ok',
        success,
        registeredUsers: remainingUsers.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          tier: u.tier,
          phone: u.phone || ''
        })),
        customerNotes: db.customerNotes || []
      });
    }

    if (action === 'clear_expired_notes') {
      if (!Array.isArray(db.customerNotes)) db.customerNotes = [];
      const now = new Date();
      const expiredNotes = db.customerNotes.filter(n => new Date(n.expiredAt) <= now);
      db.customerNotes = db.customerNotes.filter(n => new Date(n.expiredAt) > now);
      saveDb(db);

      for (const en of expiredNotes) {
        try {
          syncCustomerNoteToUserOrder(en, 'delete');
        } catch (syncErr) {
          console.warn('[Sync Customer Note Delete Error]', syncErr.message);
        }
      }

      await Promise.allSettled([
        pushNotesToGoogleSheet(db.customerNotes),
        pushUsersToGoogleSheet()
      ]);

      return NextResponse.json({ status: 'ok', customerNotes: db.customerNotes });
    }

    if (action === 'sync_cloud_notes') {
      const { direction = 'both' } = body;
      let pushRes = null;
      let pullRes = null;
      if (direction === 'push' || direction === 'both') {
        pushRes = await pushNotesToGoogleSheet(db.customerNotes);
        await pushUsersToGoogleSheet();
      }
      if (direction === 'pull' || direction === 'both') {
        pullRes = await pullNotesFromGoogleSheet();
        await pullUsersFromGoogleSheet();
      }
      const updatedDb = getDb(true);
      return NextResponse.json({
        status: 'ok',
        customerNotes: updatedDb.customerNotes || [],
        push: pushRes,
        pull: pullRes
      });
    }

    return NextResponse.json({ status: 'error', message: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
