// Data varian paket resmi D Store - Sumber Tunggal Master Spreadsheet Terbaru (77 Produk, 300 Varian)
import bundledCatalog from '../data/public-catalog.json';

export function parseVariantDuration(name = '') {
  const low = String(name || '').toLowerCase();
  if (low.includes('1d') || low.includes('1 hari') || low.includes('1 day')) return '1 Hari';
  if (low.includes('3d') || low.includes('3 hari') || low.includes('3 day')) return '3 Hari';
  if (low.includes('5d') || low.includes('5 hari') || low.includes('5 day')) return '5 Hari';
  if (low.includes('7d') || low.includes('1w') || low.includes('7 hari') || low.includes('1 minggu')) return '7 Hari';
  if (low.includes('14d') || low.includes('2w') || low.includes('14 hari')) return '14 Hari';
  if (low.includes('1m') || low.includes('1 bln') || low.includes('1 bulan') || low.includes('30 hari') || low.includes('30d')) return '30 Hari';
  if (low.includes('2m') || low.includes('2 bln') || low.includes('2 bulan') || low.includes('60 hari')) return '60 Hari';
  if (low.includes('3m') || low.includes('3 bln') || low.includes('3 bulan') || low.includes('90 hari')) return '90 Hari';
  if (low.includes('6m') || low.includes('6 bln') || low.includes('6 bulan') || low.includes('180 hari')) return '180 Hari';
  if (low.includes('1y') || low.includes('1 thn') || low.includes('1 tahun') || low.includes('365 hari')) return '1 Tahun';
  return 'Sesuai Paket';
}

const BRAND_META = {
  'spotify': { themeColor: '#1DB954', initial: 'SPOT', badge: 'PALING POPULER', tagline: 'Streaming Musik & Podcast Tanpa Iklan dengan Audio Lossless 320 kbps' },
  'netflix': { themeColor: '#E50914', initial: 'NFLX', badge: 'BEST SELLER', tagline: 'Nonton Film, Serial, Anime & Drama Korea Kualitas 4K Ultra HD & HDR' },
  'chatgpt': { themeColor: '#10A37F', initial: 'GPT', badge: 'AI FAVORIT', tagline: 'Akses Model Cerdas OpenAI GPT-4o, Canvas & DALL-E 3 Tanpa Batas' },
  'canva': { themeColor: '#00C4CC', initial: 'CNV', badge: 'DESAIN PRO', tagline: 'Akses Seluruh Template Premium, Magic Studio & Export Kualitas Tinggi' },
  'youtube': { themeColor: '#FF0000', initial: 'YTB', badge: 'BANYAK DIBELI', tagline: 'Streaming Video Bebas Iklan & Akses YouTube Music Premium Sepuasnya' },
  'capcut': { themeColor: '#000000', initial: 'CPCT', badge: 'EDITOR PILIHAN', tagline: 'Edit Video Pro, Bebas Watermark, Efek & Transisi VIP Lengkap' },
  'bstation': { themeColor: '#00A1D6', initial: 'BSTN', badge: 'STREAMING', tagline: 'Streaming Anime & Konten Populer Kualitas HD 1080p' },
  'apple-music': { themeColor: '#FA243C', initial: 'APPL', badge: 'LOSSLESS', tagline: 'Audio Lossless & Spatial Audio Dolby Atmos Resmi' },
  'apple-tv': { themeColor: '#000000', initial: 'ATV', badge: 'APPLE ORIGINAL', tagline: 'Serial & Film Eksklusif Apple Original Kualitas 4K HDR' },
  'gemini-ai': { themeColor: '#1A73E8', initial: 'GMNI', badge: 'GOOGLE AI', tagline: 'Google DeepMind AI 1.5 Pro Context Window Panjang' },
  'duolingo': { themeColor: '#58CC02', initial: 'DUO', badge: 'BAHASA', tagline: 'Belajar Puluhan Bahasa Bebas Iklan & Super Heart Unlimited' },
  'disney-hotstar': { themeColor: '#0C3875', initial: 'DSNY', badge: 'BLOCKBUSTER', tagline: 'Film & Serial Disney, Marvel, Pixar & Star Wars Resmi' },
  'prime-video': { themeColor: '#00A8E1', initial: 'PRM', badge: 'STREAMING', tagline: 'Akses Film & Serial Eksklusif Amazon Original 4K UHD' },
  'viu': { themeColor: '#FEBB10', initial: 'VIU', badge: 'ASIAN DRAMA', tagline: 'Drama Korea, Asia & Anime Terbaru Sub Indo Tercepat' },
  'vidio': { themeColor: '#EB1C24', initial: 'VDIO', badge: 'LIVE SPORTS', tagline: 'Streaming Liga Sepak Bola Dunia, Serial & TV Lokal' },
  'wetv': { themeColor: '#0066FF', initial: 'WETV', badge: 'DRAMA VIP', tagline: 'Serial Romantis, Drachin & Webseries VIP Tanpa Iklan' },
  'alight-motion': { themeColor: '#38EF7D', initial: 'AM', badge: 'ANIMASI', tagline: 'Grafik Gerak, Animasi Visual & Efek Tanpa Watermark' },
  'remini': { themeColor: '#E60023', initial: 'RMNI', badge: 'ENHANCER', tagline: 'Tingkatkan Kualitas Foto & Video Lama Menjadi Ultra HD' },
  'lightroom': { themeColor: '#31A8FF', initial: 'LR', badge: 'FOTOGRAFI', tagline: 'Preset Premium, Masking AI & Edit Foto Presisi Profesional' },
  'vsco': { themeColor: '#000000', initial: 'VSCO', badge: 'FILTER PRO', tagline: 'Preset Estetik Analog, Film X & Filter Sinematik' },
  'dazzcam': { themeColor: '#FF6B6B', initial: 'DAZZ', badge: 'KAMERA RETRO', tagline: 'Simulasi Kamera Vintage, Efek Film Klasik 90-an' },
  'microsoft-365': { themeColor: '#D83B01', initial: 'M365', badge: 'OFFICE PRO', tagline: 'Word, Excel, PowerPoint Resmi Bergaransi + Cloud Storage' }
};

const CATEGORY_NAMES = {
  'cat_1': 'AI & Tools',
  'cat_2': 'Streaming & Film',
  'cat_3': 'Desain & Video',
  'cat_4': 'Musik & Audio',
  'cat_5': 'Edukasi & Bahasa',
  'cat_6': 'VPN & Security',
  'cat_7': 'Office & Akun Tools'
};

// Bangun kamus statis APP_VARIANTS_DATA secara dinamis dari katalog master resmi
function buildMasterAppDictionary() {
  const dict = {};
  const products = Array.isArray(bundledCatalog?.products) ? bundledCatalog.products : [];
  const variants = Array.isArray(bundledCatalog?.variants) ? bundledCatalog.variants : [];

  for (const prod of products) {
    const slug = prod.slug || prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const metaKey = Object.keys(BRAND_META).find(k => slug === k || slug.includes(k) || k.includes(slug)) || '';
    const meta = BRAND_META[metaKey] || {};

    const prodVars = variants
      .filter(v => v.productId === prod.id)
      .sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));

    const packages = prodVars.map((v, idx) => {
      const p = Number(v.price) || 0;
      const orig = Math.round(p * 1.5);
      return {
        id: v.id,
        name: v.name,
        duration: v.duration || parseVariantDuration(v.name),
        price: p,
        originalPrice: orig,
        discount: '33% OFF',
        badge: idx === 0 ? 'BEST VALUE' : (v.duration ? v.duration.toUpperCase() : 'RESMI'),
        popular: idx === 0,
        isAvailable: v.isAvailable !== false,
        supplier: v.supplier || '',
        desc: v.name
      };
    });

    dict[slug] = {
      slug,
      id: prod.id,
      name: prod.name,
      brand: prod.brand || prod.name.toUpperCase(),
      category: CATEGORY_NAMES[prod.categoryId] || 'Layanan Digital',
      tagline: meta.tagline || prod.description || `Layanan Akun ${prod.name} Resmi Bergaransi`,
      description: prod.description || `Dapatkan akses akun resmi ${prod.name} bergaransi penuh dengan aktivasi cepat di D Store.`,
      initial: meta.initial || prod.name.slice(0, 3).toUpperCase(),
      badge: meta.badge || (packages.length > 0 ? 'TERSEDIA' : 'RESMI'),
      themeColor: meta.themeColor || '#10B981',
      rating: 4.9,
      soldCount: '300+',
      features: [
        `Akun Lisensi Resmi ${prod.name}`,
        'Garansi Penuh Selama Masa Aktif',
        'Aktivasi Cepat & Panduan Pemakaian',
        'Bantuan Customer Support 24/7'
      ],
      accountTypes: [
        { id: 'standard', name: 'Akun Siap Pakai', desc: 'Disediakan akun aktif resmi bergaransi dari admin.' }
      ],
      packages
    };
  }

  return dict;
}

export const APP_VARIANTS_DATA = buildMasterAppDictionary();

function buildResolvedAppData(matched, dbProducts = [], dbVariants = []) {
  const prodVars = Array.isArray(dbVariants) ? dbVariants.filter((v) => v.productId === matched.id) : [];
  prodVars.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));

  const slug = matched.slug || matched.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const metaKey = Object.keys(BRAND_META).find(k => slug === k || slug.includes(k) || k.includes(slug)) || '';
  const meta = BRAND_META[metaKey] || {};

  const packages = prodVars.map((v, idx) => {
    const p = Number(v.price) || 0;
    const orig = Math.round(p * 1.5);
    return {
      id: v.id,
      name: v.name,
      duration: v.duration || parseVariantDuration(v.name),
      price: p,
      originalPrice: orig,
      discount: '33% OFF',
      badge: idx === 0 ? 'BEST VALUE' : (v.duration ? v.duration.toUpperCase() : 'RESMI'),
      popular: idx === 0,
      isAvailable: v.isAvailable !== false,
      supplier: v.supplier || '',
      desc: v.name
    };
  });

  return {
    slug,
    id: matched.id,
    name: matched.name,
    brand: matched.brand || matched.name.toUpperCase(),
    category: CATEGORY_NAMES[matched.categoryId] || 'Layanan Digital',
    tagline: meta.tagline || matched.description || `Layanan Akun ${matched.name} Resmi Bergaransi`,
    description: matched.description || `Dapatkan akses akun resmi ${matched.name} bergaransi penuh dengan aktivasi cepat di D Store.`,
    initial: meta.initial || matched.name.slice(0, 3).toUpperCase(),
    badge: meta.badge || (packages.length > 0 ? 'TERSEDIA' : 'RESMI'),
    themeColor: meta.themeColor || '#10B981',
    rating: 4.9,
    soldCount: '300+',
    features: [
      `Akun Lisensi Resmi ${matched.name}`,
      'Garansi Penuh Selama Masa Aktif',
      'Aktivasi Cepat & Panduan Pemakaian',
      'Bantuan Customer Support 24/7'
    ],
    accountTypes: [
      { id: 'standard', name: 'Akun Siap Pakai', desc: 'Disediakan akun aktif resmi bergaransi dari admin.' }
    ],
    packages
  };
}

export function getAppVariantData(queryOrBrandOrItem, dbProducts = [], dbVariants = []) {
  if (!queryOrBrandOrItem) return null;

  // Jika parameter dbProducts / dbVariants tidak diisi atau kosong, gunakan katalog master statis
  const activeProducts = (Array.isArray(dbProducts) && dbProducts.length > 0) ? dbProducts : (bundledCatalog?.products || []);
  const activeVariants = (Array.isArray(dbVariants) && dbVariants.length > 0) ? dbVariants : (bundledCatalog?.variants || []);

  let exactId = null;
  let textQuery = '';
  let linkQuery = '';

  if (typeof queryOrBrandOrItem === 'object') {
    exactId = queryOrBrandOrItem.id || null;

    const nameParts = [
      queryOrBrandOrItem.name,
      queryOrBrandOrItem.brand,
      queryOrBrandOrItem.title,
      queryOrBrandOrItem.label
    ].filter(Boolean);
    textQuery = nameParts.join(' ').toLowerCase().trim();

    if (queryOrBrandOrItem.link) {
      linkQuery = String(queryOrBrandOrItem.link)
        .replace(/https?:\/\/[^\/]+/g, '')
        .replace(/^\/store\/app\//, '')
        .replace(/^\/store\//, '')
        .replace(/[-_]/g, ' ')
        .trim()
        .toLowerCase();
    }
  } else {
    textQuery = String(queryOrBrandOrItem).toLowerCase().trim();
  }

  // 1. Prioritas Utama: Pencocokan langsung berdasarkan Product ID dari database
  if (exactId && activeProducts.length > 0) {
    const matched = activeProducts.find((p) => p.id === exactId);
    if (matched) {
      return buildResolvedAppData(matched, activeProducts, activeVariants);
    }
  }

  // 2. Query teks utama: Utamakan Name & Brand yang diketik user
  const queryToUse = textQuery || linkQuery;
  if (!queryToUse) return null;

  const cleanQ = queryToUse.replace(/[-_]/g, ' ').trim();

  // 3. Pencocokan ke Database Produk Toko
  if (activeProducts.length > 0) {
    // 3a. Cocok tepat nama produk (Exact match)
    let matched = activeProducts.find((p) => p.name.toLowerCase().trim() === cleanQ);

    // 3b. Cocok slug produk
    if (!matched) {
      const qSlug = cleanQ.replace(/\s+/g, '-');
      matched = activeProducts.find((p) => {
        const pSlug = (p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
        return pSlug === qSlug;
      });
    }

    // 3c. Cocok awalan atau kata utuh (Whole word / prefix match)
    if (!matched) {
      matched = activeProducts.find((p) => {
        const pName = p.name.toLowerCase().trim();
        return (
          pName === cleanQ ||
          pName.startsWith(cleanQ + ' ') ||
          pName.endsWith(' ' + cleanQ) ||
          cleanQ.startsWith(pName + ' ') ||
          cleanQ.endsWith(' ' + pName)
        );
      });
    }

    // 3d. Substring match (dengan memprioritaskan nama produk terpanjang)
    if (!matched) {
      const sortedProds = [...activeProducts].sort((a, b) => b.name.length - a.name.length);
      matched = sortedProds.find((p) => {
        const pName = p.name.toLowerCase().trim();
        return pName.length >= 3 && (cleanQ.includes(pName) || pName.includes(cleanQ));
      });
    }

    if (matched) {
      return buildResolvedAppData(matched, activeProducts, activeVariants);
    }
  }

  // 4. Fallback ke kamus statis
  for (const slug of Object.keys(APP_VARIANTS_DATA)) {
    if (cleanQ === slug || cleanQ.includes(slug) || slug.includes(cleanQ)) {
      return APP_VARIANTS_DATA[slug];
    }
  }

  return null;
}
