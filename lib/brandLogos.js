/**
 * brandLogos.js - Database domain resmi untuk 100% verifikasi logo aplikasi D Store
 * Menggunakan Google Favicons Service (sz=128) & Unavatar untuk logo resmi beresolusi tinggi langsung dari web aslinya.
 */

export const BRAND_DOMAINS = {
  // Streaming & Entertainment
  'netflix': 'netflix.com',
  'youtube': 'youtube.com',
  'disney+': 'disneyplus.com',
  'disney': 'disneyplus.com',
  'prime video': 'primevideo.com',
  'prime': 'primevideo.com',
  'hbo max': 'max.com',
  'hbo': 'max.com',
  'vidio': 'vidio.com',
  'viu': 'viu.com',
  'wetv': 'wetv.vip',
  'iqiyi': 'iq.com',
  'bstation': 'bilibili.tv',
  'bilibili': 'bilibili.tv',
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
  'viki rakuten': 'viki.com',
  'viki': 'viki.com',
  'mangotv': 'mgtv.com',
  'dramaku': 'dramaku.id',

  // Design, Photo & Video Editing
  'canva': 'canva.com',
  'capcut': 'capcut.com',
  'picsart': 'picsart.com',
  'alight motion': 'alightmotion.com',
  'alight': 'alightmotion.com',
  'adobe': 'adobe.com',
  'lightroom': 'adobe.com',
  'remini': 'remini.ai',
  'meitu': 'meitu.com',
  'wink': 'meitu.com',
  'vsco': 'vsco.co',
  'ibis paint': 'ibispaint.com',
  'dazzcam': 'dazz.camera',
  'snow': 'snow.me',
  'epik': 'snowcorp.com',
  'scrl': 'scrlapp.com',
  'polar studio': 'polarr.com',
  'polarr': 'polarr.com',

  // AI & Productivity
  'chatgpt': 'openai.com',
  'openai': 'openai.com',
  'gemini ai': 'google.com',
  'gemini': 'google.com',
  'claude': 'anthropic.com',
  'midjourney': 'midjourney.com',
  'perplexity': 'perplexity.ai',
  'quillbot': 'quillbot.com',
  'grammarly': 'grammarly.com',
  'framer': 'framer.com',
  'kapwing': 'kapwing.com',
  'recraft': 'recraft.ai',
  'viggle': 'viggle.ai',
  'google colab': 'colab.google',
  'colab': 'colab.google',
  'scispace': 'typeset.io',
  'kalodata': 'kalodata.com',
  'captions ai': 'captions.ai',
  'captions': 'captions.ai',
  'flux ai': 'blackforestlabs.ai',
  'flux': 'blackforestlabs.ai',
  'hailuo ai': 'hailuoai.video',
  'hailuo': 'hailuoai.video',
  'freedomgpt': 'freedomgpt.com',
  'hyperwrite': 'hyperwriteai.com',
  'magic patterns': 'magicpatterns.com',
  'domo ai': 'domoai.app',
  'domo': 'domoai.app',
  'mootion': 'mootion.com',
  'morphic': 'morphic.sh',
  'aifiesta': 'aifiesta.com',
  'clico': 'clico.ai',
  'creaa': 'creaa.ai',
  'flora': 'flora.ai',
  'genmotions': 'genmotion.ai',
  'magichlight': 'magiclight.ai',
  'myclaw': 'myclaw.ai',
  'oneover': 'oneover.ai',
  'reve': 'reve.ai',
  'supercool': 'supercool.ai',
  'wayin': 'wayin.ai',
  'weshsop': 'weshop.ai',
  'youmind': 'youmind.ai',
  'cuty': 'cuty.ai',
  'seedance': 'seedance.ai',

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
  'fizzo': 'fizzo.org',
  'wibuku': 'wibuku.com',

  // Office, Accounts & Security
  'microsoft 365': 'microsoft.com',
  'microsoft': 'microsoft.com',
  'zoom': 'zoom.us',
  'ilovepdf': 'ilovepdf.com',
  'wps': 'wps.com',
  'getcontact': 'getcontact.com',
  'getcontac': 'getcontact.com',
  'gmail': 'gmail.com',
  'outlook': 'outlook.com',
  'gsuite': 'workspace.google.com',
  'google pro': 'google.com',

  // VPN & Security
  'surfshark': 'surfshark.com',
  'express vpn': 'expressvpn.com',
  'hma vpn': 'hidemyass.com',
  'vpn': 'surfshark.com',
};

/**
 * Mencari domain resmi untuk sebuah nama produk
 */
export function getProductDomain(productName) {
  if (!productName) return null;
  const lower = productName.toLowerCase().trim();

  // 1. Cek exact match
  if (BRAND_DOMAINS[lower]) {
    return BRAND_DOMAINS[lower];
  }

  // 2. Cek apakah ada kata kunci brand di dalam nama produk (dari nama terpanjang ke terpendek)
  const keys = Object.keys(BRAND_DOMAINS).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.includes(key)) {
      return BRAND_DOMAINS[key];
    }
  }

  return null;
}

/**
 * Mencari URL logo resmi untuk sebuah produk
 * Menggunakan Google Favicons Service (sz=128) yang selalu aktif, cepat, dan anti rate-limit.
 * @param {string} productName - Nama produk (misal: "Netflix Premium UHD", "Canva Pro")
 * @returns {string|null} - URL gambar logo resmi atau null jika produk khusus seperti SOURCE CODE
 */
export function getProductLogoUrl(productName) {
  const domain = getProductDomain(productName);
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

/**
 * Cadangan URL via Unavatar jika diperlukan
 */
export function getProductLogoUnavatar(productName) {
  const domain = getProductDomain(productName);
  if (!domain) return null;
  return `https://unavatar.io/${domain}`;
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
