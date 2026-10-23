'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  SlidersHorizontal,
  X,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  Home,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { 
  ZALORA_TOP_TIER_PRODUCTS, 
  ZALORA_JUST_FOR_YOU_PRODUCTS, 
  ZALORA_PRODUCTS,
  ZALORA_MEN_CATEGORIES 
} from '@/lib/zaloraMenData';
import { getAppVariantData } from '@/lib/appVariantsData';
import UserAvatar from '@/app/components/UserAvatar';
import CartModal from '@/app/components/CartModal';
import AccountModal from '@/app/components/AccountModal';
import CategoriesModal from '@/app/components/CategoriesModal';
import AppVariantModal from '@/app/components/AppVariantModal';
import { useUserAuth } from '@/lib/useUserAuth';

function MorphingTopBar({ onOpenSearch, activeSegment, onSelectSegment, onOpenCart, cartCount = 0 }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = (window.scrollY || document.documentElement.scrollTop) > 30;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-2.5 sm:top-3 inset-x-0 z-50 pointer-events-none">
      <div className="max-w-[1240px] mx-auto px-3 sm:px-4">
        <div 
          className={`gpu-morph-bar flex items-center h-[48px] pointer-events-auto transition-[width] duration-200 ${
            isScrolled ? 'w-full gpu-morph-bar--expanded' : 'w-[46px] gpu-morph-bar--collapsed'
          }`}
        >
          {/* 1. Search Icon Button (Fixed 46px, anchored on left) */}
          <button 
            type="button"
            onClick={onOpenSearch}
            className="w-[46px] h-[46px] shrink-0 flex items-center justify-center cursor-pointer active:scale-95 transition-transform text-[#262626]" 
            aria-label="Open search" 
            data-test-id="segment-tab-search-icon"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
              <path fillRule="evenodd" clipRule="evenodd" d="M10.5 19a8.5 8.5 0 116.342-2.84l5.017 5.017a.482.482 0 11-.683.682l-5.016-5.017A8.469 8.469 0 0110.5 19zm0-.944a7.556 7.556 0 100-15.112 7.556 7.556 0 000 15.112z" fill="#262626"></path>
            </svg>
          </button>

          {/* 2. Segment Tabs (Revealed by GPU clip-path, instant 60/120fps) */}
          <div 
            id="segmentTabWithSearch" 
            className={`flex items-center flex-row overflow-x-auto no-scrollbar scrollbar-hide py-1 pr-1 transition-opacity duration-200 flex-1 min-w-0 ${
              isScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {[
              { id: 'all', name: 'Semua App', href: '/store/all' },
              { id: 'ai', name: 'AI & Tools', href: '/store/ai-tools' },
              { id: 'stream', name: 'Streaming', href: '/store/streaming' },
              { id: 'design', name: 'Desain', href: '/store/graphic-design' },
              { id: 'music', name: 'Musik', href: '/store/music-audio' },
              { id: 'vpn', name: 'VPN', href: '/store/vpn-security' },
              { id: 'office', name: 'Office & Akun', href: '/store/office-tools' }
            ].map((seg) => {
              const isActive = activeSegment === seg.id;
              if (isActive) {
                return (
                  <span 
                    key={seg.id}
                    data-test-id={`segment-tab-${seg.id}`} 
                    className="cursor-default bg-[#222222] text-white font-bold mr-2 whitespace-nowrap rounded-xl px-4 py-2 no-underline select-none inline-flex items-center justify-center text-sm shadow-[0_2px_8px_rgba(0,0,0,0.15)] shrink-0"
                  >
                    {seg.name}
                  </span>
                );
              }
              return (
                <Link 
                  key={seg.id}
                  data-test-id={`segment-tab-${seg.id}`} 
                  href={seg.href}
                  onClick={() => {
                    if (onSelectSegment) onSelectSegment(seg.id);
                  }}
                  className="bg-white/85 text-[#222222] font-medium mr-2 whitespace-nowrap rounded-xl px-4 py-2 no-underline cursor-pointer select-none inline-flex items-center justify-center text-sm border border-white/60 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:bg-white active:scale-95 transition shrink-0" 
                >
                  {seg.name}
                </Link>
              );
            })}
          </div>

          {/* 3. Cart Icon Button (Anchored on right) */}
          <button 
            type="button"
            onClick={onOpenCart}
            className="w-[46px] h-[46px] shrink-0 flex items-center justify-center cursor-pointer active:scale-95 transition-transform text-[#262626] relative ml-auto" 
            aria-label="Buka Tas Belanja"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-black text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WishlistClient({ initialProducts = [], initialVariants = [] }) {
  const router = useRouter();
  const { user, loginWithGoogle, logout, updateProfile } = useUserAuth();

  const [wishlist, setWishlist] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('d_store_wishlist');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [cart, setCart] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('d_store_cart');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [selectedAppModal, setSelectedAppModal] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSeoText, setShowSeoText] = useState(false);
  const [activeSegment, setActiveSegment] = useState('all');
  const desktopSearchRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('d_store_wishlist', JSON.stringify(wishlist));
      } catch (e) {}
    }
  }, [wishlist]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('d_store_cart', JSON.stringify(cart));
      } catch (e) {}
    }
  }, [cart]);

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => {
      const updated = prev.filter((id) => id !== productId);
      showNotification('Dihapus dari Wishlist');
      return updated;
    });
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === item.id);
      let updated;
      if (existingIdx > -1) {
        updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: (updated[existingIdx].quantity || 1) + (item.quantity || 1)
        };
      } else {
        updated = [...prev, item];
      }
      showNotification('Dimasukkan ke Tas Belanja');
      return updated;
    });
  };

  const formatRupiah = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

  // Kumpulkan seluruh data produk katalog
  const allCatalogProducts = useMemo(() => {
    const list = [
      ...ZALORA_TOP_TIER_PRODUCTS,
      ...ZALORA_JUST_FOR_YOU_PRODUCTS,
      ...ZALORA_PRODUCTS,
      ...initialProducts
    ];
    const seen = new Set();
    const unique = [];
    for (const p of list) {
      const key = p.sku || p.id || p.name;
      if (key && !seen.has(key)) {
        seen.add(key);
        unique.push(p);
      }
    }
    return unique;
  }, [initialProducts]);

  // Live Search Results
  const searchResults = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return [];
    return allCatalogProducts
      .filter((p) => {
        const name = (p.name || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        return name.includes(q) || brand.includes(q);
      })
      .slice(0, 10);
  }, [searchQuery, allCatalogProducts]);

  // Filter produk yang ada di wishlist
  const wishlistItems = useMemo(() => {
    if (!wishlist || wishlist.length === 0) return [];
    return wishlist.map((skuOrId) => {
      const found = allCatalogProducts.find(
        (p) => p.sku === skuOrId || p.id === skuOrId || (p.name && p.name.toLowerCase() === String(skuOrId).toLowerCase())
      );
      if (found) return found;
      return {
        id: skuOrId,
        sku: skuOrId,
        name: typeof skuOrId === 'string' ? skuOrId.replace(/[-_]/g, ' ') : 'Aplikasi Premium',
        brand: 'D STORE',
        price: 'Rp 15.000',
        image: '/images/products/chatgpt.png'
      };
    });
  }, [wishlist, allCatalogProducts]);

  const handleProductClick = (item) => {
    const app = getAppVariantData(item, initialProducts, initialVariants);
    if (app) {
      setSelectedAppModal(app);
      return;
    }
    if (item.link && item.link.startsWith('/store/app')) {
      router.push(item.link);
      return;
    }
    setSelectedAppModal({
      id: item.sku || item.id,
      name: item.name || 'Aplikasi Premium',
      category: item.brand || 'D STORE',
      image: item.image,
      variants: [
        { id: 'v1', name: '1 Bulan Sharing', price: 15000, isAvailable: true },
        { id: 'v2', name: '1 Bulan Private', price: 35000, isAvailable: true }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans antialiased pb-24 md:pb-12">
      {/* Toast Notifikasi */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-black/95 text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 animate-fade-in border border-zinc-700">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* =========================================================
          1. TOP NOTIFICATION BAR (Identik Beranda)
      ========================================================= */}
      <div className="bg-[#F4F4F4] border-b border-zinc-200/80 text-[11px] font-medium text-[#555] py-2 px-4 select-none">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-black tracking-wider uppercase text-[10px] bg-black text-white px-1.5 py-0.5 rounded">
              RESMI
            </span>
            <span className="truncate">
              Gratis Ongkir &amp; Garansi Proteksi Digital 100% &bull; D-Store Official - Solusi Akun Premium No. 1
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-[#666]">
            <a href="https://wa.me/6281230112240" target="_blank" rel="noopener noreferrer" className="hover:text-black transition">
              Bantuan CS
            </a>
            <span className="text-zinc-300">•</span>
            <a href="https://wa.me/6281230112240" target="_blank" rel="noopener noreferrer" className="hover:text-black transition">
              Kontak Admin
            </a>
            <span className="text-zinc-300">•</span>
            <span className="hidden sm:inline hover:text-black cursor-pointer">Beli Cepat</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          2. MAIN DESKTOP HEADER (Identik Beranda)
      ========================================================= */}
      <header className="hidden md:block relative z-30 zalora-header border-b border-zinc-200/60 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 py-3 flex items-center justify-between gap-4 sm:gap-8">
          
          {/* Logo D STORE */}
          <Link href="/store" className="shrink-0 flex items-center gap-1">
            <span className="text-2xl sm:text-[28px] font-black tracking-[0.18em] uppercase text-black hover:opacity-90 transition">
              D STORE
            </span>
          </Link>

          {/* Search Bar Pill with Live Floating Dropdown */}
          <div className="flex-1 max-w-2xl relative" ref={desktopSearchRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-[#888888] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchResults.length > 0) {
                    setIsSearchFocused(false);
                    handleProductClick(searchResults[0]);
                  }
                }}
                placeholder="Cari aplikasi, AI tools, Netflix, ChatGPT, Canva..."
                className="w-full bg-[#F4F4F4] hover:bg-[#EFEFEF] focus:bg-white text-xs sm:text-sm pl-11 pr-10 py-2.5 rounded-full border border-transparent focus:border-black outline-none transition placeholder:text-[#888]"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 text-[#888] hover:text-black p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Desktop Live Floating Results Dropdown */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Hasil Pencarian ({searchResults.length})
                  </div>
                  {searchResults.length > 0 && (
                    <span className="text-[11px] text-zinc-400 font-medium">
                      Tekan Enter untuk memilih
                    </span>
                  )}
                </div>

                {searchResults.length > 0 ? (
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-100">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setIsSearchFocused(false);
                          handleProductClick(item);
                        }}
                        className="p-3 hover:bg-zinc-50 flex items-center justify-between gap-3 cursor-pointer transition select-none group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 shrink-0 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800">
                                {item.brand}
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-zinc-900 truncate mt-0.5 group-hover:text-black">
                              {item.name}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="text-xs sm:text-sm font-black text-black">
                            {formatRupiah(item.price)}
                          </div>
                          <div className="text-[10px] text-emerald-600 font-bold">
                            Tersedia
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-zinc-500">
                    Tidak ada aplikasi yang cocok dengan &quot;{searchQuery}&quot;.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Header Action Icons */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-[#222]">
            <button 
              type="button"
              onClick={() => setIsAccountOpen(true)}
              className="flex items-center gap-2 cursor-pointer hover:opacity-75 transition select-none bg-transparent border-0 p-0 text-[#222]"
            >
              {user ? (
                <UserAvatar user={user} size={24} />
              ) : (
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
              <span className="hidden xl:inline text-xs font-semibold">
                {user ? (user.name ? user.name.split(' ')[0] : 'Akun') : 'Akun Saya'}
              </span>
            </button>

            {/* Wishlist Active Icon */}
            <Link 
              href="/store/wishlist"
              className="relative cursor-pointer hover:opacity-75 transition select-none flex items-center justify-center text-[#d92534]"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-[#d92534] text-[#d92534]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#d92534] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <div 
              onClick={() => setIsCartOpen(true)}
              className="relative cursor-pointer hover:opacity-75 transition select-none"
              title="Tas Belanja"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Segment Tabs */}
        <div className="max-w-[1240px] mx-auto px-4 py-2 hidden md:block">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 flex-row overflow-x-auto no-scrollbar scrollbar-hide py-0.5">
              {[
                { id: 'all', name: 'Semua App', href: '/store/all' },
                { id: 'ai', name: 'AI & Tools', href: '/store/ai-tools' },
                { id: 'stream', name: 'Streaming', href: '/store/streaming' },
                { id: 'design', name: 'Desain', href: '/store/graphic-design' },
                { id: 'music', name: 'Musik', href: '/store/music-audio' },
                { id: 'vpn', name: 'VPN', href: '/store/vpn-security' },
                { id: 'office', name: 'Office & Akun', href: '/store/office-tools' }
              ].map((seg) => (
                <Link 
                  key={seg.id}
                  data-test-id={`segment-tab-${seg.id}`} 
                  href={seg.href}
                  className="cursor-pointer text-[#222222] font-semibold hover:text-black hover:bg-[#F2F2F2] mr-2 whitespace-nowrap rounded-2xl px-4 py-2.5 no-underline select-none inline-flex items-center justify-center text-sm transition-colors border border-transparent"
                >
                  {seg.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          2B. MORPHING SEARCH BAR MOBILE (Identik Beranda)
      ========================================================= */}
      <MorphingTopBar 
        onOpenSearch={() => setShowSearchModal(true)} 
        activeSegment={activeSegment} 
        onSelectSegment={setActiveSegment}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cart.reduce((acc, item) => acc + (item.quantity || 1), 0)}
      />

      {/* Mobile Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-[150] bg-white flex flex-col p-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 shrink-0">
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari aplikasi, AI tools, Netflix, ChatGPT, Canva..."
                className="w-full bg-zinc-100 pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none border border-transparent focus:border-black"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchResults.length > 0) {
                    setShowSearchModal(false);
                    handleProductClick(searchResults[0]);
                  }
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-zinc-400 hover:text-black p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowSearchModal(false);
                setSearchQuery('');
              }}
              className="text-sm font-bold text-zinc-700 hover:text-black p-1 cursor-pointer"
            >
              Tutup
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pt-3">
            {searchQuery.trim().length > 0 ? (
              <div>
                <div className="mb-3 px-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Hasil Pencarian ({searchResults.length})
                  </div>
                </div>

                {searchResults.length > 0 ? (
                  <div className="space-y-2 pb-6">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setShowSearchModal(false);
                          handleProductClick(item);
                        }}
                        className="flex items-center justify-between p-2.5 bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-200 rounded-xl cursor-pointer transition border border-zinc-100 select-none"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase text-zinc-700">{item.brand}</span>
                            <div className="text-xs font-bold text-zinc-900 truncate">{item.name}</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-black">{formatRupiah(item.price)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-zinc-500">
                    Tidak ada aplikasi yang cocok.
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* =========================================================
          3. KONTEN UTAMA WISHLIST (Zalora Style)
      ========================================================= */}
      <main className="max-w-[1240px] mx-auto px-4 py-4 sm:py-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4 select-none">
          <Link href="/store" className="hover:text-black transition">Beranda</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-semibold text-black">Wishlist Saya</span>
        </div>

        {/* Header Judul Halaman */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[#262626]">
              Wishlist Saya
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {wishlistItems.length} produk tersimpan di daftar favorit Anda
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Hapus seluruh item dari Wishlist Anda?')) {
                  setWishlist([]);
                  showNotification('Wishlist telah dikosongkan');
                }
              }}
              className="text-xs font-semibold text-zinc-500 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan</span>
            </button>
          )}
        </div>

        {/* Konten Grid / Empty State */}
        {wishlistItems.length === 0 ? (
          /* Empty State Zalora */
          <div className="py-16 sm:py-24 text-center max-w-md mx-auto px-4 space-y-4 bg-zinc-50/70 rounded-2xl border border-zinc-100">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-xs border border-zinc-200 flex items-center justify-center mx-auto text-[#d92534]">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-[#d92534]" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-bold text-[#262626]">
                Wishlist Anda Masih Kosong
              </h2>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
                Simpan produk dan aplikasi premium favorit Anda dengan menekan ikon hati di katalog belanja.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/store"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-black text-white text-xs sm:text-sm font-bold hover:bg-zinc-800 transition active:scale-95 shadow-md"
              >
                Mulai Belanja Sekarang
              </Link>
            </div>
          </div>
        ) : (
          /* Grid Produk Wishlist (Identik Produk Beranda) */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
            {wishlistItems.map((prod, idx) => {
              const prodKey = prod.sku || prod.id;
              return (
                <div
                  key={prodKey || idx}
                  className="product-item__wrapper bg-white rounded-lg p-2.5 sm:p-3 flex flex-col justify-between border border-zinc-200 hover:shadow-md transition select-none relative group"
                >
                  {/* Foto Produk */}
                  <div 
                    onClick={() => handleProductClick(prod)}
                    className="product-item__product-image-wrapper aspect-[3/4] bg-[#F7F7F7] rounded-lg overflow-hidden flex items-center justify-center relative cursor-pointer"
                  >
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-contain pointer-events-none transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white">
                        <Sparkles className="w-8 h-8 text-zinc-500" />
                      </div>
                    )}

                    {/* Tombol Hati Merah Solid */}
                    <div className="product-item__add-to-wishlist-icon absolute top-1 right-1 z-10">
                      <button
                        type="button"
                        aria-label="Hapus dari Wishlist"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFromWishlist(prodKey);
                        }}
                        className="w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-xs flex items-center justify-center transition cursor-pointer"
                        title="Hapus dari Wishlist"
                      >
                        <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block size-5 cursor-pointer">
                          <path d="M16.308 8.335c1.68-1.666 3.691-2.219 5.9-1.571 2.168.635 3.57 2.147 4.13 4.394.058.229.082.409.122.802l.012.127.028.279c-.039 1.496-.545 2.874-1.502 4.4-1.454 2.318-3.335 4.298-6.147 6.683-.362.306-.666.549-1.317 1.058l-.031.025c-.454.356-.665.522-.916.727-.375.305-.767.329-1.162.027-3.318-2.532-5.666-4.724-7.574-7.255-1.107-1.467-1.826-2.832-2.196-4.323-.805-3.25 1.625-6.761 4.946-7.141 1.989-.228 3.692.368 5.086 1.786.16.163.228.246.296.248.072 0 .145-.087.325-.266z" fill="#d92534" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Konten Teks */}
                  <div 
                    onClick={() => handleProductClick(prod)}
                    className="product-item__contents w-full relative mt-2 mb-2 flex-1 flex flex-col cursor-pointer"
                  >
                    <div className="product-item__brand text-xs sm:text-sm font-bold text-[#262626] uppercase truncate">
                      {prod.brand || 'D STORE'}
                    </div>
                    <div className="product-item__name text-xs sm:text-sm text-[#737373] truncate mt-0.5 line-clamp-1">
                      {prod.name}
                    </div>

                    <div className="my-1.5 flex items-baseline gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-zinc-950">
                        {prod.price || 'Rp 15.000'}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Ready
                      </span>
                    </div>
                  </div>

                  {/* Tombol Pesan */}
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(prod);
                    }}
                    className="zui-btn zui-btn-outline mt-auto h-10 min-h-[40px] rounded-lg w-full text-xs sm:text-sm font-bold border border-[#474747] text-[#262626] hover:bg-[#262626] hover:text-white transition active:scale-95 cursor-pointer flex items-center justify-center"
                    aria-label="Pesan"
                  >
                    Pesan
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* =========================================================
          13. CATEGORIES FOOTER PILLS & ACCORDION SEO TEXT (Identik Beranda)
      ========================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 py-8 border-t border-zinc-200 mt-12">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-bold uppercase text-black mr-2">KATEGORI:</span>
          {ZALORA_MEN_CATEGORIES.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.href || '/store'}
              className="text-xs text-[#555] hover:text-black underline px-2.5 py-1 border-r border-zinc-300 last:border-none cursor-pointer inline-block"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* SEO Text Dropdown Accordion */}
        <div className="border border-zinc-200/80 rounded-xl bg-white overflow-hidden transition-all duration-200 hover:border-zinc-300">
          <button
            type="button"
            onClick={() => setShowSeoText(!showSeoText)}
            className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer select-none transition-colors hover:bg-zinc-50/70"
            aria-expanded={showSeoText}
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-4">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 shrink-0" />
              <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 tracking-tight line-clamp-1">
                Pusat Langganan Akun Aplikasi Premium &amp; AI Tools Terpercaya &bull; D Store Indonesia
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 shrink-0">
              <span className="hidden sm:inline text-[11px]">{showSeoText ? 'Tutup' : 'Pelajari'}</span>
              <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700 transition-transform duration-200">
                {showSeoText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </div>
          </button>

          {showSeoText && (
            <div className="px-4 pb-5 pt-1 sm:px-5 border-t border-zinc-100 text-xs text-zinc-600 space-y-3 leading-relaxed bg-zinc-50/30">
              <p>
                D Store Indonesia adalah platform terpercaya penyedia lisensi dan akun aplikasi premium legal, mulai dari AI Tools (ChatGPT Plus, Cursor Pro, Midjourney), Streaming 4K (Netflix, Disney+, YouTube Premium), Desain &amp; Kreator (Canva Pro, CapCut Pro), hingga Office dan Cloud Storage.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          14. MOBILE BOTTOM NAVIGATION (Identik 100% Beranda Floating Pill)
      ========================================================= */}
      <div 
        id="mobile_bottom_nav" 
        className="fixed bottom-3 sm:bottom-4 inset-x-0 mx-auto z-50 w-[92%] max-w-[370px] md:hidden pointer-events-none"
        style={{ left: 0, right: 0, marginLeft: 'auto', marginRight: 'auto' }}
      >
        <div className="rounded-full iphone-glass-bottom-card px-1.5 py-0.5 pointer-events-auto shadow-[0_8px_25px_rgba(0,0,0,0.1)]">
          <div className="relative flex items-center justify-center px-1">
            {/* 1. Home */}
            <Link 
              rel="noindex,nofollow" 
              aria-label="Beranda" 
              data-test-id="bottomNavHomeIcon" 
              className="relative flex h-[44px] flex-1 flex-col items-center justify-center gap-y-0.5 cursor-pointer select-none" 
              href="/store"
            >
              <span aria-hidden="true" className="absolute left-1/2 top-1/2 h-full w-16 max-w-[calc(100%+0.5rem)] -translate-x-1/2 -translate-y-1/2 rounded-full"></span>
              <span className="relative">
                <span>
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block size-5">
                    <path d="M8.656 7v1.463H21.95L8 24.416V25h17v-1.464H10.965L24.907 7.693 24.9 7H8.656z" fill="#737373"></path>
                  </svg>
                </span>
              </span>
              <span className="relative text-[9.5px] leading-tight font-normal text-grey-60 text-[#737373]">Home</span>
            </Link>

            {/* 2. Kategori */}
            <a 
              rel="noindex,nofollow" 
              aria-label="Kategori" 
              data-test-id="categoryLink" 
              className="relative flex h-[44px] flex-1 flex-col items-center justify-center gap-y-0.5 cursor-pointer select-none" 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsCategoriesOpen(true);
              }}
            >
              <span aria-hidden="true" className="absolute left-1/2 top-1/2 h-full w-16 max-w-[calc(100%+0.5rem)] -translate-x-1/2 -translate-y-1/2 rounded-full"></span>
              <span className="relative">
                <span>
                  <svg width="22" height="22" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block size-5">
                    <path d="M23.64 20.376l-4.083-4.082a7.185 7.185 0 10-.922.922l4.082 4.083a.652.652 0 10.923-.923zM8.174 11.705a5.871 5.871 0 115.871 5.87 5.877 5.877 0 01-5.87-5.87z" fill="#737373"></path>
                    <path d="M2.169 15.222h1.68M2.169 18.222H5.04M2.169 21.222h7.033" stroke="#737373" strokeLinecap="round"></path>
                  </svg>
                </span>
              </span>
              <span className="relative text-[9.5px] leading-tight font-normal text-grey-60 text-[#737373]">Kategori</span>
            </a>

            {/* 3. Tas */}
            <a 
              rel="noindex,nofollow" 
              aria-label="Tas" 
              data-test-id="cartLink" 
              className="relative flex h-[44px] flex-1 flex-col items-center justify-center gap-y-0.5 cursor-pointer select-none" 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsCartOpen(true);
              }}
            >
              <span aria-hidden="true" className="absolute left-1/2 top-1/2 h-full w-16 max-w-[calc(100%+0.5rem)] -translate-x-1/2 -translate-y-1/2 rounded-full"></span>
              <span className="relative">
                <span>
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block size-5">
                    <path fillRule="evenodd" clipRule="evenodd" d="M20.5 10.866v.975c0 .27-.224.488-.5.488a.494.494 0 01-.5-.488v-.975h-6v.975c0 .27-.224.488-.5.488a.494.494 0 01-.5-.488v-.975h-2.17L9.007 23.337a.987.987 0 00.986 1.076l12.999.111a.982.982 0 001.003-1.082l-1.411-12.576H20.5zm0-.976h2.083c.51 0 .938.375.994.87l1.41 12.577c.12 1.07-.672 2.034-1.77 2.151a2.072 2.072 0 01-.235.012l-13-.111c-1.104-.01-1.991-.89-1.982-1.968.001-.062.005-.123.011-.184l1.325-12.472a.991.991 0 01.995-.875H12.5v-.319c0-2.243 1.785-4.071 4-4.071 1.922 0 3.555 1.387 3.923 3.275.051.26.077.527.077.796v.32zm-1 0v-.319c0-.208-.02-.413-.059-.614-.28-1.437-1.51-2.481-2.941-2.481-1.651 0-3 1.38-3 3.095v.32h6z" fill="#737373"></path>
                  </svg>
                </span>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-black text-white text-[9px] font-bold min-w-3.5 h-3.5 px-0.5 rounded-full flex items-center justify-center shadow-xs">
                    {cart.reduce((acc, item) => acc + (item.quantity || 1), 0)}
                  </span>
                )}
              </span>
              <span className="relative text-[9.5px] leading-tight font-normal text-grey-60 text-[#737373]">Tas</span>
            </a>

            {/* 4. Wishlist (Halaman Aktif!) */}
            <Link 
              rel="noindex,nofollow" 
              aria-label="Wishlist" 
              data-test-id="wishlistLink" 
              className="relative flex h-[44px] flex-1 flex-col items-center justify-center gap-y-0.5 cursor-pointer select-none" 
              href="/store/wishlist"
            >
              <span aria-hidden="true" className="absolute left-1/2 top-1/2 h-full w-16 max-w-[calc(100%+0.5rem)] -translate-x-1/2 -translate-y-1/2 rounded-full"></span>
              <span className="relative">
                <span>
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block size-5">
                    <path d="M16.308 8.335c1.68-1.666 3.691-2.219 5.9-1.571 2.168.635 3.57 2.147 4.13 4.394.058.229.082.409.122.802l.012.127.028.279c-.039 1.496-.545 2.874-1.502 4.4-1.454 2.318-3.335 4.298-6.147 6.683-.362.306-.666.549-1.317 1.058l-.031.025c-.454.356-.665.522-.916.727-.375.305-.767.329-1.162.027-3.318-2.532-5.666-4.724-7.574-7.255-1.107-1.467-1.826-2.832-2.196-4.323-.805-3.25 1.625-6.761 4.946-7.141 1.989-.228 3.692.368 5.086 1.786.16.163.228.246.296.248.072 0 .145-.087.325-.266z" fill="#d92534"></path>
                  </svg>
                </span>
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-[#d92534] text-white text-[8.5px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </span>
              <span className="relative text-[9.5px] leading-tight font-semibold text-[#d92534]">Wishlist</span>
            </Link>

            {/* 5. Akun Saya */}
            <a 
              rel="noindex,nofollow" 
              data-test-id="bottomNavAccountIcon" 
              className="relative flex h-[44px] flex-1 flex-col items-center justify-center gap-y-0.5 cursor-pointer select-none" 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsAccountOpen(true);
              }}
            >
              <span aria-hidden="true" className="absolute left-1/2 top-1/2 h-full w-16 max-w-[calc(100%+0.5rem)] -translate-x-1/2 -translate-y-1/2 rounded-full"></span>
              <span className="relative">
                <span>
                  {user ? (
                    <UserAvatar user={user} size={20} />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block size-5">
                      <path fillRule="evenodd" clipRule="evenodd" d="M21.5 11a5.5 5.5 0 11-11 0 5.5 5.5 0 1111 0zm-1 0a4.5 4.5 0 10-8.999-.001A4.5 4.5 0 0020.5 11zm4 13.605c0 .512-.068 1.02-.2 1.522a.5.5 0 01-.966-.254c.11-.42.166-.843.166-1.268 0-3.349-3.339-6.105-7.5-6.105s-7.5 2.756-7.5 6.105c0 .281.074.964.137 1.304a.5.5 0 11-.984.182 10.96 10.96 0 01-.153-1.486c0-3.948 3.824-7.105 8.5-7.105s8.5 3.157 8.5 7.105z" fill="#737373"></path>
                    </svg>
                  )}
                  {user && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                  )}
                </span>
              </span>
              <span className={`relative text-[9.5px] leading-tight font-normal ${user ? 'text-blue-600 font-semibold' : 'text-[#737373]'}`}>
                {user ? (user.name ? user.name.split(' ')[0] : 'Akun') : 'Akun Saya'}
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Modal Variasi Produk */}
      {selectedAppModal && (
        <AppVariantModal
          appData={selectedAppModal}
          onClose={() => setSelectedAppModal(null)}
          onAddToCart={(item) => {
            addToCart(item);
            setSelectedAppModal(null);
          }}
          onShowNotification={showNotification}
        />
      )}

      {/* Modal Tas Belanja */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
        onShowToast={showNotification}
        onOpenAppModal={(app) => {
          setIsCartOpen(false);
          setSelectedAppModal(app);
        }}
        initialProducts={initialProducts}
        initialVariants={initialVariants}
      />

      {/* Modal Kategori */}
      <CategoriesModal
        isOpen={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
      />

      {/* Modal Akun Saya */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        user={user}
        onLoginWithGoogle={loginWithGoogle}
        onLogout={logout}
        onUpdateProfile={updateProfile}
        cartCount={cart.reduce((acc, item) => acc + (item.quantity || 1), 0)}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => {
          setIsAccountOpen(false);
        }}
      />
    </div>
  );
}
