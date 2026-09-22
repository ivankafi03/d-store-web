import fs from 'fs';
import path from 'path';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { getDb, saveDb, pushToGoogleSheet, standardizeDuration } from './db.js';

const sessionFilePath = path.join(process.cwd(), 'session.txt');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function categorizeProduct(name) {
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

function calculateMargin(productName, costPrice) {
  const isPopular = /netflix|spotify|canva|capcut|chatgpt|youtube|disney/i.test(productName);
  if (isPopular) {
    if (costPrice < 5000) return 2000;
    if (costPrice < 20000) return 3000;
    return 5000;
  }
  if (costPrice < 10000) return 1500;
  if (costPrice < 50000) return 3000;
  return 5000;
}

function parseProductMessage(text) {
  if (!text) return null;
  const prodMatch = text.match(/Produk\s*:\s*([^\n\r]+)/i);
  if (!prodMatch) return null;
  const productName = prodMatch[1].trim();

  const variants = [];
  const lines = text.split('\n').map((l) => l.trim());

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const hargaMatch = line.match(/Harga\s*:\s*Rp\.?\s*([\d.,]+)\s*-\s*Stok\s*:\s*(\d+)/i);
    if (hargaMatch) {
      let variantName = '';
      for (let j = i - 1; j >= 0; j--) {
        const prev = lines[j].replace(/^┊\s*/, '').replace(/^[╭╰]\s*-+/, '').trim();
        if (
          prev &&
          !prev.includes('Desk :') &&
          !prev.includes('Produk :') &&
          !prev.includes('Terjual :') &&
          !prev.includes('note :') &&
          !prev.includes('arti singkatan')
        ) {
          variantName = prev;
          break;
        }
      }

      const costPrice = parseInt(hargaMatch[1].replace(/[.,]/g, ''), 10) || 0;
      const stock = parseInt(hargaMatch[2], 10) || 0;

      if (variantName && costPrice > 0) {
        variants.push({
          name: standardizeDuration(variantName),
          costPrice,
          stock,
          isAvailable: stock > 0,
        });
      }
    }
  }

  return {
    productName,
    variants,
  };
}

function parseZiemProductDetail(text) {
  if (!text) return null;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let variantName = '';
  let categoryName = '';
  let costPrice = 0;
  let stock = 0;
  let description = '';

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes('DETAIL PEMBELIAN PRODUK')) {
      if (lines[i + 1] && !lines[i + 1].startsWith('▪ Kategori')) {
        variantName = lines[i + 1].replace(/^[▪\s*•\-]+/, '').trim();
      }
    }
    const catMatch = l.match(/Kategori\s*:\s*[▪\s*•\-]*([^\n\r]+)/i);
    if (catMatch) {
      categoryName = catMatch[1].trim();
    }
    const priceMatch = l.match(/Harga Satuan\s*:\s*Rp\.?\s*([\d.,]+)/i);
    if (priceMatch) {
      costPrice = parseInt(priceMatch[1].replace(/[.,]/g, ''), 10) || 0;
    }
    const stockMatch = l.match(/Stok Tersedia\s*:\s*(\d+)/i);
    if (stockMatch) {
      stock = parseInt(stockMatch[1], 10) || 0;
    }
    if (l.includes('Deskripsi:')) {
      const descLines = [];
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].includes('Garansi dan pengiriman') || lines[j].startsWith('▪ Metode')) break;
        descLines.push(lines[j]);
      }
      description = descLines.join(' ').trim();
    }
  }

  if (!variantName && !categoryName) return null;

  return {
    variantName: variantName || categoryName,
    categoryName: categoryName || variantName,
    costPrice,
    stock,
    isAvailable: stock > 0,
    description
  };
}

function processScrapedItem({ productName, variantName, costPrice, stock, isAvailable, description, supplierName, context, index, idPrefix = 'item' }) {
  const {
    db,
    categoriesMap,
    existingProductsMap,
    existingVariantsMap,
    newProductsList,
    newVariantsList,
    outOfStockList,
    priceChangesList,
    scrapedProducts,
    scrapedVariants
  } = context;

  const catInfo = categorizeProduct(productName);
  if (!categoriesMap.has(catInfo.id)) {
    categoriesMap.set(catInfo.id, catInfo);
  }

  const pNorm = productName.trim().toLowerCase();
  const existingProd = Array.from(existingProductsMap.values()).find(p => {
    const epNorm = p.name.trim().toLowerCase();
    return epNorm === pNorm || epNorm.startsWith(pNorm) || pNorm.startsWith(epNorm);
  }) || scrapedProducts.find(p => {
    const spNorm = p.name.trim().toLowerCase();
    return spNorm === pNorm || spNorm.startsWith(pNorm) || pNorm.startsWith(spNorm);
  });

  const prodId = existingProd ? existingProd.id : `prod_${idPrefix}_${index}`;
  const prodObj = {
    id: prodId,
    categoryId: catInfo.id,
    name: existingProd ? existingProd.name : productName,
    description: description || `Akun Premium Resmi & Bergaransi D Store`,
    isActive: true
  };

  if (!scrapedProducts.some(p => p.id === prodId)) {
    scrapedProducts.push(prodObj);
    if (!existingProd) {
      newProductsList.push({
        id: prodId,
        name: productName,
        category: catInfo.name
      });
    }
  }

  const cleanVariantName = standardizeDuration(variantName);
  const vNorm = cleanVariantName.trim().toLowerCase();
  const existingVar = Array.from(existingVariantsMap.values()).find(v => {
    if (v.productId !== prodId) return false;
    const evNorm = standardizeDuration(v.name).trim().toLowerCase();
    return evNorm === vNorm || evNorm.includes(vNorm) || vNorm.includes(evNorm);
  }) || scrapedVariants.find(v => {
    if (v.productId !== prodId) return false;
    const svNorm = standardizeDuration(v.name).trim().toLowerCase();
    return svNorm === vNorm || svNorm.includes(vNorm) || vNorm.includes(svNorm);
  });

  const varId = existingVar ? existingVar.id : `var_${idPrefix}_${index}`;

  if (!existingVar) {
    newVariantsList.push({
      id: varId,
      productName,
      variantName: cleanVariantName,
      costPrice,
      price: costPrice + calculateMargin(productName, costPrice),
      isAvailable,
      stock
    });
  }

  if (!isAvailable || stock === 0) {
    outOfStockList.push({
      id: varId,
      productName,
      variantName,
      costPrice,
      price: existingVar?.price || (costPrice + calculateMargin(productName, costPrice)),
      stock: stock || 0
    });
  }

  if (existingVar && Number(existingVar.costPrice) !== Number(costPrice)) {
    priceChangesList.push({
      id: varId,
      productName,
      variantName,
      oldCost: Number(existingVar.costPrice),
      newCost: Number(costPrice),
      diff: Number(costPrice) - Number(existingVar.costPrice)
    });
  }

  let sellingPrice = existingVar && existingVar.price ? existingVar.price : (costPrice + calculateMargin(productName, costPrice));
  if (sellingPrice <= costPrice) {
    sellingPrice = costPrice + calculateMargin(productName, costPrice);
  }

  let supplierOffers = existingVar && Array.isArray(existingVar.supplierOffers) ? [...existingVar.supplierOffers] : [];
  const sIdx = supplierOffers.findIndex(o => o.supplier.toLowerCase() === supplierName.toLowerCase());
  if (sIdx >= 0) {
    supplierOffers[sIdx].costPrice = costPrice;
    supplierOffers[sIdx].isAvailable = isAvailable;
    supplierOffers[sIdx].updatedAt = new Date().toISOString();
  } else {
    supplierOffers.push({
      supplier: supplierName,
      costPrice,
      isAvailable,
      updatedAt: new Date().toISOString()
    });
  }
  supplierOffers.sort((a, b) => a.costPrice - b.costPrice);

  const existingInScraped = scrapedVariants.find(v => v.id === varId);
  if (existingInScraped) {
    existingInScraped.supplierOffers = supplierOffers;
    if (!existingInScraped.isSupplierLocked && costPrice < existingInScraped.costPrice) {
      existingInScraped.costPrice = costPrice;
      existingInScraped.supplier = supplierName;
    }
  } else {
    scrapedVariants.push({
      id: varId,
      productId: prodId,
      name: existingVar ? existingVar.name : variantName,
      price: sellingPrice,
      costPrice: costPrice,
      supplier: existingVar?.supplier || supplierName,
      isSupplierLocked: false,
      isAvailable,
      supplierOffers
    });
  }
}

function processZiemItem(args) {
  return processScrapedItem({ ...args, idPrefix: 'ziem' });
}

/**
 * bagahstorebot parser: satu pesan katalog berisi beberapa produk sekaligus
 * Format: [N] NAMA_PRODUK, Harga: Rp X, Stok Tersedia: Y
 */
function parseBagahCatalogMessage(text) {
  if (!text) return [];
  const products = [];
  // Split by separator line
  const blocks = text.split(/━+/);
  for (const block of blocks) {
    const nameMatch = block.match(/\[\s*\d+\s*\]\s*([^\n\r]+)/);
    const priceMatch = block.match(/Harga\s*:\s*Rp\s*([\d.,]+)/i);
    const stockMatch = block.match(/Stok Tersedia\s*:\s*([^\n\r]+)/i);
    if (!nameMatch || !priceMatch) continue;
    const name = nameMatch[1].trim();
    const costPrice = parseInt(priceMatch[1].replace(/[.,]/g, ''), 10) || 0;
    const stockRaw = stockMatch ? stockMatch[1].trim().toLowerCase() : '';
    const isAvailable = !stockRaw.includes('habis') && !stockRaw.includes('kosong') && stockRaw !== '0';
    const stock = isAvailable ? (parseInt(stockRaw.match(/\d+/)?.[0] || '10', 10) || 10) : 0;
    if (name && costPrice > 0) {
      products.push({ name, costPrice, stock, isAvailable });
    }
  }
  return products;
}

async function scrapeBagahSupplier(client, cleanTargetBot, options, context) {
  const { limit = 50 } = options;
  const { addLog } = context;

  const entity = await client.getEntity(cleanTargetBot);
  addLog(`Mengirim /start ke @${cleanTargetBot}...`);
  await client.sendMessage(entity, { message: '/start' });
  await sleep(2000);

  let msgs = await client.getMessages(entity, { limit: 2 });
  let startMsg = msgs.find(m => !m.out && m.replyMarkup);
  if (!startMsg) throw new Error(`Bot @${cleanTargetBot} tidak merespon /start`);

  // Klik ORDER
  addLog(`Membuka menu ORDER di @${cleanTargetBot}...`);
  await startMsg.click({ data: Buffer.from('action:order_menu') });
  await sleep(1800);

  msgs = await client.getMessages(entity, { limit: 2 });
  let orderMsg = msgs.find(m => !m.out && m.replyMarkup);
  if (!orderMsg) throw new Error(`Menu ORDER tidak ditemukan di @${cleanTargetBot}`);

  // Klik Produk Digital
  await orderMsg.click({ data: Buffer.from('action:digital_products') });
  await sleep(2000);

  let count = 0;
  let currentPage = 1;

  while (count < limit) {
    msgs = await client.getMessages(entity, { limit: 2 });
    const listMsg = msgs.find(m => !m.out && m.replyMarkup);
    if (!listMsg) break;

    // Parse semua produk dari teks katalog di halaman ini
    const products = parseBagahCatalogMessage(listMsg.message || '');
    addLog(`Halaman ${currentPage}: ${products.length} produk ditemukan di @${cleanTargetBot}`);

    for (const prod of products) {
      if (count >= limit) break;
      count++;
      processScrapedItem({
        productName: prod.name,
        variantName: prod.name,
        costPrice: prod.costPrice,
        stock: prod.stock,
        isAvailable: prod.isAvailable,
        description: '',
        supplierName: cleanTargetBot,
        context,
        index: count,
        idPrefix: 'bagah'
      });
      const statusTag = prod.isAvailable ? `Ready: ${prod.stock}` : `KOSONG`;
      addLog(`[#${count}] ${prod.name} (Rp ${prod.costPrice.toLocaleString('id-ID')}) [${statusTag}]`);
    }

    // Cek tombol Next
    let nextData = null;
    for (const r of listMsg.replyMarkup?.rows || []) {
      for (const b of r.buttons) {
        const d = b.data ? Buffer.from(b.data).toString('utf8') : '';
        if (d.startsWith('action:dp_page_') && (b.text.includes('Next') || b.text.includes('>'))) {
          nextData = d;
        }
      }
    }

    if (!nextData || count >= limit) break;

    addLog(`Membuka halaman berikutnya...`);
    await listMsg.click({ data: Buffer.from(nextData) });
    await sleep(2000);
    currentPage++;
  }

  return count;
}

/**
 * YSAutoOrderBot parser: teks list produk dengan format [N] NAMA
 */
function parseYSProductList(text) {
  if (!text) return [];
  const products = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const m = line.match(/\[(\d+)\]\s+(.+)/);
    if (m) {
      products.push({ num: parseInt(m[1], 10), name: m[2].trim() });
    }
  }
  return products;
}

async function scrapeYSSupplier(client, cleanTargetBot, options, context) {
  const { limit = 50 } = options;
  const { addLog } = context;

  const entity = await client.getEntity(cleanTargetBot);
  addLog(`Mengirim "List Produk" ke @${cleanTargetBot}...`);
  await client.sendMessage(entity, { message: 'List Produk' });
  await sleep(4000);

  const msgs = await client.getMessages(entity, { limit: 3 });
  const listMsg = msgs.find(m => !m.out && m.message && m.message.includes('LIST PRODUK'));
  if (!listMsg) throw new Error(`Bot @${cleanTargetBot} tidak mengembalikan daftar produk.`);

  const products = parseYSProductList(listMsg.message);
  addLog(`Ditemukan ${products.length} produk di @${cleanTargetBot}: ${products.map(p => p.name).join(', ')}`);

  let count = 0;
  for (const prod of products) {
    if (count >= limit) break;
    count++;
    // YSAutoOrderBot tidak expose stok detail via UserBot, pakai data dari list saja
    processScrapedItem({
      productName: prod.name,
      variantName: prod.name,
      costPrice: 0,  // Harga tidak tersedia di list
      stock: 10,     // Asumsikan tersedia
      isAvailable: true,
      description: '',
      supplierName: cleanTargetBot,
      context,
      index: count,
      idPrefix: 'ys'
    });
    addLog(`[#${count}] ${prod.name} [terdaftar - harga manual]`);
    await sleep(200);
  }

  return count;
}

/**
 * prabumailbot - hanya jual Gmail Fresh dengan harga fixed
 */
async function scrapePrabuMailSupplier(client, cleanTargetBot, options, context) {
  const { addLog } = context;
  const entity = await client.getEntity(cleanTargetBot);

  addLog(`Mengambil info produk dari @${cleanTargetBot}...`);
  await client.sendMessage(entity, { message: '/start' });
  await sleep(2500);

  const msgs = await client.getMessages(entity, { limit: 2 });
  const startMsg = msgs.find(m => !m.out && m.message);
  if (!startMsg) throw new Error(`Bot @${cleanTargetBot} tidak merespon /start`);

  // Parse harga dari start message
  const priceMatch = startMsg.message.match(/Harga\s*:\s*Rp\s*([\d.,]+)/i);
  const costPrice = priceMatch ? parseInt(priceMatch[1].replace(/[.,]/g, ''), 10) : 5000;

  processScrapedItem({
    productName: 'Gmail Fresh',
    variantName: 'Gmail Fresh 1 Akun',
    costPrice,
    stock: 100,
    isAvailable: true,
    description: 'Gmail Fresh - Create By Team, Garansi 1x24, Anti HackBack',
    supplierName: cleanTargetBot,
    context,
    index: 1,
    idPrefix: 'prabu'
  });

  addLog(`[#1] Gmail Fresh (Rp ${costPrice.toLocaleString('id-ID')}) [Ready: ~100]`);
  return 1;
}

async function scrapeZiemSupplier(client, cleanTargetBot, options, context) {
  const { limit = 50 } = options;
  const { addLog } = context;

  const entity = await client.getEntity(cleanTargetBot);
  addLog(`Mengirim "List Produk" ke @${cleanTargetBot}...`);
  await client.sendMessage(entity, { message: 'List Produk' });
  await sleep(2500);

  let msgs = await client.getMessages(entity, { limit: 3 });
  let catMsg = msgs.find(m => !m.out && m.replyMarkup);
  if (!catMsg) {
    throw new Error(`Bot @${cleanTargetBot} tidak mengembalikan menu kategori produk.`);
  }

  const catButtons = [];
  for (const row of catMsg.replyMarkup.rows || []) {
    for (const btn of row.buttons || []) {
      const dataStr = btn.data ? Buffer.from(btn.data).toString('utf8') : '';
      if (dataStr.startsWith('cat_open_') && !btn.text.toLowerCase().includes('refresh')) {
        catButtons.push({
          name: btn.text.replace(/^[\p{Extended_Pictographic}\s]+/u, '').trim(),
          dataStr
        });
      }
    }
  }

  addLog(`Ditemukan ${catButtons.length} kategori produk di @${cleanTargetBot}: ${catButtons.map(c => c.name).join(', ')}`);

  let count = 0;
  for (const cat of catButtons) {
    if (count >= limit) break;
    addLog(`Membuka kategori [${cat.name}]...`);

    try {
      await catMsg.click({ data: Buffer.from(cat.dataStr) });
      await sleep(2000);

      msgs = await client.getMessages(entity, { limit: 3 });
      let prodListMsg = msgs.find(m => !m.out && m.replyMarkup);
      if (!prodListMsg) continue;

      const itemButtons = [];
      for (const row of prodListMsg.replyMarkup.rows || []) {
        for (const btn of row.buttons || []) {
          const dataStr = btn.data ? Buffer.from(btn.data).toString('utf8') : '';
          if (dataStr.startsWith('view_prod_')) {
            itemButtons.push({
              name: btn.text.replace(/^\[\d+\]\s*[\p{Extended_Pictographic}\s]*/u, '').trim(),
              dataStr
            });
          }
        }
      }

      for (const item of itemButtons) {
        if (count >= limit) break;
        try {
          await prodListMsg.click({ data: Buffer.from(item.dataStr) });
          await sleep(2000);

          msgs = await client.getMessages(entity, { limit: 3 });
          let detailMsg = msgs.find(m => !m.out);
          if (detailMsg && detailMsg.message) {
            const parsed = parseZiemProductDetail(detailMsg.message);
            if (parsed) {
              count++;
              processZiemItem({
                productName: cat.name,
                variantName: parsed.variantName,
                costPrice: parsed.costPrice,
                stock: parsed.stock,
                isAvailable: parsed.isAvailable,
                description: parsed.description,
                supplierName: cleanTargetBot,
                context,
                index: count
              });

              addLog(`[#${count}] ${cat.name} -> ${parsed.variantName} (Rp ${parsed.costPrice.toLocaleString('id-ID')}) [${parsed.isAvailable ? 'Ready: ' + parsed.stock : 'Kosong'}]`);
            }
          }

          if (detailMsg && detailMsg.replyMarkup) {
            await detailMsg.click({ data: Buffer.from(cat.dataStr) }).catch(() => {});
            await sleep(1500);
          }
        } catch (itemErr) {
          addLog(`Gagal mengambil detail item ${item.name}: ${itemErr.message}`);
          await sleep(1500);
        }
      }

      await client.sendMessage(entity, { message: 'List Produk' }).catch(() => {});
      await sleep(2000);
      msgs = await client.getMessages(entity, { limit: 3 });
      catMsg = msgs.find(m => !m.out && m.replyMarkup) || catMsg;
    } catch (catErr) {
      addLog(`Peringatan kategori ${cat.name}: ${catErr.message}`);
      await sleep(2000);
    }
  }

  return count;
}

function parseBuatPremProductDetail(text) {
  if (!text) return null;
  let variantName = '';
  let categoryName = '';
  let costPrice = 0;
  let stock = 10;
  let isAvailable = true;
  let description = '';

  const nameMatch = text.match(/(?:\p{Extended_Pictographic}\s*)?([^\n\r]+)/iu);
  if (nameMatch) {
    variantName = nameMatch[1].trim();
  }

  const catMatch = text.match(/(?:\p{Extended_Pictographic}\s*)?Kategori\s*[·:]\s*([^\n\r]+)/iu);
  if (catMatch) {
    categoryName = catMatch[1].trim();
  }

  const priceMatch = text.match(/(?:\p{Extended_Pictographic}\s*)?Harga\s*[·:]\s*Rp\.?\s*([\d.,]+)/iu);
  if (priceMatch) {
    costPrice = parseInt(priceMatch[1].replace(/[.,]/g, ''), 10) || 0;
  }

  const stockMatch = text.match(/(?:\p{Extended_Pictographic}\s*)?Stok\s*[·:]\s*([^\n\r]+)/iu);
  if (stockMatch) {
    const stockRaw = stockMatch[1].toLowerCase();
    if (stockRaw.includes('habis') || stockRaw.includes('kosong') || stockRaw === '0') {
      isAvailable = false;
      stock = 0;
    } else {
      isAvailable = true;
      const numMatch = stockRaw.match(/(\d+)/);
      stock = numMatch ? parseInt(numMatch[1], 10) : 10;
    }
  }

  const descMatch = text.match(/(?:\p{Extended_Pictographic}\s*)?Detail\s*\n([\s\S]*?)(?=\n\s*(?:Atur jumlah|Kembali|Beli|$))/iu);
  if (descMatch) {
    description = descMatch[1].trim();
  }

  if (!variantName && !categoryName) return null;

  return {
    variantName: variantName || categoryName,
    categoryName: categoryName || variantName,
    costPrice,
    stock,
    isAvailable,
    description
  };
}

async function scrapeBuatPremSupplier(client, cleanTargetBot, options, context) {
  const { limit = 50 } = options;
  const { addLog } = context;

  const entity = await client.getEntity(cleanTargetBot);
  addLog(`Mengirim /produk ke @${cleanTargetBot}...`);
  await client.sendMessage(entity, { message: '/produk' });
  await sleep(2200);

  let msgs = await client.getMessages(entity, { limit: 3 });
  let firstMsg = msgs.find(m => !m.out && m.replyMarkup && m.message);
  if (!firstMsg) {
    throw new Error(`Bot @${cleanTargetBot} tidak merespon perintah /produk.`);
  }

  let msgId = firstMsg.id;

  // Cek jika bot meminta pilih bahasa terlebih dahulu
  if (firstMsg.message && firstMsg.message.toLowerCase().includes('bahasa')) {
    addLog(`Memilih bahasa Indonesia...`);
    try {
      await firstMsg.click(0, 0);
      await sleep(1800);
      await client.sendMessage(entity, { message: '/produk' });
      await sleep(2200);
      const afterLangMsgs = await client.getMessages(entity, { limit: 2 });
      const newCatMsg = afterLangMsgs.find(m => !m.out && m.replyMarkup);
      if (newCatMsg) {
        msgId = newCatMsg.id;
      }
    } catch (e) {
      addLog(`Peringatan pemilihan bahasa: ${e.message}`);
    }
  }

  let [catMsg] = await client.getMessages(entity, { ids: [msgId] });
  if (!catMsg || !catMsg.replyMarkup) {
    throw new Error(`Katalog kategori dari @${cleanTargetBot} tidak ditemukan.`);
  }

  // Parse kategori dari teks nomor (1. PROMO APIKEY ...)
  const catMap = new Map();
  const catLines = (catMsg.message || '').split('\n').map(l => l.trim());
  for (const line of catLines) {
    const m = line.match(/^(\d+)\.\s*(.+)$/);
    if (m) {
      catMap.set(m[1], m[2].trim());
    }
  }

  const catButtons = [];
  for (const row of catMsg.replyMarkup?.rows || []) {
    for (const btn of row.buttons || []) {
      const dataStr = btn.data ? Buffer.from(btn.data).toString('utf8') : '';
      if (dataStr.startsWith('cat:')) {
        const catName = catMap.get(btn.text) || btn.text;
        catButtons.push({
          num: btn.text,
          name: catName,
          dataStr
        });
      }
    }
  }

  addLog(`Ditemukan ${catButtons.length} kategori di @${cleanTargetBot}: ${catButtons.map(c => c.name.split(/[\(,]/)[0].trim()).join(', ')}`);

  let count = 0;

  for (const cat of catButtons) {
    if (count >= limit) break;
    const cleanCatName = cat.name.split(/[\(,]/)[0].trim() || cat.name;
    addLog(`Membuka kategori [${cleanCatName}]...`);

    try {
      // Pastikan posisi berada di menu kategori sebelum klik
      let [currentMsg] = await client.getMessages(entity, { ids: [msgId] });
      if (!currentMsg || !currentMsg.message?.includes('Katalog Kategori')) {
        await client.sendMessage(entity, { message: '/produk' });
        await sleep(2000);
        const freshMsgs = await client.getMessages(entity, { limit: 2 });
        const fresh = freshMsgs.find(m => !m.out && m.replyMarkup);
        if (fresh) {
          msgId = fresh.id;
          currentMsg = fresh;
        }
      }

      await currentMsg.click({ data: Buffer.from(cat.dataStr) });
      await sleep(1800);

      let [listMsg] = await client.getMessages(entity, { ids: [msgId] });
      if (!listMsg || !listMsg.replyMarkup) continue;

      let hasNextPage = true;
      while (hasNextPage && count < limit) {
        const prdButtons = [];
        let nextPageData = null;

        for (const row of listMsg.replyMarkup?.rows || []) {
          for (const btn of row.buttons || []) {
            const dataStr = btn.data ? Buffer.from(btn.data).toString('utf8') : '';
            if (dataStr.startsWith('prd:')) {
              prdButtons.push({ text: btn.text, dataStr });
            } else if (dataStr.startsWith('pl:') && (btn.text.includes('›') || btn.text.includes('>'))) {
              nextPageData = dataStr;
            }
          }
        }

        for (const prdBtn of prdButtons) {
          if (count >= limit) break;
          try {
            await listMsg.click({ data: Buffer.from(prdBtn.dataStr) });
            await sleep(1600);

            let [detailMsg] = await client.getMessages(entity, { ids: [msgId] });
            if (detailMsg && detailMsg.message) {
              const parsed = parseBuatPremProductDetail(detailMsg.message);
              if (parsed) {
                count++;
                processScrapedItem({
                  productName: cleanCatName,
                  variantName: parsed.variantName,
                  costPrice: parsed.costPrice,
                  stock: parsed.stock,
                  isAvailable: parsed.isAvailable,
                  description: parsed.description,
                  supplierName: cleanTargetBot,
                  context,
                  index: count,
                  idPrefix: 'buatprem'
                });

                const statusTag = parsed.isAvailable ? `Ready: ${parsed.stock}` : `KOSONG`;
                addLog(`[#${count}] ${cleanCatName} -> ${parsed.variantName} (Rp ${parsed.costPrice.toLocaleString('id-ID')}) [${statusTag}]`);
              }
            }

            // Kembali ke daftar produk
            const backToListBtn = detailMsg?.replyMarkup?.rows?.flatMap(r => r.buttons).find(b => {
              const d = b.data ? Buffer.from(b.data).toString('utf8') : '';
              return d.startsWith('pl:');
            });

            if (backToListBtn) {
              await detailMsg.click({ data: backToListBtn.data }).catch(() => {});
              await sleep(1400);
              const [refreshedList] = await client.getMessages(entity, { ids: [msgId] });
              listMsg = refreshedList || listMsg;
            }
          } catch (itemErr) {
            addLog(`Gagal mengambil detail item #${prdBtn.text}: ${itemErr.message}`);
            await sleep(1500);
          }
        }

        // Cek halaman berikutnya dalam kategori
        if (nextPageData && count < limit) {
          addLog(`Membuka halaman berikutnya kategori [${cleanCatName}]...`);
          await listMsg.click({ data: Buffer.from(nextPageData) });
          await sleep(1800);
          const [nextListMsg] = await client.getMessages(entity, { ids: [msgId] });
          listMsg = nextListMsg || listMsg;
        } else {
          hasNextPage = false;
        }
      }

      // Kembali ke menu kategori
      const backToCatsBtn = listMsg.replyMarkup?.rows?.flatMap(r => r.buttons).find(b => {
        const d = b.data ? Buffer.from(b.data).toString('utf8') : '';
        return d.startsWith('cats:');
      });

      if (backToCatsBtn) {
        await listMsg.click({ data: backToCatsBtn.data }).catch(() => {});
        await sleep(1400);
      }
    } catch (catErr) {
      addLog(`Peringatan kategori ${cleanCatName}: ${catErr.message}`);
      await sleep(1500);
    }
  }

  return count;
}

let isScrapingRunning = false;
let scrapingStartTime = 0;

export function isScraperBusy() {
  if (isScrapingRunning && Date.now() - scrapingStartTime > 180000) {
    isScrapingRunning = false;
    scrapingStartTime = 0;
  }
  return isScrapingRunning;
}

export function resetScraperLock() {
  isScrapingRunning = false;
  scrapingStartTime = 0;
}

/**
 * Menyedot data langsung dari bot supplier Telegram (misal @heavenprem_bot atau @Ziem7_bot)
 */
export async function scrapeTelegramSupplier(options = {}) {
  const { limit = 75, targetBot = 'heavenprem_bot', onLog = null } = options;

  if (isScraperBusy()) {
    throw new Error('Proses scraping sedang berjalan di latar belakang. Harap tunggu.');
  }

  const apiId = Number(process.env.TELEGRAM_API_ID);
  const apiHash = process.env.TELEGRAM_API_HASH;
  const cleanTargetBot = (targetBot || 'heavenprem_bot').replace(/^@/, '').trim();

  if (!apiId || !apiHash) {
    throw new Error('TELEGRAM_API_ID atau TELEGRAM_API_HASH belum diatur di sistem.');
  }

  if (!fs.existsSync(sessionFilePath)) {
    throw new Error('Berkas session.txt belum ditemukan. Silakan pastikan akun Telegram UserBot telah tersambung.');
  }

  isScrapingRunning = true;
  scrapingStartTime = Date.now();
  const savedSession = fs.readFileSync(sessionFilePath, 'utf8').trim();
  const client = new TelegramClient(new StringSession(savedSession), apiId, apiHash, {
    connectionRetries: 5,
  });

  const logs = [];
  const addLog = (msg) => {
    logs.push(`[${new Date().toLocaleTimeString('id-ID')}] ${msg}`);
    if (onLog) onLog(msg);
  };

  try {
    addLog(`Menghubungkan ke Telegram UserBot...`);
    await client.connect();
    const isAuth = await client.checkAuthorization();
    if (!isAuth) {
      throw new Error('Sesi Telegram UserBot kedaluwarsa. Silakan perbarui session.txt.');
    }

    addLog(`Terhubung! Memulai penyedotan hingga ${limit} produk dari @${cleanTargetBot}...`);

    const db = getDb();
    const existingVariantsMap = new Map((db.variants || []).map(v => [v.id, v]));
    const existingProductsMap = new Map((db.products || []).map(p => [p.id, p]));
    const categoriesMap = new Map((db.categories || []).map(c => [c.id, c]));

    const scrapedProducts = [];
    const scrapedVariants = [];
    const newProductsList = [];
    const newVariantsList = [];
    const outOfStockList = [];
    const priceChangesList = [];
    let successCount = 0;

    const scrapeContext = {
      addLog,
      db,
      categoriesMap,
      existingProductsMap,
      existingVariantsMap,
      newProductsList,
      newVariantsList,
      outOfStockList,
      priceChangesList,
      scrapedProducts,
      scrapedVariants
    };

    if (cleanTargetBot.toLowerCase().includes('ziem')) {
      successCount = await scrapeZiemSupplier(client, cleanTargetBot, { limit }, scrapeContext);
    } else if (cleanTargetBot.toLowerCase().includes('buatprem')) {
      successCount = await scrapeBuatPremSupplier(client, cleanTargetBot, { limit }, scrapeContext);
    } else if (cleanTargetBot.toLowerCase().includes('bagah')) {
      successCount = await scrapeBagahSupplier(client, cleanTargetBot, { limit }, scrapeContext);
    } else if (cleanTargetBot.toLowerCase().includes('ysauto') || cleanTargetBot.toLowerCase().includes('ysautoorder')) {
      successCount = await scrapeYSSupplier(client, cleanTargetBot, { limit }, scrapeContext);
    } else if (cleanTargetBot.toLowerCase().includes('prabu')) {
      successCount = await scrapePrabuMailSupplier(client, cleanTargetBot, {}, scrapeContext);
    } else {
      for (let num = 1; num <= limit; num++) {
      try {
        await client.sendMessage(cleanTargetBot, { message: String(num) });
        await sleep(1900);

        const msgs = await client.getMessages(cleanTargetBot, { limit: 2 });
        const botMsg = msgs.find((m) => !m.out);

        if (botMsg && botMsg.message) {
          const parsed = parseProductMessage(botMsg.message);
          if (parsed && parsed.productName) {
            const catInfo = categorizeProduct(parsed.productName);
            if (!categoriesMap.has(catInfo.id)) {
              categoriesMap.set(catInfo.id, catInfo);
            }

            const prodId = `prod_${num}`;
            const existingProd = existingProductsMap.get(prodId);

            if (!existingProd) {
              newProductsList.push({
                id: prodId,
                name: parsed.productName,
                category: catInfo.name
              });
            }

            const prodObj = {
              id: prodId,
              categoryId: catInfo.id,
              name: existingProd ? existingProd.name : parsed.productName,
              description: `Akun Premium Resmi & Bergaransi D Store`,
              isActive: true,
            };
            scrapedProducts.push(prodObj);

            if (parsed.variants.length > 0) {
              parsed.variants.forEach((v, vIdx) => {
                const varId = `var_${num}_${vIdx + 1}`;
                const prev = existingVariantsMap.get(varId);

                // Lacak produk baru
                if (!prev) {
                  newVariantsList.push({
                    id: varId,
                    productName: parsed.productName,
                    variantName: v.name,
                    costPrice: v.costPrice,
                    price: v.costPrice + calculateMargin(parsed.productName, v.costPrice),
                    isAvailable: v.isAvailable,
                    stock: v.stock
                  });
                }

                // Lacak stok habis / kosong dari supplier
                if (!v.isAvailable || v.stock === 0) {
                  outOfStockList.push({
                    id: varId,
                    productName: parsed.productName,
                    variantName: v.name,
                    costPrice: v.costPrice,
                    price: prev?.price || (v.costPrice + calculateMargin(parsed.productName, v.costPrice)),
                    stock: v.stock || 0
                  });
                }

                // Lacak perubahan harga modal
                if (prev && Number(prev.costPrice) !== Number(v.costPrice)) {
                  priceChangesList.push({
                    id: varId,
                    productName: parsed.productName,
                    variantName: v.name,
                    oldCost: Number(prev.costPrice),
                    newCost: Number(v.costPrice),
                    diff: Number(v.costPrice) - Number(prev.costPrice)
                  });
                }

                const currentSupplier = cleanTargetBot;
                const currentSupplierKey = cleanTargetBot.toLowerCase();

                // Jika supplier dikunci oleh admin ke supplier lain (misal Toko A / Toko B), jangan ditimpa!
                if (prev && (prev.isSupplierLocked || (prev.supplier && prev.supplier.toLowerCase() !== currentSupplierKey && prev.supplier.toLowerCase() !== 'heavenprem'))) {
                  scrapedVariants.push({
                    ...prev,
                    productId: prodId
                  });
                  return;
                }

                let sellingPrice = prev && prev.price ? prev.price : (v.costPrice + calculateMargin(parsed.productName, v.costPrice));
                if (sellingPrice <= v.costPrice) {
                  sellingPrice = v.costPrice + calculateMargin(parsed.productName, v.costPrice);
                }

                let supplierOffers = prev && Array.isArray(prev.supplierOffers) ? [...prev.supplierOffers] : [];
                const hpIdx = supplierOffers.findIndex(o => o.supplier.toLowerCase() === currentSupplierKey);
                if (hpIdx >= 0) {
                  supplierOffers[hpIdx].costPrice = v.costPrice;
                  supplierOffers[hpIdx].isAvailable = v.isAvailable;
                  supplierOffers[hpIdx].updatedAt = new Date().toISOString();
                } else {
                  supplierOffers.push({
                    supplier: currentSupplier,
                    costPrice: v.costPrice,
                    isAvailable: v.isAvailable,
                    updatedAt: new Date().toISOString()
                  });
                }
                supplierOffers.sort((a, b) => a.costPrice - b.costPrice);

                scrapedVariants.push({
                  id: varId,
                  productId: prodId,
                  name: v.name,
                  price: sellingPrice,
                  costPrice: v.costPrice,
                  supplier: prev?.supplier || currentSupplier,
                  isSupplierLocked: false,
                  isAvailable: v.isAvailable,
                  supplierOffers
                });
              });

              const outInThis = parsed.variants.filter(x => !x.isAvailable || x.stock === 0);
              const statusNote = outInThis.length > 0 
                ? `[HABIS: ${outInThis.length} varian - ${outInThis.map(x => x.name).join(', ')}]`
                : `[Semua Ready]`;
              const isNewNote = !existingProd ? ` [BARU]` : '';

              addLog(`[#${num}] ${parsed.productName} -> ${parsed.variants.length} varian ${statusNote}${isNewNote}`);
            } else {
              const varId = `var_${num}_1`;
              const prev = existingVariantsMap.get(varId);
              const currentSupplier = cleanTargetBot;
              const currentSupplierKey = cleanTargetBot.toLowerCase();
              if (prev && (prev.isSupplierLocked || (prev.supplier && prev.supplier.toLowerCase() !== currentSupplierKey && prev.supplier.toLowerCase() !== 'heavenprem'))) {
                scrapedVariants.push({
                  ...prev,
                  productId: prodId
                });
              } else {
                scrapedVariants.push({
                  id: varId,
                  productId: prodId,
                  name: `${parsed.productName} Standar`,
                  price: prev && prev.price ? prev.price : 28000,
                  costPrice: 25000,
                  supplier: currentSupplier,
                  isSupplierLocked: false,
                  isAvailable: true,
                  supplierOffers: [
                    { supplier: currentSupplier, costPrice: 25000, isAvailable: true, updatedAt: new Date().toISOString() }
                  ]
                });
              }
              addLog(`[#${num}] ${parsed.productName} -> varian standar.`);
            }
            successCount++;
          }
        }
      } catch (itemErr) {
        addLog(`Peringatan produk #${num}: ${itemErr.message}`);
        await sleep(2000);
      }
    }
  }

    if (scrapedProducts.length > 0) {
      // Pertahankan produk kustom yang dibuat manual oleh admin
      const customProducts = (db.products || []).filter(p => !scrapedProducts.some(sp => sp.id === p.id));
      const customVariants = (db.variants || []).filter(v => !scrapedVariants.some(sv => sv.id === v.id));

      db.categories = Array.from(categoriesMap.values());
      db.products = [...scrapedProducts, ...customProducts];
      db.variants = [...scrapedVariants, ...customVariants];

      saveDb(db);

      // Sinkronisasi otomatis ke Google Spreadsheet
      addLog(`Menyinkronkan data katalog terbaru ke Google Spreadsheet...`);
      let sheetSyncInfo = { success: false, status: 'Belum terhubung' };
      try {
        const sheetRes = await pushToGoogleSheet();
        if (sheetRes.success) {
          sheetSyncInfo = { 
            success: true, 
            status: `Sukses (${sheetRes.count} baris tersinkronisasi ke Google Spreadsheet)`,
            count: sheetRes.count
          };
          addLog(`Google Spreadsheet berhasil diperbarui otomatis (${sheetRes.count} item tersinkron).`);
        } else {
          sheetSyncInfo = { 
            success: false, 
            status: `Gagal: ${sheetRes.error || sheetRes.message}` 
          };
          addLog(`Google Spreadsheet belum terhubung: ${sheetSyncInfo.status}`);
        }
      } catch (sheetErr) {
        sheetSyncInfo = { success: false, status: `Error: ${sheetErr.message}` };
        addLog(`Sinkronisasi Spreadsheet terlewat: ${sheetErr.message}`);
      }

      addLog(`Selesai! ${scrapedProducts.length} Produk (${newProductsList.length} baru), ${scrapedVariants.length} Varian (${outOfStockList.length} habis/kosong) berhasil diperbarui di Web.`);

      return {
        success: true,
        scrapedCount: successCount,
        productCount: db.products.length,
        variantCount: db.variants.length,
        diff: {
          newProducts: newProductsList,
          newVariants: newVariantsList,
          outOfStock: outOfStockList,
          priceChanges: priceChangesList,
          readyCount: scrapedVariants.filter(x => x.isAvailable).length
        },
        sheetSync: sheetSyncInfo,
        logs
      };
    } else {
      throw new Error('Tidak ada respon produk yang berhasil diterima dari bot supplier.');
    }
  } finally {
    isScrapingRunning = false;
    scrapingStartTime = 0;
    await client.disconnect().catch(() => {});
  }
}

/**
 * AI Text Parser: Membedah teks mentah/pricelist supplier menjadi objek produk & varian
 */
export async function parseSupplierTextWithAI(rawText, defaultSupplier = 'Toko Baru') {
  if (!rawText || !rawText.trim()) {
    throw new Error('Teks pricelist tidak boleh kosong.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API Key Gemini belum diatur.');
  }

  const systemInstruction = `Kamu adalah parser e-commerce cerdas produk digital akun premium Indonesia.
Tugasmu adalah membaca teks daftar harga / pricelist mentah supplier (yang mungkin berantakan, singkatan reseller, atau format tabel santai) dan mengekstraknya menjadi JSON array.

ATURAN:
1. Pahami format singkatan reseller Indonesia:
   - 25k, 25rb, 25.000 = 25000
   - Durasi HARUS menggunakan singkatan bahasa Inggris standar:
     * Hari = "d" (contoh: 1 Hari = "1d", 3 Hari = "3d", 7 Hari = "7d", 14 Hari = "14d", 30 Hari = "30d")
     * Bulan = "m" (contoh: 1 Bulan = "1m", 2 Bulan = "2m", 3 Bulan = "3m", 6 Bulan = "6m", 12 Bulan = "12m")
     * Tahun = "y" (contoh: 1 Tahun = "1y")
     * Minggu = "w" (contoh: 1 Minggu = "1w")
   - shared / sharing = Sharing; private = Private; invite = Invite Member
2. Jika ada 2 angka harga (misal "25k modal 20k" atau "25k 20k"), angka yang LEBIH BESAR adalah sellingPrice, yang LEBIH KECIL adalah costPrice.
3. Kategori harus salah satu dari:
   - "AI Tools & Productivity"
   - "Streaming & Entertainment"
   - "Graphic, Design & Video"
   - "Music & Audio"
   - "Edukasi & Bahasa"
   - "Office, Akun & Tools"
4. Supplier default adalah "${defaultSupplier}". Jika di teks ada nama supplier lain tertulis, gunakan nama itu.
5. Format output HANYA JSON array valid tanpa markdown \`\`\`json:
[
  {
    "productName": "Canva Pro",
    "category": "Graphic, Design & Video",
    "variantName": "1m - Invite Member",
    "sellingPrice": 4500,
    "costPrice": 1500,
    "supplier": "${defaultSupplier}",
    "isAvailable": true
  }
]`;

  const candidateModels = ['gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: systemInstruction + '\n\nTeks Input Reseller:\n"""\n' + rawText + '\n"""' }] }
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json"
          }
        })
      });

      if (!res.ok) continue;
      const data = await res.json();
      const rawRes = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = rawRes.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(item => ({
          productName: item.productName || 'Produk Baru',
          category: item.category || 'Office, Akun & Tools',
          variantName: item.variantName || 'Standar',
          sellingPrice: Number(item.sellingPrice) || 0,
          costPrice: Number(item.costPrice) || 0,
          supplier: item.supplier || defaultSupplier,
          isAvailable: item.isAvailable !== false
        }));
      }
    } catch (err) {
      console.warn(`Model ${model} gagal membedah teks:`, err.message);
    }
  }

  throw new Error('AI tidak berhasil mengekstrak produk dari teks tersebut. Pastikan teks berisi nama produk dan harga.');
}

/**
 * Memasukkan produk-produk hasil parsing langsung ke database dan Google Spreadsheet
 */
export async function importParsedProducts(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, message: 'Tidak ada item yang diimpor' };
  }

  const db = getDb();
  let addedProdCount = 0;
  let addedVarCount = 0;

  for (const item of items) {
    let cat = (db.categories || []).find(c => c.name.toLowerCase() === item.category.toLowerCase());
    if (!cat) {
      cat = { id: `cat_${Date.now()}_${Math.floor(Math.random() * 100)}`, name: item.category };
      db.categories.push(cat);
    }

    // Fuzzy match produk (misal "YouTube Premium" -> "Youtube", "Canva Pro" -> "Canva")
    let prod = (db.products || []).find(p => {
      const pNorm = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const itemNorm = item.productName.toLowerCase().replace(/[^a-z0-9]/g, '');
      return pNorm === itemNorm || pNorm.includes(itemNorm) || itemNorm.includes(pNorm);
    });

    if (!prod) {
      prod = {
        id: `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        categoryId: cat.id,
        name: item.productName.trim(),
        description: `Akun Premium Resmi & Bergaransi D Store`,
        isActive: true
      };
      db.products.push(prod);
      addedProdCount++;
    }

    const costPrice = Number(item.costPrice) || 0;
    let sellingPrice = Number(item.sellingPrice) || 0;
    if (sellingPrice <= costPrice) {
      sellingPrice = costPrice + calculateMargin(prod.name, costPrice);
    }

    const cleanVarName = standardizeDuration(item.variantName.trim());
    // Cek apakah varian sudah ada
    let v = (db.variants || []).find(x => {
      if (x.productId !== prod.id) return false;
      const xNorm = standardizeDuration(x.name).toLowerCase().replace(/[^a-z0-9]/g, '');
      const itemVarNorm = cleanVarName.toLowerCase().replace(/[^a-z0-9]/g, '');
      return xNorm === itemVarNorm || xNorm.includes(itemVarNorm) || itemVarNorm.includes(xNorm);
    });

    if (!v) {
      v = {
        id: `var_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        productId: prod.id,
        name: cleanVarName,
        price: sellingPrice,
        costPrice: costPrice,
        supplier: item.supplier || 'Toko Baru',
        isAvailable: item.isAvailable !== false,
        supplierOffers: [
          {
            supplier: item.supplier || 'Toko Baru',
            costPrice: costPrice,
            isAvailable: item.isAvailable !== false,
            updatedAt: new Date().toISOString()
          }
        ]
      };
      db.variants.push(v);
      addedVarCount++;
    } else {
      // Update penawaran supplier
      if (!Array.isArray(v.supplierOffers)) v.supplierOffers = [];
      const cleanSupp = item.supplier || 'Toko Baru';
      const exist = v.supplierOffers.find(o => o.supplier.toLowerCase() === cleanSupp.toLowerCase());
      if (exist) {
        exist.costPrice = costPrice || exist.costPrice;
        exist.isAvailable = item.isAvailable !== false;
        exist.updatedAt = new Date().toISOString();
      } else {
        v.supplierOffers.push({
          supplier: cleanSupp,
          costPrice: costPrice,
          isAvailable: item.isAvailable !== false,
          updatedAt: new Date().toISOString()
        });
      }
      v.supplierOffers.sort((a, b) => a.costPrice - b.costPrice);

      if (!v.isSupplierLocked && costPrice > 0 && costPrice < v.costPrice && item.isAvailable !== false) {
        v.costPrice = costPrice;
        v.supplier = cleanSupp;
      }
    }
  }

  saveDb(db);
  pushToGoogleSheet().catch(err => console.warn('Background sync failed:', err.message));

  return {
    success: true,
    message: `Berhasil mengimpor ${addedProdCount} produk baru dan ${addedVarCount} varian baru!`,
    totalProducts: db.products.length,
    totalVariants: db.variants.length
  };
}
