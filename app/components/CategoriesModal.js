'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Check,
  Layers,
  Cpu, 
  Film, 
  PenTool, 
  Headphones, 
  BookOpen, 
  Shield, 
  Briefcase 
} from 'lucide-react';
import bundledCatalog from '@/data/public-catalog.json';

const CATEGORY_ITEMS = [
  { id: 'ALL', name: 'Semua Produk', slug: 'all', href: '/store/all', icon: Layers },
  { id: 'cat_1', name: 'AI & Tools', slug: 'ai-tools', href: '/store/ai-tools', icon: Cpu },
  { id: 'cat_2', name: 'Streaming', slug: 'streaming', href: '/store/streaming', icon: Film },
  { id: 'cat_3', name: 'Desain & Video', slug: 'graphic-design', href: '/store/graphic-design', icon: PenTool },
  { id: 'cat_4', name: 'Musik', slug: 'music-audio', href: '/store/music-audio', icon: Headphones },
  { id: 'cat_5', name: 'Edukasi', slug: 'edukasi', href: '/store/edukasi', icon: BookOpen },
  { id: 'cat_6', name: 'VPN', slug: 'vpn-security', href: '/store/vpn-security', icon: Shield },
  { id: 'cat_7', name: 'Office & Akun', slug: 'office-tools', href: '/store/office-tools', icon: Briefcase },
];

export default function CategoriesModal({ 
  isOpen, 
  onClose, 
  activeCategory = 'ALL', 
  onSelectCategory 
}) {
  const router = useRouter();

  // Kunci scroll body saat modal aktif agar layar tidak memantul / loncat di HP
  useEffect(() => {
    if (isOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const products = bundledCatalog?.products || [];

  const getProductCount = (catId) => {
    if (catId === 'ALL') return products.length;
    return products.filter((p) => p.categoryId === catId).length;
  };

  const handleSelect = (item) => {
    if (onSelectCategory) {
      onSelectCategory(item);
    }
    onClose();
    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-3 overflow-hidden overscroll-none touch-none animate-in fade-in duration-150 font-sans"
      onClick={onClose}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl p-4 sm:p-5 h-[76vh] sm:h-auto max-h-[85vh] flex flex-col shadow-2xl overflow-hidden overscroll-contain touch-auto animate-in slide-in-from-bottom-2 duration-150"
        onClick={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Pill drag handle untuk HP */}
        <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto mb-2 shrink-0 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 shrink-0">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-950">
              Pilih Kategori Produk
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Saring katalog berdasarkan kategori akun digital
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List Kategori dengan Scroll Terisolasi */}
        <div 
          className="py-2.5 overflow-y-auto overscroll-contain space-y-1.5 flex-1 touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
        >
          {CATEGORY_ITEMS.map((tab) => {
            const isSelected = activeCategory === tab.id || activeCategory === tab.slug;
            const count = getProductCount(tab.id);
            const IconComponent = tab.icon;

            return (
              <div
                key={tab.id}
                onClick={() => handleSelect(tab)}
                className={`p-3 rounded-lg border transition cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-zinc-950 bg-zinc-900 text-white shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-400 bg-white text-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs sm:text-sm font-bold truncate">
                      {tab.name}
                    </span>
                    <span className={`block text-[10px] ${isSelected ? 'text-zinc-300' : 'text-zinc-400'}`}>
                      {count} Produk Tersedia
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-white text-zinc-950 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
