'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  User, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  MessageCircle, 
  X, 
  Check, 
  QrCode, 
  Share2 
} from 'lucide-react';

import { 
  ZALORA_SEGMENTS,
  ZALORA_BUBBLES,
  ZALORA_HERO,
  ZALORA_SPEED_DEALS,
  ZALORA_BRANDS_1,
  ZALORA_TRENDING,
  ZALORA_STEALS,
  ZALORA_BRANDS_2,
  ZALORA_FEATURED_COLLECTIONS,
  ZALORA_SAVE_BANNERS,
  ZALORA_PRODUCTS,
  ZALORA_TOP_BRANDS,
  ZALORA_POPULAR_SEARCHES,
  ZALORA_MEN_CATEGORIES
} from '@/lib/zaloraMenData';

export default function ZaloraMenDevPage() {
  const [activeSegment, setActiveSegment] = useState('men');
  const [activeSpeedDealIndex, setActiveSpeedDealIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [showSeoText, setShowSeoText] = useState(false);
  const [activeProductModal, setActiveProductModal] = useState(null);
  const [showQuickAlert, setShowQuickAlert] = useState(null);

  // Speed deals auto rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSpeedDealIndex((prev) => (prev + 1) % ZALORA_SPEED_DEALS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const formatRupiah = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      showNotification(exists ? 'Dihapus dari Wishlist' : 'Ditambahkan ke Wishlist');
      return updated;
    });
  };

  const addToCart = (prod) => {
    setCart((prev) => [...prev, prod]);
    showNotification(`${prod.name} dimasukkan ke Tas!`);
  };

  const showNotification = (msg) => {
    setShowQuickAlert(msg);
    setTimeout(() => setShowQuickAlert(null), 2500);
  };

  const getWhatsAppOrderUrl = (pName, price) => {
    const text = encodeURIComponent(`Halo Admin D Store, saya ingin order:\n• Produk: ${pName}\n• Harga: ${formatRupiah(price)}`);
    return `https://wa.me/6281230112240?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans antialiased selection:bg-black selection:text-white pb-24 md:pb-0">
      
      {/* Toast Notification */}
      {showQuickAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-black text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{showQuickAlert}</span>
        </div>
      )}

      {/* =========================================================
          1. TOP UTILITY ANNOUNCEMENT BAR (Persis Asli Zalora)
      ========================================================= */}
      <div className="bg-[#F8F8F8] text-[#555555] text-[11px] py-1.5 px-4 border-b border-[#EAEAEA]">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
            <span className="flex items-center gap-1">
              <span className="text-[#888]">↺</span> 30 Hari Pengembalian Gratis | S&amp;K Berlaku &gt;
            </span>
            <span className="flex items-center gap-1 font-semibold text-black">
              <span className="bg-black text-white text-[9px] px-1.5 py-0.2 rounded font-bold">VIP</span>
              ZALORA VIP: Gratis Ongkir Setahun Tanpa Min. Pembelian &gt;
            </span>
            <span className="hidden lg:inline-flex items-center gap-1 text-[#555]">
              ✓ Original 100% Brand Lokal &amp; Internasional
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-[#666]">
            <a href="https://wa.me/6281230112240" target="_blank" rel="noopener noreferrer" className="hover:text-black transition">
              Bantuan
            </a>
            <span className="text-zinc-300">•</span>
            <a href="https://wa.me/6281230112240" target="_blank" rel="noopener noreferrer" className="hover:text-black transition">
              Kontak
            </a>
            <span className="text-zinc-300">•</span>
            <span className="hidden sm:inline hover:text-black cursor-pointer">Download App</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          2. MAIN HEADER (Sticky Desktop & Mobile)
      ========================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#EAEAEA] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1240px] mx-auto px-4 py-3 flex items-center justify-between gap-4 sm:gap-8">
          
          {/* Zalora Wordmark Logo */}
          <Link href="/store" className="shrink-0 flex items-center gap-1">
            <span className="text-2xl sm:text-[28px] font-black tracking-[0.18em] uppercase text-black hover:opacity-90 transition">
              ZALORA
            </span>
          </Link>

          {/* Search Bar Pill (Pusat Pencarian) */}
          <div className="flex-1 max-w-2xl relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-[#888888] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk, tren, dan merek..."
                className="w-full bg-[#F4F4F4] hover:bg-[#EFEFEF] focus:bg-white text-xs sm:text-sm pl-11 pr-10 py-2.5 rounded-full border border-transparent focus:border-black outline-none transition placeholder:text-[#888]"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 text-[#888] hover:text-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Header Action Icons */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-[#222]">
            {/* Akun Saya */}
            <a 
              href="https://wa.me/6281230112240"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 cursor-pointer hover:opacity-75 transition select-none"
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="hidden xl:inline text-xs font-semibold">Akun Saya</span>
            </a>

            {/* Wishlist */}
            <div 
              onClick={() => showNotification(`Anda memiliki ${wishlist.length} produk di Wishlist!`)}
              className="relative cursor-pointer hover:opacity-75 transition select-none"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </div>

            {/* Tas / Cart */}
            <div 
              onClick={() => showNotification(`Tas belanja: ${cart.length} produk`)}
              className="relative cursor-pointer hover:opacity-75 transition select-none"
              title="Tas Belanja"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Segment Tabs */}
        <div className="hidden md:block max-w-[1240px] mx-auto px-4">
          <nav className="flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
            {ZALORA_SEGMENTS.map((seg) => {
              const isActive = seg.id === activeSegment;
              return (
                <button
                  key={seg.id}
                  onClick={() => setActiveSegment(seg.id)}
                  className={`pb-2.5 pt-1 border-b-2 transition-all ${
                    isActive 
                      ? 'border-black text-black font-extrabold' 
                      : 'border-transparent text-[#777] hover:text-black'
                  }`}
                >
                  {seg.name}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Sticky Segment Tabs (Scrollable Horizontal Pills) */}
      <div className="md:hidden sticky top-[57px] z-30 bg-white py-2.5 px-4 border-b border-[#EAEAEA] shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {ZALORA_SEGMENTS.map((seg) => {
            const isActive = seg.id === activeSegment;
            return (
              <button
                key={seg.id}
                onClick={() => setActiveSegment(seg.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition shrink-0 ${
                  isActive
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-[#F2F2F2] text-[#444] hover:bg-[#E5E5E5]'
                }`}
              >
                {seg.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          3. TOP BRAND DEALS BUBBLES (18 Circular Story Badges)
      ========================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 pt-6 pb-4">
        <div className="flex items-start gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2">
          {ZALORA_BUBBLES.map((bubble, i) => (
            <a
              key={i}
              href={bubble.link}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer w-[68px] sm:w-[84px] text-center"
            >
              <div className="w-[62px] h-[62px] sm:w-[76px] sm:h-[76px] rounded-full p-0.5 bg-gradient-to-tr from-zinc-200 via-zinc-300 to-zinc-400 group-hover:from-black group-hover:to-zinc-600 transition shadow-xs">
                <div className="w-full h-full rounded-full bg-white p-1 overflow-hidden flex items-center justify-center">
                  <img
                    src={bubble.img}
                    alt={bubble.label}
                    className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                </div>
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-[#444] group-hover:text-black line-clamp-1 leading-tight">
                {bubble.label}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* =========================================================
          4. MAIN HERO BANNER ("Got You Splurging - 10.10 Flash Sale")
      ========================================================= */}
      {ZALORA_HERO && (
        <section className="max-w-[1240px] mx-auto px-4 py-3">
          <a
            href={ZALORA_HERO.link}
            className="block relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 group"
          >
            <img
              src={ZALORA_HERO.desktopImg}
              alt={ZALORA_HERO.title}
              className="w-full h-auto object-cover group-hover:scale-[1.01] transition duration-500"
            />
            {/* Countdown Badge Float */}
            <div className="absolute top-3 left-3 sm:top-5 sm:left-5 bg-black/85 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>FLASH SALE BERAKHIR DALAM: 05:42:19</span>
            </div>
          </a>
        </section>
      )}

      {/* =========================================================
          5. SPEED DEALS & SECONDARY BANNER CAROUSEL
      ========================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 py-4">
        <div className="relative rounded-2xl overflow-hidden shadow-xs bg-zinc-100 group">
          <a 
            href={ZALORA_SPEED_DEALS[activeSpeedDealIndex]?.link}
            className="block w-full"
          >
            <img
              src={ZALORA_SPEED_DEALS[activeSpeedDealIndex]?.img}
              alt={ZALORA_SPEED_DEALS[activeSpeedDealIndex]?.title}
              className="w-full h-auto object-cover transition-opacity duration-500"
            />
          </a>

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={() => setActiveSpeedDealIndex((prev) => (prev - 1 + ZALORA_SPEED_DEALS.length) % ZALORA_SPEED_DEALS.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-white"
            aria-label="Previous Deal"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveSpeedDealIndex((prev) => (prev + 1) % ZALORA_SPEED_DEALS.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-white"
            aria-label="Next Deal"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicator Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {ZALORA_SPEED_DEALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSpeedDealIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === activeSpeedDealIndex ? 'w-6 bg-black' : 'w-2 bg-black/30'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          6. BRANDS THAT GOT YOU LOOKING (Round 1)
      ========================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
              Brands That Got You Looking
            </h2>
            <p className="text-xs text-[#777] mt-0.5">Koleksi brand pria terfavorit dengan penawaran spesial</p>
          </div>
          <Link href="/brands" className="text-xs font-bold uppercase underline tracking-wide text-black hover:text-[#555]">
            Lihat Semua Brand &gt;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {ZALORA_BRANDS_1.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              className="group relative rounded-xl overflow-hidden bg-zinc-100 shadow-2xs hover:shadow-md transition duration-300"
            >
              <div className="aspect-[280/404] w-full overflow-hidden">
                <img
                  src={item.img}
                  alt={item.brand}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-3 bg-white border-t border-zinc-100 flex flex-col justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-black group-hover:underline">
                  {item.brand}
                </span>
                <span className="text-[11px] text-[#777] truncate mt-0.5">
                  {item.label}
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* =========================================================
          7. TOP TIER RECOMMENDATIONS (Real Product Grid)
      ========================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 py-8 bg-[#FAFAFA] rounded-3xl my-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Curated</span>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                Top Tier Recommendations
              </h2>
            </div>
            <p className="text-xs text-[#777] mt-1">Pilihan produk fashion pria paling populer di Zalora Indonesia</p>
          </div>
          <button 
            type="button"
            onClick={() => showNotification('Memuat rekomendasi tambahan...')}
            className="text-xs font-bold uppercase underline tracking-wide text-black hover:text-[#555]"
          >
            Refresh Produk
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {ZALORA_PRODUCTS.map((prod) => {
            const isWishlisted = wishlist.includes(prod.id);
            return (
              <div
                key={prod.id}
                className="group relative bg-white rounded-xl overflow-hidden border border-[#EAEAEA] shadow-2xs hover:shadow-lg transition duration-300 flex flex-col"
              >
                {/* Product Image & Wishlist Button */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                  
                  {/* Badge */}
                  {prod.badge && (
                    <span className="absolute top-2.5 left-2.5 bg-black text-white text-[9px] font-extrabold px-2 py-0.5 rounded-sm tracking-wider uppercase shadow-xs">
                      {prod.badge}
                    </span>
                  )}

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(prod.id);
                    }}
                    className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition shadow-md ${
                      isWishlisted 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-white/90 text-zinc-700 hover:text-black hover:bg-white'
                    }`}
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Details */}
                <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#777]">
                      {prod.brand}
                    </div>
                    <h3 className="font-normal text-xs sm:text-sm text-black line-clamp-2 mt-0.5 leading-snug">
                      {prod.name}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-zinc-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#D52222]">
                        {formatRupiah(prod.price)}
                      </span>
                      {prod.originalPrice && (
                        <span className="text-[10px] text-[#999] line-through">
                          {formatRupiah(prod.originalPrice)}
                        </span>
                      )}
                    </div>
                    {prod.discount && (
                      <span className="text-[10px] font-bold text-[#D52222] mt-0.5 block">
                        {prod.discount}
                      </span>
                    )}

                    {/* Action Button: Add to Cart / WhatsApp */}
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => addToCart(prod)}
                        className="flex-1 py-2 px-3 rounded-lg bg-black text-white text-xs font-bold hover:bg-zinc-800 transition flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Beli</span>
                      </button>
                      <a
                        href={getWhatsAppOrderUrl(prod.name, prod.price)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200"
                        title="Order via WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          8. TRENDING NOW, YOUR STYLE INSPO (Tall 700x1200 Cards)
      ========================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 py-8">
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
            Trending Now, Your Style Inspo
          </h2>
          <p className="text-xs text-[#777] mt-0.5">Inspirasi tren gaya berpakaian pria terbaru musim ini</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {ZALORA_TRENDING.map((trend, idx) => (
            <a
              key={idx}
              href={trend.link}
              className="group relative rounded-xl overflow-hidden bg-zinc-900 shadow-sm hover:shadow-lg transition duration-300"
            >
              <div className="aspect-[700/1200] w-full overflow-hidden">
                <img
                  src={trend.img}
                  alt={trend.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3.5 text-white">
                <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider leading-tight">
                  {trend.title}
                </span>
                <span className="text-[10px] text-zinc-300 mt-0.5 line-clamp-1">
                  {trend.label}
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* =========================================================
          9. STEALS YOU CAN'T MISS (Wide Split Banners)
      ========================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 py-6">
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
            Steals You Can&apos;t Miss
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ZALORA_STEALS.map((steal, idx) => (
            <a
              key={idx}
              href={steal.link}
              className="block relative rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition duration-300 group"
            >
              <img
                src={steal.img}
                alt={steal.title}
                className="w-full h-auto object-cover group-hover:scale-[1.02] transition duration-500"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </section>

      {/* =========================================================
          10. BRANDS THAT GOT YOU LOOKING (Round 2)
      ========================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 py-8">
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
            More Brands To Love
          </h2>
          <p className="text-xs text-[#777] mt-0.5">Pilihan sepatu kasual, sneakers, dan pakaian santai</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {ZALORA_BRANDS_2.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              className="group relative rounded-xl overflow-hidden bg-zinc-100 shadow-2xs hover:shadow-md transition duration-300"
            >
              <div className="aspect-[280/404] w-full overflow-hidden">
                <img
                  src={item.img}
                  alt={item.brand}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-2.5 bg-white border-t border-zinc-100 flex flex-col justify-between">
                <span className="font-bold text-[11px] sm:text-xs uppercase tracking-wider text-black group-hover:underline">
                  {item.brand}
                </span>
                <span className="text-[10px] text-[#777] truncate mt-0.5">
                  {item.label}
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* =========================================================
          11. DISCOVER FEATURED COLLECTIONS (Landscape Cards)
      ========================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 py-8">
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
            Discover Featured Collections
          </h2>
          <p className="text-xs text-[#777] mt-0.5">Kolaborasi eksklusif dan rilis terbatas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ZALORA_FEATURED_COLLECTIONS.map((feat, idx) => (
            <a
              key={idx}
              href={feat.link}
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition duration-300 bg-black"
            >
              <div className="aspect-[1280/720] w-full overflow-hidden">
                <img
                  src={feat.img}
                  alt={feat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-4 bg-white border-t border-zinc-100">
                <h3 className="font-bold text-sm text-black group-hover:underline">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#777] mt-0.5">
                  {feat.label}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* =========================================================
          12. MORE WAYS TO SAVE (Bank & Partner Deals)
      ========================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 py-6">
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
            More Ways To Save
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ZALORA_SAVE_BANNERS.map((banner, idx) => (
            <a
              key={idx}
              href={banner.link}
              className="block rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition duration-300 group"
            >
              <img
                src={banner.img}
                alt={banner.title}
                className="w-full h-auto object-cover group-hover:scale-[1.02] transition duration-500"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </section>

      {/* =========================================================
          13. CATEGORIES FOOTER PILLS & ACCORDION SEO TEXT
      ========================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 py-8 border-t border-zinc-200">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-bold uppercase text-black mr-2">KATEGORI:</span>
          {ZALORA_MEN_CATEGORIES.map((cat, idx) => (
            <a
              key={idx}
              href={cat.href}
              className="text-xs text-[#555] hover:text-black underline px-2.5 py-1 border-r border-zinc-300 last:border-none"
            >
              {cat.name}
            </a>
          ))}
        </div>

        {/* SEO Text Dropdown Accordion */}
        <div className="border border-zinc-200 rounded-2xl p-5 bg-[#FAFAFA]">
          <div 
            onClick={() => setShowSeoText(!showSeoText)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <h3 className="font-bold text-xs uppercase tracking-wider text-black">
              BELANJA ONLINE FASHION PRIA TERBARU DI ZALORA INDONESIA
            </h3>
            <button type="button" className="text-black font-semibold text-xs flex items-center gap-1">
              {showSeoText ? <span>Tutup <ChevronUp className="w-3.5 h-3.5 inline" /></span> : <span>Baca Selengkapnya <ChevronDown className="w-3.5 h-3.5 inline" /></span>}
            </button>
          </div>

          {showSeoText && (
            <div className="pt-4 mt-4 border-t border-zinc-200 text-xs text-[#666] space-y-3 leading-relaxed">
              <p>
                ZALORA Indonesia adalah pusat tren fashion pria, mempunyai ribuan produk mulai dari kaos, celana jeans, sepatu kets hingga sepatu formal, dompet, dan ikat pinggang. Kami memiliki label desainer dan brand terbaru, mencakup beragam gaya mulai modern minimalis, professional, akhir pekan santai, dan banyak lagi.
              </p>
              <h4 className="font-bold text-black pt-2">Koleksi Lengkap Fashion Pria dari Brand-brand Terbaik</h4>
              <p>
                Brand-brand ternama lokal dan internasional dengan kualitas terbaik yang siap memberikan kepuasan akan trend fashion pria saat ini dapat Anda jumpai di ZALORA Indonesia: Adidas, Nike, Tommy Hilfiger, On Running, Tumi, Hush Puppies, Skechers, Vans, dan masih banyak lagi.
              </p>
              <h4 className="font-bold text-black pt-2">Keunggulan Berbelanja di ZALORA Indonesia</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>100% Produk Original Bergaransi Resmi dari Brand Terkemuka.</li>
                <li>Layanan Pengembalian Gratis 30 Hari jika ukuran atau produk tidak sesuai.</li>
                <li>Pilihan Pembayaran Lengkap: COD (Bayar di Tempat), QRIS Semua Bank, Transfer, dan Cicilan.</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          14. BRAND PALING TOP & PENCARIAN POPULER DIRECTORY
      ========================================================= */}
      <section className="bg-[#F8F8F8] border-t border-zinc-200 py-10 px-4">
        <div className="max-w-[1240px] mx-auto space-y-8 text-xs text-[#555]">
          
          {/* Brand Paling Top */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold uppercase tracking-wider text-black text-xs">BRAND PALING TOP</h4>
              <a href="/brands" className="text-[11px] underline text-[#666] hover:text-black">Lihat Semua Brand</a>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 leading-relaxed">
              {ZALORA_TOP_BRANDS.map((b, i) => (
                <span key={i} className="inline-flex items-center">
                  <a href={`/c/${b.toLowerCase().replace(/[^a-z0-9]/g, '-')}`} className="hover:text-black hover:underline">{b}</a>
                  {i < ZALORA_TOP_BRANDS.length - 1 && <span className="ml-3 text-zinc-300">|</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Pencarian Populer */}
          <div className="pt-6 border-t border-zinc-200">
            <h4 className="font-bold uppercase tracking-wider text-black text-xs mb-3">PENCARIAN POPULER</h4>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 leading-relaxed">
              {ZALORA_POPULAR_SEARCHES.map((s, i) => (
                <span key={i} className="inline-flex items-center">
                  <a href={`/search?q=${encodeURIComponent(s)}`} className="hover:text-black hover:underline">{s}</a>
                  {i < ZALORA_POPULAR_SEARCHES.length - 1 && <span className="ml-3 text-zinc-300">|</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          15. FULL ZALORA FOOTER (Hitam Luxury)
      ========================================================= */}
      <footer className="bg-black text-white pt-12 pb-28 md:pb-10 border-t border-zinc-800">
        <div className="max-w-[1240px] mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-zinc-800 text-xs">
          
          <div className="space-y-3">
            <div className="font-black text-2xl tracking-[0.2em] uppercase">ZALORA</div>
            <p className="text-zinc-400 leading-relaxed">
              Sebagai Pusat Fashion Online di Asia, kami menghadirkan kemungkinan gaya tanpa batas dari produk internasional hingga lokal terbaik.
            </p>
          </div>

          <div className="space-y-3">
            <div className="font-bold uppercase tracking-wider text-white">LAYANAN PELANGGAN</div>
            <ul className="space-y-2 text-zinc-400">
              <li><a href="https://wa.me/6281230112240" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Bantuan &amp; FAQ</a></li>
              <li><a href="https://wa.me/6281230112240" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Cara Pengembalian 30 Hari</a></li>
              <li><a href="https://wa.me/6281230112240" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Konfirmasi Pembayaran</a></li>
              <li><a href="https://wa.me/6281230112240" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Status Pengiriman Pesanan</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-bold uppercase tracking-wider text-white">TENTANG ZALORA</div>
            <ul className="space-y-2 text-zinc-400">
              <li><a href="#" className="hover:text-white transition">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-white transition">Karir di Zalora</a></li>
              <li><a href="#" className="hover:text-white transition">Pers &amp; Media</a></li>
              <li><a href="#" className="hover:text-white transition">ZALORA VIP Membership</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-bold uppercase tracking-wider text-white">HUBUNGI KAMI</div>
            <p className="text-zinc-400">Layanan Pelanggan Aktif: Setiap Hari 08.00 - 23.00 WIB</p>
            <div className="pt-2">
              <a
                href="https://wa.me/6281230112240"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-black font-bold text-xs hover:bg-zinc-200 transition shadow-md"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Chat Admin WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-[1240px] mx-auto px-4 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
          <p>© 2026 ZALORA Indonesia ®. Seluruh Hak Cipta Dilindungi.</p>
          <p className="text-[11px]">Replicated in Pixel-Perfect Zalora /s/men Standard.</p>
        </div>
      </footer>

      {/* =========================================================
          16. ZALORA OFFICIAL FLOATING PILL MOBILE BOTTOM NAVIGATION BAR
          (100% PERSIS KODE & SCREENSHOT ASLI ZALORA)
      ========================================================= */}
      <div 
        id="mobile_bottom_nav" 
        className="fixed bottom-4 sm:bottom-6 inset-x-0 mx-auto z-50 w-[92%] max-w-[390px] md:hidden pointer-events-none"
        style={{ left: 0, right: 0, marginLeft: 'auto', marginRight: 'auto' }}
      >
        <div className="rounded-full bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_10px_35px_rgba(0,0,0,0.15),0_2px_10px_rgba(0,0,0,0.06)] px-2 py-1 pointer-events-auto">
          <div className="relative flex items-center justify-between">
            
            {/* 1. Home */}
            <a 
              aria-current={activeSegment === 'men' ? 'page' : undefined}
              onClick={() => {
                setActiveSegment('men');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="relative flex h-[54px] flex-1 flex-col items-center justify-center gap-y-0.5 cursor-pointer select-none"
            >
              <span aria-hidden="true" className="absolute inset-x-1 inset-y-1 rounded-full bg-black/[0.06] -z-10"></span>
              <span className="relative">
                <span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block size-6">
                    <path d="M4.278 3H21L5.555 19.875h14.682V21H3L18.443 4.125H4.278V3z" fill="#111827"></path>
                  </svg>
                </span>
              </span>
              <span className="relative text-[10px] leading-3 font-bold text-black">
                Home
              </span>
            </a>

            {/* 2. Kategori */}
            <a 
              onClick={() => {
                const el = document.getElementById('categories-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              className="relative flex h-[54px] flex-1 flex-col items-center justify-center gap-y-0.5 cursor-pointer select-none"
            >
              <span className="relative">
                <span>
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block size-6">
                    <path d="M23.64 20.376l-4.083-4.082a7.185 7.185 0 10-.922.922l4.082 4.083a.652.652 0 10.923-.923zM8.174 11.705a5.871 5.871 0 115.871 5.87 5.877 5.877 0 01-5.87-5.87z" fill="#737373"></path>
                    <path d="M2.169 15.222h1.68M2.169 18.222H5.04M2.169 21.222h7.033" stroke="#737373" strokeLinecap="round"></path>
                  </svg>
                </span>
              </span>
              <span className="relative text-[10px] leading-3 font-normal text-[#737373]">
                Kategori
              </span>
            </a>

            {/* 3. Tas */}
            <a 
              rel="noindex,nofollow" 
              aria-label="Go To Cart" 
              onClick={() => showNotification(`Tas belanja Anda: ${cart.length} item`)}
              className="relative flex h-[54px] flex-1 flex-col items-center justify-center gap-y-0.5 cursor-pointer select-none"
            >
              <span className="relative">
                <span>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block size-6">
                    <path fillRule="evenodd" clipRule="evenodd" d="M20.5 10.866v.975c0 .27-.224.488-.5.488a.494.494 0 01-.5-.488v-.975h-6v.975c0 .27-.224.488-.5.488a.494.494 0 01-.5-.488v-.975h-2.17L9.007 23.337a.987.987 0 00.986 1.076l12.999.111a.982.982 0 001.003-1.082l-1.411-12.576H20.5zm0-.976h2.083c.51 0 .938.375.994.87l1.41 12.577c.12 1.07-.672 2.034-1.77 2.151a2.072 2.072 0 01-.235.012l-13-.111c-1.104-.01-1.991-.89-1.982-1.968.001-.062.005-.123.011-.184l1.325-12.472a.991.991 0 01.995-.875H12.5v-.319c0-2.243 1.785-4.071 4-4.071 1.922 0 3.555 1.387 3.923 3.275.051.26.077.527.077.796v.32zm-1 0v-.319c0-.208-.02-.413-.059-.614-.28-1.437-1.51-2.481-2.941-2.481-1.651 0-3 1.38-3 3.095v.32h6z" fill="#737373"></path>
                  </svg>
                </span>
              </span>
              <span className="relative text-[10px] leading-3 font-normal text-[#737373]">
                Tas
              </span>
            </a>

            {/* 4. Wishlist */}
            <a 
              rel="noindex,nofollow" 
              aria-label="Wishlist" 
              onClick={() => showNotification(`Wishlist Anda: ${wishlist.length} item`)}
              className="relative flex h-[54px] flex-1 flex-col items-center justify-center gap-y-0.5 cursor-pointer select-none"
            >
              <span className="relative">
                <span>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block size-6">
                    <path fillRule="evenodd" clipRule="evenodd" d="M16.308 8.335c1.68-1.666 3.691-2.219 5.9-1.571 2.168.635 3.57 2.147 4.13 4.394.058.229.082.409.122.802l.012.127.028.279c-.039 1.496-.545 2.874-1.502 4.4-1.454 2.318-3.335 4.298-6.147 6.683-.362.306-.666.549-1.317 1.058l-.031.025c-.454.356-.665.522-.916.727-.375.305-.767.329-1.162.027-3.318-2.532-5.666-4.724-7.574-7.255-1.107-1.467-1.826-2.832-2.196-4.323-.805-3.25 1.625-6.761 4.946-7.141 1.989-.228 3.692.368 5.086 1.786.16.163.228.246.296.248.072 0 .145-.087.325-.266zm9.196 4.083a10.708 10.708 0 01-.04-.361 4.378 4.378 0 00-.095-.658c-.477-1.907-1.621-3.142-3.441-3.676-1.853-.543-3.49-.093-4.915 1.322-.74.735-1.317.744-2.04.01-1.176-1.199-2.574-1.688-4.258-1.495-2.721.312-4.75 3.243-4.09 5.907.334 1.345.993 2.594 2.024 3.962 1.836 2.435 4.11 4.56 7.339 7.028.244-.198.459-.368.898-.712l.032-.025c.64-.502.938-.74 1.287-1.034 2.74-2.324 4.557-4.237 5.946-6.451.87-1.387 1.316-2.602 1.353-3.817z" fill="#737373"></path>
                  </svg>
                </span>
              </span>
              <span className="relative text-[10px] leading-3 font-normal text-[#737373]">
                Wishlist
              </span>
            </a>

            {/* 5. Akun Saya */}
            <a 
              rel="noindex,nofollow" 
              href="https://wa.me/6281230112240"
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex h-[54px] flex-1 flex-col items-center justify-center gap-y-0.5 cursor-pointer select-none"
            >
              <span className="relative">
                <span>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block size-6">
                    <path fillRule="evenodd" clipRule="evenodd" d="M21.5 11a5.5 5.5 0 11-11 0 5.5 5.5 0 1111 0zm-1 0a4.5 4.5 0 10-8.999-.001A4.5 4.5 0 0020.5 11zm4 13.605c0 .512-.068 1.02-.2 1.522a.5.5 0 01-.966-.254c.11-.42.166-.843.166-1.268 0-3.349-3.339-6.105-7.5-6.105s-7.5 2.756-7.5 6.105c0 .281.074.964.137 1.304a.5.5 0 11-.984.182 10.96 10.96 0 01-.153-1.486c0-3.948 3.824-7.105 8.5-7.105s8.5 3.157 8.5 7.105z" fill="#737373"></path>
                  </svg>
                </span>
              </span>
              <span className="relative text-[10px] leading-3 font-normal text-[#737373]">
                Akun Saya
              </span>
            </a>

          </div>
        </div>
      </div>

    </div>
  );
}
