'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  X, 
  Search, 
  ChevronRight, 
  LayoutGrid,
  Layers,
  Cpu, 
  Film, 
  PenTool, 
  Headphones, 
  BookOpen, 
  Shield, 
  Briefcase 
} from 'lucide-react';

const CATEGORY_ITEMS = [
  {
    id: 'all',
    name: 'Semua Aplikasi & Akun',
    slug: 'all',
    icon: Layers,
    desc: 'Katalog lengkap 100+ akun premium, AI tools, streaming, desain, VPN dan musik',
    apps: ['Semua Produk', '100+ Aplikasi', 'Katalog Lengkap']
  },
  {
    id: 'ai-tools',
    name: 'AI Tools & Productivity',
    slug: 'ai-tools',
    icon: Cpu,
    desc: 'ChatGPT Plus, Claude Pro, Cursor Pro, Midjourney, Gemini Advanced',
    apps: ['ChatGPT', 'Claude', 'Cursor', 'Gemini', 'Midjourney']
  },
  {
    id: 'streaming',
    name: 'Streaming & Bioskop',
    slug: 'streaming',
    icon: Film,
    desc: 'Netflix 4K Ultra HD, Disney+ Hotstar, Prime Video, Vidio Platinum, Viu',
    apps: ['Netflix', 'Disney+', 'Prime Video', 'Vidio', 'Viu']
  },
  {
    id: 'graphic-design',
    name: 'Desain & Konten Kreator',
    slug: 'graphic-design',
    icon: PenTool,
    desc: 'Canva Pro Edu & Lifetime, CapCut Pro Desktop/Mobile, Picsart, Freepik',
    apps: ['Canva Pro', 'CapCut Pro', 'Picsart', 'Freepik']
  },
  {
    id: 'music-audio',
    name: 'Musik & Audio Hi-Fi',
    slug: 'music-audio',
    icon: Headphones,
    desc: 'Spotify Premium Individual & Family, Apple Music Lossless, Deezer Hi-Fi',
    apps: ['Spotify', 'Apple Music', 'Deezer HiFi']
  },
  {
    id: 'edukasi-bahasa',
    name: 'Edukasi & Bahasa Asing',
    slug: 'edukasi-bahasa',
    icon: BookOpen,
    desc: 'Duolingo Super Unlimited Hearts, Grammarly Premium, Scribd, Quizlet',
    apps: ['Duolingo', 'Grammarly', 'Scribd', 'Quizlet']
  },
  {
    id: 'vpn-security',
    name: 'VPN & Privasi Siber',
    slug: 'vpn-security',
    icon: Shield,
    desc: 'ExpressVPN Ultra Fast, Surfshark VPN Unlimited, WARP+ 1.1.1.1, NordVPN',
    apps: ['ExpressVPN', 'Surfshark', 'NordVPN', 'WARP+']
  },
  {
    id: 'office-tools',
    name: 'Office & Akun Terverifikasi',
    slug: 'office-tools',
    icon: Briefcase,
    desc: 'Microsoft 365 + OneDrive 1TB, Google Workspace, Gmail Fresh PVA',
    apps: ['Microsoft 365', 'Google Workspace', 'Gmail Fresh']
  }
];

export default function CategoriesModal({ isOpen, onClose, onSelectCategory }) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = CATEGORY_ITEMS.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.apps.some((a) => a.toLowerCase().includes(q))
    );
  });

  return (
    <div 
      className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 font-sans"
      onClick={onClose}
    >
      <div 
        className="bg-white text-zinc-900 rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[88vh] flex flex-col shadow-2xl border border-zinc-200 animate-in slide-in-from-bottom duration-250 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Minimalis, Bersih & Elegan */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-xs">
              <LayoutGrid className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-950 tracking-tight">
                Kategori Aplikasi D Store
              </h2>
              <p className="text-[11px] text-zinc-500">
                Pilih kategori untuk melihat katalog akun &amp; lisensi resmi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search inside modal */}
        <div className="p-4 border-b border-zinc-100 bg-white">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kategori atau aplikasi (Netflix, Canva, ChatGPT)..."
              className="w-full bg-zinc-100/80 focus:bg-white text-xs sm:text-sm pl-10 pr-9 py-2.5 rounded-xl border border-transparent focus:border-black outline-none transition placeholder:text-zinc-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Categories List - Satu Warna Monokrom Elegan */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 no-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <p className="text-sm font-semibold">Kategori tidak ditemukan</p>
              <p className="text-xs text-zinc-400 mt-1">Coba kata kunci lain atau lihat semua kategori</p>
            </div>
          ) : (
            filtered.map((cat) => {
              const IconComp = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={`/store/${cat.slug}`}
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(cat);
                    onClose();
                  }}
                  className="flex items-center gap-3.5 p-3 sm:p-3.5 rounded-xl border border-zinc-200/85 bg-white hover:border-zinc-950 hover:shadow-xs active:scale-[0.99] transition cursor-pointer group"
                >
                  {/* Badge Satu Warna Elegan (Matte Black Modern) */}
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:bg-zinc-900 transition">
                    <IconComp className="w-4.5 h-4.5 stroke-[1.9]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold text-zinc-950 group-hover:text-black transition truncate">
                        {cat.name}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
                    </div>
                    <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                      {cat.desc}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {cat.apps.map((app, aIdx) => (
                        <span 
                          key={aIdx} 
                          className="text-[10px] px-2 py-0.5 bg-zinc-100 rounded-md text-zinc-600 font-medium"
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
          <span>Total {filtered.length} Kategori Tersedia</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-zinc-900 hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
