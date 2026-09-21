import { NextResponse } from 'next/server';
import { 
  getDb, 
  saveDb, 
  pushToGoogleSheet, 
  pullFromGoogleSheet,
  findMatchingProductOrVariant,
  getOwnerProfile,
  updateOwnerProfile
} from '@/lib/db';
import { parseSupplierTextWithAI, importParsedProducts } from '@/lib/scraper';

export async function POST(request) {
  try {
    const { message, history = [] } = await request.json();
    if (!message) {
      return NextResponse.json({ reply: 'Pesan tidak boleh kosong ya Bos.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: 'API Key Gemini belum diatur di sistem.' });
    }

    const db = getDb();
    const products = db.products || [];
    const variants = db.variants || [];
    const readyCount = variants.filter(v => v.isAvailable).length;

    const owner = getOwnerProfile();
    const ownerName = owner.name || 'Ivan';
    const ownerCallSign = owner.callSign || (ownerName ? `Bos ${ownerName}` : 'Bos');

    // Susun matriks supplier untuk konteks AI
    const supplierMatrixLines = [];
    for (const p of products.slice(0, 50)) {
      const pVars = variants.filter(v => v.productId === p.id);
      for (const v of pVars) {
        const offers = Array.isArray(v.supplierOffers) && v.supplierOffers.length > 0
          ? v.supplierOffers
          : [{ supplier: v.supplier || 'heavenprem', costPrice: v.costPrice || 0, isAvailable: v.isAvailable !== false }];
        const offerStr = offers.map(o => `${o.supplier}: Rp${(o.costPrice || 0).toLocaleString('id-ID')} (${o.isAvailable ? 'Ready' : 'Kosong'})`).join(', ');
        supplierMatrixLines.push(`• ${p.name} (${v.name}) -> Aktif: ${v.supplier || '-'} (Modal Rp${(v.costPrice || 0).toLocaleString('id-ID')}, Jual Rp${(v.price || 0).toLocaleString('id-ID')}) | Opsi Supplier: [${offerStr}]`);
      }
    }

    const systemInstruction = `Kamu adalah asisten cerdas resmi untuk Web Dashboard D Store.
Kamu sedang berbicara langsung dengan pemilik toko: ${ownerCallSign} (Nama: ${ownerName}).

STATUS TOKO & PROFIL:
- Pemilik Toko: ${ownerCallSign} (Nama: ${ownerName})
- Total Produk: ${products.length} Produk
- Total Varian: ${variants.length} Varian (${readyCount} Sedang Ready)

MATRIKS KULAKAN SUPPLIER & MULTI-TOKO:
${supplierMatrixLines.join('\n')}

ATURAN PERILAKU:
1. PANGGILAN PEMILIK:
   - Selalu panggil dengan "${ownerCallSign}".
   - Kamu SUDAH TAHU namanya adalah "${ownerName}". Jika ditanya "namaku siapa", jawab langsung dengan ramah bahwa namanya adalah ${ownerName} (${ownerCallSign}).
   - Jika pemilik ingin mengubah nama panggilan, simpan dengan tag: [ACTION: set_profile, name=NamaBaru, callSign=PanggilanBaru].

2. Jawab SINGKAT, PADAT, LANGSUNG KE INTI (to the point), tanpa basa-basi bertele-tele dan jangan gunakan tanda kurung panjang (...).

3. FITUR PENASIHAT KULAKAN:
   - Jika Bos tanya toko mana paling murah: sebutkan toko termurah, status stoknya, modal vs harga jual Bos, serta estimasi untung bersih.
   - Jika toko termurah KOSONG: beritahu toko itu kosong dan langsung sarankan opsi toko termurah BERIKUTNYA YANG READY.

4. EKSEKUSI DATA (PENTING & WAJIB):
   Jika Bos meminta ubah supplier/toko, harga, stok, atau komplain "nggk berubah" / belum berubah, kamu WAJIB menyertakan tag aksi di paling akhir responmu:
   - Tambah/impor pricelist produk mentah (misal: Bos kirim teks pricelist WhatsApp / reseller):
     [ACTION: import_pricelist, supplier=NamaSupplier]
   - Ganti supplier aktif / ubah toko (misal: "ubah canva dari toko a ke toko b", "nama toko a ganti toko b", "ganti supplier canva ke toko b"):
     [ACTION: set_supplier, query=canva, from=Toko A, supplier=Toko B]
   - Ubah harga:
     [ACTION: set_price, query=nama_produk, sellingPrice=28000, costPrice=20000]
   - Ubah stok:
     [ACTION: set_stock, query=nama_produk, status=false] (false=kosong, true=ready)
   - Catat/tambah penawaran supplier:
     [ACTION: set_supplier_offer, query=nama_produk, supplier=NamaToko, costPrice=1200, isAvailable=true]
   - Tarik dari Google Spreadsheet:
     [ACTION: pull_sheet]
   - Kirim ke Google Spreadsheet:
     [ACTION: sync_sheet]

5. GAYA PENULISAN:
   - Tulis dengan gaya bahasa simpel, profesional, to-the-point, dan ramah.
   - JANGAN PERNAH gunakan emoji apa pun dalam respon (bebas emoji).`;

    const contents = [
      { role: 'user', parts: [{ text: systemInstruction }] },
      { role: 'model', parts: [{ text: `Siap ${ownerCallSign}! Ada yang bisa saya bantu terkait cek stok, rekomendasi supplier termurah, atau update harga?` }] }
    ];

    (history || []).slice(-8).forEach(h => {
      contents.push({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      });
    });

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const candidateModels = ['gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let replyText = '';

    for (const model of candidateModels) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
          })
        });
        if (!res.ok) continue;
        const data = await res.json();
        replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (replyText) break;
      } catch {
        continue;
      }
    }

    if (!replyText) {
      replyText = `Koneksi ke AI sedang sibuk ${ownerCallSign}, silakan coba beberapa saat lagi ya.`;
    }

    console.log('[DEBUG RAW REPLY FROM GEMINI]:', replyText);

    // Eksekusi semua tag aksi yang ditemukan di replyText
    const actionRegex = /\[ACTION:\s*([a-zA-Z_]+)(?:,\s*([^\]]+))?\]/gi;
    let match;
    const actions = [];
    while ((match = actionRegex.exec(replyText)) !== null) {
      actions.push({
        raw: match[0],
        type: match[1].toLowerCase(),
        paramsRaw: match[2] || ''
      });
    }

    console.log('[DEBUG ACTIONS FOUND]:', actions);

    // Bersihkan tag [ACTION: ...] dari respon chat yang ditampilkan ke pengguna
    replyText = replyText.replace(actionRegex, '').trim();

    // Fallback: jika Gemini tidak menyertakan tag aksi tapi pesannya berisi pricelist atau perintah ubah supplier
    if (actions.length === 0) {
      const msgLower = message.toLowerCase();

      // Deteksi teks pricelist mentah
      if (/(?:bulan|hari|tahun)\s*=\s*rp|\*FAMPLAN\*|\*CANVA|\*YOUTUBE|\*INDPLAN|1m\s*=|1b\s*=/i.test(message)) {
        const suppMatch = message.match(/(?:dari|supplier|toko)\s+([a-zA-Z0-9_\s]+)/i);
        const suppName = suppMatch ? suppMatch[1].replace(/dari\s+wa/i, '').trim() : 'Supplier Baru';
        actions.push({
          raw: 'auto_detected_import_pricelist',
          type: 'import_pricelist',
          paramsRaw: `supplier=${suppName}`
        });
      } else {
        const changeMatch = msgLower.match(/(?:ubah|ganti|pindah)\s+([a-z0-9\s]+?)\s+(?:dari\s+([a-z0-9\s]+?)\s+)?(?:ke|menjadi|jadi)\s+([a-z0-9\s]+)/i) ||
                            msgLower.match(/nama\s+([a-z0-9\s]+?)\s+ganti\s+([a-z0-9\s]+)/i);
        if (changeMatch) {
          if (changeMatch[3]) {
            actions.push({
              raw: 'auto_detected_set_supplier',
              type: 'set_supplier',
              paramsRaw: `query=${changeMatch[1].trim()}, from=${(changeMatch[2] || '').trim()}, supplier=${changeMatch[3].trim()}`
            });
          } else if (changeMatch[2]) {
            actions.push({
              raw: 'auto_detected_set_supplier',
              type: 'set_supplier',
              paramsRaw: `query=canva, from=${changeMatch[1].trim()}, supplier=${changeMatch[2].trim()}`
            });
          }
        }
      }
    }

    let dbUpdated = false;

    for (const action of actions) {
      const { type: actionType, paramsRaw } = action;
      const params = {};
      if (paramsRaw) {
        paramsRaw.split(',').forEach(pair => {
          const idx = pair.indexOf('=');
          if (idx !== -1) {
            const k = pair.substring(0, idx).trim();
            const v = pair.substring(idx + 1).trim();
            if (k) params[k] = v;
          }
        });
      }

      try {
        if (actionType === 'set_profile') {
          updateOwnerProfile({
            name: params.name || ownerName,
            callSign: params.callSign || (params.name ? `Bos ${params.name}` : ownerCallSign)
          });
        } else if (actionType === 'import_pricelist') {
          const supp = params.supplier || 'Supplier Baru';
          try {
            const parsedItems = await parseSupplierTextWithAI(message, supp);
            if (parsedItems && parsedItems.length > 0) {
              const res = await importParsedProducts(parsedItems);
              dbUpdated = true;
              replyText += `\n\n✅ Berhasil memasukkan ${parsedItems.length} varian produk dari "${supp}" ke dalam katalog dan spreadsheet!`;
            }
          } catch (pErr) {
            console.warn('[Chat import pricelist error]', pErr.message);
            replyText += `\n\n(Catatan: Gagal memproses teks pricelist: ${pErr.message})`;
          }
        } else if (actionType === 'pull_sheet') {
          await pullFromGoogleSheet();
        } else if (actionType === 'sync_sheet') {
          await pushToGoogleSheet();
        } else if (actionType === 'set_supplier') {
          const q = params.query || params.product || '';
          const newSupp = params.supplier || params.to || params.newSupplier;
          const fromSupp = params.from || params.oldSupplier || '';

          const matchResult = findMatchingProductOrVariant(q, db);
          const matchedVars = matchResult 
            ? (matchResult.allVariants && matchResult.allVariants.length > 0 ? matchResult.allVariants : [matchResult.variant].filter(Boolean))
            : db.variants.filter(v => v.name.toLowerCase().includes(q.toLowerCase()) || (v.supplier && v.supplier.toLowerCase().includes(q.toLowerCase())));

          const targetIds = matchedVars.map(v => v.id);
          const targetVars = db.variants.filter(v => targetIds.includes(v.id));

          console.log('[DEBUG SET_SUPPLIER TARGETS]:', targetVars.map(v => `${v.name} (${v.supplier})`));

          if (targetVars.length > 0 && newSupp) {
            targetVars.forEach(v => {
              if (fromSupp && v.supplier && v.supplier.toLowerCase() !== fromSupp.toLowerCase()) {
                return;
              }
              v.supplier = newSupp;
              v.isSupplierLocked = true;

              if (!Array.isArray(v.supplierOffers)) v.supplierOffers = [];
              const offer = v.supplierOffers.find(o => o.supplier.toLowerCase() === newSupp.toLowerCase());
              if (offer) {
                v.costPrice = offer.costPrice;
                v.isAvailable = offer.isAvailable !== false;
              } else {
                v.supplierOffers.push({
                  supplier: newSupp,
                  costPrice: v.costPrice || 0,
                  isAvailable: true,
                  updatedAt: new Date().toISOString()
                });
              }
            });
            dbUpdated = true;
          }
        } else if (actionType === 'set_price') {
          const q = params.query || '';
          const matchResult = findMatchingProductOrVariant(q, db);
          const matchedVars = matchResult 
            ? (matchResult.variant ? [matchResult.variant] : matchResult.allVariants)
            : db.variants.filter(v => v.name.toLowerCase().includes(q.toLowerCase()));
          const targetIds = matchedVars.map(v => v.id);
          const targetVars = db.variants.filter(v => targetIds.includes(v.id));

          targetVars.forEach(v => {
            if (params.sellingPrice) v.price = Number(params.sellingPrice);
            if (params.costPrice) v.costPrice = Number(params.costPrice);
          });
          dbUpdated = true;
        } else if (actionType === 'set_stock') {
          const q = params.query || '';
          const matchResult = findMatchingProductOrVariant(q, db);
          const matchedVars = matchResult 
            ? (matchResult.variant ? [matchResult.variant] : matchResult.allVariants)
            : db.variants.filter(v => v.name.toLowerCase().includes(q.toLowerCase()));
          const targetIds = matchedVars.map(v => v.id);
          const targetVars = db.variants.filter(v => targetIds.includes(v.id));

          const isReady = params.status === 'true' || params.status === 'ready' || params.status === '1';
          targetVars.forEach(v => {
            v.isAvailable = isReady;
          });
          dbUpdated = true;
        } else if (actionType === 'set_supplier_offer') {
          const q = params.query || '';
          const matchResult = findMatchingProductOrVariant(q, db);
          const matchedVars = matchResult 
            ? (matchResult.variant ? [matchResult.variant] : matchResult.allVariants)
            : db.variants.filter(v => v.name.toLowerCase().includes(q.toLowerCase()));
          const targetIds = matchedVars.map(v => v.id);
          const targetVars = db.variants.filter(v => targetIds.includes(v.id));

          const supp = params.supplier || 'Toko Baru';
          const cost = Number(params.costPrice) || 0;
          const isReady = params.isAvailable !== 'false';

          targetVars.forEach(v => {
            if (!Array.isArray(v.supplierOffers)) v.supplierOffers = [];
            const exist = v.supplierOffers.find(o => o.supplier.toLowerCase() === supp.toLowerCase());
            if (exist) {
              exist.costPrice = cost;
              exist.isAvailable = isReady;
              exist.updatedAt = new Date().toISOString();
            } else {
              v.supplierOffers.push({
                supplier: supp,
                costPrice: cost,
                isAvailable: isReady,
                updatedAt: new Date().toISOString()
              });
            }
            v.supplierOffers.sort((a, b) => a.costPrice - b.costPrice);
          });
          dbUpdated = true;
        }
      } catch (err) {
        console.warn(`Gagal eksekusi aksi ${actionType}:`, err.message);
      }
    }

    if (dbUpdated) {
      console.log('[DEBUG SAVING DB TO DISK]');
      saveDb(db);
      pushToGoogleSheet().catch(err => console.warn('Push error:', err.message));
    }

    return NextResponse.json({ reply: replyText });
  } catch (err) {
    return NextResponse.json({ reply: `Terjadi kendala: ${err.message}` }, { status: 500 });
  }
}
