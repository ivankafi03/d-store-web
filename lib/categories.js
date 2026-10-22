import { 
  Layers,
  Cpu, 
  Film, 
  PenTool, 
  Headphones, 
  BookOpen, 
  Shield, 
  Briefcase 
} from 'lucide-react';

export const DEFAULT_CATEGORIES = [
  { id: 'cat_1', name: 'AI Tools & Productivity' },
  { id: 'cat_2', name: 'Streaming & Entertainment' },
  { id: 'cat_3', name: 'Graphic, Design & Video' },
  { id: 'cat_4', name: 'Music & Audio' },
  { id: 'cat_5', name: 'Edukasi & Bahasa' },
  { id: 'cat_6', name: 'VPN & Security' },
  { id: 'cat_7', name: 'Office, Akun & Tools' }
];

export const CATEGORY_META = {
  all: {
    name: 'Semua Aplikasi & Akun Premium',
    slug: 'all',
    aliases: ['all', 'semua', 'katalog', 'all-apps', 'semua-aplikasi'],
    icon: Layers,
    bgIcon: 'bg-zinc-950 text-white',
    hoverBorder: 'hover:border-zinc-950',
    popular: ['ChatGPT Plus', 'Netflix Premium', 'Spotify Premium', 'Canva Pro', 'YouTube Premium'],
    desc: 'Katalog lengkap semua akun premium, AI tools, streaming, desain grafis, musik, VPN dan lisensi resmi di D Store.'
  },
  cat_1: {
    name: 'AI Tools & Productivity',
    slug: 'ai&productivity',
    aliases: ['ai-tools', 'ai-tools-productivity', 'ai&productivity', 'ai', 'ai-productivity', 'cat_1'],
    icon: Cpu,
    bgIcon: 'bg-zinc-950 text-white',
    hoverBorder: 'hover:border-zinc-950',
    popular: ['ChatGPT Plus', 'Cursor Pro', 'Gemini AI', 'Perplexity Pro', 'Midjourney', 'Quillbot'],
    desc: 'Langganan ChatGPT Plus, Cursor Pro, Gemini, Perplexity Pro, Midjourney & AI cerdas produktivitas kerja.'
  },
  cat_2: {
    name: 'Streaming & Entertainment',
    slug: 'streaming&entertainment',
    aliases: ['streaming', 'streaming-entertainment', 'streaming&entertainment', 'entertainment', 'cat_2'],
    icon: Film,
    bgIcon: 'bg-zinc-950 text-white',
    hoverBorder: 'hover:border-zinc-950',
    popular: ['Netflix Premium', 'YouTube Premium', 'Disney+', 'Vidio Platinum', 'Viu Premium'],
    desc: 'Nonton film, serial & video tanpa iklan: Netflix, YouTube Premium, Disney+, Vidio, Apple TV & Bioskop.'
  },
  cat_3: {
    name: 'Graphic, Design & Video',
    slug: 'graphic&design',
    aliases: ['graphic-design', 'graphic-design-video', 'graphic&design', 'design', 'cat_3'],
    icon: PenTool,
    bgIcon: 'bg-zinc-950 text-white',
    hoverBorder: 'hover:border-zinc-950',
    popular: ['Canva Pro', 'CapCut Pro', 'Picsart Gold', 'Freepik Premium', 'Alight Motion'],
    desc: 'Tools desain grafis & editing video: Canva Pro, CapCut Pro, Picsart, Freepik & template premium.'
  },
  cat_4: {
    name: 'Music & Audio',
    slug: 'music&audio',
    aliases: ['music&audio', 'music-audio', 'music', 'cat_4'],
    icon: Headphones,
    bgIcon: 'bg-zinc-950 text-white',
    hoverBorder: 'hover:border-zinc-950',
    popular: ['Spotify Premium', 'Apple Music', 'Deezer HiFi'],
    desc: 'Dengarkan jutaan lagu bebas iklan kualitas tertinggi di Spotify Premium, Apple Music & Deezer HiFi.'
  },
  cat_5: {
    name: 'Edukasi & Bahasa',
    slug: 'edukasi&bahasa',
    aliases: ['edukasi-bahasa', 'edukasi&bahasa', 'edukasi', 'education', 'cat_5'],
    icon: BookOpen,
    bgIcon: 'bg-zinc-950 text-white',
    hoverBorder: 'hover:border-zinc-950',
    popular: ['Duolingo Super', 'Grammarly Premium', 'Scribd', 'Quizlet Plus'],
    desc: 'Tingkatkan skill belajar & bahasa asing: Duolingo Super, Grammarly Premium, Scribd & Quizlet Plus.'
  },
  cat_6: {
    name: 'VPN & Security',
    slug: 'vpn&security',
    aliases: ['vpn-security', 'vpn&security', 'vpn', 'cat_6'],
    icon: Shield,
    bgIcon: 'bg-zinc-950 text-white',
    hoverBorder: 'hover:border-zinc-950',
    popular: ['ExpressVPN', 'Surfshark VPN', 'WARP+ 1.1.1.1', 'NordVPN'],
    desc: 'Internet bebas sensor, aman dan privat berkecepatan tinggi: ExpressVPN, Surfshark & WARP+ 1.1.1.1.'
  },
  cat_7: {
    name: 'Office, Akun & Tools',
    slug: 'office&tools',
    aliases: ['office-tools', 'office&tools', 'office-akun-tools', 'office', 'cat_7'],
    icon: Briefcase,
    bgIcon: 'bg-zinc-950 text-white',
    hoverBorder: 'hover:border-zinc-950',
    popular: ['Gmail Fresh', 'Google Workspace', 'Microsoft 365', 'Outlook', 'Notion'],
    desc: 'Akun Gmail Fresh terverifikasi, Google Workspace, Microsoft 365 & kebutuhan perkantoran resmi.'
  }
};

export function resolveCategorySlug(slug) {
  if (!slug) return 'all';
  const clean = decodeURIComponent(slug).toLowerCase().trim();
  for (const [catId, meta] of Object.entries(CATEGORY_META)) {
    if (catId === clean || meta.slug === clean || meta.aliases.includes(clean)) {
      return catId;
    }
  }
  return 'all';
}
