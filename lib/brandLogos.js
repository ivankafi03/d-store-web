/**
 * brandLogos.js - Database domain resmi untuk 100% verifikasi logo aplikasi D Store
 * Menggunakan unavatar.io untuk mengambil logo/favicon asli beresolusi tinggi langsung dari domain resmi.
 */

export const BRAND_DOMAINS = {
  // Streaming & Entertainment
  'netflix': 'netflix.com',
  'youtube': 'youtube.com',
  'youtube premium': 'youtube.com',
  'disney+': 'disneyplus.com',
  'disney': 'disneyplus.com',
  'prime video': 'primevideo.com',
  'hbo max': 'max.com',
  'vidio': 'vidio.com',
  'viu': 'viu.com',
  'wetv': 'wetv.vip',
  'iqiyi': 'iq.com',
  'bstation': 'bilibili.tv',
  'crunchyroll': 'crunchyroll.com',
  'apple tv': 'tv.apple.com',
  'catchplay': 'catchplay.com',
  'vision+': 'visionplus.id',
  'mubi': 'mubi.com',
  'iflix': 'iflix.com',
  'drakor.id': 'drakor.id',
  'dramabox': 'dramaboxdb.com',
  'melolo': 'melolo.com',
  'loklok': 'loklok.com',
  'youku': 'youku.com',
  'gagaoolala': 'gagaoolala.com',
  'moviebox': 'movieboxpro.app',

  // Design, Photo & Video Editing
  'canva': 'canva.com',
  'canva pro': 'canva.com',
  'canva bisnis': 'canva.com',
  'capcut': 'capcut.com',
  'picsart': 'picsart.com',
  'alight motion': 'alightmotion.com',
  'adobe': 'adobe.com',
  'lightroom': 'adobe.com',
  'remini': 'remini.ai',
  'meitu': 'meitu.com',
  'wink': 'meitu.com',
  'vsco': 'vsco.co',
  'ibis paint x': 'ibispaint.com',
  'dazzcam': 'dazz.camera',
  'snow': 'snow.me',
  'epik': 'snowcorp.com',
  'scrl': 'scrlapp.com',

  // AI & Productivity
  'chatgpt': 'openai.com',
  'gemini ai': 'google.com',
  'claude': 'anthropic.com',
  'midjourney': 'midjourney.com',
  'perplexity': 'perplexity.ai',
  'quillbot': 'quillbot.com',
  'grammarly': 'grammarly.com',
  'framer': 'framer.com',
  'framer ai': 'framer.com',
  'kapwing': 'kapwing.com',
  'recraft': 'recraft.ai',
  'recraft ai': 'recraft.ai',
  'viggle': 'viggle.ai',
  'viggle ai': 'viggle.ai',
  'google colab': 'colab.google',
  'scispace': 'typeset.io',
  'scispace ai': 'typeset.io',
  'kalodata': 'kalodata.com',

  // Music & Audio
  'spotify': 'spotify.com',
  'apple music': 'music.apple.com',
  'deezer': 'deezer.com',

  // Education & Language
  'duolingo': 'duolingo.com',
  'scribd': 'scribd.com',
  'kahoot': 'kahoot.com',
  'quizlet': 'quizlet.com',
  'kilonotes': 'kilonotes.com',
  'fizzo novel': 'fizzo.org',

  // Office, Accounts & Security
  'microsoft 365': 'microsoft.com',
  'zoom': 'zoom.us',
  'ilovepdf': 'ilovepdf.com',
  'wps': 'wps.com',
  'getcontact': 'getcontact.com',
  'getcontac premium': 'getcontact.com',
  'gmail': 'gmail.com',
  'gmail fresh': 'gmail.com',
  'outlook': 'outlook.com',
  'outlook mail': 'outlook.com',
  'gsuite': 'workspace.google.com',
  'google pro': 'google.com',

  // VPN & Security
  'surfshark vpn': 'surfshark.com',
  'express vpn': 'expressvpn.com',
  'hma vpn': 'hidemyass.com',
  'vpn': 'surfshark.com',
};

/**
 * Mencari URL logo resmi untuk sebuah produk
 * @param {string} productName - Nama produk (misal: "Netflix Premium UHD", "Canva Pro")
 * @returns {string|null} - URL gambar logo resmi atau null jika produk khusus/custom
 */
export function getProductLogoUrl(productName) {
  if (!productName) return null;
  const lower = productName.toLowerCase().trim();

  // 1. Cek pencocokan langsung
  if (BRAND_DOMAINS[lower]) {
    return `https://unavatar.io/${BRAND_DOMAINS[lower]}`;
  }

  // 2. Cek apakah ada kata kunci brand di dalam nama produk
  const keys = Object.keys(BRAND_DOMAINS).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.includes(key)) {
      return `https://unavatar.io/${BRAND_DOMAINS[key]}`;
    }
  }

  return null;
}

/**
 * Format singkatan monogram untuk fallback yang bersih dan elegan jika logo tidak tersedia
 */
export function getProductMonogram(productName) {
  if (!productName) return 'DS';
  const clean = productName.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
