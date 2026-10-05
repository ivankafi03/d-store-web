'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
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
  Lock, 
  User 
} from 'lucide-react';

import { DEFAULT_CATEGORIES, CATEGORY_META, resolveCategorySlug } from '@/lib/categories';
import { getProductLogoUrl, getProductMonogram } from '@/lib/brandLogos';

export default function StoreDevPreview() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  
  // Mega Menu Hover
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const megaMenuTimeoutRef = useRef(null);

  // Modal Detail
  const [activeProductModal, setActiveProductModal] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showQrisInModal, setShowQrisInModal] = useState(false);
  const [showGlobalQris, setShowGlobalQris] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/store/products');
        if (!res.ok) throw new Error('Gagal memuat');
        const data = await res.json();
        setProducts(data.products || []);
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const formatRupiah = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (selectedCategory !== 'all') {
        const matchesId = prod.categoryId === selectedCategory;
        const meta = CATEGORY_META[selectedCategory];
        const matchesMeta = meta && (
          prod.categoryName?.toLowerCase() === meta.name.toLowerCase() ||
          meta.aliases?.some(a => prod.categoryId?.toLowerCase() === a.toLowerCase())
        );
        if (!matchesId && !matchesMeta) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const words = q.split(/\s+/).filter(Boolean);
        const name = (prod.name || '').toLowerCase();
        const cat = (prod.categoryName || '').toLowerCase();
        const desc = (prod.description || '').toLowerCase();
        const vNames = (prod.variants || []).map(v => (v.name || '').toLowerCase()).join(' ');
        const ok = words.every(w => name.includes(w) || cat.includes(w) || desc.includes(w) || vNames.includes(w));
        if (!ok) return false;
      }
      if (stockFilter === 'ready_only') {
        const hasReady = prod.variants && prod.variants.some(v => v.isAvailable);
        if (!hasReady) return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery, stockFilter]);

  const openProductDetail = (prod) => {
    setActiveProductModal(prod);
    setShowQrisInModal(false);
    const first = prod.variants?.find(v => v.isAvailable) || prod.variants?.[0] || null;
    setSelectedVariant(first);
  };

  const getWhatsAppOrderUrl = (pName, vName, price) => {
    const t = encodeURIComponent(
      `Halo Admin D Store, saya ingin order:\n• Produk: ${pName}\n• Paket: ${vName}\n• Harga: ${formatRupiah(price)}`
    );
    return `https://wa.me/6281230112240?text=${t}`;
  };

  // 6 Kategori Editorial Majalah (Persis Screenshot 2 Zalora)
  const categoryTiles = [
    { id: 'cat_2', name: 'STREAMING', label: 'Film, Bioskop & Anime', color: 'from-rose-500 to-red-600', textColor: 'text-yellow-300' },
    { id: 'cat_3', name: 'DESAIN', label: 'Editing Foto, Video & Grafis', color: 'from-amber-600 to-orange-700', textColor: 'text-amber-200' },
    { id: 'cat_1', name: 'AI TOOLS', label: 'Kecerdasan Buatan & Kerja Cerdas', color: 'from-lime-600 to-emerald-700', textColor: 'text-lime-200' },
    { id: 'cat_4', name: 'MUSIK', label: 'Audio HiFi & Podcast', color: 'from-pink-500 to-rose-600', textColor: 'text-pink-200' },
    { id: 'cat_5', name: 'EDUKASI', label: 'Belajar Bahasa & Pengetahuan', color: 'from-sky-500 to-blue-600', textColor: 'text-sky-200' },
    { id: 'cat_7', name: 'OFFICE', label: 'Akun Gmail, Office & Cloud', color: 'from-teal-500 to-cyan-700', textColor: 'text-teal-200' },
  ];

  // 6 Brand Unggulan (Persis Screenshot 3 Zalora)
  const topBrands = [
    { name: 'Netflix', query: 'netflix', label: 'Streaming Film & Serial 4K', bg: 'from-red-950 to-black' },
    { name: 'Canva Pro', query: 'canva', label: 'Desain Grafis & Presentasi', bg: 'from-teal-950 to-black' },
    { name: 'Spotify', query: 'spotify', label: 'Musik & Podcast Bebas Iklan', bg: 'from-emerald-950 to-black' },
    { name: 'ChatGPT', query: 'chatgpt', label: 'AI Plus & GPT-4o Produktif', bg: 'from-zinc-900 to-black' },
    { name: 'YouTube', query: 'youtube', label: 'Premium Bebas Iklan & Music', bg: 'from-rose-950 to-black' },
    { name: 'Disney+', query: 'disney', label: 'Marvel, Disney & Hotstar', bg: 'from-blue-950 to-black' },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-black selection:text-white pb-20">
      
      {/* 1. TOP ANNOUNCEMENT BAR (Persis Screenshot 1) */}
      <div className="bg-[#F8F8F8] text-zinc-700 text-[11px] sm:text-xs py-2 px-4 border-b border-zinc-200">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
            <span className="flex items-center gap-1.5">
              <span className="text-zinc-400">↺</span> Gratis Garansi Penuh | S&amp;K berlaku &gt;
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="text-purple-600 font-bold bg-purple-100 px-1 rounded text-[10px]">VIP</span> D STORE VIP: PROSES 1-5 MENIT &amp; ANTI-HOLD &gt;
            </span>
            <span className="flex items-center gap-1.5 hidden md:inline-flex">
              📱 Bayar QRIS Instan: Semua Bank &amp; E-Wallet &gt;
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-zinc-600 text-[11px]">
            <a href="https://wa.me/6281230112240" target="_blank" rel="noopener noreferrer" className="hover:text-black transition">
              Bantuan WA
            </a>
            <span className="text-zinc-300">•</span>
            <a href="https://t.me/dewipermata03" target="_blank" rel="noopener noreferrer" className="hover:text-black transition">
              Telegram
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Persis Screenshot 1: ZALORA Style Wordmark + Pill Search) */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
        <div className="max-w-[1240px] mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4 lg:gap-8">
          
          <div className="shrink-0 flex items-center select-none cursor-pointer" onClick={() => setSelectedCategory('all')}>
            <span className="font-extrabold text-2xl sm:text-3xl text-black tracking-[0.25em] uppercase leading-none font-sans">
              D STORE
            </span>
          </div>

          {/* Search Input dengan Black Circle Button di Kanan (Persis Screenshot 1) */}
          <div className="flex-1 max-w-2xl relative hidden md:block">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk, tren, dan merek..."
                className="w-full pl-5 pr-12 py-2.5 text-xs sm:text-sm bg-white hover:bg-zinc-50 focus:bg-white border border-zinc-300 focus:border-black rounded-full outline-none transition text-zinc-900 placeholder:text-zinc-400 font-normal"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-12 text-zinc-400 hover:text-black p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button 
                type="button"
                className="absolute right-1.5 w-8 h-8 rounded-full bg-black hover:bg-zinc-800 text-white flex items-center justify-center shrink-0"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Icon Kanan */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <a 
              href="https://wa.me/6281230112240"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-2 text-xs font-semibold text-zinc-800 hover:text-black transition"
            >
              <User className="w-4.5 h-4.5 text-zinc-700" />
              <span>Bantuan / Order</span>
            </a>

            <button
              type="button"
              onClick={() => setShowGlobalQris(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 hover:text-black transition cursor-pointer"
            >
              <QrCode className="w-4.5 h-4.5 text-zinc-700" />
              <span className="hidden sm:inline">QRIS</span>
            </button>

            <Link
              href="/reseller"
              className="flex items-center gap-1 text-xs font-semibold text-zinc-800 hover:text-black transition"
            >
              <TrendingUp className="w-4.5 h-4.5 text-purple-600" />
              <span className="hidden sm:inline">Reseller</span>
            </Link>

            <div className="relative p-1 text-zinc-800">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {products.length}
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar Mobile */}
        <div className="px-4 pb-2.5 md:hidden max-w-[1240px] mx-auto">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk, tren, dan merek..."
              className="w-full pl-4 pr-11 py-2 text-xs bg-white border border-zinc-300 focus:border-black rounded-full outline-none transition text-zinc-900 placeholder:text-zinc-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-10 text-zinc-400 hover:text-black p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button 
              type="button"
              className="absolute right-1 w-7 h-7 rounded-full bg-black text-white flex items-center justify-center"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. TABS MENU & MEGA MENU HOVER (Persis Screenshot 1 & 5) */}
        <div 
          className="border-t border-zinc-150 relative bg-white" 
          onMouseLeave={() => {
            megaMenuTimeoutRef.current = setTimeout(() => setActiveMegaMenu(null), 200);
          }}
        >
          <div className="max-w-[1240px] mx-auto px-4 flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap border-b-2 ${
                selectedCategory === 'all'
                  ? 'border-black text-black'
                  : 'border-transparent text-zinc-700 hover:text-black'
              }`}
            >
              SEMUA
            </button>

            {categories.map((c) => {
              const isActive = selectedCategory === c.id;
              return (
                <div
                  key={c.id}
                  className="relative"
                  onMouseEnter={() => {
                    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
                    setActiveMegaMenu(c.id);
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(c.id)}
                    className={`py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap border-b-2 flex items-center gap-1 ${
                      isActive || activeMegaMenu === c.id
                        ? 'border-black text-black'
                        : 'border-transparent text-zinc-700 hover:text-black'
                    }`}
                  >
                    <span>{c.name.split('&')[0].trim()}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* MEGA MENU DROPDOWN (Persis Screenshot 5) */}
          {activeMegaMenu && (
            <div 
              className="absolute left-0 right-0 top-full bg-white border-b border-zinc-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              onMouseEnter={() => {
                if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
              }}
              onMouseLeave={() => {
                megaMenuTimeoutRef.current = setTimeout(() => setActiveMegaMenu(null), 200);
              }}
            >
              <div className="max-w-[1240px] mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-3">
                  <div className="font-bold text-sm text-black pb-2 border-b border-zinc-100 flex items-center justify-between">
                    <span>Kategori Terkait</span>
                    <button 
                      onClick={() => { setSelectedCategory(activeMegaMenu); setActiveMegaMenu(null); }}
                      className="text-xs text-blue-600 hover:underline font-normal cursor-pointer"
                    >
                      Lihat Semua
                    </button>
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-600 font-medium">
                    <li 
                      onClick={() => { setSelectedCategory(activeMegaMenu); setActiveMegaMenu(null); }}
                      className="hover:text-black cursor-pointer font-bold text-black"
                    >
                      • Semua Produk {CATEGORY_META[activeMegaMenu]?.name || ''}
                    </li>
                    <li className="hover:text-black cursor-pointer">Paket Langganan 1 Bulan</li>
                    <li className="hover:text-black cursor-pointer">Paket Privat Akun Pribadi</li>
                    <li className="hover:text-black cursor-pointer">Paket Sharing Hemat Bergaransi</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="font-bold text-sm text-black pb-2 border-b border-zinc-100">
                    Brand Paling Top
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-700 font-medium">
                    {(CATEGORY_META[activeMegaMenu]?.popular || ['Netflix', 'Canva', 'Spotify', 'ChatGPT']).map((b, idx) => (
                      <li 
                        key={idx}
                        onClick={() => { setSearchQuery(b); setActiveMegaMenu(null); }}
                        className="hover:text-black hover:font-bold cursor-pointer transition flex items-center justify-between"
                      >
                        <span>{b}</span>
                        <ChevronRight className="w-3 h-3 text-zinc-400" />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="font-bold text-xs uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-100">
                    SHOP BY BRANDS
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(CATEGORY_META[activeMegaMenu]?.popular || ['Netflix', 'Canva', 'Spotify', 'ChatGPT', 'YouTube', 'Disney+']).slice(0, 6).map((b, idx) => {
                      const logo = getProductLogoUrl(b);
                      return (
                        <div
                          key={idx}
                          onClick={() => { setSearchQuery(b); setActiveMegaMenu(null); }}
                          className="bg-[#F8F8F8] hover:bg-zinc-100 p-3 rounded-xl border border-zinc-200 flex flex-col items-center justify-center text-center cursor-pointer transition group"
                        >
                          {logo ? (
                            <img src={logo} alt={b} className="w-10 h-10 object-contain mb-1.5 group-hover:scale-105 transition" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-black text-white font-bold flex items-center justify-center text-xs mb-1.5">
                              {b.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="text-[11px] font-bold text-zinc-800 line-clamp-1">{b}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 4. ISI BODY ZALORA (Persis Screenshot 1, 2, 3, 4) */}
      <div className="max-w-[1240px] mx-auto px-4 space-y-12 pt-6">

        {/* 4 Pilar Kepercayaan */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 sm:p-4 rounded-[16px] border border-zinc-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 leading-tight">100% Bergaransi</div>
              <div className="text-[11px] text-zinc-500 font-medium">Klaim Cepat &amp; Aman</div>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-[16px] border border-zinc-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
              <Clock className="w-4.5 h-4.5 text-sky-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 leading-tight">Proses 1-5 Menit</div>
              <div className="text-[11px] text-zinc-500 font-medium">Langsung Aktif Digunakan</div>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-[16px] border border-zinc-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <Zap className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 leading-tight">Bayar Pakai QRIS</div>
              <div className="text-[11px] text-zinc-500 font-medium">Semua Bank &amp; E-Wallet</div>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-[16px] border border-zinc-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
              <Lock className="w-4.5 h-4.5 text-purple-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 leading-tight">Akun Legal &amp; Anti-Hold</div>
              <div className="text-[11px] text-zinc-500 font-medium">Bebas Gangguan</div>
            </div>
          </div>
        </section>

        {/* Section: "Select a Category to Get Started" (Persis Screenshot 2) */}
        <section className="space-y-4">
          <div className="text-center py-1">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#142C3C] tracking-wide">
              Select a Category to Get Started
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
            {categoryTiles.map((tile) => (
              <div
                key={tile.id}
                onClick={() => setSelectedCategory(tile.id)}
                className={`relative rounded-[22px] overflow-hidden aspect-[4/5] bg-gradient-to-b ${tile.color} shadow-md cursor-pointer group hover:scale-[1.02] transition-transform duration-200 flex flex-col justify-between p-5`}
              >
                <div>
                  <span className={`text-xl sm:text-2xl font-black uppercase tracking-wider ${tile.textColor}`}>
                    {tile.name}
                  </span>
                  <p className="text-xs text-white/90 font-medium mt-1">
                    {tile.label}
                  </p>
                </div>
                <div className="flex items-center justify-between text-white text-xs font-bold pt-4 border-t border-white/20">
                  <span>Lihat Produk</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: "Top Brands on D STORE" (Persis Screenshot 3) */}
        <section className="space-y-4">
          <div className="bg-[#FBECE6] py-3.5 px-6 rounded-[16px] text-center">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#142C3C] tracking-wide">
              Top Brands on D STORE
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
            {topBrands.map((brand, idx) => {
              const logo = getProductLogoUrl(brand.name);
              return (
                <div
                  key={idx}
                  onClick={() => setSearchQuery(brand.query)}
                  className={`relative rounded-[22px] overflow-hidden aspect-square bg-gradient-to-br ${brand.bg} shadow-md cursor-pointer group hover:scale-[1.02] transition-transform duration-200 flex items-center justify-center p-6 border border-zinc-900/50`}
                >
                  <div className="flex flex-col items-center justify-center text-center space-y-3 z-10">
                    {logo ? (
                      <img 
                        src={logo} 
                        alt={brand.name} 
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-200" 
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-white text-black font-extrabold text-2xl flex items-center justify-center shadow-lg">
                        {brand.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-white font-extrabold text-base sm:text-lg tracking-widest uppercase">
                      {brand.name}
                    </span>
                    <span className="text-[11px] text-zinc-300 font-medium line-clamp-1">
                      {brand.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Katalog Produk Lengkap (Grid Zalora) */}
        <section className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-black tracking-tight">
                {selectedCategory === 'all' ? 'Semua Produk Aplikasi' : CATEGORY_META[selectedCategory]?.name || 'Katalog'}
              </h2>
              <div className="text-xs text-zinc-500 font-medium mt-0.5">
                Menampilkan <span className="font-bold text-black">{filteredProducts.length} Produk</span>
                {searchQuery && <span> untuk &quot;{searchQuery}&quot;</span>}
              </div>
            </div>

            <div className="inline-flex items-center gap-1 bg-[#F5F5F5] p-1 rounded-full text-xs font-medium">
              <button
                type="button"
                onClick={() => setStockFilter('all')}
                className={`px-3.5 py-1 rounded-full transition cursor-pointer ${
                  stockFilter === 'all' ? 'bg-white text-black font-bold shadow-xs' : 'text-zinc-600 hover:text-black'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('ready_only')}
                className={`px-3.5 py-1 rounded-full transition flex items-center gap-1.5 cursor-pointer ${
                  stockFilter === 'ready_only' ? 'bg-emerald-500 text-white font-bold shadow-xs' : 'text-zinc-600 hover:text-black'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span>Hanya Ready</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center space-y-3">
              <RefreshCw className="w-7 h-7 animate-spin mx-auto text-zinc-400" />
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Memuat Katalog...</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {filteredProducts.map((prod) => {
                const ready = prod.variants?.some(v => v.isAvailable);
                const minPrice = Math.min(...(prod.variants?.map(v => v.price) || [0]));
                const logoUrl = getProductLogoUrl(prod.name);
                const monogram = getProductMonogram(prod.name);

                return (
                  <div
                    key={prod.id}
                    onClick={() => openProductDetail(prod)}
                    className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(50,50,50,0.08)] border border-zinc-150 overflow-hidden flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition duration-200 cursor-pointer group"
                  >
                    <div className="aspect-square bg-[#F8F8F8] p-6 sm:p-7 flex items-center justify-center relative overflow-hidden group-hover:bg-[#F2F2F2] transition-colors">
                      <div className="absolute top-2.5 left-2.5 z-10">
                        {ready ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] sm:text-[10px] font-bold flex items-center gap-1 border border-emerald-200/80 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Ready</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-600 text-[9px] sm:text-[10px] font-medium border border-zinc-300">
                            Habis
                          </span>
                        )}
                      </div>

                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={prod.name}
                          loading="lazy"
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xs group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-extrabold text-xl tracking-wider shadow-sm">
                          {monogram}
                        </div>
                      )}

                      <div className="absolute bottom-2.5 right-2.5 text-[9px] sm:text-[10px] font-semibold text-zinc-400">
                        100% Garansi
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 gap-2">
                      <div>
                        <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 truncate">
                          {prod.categoryName || 'Aplikasi'}
                        </div>
                        <h3 className="font-medium text-xs sm:text-sm text-zinc-800 leading-snug line-clamp-2 mt-0.5 min-h-[34px] sm:min-h-[40px] group-hover:text-black transition-colors">
                          {prod.name}
                        </h3>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-zinc-400 font-medium">Mulai</div>
                          <div className="font-bold text-xs sm:text-sm text-black font-mono">
                            {formatRupiah(minPrice)}
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {prod.variants?.length || 0} paket
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Section: Partner, Pembayaran & Keamanan (Persis Screenshot 4) */}
        <section className="pt-10 border-t border-zinc-200">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-xs text-zinc-700">
            <div className="space-y-2">
              <div className="font-bold text-zinc-900 uppercase tracking-wider text-[11px]">A company by</div>
              <div className="font-black text-base text-black tracking-widest">D STORE</div>
              <p className="text-[11px] text-zinc-500">Penyedia Lisensi Digital &amp; Akun Premium Resmi Bergaransi.</p>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-zinc-900 uppercase tracking-wider text-[11px]">Wilayah Layanan</div>
              <div className="flex items-center gap-2 text-base">
                <span>🇮🇩</span><span>🇲🇾</span><span>🇸🇬</span>
              </div>
              <p className="text-[11px] text-zinc-500">Melayani transaksi cepat di seluruh Indonesia &amp; Asia Tenggara.</p>
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <div className="font-bold text-zinc-900 uppercase tracking-wider text-[11px]">Pembayaran</div>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-zinc-800">
                <span className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-200">QRIS</span>
                <span className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-200">BCA</span>
                <span className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-200">Mandiri</span>
                <span className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-200">BRI</span>
                <span className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-200">BNI</span>
                <span className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-200">GoPay</span>
                <span className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-200">DANA</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-zinc-900 uppercase tracking-wider text-[11px]">Pengiriman Akun</div>
              <div className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instan 1-5 Menit</span>
              </div>
              <p className="text-[11px] text-zinc-500">Kredensial dikirimkan langsung melalui WhatsApp &amp; Telegram resmi.</p>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-zinc-900 uppercase tracking-wider text-[11px]">SISTEM KEAMANAN</div>
              <ul className="space-y-1 text-[11px] text-zinc-600">
                <li className="flex items-center gap-1 text-emerald-700 font-semibold">✔ 100% Legal &amp; Bergaransi</li>
                <li className="flex items-center gap-1 text-emerald-700 font-semibold">✔ Anti-Hold Protection</li>
                <li className="flex items-center gap-1 text-emerald-700 font-semibold">✔ Enkripsi Transaksi Aman</li>
              </ul>
            </div>
          </div>
        </section>

      </div>

      {/* Footer Hitam Zalora (Persis Screenshot 4) */}
      <footer className="bg-black text-white mt-16 pt-12 pb-8 border-t border-zinc-800">
        <div className="max-w-[1240px] mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-zinc-800">
          <div className="space-y-3">
            <div className="font-black text-2xl text-white tracking-[0.2em] uppercase">D STORE</div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Platform akun digital dan lisensi resmi terpercaya di Indonesia. Proses cepat, garansi penuh, dan jaminan keamanan akun.
            </p>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-white">LAYANAN</div>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><a href="https://wa.me/6281230112240" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Pusat Bantuan WhatsApp</a></li>
              <li><button onClick={() => setShowGlobalQris(true)} className="hover:text-white transition text-left">Konfirmasi Pembayaran QRIS</button></li>
              <li><a href="https://wa.me/6281230112240" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Klaim Garansi Cepat</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-white">TENTANG KAMI</div>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><button onClick={() => setSelectedCategory('all')} className="hover:text-white transition">Katalog Semua Produk</button></li>
              <li><Link href="/reseller" className="hover:text-white transition">Bergabung Reseller D Store</Link></li>
              <li><a href="https://t.me/dewipermata03" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Telegram Resmi @dewipermata03</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-white">OPERASIONAL</div>
            <p className="text-xs text-zinc-400">Buka Setiap Hari: 08.00 - 23.00 WIB</p>
            <div className="pt-2">
              <a
                href="https://wa.me/6281230112240"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-bold text-xs hover:bg-zinc-200 transition"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Chat Admin WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-[1240px] mx-auto px-4 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
          <p>© 2026 D STORE OFFICIAL. Seluruh Hak Cipta Dilindungi.</p>
          <p className="text-[11px]">Designed in Zalora Clean Aesthetic Standard.</p>
        </div>
      </footer>

      {/* Modal Detail Produk */}
      {activeProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="w-full max-w-lg bg-white sm:rounded-[24px] rounded-t-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-zinc-150 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#F8F8F8] p-2 flex items-center justify-center border border-zinc-200 shrink-0">
                  {getProductLogoUrl(activeProductModal.name) ? (
                    <img src={getProductLogoUrl(activeProductModal.name)} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-bold text-sm text-zinc-800">{getProductMonogram(activeProductModal.name)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-zinc-950 leading-tight">{activeProductModal.name}</h3>
                  <div className="text-[11px] text-zinc-500 font-medium mt-0.5 flex items-center gap-1.5">
                    <span>{activeProductModal.categoryName || 'Aplikasi'}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" /> 100% Bergaransi Resmi
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveProductModal(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <div className="text-xs font-bold text-zinc-900 mb-2.5">Pilih Paket:</div>
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
                            <div className="font-bold text-xs text-zinc-900 truncate">{v.cleanName || v.name}</div>
                            <div className="text-[11px] text-zinc-500 font-medium">Garansi penuh selama masa aktif</div>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="font-extrabold text-xs sm:text-sm text-zinc-950 font-mono">{formatRupiah(v.price)}</div>
                          {!v.isAvailable && <div className="text-[10px] text-rose-600 font-semibold">Stok Habis</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-zinc-150 bg-white shrink-0">
              {selectedVariant ? (
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    <div className="text-[10px] text-zinc-500 font-medium">Total Harga:</div>
                    <div className="font-bold text-base sm:text-lg text-black font-mono leading-tight">
                      {formatRupiah(selectedVariant.price)}
                    </div>
                  </div>
                  <a
                    href={getWhatsAppOrderUrl(activeProductModal.name, selectedVariant.cleanName || selectedVariant.name, selectedVariant.price)}
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
                <div className="py-2 text-center text-xs font-semibold text-zinc-400">Silakan pilih paket terlebih dahulu</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global QRIS Modal */}
      {showGlobalQris && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
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
              Bisa dibayar via BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, ShopeePay.
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

    </div>
  );
}
