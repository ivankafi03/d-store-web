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

const HERO_CAROUSEL_ITEMS = [
  {
    id: 'mcm-1',
    name: 'MCM Stark Backpack in Visetos Cognac',
    brand: 'MCM',
    price: 23529600,
    originalPrice: 28500000,
    discount: '17% OFF',
    badge: 'LUXURY',
    category: 'Tas & Aksesoris',
    image: 'https://dynamic.zacdn.com/DYfZKIsvSdTEor843nvuHqS3ws8=/0x440/filters:quality(70):format(webp)/https://static-id.zacdn.com/p/mcm-9852-9609835-1.jpg?fm=webp'
  },
  {
    id: 'mcm-2',
    name: 'MCM Aren Crossbody Bag in Visetos',
    brand: 'MCM',
    price: 7218200,
    originalPrice: 9500000,
    discount: '24% OFF',
    badge: 'LUXURY',
    category: 'Tas & Aksesoris',
    image: 'https://dynamic.zacdn.com/pq37__os3h9tBlGxLRYwp0wBNvQ=/0x440/filters:quality(70):format(webp)/https://static-id.zacdn.com/p/mcm-7864-9854135-1.jpg?fm=webp'
  },
  {
    id: 'mcm-3',
    name: 'MCM Aren Bifold Wallet in Visetos Cognac',
    brand: 'MCM',
    price: 4491840,
    originalPrice: 5800000,
    discount: '22% OFF',
    badge: 'LUXURY',
    category: 'Dompet & Aksesoris',
    image: 'https://dynamic.zacdn.com/iMltLzOX6aae5wEM4K1z1LsA0x8=/0x440/filters:quality(70):format(webp)/https://static-id.zacdn.com/p/mcm-9770-2609835-1.jpg?fm=webp'
  },
  {
    id: 'mcm-4',
    name: 'MCM Fursten Belt Bag in Visetos',
    brand: 'MCM',
    price: 5212800,
    originalPrice: 6900000,
    discount: '24% OFF',
    badge: 'LUXURY',
    category: 'Tas & Aksesoris',
    image: 'https://dynamic.zacdn.com/02QdE3-6W_P6zAMxB9MvOU4cg7E=/0x440/filters:quality(70):format(webp)/https://static-id.zacdn.com/p/mcm-5096-6342335-1.jpg?fm=webp'
  },
  {
    id: 'mcm-5',
    name: 'MCM Toni Shopper Medium in Visetos',
    brand: 'MCM',
    price: 17001600,
    originalPrice: 21000000,
    discount: '19% OFF',
    badge: 'LUXURY',
    category: 'Tas & Aksesoris',
    image: 'https://dynamic.zacdn.com/HT_fMeQEIp6gZJ1MmQbtwjy4BFA=/0x440/filters:quality(70):format(webp)/https://static-id.zacdn.com/p/mcm-7134-5759445-1.jpg?fm=webp'
  },
  {
    id: 'mcm-6',
    name: 'MCM Aren Leather Card Case Cognac',
    brand: 'MCM',
    price: 4588800,
    originalPrice: 5600000,
    discount: '18% OFF',
    badge: 'LUXURY',
    category: 'Dompet & Aksesoris',
    image: 'https://dynamic.zacdn.com/uSxof6DHGR3vGGSN0g1pcrMaU9E=/0x440/filters:quality(70):format(webp)/https://static-id.zacdn.com/p/mcm-4929-2242335-1.jpg?fm=webp'
  },
  {
    id: 'mcm-7',
    name: 'MCM Klassik Card Case in Visetos',
    brand: 'MCM',
    price: 3379200,
    originalPrice: 4200000,
    discount: '20% OFF',
    badge: 'LUXURY',
    category: 'Dompet & Aksesoris',
    image: 'https://dynamic.zacdn.com/9I19UUORaZEt_kcvT6ByTZsBO-Y=/0x440/filters:quality(70):format(webp)/https://static-id.zacdn.com/p/mcm-7127-4959445-1.jpg?fm=webp'
  },
  {
    id: 'mcm-8',
    name: 'MCM Delmy Boston Bag in Visetos',
    brand: 'MCM',
    price: 17640000,
    originalPrice: 22000000,
    discount: '20% OFF',
    badge: 'LUXURY',
    category: 'Tas & Aksesoris',
    image: 'https://dynamic.zacdn.com/tkyzSgCd1QIAph5COE53mQ24MEU=/0x440/filters:quality(70):format(webp)/https://static-id.zacdn.com/p/mcm-3269-2265925-1.jpg?fm=webp'
  },
  {
    id: 'mcm-9',
    name: 'MCM Ottomar Travel Wallet in Visetos',
    brand: 'MCM',
    price: 5971200,
    originalPrice: 7500000,
    discount: '20% OFF',
    badge: 'LUXURY',
    category: 'Dompet & Aksesoris',
    image: 'https://dynamic.zacdn.com/OFDKkr-epBf0ZoI0x4UrZybeR0Y=/0x440/filters:quality(70):format(webp)/https://static-id.zacdn.com/p/mcm-4719-7342335-1.jpg?fm=webp'
  },
  {
    id: 'mcm-10',
    name: 'MCM Aren Bifold Coin Wallet Black',
    brand: 'MCM',
    price: 4588800,
    originalPrice: 5600000,
    discount: '18% OFF',
    badge: 'LUXURY',
    category: 'Dompet & Aksesoris',
    image: 'https://dynamic.zacdn.com/7DRjA_9MzA9XrTPNgKa1GgbuWdI=/0x440/filters:quality(70):format(webp)/https://static-id.zacdn.com/p/mcm-4927-7242335-1.jpg?fm=webp'
  },
  {
    id: 'mcm-11',
    name: 'MCM Aren Shoulder Bag in Embossed Leather',
    brand: 'MCM',
    price: 10902100,
    originalPrice: 14000000,
    discount: '22% OFF',
    badge: 'LUXURY',
    category: 'Tas & Aksesoris',
    image: 'https://dynamic.zacdn.com/HLSV9HsSIVvEMlQYOjVnXd9-4ac=/0x440/filters:quality(70):format(webp)/https://static-id.zacdn.com/p/mcm-7892-9954135-1.jpg?fm=webp'
  },
  {
    id: 'mcm-12',
    name: 'MCM Toni Mini Shopper in Visetos',
    brand: 'MCM',
    price: 13008000,
    originalPrice: 16500000,
    discount: '21% OFF',
    badge: 'LUXURY',
    category: 'Tas & Aksesoris',
    image: 'https://dynamic.zacdn.com/e_JhvDvkYp6_gvvyW02mQVk-KEo=/0x440/filters:quality(70):format(webp)/https://static-id.zacdn.com/p/mcm-7128-4859445-1.jpg?fm=webp'
  },
  {
    id: 'mcm-13',
    name: 'MCM Aren Pouch with Strap in Visetos',
    brand: 'MCM',
    price: 5212800,
    originalPrice: 6800000,
    discount: '23% OFF',
    badge: 'LUXURY',
    category: 'Tas & Aksesoris',
    image: 'https://dynamic.zacdn.com/lIcHnHYL3RN5xG7oUZNvQGKyqQ4=/0x440/filters:quality(70):format(webp)/https://static-id.zacdn.com/p/mcm-5033-9242335-1.jpg?fm=webp'
  },
  {
    id: 'mcm-14',
    name: 'MCM Aren Medium Hobo Bag in Visetos',
    brand: 'MCM',
    price: 16137600,
    originalPrice: 20000000,
    discount: '19% OFF',
    badge: 'LUXURY',
    category: 'Tas & Aksesoris',
    image: 'https://dynamic.zacdn.com/ECyxzFOOGdRAiSmnVSI7H0o4Cv4=/0x440/filters:quality(70):format(webp)/https://static-id.zacdn.com/p/mcm-7133-7859445-1.jpg?fm=webp'
  },
  {
    id: 'mcm-15',
    name: 'MCM Logo Socks in Cotton Blend',
    brand: 'MCM',
    price: 987840,
    originalPrice: 1400000,
    discount: '29% OFF',
    badge: 'LUXURY',
    category: 'Aksesoris Olahraga',
    image: 'https://dynamic.zacdn.com/ZxtjgT69OtxCo4iiioHS03iIC2U=/0x440/filters:quality(70):format(webp)/https://static-id.zacdn.com/p/mcm-9671-1609835-1.jpg?fm=webp'
  }
];

export default function ZaloraMenDevPage() {
  const [activeSegment, setActiveSegment] = useState('women');
  const [activeSpeedDealIndex, setActiveSpeedDealIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [showSeoText, setShowSeoText] = useState(false);
  const [activeProductModal, setActiveProductModal] = useState(null);
  const [selectedSize, setSelectedSize] = useState('42 / L');
  const [showQuickAlert, setShowQuickAlert] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Hero mini-card carousel state
  const heroSliderRef = useRef(null);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  const handleHeroScroll = () => {
    if (!heroSliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = heroSliderRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;
    const index = Math.round((scrollLeft / maxScroll) * 4);
    setHeroSlideIndex(Math.min(4, Math.max(0, index)));
  };

  // Mini cards pointer drag support
  const isDraggingMini = useRef(false);
  const startXMini = useRef(0);
  const scrollStartMini = useRef(0);
  const dragDistMini = useRef(0);

  const onMiniPointerDown = (e) => {
    isDraggingMini.current = true;
    startXMini.current = e.pageX || e.clientX;
    scrollStartMini.current = heroSliderRef.current?.scrollLeft || 0;
    dragDistMini.current = 0;
  };

  const onMiniPointerMove = (e) => {
    if (!isDraggingMini.current || !heroSliderRef.current) return;
    const x = e.pageX || e.clientX;
    const walk = x - startXMini.current;
    dragDistMini.current = Math.abs(walk);
    heroSliderRef.current.scrollLeft = scrollStartMini.current - walk;
  };

  const onMiniPointerUp = () => {
    isDraggingMini.current = false;
  };

  // Hero BIG slide (swipe the whole hero banner) state
  const heroBigRef = useRef(null);
  const [heroBigIndex, setHeroBigIndex] = useState(0);

  const handleHeroBigScroll = () => {
    if (!heroBigRef.current) return;
    const { scrollLeft, clientWidth } = heroBigRef.current;
    if (clientWidth <= 0) return;
    const idx = Math.round(scrollLeft / clientWidth);
    setHeroBigIndex(Math.max(0, Math.min(2, idx)));
  };

  // Big Banner pointer drag support (desktop mouse drag + mobile swipe)
  const isDraggingBig = useRef(false);
  const startXBig = useRef(0);
  const scrollStartBig = useRef(0);
  const dragDistBig = useRef(0);

  const onHeroBigPointerDown = (e) => {
    isDraggingBig.current = true;
    startXBig.current = e.pageX || e.clientX;
    scrollStartBig.current = heroBigRef.current?.scrollLeft || 0;
    dragDistBig.current = 0;
  };

  const onHeroBigPointerMove = (e) => {
    if (!isDraggingBig.current || !heroBigRef.current) return;
    const x = e.pageX || e.clientX;
    const walk = x - startXBig.current;
    dragDistBig.current = Math.abs(walk);
    heroBigRef.current.scrollLeft = scrollStartBig.current - walk;
  };

  const onHeroBigPointerUp = () => {
    if (!isDraggingBig.current || !heroBigRef.current) return;
    isDraggingBig.current = false;
    const clientWidth = heroBigRef.current.clientWidth;
    if (clientWidth > 0) {
      const idx = Math.round(heroBigRef.current.scrollLeft / clientWidth);
      const clamped = Math.max(0, Math.min(2, idx));
      heroBigRef.current.scrollTo({ left: clamped * clientWidth, behavior: 'smooth' });
      setHeroBigIndex(clamped);
    }
  };

  const goToHeroBigSlide = (index) => {
    if (!heroBigRef.current) return;
    const clientWidth = heroBigRef.current.clientWidth;
    heroBigRef.current.scrollTo({ left: index * clientWidth, behavior: 'smooth' });
    setHeroBigIndex(index);
  };

  const handleSlideClick = (action) => {
    if (dragDistBig.current > 10) return; // User was dragging to slide
    action();
  };

  // Brands That Got You Looking grid pointer drag & scroll support
  const brandsGridRef = useRef(null);
  const isDraggingBrands = useRef(false);
  const startXBrands = useRef(0);
  const scrollStartBrands = useRef(0);
  const dragDistBrands = useRef(0);

  const onBrandsPointerDown = (e) => {
    isDraggingBrands.current = true;
    startXBrands.current = e.pageX || e.clientX;
    scrollStartBrands.current = brandsGridRef.current?.scrollLeft || 0;
    dragDistBrands.current = 0;
  };

  const onBrandsPointerMove = (e) => {
    if (!isDraggingBrands.current || !brandsGridRef.current) return;
    const x = e.pageX || e.clientX;
    const walk = x - startXBrands.current;
    dragDistBrands.current = Math.abs(walk);
    brandsGridRef.current.scrollLeft = scrollStartBrands.current - walk;
  };

  const onBrandsPointerUp = () => {
    isDraggingBrands.current = false;
  };

  // Speed deals auto rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSpeedDealIndex((prev) => (prev + 1) % ZALORA_SPEED_DEALS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const formatRupiah = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

  const filteredProducts = ZALORA_PRODUCTS.filter((prod) => {
    if (selectedBrandFilter && prod.brand.toLowerCase() !== selectedBrandFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return prod.name.toLowerCase().includes(q) || prod.brand.toLowerCase().includes(q) || prod.category.toLowerCase().includes(q);
    }
    return true;
  });

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
    const text = encodeURIComponent(`Halo Admin D Store, saya ingin order:\nâ€¢ Produk: ${pName}\nâ€¢ Harga: ${formatRupiah(price)}`);
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
          1. TOP UTILITY ANNOUNCEMENT BAR (Desktop Only)
      ========================================================= */}
      <div className="hidden md:block bg-[#F8F8F8] text-[#555555] text-[11px] py-1.5 px-4 border-b border-[#EAEAEA]">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
            <span className="flex items-center gap-1">
              <span className="text-[#888]">â†º</span> 30 Hari Pengembalian Gratis | S&amp;K Berlaku &gt;
            </span>
            <span className="flex items-center gap-1 font-semibold text-black">
              <span className="bg-black text-white text-[9px] px-1.5 py-0.2 rounded font-bold">VIP</span>
              ZALORA VIP: Gratis Ongkir Setahun Tanpa Min. Pembelian &gt;
            </span>
            <span className="hidden lg:inline-flex items-center gap-1 text-[#555]">
              âœ“ Original 100% Brand Lokal &amp; Internasional
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-[#666]">
            <a href="https://wa.me/6281230112240" target="_blank" rel="noopener noreferrer" className="hover:text-black transition">
              Bantuan
            </a>
            <span className="text-zinc-300">â€¢</span>
            <a href="https://wa.me/6281230112240" target="_blank" rel="noopener noreferrer" className="hover:text-black transition">
              Kontak
            </a>
            <span className="text-zinc-300">â€¢</span>
            <span className="hidden sm:inline hover:text-black cursor-pointer">Download App</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          2. MAIN DESKTOP HEADER (Hidden on Mobile)
      ========================================================= */}
      <header className="hidden md:block sticky top-0 z-40 bg-white border-b border-[#EAEAEA] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1240px] mx-auto px-4 py-3 flex items-center justify-between gap-4 sm:gap-8">
          
          {/* Zalora Wordmark Logo */}
          <Link href="/store" className="shrink-0 flex items-center gap-1">
            <span className="text-2xl sm:text-[28px] font-black tracking-[0.18em] uppercase text-black hover:opacity-90 transition">
              ZALORA
            </span>
          </Link>

          {/* Search Bar Pill */}
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
                  className="absolute right-3.5 text-[#888] hover:text-black cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Header Action Icons */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-[#222]">
            <a 
              href="https://wa.me/6281230112240"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 cursor-pointer hover:opacity-75 transition select-none"
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="hidden xl:inline text-xs font-semibold">Akun Saya</span>
            </a>

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
        <div className="max-w-[1240px] mx-auto px-4">
          <nav className="flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
            {ZALORA_SEGMENTS.map((seg) => {
              const isActive = seg.id === activeSegment;
              return (
                <button
                  key={seg.id}
                  type="button"
                  onClick={() => setActiveSegment(seg.id)}
                  className={`pb-2.5 pt-1 border-b-2 transition-all cursor-pointer ${
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

      {/* =========================================================
          2B. MOBILE TOP BAR â€” Search only
      ========================================================= */}
      <div className="md:hidden sticky top-0 z-40 bg-white px-4 py-2.5 flex items-center gap-3 border-b border-zinc-200">
        {/* Search pill â€” full width like Zalora */}
        <button
          type="button"
          onClick={() => setShowSearchModal(true)}
          className="flex-1 flex items-center gap-2 bg-[#F2F2F2] rounded-full px-4 py-2.5 text-zinc-500 text-sm cursor-pointer active:bg-zinc-200 transition"
          aria-label="Cari Produk"
        >
          <Search className="w-4 h-4 shrink-0 stroke-[2]" />
          <span className="text-[13px] font-normal">Cari produk, merek...</span>
        </button>
        {/* Cart icon */}
        <div
          onClick={() => showNotification(`Tas belanja: ${cart.length} item`)}
          className="relative cursor-pointer"
        >
          <ShoppingBag className="w-6 h-6 text-zinc-800" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </div>
      </div>

      {/* Mobile Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-[150] bg-white flex flex-col p-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-200">
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk, tren, dan merek..."
                className="w-full bg-zinc-100 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border border-transparent focus:border-black"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setShowSearchModal(false);
                    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowSearchModal(false)}
              className="text-sm font-bold text-zinc-700 hover:text-black p-1 cursor-pointer"
            >
              Batal
            </button>
          </div>

          <div className="pt-4">
            <div className="text-xs font-bold uppercase text-zinc-400 mb-2">Pencarian Populer</div>
            <div className="flex flex-wrap gap-2">
              {['Adidas', 'Sepatu Sneakers', 'Kaos Kaki', 'Clarks', 'Batik', 'Skechers', 'Vans', 'Tommy Hilfiger'].map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSearchQuery(s);
                    setShowSearchModal(false);
                    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 text-xs font-medium hover:bg-zinc-200 text-zinc-800 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          3A. HERO MOBILE — ZALORA-STYLE DRAGGABLE CAROUSEL (3 SLIDES)
      ========================================================= */}
      <div className="md:hidden w-full relative select-none">

        {/* Carousel Container — snap-x with desktop mouse drag & mobile touch swipe */}
        <div
          ref={heroBigRef}
          onScroll={handleHeroBigScroll}
          onMouseDown={onHeroBigPointerDown}
          onMouseMove={onHeroBigPointerMove}
          onMouseUp={onHeroBigPointerUp}
          onMouseLeave={onHeroBigPointerUp}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing"
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
        >

          {/* === SLIDE 1: Adidas 10.10 Super Flash Sale with Integrated Mini Cards === */}
          <div className="shrink-0 w-full min-w-full snap-start relative bg-[#141414] overflow-hidden" style={{ height: '520px' }}>
            {/* Top region: Model Photo & Flash Sale graphic */}
            <div className="relative w-full h-[360px] overflow-hidden">
              <img
                src="/images/zalora-hero-top.png"
                alt="ZALORA 10.10 Flash Sale Adidas"
                className="w-full h-full object-cover object-top pointer-events-none"
                draggable={false}
              />
              {/* Overlay link with data-carousel-passthrough */}
              <a
                href="#"
                data-carousel-passthrough="true"
                className="absolute inset-0 z-20 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  handleSlideClick(() => {
                    setSelectedBrandFilter('ADIDAS');
                    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                    showNotification('Koleksi Adidas Flash Sale!');
                  });
                }}
              />
            </div>

            {/* Bottom region: Mini product cards directly inside the dark hero base */}
            <div className="absolute bottom-0 inset-x-0 z-30 pb-3 pt-1 bg-gradient-to-t from-black via-black/95 to-transparent">
              {/* Horizontal mini card slider with exact Zalora markup */}
              <div
                ref={heroSliderRef}
                onScroll={handleHeroScroll}
                onMouseDown={onMiniPointerDown}
                onMouseMove={onMiniPointerMove}
                onMouseUp={onMiniPointerUp}
                onMouseLeave={onMiniPointerUp}
                className="flex w-auto gap-2 overflow-x-auto pb-2 px-3 scrollbar-thin scrollbar-track-transparent no-scrollbar cursor-grab active:cursor-grabbing"
                style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
              >
                {HERO_CAROUSEL_ITEMS.map((item) => (
                  <a
                    key={item.id}
                    className="flex-none rounded-lg w-[24vw] tablet:w-[14vw] bg-white cursor-pointer select-none active:scale-95 transition"
                    onClick={(e) => {
                      e.preventDefault();
                      if (dragDistMini.current > 10) return;
                      setActiveProductModal(item);
                    }}
                  >
                    <div className="relative">
                      <img
                        alt={item.name}
                        src={item.image}
                        className="aspect-[75/103] w-full rounded-lg border-white bg-gray-50 object-cover pointer-events-none"
                        onError={(e) => { e.target.src = '/images/hero-card-1.png'; }}
                      />
                      <div className="absolute bottom-1 left-1">
                        <span className="flex w-fit items-center justify-center truncate rounded bg-white bg-opacity-90 px-0.5 text-xxs font-bold text-red-60 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.08)] tablet:text-sm">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="#fff" xmlns="http://www.w3.org/2000/svg" className="inline-block size-4">
                            <path fillRule="evenodd" clipRule="evenodd" d="M18 7.278V5.556a.658.658 0 00-.123-.393A.376.376 0 0017.58 5H2.42a.376.376 0 00-.297.163.658.658 0 00-.123.393v8.888c0 .148.044.29.123.393A.376.376 0 002.42 15h15.16a.376.376 0 00.297-.163.658.658 0 00.123-.393v-1.723a.674.674 0 00-.095-.35.418.418 0 00-.24-.193c-.38-.103-.72-.376-.965-.772A2.7 2.7 0 0116.32 10a2.7 2.7 0 01.379-1.406c.244-.396.585-.67.964-.772a.418.418 0 00.241-.192.674.674 0 00.095-.352zM3 14h14v-1.006a2.779 2.779 0 01-1.152-1.063A3.7 3.7 0 0115.321 10a3.7 3.7 0 01.527-1.93A2.78 2.78 0 0117 7.005V6H3v8z" fill="#297E84" className="fill-red-60"></path>
                            <path fillRule="evenodd" clipRule="evenodd" d="M7 5.5a.5.5 0 01.5.5v.8a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm0 3.2a.5.5 0 01.5.5v1.6a.5.5 0 01-1 0V9.2a.5.5 0 01.5-.5zm0 4a.5.5 0 01.5.5v.8a.5.5 0 01-1 0v-.8a.5.5 0 01.5-.5z" fill="#297E84" className="fill-red-60"></path>
                            <rect x="12" y="10" width="8" height="8" rx="4" fill="#297E84" className="fill-red-60"></rect>
                            <path fillRule="evenodd" clipRule="evenodd" d="M15.34 15.233l-1.468-1.478a.314.314 0 00-.446 0 .32.32 0 000 .45l1.69 1.702a.314.314 0 00.447 0l3.011-3.031a.32.32 0 000-.45.314.314 0 00-.446 0l-2.788 2.807z"></path>
                          </svg>
                          <span>Rp&nbsp;{Number(item.price).toLocaleString('id-ID')}</span>
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Mini cards 5 dots indicator */}
              <div className="flex items-center justify-center gap-1 pt-2">
                {[0, 1, 2, 3, 4].map((dot) => (
                  <button
                    key={dot}
                    type="button"
                    onClick={() => {
                      if (!heroSliderRef.current) return;
                      const { scrollWidth, clientWidth } = heroSliderRef.current;
                      heroSliderRef.current.scrollTo({ left: (dot / 4) * (scrollWidth - clientWidth), behavior: 'smooth' });
                      setHeroSlideIndex(dot);
                    }}
                    className={`h-[3px] rounded-full transition-all duration-300 cursor-pointer ${
                      dot === heroSlideIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                    aria-label={`Mini card dot ${dot + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* === SLIDE 2: Tommy Hilfiger Brand Day (as user requested: csa=26w38herobranddaytommyhilfiger) === */}
          <div className="shrink-0 w-full min-w-full snap-start relative overflow-hidden flex flex-col justify-between" style={{ height: '520px', backgroundColor: '#071630' }}>
            {/* Background design accents */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#071630] via-[#0E2A59] to-[#051024] pointer-events-none" />
            
            {/* Tommy Hilfiger Ribbon header */}
            <div className="relative z-10 w-full flex items-center justify-between px-5 pt-6">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-7 border border-white/20 shadow-xs">
                  <div className="w-1/2 bg-white" />
                  <div className="w-1/2 bg-[#C8102E]" />
                </div>
                <span className="text-white text-xs font-black tracking-widest uppercase">TOMMY HILFIGER</span>
              </div>
              <span className="bg-[#C8102E] text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider">
                BRAND DAY
              </span>
            </div>

            {/* Tommy Hilfiger Banner Content */}
            <div className="relative z-10 px-6 py-4 flex flex-col items-center text-center">
              <div className="text-zinc-300 text-[11px] font-bold tracking-[0.25em] uppercase mb-1">
                EXCLUSIVE COLLECTION
              </div>
              <h2 className="text-white text-3xl font-black tracking-tight leading-none mb-2">
                CLASSIC AMERICAN COOL
              </h2>
              <div className="inline-block bg-white text-[#071630] text-xs font-black px-3 py-1 rounded-full mb-4 shadow-md">
                DISKON HINGGA 50% + VOUCHER 15%
              </div>
              <div className="w-48 h-48 rounded-2xl overflow-hidden bg-white/5 border border-white/10 p-2 shadow-2xl mb-4 flex items-center justify-center">
                <img
                  src="https://images.ctfassets.net/9q8du028z7sn/72LwXOzRKd7j03GjxUBF8B/a0171940ad0d92dee1eeda68e9a6fc06/225x225_BB2026_TOMMYHILFIGER.png"
                  alt="Tommy Hilfiger Collection"
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>
              <span className="bg-white text-black text-xs font-bold px-6 py-2 rounded-full tracking-wider shadow-lg active:scale-95 transition">
                SHOP NOW &gt;
              </span>
            </div>

            <div className="relative z-10 pb-4 text-center text-zinc-400 text-[10px]">
              S&amp;K Berlaku | Periode Terbatas
            </div>

            {/* Clickable Overlay link matching Zalora DOM */}
            <a
              href="#"
              data-carousel-passthrough="true"
              className="absolute inset-0 z-20 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                handleSlideClick(() => {
                  setSelectedBrandFilter('TOMMY HILFIGER');
                  document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                  showNotification('Koleksi Tommy Hilfiger Brand Day!');
                });
              }}
            />
          </div>

          {/* === SLIDE 3: On Running Performance Sports === */}
          <div className="shrink-0 w-full min-w-full snap-start relative overflow-hidden flex flex-col justify-between" style={{ height: '520px', backgroundColor: '#111114' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-[#18181D] via-[#111114] to-[#09090B] pointer-events-none" />

            <div className="relative z-10 w-full flex items-center justify-between px-5 pt-6">
              <span className="text-white text-base font-black lowercase tracking-tighter">on</span>
              <span className="bg-white/15 text-white text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full tracking-wider border border-white/20">
                SWISS ENGINEERING
              </span>
            </div>

            <div className="relative z-10 px-6 py-4 flex flex-col items-center text-center">
              <div className="text-zinc-400 text-[11px] font-bold tracking-[0.2em] uppercase mb-1">
                RUNNING &amp; ALL-DAY SNEAKERS
              </div>
              <h2 className="text-white text-3xl font-black tracking-tight leading-tight mb-2">
                CLOUDMONSTER &amp; CLOUDTILT
              </h2>
              <div className="inline-block bg-white/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full mb-4">
                EXTRA VOUCHER 10% OFF
              </div>
              <div className="w-48 h-48 rounded-2xl overflow-hidden bg-white/5 border border-white/10 p-3 shadow-2xl mb-4 flex items-center justify-center">
                <img
                  src="https://images.ctfassets.net/9q8du028z7sn/6JllWuRECk8AXKnFvPKoyM/4ed51d752d605cce34ebe6a2d9db6a2a/225x225_BB2026_ON.png"
                  alt="On Running Shoes"
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>
              <span className="bg-white text-black text-xs font-bold px-6 py-2 rounded-full tracking-wider shadow-lg active:scale-95 transition">
                SHOP ON RUNNING &gt;
              </span>
            </div>

            <div className="relative z-10 pb-4 text-center text-zinc-400 text-[10px]">
              Original 100% Guaranteed | Free Shipping
            </div>

            {/* Clickable Overlay link */}
            <a
              href="#"
              data-carousel-passthrough="true"
              className="absolute inset-0 z-20 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                handleSlideClick(() => {
                  setSelectedBrandFilter('ON');
                  document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                  showNotification('Koleksi On Running Swiss Performance!');
                });
              }}
            />
          </div>

        </div>

        {/* Carousel Slide Dots Indicator (floating at bottom center of hero) */}
        <div className="absolute bottom-1.5 inset-x-0 z-40 flex items-center justify-center gap-1.5 pointer-events-none">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToHeroBigSlide(i)}
              className={`h-1 rounded-full transition-all duration-300 pointer-events-auto cursor-pointer ${
                i === heroBigIndex ? 'w-6 bg-white shadow-sm' : 'w-1.5 bg-white/40'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Left & Right Arrow buttons for quick desktop/tablet sliding */}
        {heroBigIndex > 0 && (
          <button
            type="button"
            onClick={() => goToHeroBigSlide(heroBigIndex - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {heroBigIndex < 2 && (
          <button
            type="button"
            onClick={() => goToHeroBigSlide(heroBigIndex + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>


      <section className="md:hidden px-4 py-3">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {/* 1. Zalora 10.10 Sale Countdown */}
          <div
            onClick={() => {
              showNotification('ZALORA 10.10 Sale Countdown Aktif!');
              document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-16 h-16 shrink-0 rounded-full bg-black text-white flex flex-col items-center justify-center p-1 text-center cursor-pointer active:scale-95 transition"
          >
            <span className="text-[7px] leading-[9px] font-bold tracking-tight uppercase">ZALORA</span>
            <span className="text-[12px] leading-[13px] font-black tracking-tight text-white">10.10</span>
            <span className="text-[7px] leading-[9px] font-extrabold uppercase">SALE</span>
            <span className="text-[5px] leading-[6px] tracking-tight text-zinc-400 uppercase">COUNTDOWN</span>
          </div>

          {/* 2. Adidas */}
          <div
            onClick={() => {
              setSelectedBrandFilter('ADIDAS');
              document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
              showNotification('Brand: Adidas');
            }}
            className="w-16 h-16 shrink-0 rounded-full bg-black text-white flex items-center justify-center cursor-pointer active:scale-95 transition"
          >
            <svg width="32" height="24" viewBox="0 0 32 24" fill="currentColor">
              <path d="M5 22L1.5 15H6L9 22H5ZM14 22L8 11H12.5L18.5 22H14ZM23 22L15 0H19.5L27 22H23Z"/>
            </svg>
          </div>

          {/* 3. On Running */}
          <div
            onClick={() => {
              setSelectedBrandFilter('ON');
              document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
              showNotification('Brand: On Running');
            }}
            className="w-16 h-16 shrink-0 rounded-full bg-black text-white flex items-center justify-center cursor-pointer active:scale-95 transition"
          >
            <span className="font-black text-2xl lowercase tracking-tighter leading-none">on</span>
          </div>

          {/* 4. COACH */}
          <div
            onClick={() => {
              setSelectedBrandFilter('COACH');
              document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
              showNotification('Brand: COACH');
            }}
            className="w-16 h-16 shrink-0 rounded-full bg-black text-white flex items-center justify-center cursor-pointer active:scale-95 transition px-1"
          >
            <span className="font-serif font-black text-[11px] tracking-[0.2em] uppercase">COACH</span>
          </div>

          {/* 5. trendyol */}
          <div
            onClick={() => {
              setSearchQuery('trendyol');
              document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
              showNotification('Koleksi: trendyol');
            }}
            className="w-16 h-16 shrink-0 rounded-full bg-black text-white flex items-center justify-center cursor-pointer active:scale-95 transition px-1"
          >
            <span className="font-sans font-extrabold text-[11px] tracking-tight lowercase">trendyol</span>
          </div>

          {/* 6. Tommy Hilfiger */}
          <div
            onClick={() => {
              setSelectedBrandFilter('TOMMY HILFIGER');
              document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
              showNotification('Brand: Tommy Hilfiger');
            }}
            className="w-16 h-16 shrink-0 rounded-full bg-black text-white flex flex-col items-center justify-center cursor-pointer active:scale-95 transition p-1"
          >
            <span className="text-[8px] leading-[10px] font-black uppercase tracking-wider">TOMMY</span>
            <span className="text-[6.5px] leading-[8px] font-bold uppercase tracking-tight text-zinc-300">HILFIGER</span>
          </div>

          {/* 7. BOSS */}
          <div
            onClick={() => {
              setSelectedBrandFilter('HUGO BOSS');
              document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
              showNotification('Brand: Hugo Boss');
            }}
            className="w-16 h-16 shrink-0 rounded-full bg-black text-white flex items-center justify-center cursor-pointer active:scale-95 transition"
          >
            <span className="font-black text-[13px] uppercase tracking-wider">BOSS</span>
          </div>

          {/* 8. H&M */}
          <div
            onClick={() => {
              setSelectedBrandFilter('H&M');
              document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
              showNotification('Brand: H&M');
            }}
            className="w-16 h-16 shrink-0 rounded-full bg-black text-white flex items-center justify-center cursor-pointer active:scale-95 transition"
          >
            <span className="font-black text-[13px] uppercase tracking-tight">H&amp;M</span>
          </div>
        </div>
      </section>

      {/* =========================================================
          4A. DESKTOP HERO & TOP BRAND DEALS (Hidden on Mobile)
      ========================================================= */}
      <div className="hidden md:block">
        {/* Desktop Top Brand Deals Bubbles */}
        <section className="max-w-[1240px] mx-auto px-4 pt-6 pb-4">
          <div className="flex items-start gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2">
            {ZALORA_BUBBLES.map((bubble, i) => (
              <div
                key={i}
                onClick={() => {
                  setSearchQuery(bubble.label);
                  setSelectedBrandFilter(null);
                  const el = document.getElementById('products-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  showNotification(`Melihat koleksi: ${bubble.label}`);
                }}
                className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer w-[68px] sm:w-[84px] text-center select-none"
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
              </div>
            ))}
          </div>
        </section>

        {/* Desktop Main Hero Banner */}
        {ZALORA_HERO && (
          <section className="max-w-[1240px] mx-auto px-4 py-3">
            <div
              onClick={() => {
                setSelectedBrandFilter('ADIDAS');
                const el = document.getElementById('products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                showNotification('Flash Sale Adidas 10.10 Aktif!');
              }}
              className="block relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 group cursor-pointer"
            >
              <img
                src={ZALORA_HERO.desktopImg}
                alt={ZALORA_HERO.title}
                className="w-full h-auto object-cover group-hover:scale-[1.01] transition duration-500"
              />
              <div className="absolute top-3 left-3 sm:top-5 sm:left-5 bg-black/85 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>FLASH SALE BERAKHIR DALAM: 05:42:19</span>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* =========================================================
          5. SPEED DEALS & SECONDARY BANNER CAROUSEL
      ========================================================= */}
      <section className="max-w-[1240px] mx-auto px-0 md:px-4 py-1 md:py-4">
        <div className="relative rounded-none md:rounded-2xl overflow-hidden shadow-xs bg-zinc-100 group">
          <div 
            onClick={() => {
              const currentDeal = ZALORA_SPEED_DEALS[activeSpeedDealIndex];
              showNotification(`Penawaran Spesial: ${currentDeal?.title || 'Speed Deal'}`);
              const el = document.getElementById('products-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="block w-full cursor-pointer"
          >
            <img
              src={ZALORA_SPEED_DEALS[activeSpeedDealIndex]?.img}
              alt={ZALORA_SPEED_DEALS[activeSpeedDealIndex]?.title}
              className="w-full h-auto object-cover transition-opacity duration-500"
            />
          </div>

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
          6. BRANDS THAT GOT YOU LOOKING (Exact Zalora Grid Structure)
      ========================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 py-4 md:py-8">
        <div className="grid__inner-wrapper">
          <div className="post-type__title truncated truncated--two-lines font-bold text-lg md:text-xl text-[#262626]">
            Brands That Got You Looking
          </div>
          <div className="post-type__description truncated truncated--two-lines text-xs text-[#737373] mt-0.5 mb-3">
            Selected items only. T&amp;Cs apply.
          </div>
          <div className="post-type__content">
            <div className="cls-relative relative group">
              <div
                ref={brandsGridRef}
                onMouseDown={onBrandsPointerDown}
                onMouseMove={onBrandsPointerMove}
                onMouseUp={onBrandsPointerUp}
                onMouseLeave={onBrandsPointerUp}
                className="grid__contents-wrapper grid__contents-wrapper--scrollable overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing pb-2"
                id="grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'calc(-6.4px + 40vw) calc(-6.4px + 40vw) calc(-6.4px + 40vw) calc(-6.4px + 40vw)',
                  gridTemplateRows: 'auto auto',
                  gridAutoFlow: 'row',
                  justifyContent: 'unset',
                  gap: '8px'
                }}
              >
                {ZALORA_BRANDS_1.map((item, idx) => (
                  <a
                    key={idx}
                    className="no-decoration grid__item block rounded-lg overflow-hidden cursor-pointer select-none active:scale-95 transition"
                    onClick={(e) => {
                      e.preventDefault();
                      if (dragDistBrands.current > 10) return;
                      setSelectedBrandFilter(item.brand);
                      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                      showNotification(`Memfilter brand: ${item.brand}`);
                    }}
                    data-placement-id="static"
                    data-entry-id={`brand-item-${idx}`}
                  >
                    <div className="grid__media-item-wrapper aspect-[280/404] w-full overflow-hidden rounded-lg bg-gray-50">
                      <img
                        fetchPriority={idx === 0 ? "high" : "auto"}
                        className="grid__media-image w-full h-full object-cover pointer-events-none"
                        src={item.img}
                        alt={item.brand}
                        loading={idx === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  </a>
                ))}
              </div>

              {/* Zalora Right Control Button */}
              <button
                type="button"
                onClick={() => {
                  if (brandsGridRef.current) {
                    brandsGridRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                  }
                }}
                className="post-type__carousel-control-button post-type__carousel-right-button absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md border border-zinc-200 hidden md:flex items-center justify-center cursor-pointer hover:bg-zinc-50 z-10 transition active:scale-95"
                aria-label="Scroll Brands Right"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block h-6 w-6">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12.307 6.338c-.34.33-.34.865.003 1.194l3.979 3.821H4.667c-.368 0-.667.336-.667.75s.299.75.667.75h11.37l-3.73 3.618c-.34.33-.34.865.003 1.194a.898.898 0 001.237-.003l5.25-5.091a.824.824 0 00-.003-1.194l-5.25-5.042a.898.898 0 00-1.237.003z" fill="#262626"></path>
                </svg>
              </button>

              {/* Zalora Left Control Button */}
              <button
                type="button"
                onClick={() => {
                  if (brandsGridRef.current) {
                    brandsGridRef.current.scrollBy({ left: -320, behavior: 'smooth' });
                  }
                }}
                className="post-type__carousel-control-button post-type__carousel-left-button absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md border border-zinc-200 hidden md:flex items-center justify-center cursor-pointer hover:bg-zinc-50 z-10 transition active:scale-95 rotate-180"
                aria-label="Scroll Brands Left"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block h-6 w-6">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12.307 6.338c-.34.33-.34.865.003 1.194l3.979 3.821H4.667c-.368 0-.667.336-.667.75s.299.75.667.75h11.37l-3.73 3.618c-.34.33-.34.865.003 1.194a.898.898 0 001.237-.003l5.25-5.091a.824.824 0 00-.003-1.194l-5.25-5.042a.898.898 0 00-1.237.003z" fill="#262626"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          7. TOP TIER RECOMMENDATIONS (Real Product Grid)
      ========================================================= */}
      <section id="products-section" className="max-w-[1240px] mx-auto px-4 py-8 bg-[#FAFAFA] rounded-3xl my-6 scroll-mt-20">
        <div className="flex items-center justify-between mb-4">
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
            onClick={() => {
              setSelectedBrandFilter(null);
              setSearchQuery('');
              showNotification('Menampilkan seluruh rekomendasi!');
            }}
            className="text-xs font-bold uppercase underline tracking-wide text-black hover:text-[#555] cursor-pointer"
          >
            Reset Filter
          </button>
        </div>

        {/* Active Filter Chips */}
        {(selectedBrandFilter || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {selectedBrandFilter && (
              <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xs">
                <span>Brand: <strong>{selectedBrandFilter}</strong></span>
                <button 
                  type="button"
                  onClick={() => setSelectedBrandFilter(null)}
                  className="p-0.5 hover:bg-zinc-700 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {searchQuery && (
              <div className="inline-flex items-center gap-2 bg-zinc-200 text-black px-3 py-1.5 rounded-full text-xs font-bold">
                <span>Cari: &quot;{searchQuery}&quot;</span>
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-0.5 hover:bg-zinc-300 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedBrandFilter(null);
                setSearchQuery('');
              }}
              className="text-xs text-[#666] underline hover:text-black ml-1 cursor-pointer"
            >
              Hapus Semua Filter
            </button>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200">
            <p className="text-sm font-semibold text-zinc-600">Tidak ada produk yang cocok dengan filter atau kata kunci Anda.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedBrandFilter(null);
                setSearchQuery('');
              }}
              className="mt-3 px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition cursor-pointer"
            >
              Tampilkan Semua Produk
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((prod) => {
              const isWishlisted = wishlist.includes(prod.id);
              return (
                <div
                  key={prod.id}
                  onClick={() => setActiveProductModal(prod)}
                  className="group relative bg-white rounded-xl overflow-hidden border border-[#EAEAEA] shadow-2xs hover:shadow-lg transition duration-300 flex flex-col cursor-pointer"
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

                      {/* Action Button: Detail / Beli / WhatsApp */}
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveProductModal(prod);
                          }}
                          className="flex-1 py-2 px-3 rounded-lg bg-black text-white text-xs font-bold hover:bg-zinc-800 transition flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Lihat Detail</span>
                        </button>
                        <a
                          href={getWhatsAppOrderUrl(prod.name, prod.price)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
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
        )}
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
            <div
              key={idx}
              onClick={() => {
                setSearchQuery(trend.title);
                const el = document.getElementById('products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                showNotification(`Melihat inspirasi gaya: ${trend.title}`);
              }}
              className="group relative rounded-xl overflow-hidden bg-zinc-900 shadow-sm hover:shadow-lg transition duration-300 cursor-pointer"
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
            </div>
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
            <div
              key={idx}
              onClick={() => {
                setSearchQuery(steal.title);
                const el = document.getElementById('products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                showNotification(`Penawaran Steals: ${steal.title}`);
              }}
              className="block relative rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition duration-300 group cursor-pointer"
            >
              <img
                src={steal.img}
                alt={steal.title}
                className="w-full h-auto object-cover group-hover:scale-[1.02] transition duration-500"
                loading="lazy"
              />
            </div>
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
            <div
              key={idx}
              onClick={() => {
                setSelectedBrandFilter(item.brand);
                const el = document.getElementById('products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                showNotification(`Memfilter brand: ${item.brand}`);
              }}
              className="group relative rounded-xl overflow-hidden bg-zinc-100 shadow-2xs hover:shadow-md transition duration-300 cursor-pointer"
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
            </div>
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
            <div
              key={idx}
              onClick={() => {
                setSearchQuery(feat.title);
                const el = document.getElementById('products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                showNotification(`Koleksi: ${feat.title}`);
              }}
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition duration-300 bg-black cursor-pointer"
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
            </div>
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
            <div
              key={idx}
              onClick={() => showNotification(`Promo Pembayaran: ${banner.title}`)}
              className="block rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition duration-300 group cursor-pointer"
            >
              <img
                src={banner.img}
                alt={banner.title}
                className="w-full h-auto object-cover group-hover:scale-[1.02] transition duration-500"
                loading="lazy"
              />
            </div>
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
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSearchQuery(cat.name);
                const el = document.getElementById('products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                showNotification(`Kategori: ${cat.name}`);
              }}
              className="text-xs text-[#555] hover:text-black underline px-2.5 py-1 border-r border-zinc-300 last:border-none cursor-pointer"
            >
              {cat.name}
            </button>
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
              <button 
                type="button" 
                onClick={() => {
                  setSelectedBrandFilter(null);
                  const el = document.getElementById('products-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-[11px] underline text-[#666] hover:text-black cursor-pointer"
              >
                Lihat Semua Brand
              </button>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 leading-relaxed">
              {ZALORA_TOP_BRANDS.map((b, i) => (
                <span key={i} className="inline-flex items-center">
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedBrandFilter(b);
                      const el = document.getElementById('products-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                      showNotification(`Brand: ${b}`);
                    }}
                    className="hover:text-black hover:underline cursor-pointer text-left"
                  >
                    {b}
                  </button>
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
                  <button 
                    type="button"
                    onClick={() => {
                      setSearchQuery(s);
                      const el = document.getElementById('products-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                      showNotification(`Pencarian: ${s}`);
                    }}
                    className="hover:text-black hover:underline cursor-pointer text-left"
                  >
                    {s}
                  </button>
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
          <p>Â© 2026 ZALORA Indonesia Â®. Seluruh Hak Cipta Dilindungi.</p>
          <p className="text-[11px]">Replicated in Pixel-Perfect Zalora /s/men Standard.</p>
        </div>
      </footer>

      {/* =========================================================
          15. PRODUCT DETAIL MODAL (Quick View & Direct Order)
      ========================================================= */}
      {activeProductModal && (
        <div 
          className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveProductModal(null)}
        >
          <div 
            className="bg-white text-black rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveProductModal(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 shadow-md border border-zinc-200 flex items-center justify-center text-zinc-700 hover:text-black hover:bg-white transition cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto p-5 sm:p-8 flex flex-col md:flex-row gap-6">
              {/* Product Image */}
              <div className="w-full md:w-1/2 shrink-0">
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-zinc-100 shadow-inner">
                  <img
                    src={activeProductModal.image}
                    alt={activeProductModal.name}
                    className="w-full h-full object-cover"
                  />
                  {activeProductModal.badge && (
                    <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-extrabold px-2.5 py-1 rounded tracking-wider uppercase">
                      {activeProductModal.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Product Details & Actions */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[#777]">
                    {activeProductModal.brand}
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-black mt-1 leading-snug">
                    {activeProductModal.name}
                  </h2>
                  <div className="text-xs text-[#555] mt-1">
                    Kategori: {activeProductModal.category}
                  </div>

                  {/* Pricing */}
                  <div className="mt-4 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-xl sm:text-2xl font-black text-[#D52222]">
                        {formatRupiah(activeProductModal.price)}
                      </span>
                      {activeProductModal.originalPrice && (
                        <span className="text-xs sm:text-sm text-zinc-400 line-through">
                          {formatRupiah(activeProductModal.originalPrice)}
                        </span>
                      )}
                      {activeProductModal.discount && (
                        <span className="text-xs font-bold text-[#D52222] bg-rose-50 px-2 py-0.5 rounded">
                          {activeProductModal.discount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Size Selector */}
                  <div className="mt-5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
                      PILIH UKURAN: <span className="text-[#666] font-normal">{selectedSize}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['39 / S', '40 / M', '41 / L', '42 / XL', '43 / XXL'].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                            selectedSize === sz
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-zinc-700 border-zinc-300 hover:border-black'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Value Highlights */}
                  <div className="mt-5 space-y-2 text-[11px] text-[#666]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>100% Original &amp; Lisensi Resmi Terjamin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>30 Hari Pengembalian Gratis | Ready Stock</span>
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="mt-6 space-y-2.5 pt-4 border-t border-zinc-200">
                  <a
                    href={getWhatsAppOrderUrl(`${activeProductModal.name} (Ukuran: ${selectedSize})`, activeProductModal.price)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Pesan Langsung via WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      addToCart(activeProductModal);
                      setActiveProductModal(null);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Tambah ke Tas Belanja</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <rect width="24" height="24" rx="2" fill="#000"/>
                    <path d="M4.278 3H21L5.555 19.875h14.682V21H3L18.443 4.125H4.278V3z" fill="#fff"/>
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
