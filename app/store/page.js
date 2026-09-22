'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Zap, 
  ShieldCheck, 
  Clock, 
  MessageCircle, 
  Send, 
  Sparkles, 
  Check, 
  X, 
  Layers, 
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Menu,
  AlertCircle
} from 'lucide-react';

export default function StoreFront() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'ready_only'
  const [selectedVariantOrder, setSelectedVariantOrder] = useState(null); // Modal Order State
  const [copiedLink, setCopiedLink] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor scroll position untuk memunculkan running text reseller di bawah header
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setIsScrolled(window.scrollY > 15);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load katalog aman dari API publik
  const loadKatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/store/products', { cache: 'no-store' });
      const data = await res.json();
      if (data.status === 'ok') {
        setProducts(data.products || []);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Gagal memuat katalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKatalog();
  }, []);

  // Format IDR Rupiah
  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(Number(val) || 0);
  };

  // Filter kata kunci pencarian pintar (termasuk konversi otomatis durasi & alias)
  const searchWords = useMemo(() => {
    if (!searchQuery) return [];
    let q = searchQuery.toLowerCase().trim();
    // Konversi durasi umum Indonesia -> kode durasi internasional (1 bulan -> 1m, 7 hari -> 7d, dst)
    q = q.replace(/(\d+)\s*(?:hari|day|days)\b/gi, '$1d');
    q = q.replace(/(\d+)\s*(?:bulan|bln|month|months)\b/gi, '$1m');
    q = q.replace(/(\d+)\s*(?:tahun|thn|year|years)\b/gi, '$1y');
    q = q.replace(/(\d+)\s*(?:minggu|mgg|week|weeks)\b/gi, '$1w');
    // Alias singkatan populer
    q = q.replace(/\byt\b/gi, 'youtube');
    q = q.replace(/\bgpt\b/gi, 'chatgpt');
    return q.split(/\s+/).filter(Boolean);
  }, [searchQuery]);

  // Hitung jumlah produk per kategori
  const categoryCounts = useMemo(() => {
    const map = { all: products.length };
    products.forEach(p => {
      if (p.categoryId) map[p.categoryId] = (map[p.categoryId] || 0) + 1;
      if (p.categoryName) {
        map[p.categoryName] = (map[p.categoryName] || 0) + 1;
        map[p.categoryName.toLowerCase()] = (map[p.categoryName.toLowerCase()] || 0) + 1;
      }
    });
    return map;
  }, [products]);

  // Produk terfilter untuk pembeli
  const filteredProducts = useMemo(() => {
    return products
      .map(p => {
        // Jika pembeli mengetik di kotak pencarian, otomatis cari ke SELURUH kategori
        const matchCat = searchWords.length > 0 ||
          selectedCategory === 'all' || 
          p.categoryId === selectedCategory || 
          p.categoryName?.toLowerCase() === selectedCategory.toLowerCase() ||
          categories.some(c => c.id === selectedCategory && (
            c.name.toLowerCase() === p.categoryName?.toLowerCase() ||
            c.name.toLowerCase().includes(p.categoryName?.toLowerCase()) ||
            p.categoryName?.toLowerCase().includes(c.name.toLowerCase())
          ));

        if (!matchCat) return null;

        // Cocokkan pencarian nama produk atau variannya
        let matchedVars = p.variants;
        if (searchWords.length > 0) {
          const prodMatches = searchWords.every(w => p.name.toLowerCase().includes(w));
          const specificMatchedVars = p.variants.filter(v => {
            const combined = `${p.name} ${v.name} ${v.cleanName || ''} ${p.categoryName || ''}`.toLowerCase();
            return searchWords.every(w => combined.includes(w));
          });

          if (!prodMatches && specificMatchedVars.length === 0) return null;

          // Jika varian tertentu yang cocok, prioritaskan varian tersebut di urutan teratas
          if (specificMatchedVars.length > 0 && !prodMatches) {
            matchedVars = specificMatchedVars;
          } else if (specificMatchedVars.length > 0 && prodMatches) {
            // Urutkan varian yang cocok spesifik di awal
            const specificIds = new Set(specificMatchedVars.map(v => v.id));
            matchedVars = [
              ...specificMatchedVars,
              ...p.variants.filter(v => !specificIds.has(v.id))
            ];
          }
        }

        // Filter ketersediaan stok
        let vars = matchedVars;
        if (stockFilter === 'ready_only') {
          vars = vars.filter(v => v.isAvailable);
        }

        if (vars.length === 0) return null;

        return { ...p, variants: vars };
      })
      .filter(Boolean);
  }, [products, categories, selectedCategory, searchWords, stockFilter]);

  // Hitung jumlah total varian ready
  const totalReadyVariants = useMemo(() => {
    let count = 0;
    products.forEach(p => {
      p.variants?.forEach(v => {
        if (v.isAvailable) count++;
      });
    });
    return count;
  }, [products]);

  // URL Chat WhatsApp Pemesanan Otomatis
  const getWhatsAppOrderUrl = (prodName, varName, price) => {
    const text = `Halo Admin D Store, saya mau order:\n\nProduk: ${prodName}\nVarian: ${varName}\nHarga: ${formatRupiah(price)}\n\nMohon info nomor rekening / QRIS untuk pembayarannya. Terima kasih!`;
    return `https://wa.me/6281230112240?text=${encodeURIComponent(text)}`;
  };

  // URL Chat Telegram Pemesanan
  const getTelegramOrderUrl = () => {
    return `https://t.me/dewipermata03`;
  };

  const handleShareLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-black font-sans pb-24 sm:pb-20 selection:bg-[#FFE600] selection:text-black">
      
      {/* 1. TOP ANNOUNCEMENT & CONTACT BAR */}
      <div className="bg-black text-[#FFE600] border-b-2 sm:border-b-3 border-black py-1.5 px-3 text-[11px] sm:text-xs font-black uppercase tracking-wider">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="truncate">Buka 08.00 - 23.00 WIB • Garansi Resmi</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-white text-[10px] sm:text-xs font-black">
            <a 
              href="https://wa.me/6281230112240" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-emerald-300 transition"
            >
              WhatsApp
            </a>
            <span className="text-zinc-600">•</span>
            <a 
              href="https://t.me/dewipermata03" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-cyan-300 transition"
            >
              Telegram
            </a>
            <span className="text-zinc-600">•</span>
            <a 
              href="https://t.me/dstore00000" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#FFE600] hover:underline transition"
            >
              Grup
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (NEO-BRUTALIST BRANDING) */}
      <header className="sticky top-0 z-30 bg-[#FFE600] border-b-4 border-black shadow-[0_4px_0_0_#000]">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black border-3 border-black rounded-xl flex items-center justify-center text-yellow-300 shadow-[2px_2px_0_#000] sm:shadow-[3px_3px_0_#000] shrink-0 font-black">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-none text-black">
                  D STORE
                </h1>
                <span className="bg-white text-black px-2 py-0.5 border-2 border-black rounded-md text-[10px] font-black uppercase shadow-[1.5px_1.5px_0_#000]">
                  Official
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-900 font-bold tracking-tight mt-0.5">
                Katalog Akun Digital &amp; Langganan Premium Resmi
              </p>
            </div>
          </div>

          {/* Desktop Header Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareLink}
              className="px-3 py-2 rounded-xl bg-white hover:bg-yellow-50 text-black border-2 border-black shadow-[2px_2px_0_#000] text-xs font-black uppercase tracking-tight flex items-center gap-1.5 cursor-pointer transition"
              title="Salin Tautan Katalog Toko"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Tautan Disalin</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Bagikan</span>
                </>
              )}
            </button>

            <a
              href="https://t.me/dstore00000"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-cyan-300 hover:bg-cyan-200 text-black border-2 border-black shadow-[2px_2px_0_#000] text-xs font-black uppercase tracking-tight flex items-center gap-1.5 cursor-pointer transition"
              title="Gabung Grup Telegram Resmi D Store"
            >
              <Send className="w-4 h-4" />
              <span>Grup Tele</span>
            </a>

            <a
              href="https://wa.me/6281230112240?text=Halo%20Admin%20D%20Store,%20saya%20mau%20tanya%20produk"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black shadow-[2px_2px_0_#000] sm:shadow-[3px_3px_0_#000] text-xs font-black uppercase tracking-tight flex items-center gap-1.5 cursor-pointer transition active:translate-x-0.5 active:translate-y-0.5"
              title="Chat WhatsApp Admin D Store"
            >
              <MessageCircle className="w-4 h-4 fill-black text-emerald-400" />
              <span>Chat Admin</span>
            </a>

            <Link
              href="/reseller"
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-purple-300 hover:bg-purple-200 text-black border-2 border-black shadow-[2px_2px_0_#000] text-xs font-black uppercase tracking-tight flex items-center gap-1.5 cursor-pointer transition"
              title="Mau Jual Lagi Produk Ini? Buka Studio Reseller"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Jual Lagi (Reseller)</span>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="sm:hidden p-2 rounded-xl bg-black text-[#FFE600] border-2 border-black shadow-[2px_2px_0_#000] shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            title="Buka Menu Hamburger"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Hamburger Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-3 pt-3 border-t-2 border-black space-y-2 animate-in slide-in-from-top-2 duration-150 px-4 pb-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-black">
              Menu Toko D Store
            </div>
            <a
              href="https://wa.me/6281230112240?text=Halo%20Admin%20D%20Store,%20saya%20mau%20order"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full neo-btn px-3 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>Chat Admin / Pemesanan</span>
              </span>
              <span className="text-[9px] font-bold text-emerald-950">WA Resmi</span>
            </a>

            <a
              href="https://t.me/dstore00000"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full neo-btn px-3 py-2.5 rounded-xl bg-cyan-300 hover:bg-cyan-200 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                <span>Grup Telegram Resmi</span>
              </span>
              <span className="text-[9px] font-bold text-cyan-950">@dstore00000</span>
            </a>

            <Link
              href="/reseller"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full neo-btn px-3 py-2.5 rounded-xl bg-purple-300 hover:bg-purple-200 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Studio Reseller (Jual Lagi)</span>
              </span>
              <span className="text-[9px] font-bold text-zinc-600">Dropship Mode</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                handleShareLink();
                setMobileMenuOpen(false);
              }}
              className="w-full neo-btn px-3 py-2.5 rounded-xl bg-white hover:bg-yellow-50 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                <span>Bagikan Katalog Toko</span>
              </span>
              <span className="text-[9px] font-bold text-zinc-500">Salin Link</span>
            </button>
          </div>
        )}

        {/* Animated Running Text Banner: Promosi Fitur Reseller (Muncul ketika scroll ke bawah) */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out border-t-2 border-black ${
            isScrolled
              ? 'max-h-12 opacity-100 py-1 sm:py-1.5 bg-black'
              : 'max-h-0 opacity-0 py-0 border-t-0 pointer-events-none'
          }`}
        >
          <Link
            href="/reseller"
            className="flex items-center gap-2 group cursor-pointer"
            title="Buka Fitur Reseller D Store (dstore.sbs/reseller)"
          >
            {/* Tag Badge Tetap di Kiri */}
            <div className="shrink-0 z-10 px-2 sm:px-2.5 py-0.5 bg-[#FFE600] text-black border-r-2 border-black text-[10px] sm:text-xs font-black uppercase tracking-tight flex items-center gap-1 shadow-[2px_0_0_#000]">
              <TrendingUp className="w-3.5 h-3.5 text-black" />
              <span>Jual Lagi</span>
            </div>

            {/* Tulisan Berjalan (Marquee) */}
            <div className="overflow-hidden whitespace-nowrap flex-1">
              <div className="animate-marquee flex items-center gap-8 text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#FFE600] group-hover:text-white transition">
                <span>
                  Bisa jual lagi semua produk ini dengan keuntungan bebas! Bikin poster promosi otomatis &amp; salin format chat WA langsung di Studio Reseller. Klik di sini!
                </span>
                <span className="text-zinc-600">•</span>
                <span>
                  Fitur menarik di dstore.sbs/reseller: Pasang nama tokomu sendiri, atur margin harga suka-suka, dan download poster HD siap posting!
                </span>
                <span className="text-zinc-600">•</span>
                <span>
                  Bisa jual lagi semua produk ini dengan keuntungan bebas! Bikin poster promosi otomatis &amp; salin format chat WA langsung di Studio Reseller. Klik di sini!
                </span>
                <span className="text-zinc-600">•</span>
                <span>
                  Fitur menarik di dstore.sbs/reseller: Pasang nama tokomu sendiri, atur margin harga suka-suka, dan download poster HD siap posting!
                </span>
              </div>
            </div>

            {/* Tombol Aksi di Kanan */}
            <div className="shrink-0 z-10 px-2 sm:px-3 text-[10px] sm:text-xs font-black uppercase text-[#FFE600] group-hover:underline flex items-center gap-1">
              <span className="hidden sm:inline">Buka Reseller</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </header>

      {/* 3. HERO & VALUE PROPOSITIONS */}
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          
          <div className="bg-white p-3 rounded-xl border-3 border-black shadow-[3px_3px_0_#000] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-200 border-2 border-black flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase leading-tight">100% Bergaransi</div>
              <div className="text-[10px] text-zinc-600 font-bold">Klaim Cepat &amp; Aman</div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border-3 border-black shadow-[3px_3px_0_#000] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-200 border-2 border-black flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase leading-tight">Proses 1-5 Menit</div>
              <div className="text-[10px] text-zinc-600 font-bold">Langsung Aktif Digunakan</div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border-3 border-black shadow-[3px_3px_0_#000] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFE600] border-2 border-black flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase leading-tight">Bayar Pakai QRIS</div>
              <div className="text-[10px] text-zinc-600 font-bold">Semua Bank &amp; E-Wallet</div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border-3 border-black shadow-[3px_3px_0_#000] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-200 border-2 border-black flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase leading-tight">Akun Legal &amp; Anti-Hold</div>
              <div className="text-[10px] text-zinc-600 font-bold">Bebas Gangguan</div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. SEARCH & CATEGORY FILTER TOOLBAR */}
      <section className="max-w-6xl mx-auto px-4 py-4 space-y-3">
        
        {/* Search Input Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-zinc-700" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value) setSelectedCategory('all');
            }}
            placeholder="Cari aplikasi atau paket (contoh: Canva, Netflix, Spotify, ChatGPT)..."
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-white border-3 border-black shadow-[4px_4px_0_#000] font-black text-sm text-black placeholder:text-zinc-500 placeholder:font-bold outline-none focus:bg-yellow-50/50 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters: Category Pills & Stock Toggle */}
        <div className="space-y-2.5 pt-1">
          
          {/* Category Horizontal Scroll Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase tracking-tight whitespace-nowrap cursor-pointer transition shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-black text-[#FFE600] shadow-[2px_2px_0_#FFE600]'
                  : 'bg-white hover:bg-yellow-100 text-black shadow-[2px_2px_0_#000]'
              }`}
            >
              Semua Kategori ({products.length})
            </button>

            {categories.map((c) => {
              const count = categoryCounts[c.id] || categoryCounts[c.name] || categoryCounts[c.name.toLowerCase()] || 0;
              const isActive = selectedCategory === c.id || 
                selectedCategory === c.name || 
                selectedCategory.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase tracking-tight whitespace-nowrap cursor-pointer transition shrink-0 ${
                    isActive
                      ? 'bg-black text-[#FFE600] shadow-[2px_2px_0_#FFE600]'
                      : 'bg-white hover:bg-yellow-100 text-black shadow-[2px_2px_0_#000]'
                  }`}
                >
                  {c.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Stock Filter Row: Balanced and properly aligned */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-700">
              Filter Stok:
            </span>
            <div className="inline-flex items-center gap-1 bg-white p-1 rounded-xl border-2 border-black shadow-[2px_2px_0_#000]">
              <button
                type="button"
                onClick={() => setStockFilter('all')}
                className={`px-3 py-1 text-[11px] font-black uppercase rounded-lg transition cursor-pointer ${
                  stockFilter === 'all' ? 'bg-[#FFE600] text-black border border-black shadow-[1px_1px_0_#000]' : 'text-zinc-600 hover:text-black'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('ready_only')}
                className={`px-3 py-1 text-[11px] font-black uppercase rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  stockFilter === 'ready_only' ? 'bg-emerald-400 text-black border border-black shadow-[1px_1px_0_#000]' : 'text-zinc-600 hover:text-black'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-700 shrink-0"></span>
                <span className="whitespace-nowrap">Hanya Ready ({totalReadyVariants})</span>
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* 5. PRODUCT GRID (NEO-BRUTALIST CARDS) */}
      <main className="max-w-6xl mx-auto px-4 py-2 space-y-3">
        {/* Catatan Disclaimer Status Stok */}
        <div className="bg-amber-50 border-2 border-black rounded-xl p-2.5 sm:p-3 shadow-[2.5px_2.5px_0_#000] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-[11px] sm:text-xs font-bold text-zinc-900 leading-snug">
            <span className="font-black uppercase bg-amber-300 text-black px-1.5 py-0.5 rounded border border-black text-[9px] sm:text-[10px] mr-1.5 inline-block">
              Perhatian Stok
            </span>
            Status ketersediaan stok (Ready / Habis) diperbarui secara berkala dan dapat berubah sewaktu-waktu atau berpotensi salah update. Silakan tanyakan dan konfirmasi kepastian ketersediaan ke Admin sebelum memesan.
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3 bg-white border-3 border-black rounded-2xl shadow-[6px_6px_0_#000]">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-black" />
            <div className="font-black uppercase text-sm tracking-wide">Memuat Katalog Toko...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white border-3 border-black rounded-2xl shadow-[6px_6px_0_#000] p-6">
            <ShoppingBag className="w-12 h-12 mx-auto text-zinc-400" />
            <h3 className="font-black uppercase text-base text-black">Produk Tidak Ditemukan</h3>
            <p className="text-xs text-zinc-600 font-bold max-w-md mx-auto">
              Tidak ada produk yang cocok dengan pencarian &quot;{searchQuery}&quot;. Silakan coba kata kunci lain atau hubungi admin untuk request aplikasi.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/6281230112240?text=Halo%20Admin%20D%20Store,%20apakah%20ada%20stok%20untuk:"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFE600] border-2 border-black rounded-xl font-black text-xs uppercase shadow-[2px_2px_0_#000]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Tanya Stok Aplikasi ke Admin</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((prod) => {
              const readyCount = prod.variants.filter(v => v.isAvailable).length;
              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border-3 border-black shadow-[4px_4px_0_#000] flex flex-col justify-between overflow-hidden hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_#000] transition"
                >
                  <div>
                    {/* Header Kartu Produk */}
                    <div className="p-3.5 border-b-2 border-black bg-yellow-50/40">
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-yellow-200 border border-black rounded-md text-black">
                          {prod.categoryName || 'Umum'}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-black ${
                          readyCount > 0 ? 'bg-emerald-100 text-emerald-950' : 'bg-rose-100 text-rose-950'
                        }`}>
                          {readyCount > 0 ? `${readyCount} Ready` : 'Habis'}
                        </span>
                      </div>
                      <h2 className="font-black text-sm sm:text-base text-black uppercase leading-tight tracking-tight line-clamp-1">
                        {prod.name}
                      </h2>
                    </div>

                    {/* Daftar Varian & Harga */}
                    <div className="p-3 space-y-2">
                      {prod.variants.map((v) => {
                        return (
                          <div
                            key={v.id}
                            className={`p-2 rounded-xl border-2 border-black flex items-center justify-between gap-2 transition ${
                              v.isAvailable
                                ? 'bg-[#FAF8F5] hover:bg-yellow-50 shadow-[1.5px_1.5px_0_#000]'
                                : 'bg-zinc-100/70 border-dashed opacity-60'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-black text-xs text-black leading-snug truncate" title={v.name}>
                                {v.cleanName || v.name}
                              </div>
                              <div className="font-mono font-black text-xs text-zinc-900 mt-0.5">
                                {formatRupiah(v.price)}
                              </div>
                            </div>

                            {/* Tombol Aksi Beli */}
                            <div className="shrink-0">
                              {v.isAvailable ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedVariantOrder({
                                    productName: prod.name,
                                    variantName: v.cleanName || v.name,
                                    price: v.price
                                  })}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black font-black text-[11px] uppercase tracking-tight shadow-[1.5px_1.5px_0_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition flex items-center gap-1"
                                >
                                  <span>Beli</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-200 text-rose-950 border border-black line-through">
                                  Habis
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer Ringkas Kartu */}
                  <div className="px-3 pb-3 pt-1 border-t border-zinc-200 flex items-center justify-between text-[10px] font-bold text-zinc-600">
                    <span>Garansi Aktif</span>
                    <span>Proses 1-5 Menit</span>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 6. MODAL ORDER CEPAT PEMBELI (NEO-BRUTALIST MODAL) */}
      {selectedVariantOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0_#000] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 bg-[#FFE600] border-b-3 border-black flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-white border-2 border-black flex items-center justify-center font-black">
                  <Zap className="w-4 h-4 fill-black text-black" />
                </span>
                <h3 className="font-black text-sm uppercase tracking-wide text-black">
                  Konfirmasi Pemesanan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVariantOrder(null)}
                className="w-7 h-7 rounded-lg bg-white hover:bg-zinc-100 border-2 border-black flex items-center justify-center cursor-pointer shadow-[1.5px_1.5px_0_#000]"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              
              {/* Box Rincian Pesanan */}
              <div className="p-3.5 bg-yellow-50 rounded-xl border-2 border-black shadow-[2px_2px_0_#000] space-y-2">
                <div className="text-[10px] font-black uppercase text-zinc-600">Pesanan Anda:</div>
                <div className="text-base font-black uppercase text-black">
                  {selectedVariantOrder.productName}
                </div>
                <div className="flex items-center justify-between border-t border-black/15 pt-2">
                  <span className="text-xs font-bold text-zinc-700">Paket: {selectedVariantOrder.variantName}</span>
                  <span className="font-mono font-black text-sm text-black bg-[#FFE600] px-2 py-0.5 border border-black rounded shadow-[1px_1px_0_#000]">
                    {formatRupiah(selectedVariantOrder.price)}
                  </span>
                </div>
              </div>

              {/* Info Pembayaran & Garansi */}
              <div className="space-y-1.5 text-xs font-bold text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-black">
                <div className="flex items-center gap-1.5 text-black font-black uppercase text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Jaminan Layanan D Store:</span>
                </div>
                <p>• Akun legal, anti-on hold, dan full garansi sesuai masa aktif.</p>
                <p>• Status stok ready/habis dapat berubah sewaktu-waktu atau berpotensi salah update. Admin akan memastikan ketersediaan sebelum pesanan diproses.</p>
                <p>• Pembayaran instan via QRIS (semua bank &amp; e-wallet) atau transfer rekening.</p>
                <p>• Akun langsung dikirimkan oleh admin segera setelah transfer.</p>
              </div>

              {/* Action Buttons: WhatsApp & Telegram */}
              <div className="space-y-2 pt-1">
                <a
                  href={getWhatsAppOrderUrl(
                    selectedVariantOrder.productName,
                    selectedVariantOrder.variantName,
                    selectedVariantOrder.price
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black border-3 border-black shadow-[3px_3px_0_#000] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition active:translate-x-0.5 active:translate-y-0.5"
                >
                  <MessageCircle className="w-4 h-4 fill-black text-emerald-400" />
                  <span>Lanjut Order via WhatsApp</span>
                </a>

                <a
                  href={getTelegramOrderUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-200 hover:bg-cyan-100 text-black border-2 border-black shadow-[2px_2px_0_#000] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Order via Telegram (@dewipermata03)</span>
                </a>

                <a
                  href="https://t.me/dstore00000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-4 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-black border-2 border-black shadow-[2px_2px_0_#000] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition text-center"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gabung Grup Telegram Promo (@dstore00000)</span>
                </a>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 7. FOOTER */}
      <footer className="max-w-6xl mx-auto px-4 mt-12 pt-6 border-t-3 border-black text-center space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-black uppercase tracking-wider text-black">
          <a href="https://wa.me/6281230112240?text=Halo%20Admin,%20saya%20mau%20klaim%20garansi" className="hover:underline">
            Klaim Garansi &amp; Bantuan
          </a>
          <span>•</span>
          <a href="https://t.me/dewipermata03" target="_blank" rel="noopener noreferrer" className="hover:underline">
            Admin: @dewipermata03
          </a>
          <span>•</span>
          <a href="https://t.me/dstore00000" target="_blank" rel="noopener noreferrer" className="hover:underline font-black text-blue-900">
            Grup Tele: @dstore00000
          </a>
          <span>•</span>
          <span>D STORE • Legal &amp; Bergaransi</span>
        </div>
        <p className="text-[11px] text-zinc-600 font-bold">
          Hak Cipta D STORE. Solusi Akun Premium &amp; Layanan Digital Cepat dan Terpercaya.
        </p>
      </footer>

      {/* 8. FIXED MOBILE BOTTOM ACTION BAR (Posisi Tetap di Bawah, Mengunci Navigasi Mobile) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-3 border-black shadow-[0_-3px_0_0_#000] px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          {/* Chat WA */}
          <a
            href="https://wa.me/6281230112240?text=Halo%20Admin%20D%20Store,%20saya%20mau%20order"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black font-black text-[11px] uppercase tracking-tight flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-black text-emerald-400 shrink-0" />
            <span>Chat WA</span>
          </a>

          {/* Grup Tele */}
          <a
            href="https://t.me/dstore00000"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-2.5 rounded-xl bg-cyan-300 hover:bg-cyan-200 text-black border-2 border-black font-black text-[11px] uppercase tracking-tight flex items-center justify-center gap-1 shadow-[1.5px_1.5px_0_#000] active:translate-x-0.5 active:translate-y-0.5 transition shrink-0"
            title="Grup Telegram"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>Grup</span>
          </a>

          {/* Studio Reseller */}
          <Link
            href="/reseller"
            className="flex-1 py-2 px-2 rounded-xl bg-[#FFE600] hover:bg-yellow-300 text-black border-2 border-black font-black text-[11px] uppercase tracking-tight flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
          >
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span>Jual Lagi</span>
          </Link>
        </div>
      </div>

    </div>
  );
}
