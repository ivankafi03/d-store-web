'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import SmartEdgePanel from '@/app/components/SmartEdgePanel';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ArrowLeft, 
  X, 
  Package, 
  ShieldCheck, 
  MessageCircle, 
  Home, 
  SlidersHorizontal,
  Check,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  Info,
  Layers,
  Cpu,
  Film,
  PenTool,
  Headphones,
  BookOpen,
  Shield,
  Briefcase,
  Users,
  Copy,
  ExternalLink
} from 'lucide-react';
import { resolveCategorySlug } from '@/lib/categories';

function WhatsAppIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

const SORT_OPTIONS = [
  { value: 'cheapest', label: 'Harga Termurah' },
  { value: 'expensive', label: 'Harga Tertinggi' },
  { value: 'az', label: 'Nama A - Z' },
];

const CATEGORY_SHORT_NAMES = {
  'cat_1': 'AI & Tools',
  'cat_2': 'Streaming',
  'cat_3': 'Desain & Video',
  'cat_4': 'Musik',
  'cat_5': 'Edukasi',
  'cat_6': 'VPN',
  'cat_7': 'Office & Akun',
};

const CATEGORY_TABS = [
  { id: 'ALL', name: 'Semua Produk', slug: 'all', icon: Layers },
  { id: 'cat_1', name: 'AI & Tools', slug: 'ai-tools', icon: Cpu },
  { id: 'cat_2', name: 'Streaming', slug: 'streaming', icon: Film },
  { id: 'cat_3', name: 'Desain & Video', slug: 'graphic-design', icon: PenTool },
  { id: 'cat_4', name: 'Musik', slug: 'music-audio', icon: Headphones },
  { id: 'cat_5', name: 'Edukasi', slug: 'edukasi', icon: BookOpen },
  { id: 'cat_6', name: 'VPN', slug: 'vpn-security', icon: Shield },
  { id: 'cat_7', name: 'Office & Akun', slug: 'office-tools', icon: Briefcase },
];

export default function CategoryStoreClient({ 
  initialSlug, 
  initialProducts = [], 
  initialVariants = [], 
  initialCategories = [], 
  initialSettings = {} 
}) {
  const router = useRouter();

  // Hitung initial category dari initialSlug
  const initialCatId = useMemo(() => {
    const resolved = resolveCategorySlug(initialSlug);
    return resolved === 'all' ? 'ALL' : resolved;
  }, [initialSlug]);

  const [selectedCategory, setSelectedCategory] = useState(initialCatId);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('cheapest'); // 'cheapest' | 'expensive' | 'az'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isGroupPanelOpen, setIsGroupPanelOpen] = useState(false);
  const [copiedGroup, setCopiedGroup] = useState(false);

  const handleCopyGroupLink = () => {
    navigator.clipboard?.writeText('https://chat.whatsapp.com/EABjpw4T4om1z4pM5RMLcf');
    setCopiedGroup(true);
    setTimeout(() => setCopiedGroup(false), 2000);
  };
  const sortRef = useRef(null);

  const products = initialProducts || [];
  const variants = initialVariants || [];
  const waNumber = initialSettings?.waNumber || '6281230112240';

  // Kunci scroll body ketika modal terbuka agar tidak ada loncat/rubber-band layar di HP
  useEffect(() => {
    if (isCategoryModalOpen || selectedProduct) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isCategoryModalOpen, selectedProduct]);

  // Tutup dropdown sort saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortOpen]);

  // Map variants to product IDs
  const productVariantsMap = useMemo(() => {
    const map = {};
    for (const v of variants) {
      if (!v.productId) continue;
      if (!map[v.productId]) map[v.productId] = [];
      map[v.productId].push(v);
    }
    // Sort variants by price ascending
    for (const pId in map) {
      map[pId].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    }
    return map;
  }, [variants]);

  // Handler klik tab kategori: update state dan url tanpa reload lambat
  const handleCategorySelect = (tab) => {
    setSelectedCategory(tab.id);
    if (typeof window !== 'undefined') {
      const newPath = tab.slug === 'all' ? '/store/all' : `/store/${tab.slug}`;
      window.history.pushState(null, '', newPath);
    }
  };

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Must have at least 1 variant
      const pVars = productVariantsMap[p.id] || [];
      if (pVars.length === 0) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && p.categoryId !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchBrand = (p.brand || '').toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        const matchVar = pVars.some((v) => (v.name || '').toLowerCase().includes(q));
        if (!matchName && !matchBrand && !matchDesc && !matchVar) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const minA = (productVariantsMap[a.id]?.[0]?.price) || a.price || 0;
      const minB = (productVariantsMap[b.id]?.[0]?.price) || b.price || 0;

      if (sortBy === 'cheapest') {
        return minA - minB;
      } else if (sortBy === 'expensive') {
        return minB - minA;
      } else if (sortBy === 'az') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });
  }, [products, productVariantsMap, selectedCategory, searchTerm, sortBy]);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const handleOpenProduct = (p) => {
    const pVars = productVariantsMap[p.id] || [];
    setSelectedProduct(p);
    setSelectedVariant(pVars[0] || null);
  };

  const handleOrderWhatsApp = () => {
    if (!selectedProduct || !selectedVariant) return;

    const variantName = selectedVariant.name || 'Default';
    const price = formatRupiah(selectedVariant.price || 0);

    const message = `Halo Admin D Store, saya ingin order akun premium legal:\n\n` +
      `*Produk*: ${selectedProduct.name}\n` +
      `*Kategori*: ${CATEGORY_SHORT_NAMES[selectedProduct.categoryId] || 'Layanan Digital'}\n` +
      `*Paket / Varian*: ${variantName}\n` +
      `*Harga*: ${price}\n\n` +
      `Apakah stok paket ini ready dan siap proses? Terima kasih.`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${waNumber}?text=${encoded}`;
    window.open(url, '_blank');
  };

  const currentTabName = CATEGORY_TABS.find(t => t.id === selectedCategory)?.name || 'Katalog Produk';

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 flex flex-col pb-28 md:pb-14">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-13 sm:h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              href="/store"
              className="p-1.5 text-zinc-600 hover:text-zinc-950 rounded-md hover:bg-zinc-100 transition"
              title="Kembali ke Store"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link href="/store" className="flex items-center gap-1.5 group">
              <span className="text-sm sm:text-base font-black tracking-tight text-zinc-950 group-hover:text-black">
                D STORE
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider bg-zinc-900 text-white px-2 py-0.5 rounded-md">
                Katalog
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2" />
        </div>

        {/* Search & Urutkan Berdampingan */}
        <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-2.5 pt-1.5">
          <div className="flex flex-row items-center gap-2 w-full">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari produk (Netflix, ChatGPT, Canva, Spotify...)..."
                className="w-full pl-8.5 pr-8 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 focus:bg-white transition text-zinc-900 placeholder:text-zinc-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="relative shrink-0 flex items-center" ref={sortRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen((prev) => !prev)}
                className="flex items-center gap-1.5 text-xs bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/90 rounded-lg px-2.5 py-2 font-semibold text-zinc-800 focus:outline-none focus:border-zinc-900 transition cursor-pointer select-none shadow-2xs active:scale-98"
                aria-label="Pilih urutan produk"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="text-zinc-900 font-semibold">
                  {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Urutkan'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 shrink-0 ${isSortOpen ? 'rotate-180 text-zinc-900' : ''}`} />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-zinc-200/90 rounded-xl shadow-xl py-1 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 mb-1">
                    Urutkan Berdasarkan
                  </div>
                  {SORT_OPTIONS.map((opt) => {
                    const isActive = sortBy === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSortBy(opt.value);
                          setIsSortOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition cursor-pointer ${
                          isActive
                            ? 'bg-zinc-100 text-zinc-950 font-bold'
                            : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 font-medium'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-zinc-950" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Text Berjalan (Running Text Marquee): Penegasan Bebas Resell */}
          <div className="pt-2 pb-0.5 overflow-hidden select-none">
            <div className="relative overflow-hidden rounded-md bg-zinc-950 text-white py-1 px-2 border border-zinc-900 shadow-2xs">
              <div className="animate-marquee flex items-center gap-6 whitespace-nowrap">
                <div className="flex items-center gap-6 shrink-0 text-[11px] font-medium tracking-wide">
                  <span className="inline-flex items-center px-2 py-0.2 rounded-full bg-emerald-500 text-black font-extrabold text-[9px] uppercase tracking-wider">
                    Bebas Resell
                  </span>
                  <span className="font-bold text-white">
                    Boleh loh kalian jual lagi dengan harga kalian sendiri!
                  </span>
                  <span className="text-zinc-600 font-bold">•</span>
                  <span className="text-zinc-300">
                    Margin keuntungan 100% bebas Anda tentukan
                  </span>
                  <span className="text-zinc-600 font-bold">•</span>
                  <span className="text-zinc-300">
                    Beli satuan tetap dapat harga grosir termurah
                  </span>
                  <span className="text-zinc-600 font-bold">•</span>
                  <span className="text-zinc-300">
                    100% Akun Legal, Resmi &amp; Bergaransi Penuh
                  </span>
                  <span className="text-zinc-600 font-bold">•</span>
                  <span className="text-zinc-300">
                    Proses kilat 5 - 15 menit langsung aktif siap pakai
                  </span>
                  <span className="text-zinc-600 font-bold">•</span>
                  <span className="text-zinc-300">
                    Customer Service siap support 24 jam nonstop
                  </span>
                  <span className="text-zinc-600 font-bold">•</span>
                </div>

                <div className="flex items-center gap-6 shrink-0 text-[11px] font-medium tracking-wide" aria-hidden="true">
                  <span className="inline-flex items-center px-2 py-0.2 rounded-full bg-emerald-500 text-black font-extrabold text-[9px] uppercase tracking-wider">
                    Bebas Resell
                  </span>
                  <span className="font-bold text-white">
                    Boleh loh kalian jual lagi dengan harga kalian sendiri!
                  </span>
                  <span className="text-zinc-600 font-bold">•</span>
                  <span className="text-zinc-300">
                    Margin keuntungan 100% bebas Anda tentukan
                  </span>
                  <span className="text-zinc-600 font-bold">•</span>
                  <span className="text-zinc-300">
                    Beli satuan tetap dapat harga grosir termurah
                  </span>
                  <span className="text-zinc-600 font-bold">•</span>
                  <span className="text-zinc-300">
                    100% Akun Legal, Resmi &amp; Bergaransi Penuh
                  </span>
                  <span className="text-zinc-600 font-bold">•</span>
                  <span className="text-zinc-300">
                    Proses kilat 5 - 15 menit langsung aktif siap pakai
                  </span>
                  <span className="text-zinc-600 font-bold">•</span>
                  <span className="text-zinc-300">
                    Customer Service siap support 24 jam nonstop
                  </span>
                  <span className="text-zinc-600 font-bold">•</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 pt-3.5 w-full flex-1">
        {/* Banner / Info Bar */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xs sm:text-sm font-bold text-zinc-950">
              {currentTabName}
            </h1>
            <span className="text-[10px] text-zinc-600 bg-zinc-200/80 px-2 py-0.5 rounded-md font-semibold">
              {filteredProducts.length} Produk
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Garansi Resmi & Legal</span>
          </div>
        </div>

        {/* Zero State */}
        {filteredProducts.length === 0 && (
          <div className="bg-white border border-dashed border-zinc-300 rounded-lg p-8 text-center my-4">
            <Package className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-zinc-800 mb-1">
              Tidak ada produk yang cocok
            </h3>
            <p className="text-[11px] text-zinc-500 max-w-sm mx-auto mb-3">
              Coba gunakan kata kunci pencarian lain atau pilih kategori yang berbeda.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
              }}
              className="text-xs font-semibold px-3 py-1.5 bg-zinc-900 text-white rounded-md hover:bg-black transition"
            >
              Lihat Semua Produk
            </button>
          </div>
        )}

        {/* Product Cards Grid: SAMA PERSIS DENGAN /produk (TANPA GAMBAR, gap-1.5 sm:gap-2, rounded-lg) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2">
          {filteredProducts.map((prod) => {
            const pVars = productVariantsMap[prod.id] || [];
            const minPrice = pVars[0]?.price || prod.price || 0;
            const categoryName = CATEGORY_SHORT_NAMES[prod.categoryId] || 'Layanan Digital';

            return (
              <div
                key={prod.id}
                onClick={() => handleOpenProduct(prod)}
                className="group bg-white border border-zinc-200 hover:border-zinc-900 active:border-zinc-900 active:scale-[0.985] rounded-lg p-3 sm:p-3.5 transition-all duration-100 shadow-2xs cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: KATEGORI PRODUK & Varian Count */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="inline-block bg-zinc-100 text-zinc-800 border border-zinc-200/80 font-bold text-[9px] tracking-wider px-2 py-0.5 rounded-md uppercase">
                      {categoryName}
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-50 border border-zinc-200/60 px-1.5 py-0.5 rounded-md">
                      {pVars.length} Varian
                    </span>
                  </div>

                  {/* Product Title */}
                  <h3 className="text-sm font-bold text-zinc-950 group-hover:text-black line-clamp-1 leading-snug mb-2">
                    {prod.name}
                  </h3>

                  {/* Variants Preview Chips */}
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {pVars.slice(0, 3).map((v, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-medium text-zinc-600 bg-zinc-50 border border-zinc-200/80 px-1.5 py-0.5 rounded-md"
                      >
                        {v.name.replace(prod.name, '').trim() || v.name}
                      </span>
                    ))}
                    {pVars.length > 3 && (
                      <span className="text-[9px] font-medium text-zinc-400 self-center">
                        +{pVars.length - 3} lainnya
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Price & Pilih Paket Button */}
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-[9px] text-zinc-400 font-medium">
                      Mulai dari
                    </span>
                    <span className="text-xs sm:text-sm font-black text-emerald-600">
                      {formatRupiah(minPrice)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenProduct(prod);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-zinc-900 text-white group-hover:bg-black transition"
                  >
                    <span>Pilih Paket</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal Detail & Pilih Paket - Stabil & Bebas Rubber-Band */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-3 overflow-hidden overscroll-none touch-none animate-in fade-in duration-150"
          onClick={() => setSelectedProduct(null)}
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
            <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-zinc-200 shrink-0">
              <div>
                <span className="inline-block bg-zinc-100 text-zinc-800 border border-zinc-200 font-bold text-[9px] tracking-wider px-2 py-0.5 rounded-md uppercase mb-1">
                  {CATEGORY_SHORT_NAMES[selectedProduct.categoryId] || 'Layanan Digital'}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-zinc-950 leading-snug">
                  {selectedProduct.name}
                </h2>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Garansi Resmi & Legal</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: List of Packages/Variants dengan Scroll Terkunci di Dalam */}
            <div 
              className="py-2.5 overflow-y-auto overscroll-contain space-y-1.5 flex-1 touch-pan-y" 
              style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
            >
              {/* Notice Keterlambatan Update */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200/80 text-[11px] text-zinc-600 mb-2">
                <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>Produk dan varian bisa saja kosong karena keterlambatan update.</span>
              </div>

              <span className="block text-[11px] font-bold text-zinc-800 uppercase tracking-wider mb-1.5">
                Pilih Durasi / Paket
              </span>
              {(productVariantsMap[selectedProduct.id] || []).map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'border-zinc-950 bg-zinc-50'
                        : 'border-zinc-200 hover:border-zinc-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-zinc-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-zinc-900 truncate">
                          {v.name}
                        </span>
                        {v.supplierOffers?.[0]?.note && (
                          <span className="block text-[10px] text-zinc-500 line-clamp-1">
                            {v.supplierOffers[0].note}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-emerald-600">
                        {formatRupiah(v.price)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer: Action */}
            <div className="pt-2.5 border-t border-zinc-200 flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-medium">Total Harga:</span>
                <span className="text-sm font-black text-zinc-950">
                  {formatRupiah(selectedVariant?.price || 0)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleOrderWhatsApp}
                className="w-full py-2.5 px-3 rounded-lg bg-zinc-900 hover:bg-black text-white font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Pesan Sekarang via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Edge Panel (Panel Pintar HP) */}
      <SmartEdgePanel isOpen={isGroupPanelOpen} onToggle={setIsGroupPanelOpen} waNumber={waNumber} />

      {/* Modal Bottom Sheet: Pilih Kategori */}
      {isCategoryModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-3 overflow-hidden overscroll-none touch-none animate-in fade-in duration-150"
          onClick={() => setIsCategoryModalOpen(false)}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div 
            className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl p-4 sm:p-5 h-[76vh] sm:h-auto max-h-[85vh] flex flex-col shadow-2xl overflow-hidden overscroll-contain touch-auto animate-in slide-in-from-bottom-2 duration-150"
            onClick={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {/* Pill drag handle untuk HP */}
            <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto mb-2 shrink-0 sm:hidden" />

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
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List Kategori */}
            <div 
              className="py-2.5 overflow-y-auto overscroll-contain space-y-1.5 flex-1 touch-pan-y"
              style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
            >
              {CATEGORY_TABS.map((tab) => {
                const isSelected = selectedCategory === tab.id;
                const count = tab.id === 'ALL' 
                  ? products.length 
                  : products.filter(p => p.categoryId === tab.id).length;
                const IconComponent = tab.icon;

                return (
                  <div
                    key={tab.id}
                    onClick={() => {
                      handleCategorySelect(tab);
                      setIsCategoryModalOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
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
      )}

      {/* Floating Bottom Navigation Bar (Mobile) */}
      <div className="fixed bottom-3 inset-x-0 mx-auto z-40 w-[88%] max-w-[320px] md:hidden pointer-events-none">
        <div className="rounded-full iphone-glass-bottom-card px-2 py-1 pointer-events-auto overflow-hidden border border-zinc-200/80 bg-white/95 backdrop-blur-md">
          <div className="relative flex items-center justify-around px-0.5">
            <Link
              href="/"
              prefetch={true}
              className="relative flex h-[44px] flex-1 flex-col items-center justify-center gap-y-0.5 cursor-pointer select-none rounded-full text-zinc-600 hover:text-black active:bg-zinc-200/60 active:scale-95 transition-all duration-100 outline-none"
            >
              <Home className="w-5 h-5 text-zinc-600" />
              <span className="text-[10px] leading-tight font-medium text-zinc-600">Home</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="relative flex h-[44px] flex-1 flex-col items-center justify-center gap-y-0.5 cursor-pointer select-none rounded-full text-zinc-600 hover:text-black active:bg-zinc-200/60 active:scale-95 transition-all duration-100 outline-none"
            >
              <SlidersHorizontal className="w-5 h-5 text-zinc-600" />
              <span className="text-[10px] leading-tight font-medium text-zinc-600">Kategori</span>
            </button>

            <Link
              href="/produk"
              prefetch={true}
              className="relative flex h-[44px] flex-1 flex-col items-center justify-center gap-y-0.5 cursor-pointer select-none rounded-full text-zinc-900 hover:text-black active:bg-zinc-200/60 active:scale-95 transition-all duration-100 outline-none"
            >
              <Package className="w-5 h-5 text-zinc-900" />
              <span className="text-[10px] leading-tight font-semibold text-zinc-900">Produk</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
