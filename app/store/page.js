'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Search, 
  Zap, 
  ShieldCheck, 
  Clock, 
  MessageCircle, 
  X, 
  RefreshCw,
  ShoppingBag,
  ChevronRight,
  TrendingUp,
  QrCode,
  Download,
  ArrowRight,
  CheckCircle2,
  Lock
} from 'lucide-react';

import { DEFAULT_CATEGORIES, CATEGORY_META, resolveCategorySlug } from '@/lib/categories';
import { getProductLogoUrl, getProductMonogram } from '@/lib/brandLogos';

export default function StoreFront({ initialCategorySlug = null }) {
  const router = useRouter();
  const pathname = usePathname();

  const initialCatId = useMemo(() => {
    if (initialCategorySlug) {
      return resolveCategorySlug(initialCategorySlug);
    }
    return 'all';
  }, [initialCategorySlug]);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCatId);
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'ready_only'
  
  // Modal / Bottom Sheet Detail Produk
  const [activeProductModal, setActiveProductModal] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showQrisInModal, setShowQrisInModal] = useState(false);
  const [showGlobalQris, setShowGlobalQris] = useState(false);

  // Sinkronisasi kategori ketika slug URL berubah
  useEffect(() => {
    if (initialCategorySlug) {
      const resolved = resolveCategorySlug(initialCategorySlug);
      setSelectedCategory(resolved);
    } else if (pathname === '/store') {
      setSelectedCategory('all');
    }
  }, [initialCategorySlug, pathname]);

  // Fetch katalog produk publik dari API
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/store/products', { cache: 'no-store' });
        if (!res.ok) throw new Error('Gagal memuat katalog');
        const data = await res.json();
        setProducts(data.products || []);
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // Format Rupiah
  const formatRupiah = (num) => {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  };

  // Navigasi Kategori (Zalora Tab Style)
  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      router.push('/store', { scroll: false });
    } else {
      const meta = CATEGORY_META[catId];
      if (meta && meta.slug) {
        router.push(`/store/${meta.slug}`, { scroll: false });
      }
    }
  };

  // Filter Produk berdasarkan Kategori, Search & Stok
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // 1. Filter Kategori
      if (selectedCategory !== 'all') {
        const matchesId = prod.categoryId === selectedCategory;
        const meta = CATEGORY_META[selectedCategory];
        const matchesMeta = meta && (
          prod.categoryName?.toLowerCase() === meta.name.toLowerCase() ||
          meta.aliases?.some(a => prod.categoryId?.toLowerCase() === a.toLowerCase())
        );
        if (!matchesId && !matchesMeta) return false;
      }

      // 2. Filter Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const words = q.split(/\s+/).filter(Boolean);
        const name = (prod.name || '').toLowerCase();
        const cat = (prod.categoryName || '').toLowerCase();
        const desc = (prod.description || '').toLowerCase();
        const variantNames = (prod.variants || []).map(v => (v.name || '').toLowerCase()).join(' ');
        
        const matchesAllWords = words.every(w => 
          name.includes(w) || cat.includes(w) || desc.includes(w) || variantNames.includes(w)
        );
        if (!matchesAllWords) return false;
      }

      // 3. Filter Stok Ready
      if (stockFilter === 'ready_only') {
        const hasReady = prod.variants && prod.variants.some(v => v.isAvailable);
        if (!hasReady) return false;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery, stockFilter]);

  // Hitung jumlah produk per kategori
  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
      if (p.categoryName) {
        counts[p.categoryName] = (counts[p.categoryName] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Buka Modal Detail Produk
  const openProductDetail = (prod) => {
    setActiveProductModal(prod);
    setShowQrisInModal(false);
    const firstReady = prod.variants?.find(v => v.isAvailable) || prod.variants?.[0] || null;
    setSelectedVariant(firstReady);
  };

  // URL Order WhatsApp
  const getWhatsAppOrderUrl = (productName, variantName, price) => {
    const text = encodeURIComponent(
      `Halo Admin D Store, saya ingin memesan:\n\n` +
      `• Produk: ${productName}\n` +
      `• Paket: ${variantName}\n` +
      `• Harga: ${formatRupiah(price)}\n\n` +
      `Mohon info ketersediaan stok & nomor rekening/QRIS untuk pembayaran. Terima kasih!`
    );
    return `https://wa.me/6281230112240?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-black selection:text-white pb-24 sm:pb-20">
      
      {/* SVG Filter untuk Efek Ombak Air Halus D STORE */}
      <svg width="0" height="0" className="absolute pointer-events-none" style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="water-wave" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.012 0.05" 
              numOctaves="1" 
              result="noise" 
              seed="3"
            >
              <animate 
                attributeName="baseFrequency" 
                dur="4.5s" 
                keyTimes="0; 0.5; 1" 
                values="0.010 0.045; 0.014 0.070; 0.010 0.045" 
                repeatCount="indefinite" 
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      
      {/* 1. TOP ANNOUNCEMENT RIBBON (ZALORA STYLE SLIM ANNOUNCEMENT) */}
      <div className="bg-black text-white text-[11px] sm:text-xs py-2 px-4 tracking-wide border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 truncate text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="truncate">⚡ Proses 1-5 Menit • 100% Garansi Resmi • Pembayaran QRIS Instan</span>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-xs font-medium text-zinc-300">
            <a href="https://wa.me/6281230112240" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              Bantuan WA
            </a>
            <span className="text-zinc-600">•</span>
            <a href="https://t.me/dewipermata03" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              Telegram
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (CLEAN ZALORA LOGO & PILL SEARCH) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Zalora Style Wordmark Logo */}
          <Link href="/store" className="flex items-center gap-2 shrink-0 group">
            <div className="font-black text-xl sm:text-2xl text-black tracking-[0.12em] uppercase leading-none select-none">
              D STORE
            </div>
          </Link>

          {/* Search Bar Tengah (Zalora Clean Pill) */}
          <div className="flex-1 max-w-xl relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Canva, Netflix, ChatGPT, Spotify, CapCut..."
              className="w-full pl-10 pr-9 py-2 text-sm bg-zinc-100/80 hover:bg-zinc-100 focus:bg-white border border-transparent focus:border-zinc-300 rounded-full outline-none transition text-zinc-900 placeholder:text-zinc-400 font-normal"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Buttons Kanan */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGlobalQris(true)}
              className="px-3 py-1.5 rounded-full border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-xs font-semibold text-zinc-800 flex items-center gap-1.5 transition cursor-pointer"
              title="Scan QRIS Toko"
            >
              <QrCode className="w-3.5 h-3.5 text-zinc-700" />
              <span className="hidden sm:inline">QRIS</span>
            </button>

            <a
              href="https://wa.me/6281230112240?text=Halo%20Admin%20D%20Store,%20saya%20mau%20tanya%20stok"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-full bg-black hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Chat WA</span>
            </a>

            <Link
              href="/reseller"
              className="px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center gap-1 transition"
              title="Reseller Studio"
            >
              <TrendingUp className="w-3.5 h-3.5 text-zinc-600" />
              <span className="hidden md:inline">Reseller</span>
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar (Khusus layar kecil di bawah logo) */}
        <div className="px-4 pb-2.5 md:hidden">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Canva, Netflix, ChatGPT, Spotify..."
              className="w-full pl-10 pr-9 py-2 text-xs bg-zinc-100 hover:bg-zinc-100 focus:bg-white border border-transparent focus:border-zinc-300 rounded-full outline-none transition text-zinc-900 placeholder:text-zinc-400 font-normal"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 3. CATEGORY TABS HORIZONTAL (ZALORA SIGNATURE SEGMENT TABS) */}
        <div className="border-t border-zinc-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar py-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200'
              }`}
            >
              Semua ({products.length})
            </button>

            {categories.map((c) => {
              const count = categoryCounts[c.id] || categoryCounts[c.name] || 0;
              const isActive = selectedCategory === c.id || selectedCategory === c.name;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCategory(c.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-zinc-700 text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* 4. HERO SECTION: WAVY "D STORE" LIQUID BANNER (MEWAH GRADIENT HITAM-KUNING) */}
      <section className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6 pb-2 space-y-4">
        <div className="relative rounded-2xl sm:rounded-3xl p-8 sm:p-14 text-center overflow-hidden border border-black/20 shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-gradient-to-br from-black via-[#141208] to-[#3A3005]">
          {/* Ambient Glow Emas Lembut di Sudut */}
          <div className="absolute -top-16 -left-16 w-56 h-56 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-yellow-400/25 rounded-full blur-3xl pointer-events-none"></div>

          {/* Teks Wavy D STORE Bergelombang Ombak Air - Font Putih Ramping & Proporsional */}
          <div className="py-2 sm:py-3 select-none">
            <h1 
              style={{ filter: 'url(#water-wave)', letterSpacing: '0.22em' }} 
              className="text-4xl sm:text-6xl md:text-7xl font-semibold uppercase text-white inline-block drop-shadow-[0_2px_14px_rgba(255,255,255,0.25)]"
            >
              D STORE
            </h1>
          </div>
        </div>

        {/* 4 Value Proposition Cards Bersih di Bawah Banner (Sesuai Permintaan Spesifik User) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-zinc-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:border-zinc-300 transition flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 leading-tight">100% Bergaransi</div>
              <div className="text-[11px] text-zinc-500 font-medium mt-0.5">Klaim Cepat &amp; Aman</div>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-zinc-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:border-zinc-300 transition flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
              <Clock className="w-4.5 h-4.5 text-sky-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 leading-tight">Proses 1-5 Menit</div>
              <div className="text-[11px] text-zinc-500 font-medium mt-0.5">Langsung Aktif Digunakan</div>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-zinc-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:border-zinc-300 transition flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <Zap className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 leading-tight">Bayar Pakai QRIS</div>
              <div className="text-[11px] text-zinc-500 font-medium mt-0.5">Semua Bank &amp; E-Wallet</div>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-zinc-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:border-zinc-300 transition flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
              <Lock className="w-4.5 h-4.5 text-purple-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 leading-tight">Akun Legal &amp; Anti-Hold</div>
              <div className="text-[11px] text-zinc-500 font-medium mt-0.5">Bebas Gangguan</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TOOLBAR SUB-FILTER & COUNTER (ZALORA STYLE) */}
      <section className="max-w-7xl mx-auto px-4 pt-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div className="text-xs font-semibold text-zinc-600">
            Menampilkan <span className="font-bold text-black">{filteredProducts.length} Produk</span>
            {searchQuery && <span> untuk pencarian &quot;{searchQuery}&quot;</span>}
          </div>

          {/* Filter Stok Pill */}
          <div className="inline-flex items-center gap-1 bg-zinc-100 p-1 rounded-full text-xs font-medium">
            <button
              type="button"
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1 rounded-full transition cursor-pointer ${
                stockFilter === 'all' ? 'bg-white text-black font-bold shadow-xs' : 'text-zinc-600 hover:text-black'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('ready_only')}
              className={`px-3 py-1 rounded-full transition flex items-center gap-1.5 cursor-pointer ${
                stockFilter === 'ready_only' ? 'bg-emerald-500 text-white font-bold shadow-xs' : 'text-zinc-600 hover:text-black'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              <span>Hanya Ready</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6. MAIN CATALOG GRID (ZALORA AUTHENTIC PRODUCT CARD GRID) */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto text-zinc-400" />
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Memuat Katalog Toko...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white border border-zinc-200 rounded-2xl p-8 max-w-md mx-auto space-y-3">
            <ShoppingBag className="w-10 h-10 mx-auto text-zinc-300" />
            <h3 className="font-bold text-sm text-black">Produk Tidak Ditemukan</h3>
            <p className="text-xs text-zinc-500">
              Tidak ada produk yang cocok dengan pencarian Anda. Silakan hubungi admin untuk menanyakan aplikasi yang Anda butuhkan.
            </p>
            <a
              href="https://wa.me/6281230112240?text=Halo%20Admin%20D%20Store,%20apakah%20ada%20stok%20untuk:"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-zinc-800 transition"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tanya Stok Aplikasi</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4.5">
            {filteredProducts.map((prod) => {
              const readyCount = prod.variants?.filter(v => v.isAvailable).length || 0;
              const minPrice = Math.min(...(prod.variants?.map(v => v.price) || [0]));
              const logoUrl = getProductLogoUrl(prod.name);
              const monogram = getProductMonogram(prod.name);

              return (
                <div
                  key={prod.id}
                  onClick={() => openProductDetail(prod)}
                  className="bg-white rounded-2xl border border-zinc-200/70 overflow-hidden hover:border-zinc-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
                >
                  {/* Image Box (Rasio 1:1, Latar Bersih #F7F7F8 khas Zalora) */}
                  <div className="aspect-square bg-[#F7F7F8] p-5 sm:p-6 flex items-center justify-center relative overflow-hidden group-hover:bg-[#F2F2F4] transition-colors">
                    
                    {/* Badge Ready / Habis di Sudut Kiri Atas */}
                    <div className="absolute top-2 left-2 z-10">
                      {readyCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] sm:text-[10px] font-bold flex items-center gap-1 border border-emerald-200/80 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Ready</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-200/80 text-zinc-600 text-[9px] sm:text-[10px] font-medium border border-zinc-300">
                          Habis
                        </span>
                      )}
                    </div>

                    {/* Logo Resmi Aplikasi (Jernih 128px dari sumber domain resmi) */}
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={`Logo ${prod.name}`}
                        loading="lazy"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xs group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}

                    {/* Fallback Monogram Bersih Elegan untuk produk developer / custom */}
                    <div className={`${logoUrl ? 'hidden' : ''} w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-extrabold text-xl tracking-wider shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                      {monogram}
                    </div>

                    {/* Badge Garansi di Kanan Bawah */}
                    <div className="absolute bottom-2 right-2 text-[10px] font-semibold text-zinc-400 group-hover:text-zinc-600 transition">
                      Bergaransi
                    </div>
                  </div>

                  {/* Konten Bawah Kartu (Typography Zalora) */}
                  <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 gap-2.5">
                    <div>
                      {/* Kategori */}
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 truncate">
                        {prod.categoryName || 'Aplikasi'}
                      </div>

                      {/* Nama Produk */}
                      <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 leading-snug line-clamp-2 mt-0.5 min-h-[32px] sm:min-h-[40px] group-hover:text-black transition-colors" title={prod.name}>
                        {prod.name}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 flex flex-col gap-2">
                      {/* Harga & Jumlah Varian */}
                      <div className="flex items-baseline justify-between gap-1">
                        <div>
                          <span className="text-[10px] text-zinc-400 font-medium">Mulai </span>
                          <span className="font-bold text-xs sm:text-sm text-zinc-950 font-mono">
                            {formatRupiah(minPrice)}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-medium whitespace-nowrap">
                          {prod.variants?.length || 0} paket
                        </span>
                      </div>

                      {/* Tombol Pilih Paket (Zalora Style Sleek Button) */}
                      <button
                        type="button"
                        className="w-full py-2 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-semibold tracking-wide transition flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <span>Pilih Paket</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 7. PRODUCT DETAIL MODAL / BOTTOM SHEET (ZALORA SELECTION SHEET) */}
      {activeProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div 
            className="w-full max-w-lg bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[85vh] animate-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#F7F7F8] p-2 flex items-center justify-center border border-zinc-200 shrink-0">
                  {getProductLogoUrl(activeProductModal.name) ? (
                    <img 
                      src={getProductLogoUrl(activeProductModal.name)} 
                      alt="" 
                      className="w-full h-full object-contain" 
                    />
                  ) : (
                    <span className="font-bold text-sm text-zinc-800">
                      {getProductMonogram(activeProductModal.name)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-zinc-950 leading-tight">
                    {activeProductModal.name}
                  </h3>
                  <div className="text-[11px] text-zinc-500 font-medium mt-0.5 flex items-center gap-1.5">
                    <span>{activeProductModal.categoryName || 'Aplikasi'}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                      100% Bergaransi Resmi
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveProductModal(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Modal: Pilihan Durasi & Paket */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 overscroll-contain">
              <div>
                <div className="text-xs font-bold text-zinc-900 mb-2.5">
                  Pilih Paket / Masa Aktif:
                </div>

                <div className="space-y-2">
                  {activeProductModal.variants?.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => v.isAvailable && setSelectedVariant(v)}
                        className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                          !v.isAvailable
                            ? 'opacity-50 border-dashed border-zinc-200 bg-zinc-50 cursor-not-allowed'
                            : isSelected
                              ? 'border-black bg-zinc-50 ring-1 ring-black shadow-xs'
                              : 'border-zinc-200 hover:border-zinc-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-black bg-black' : 'border-zinc-300 bg-white'
                          }`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-xs text-zinc-900 truncate">
                              {v.cleanName || v.name}
                            </div>
                            <div className="text-[11px] text-zinc-500 font-medium">
                              Garansi penuh selama masa aktif
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="font-extrabold text-xs sm:text-sm text-zinc-950 font-mono">
                            {formatRupiah(v.price)}
                          </div>
                          {!v.isAvailable && (
                            <div className="text-[10px] text-rose-600 font-semibold">Stok Habis</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Box Jaminan & QRIS Info */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-600 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-zinc-900">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Layanan Resmi D Store</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQrisInModal(prev => !prev)}
                    className="text-xs text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{showQrisInModal ? 'Tutup QRIS' : 'Lihat QRIS'}</span>
                  </button>
                </div>
                <p>• Akun legal, anti-on hold, dan diproses 1-5 menit setelah pembayaran.</p>
                <p>• Garansi ganti baru jika terjadi kendala selama masa aktif.</p>

                {/* Tampilan QRIS jika di-toggle */}
                {showQrisInModal && (
                  <div className="pt-2 border-t border-zinc-200 mt-2 space-y-2 text-center">
                    <div className="w-36 h-36 mx-auto bg-white p-1 border border-zinc-300 rounded-xl shadow-xs">
                      <img src="/qris.png" alt="QRIS D Store" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-[11px] font-semibold text-zinc-700">
                      Scan QRIS via BCA, Mandiri, BRI, GoPay, OVO, DANA, ShopeePay
                    </div>
                    <a
                      href="/qris.png"
                      download="QRIS_DStore.png"
                      className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 bg-zinc-200 hover:bg-zinc-300 rounded-lg text-black transition"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download QRIS</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Modal: Tombol Checkout WhatsApp */}
            <div className="p-4 sm:p-5 border-t border-zinc-100 bg-white shrink-0">
              {selectedVariant ? (
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    <div className="text-[10px] text-zinc-500 font-medium">Total Harga:</div>
                    <div className="font-bold text-base sm:text-lg text-black font-mono leading-tight">
                      {formatRupiah(selectedVariant.price)}
                    </div>
                  </div>

                  <a
                    href={getWhatsAppOrderUrl(
                      activeProductModal.name,
                      selectedVariant.cleanName || selectedVariant.name,
                      selectedVariant.price
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition shadow-md"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Pesan via WhatsApp</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </a>
                </div>
              ) : (
                <div className="py-2 text-center text-xs font-semibold text-zinc-400">
                  Silakan pilih paket terlebih dahulu
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL GLOBAL QRIS TOKO */}
      {showGlobalQris && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 text-center space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-zinc-900">
                <QrCode className="w-4 h-4 text-black" />
                <span>QRIS Resmi D Store</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGlobalQris(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-48 h-48 mx-auto bg-white p-2 border border-zinc-200 rounded-xl shadow-xs">
              <img src="/qris.png" alt="QRIS D Store" className="w-full h-full object-contain" />
            </div>

            <p className="text-xs text-zinc-600 leading-snug">
              Bisa dibayar menggunakan seluruh aplikasi Mobile Banking (BCA, Mandiri, BRI, BNI) &amp; E-Wallet (GoPay, OVO, DANA, ShopeePay).
            </p>

            <a
              href="/qris.png"
              download="QRIS_DStore.png"
              className="w-full py-2.5 rounded-xl bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-zinc-800 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Simpan Gambar QRIS</span>
            </a>
          </div>
        </div>
      )}

      {/* 9. FOOTER BERSIH MINIMALIS ALA ZALORA */}
      <footer className="max-w-7xl mx-auto px-4 mt-20 pt-10 pb-6 border-t border-zinc-200 text-center space-y-4">
        <div className="flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider text-black">
          <span>D STORE OFFICIAL</span>
          <span className="text-zinc-400">•</span>
          <span className="text-zinc-600 normal-case font-medium">Pusat Akun Digital &amp; Lisensi Premium Resmi Bergaransi</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-600">
          <a href="https://wa.me/6281230112240" target="_blank" rel="noopener noreferrer" className="hover:text-black transition">
            WhatsApp Admin
          </a>
          <span>•</span>
          <a href="https://t.me/dewipermata03" target="_blank" rel="noopener noreferrer" className="hover:text-black transition">
            Telegram (@dewipermata03)
          </a>
          <span>•</span>
          <Link href="/reseller" className="hover:text-black transition">
            Studio Reseller
          </Link>
        </div>

        <p className="text-[11px] text-zinc-400">
          © 2026 D STORE. Semua hak cipta dilindungi undang-undang.
        </p>
      </footer>

    </div>
  );
}
