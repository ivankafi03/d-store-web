import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDb, saveDb } from '@/lib/db';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

const TELEGRAM_API_ID = 34803961;
const TELEGRAM_API_HASH = '24e4f5a603b594d846c3fd33925fd8f3';
const sessionFilePath = path.join(process.cwd(), 'session.txt');
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'promo');

function ensureUploadDir() {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

// Default starter groups if empty
const DEFAULT_TARGET_GROUPS = [
  {
    id: 'grp_jb_ewallet',
    title: 'JUAL BELI AKUN E WALLET PREMIUM / REKENING',
    username: 'JB_EWALLET',
    link: 'https://t.me/JB_EWALLET',
    category: 'Jual Beli Akun',
    membersCount: 3867,
    notes: 'Bagus untuk promo Akun Premium & Streaming',
    isAutoFetched: false
  },
  {
    id: 'grp_mahasiswa_it',
    title: 'Grup Mahasiswa IT Indonesia',
    username: 'mahasiswa_IT_indonesia',
    link: 'https://t.me/mahasiswa_IT_indonesia',
    category: 'Edukasi & Mahasiswa',
    membersCount: 389,
    notes: 'Target pas untuk ChatGPT Plus, Colab, Claude, AI Tools',
    isAutoFetched: false
  },
  {
    id: 'grp_joki_tugas',
    title: 'Joki Tugas by Asisten.Mahasiswa',
    username: 'grupasistenmahasiswa',
    link: 'https://t.me/grupasistenmahasiswa',
    category: 'Edukasi & Mahasiswa',
    membersCount: 570,
    notes: 'Target empuk Canva, Turnitin, Quillbot, Duolingo',
    isAutoFetched: false
  },
  {
    id: 'grp_warga_banten',
    title: 'GRUP WARGA BANTEN SILATURAHMI, JUAL BELI & LOKER',
    username: 'grupwargabanten',
    link: 'https://t.me/grupwargabanten',
    category: 'Jual Beli Umum',
    membersCount: 1867,
    notes: 'Komunitas lokal jual beli umum',
    isAutoFetched: false
  },
  {
    id: 'grp_adsterra',
    title: 'Adsterra Indonesia (Internet Marketer)',
    username: 'adsterra_indonesia',
    link: 'https://t.me/adsterra_indonesia',
    category: 'Digital Marketer',
    membersCount: 3334,
    notes: 'Target tools digital, VPN, AI marketing',
    isAutoFetched: false
  }
];

export async function GET() {
  try {
    const db = getDb();
    if (!Array.isArray(db.promoPresets)) db.promoPresets = [];
    if (!Array.isArray(db.targetGroups)) {
      db.targetGroups = DEFAULT_TARGET_GROUPS;
      saveDb(db);
    }

    const hasTelegramSession = fs.existsSync(sessionFilePath);

    return NextResponse.json({
      status: 'ok',
      presets: db.promoPresets,
      targetGroups: db.targetGroups,
      hasTelegramSession
    });
  } catch (err) {
    console.error('[API Promo GET Error]', err);
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;
    const db = getDb();
    if (!Array.isArray(db.promoPresets)) db.promoPresets = [];
    if (!Array.isArray(db.targetGroups)) db.targetGroups = [...DEFAULT_TARGET_GROUPS];

    // =========================================================================
    // 1. SIMPAN ATAU UPDATE PRESET PROMO
    // =========================================================================
    if (action === 'save_preset') {
      const { id, title, caption, imageDataUrl, imagePath } = body;
      if (!title || !title.trim()) {
        return NextResponse.json({ status: 'error', message: 'Judul promo wajib diisi' }, { status: 400 });
      }

      let finalImagePath = imagePath || '';

      // Jika ada base64 imageDataUrl baru, simpan ke file
      if (imageDataUrl && imageDataUrl.startsWith('data:image/')) {
        try {
          ensureUploadDir();
          const matches = imageDataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
          if (matches) {
            const ext = matches[1].replace('jpeg', 'jpg');
            const fileName = `promo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
            const diskPath = path.join(uploadDir, fileName);
            const buffer = Buffer.from(matches[2], 'base64');
            fs.writeFileSync(diskPath, buffer);
            finalImagePath = `/uploads/promo/${fileName}`;
          }
        } catch (imgErr) {
          console.warn('[Promo API] Gagal simpan gambar ke disk, gunakan data URL:', imgErr.message);
          finalImagePath = imageDataUrl;
        }
      }

      const existingIndex = db.promoPresets.findIndex(p => p.id === id);
      const presetData = {
        id: id || `promo_${Date.now()}`,
        title: title.trim(),
        caption: (caption || '').trim(),
        image: finalImagePath,
        updatedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        db.promoPresets[existingIndex] = {
          ...db.promoPresets[existingIndex],
          ...presetData
        };
      } else {
        presetData.createdAt = new Date().toISOString();
        db.promoPresets.unshift(presetData);
      }

      saveDb(db);
      return NextResponse.json({
        status: 'ok',
        message: 'Promo berhasil disimpan ke riwayat!',
        preset: presetData,
        presets: db.promoPresets
      });
    }

    // =========================================================================
    // 2. HAPUS PRESET PROMO DARI RIWAYAT
    // =========================================================================
    if (action === 'delete_preset') {
      const { presetId } = body;
      const target = db.promoPresets.find(p => p.id === presetId);
      if (target && target.image && target.image.startsWith('/uploads/promo/')) {
        // Hapus file fisik jika ada
        const diskPath = path.join(process.cwd(), 'public', target.image);
        if (fs.existsSync(diskPath)) {
          try { fs.unlinkSync(diskPath); } catch (_) {}
        }
      }

      db.promoPresets = db.promoPresets.filter(p => p.id !== presetId);
      saveDb(db);
      return NextResponse.json({
        status: 'ok',
        message: 'Promo berhasil dihapus dari riwayat',
        presets: db.promoPresets
      });
    }

    // =========================================================================
    // 3. BACA & SINKRONISASI GRUP DARI AKUN TELEGRAM
    // =========================================================================
    if (action === 'sync_telegram_groups') {
      if (!fs.existsSync(sessionFilePath)) {
        return NextResponse.json({
          status: 'error',
          message: 'Sesi Telegram (session.txt) tidak ditemukan di laptop.'
        }, { status: 400 });
      }

      const savedSession = fs.readFileSync(sessionFilePath, 'utf8').trim();
      const client = new TelegramClient(new StringSession(savedSession), TELEGRAM_API_ID, TELEGRAM_API_HASH, {
        connectionRetries: 2,
        autoReconnect: false,
        timeout: 10
      });

      try {
        await client.connect();
        const isAuth = await client.checkAuthorization();
        if (!isAuth) {
          throw new Error('Sesi Telegram telah kedaluwarsa. Silakan perbarui session.txt.');
        }

        const dialogs = await client.getDialogs({ limit: 80 });
        const fetchedGroups = [];

        for (const d of dialogs) {
          if (d.isGroup || d.isChannel) {
            const username = d.entity?.username || null;
            const title = d.title || d.name || 'Grup Telegram';
            const link = username ? `https://t.me/${username}` : '';
            const membersCount = d.entity?.participantsCount || null;

            fetchedGroups.push({
              id: `tele_${d.id ? d.id.toString().replace(/^-/, '') : Math.random().toString(36).substring(2, 9)}`,
              title,
              username,
              link,
              category: d.isChannel ? 'Channel Telegram' : 'Grup Telegram',
              membersCount,
              notes: 'Diambil otomatis dari akun Telegram kamu',
              isAutoFetched: true
            });
          }
        }

        try { await client.destroy(); } catch (_) {}

        // Merge: pertahankan grup yang sudah ada dan jangan duplikat
        const existingMap = new Map();
        for (const g of db.targetGroups) {
          const key = (g.username || g.title).toLowerCase().trim();
          existingMap.set(key, g);
        }

        let newAddedCount = 0;
        for (const fg of fetchedGroups) {
          const key = (fg.username || fg.title).toLowerCase().trim();
          if (!existingMap.has(key)) {
            db.targetGroups.push(fg);
            existingMap.set(key, fg);
            newAddedCount++;
          }
        }

        saveDb(db);

        return NextResponse.json({
          status: 'ok',
          message: `Berhasil membaca ${fetchedGroups.length} grup dari Telegram! (${newAddedCount} grup baru ditambahkan)`,
          targetGroups: db.targetGroups
        });
      } catch (teleErr) {
        try { await client.destroy(); } catch (_) {}
        console.error('[Promo API Telegram Sync Error]', teleErr);
        return NextResponse.json({
          status: 'error',
          message: `Gagal membaca grup Telegram: ${teleErr.message}`
        }, { status: 500 });
      }
    }

    // =========================================================================
    // 4. HAPUS GRUP ("Keknya grup ini gausah deh")
    // =========================================================================
    if (action === 'delete_group') {
      const { groupId } = body;
      if (!groupId) {
        return NextResponse.json({ status: 'error', message: 'groupId wajib disertakan' }, { status: 400 });
      }

      db.targetGroups = db.targetGroups.filter(g => g.id !== groupId);
      saveDb(db);

      return NextResponse.json({
        status: 'ok',
        message: 'Grup berhasil dihapus dari daftar target!',
        targetGroups: db.targetGroups
      });
    }

    // =========================================================================
    // 5. TAMBAH GRUP MANUAL (Username / Link)
    // =========================================================================
    if (action === 'add_group') {
      const { title, usernameOrLink, category, notes } = body;
      if (!title || !title.trim()) {
        return NextResponse.json({ status: 'error', message: 'Nama grup wajib diisi' }, { status: 400 });
      }

      let cleanInput = (usernameOrLink || '').trim();
      let username = null;
      let link = cleanInput;

      if (cleanInput.startsWith('https://t.me/') || cleanInput.startsWith('t.me/')) {
        const parts = cleanInput.replace(/^https?:\/\//, '').split('/');
        if (parts[1]) username = parts[1].replace(/^@/, '');
        link = cleanInput.startsWith('http') ? cleanInput : `https://${cleanInput}`;
      } else if (cleanInput.startsWith('@')) {
        username = cleanInput.replace(/^@/, '');
        link = `https://t.me/${username}`;
      } else if (cleanInput) {
        username = cleanInput;
        link = `https://t.me/${username}`;
      }

      const newGroup = {
        id: `custom_grp_${Date.now()}`,
        title: title.trim(),
        username,
        link,
        category: category || 'Grup Pilihan',
        membersCount: null,
        notes: notes || 'Ditambahkan manual',
        isAutoFetched: false
      };

      db.targetGroups.unshift(newGroup);
      saveDb(db);

      return NextResponse.json({
        status: 'ok',
        message: 'Grup baru berhasil ditambahkan ke daftar target!',
        group: newGroup,
        targetGroups: db.targetGroups
      });
    }

    // =========================================================================
    // 6. GENERATE CAPTION DARI PRODUK READY
    // =========================================================================
    if (action === 'generate_ready_caption') {
      const products = db.products || [];
      const variants = db.variants || [];

      // Cari produk yang punya varian ready
      const readyItems = [];
      for (const p of products) {
        const readyVars = variants.filter(v => v.productId === p.id && v.isAvailable);
        if (readyVars.length > 0) {
          const cheapest = [...readyVars].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))[0];
          readyItems.push({
            name: p.name,
            cheapestPrice: Number(cheapest.price) || 0,
            variantName: cheapest.name
          });
        }
      }

      // Ambil top 8-10 produk menarik
      const topList = readyItems
        .filter(i => i.cheapestPrice > 0)
        .slice(0, 10)
        .map(i => `▫️ *${i.name}* (mulai Rp ${i.cheapestPrice.toLocaleString('id-ID')})`)
        .join('\n');

      const caption = `🔥 *PROMO SPESIAL AKUN DIGITAL D-STORE* 🔥\n_Akun Resmi, Anti Hold & Full Garansi!_\n\n⚡ *STOK READY HARI INI:*\n${topList}\n\n💎 *Kenapa Beli di D-Store?*\n✅ Proses Cepat (1-5 Menit)\n✅ Garansi Aktif Selama Durasi\n✅ Pembayaran Lengkap (QRIS, E-Wallet, TF Bank)\n\n🛒 *Katalog Lengkap & Beli Langsung:*\n👉 https://dstore.sbs\n\n📲 *Chat Admin Langsung:*\nTelegram: @dewipermata03\nWhatsApp: https://wa.me/6281230112240\n\n_⚡ Buruan order sebelum slot habis!_`;

      return NextResponse.json({
        status: 'ok',
        caption
      });
    }

    return NextResponse.json({ status: 'error', message: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (err) {
    console.error('[API Promo POST Error]', err);
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
