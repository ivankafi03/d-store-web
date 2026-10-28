'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, 
  Home,
  SlidersHorizontal,
  Package,
  ChevronRight, 
  ChevronLeft, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  MessageCircle, 
  X, 
  Check, 
  QrCode, 
  Share2,
  ShieldCheck,
  Zap,
  ExternalLink
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
  ZALORA_APPLY_NOW,
  ZALORA_FEATURED_COLLECTIONS,
  ZALORA_JUST_FOR_YOU_PRODUCTS,
  ZALORA_SAVE_BANNERS,
  ZALORA_PRODUCTS,
  ZALORA_TOP_BRANDS,
  ZALORA_POPULAR_SEARCHES,
  ZALORA_MEN_CATEGORIES,
  ZALORA_TOP_TIER_PRODUCTS
} from '@/lib/zaloraMenData';
import AppVariantModal from '@/app/components/AppVariantModal';
import CategoriesModal from '@/app/components/CategoriesModal';
import { getAppVariantData } from '@/lib/appVariantsData';
import { buildUnifiedCatalog, searchCatalog, getResolvedProductImage } from '@/lib/catalogTemplates';
import AdminEditToolbar from '@/app/components/AdminEditToolbar';
import VisualEditModal from '@/app/components/VisualEditModal';

const DEFAULT_HERO_SLIDE_1 = {
  id: 'hero-top-1',
  image: '/uploads/dstore_boss_hero_high_chest.jpg',
  title: 'D STORE 10.10 Super Flash Sale Akun Aplikasi Premium',
  brand: 'D STORE',
  link: '#'
};

const DEFAULT_HERO_SLIDE_2 = {
  id: 'hero-top-2',
  image: '/uploads/netflix_vip_syndicate_boss.jpg',
  title: 'NETFLIX PREMIUM 4K ULTRA HD',
  brand: 'NETFLIX',
  link: '/store/app/netflix'
};

const DEFAULT_HERO_SLIDE_3 = {
  id: 'hero-top-3',
  image: '/uploads/youtube_vip_boss.jpg',
  title: 'YOUTUBE PREMIUM & MUSIC HIFI',
  brand: 'YOUTUBE',
  link: '/store/app/youtube'
};

const DEFAULT_TOP_TIER_BANNER = {
  id: 'toptier-banner',
  image: '/uploads/banner_jasa_website_neo_brutalism.webp',
  title: 'Jasa Pembuatan Website Profesional',
  brand: 'JASA WEB',
  link: 'https://wa.me/6281230112240?text=Halo%20Admin%20D%20Store%2C%20saya%20tertarik%20dengan%20jasa%20pembuatan%20website.%20Boleh%20konsultasi%20mengenai%20paket%2C%20fitur%2C%20dan%20harganya%3F'
};

const HERO_CAROUSEL_ITEMS = [
  {
    "id": "hero-prod-netflix",
    "name": "Netflix Premium 4K UHD Anti-On Hold",
    "brand": "NETFLIX",
    "price": 3800,
    "originalPrice": 8360,
    "discount": "55% OFF",
    "badge": "BEST SELLER",
    "category": "Streaming & Film",
    "image": "/uploads/netflix-1791813396991.webp"
  },
  {
    "id": "hero-prod-chatgpt",
    "name": "ChatGPT Plus GPT-4o & Canvas Unlimited",
    "brand": "CHATGPT",
    "price": 20000,
    "originalPrice": 44000,
    "discount": "55% OFF",
    "badge": "POPULAR",
    "category": "AI & Tools",
    "image": "/uploads/2-1791814018806.webp"
  },
  {
    "id": "hero-prod-spotify",
    "name": "Spotify Premium Individual Garansi Penuh",
    "brand": "SPOTIFY",
    "price": 12000,
    "originalPrice": 26400,
    "discount": "55% OFF",
    "badge": "TRENDING",
    "category": "Musik & Audio",
    "image": "/uploads/1-1791814035223.webp"
  },
  {
    "id": "hero-prod-canva",
    "name": "Canva Pro Akses Edu & Lifetime Unlocked",
    "brand": "CANVA",
    "price": 3500,
    "originalPrice": 7700,
    "discount": "55% OFF",
    "badge": "BEST VALUE",
    "category": "Desain & Video",
    "image": "/uploads/3-1791814049823.webp"
  },
  {
    "id": "hero-prod-youtube",
    "name": "YouTube Premium & YT Music",
    "brand": "YOUTUBE",
    "price": 12000,
    "originalPrice": 49000,
    "discount": "75% OFF",
    "badge": "PALING LARIS",
    "category": "Streaming & Film",
    "image": "/uploads/4-1791814061966.webp"
  },
  {
    "id": "hero-prod-capcut",
    "name": "CapCut Pro Cloud & Preset Ekspor 4K",
    "brand": "CAPCUT",
    "price": 8000,
    "originalPrice": 17600,
    "discount": "55% OFF",
    "badge": "HOT",
    "category": "Desain & Video",
    "image": "/uploads/5-1791814090613.webp"
  },
  {
    "id": "hero-prod-disney",
    "name": "Disney+ Hotstar 4K Ultra HD & Dolby Atmos",
    "brand": "DISNEY+",
    "price": 4000,
    "originalPrice": 8800,
    "discount": "55% OFF",
    "badge": "FAVORITE",
    "category": "Streaming & Film",
    "image": "/uploads/6-1791814144432.webp"
  },
  {
    "id": "hero-prod-bstation",
    "name": "Bstation VIP Bilibili Anime & Donghua",
    "brand": "BSTATION",
    "price": 10000,
    "originalPrice": 22000,
    "discount": "55% OFF",
    "badge": "ANIME VIP",
    "category": "Streaming & Film",
    "image": "/uploads/14-1791812222958.webp"
  },
  {
    "id": "hero-prod-zoom",
    "name": "Zoom Pro 30 Jam Meeting 100 Peserta Private",
    "brand": "ZOOM",
    "price": 8000,
    "originalPrice": 17600,
    "discount": "55% OFF",
    "badge": "OFFICE",
    "category": "Office & Tools",
    "image": "/uploads/9-1791813181710.webp"
  },
  {
    "id": "hero-prod-duolingo",
    "name": "Duolingo Super Family Unlimited Hearts",
    "brand": "DUOLINGO",
    "price": 9000,
    "originalPrice": 19800,
    "discount": "55% OFF",
    "badge": "EDUKASI",
    "category": "Edukasi & Bahasa",
    "image": "/uploads/10-1791813257479.webp"
  },
  {
    "id": "hero-prod-meitu",
    "name": "Meitu VIP Unlocked All AI Filter & Portrait",
    "brand": "MEITU",
    "price": 5000,
    "originalPrice": 11000,
    "discount": "55% OFF",
    "badge": "VIP",
    "category": "Desain & Video",
    "image": "/uploads/8-1791813216396.webp"
  },
  {
    "id": "hero-prod-iqiyi",
    "name": "iQIYI VIP Drama China & Anime Sub Indo",
    "brand": "IQIYI",
    "price": 10000,
    "originalPrice": 22000,
    "discount": "55% OFF",
    "badge": "VIP ASIA",
    "category": "Streaming & Film",
    "image": "/uploads/15-1791812630133.webp"
  },
  {
    "id": "hero-prod-appletv",
    "name": "Apple TV+ Original Series & 4K Atmos",
    "brand": "APPLE TV",
    "price": 9000,
    "originalPrice": 19800,
    "discount": "55% OFF",
    "badge": "CINEMA",
    "category": "Streaming & Film",
    "image": "/uploads/11-1791812176017.webp"
  }
];


const TREND_CATEGORIES_CONFIG = {
  ai: {
    id: 'ai',
    catId: 'cat_1',
    name: 'AI Tools & Coding',
    badge: 'ARTIFICIAL INTELLIGENCE',
    color: '#10b981',
    bgBadge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    description: 'Model AI tercanggih, asisten coding otomatis & generator konten.',
    defaultApps: ['ChatGPT', 'Gemini AI', 'Captions AI', 'Google Colab', 'Flora AI', 'Framer AI']
  },
  streaming: {
    id: 'streaming',
    catId: 'cat_2',
    name: 'Streaming 4K Cinema',
    badge: 'ULTRA HD 4K CINEMA',
    color: '#e50914',
    bgBadge: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
    description: 'Nonton film, drama Asia & series eksklusif 4K tanpa jeda iklan.',
    defaultApps: ['Netflix', 'Disney+', 'Prime Video', 'YouTube Premium', 'Viu', 'Vidio', 'WeTV', 'Bstation', 'HBO Max']
  },
  design: {
    id: 'design',
    catId: 'cat_3',
    name: 'Desain & Kreator',
    badge: 'KREATOR & DESAIN GRAFIS',
    color: '#8b5cf6',
    bgBadge: 'bg-violet-500/10 text-violet-700 border-violet-500/20',
    description: 'Template premium, photo editing studio, dan video editing tanpa watermark.',
    defaultApps: ['Canva Pro', 'CapCut', 'Adobe', 'Remini', 'Alight Motion', 'Picsart', 'Meitu', 'Wink', 'Lightroom']
  },
  music: {
    id: 'music',
    catId: 'cat_4',
    name: 'Musik & Audio HiFi',
    badge: 'AUDIO LOSSLESS & HIFI',
    color: '#1db954',
    bgBadge: 'bg-green-500/10 text-green-700 border-green-500/20',
    description: 'Streaming lagu bebas iklan dengan kualitas suara Hi-Res Lossless 320 kbps.',
    defaultApps: ['Spotify', 'Apple Music', 'Deezer']
  },
  vpn: {
    id: 'vpn',
    catId: 'cat_6',
    name: 'VPN & Privasi Siber',
    badge: 'KEAMANAN & PRIVASI TOTAL',
    color: '#06b6d4',
    bgBadge: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
    description: 'Akses internet bebas blokir, enkripsi siber 256-bit dan server global kilat.',
    defaultApps: ['Surfshark VPN', 'Express VPN', 'HMA VPN']
  },
  office: {
    id: 'office',
    catId: 'cat_7',
    name: 'Office & Cloud',
    badge: 'PRODUKTIVITAS & CLOUD',
    color: '#0284c7',
    bgBadge: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
    description: 'Lisensi resmi produktivitas kantor, penyimpanan 1TB dan tool kolaborasi.',
    defaultApps: ['Microsoft 365', 'Zoom', 'GSUITE', 'WPS', 'Google Pro', 'Gmail Fresh']
  }
};

const FALLBACK_CATEGORY_PRODUCTS = {};

function useDraggableCarousel({ totalSlides, interval = 4500, loop = true }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const isInteractingRef = useRef(false);
  const mouseStartX = useRef(0);
  const mouseScrollStart = useRef(0);
  const mouseMoved = useRef(false);
  const lastTouchTime = useRef(0);

  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      if (isInteractingRef.current || Date.now() - lastTouchTime.current < 4000 || !containerRef.current) return;
      const el = containerRef.current;
      const width = el.clientWidth;
      if (width <= 0) return;
      const nextIdx = (currentIndex + 1) % totalSlides;
      el.scrollTo({ left: nextIdx * width, behavior: 'smooth' });
    }, interval);
    return () => clearInterval(timer);
  }, [totalSlides, interval, loop, currentIndex]);

  const onScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, clientWidth } = containerRef.current;
    if (clientWidth <= 0) return;
    const idx = Math.round(scrollLeft / clientWidth);
    if (idx !== currentIndex && idx >= 0 && idx < totalSlides) {
      setCurrentIndex(idx);
    }
  };

  const goToSlide = (idx) => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    containerRef.current.scrollTo({ left: idx * width, behavior: 'smooth' });
    setCurrentIndex(idx);
  };

  const onMouseDown = (e) => {
    // If recently touched on mobile, do not treat as mouse drag
    if (Date.now() - lastTouchTime.current < 1000) return;
    if (e.button !== 0 || !containerRef.current) return;
    isInteractingRef.current = true;
    mouseStartX.current = e.pageX || e.clientX;
    mouseScrollStart.current = containerRef.current.scrollLeft;
    mouseMoved.current = false;
  };

  const onMouseMove = (e) => {
    if (Date.now() - lastTouchTime.current < 1000) return;
    if (!isInteractingRef.current || !containerRef.current) return;
    const currentX = e.pageX || e.clientX;
    const walk = currentX - mouseStartX.current;
    if (Math.abs(walk) > 25) mouseMoved.current = true;
    containerRef.current.scrollLeft = mouseScrollStart.current - walk;
  };

  const onMouseUp = () => {
    if (Date.now() - lastTouchTime.current < 1000) return;
    if (!isInteractingRef.current || !containerRef.current) return;
    isInteractingRef.current = false;
    const width = containerRef.current.clientWidth;
    if (width > 0) {
      const targetIdx = Math.round(containerRef.current.scrollLeft / width);
      containerRef.current.scrollTo({ left: targetIdx * width, behavior: 'smooth' });
    }
  };

  const handlers = {
    onScroll,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave: () => {
      onMouseUp();
      isInteractingRef.current = false;
    },
    onTouchStart: () => {
      lastTouchTime.current = Date.now();
      isInteractingRef.current = true;
      mouseMoved.current = false;
    },
    onTouchEnd: () => {
      lastTouchTime.current = Date.now();
      isInteractingRef.current = false;
    },
    onMouseEnter: () => { isInteractingRef.current = true; }
  };

  const wasDragged = () => {
    if (Date.now() - lastTouchTime.current < 1200) return false;
    return mouseMoved.current;
  };

  return {
    currentIndex,
    dragOffsetPx: 0,
    isDragging: false,
    containerRef,
    handlers,
    goToSlide,
    wasDragged,
    setCurrentIndex
  };
}

function getInitialClientState(key, fallback) {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('d_store_visual_editor_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed[key] !== undefined && parsed[key] !== null) {
          if (Array.isArray(parsed[key])) {
            return parsed[key].length > 0 ? parsed[key] : fallback;
          }
          return parsed[key];
        }
      }
    } catch (e) {}
  }
  return fallback;
}

export default function ZaloraMenDevPage({ isAdminMode: propAdminMode, initialData }) {
  const pathname = usePathname();
  const router = useRouter();
  // Mode edit visual HANYA aktif jika prop isAdminMode secara eksplisit true ATAU jika sedang berada di rute admin/dev internal
  const isAdminMode = propAdminMode !== undefined ? propAdminMode : (pathname?.startsWith('/admin') || pathname?.startsWith('/store/dev') || false);
  const vData = initialData?.visualEditorData;
  const bData = initialData?.banners;

  const [activeSegment, setActiveSegment] = useState(() => {
    if (pathname?.includes('/ai-tools')) return 'ai';
    if (pathname?.includes('/streaming')) return 'stream';
    if (pathname?.includes('/graphic-design')) return 'design';
    if (pathname?.includes('/music-audio')) return 'music';
    if (pathname?.includes('/vpn-security')) return 'vpn';
    if (pathname?.includes('/office-tools')) return 'office';
    return 'all';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState(null);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [liveProducts, setLiveProducts] = useState(() => initialData?.products || []);
  const [liveVariants, setLiveVariants] = useState(() => initialData?.variants || []);
  const [activeProductModal, setActiveProductModal] = useState(null);
  const [selectedAppModal, setSelectedAppModal] = useState(null);
  const [selectedSize, setSelectedSize] = useState('1 Bulan (Private)');
  const [showQuickAlert, setShowQuickAlert] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const desktopSearchRef = useRef(null);

  const customOverrides = useMemo(() => {
    return initialData?.categoryOverrides || {};
  }, [initialData]);

  const unifiedCatalog = useMemo(() => {
    return buildUnifiedCatalog({
      liveProducts,
      liveVariants,
      categoryOverrides: customOverrides
    });
  }, [liveProducts, liveVariants, customOverrides]);

  const searchResults = useMemo(() => {
    return searchCatalog(unifiedCatalog, searchQuery);
  }, [unifiedCatalog, searchQuery]);

  useEffect(() => {
    const handleDocClick = (e) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    document.addEventListener('touchstart', handleDocClick, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleDocClick);
      document.removeEventListener('touchstart', handleDocClick);
    };
  }, []);

  const [selectedTrendCategory, setSelectedTrendCategory] = useState('ai');
  const [trendSearchQuery, setTrendSearchQuery] = useState('');
  const [isSubCategoryExpanded, setIsSubCategoryExpanded] = useState(true);


  const openExternalUrl = (url) => {
    if (typeof window === 'undefined' || !url) return;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = url;
    } else {
      const win = window.open(url, '_blank');
      if (!win) {
        window.location.href = url;
      }
    }
  };

  // Helper pintar: deteksi otomatis apakah item/banner mengarah ke aplikasi digital (Spotify, Netflix, ChatGPT, dll)
  const handleProductOrAppClick = (item) => {
    if (!item) return;

    // 1. Deteksi otomatis varian aplikasi digital (berdasarkan brand, nama, link, atau label dari seluruh database produk)
    let app = getAppVariantData(item, liveProducts, liveVariants);
    if (app) {
      setSelectedAppModal(app);
      return;
    }

    // 2. Jika item memiliki link kustom
    if (item.link && item.link !== '#' && !item.link.startsWith('/store/app')) {
      if (item.link.startsWith('http')) {
        openExternalUrl(item.link);
        return;
      }
      if (item.link.startsWith('#')) {
        const id = item.link.replace('#', '');
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // 3. Jika elemen adalah banner promo (bukan produk dengan harga)
    if (!item.sku && !item.priceNumber && item.brand && item.brand !== 'D STORE') {
      setSelectedBrandFilter(item.brand.toUpperCase());
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      showNotification(`Melihat koleksi: ${item.brand}`);
      return;
    }

    // 3.5 Jika elemen adalah banner promosi / informasi tanpa SKU dan harga, jangan buka modal produk Rp 0
    if (!item.sku && !item.price && !item.priceNumber) {
      const waText = encodeURIComponent(`Halo Admin D Store, saya ingin tanya info mengenai ${item.title || item.name || 'layanan ini'}. Boleh minta info lengkapnya?`);
      openExternalUrl(`https://wa.me/6281230112240?text=${waText}`);
      return;
    }

    // 4. Default: Buka modal produk biasa
    setActiveProductModal(item);
  };

  // Dynamic banners state (synced with Admin Panel & Local Storage Frame-0)
  const [brands1List, setBrands1List] = useState(() => getInitialClientState('brands1List', vData?.brands1List?.length ? vData.brands1List : ZALORA_BRANDS_1));
  const [speedDealsList, setSpeedDealsList] = useState(() => getInitialClientState('speedDealsList', vData?.speedDealsList?.length ? vData.speedDealsList : (bData?.speedDeals?.length ? bData.speedDeals : ZALORA_SPEED_DEALS)));
  const [trendList, setTrendList] = useState(() => getInitialClientState('trendList', vData?.trendList?.length ? vData.trendList : (bData?.trending?.length ? bData.trending : ZALORA_TRENDING)));
  const [stealsList, setStealsList] = useState(() => getInitialClientState('stealsList', vData?.stealsList?.length ? vData.stealsList : (bData?.steals?.length ? bData.steals : ZALORA_STEALS)));
  const [brands2List, setBrands2List] = useState(() => getInitialClientState('brands2List', vData?.brands2List?.length ? vData.brands2List : ZALORA_BRANDS_2));
  const [applyList, setApplyList] = useState(() => {
    const raw = (vData?.applyList?.length ? vData.applyList : (bData?.apply?.length ? bData.apply : ZALORA_APPLY_NOW));
    const isOutdated = raw.some((item) => !item.img || item.img.startsWith('data:image') || item.img.includes('black_white_aesthetic') || item.img.includes('ctfassets.net'));
    return getInitialClientState('applyList', isOutdated ? ZALORA_APPLY_NOW : raw);
  });
  const [discList, setDiscList] = useState(() => getInitialClientState('discList', vData?.discList?.length ? vData.discList : (bData?.featured?.length ? bData.featured : ZALORA_FEATURED_COLLECTIONS)));
  const [saveList, setSaveList] = useState(() => getInitialClientState('saveList', vData?.saveList?.length ? vData.saveList : (bData?.saveBanners?.length ? bData.saveBanners : ZALORA_SAVE_BANNERS)));

  // Load Data Live dari Backend (Katalog Produk & Banner)
  useEffect(() => {
    // 1. Load Produk & Varian Live
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setLiveProducts(data.products || []);
          setLiveVariants(data.variants || []);
        }
      })
      .catch(() => {});

    // 2. Load Banner Toko Live
    fetch('/api/store/banners')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok' && data.banners) {
          const vData = data.banners.visualEditorData;
          let hasLocalEdits = false;
          if (typeof window !== "undefined") {
            try {
              const savedRaw = localStorage.getItem("d_store_visual_editor_data");
              if (savedRaw) {
                const parsed = JSON.parse(savedRaw);
                if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 1) {
                  hasLocalEdits = true;
                }
              }
            } catch (e) {}
          }

          // Prioritaskan editan user di browser lokal: jangan pernah timpa jika user sudah pernah mengedit
          if (!hasLocalEdits && vData) {
            if (Array.isArray(vData.heroCarouselItems)) setHeroCarouselItems(vData.heroCarouselItems);
            if (Array.isArray(vData.bubbleList)) {
              const allowed = ['netflix', 'chatgpt', 'spotify', 'canva pro', 'youtube', 'capcut pro', 'disney+', 'duolingo', 'bstation'];
              const filtered = vData.bubbleList.filter(b => b && b.label && allowed.includes(b.label.toLowerCase()));
              setBubbleList(filtered.length > 0 ? filtered : ZALORA_BUBBLES);
            }
            if (Array.isArray(vData.topTierProducts)) setTopTierProducts(vData.topTierProducts);
            if (Array.isArray(vData.justForYouProducts)) setJustForYouProducts(vData.justForYouProducts);
            if (Array.isArray(vData.brands1List)) setBrands1List(vData.brands1List);
            if (vData.mainHeroBanner) setMainHeroBanner(vData.mainHeroBanner);
            if (vData.heroSlide1) setHeroSlide1(vData.heroSlide1);
            if (vData.heroSlide2) setHeroSlide2(vData.heroSlide2);
            if (vData.heroSlide3) setHeroSlide3(vData.heroSlide3);
            if (vData.topTierBanner) setTopTierBanner(vData.topTierBanner);
            if (Array.isArray(vData.brands2List)) setBrands2List(vData.brands2List);
            if (Array.isArray(vData.speedDealsList) && vData.speedDealsList.length > 0) setSpeedDealsList(vData.speedDealsList);
            if (Array.isArray(vData.trendList) && vData.trendList.length > 0) setTrendList(vData.trendList);
            if (Array.isArray(vData.stealsList) && vData.stealsList.length > 0) setStealsList(vData.stealsList);
            if (Array.isArray(vData.applyList) && vData.applyList.length > 0) {
              const isOutdated = vData.applyList.some((item) => !item.img || item.img.startsWith('data:image') || item.img.includes('black_white_aesthetic') || item.img.includes('ctfassets.net'));
              setApplyList(isOutdated ? ZALORA_APPLY_NOW : vData.applyList);
            }
            if (Array.isArray(vData.discList) && vData.discList.length > 0) setDiscList(vData.discList);
            if (Array.isArray(vData.saveList) && vData.saveList.length > 0) setSaveList(vData.saveList);
          } else if (!hasLocalEdits && !vData) {
            if (Array.isArray(data.banners.speedDeals) && data.banners.speedDeals.length > 0) setSpeedDealsList(data.banners.speedDeals);
            if (Array.isArray(data.banners.trending) && data.banners.trending.length > 0) setTrendList(data.banners.trending);
            if (Array.isArray(data.banners.steals) && data.banners.steals.length > 0) setStealsList(data.banners.steals);
            if (Array.isArray(data.banners.apply) && data.banners.apply.length > 0) {
              const isOutdated = data.banners.apply.some((item) => !item.img || item.img.startsWith('data:image') || item.img.includes('black_white_aesthetic') || item.img.includes('ctfassets.net'));
              setApplyList(isOutdated ? ZALORA_APPLY_NOW : data.banners.apply);
            }
            if (Array.isArray(data.banners.featured) && data.banners.featured.length > 0) setDiscList(data.banners.featured);
            if (Array.isArray(data.banners.saveBanners) && data.banners.saveBanners.length > 0) setSaveList(data.banners.saveBanners);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Unified auto & manual draggable carousels
  const speedCarousel = useDraggableCarousel({ totalSlides: speedDealsList.length, interval: 4500 });
  const trendCarousel = useDraggableCarousel({ totalSlides: trendList.length, interval: 4000 });
  const stealsCarousel = useDraggableCarousel({ totalSlides: stealsList.length, interval: 4000 });
  const applyCarousel = useDraggableCarousel({ totalSlides: applyList.length, interval: 4500 });
  const discCarousel = useDraggableCarousel({ totalSlides: discList.length, interval: 4500 });
  const saveCarousel = useDraggableCarousel({ totalSlides: saveList.length, interval: 4500 });

  // Hero mini-card carousel state
  const heroSliderRef = useRef(null);

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
    setTimeout(() => { dragDistMini.current = 0; }, 50);
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
    dragDistBig.current = 0; // User was dragging to slide
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
    setTimeout(() => { dragDistBrands.current = 0; }, 50);
  };

  // Handle touch events on mobile to cleanly differentiate between swipe/scroll vs tap/click
  const onTouchStartCapture = (e, distRef) => {
    if (!e.touches || !e.touches[0]) return;
    distRef.startX = e.touches[0].clientX;
    distRef.startY = e.touches[0].clientY;
    distRef.current = 0;
  };

  const onTouchMoveCapture = (e, distRef) => {
    if (!e.touches || !e.touches[0] || distRef.startX === undefined) return;
    const deltaX = Math.abs(e.touches[0].clientX - distRef.startX);
    distRef.current = deltaX;
  };

  const onTouchEndCapture = (distRef) => {
    distRef.startX = undefined;
    distRef.startY = undefined;
    // Reset lebih cepat agar tap/klik Edit tidak terblokir setelah scroll
    setTimeout(() => {
      distRef.current = 0;
    }, 80);
  };

  // Handle mouse wheel over horizontal lists (mouse desktop support)
  const handleHorizontalWheel = (e, targetRef) => {
    const container = targetRef.current;
    if (!container) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.deltaY !== 0) {
      const atStart = container.scrollLeft <= 0;
      const atEnd = container.scrollLeft >= (container.scrollWidth - container.clientWidth - 2);
      if ((e.deltaY > 0 && !atEnd) || (e.deltaY < 0 && !atStart)) {
        container.scrollLeft += e.deltaY * 0.9;
      }
    }
  };

  // Reusable window-level drag-to-scroll handler for carousels & bubbles
  const startDragScroll = (e, targetRef, distRef) => {
    // Biarkan layar sentuh (touch) menggunakan native 120Hz smooth panning browser
    if (e.pointerType === 'touch') return;
    if (e.button !== 0) return; // Hanya klik kiri mouse

    const container = targetRef.current;
    if (!container) return;

    distRef.current = 0;
    const startX = e.clientX || e.pageX;
    const startScrollLeft = container.scrollLeft;
    let isMoving = false;

    const onMove = (moveEvent) => {
      const currentX = moveEvent.clientX || moveEvent.pageX;
      const deltaX = currentX - startX;
      distRef.current = Math.abs(deltaX);

      if (distRef.current > 4) {
        isMoving = true;
        moveEvent.preventDefault();
        container.scrollLeft = startScrollLeft - deltaX;
      }
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (isMoving) {
        setTimeout(() => {
          distRef.current = 0;
        }, 120);
      } else {
        distRef.current = 0;
      }
    };

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('mousemove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
  };

  // Drag refs
  const bubblesListRef = useRef(null);
  const dragDistBubbles = useRef(0);

  const topTierListRef = useRef(null);
  const dragDistTopTier = useRef(0);
  const [topTierScrollState, setTopTierScrollState] = useState({ canLeft: false, canRight: true });

  const justForYouListRef = useRef(null);
  const dragDistJustForYou = useRef(0);
  const [jfyScrollState, setJfyScrollState] = useState({ canLeft: false, canRight: true });

  const updateScrollState = (container, setter) => {
    if (!container) return;
    const canLeft = container.scrollLeft > 10;
    const canRight = container.scrollLeft < (container.scrollWidth - container.clientWidth - 10);
    setter({ canLeft, canRight });
  };

  const formatRupiah = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

  const getLiveProductStatus = (item) => {
    if (!item || liveProducts.length === 0) return null;
    const nameKey = (item.brand || item.name || '').toLowerCase();
    const matched = liveProducts.find((p) => {
      const pName = (p.name || '').toLowerCase();
      return pName.includes(nameKey) || nameKey.includes(pName);
    });
    if (!matched) return null;

    const matchedVars = liveVariants.filter((v) => v.productId === matched.id);
    if (matchedVars.length === 0) return null;

    const anyAvailable = matchedVars.some((v) => v.isAvailable !== false);
    const validPrices = matchedVars.map((v) => Number(v.price) || 0).filter((p) => p > 0);
    const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;

    return {
      isAvailable: anyAvailable,
      minPrice: minPrice,
      count: matchedVars.length
    };
  };

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

  
  // Konfigurasi & Produk Sub-Kategori Aktif
  const activeTrendConfig = TREND_CATEGORIES_CONFIG[selectedTrendCategory] || TREND_CATEGORIES_CONFIG.ai;

  const activeCategoryProducts = useMemo(() => {
    const catId = activeTrendConfig.catId;
    let list = liveProducts.filter((p) => p.categoryId === catId);
    
    if (list.length === 0) {
      if (liveProducts.length > 0 && activeTrendConfig.defaultApps) {
        list = liveProducts.filter((p) => {
          const nameLower = (p.name || '').toLowerCase();
          return activeTrendConfig.defaultApps.some(app => nameLower.includes(app.toLowerCase()));
        });
      }
      if (list.length === 0) {
        list = FALLBACK_CATEGORY_PRODUCTS[selectedTrendCategory] || [];
      }
    }

    if (trendSearchQuery.trim()) {
      const q = trendSearchQuery.toLowerCase().trim();
      list = list.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }

    return list;
  }, [selectedTrendCategory, liveProducts, trendSearchQuery, activeTrendConfig]);

  const findProductMedia = (prod) => {
    if (prod.image) return prod.image;
    if (prod.img) return prod.img;
    const nameLower = (prod.name || '').toLowerCase();
    const matchTop = topTierProducts.find(t => 
      (t.name && t.name.toLowerCase().includes(nameLower)) || 
      (t.brand && nameLower.includes(t.brand.toLowerCase()))
    );
    if (matchTop?.image) return matchTop.image;
    const matchBubble = bubbleList.find(b => 
      b.label && (b.label.toLowerCase().includes(nameLower) || nameLower.includes(b.label.toLowerCase()))
    );
    if (matchBubble?.img) return matchBubble.img;
    return null;
  };


  const showNotification = (msg) => {
    setShowQuickAlert(msg);
    setTimeout(() => setShowQuickAlert(null), 2500);
  };

  const getWhatsAppOrderUrl = (pName, price) => {
    const text = encodeURIComponent(`Halo Admin D Store, saya ingin order:\n• Produk: ${pName}\n• Harga: ${formatRupiah(price)}`);
    return `https://wa.me/6281230112240?text=${text}`;
  };

  // Visual Live Editor States (Lengkap untuk seluruh gambar di toko)
  const [editModeState, setEditModeState] = useState(() => Boolean(isAdminMode));
  const isEditMode = Boolean(isAdminMode && editModeState);
  const setIsEditMode = setEditModeState;
  const [visualEditingItem, setVisualEditingItem] = useState(null);
  const [heroCarouselItems, setHeroCarouselItems] = useState(() => getInitialClientState('heroCarouselItems', vData?.heroCarouselItems?.length ? vData.heroCarouselItems : HERO_CAROUSEL_ITEMS));
  const [mainHeroBanner, setMainHeroBanner] = useState(() => getInitialClientState('mainHeroBanner', vData?.mainHeroBanner || ZALORA_HERO));
  const [topTierProducts, setTopTierProducts] = useState(() => getInitialClientState('topTierProducts', vData?.topTierProducts?.length ? vData.topTierProducts : ZALORA_TOP_TIER_PRODUCTS));
  const [justForYouProducts, setJustForYouProducts] = useState(() => getInitialClientState('justForYouProducts', vData?.justForYouProducts?.length ? vData.justForYouProducts : ZALORA_JUST_FOR_YOU_PRODUCTS));
  const [heroSlide1, setHeroSlide1] = useState(() => getInitialClientState('heroSlide1', vData?.heroSlide1 || DEFAULT_HERO_SLIDE_1));
  const [heroSlide2, setHeroSlide2] = useState(() => getInitialClientState('heroSlide2', vData?.heroSlide2 || DEFAULT_HERO_SLIDE_2));
  const [heroSlide3, setHeroSlide3] = useState(() => getInitialClientState('heroSlide3', vData?.heroSlide3 || DEFAULT_HERO_SLIDE_3));
  const [bubbleList, setBubbleList] = useState(() => getInitialClientState('bubbleList', vData?.bubbleList?.length ? vData.bubbleList : ZALORA_BUBBLES));
  const [topTierBanner, setTopTierBanner] = useState(() => getInitialClientState('topTierBanner', vData?.topTierBanner || DEFAULT_TOP_TIER_BANNER));

  useEffect(() => {
    try {
      const saved = localStorage.getItem('d_store_visual_editor_data');
      if (saved) {
        const parsed = JSON.parse(saved);

        if (parsed.catalogVersion !== '2026-10-28-v2-exact-15-jfy') {
          parsed.catalogVersion = '2026-10-28-v2-exact-15-jfy';
          try { localStorage.setItem('d_store_visual_editor_data', JSON.stringify(parsed)); } catch (e) {}
        }

        const isDiff = (a, b) => JSON.stringify(a) !== JSON.stringify(b);

        if (Array.isArray(parsed.heroCarouselItems) && isDiff(heroCarouselItems, parsed.heroCarouselItems)) {
          setHeroCarouselItems(parsed.heroCarouselItems);
        }
        if (parsed.mainHeroBanner && isDiff(mainHeroBanner, parsed.mainHeroBanner)) {
          setMainHeroBanner(parsed.mainHeroBanner);
        }
        if (Array.isArray(parsed.topTierProducts)) {
          const cleaned = parsed.topTierProducts.map((p) => {
            const isDummy = !p.image || p.image.includes('desain_tanpa_judul__4') || p.image.includes('edit_template_colors__') || p.image.includes('ctfassets') || p.image.startsWith('data:image');
            return isDummy ? { ...p, image: getResolvedProductImage(p, liveProducts) || p.image } : p;
          });
          if (isDiff(topTierProducts, cleaned)) {
            setTopTierProducts(cleaned);
            parsed.topTierProducts = cleaned;
            try { localStorage.setItem('d_store_visual_editor_data', JSON.stringify(parsed)); } catch (e) {}
          }
        }
        if (Array.isArray(parsed.justForYouProducts)) {
          const cleaned = parsed.justForYouProducts.map((p) => {
            const isDummy = !p.image || p.image.includes('desain_tanpa_judul__4') || p.image.includes('edit_template_colors__') || p.image.includes('ctfassets') || p.image.startsWith('data:image');
            return isDummy ? { ...p, image: getResolvedProductImage(p, liveProducts) || p.image } : p;
          });
          if (isDiff(justForYouProducts, cleaned)) {
            setJustForYouProducts(cleaned);
            parsed.justForYouProducts = cleaned;
            try { localStorage.setItem('d_store_visual_editor_data', JSON.stringify(parsed)); } catch (e) {}
          }
        }
        if (parsed.heroSlide1 && parsed.heroSlide1.image && isDiff(heroSlide1, parsed.heroSlide1)) {
          setHeroSlide1(parsed.heroSlide1);
        }
        if (parsed.heroSlide2 && isDiff(heroSlide2, parsed.heroSlide2)) {
          setHeroSlide2(parsed.heroSlide2);
        }
        if (parsed.heroSlide3 && isDiff(heroSlide3, parsed.heroSlide3)) {
          setHeroSlide3(parsed.heroSlide3);
        }
        if (Array.isArray(parsed.bubbleList) && isDiff(bubbleList, parsed.bubbleList)) {
          const allowed = ['netflix', 'chatgpt', 'spotify', 'canva pro', 'youtube', 'capcut pro', 'disney+', 'duolingo', 'bstation'];
          const filtered = parsed.bubbleList.filter(b => b && b.label && allowed.includes(b.label.toLowerCase()));
          if (filtered.length > 0) {
            setBubbleList(filtered);
          }
        }
        if (Array.isArray(parsed.speedDealsList) && isDiff(speedDealsList, parsed.speedDealsList)) {
          setSpeedDealsList(parsed.speedDealsList);
        }
        if (Array.isArray(parsed.brands1List) && isDiff(brands1List, parsed.brands1List)) {
          setBrands1List(parsed.brands1List);
        }
        if (Array.isArray(parsed.trendList) && isDiff(trendList, parsed.trendList)) {
          setTrendList(parsed.trendList);
        }
        if (Array.isArray(parsed.stealsList) && isDiff(stealsList, parsed.stealsList)) {
          setStealsList(parsed.stealsList);
        }
        if (Array.isArray(parsed.brands2List) && isDiff(brands2List, parsed.brands2List)) {
          setBrands2List(parsed.brands2List);
        }
        if (parsed.topTierBanner && isDiff(topTierBanner, parsed.topTierBanner)) {
          setTopTierBanner(parsed.topTierBanner);
        }
        if (Array.isArray(parsed.applyList) && isDiff(applyList, parsed.applyList)) {
          setApplyList(parsed.applyList);
        }
        if (Array.isArray(parsed.discList) && isDiff(discList, parsed.discList)) {
          setDiscList(parsed.discList);
        }
        if (Array.isArray(parsed.saveList) && isDiff(saveList, parsed.saveList)) {
          setSaveList(parsed.saveList);
        }

        // Auto-sync data dari browser admin ke backend agar perangkat lain / HP pembeli langsung update
        fetch("/api/store/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visualEditorData: parsed })
        }).catch(() => {});
      }
      if (isAdminMode) {
        const savedMode = localStorage.getItem('d_store_is_edit_mode');
        if (savedMode !== null) {
          setIsEditMode(savedMode === 'true');
        }
      } else {
        setIsEditMode(false);
      }
    } catch (e) {}
  }, [isAdminMode]);

  const handleToggleEditMode = (mode) => {
    setIsEditMode(mode);
    try {
      localStorage.setItem('d_store_is_edit_mode', String(mode));
    } catch (e) {}
    showNotification(mode ? 'Mode Edit Visual AKTIF' : 'Mode Pratinjau Toko AKTIF');
  };

  const handleSaveVisualItem = (updated) => {
    let newHeroItems = [...heroCarouselItems];
    let newMainHero = { ...mainHeroBanner };
    let newTopTier = [...topTierProducts];
    let newJustForYou = [...justForYouProducts];
    let newHeroSlide1 = { ...heroSlide1 };
    let newHeroSlide2 = { ...heroSlide2 };
    let newHeroSlide3 = { ...heroSlide3 };
    let newBubbles = [...bubbleList];
    let newSpeedDeals = [...speedDealsList];
    let newBrands1 = [...brands1List];
    let newTrend = [...trendList];
    let newSteals = [...stealsList];
    let newBrands2 = [...brands2List];
    let newTopTierBanner = { ...topTierBanner };
    let newApply = [...applyList];
    let newDisc = [...discList];
    let newSave = [...saveList];

    if (updated.type === 'hero-slide') {
      newHeroItems = newHeroItems.map((item) => {
        if (item.id === updated.id) {
          let finalPrice = Number(updated.price);
          const detected = getAppVariantData({ brand: updated.brand, name: updated.name });
          if ((!finalPrice || isNaN(finalPrice)) && detected?.packages?.[0]?.price) {
            finalPrice = detected.packages[0].price;
          } else if (!finalPrice || isNaN(finalPrice)) {
            finalPrice = item.price;
          }
          return {
            ...item,
            ...updated,
            image: updated.image || item.image,
            price: finalPrice,
            priceNumber: finalPrice,
            name: updated.name || item.name,
            brand: updated.brand || item.brand
          };
        }
        return item;
      });
      setHeroCarouselItems(newHeroItems);
    } else if (updated.type === 'main-hero') {
      newMainHero = { ...newMainHero, ...updated, desktopImg: updated.image || newMainHero.desktopImg, title: updated.name || newMainHero.title, brand: updated.brand || newMainHero.brand, link: updated.link || newMainHero.link };
      setMainHeroBanner(newMainHero);
    } else if (updated.type === 'hero-top-1') {
      newHeroSlide1 = { ...newHeroSlide1, image: updated.image, title: updated.name || newHeroSlide1.title, brand: updated.brand || newHeroSlide1.brand, link: updated.link || newHeroSlide1.link };
      setHeroSlide1(newHeroSlide1);
    } else if (updated.type === 'hero-top-2') {
      newHeroSlide2 = { ...newHeroSlide2, image: updated.image, title: updated.name || newHeroSlide2.title, brand: updated.brand || newHeroSlide2.brand, link: updated.link || newHeroSlide2.link };
      setHeroSlide2(newHeroSlide2);
    } else if (updated.type === 'hero-top-3') {
      newHeroSlide3 = { ...newHeroSlide3, image: updated.image, title: updated.name || newHeroSlide3.title, brand: updated.brand || newHeroSlide3.brand, link: updated.link || newHeroSlide3.link };
      setHeroSlide3(newHeroSlide3);
    } else if (updated.type === 'bubble') {
      newBubbles = newBubbles.map((b, i) => (i === updated.index || `bubble-${i}` === updated.id) ? { ...b, img: updated.image || b.img, label: updated.name || updated.brand || b.label } : b);
      setBubbleList(newBubbles);
    } else if (updated.type === 'speed-deal') {
      newSpeedDeals = newSpeedDeals.map((d, i) => (i === updated.index || `deal-${i}` === updated.id) ? { ...d, img: updated.image || d.img, title: updated.name || d.title, link: updated.link || d.link } : d);
      setSpeedDealsList(newSpeedDeals);
    } else if (updated.type === 'trend-item') {
      newTrend = newTrend.map((t, i) => (i === updated.index || `trend-${i}` === updated.id) ? {
        ...t,
        img: updated.image || t.img,
        title: updated.name || updated.title || t.title,
        brand: updated.brand || updated.name || t.brand,
        label: updated.label !== undefined ? updated.label : t.label,
        link: updated.link || t.link
      } : t);
      setTrendList(newTrend);
    } else if (updated.type === 'brand1-item') {
      newBrands1 = newBrands1.map((b, i) => (i === updated.index || `brand1-${i}` === updated.id) ? { ...b, img: updated.image || b.img, brand: updated.brand || updated.name || b.brand, name: updated.name || b.name, label: updated.label || b.label } : b);
      setBrands1List(newBrands1);
    } else if (updated.type === 'steals-banner') {
      newSteals = newSteals.map((s, i) => (i === updated.index || `steals-${i}` === updated.id) ? { ...s, img: updated.image || s.img, title: updated.name || s.title } : s);
      setStealsList(newSteals);
    } else if (updated.type === 'brand2-item') {
      newBrands2 = newBrands2.map((b, i) => (i === updated.index || `brand2-${i}` === updated.id) ? { ...b, img: updated.image || b.img, brand: updated.brand || updated.name || b.brand } : b);
      setBrands2List(newBrands2);
    } else if (updated.type === 'toptier-banner') {
      newTopTierBanner = { ...newTopTierBanner, image: updated.image || newTopTierBanner.image, title: updated.name || newTopTierBanner.title, brand: updated.brand || newTopTierBanner.brand, link: updated.link !== undefined ? updated.link : newTopTierBanner.link };
      setTopTierBanner(newTopTierBanner);
    } else if (updated.type === 'apply-banner') {
      newApply = newApply.map((a, i) => (i === updated.index || `apply-${i}` === updated.id) ? { ...a, img: updated.image || a.img, title: updated.name || a.title, link: updated.link !== undefined ? updated.link : a.link } : a);
      setApplyList(newApply);
    } else if (updated.type === 'collection-card') {
      newDisc = newDisc.map((c, i) => (i === updated.index || `disc-${i}` === updated.id) ? { ...c, img: updated.image || c.img, title: updated.name || c.title } : c);
      setDiscList(newDisc);
    } else if (updated.type === 'save-banner') {
      newSave = newSave.map((s, i) => (i === updated.index || `save-${i}` === updated.id) ? { ...s, img: updated.image || s.img, title: updated.name || s.title, link: updated.link || s.link } : s);
      setSaveList(newSave);
    } else if (updated.type === 'product-toptier') {
      const pNum = Number(updated.price) || 15000;
      newTopTier = newTopTier.map((item) => (item.sku === updated.id || item.id === updated.id || (item.name && updated.name && item.name.toLowerCase().trim() === updated.name.toLowerCase().trim())) ? {
        ...item,
        ...updated,
        price: pNum,
        priceNumber: pNum,
        voucherPrice: formatRupiah(pNum),
        specialPrice: formatRupiah(pNum),
        hasVoucher: false,
        name: updated.name || item.name,
        brand: updated.brand || item.brand,
        image: updated.image || item.image
      } : item);
      setTopTierProducts(newTopTier);
    } else if (updated.type === 'product-justforyou') {
      const pNum = Number(updated.price) || 15000;
      newJustForYou = newJustForYou.map((item) => (item.sku === updated.id || item.id === updated.id || (item.name && updated.name && item.name.toLowerCase().trim() === updated.name.toLowerCase().trim())) ? {
        ...item,
        ...updated,
        price: pNum,
        priceNumber: pNum,
        voucherPrice: formatRupiah(pNum),
        specialPrice: formatRupiah(pNum),
        hasVoucher: false,
        name: updated.name || item.name,
        brand: updated.brand || item.brand,
        image: updated.image || item.image
      } : item);
      setJustForYouProducts(newJustForYou);
    } else if (updated.type === 'product-new') {
      const newProd = {
        sku: 'sku-' + Date.now(),
        name: updated.name || 'Aplikasi Baru',
        brand: updated.brand || 'D STORE',
        image: updated.image || 'https://images.ctfassets.net/9q8du028z7sn/72LwXOzRKd7j03GjxUBF8B/a0171940ad0d92dee1eeda68e9a6fc06/225x225_BB2026_TOMMYHILFIGER.png',
        priceNumber: Number(updated.price) || 15000,
        voucherPrice: 'Rp ' + Number(updated.price || 15000).toLocaleString('id-ID'),
        hasVoucher: true,
        category: updated.category || 'Top Tier'
      };
      newTopTier = [newProd, ...newTopTier];
      setTopTierProducts(newTopTier);
    }

    const fullPayload = {
      catalogVersion: '2026-10-28-v2-exact-15-jfy',
      heroCarouselItems: newHeroItems,
      mainHeroBanner: newMainHero,
      topTierProducts: newTopTier,
      justForYouProducts: newJustForYou,
      heroSlide1: newHeroSlide1,
      heroSlide2: newHeroSlide2,
      heroSlide3: newHeroSlide3,
      bubbleList: newBubbles,
      speedDealsList: newSpeedDeals,
      brands1List: newBrands1,
      trendList: newTrend,
      stealsList: newSteals,
      brands2List: newBrands2,
      topTierBanner: newTopTierBanner,
      applyList: newApply,
      discList: newDisc,
      saveList: newSave
    };

    try {
      localStorage.setItem('d_store_visual_editor_data', JSON.stringify(fullPayload));
    } catch (e) {}

    setVisualEditingItem(null);
    showNotification('Menyimpan perubahan gambar...');

    fetch('/api/store/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visualEditorData: fullPayload })
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'ok') {
          showNotification('Berhasil! Gambar tersimpan di server & browser.');
        } else {
          showNotification('Tersimpan di browser lokal. Perhatian: ' + (data.message || 'Sesi login tidak sah'));
        }
      })
      .catch(() => {
        showNotification('Tersimpan di browser lokal.');
      });
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncToServer = async () => {
    setIsSyncing(true);
    try {
      let dataToSync = null;
      try {
        const saved = localStorage.getItem("d_store_visual_editor_data");
        if (saved) dataToSync = JSON.parse(saved);
      } catch (e) {}

      if (!dataToSync) {
        dataToSync = {
          catalogVersion: '2026-10-28-v2-exact-15-jfy',
          heroCarouselItems,
          mainHeroBanner,
          topTierProducts,
          justForYouProducts,
          heroSlide1,
          heroSlide2,
          heroSlide3,
          bubbleList,
          speedDealsList,
          brands1List,
          trendList,
          stealsList,
          brands2List,
          topTierBanner,
          applyList,
          discList,
          saveList
        };
      } else {
        dataToSync.catalogVersion = '2026-10-28-v2-exact-15-jfy';
      }

      const res = await fetch("/api/store/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visualEditorData: dataToSync })
      });
      const result = await res.json();
      if (result.status === "ok") {
        showNotification("Berhasil! Semua banner dan editan sudah tersimpan di server dan aktif di HP.");
      } else {
        showNotification("Gagal menyinkronkan: " + (result.message || "Error"));
      }
    } catch (err) {
      showNotification("Gagal menghubungi server saat sinkronisasi.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetVisualData = async () => {
    try {
      localStorage.removeItem('d_store_visual_editor_data');
    } catch (e) {}
    const defaultData = {
      heroCarouselItems: HERO_CAROUSEL_ITEMS,
      mainHeroBanner: ZALORA_HERO,
      topTierProducts: ZALORA_TOP_TIER_PRODUCTS,
      justForYouProducts: ZALORA_JUST_FOR_YOU_PRODUCTS,
      heroSlide1: DEFAULT_HERO_SLIDE_1,
      heroSlide2: DEFAULT_HERO_SLIDE_2,
      heroSlide3: DEFAULT_HERO_SLIDE_3,
      bubbleList: ZALORA_BUBBLES,
      brands1List: ZALORA_BRANDS_1,
      speedDealsList: ZALORA_SPEED_DEALS,
      trendList: ZALORA_TRENDING,
      stealsList: ZALORA_STEALS,
      brands2List: ZALORA_BRANDS_2,
      topTierBanner: DEFAULT_TOP_TIER_BANNER,
      applyList: ZALORA_APPLY_NOW,
      discList: ZALORA_FEATURED_COLLECTIONS,
      saveList: ZALORA_SAVE_BANNERS
    };
    setHeroCarouselItems(defaultData.heroCarouselItems);
    setMainHeroBanner(defaultData.mainHeroBanner);
    setTopTierProducts(defaultData.topTierProducts);
    setJustForYouProducts(defaultData.justForYouProducts);
    setHeroSlide1(defaultData.heroSlide1);
    setHeroSlide2(defaultData.heroSlide2);
    setHeroSlide3(defaultData.heroSlide3);
    setBubbleList(defaultData.bubbleList);
    setBrands1List(defaultData.brands1List);
    setSpeedDealsList(defaultData.speedDealsList);
    setTrendList(defaultData.trendList);
    setStealsList(defaultData.stealsList);
    setBrands2List(defaultData.brands2List);
    setTopTierBanner(defaultData.topTierBanner);
    setApplyList(defaultData.applyList);
    setDiscList(defaultData.discList);
    setSaveList(defaultData.saveList);
    try {
      await fetch("/api/store/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visualEditorData: defaultData })
      });
    } catch (e) {}
    showNotification("Seluruh gambar toko dikembalikan ke bawaan awal dan disinkronkan ke server.");
  };

  const handleAddNewProductClick = () => {
    setVisualEditingItem({
      type: 'product-new',
      id: 'new-' + Date.now(),
      name: '',
      brand: '',
      image: '',
      price: 15000,
      category: 'Top Tier',
      recommendation: {
        dimensions: '600 x 800 px (Rasio 3:4)',
        aspectRatio: '3:4',
        tips: 'Foto produk ukuran 600 x 800 px. Latar belakang bersih/putih.'
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#222222] font-sans antialiased selection:bg-black selection:text-white">
      
      {/* Toast Notification */}
      {showQuickAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-black text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{showQuickAlert}</span>
        </div>
      )}

      {/* Admin Visual Live Editor Toolbar (Hanya Ditampilkan untuk Admin) */}
      {isAdminMode && (
        <AdminEditToolbar
          isEditMode={isEditMode}
          setIsEditMode={handleToggleEditMode}
          onAddNewProduct={handleAddNewProductClick}
          onResetData={handleResetVisualData}
          onSyncToServer={handleSyncToServer}
          isSyncing={isSyncing}
        />
      )}

      {/* =========================================================
          1. TOP UTILITY ANNOUNCEMENT BAR (Desktop Only)
      ========================================================= */}
      <div className="hidden md:block bg-[#F8F8F8] text-[#555555] text-[11px] py-1.5 px-4 border-b border-[#EAEAEA]">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
            <span className="flex items-center gap-1">
              <span className="text-[#888]">↺</span> Layanan Aktif 24 Jam | S&amp;K Berlaku &gt;
            </span>
            <span className="flex items-center gap-1 font-semibold text-black">
              <span className="bg-black text-white text-[9px] px-1.5 py-0.2 rounded font-bold">VIP</span>
              D STORE VIP: Diskon Tambahan Khusus Reseller Terdaftar &gt;
            </span>
            <span className="hidden lg:inline-flex items-center gap-1 text-[#555]">
              ✓ 100% Akun Legal &amp; Terverifikasi
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
          2. SIMPLE UNIFIED NAVBAR & SEARCH (ALL DEVICES)
      ========================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200/80 shadow-2xs">
        {/* Main Bar: Logo Simple di Kiri, Search Bar di Kanan */}
        <div className="max-w-[1240px] mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          
          {/* Logo Simple D STORE */}
          <Link href="/store" className="shrink-0 flex items-center">
            <span className="text-xl sm:text-2xl font-black tracking-widest uppercase text-black hover:opacity-80 transition select-none">
              D STORE
            </span>
          </Link>

          {/* Search Bar di Kanan */}
          <div className="flex-1 max-w-[200px] sm:max-w-xs md:max-w-sm relative ml-auto" ref={desktopSearchRef}>
            <div className="relative flex items-center w-full">
              <Search className="absolute left-3 w-4 h-4 text-[#888888] pointer-events-none" />
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
                    handleProductOrAppClick(searchResults[0]);
                  }
                }}
                placeholder="Cari aplikasi..."
                className="w-full bg-[#F4F4F4] hover:bg-[#EFEFEF] focus:bg-white text-xs sm:text-sm pl-9 pr-8 py-1.5 sm:py-2 rounded-full border border-transparent focus:border-black outline-none transition placeholder:text-[#888]"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchFocused(false);
                  }}
                  className="absolute right-2.5 text-[#888] hover:text-black cursor-pointer p-0.5"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Popular Tags Dropdown when focused & empty */}
            {isSearchFocused && searchQuery.trim().length === 0 && (
              <div className="absolute top-full right-0 w-[calc(100vw-28px)] sm:w-80 mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-200 p-3 sm:p-4 z-[100] animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Pencarian Populer
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {['Canva Pro', 'ChatGPT Plus', 'Netflix 4K', 'Spotify Family', 'YouTube Premium', 'CapCut Pro', 'Gemini AI', 'Surfshark VPN'].map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchQuery(tag);
                        setIsSearchFocused(true);
                      }}
                      className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] sm:text-xs font-medium cursor-pointer transition select-none"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Search Results Dropdown when typing */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute top-full right-0 w-[calc(100vw-28px)] sm:w-96 mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-[100] max-h-[60vh] sm:max-h-[380px] flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-2.5 sm:p-3 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between shrink-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Hasil Pencarian ({searchResults.length})
                  </div>
                  {searchResults.length > 0 && (
                    <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">
                      Pilih aplikasi untuk pesan
                    </span>
                  )}
                </div>

                {searchResults.length > 0 ? (
                  <div className="overflow-y-auto divide-y divide-zinc-100 p-1">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setIsSearchFocused(false);
                          handleProductOrAppClick(item);
                        }}
                        className="p-2.5 sm:p-3 hover:bg-zinc-50 active:bg-zinc-100 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition select-none group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-bold text-zinc-900 truncate group-hover:text-black">
                            {item.name}
                          </div>
                          {(item.categoryName || item.category) && (
                            <div className="text-[10px] sm:text-[11px] text-zinc-400 truncate mt-0.5">
                              {item.categoryName || item.category}
                            </div>
                          )}
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
                  <div className="p-5 text-center">
                    <p className="text-xs text-zinc-500 font-medium">
                      Tidak ada aplikasi yang cocok dengan &quot;{searchQuery}&quot;.
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Coba cari dengan kata kunci lain seperti Canva, Netflix, ChatGPT, Spotify, dll.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Text Berjalan (Running Text Marquee): Penegasan Bebas Resell */}
        <div className="border-t border-zinc-100 bg-zinc-950 text-white overflow-hidden select-none py-1 px-3">
          <div className="max-w-[1240px] mx-auto overflow-hidden">
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
      </header>

      {/* =========================================================
          3. HERO UNIVERSAL (DESKTOP & MOBILE) — 3 SLIDES DRAGGABLE CAROUSEL
      ========================================================= */}
      <div className="w-full relative select-none bg-[#141414]">

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

          {/* === SLIDE 1: Hero Banner Utama (Boss with Open Briefcase & Product Slider) === */}
          <div className="shrink-0 w-full min-w-full snap-start relative bg-[#141414] overflow-hidden h-[460px] sm:h-[520px] md:h-[580px] lg:h-[620px]">
            {/* Top region: Model Photo & Flash Sale graphic */}
            <div 
              className={`relative w-full h-full overflow-hidden ${
                isEditMode ? 'ring-2 ring-blue-500/80 cursor-pointer' : ''
              }`}
              onClick={(e) => {
                if (isEditMode) {
                  e.preventDefault();
                  e.stopPropagation();
                  setVisualEditingItem({
                    type: 'hero-top-1',
                    id: 'hero-top-1',
                    name: heroSlide1.title,
                    brand: heroSlide1.brand,
                    image: heroSlide1.image,
                    link: heroSlide1.link,
                    recommendation: {
                      dimensions: '1080 x 1080 px (1:1) atau 1200 x 900 px (4:3)',
                      aspectRatio: '1:1 atau 4:3',
                      tips: 'Banner utama paling atas beranda toko.'
                    }
                  });
                }
              }}
            >
              {isEditMode && (
                <div className="absolute top-2.5 right-2.5 z-20 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                  Edit Banner Slide 1
                </div>
              )}
              <img
                src={heroSlide1.image}
                alt={heroSlide1.title}
                className="w-full h-full object-cover object-top pointer-events-none"
                draggable={false}
              />
              {/* Clickable Overlay link */}
              <a
                href="#"
                data-carousel-passthrough="true"
                className={`absolute inset-0 z-20 cursor-pointer ${isEditMode ? 'pointer-events-none' : ''}`}
                onClick={(e) => {
                  dragDistBig.current = 0;
                  if (isEditMode) return;
                  handleProductOrAppClick(heroSlide1);
                }}
              />
            </div>

            {/* Bottom region: Mini product cards directly inside the dark hero base */}
            <div className="absolute bottom-0 inset-x-0 z-30 pb-3.5 pt-4 bg-gradient-to-t from-black via-black/85 to-transparent">
              <div
                ref={heroSliderRef}
                onMouseDown={onMiniPointerDown}
                onMouseMove={onMiniPointerMove}
                onMouseUp={onMiniPointerUp}
                onMouseLeave={onMiniPointerUp}
                className="flex w-auto gap-2.5 sm:gap-3.5 overflow-x-auto pb-1 px-3 sm:px-6 max-w-[1240px] mx-auto scrollbar-thin scrollbar-track-transparent no-scrollbar cursor-grab active:cursor-grabbing"
                style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
              >
                {heroCarouselItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex-none rounded-xl w-[26vw] sm:w-[130px] md:w-[145px] lg:w-[160px] bg-white cursor-pointer select-none active:scale-95 transition relative shadow-md ${
                      isEditMode ? 'ring-2 ring-blue-500/80 hover:ring-blue-400' : ''
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      dragDistMini.current = 0;
                      if (isEditMode) {
                        setVisualEditingItem({
                          type: 'hero-slide',
                          id: item.id,
                          name: item.name,
                          brand: item.brand,
                          image: item.image,
                          price: item.price,
                          category: item.category,
                          recommendation: {
                            dimensions: '600 x 800 px (Rasio 3:4)',
                            aspectRatio: '3:4',
                            tips: 'Foto mini produk ukuran 600 x 800 px di hero bar.'
                          }
                        });
                      } else {
                        handleProductOrAppClick(item);
                      }
                    }}
                  >
                    <div className="relative">
                      {isEditMode && (
                        <div className="absolute top-1 right-1 z-20 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          Edit
                        </div>
                      )}
                      <img
                        alt={item.name}
                        src={(item.image && item.image.trim()) ? item.image : (getResolvedProductImage(item, liveProducts) || '/uploads/desain_tanpa_judul__4_-1791989747452.webp')}
                        className="aspect-[75/103] w-full rounded-lg border-white bg-gray-50 object-cover pointer-events-none"
                        onError={(e) => { e.target.src = getResolvedProductImage(item, liveProducts) || '/uploads/desain_tanpa_judul__4_-1791989747452.webp'; }}
                      />
                      {(() => {
                        const live = getLiveProductStatus(item);
                        const appData = getAppVariantData(item);
                        let displayPrice = item.price;
                        if (live && live.minPrice) {
                          displayPrice = live.minPrice;
                        } else if (item.priceNumber) {
                          displayPrice = item.priceNumber;
                        } else if (appData?.packages?.[0]?.price) {
                          displayPrice = appData.packages[0].price;
                        }
                        return (
                          <div className="absolute bottom-1.5 left-1.5">
                            <span className="flex w-fit items-center justify-center rounded-md bg-white/95 px-1.5 py-0.5 text-[11px] font-bold text-zinc-950 shadow-xs">
                              Rp&nbsp;{Number(displayPrice).toLocaleString('id-ID')}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* === SLIDE 2: Netflix Premium Hero Banner (Full Banner Utuh) === */}
          <div className="shrink-0 w-full min-w-full snap-start relative bg-[#141414] overflow-hidden h-[460px] sm:h-[520px] md:h-[580px] lg:h-[620px]">
            <div 
              className={`relative w-full h-full overflow-hidden ${
                isEditMode ? 'ring-2 ring-blue-500/80 cursor-pointer' : ''
              }`}
              onClick={(e) => {
                if (isEditMode) {
                  e.preventDefault();
                  e.stopPropagation();
                  setVisualEditingItem({
                    type: 'hero-top-2',
                    id: 'hero-top-2',
                    name: heroSlide2.title || 'NETFLIX PREMIUM 4K ULTRA HD',
                    brand: heroSlide2.brand || 'NETFLIX',
                    image: heroSlide2.image,
                    link: heroSlide2.link || '/store/app/netflix',
                    recommendation: {
                      dimensions: '1080 x 1080 px (1:1) atau 1200 x 900 px (4:3)',
                      aspectRatio: '1:1 atau 4:3',
                      tips: 'Banner utuh slide 2 (Netflix Premium).'
                    }
                  });
                }
              }}
            >
              {isEditMode && (
                <div className="absolute top-2.5 right-2.5 z-20 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                  Edit Banner Slide 2
                </div>
              )}
              <img
                src={heroSlide2.image}
                alt={heroSlide2.title}
                className="w-full h-full object-cover object-top pointer-events-none"
                draggable={false}
              />
              {/* Clickable Overlay link */}
              <a
                href={heroSlide2.link || '/store/app/netflix'}
                data-carousel-passthrough="true"
                className={`absolute inset-0 z-20 cursor-pointer ${isEditMode ? 'pointer-events-none' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (isEditMode) return;
                  handleProductOrAppClick({
                    ...heroSlide2,
                    brand: 'NETFLIX',
                    name: 'Netflix Premium',
                    title: heroSlide2.title || 'Netflix Premium',
                    link: heroSlide2.link || '/store/app/netflix'
                  });
                }}
              />
            </div>
            {/* Bottom Gradient for indicator dots visibility */}
            <div className="absolute bottom-0 inset-x-0 z-30 h-14 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
          </div>

          {/* === SLIDE 3: YouTube Premium Hero Banner (Full Banner Utuh) === */}
          <div className="shrink-0 w-full min-w-full snap-start relative bg-[#141414] overflow-hidden h-[460px] sm:h-[520px] md:h-[580px] lg:h-[620px]">
            <div 
              className={`relative w-full h-full overflow-hidden ${
                isEditMode ? 'ring-2 ring-blue-500/80 cursor-pointer' : ''
              }`}
              onClick={(e) => {
                if (isEditMode) {
                  e.preventDefault();
                  e.stopPropagation();
                  setVisualEditingItem({
                    type: 'hero-top-3',
                    id: 'hero-top-3',
                    name: heroSlide3.title || 'YOUTUBE PREMIUM & MUSIC HIFI',
                    brand: heroSlide3.brand || 'YOUTUBE',
                    image: heroSlide3.image,
                    link: heroSlide3.link || '/store/app/youtube',
                    recommendation: {
                      dimensions: '1080 x 1080 px (1:1) atau 1200 x 900 px (4:3)',
                      aspectRatio: '1:1 atau 4:3',
                      tips: 'Banner utuh slide 3 (YouTube Premium).'
                    }
                  });
                }
              }}
            >
              {isEditMode && (
                <div className="absolute top-2.5 right-2.5 z-20 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                  Edit Banner Slide 3
                </div>
              )}
              <img
                src={heroSlide3.image}
                alt={heroSlide3.title}
                className="w-full h-full object-cover object-top pointer-events-none"
                draggable={false}
              />
              {/* Clickable Overlay link */}
              <a
                href={heroSlide3.link || '/store/app/youtube'}
                data-carousel-passthrough="true"
                className={`absolute inset-0 z-20 cursor-pointer ${isEditMode ? 'pointer-events-none' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (isEditMode) return;
                  handleProductOrAppClick({
                    ...heroSlide3,
                    brand: 'YOUTUBE',
                    name: 'YouTube Premium',
                    title: heroSlide3.title || 'YouTube Premium',
                    link: heroSlide3.link || '/store/app/youtube'
                  });
                }}
              />
            </div>
            {/* Bottom Gradient for indicator dots visibility */}
            <div className="absolute bottom-0 inset-x-0 z-30 h-14 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
          </div>

        </div>

        {/* Carousel Slide Dots Indicator (floating at bottom center of hero) */}
        <div className="absolute bottom-2 inset-x-0 z-40 flex items-center justify-center gap-1.5 pointer-events-none">
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
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer shadow-md"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        )}
        {heroBigIndex < 2 && (
          <button
            type="button"
            onClick={() => goToHeroBigSlide(heroBigIndex + 1)}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer shadow-md"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        )}
      </div>

      {/* =========================================================
          4. BUBBLE LIST / KATEGORI APLIKASI CEPAT (RESPONSIF SEMUA LAYAR)
      ========================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 py-3 sm:py-5 w-full overflow-hidden">
        <div className="relative group w-full">
          <div 
            ref={bubblesListRef}
            onPointerDown={(e) => startDragScroll(e, bubblesListRef, dragDistBubbles)}
            onTouchStart={(e) => onTouchStartCapture(e, dragDistBubbles)}
            onTouchMove={(e) => onTouchMoveCapture(e, dragDistBubbles)}
            onTouchEnd={() => onTouchEndCapture(dragDistBubbles)}
            onWheel={(e) => handleHorizontalWheel(e, bubblesListRef)}
            onDragStart={(e) => e.preventDefault()}
            className="bubble-list__wrapper flex items-center gap-3 sm:gap-5 overflow-x-auto no-scrollbar py-1 pr-8 sm:pr-12 cursor-grab active:cursor-grabbing select-none w-full max-w-full min-w-0"
            style={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch' }}
          >
            {bubbleList.map((bubble, i) => (
              <div
                key={i}
                onClick={() => {
                  if (dragDistBubbles.current > 5) return;
                  dragDistBubbles.current = 0;
                  if (isEditMode) {
                    setVisualEditingItem({
                      type: 'bubble',
                      index: i,
                      id: `bubble-${i}`,
                      name: bubble.label,
                      brand: bubble.label,
                      image: bubble.img,
                      recommendation: {
                        dimensions: '200 x 200 px (Rasio 1:1)',
                        aspectRatio: '1:1',
                        tips: 'Logo atau ikon aplikasi dengan background bersih.'
                      }
                    });
                  } else {
                    handleProductOrAppClick({
                      brand: bubble.label,
                      name: bubble.label
                    });
                  }
                }}
                className={`flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer w-[64px] sm:w-[76px] md:w-[84px] text-center select-none relative ${
                  isEditMode ? 'ring-2 ring-blue-500/80 rounded-full' : ''
                }`}
                style={{ touchAction: 'pan-x pan-y' }}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] rounded-full p-0.5 bg-gradient-to-tr from-zinc-200 via-zinc-300 to-zinc-400 group-hover:from-black group-hover:to-zinc-600 transition shadow-xs pointer-events-none">
                  <div className="w-full h-full rounded-full bg-white p-1 overflow-hidden flex items-center justify-center pointer-events-none">
                    <img
                      src={bubble.img}
                      alt={bubble.label}
                      draggable={false}
                      className="w-full h-full object-contain pointer-events-none group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                  </div>
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#262626] group-hover:text-black line-clamp-1 leading-tight pointer-events-none">
                  {bubble.label}
                </span>
              </div>
            ))}
            {/* Spacer trailing agar scroll kategori bubble di HP bisa sampai mentok dengan leluasa */}
            <div className="shrink-0 w-12 sm:w-20 h-1 pointer-events-none" aria-hidden="true" />
          </div>

          {/* Tombol Geser Kiri (Desktop) */}
          <button
            type="button"
            onClick={() => {
              if (bubblesListRef.current) {
                bubblesListRef.current.scrollBy({ left: -280, behavior: 'smooth' });
              }
            }}
            className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 border border-zinc-200 shadow-md items-center justify-center text-zinc-700 hover:bg-black hover:text-white transition active:scale-95 z-20 cursor-pointer"
            aria-label="Geser Kategori Kiri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Tombol Geser Kanan (Desktop) */}
          <button
            type="button"
            onClick={() => {
              if (bubblesListRef.current) {
                bubblesListRef.current.scrollBy({ left: 280, behavior: 'smooth' });
              }
            }}
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 border border-zinc-200 shadow-md items-center justify-center text-zinc-700 hover:bg-black hover:text-white transition active:scale-95 z-20 cursor-pointer"
            aria-label="Geser Kategori Kanan"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* =========================================================
          5. D-ONE WAVE TYPOGRAPHY SECTION (Banner & Slider Dihapus)
      ========================================================= */}
      <section className="banner__details-wrapper max-w-[1240px] mx-auto px-4 py-3 md:py-6">
        <div className="banner__hero-wrapper">
          <div className="w-full aspect-[16/6] sm:aspect-[3.2/1] md:aspect-[4/1] max-h-[240px] flex items-center justify-center overflow-hidden bg-white border border-zinc-200/90 rounded-2xl shadow-xs">
            {/* SVG Filter for Fluid Water Distortion */}
            <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
              <defs>
                <filter id="water-wave-filter">
                  <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="2" result="noise">
                    <animate attributeName="baseFrequency" dur="6s" values="0.02 0.05;0.03 0.08;0.02 0.05" repeatCount="indefinite" />
                  </feTurbulence>
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
                </filter>
              </defs>
            </svg>

            {/* Pure Black Fluid Swaying Wave Typography */}
            <div 
              className="wave-body-container select-none text-center px-4 py-3 flex flex-col items-center justify-center"
              style={{ filter: 'url(#water-wave-filter)' }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-widest uppercase text-black leading-none">
                {'D-One'.split('').map((char, cIdx) => (
                  <span 
                    key={cIdx} 
                    className="wave-letter" 
                    style={{ animationDelay: `${cIdx * 0.15}s` }}
                  >
                    {char}
                  </span>
                ))}
              </h2>
              <p className="mt-1.5 sm:mt-2.5 text-xs sm:text-sm md:text-base lg:text-lg font-black tracking-wider uppercase text-zinc-950">
                {'Born to Be Number One'.split('').map((char, cIdx) => (
                  <span 
                    key={cIdx} 
                    className="wave-letter" 
                    style={{ animationDelay: `${0.5 + cIdx * 0.06}s` }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          6. BRANDS THAT GOT YOU LOOKING (Exact Zalora Grid Structure)
      ========================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 py-4 md:py-8">
        <div className="grid__inner-wrapper">
          <div className="post-type__title truncated truncated--two-lines font-bold text-lg md:text-xl text-[#262626]">
            Brand Aplikasi Populer
          </div>
          <div className="post-type__description truncated truncated--two-lines text-xs text-[#737373] mt-0.5 mb-3">
            Akun Resmi &amp; Siap Pakai
          </div>
          <div className="post-type__content">
            <div className="cls-relative relative group">
              <div
                ref={brandsGridRef}
                onTouchStart={() => { dragDistBrands.current = 0; }}
                onMouseDown={onBrandsPointerDown}
                onMouseMove={onBrandsPointerMove}
                onMouseUp={onBrandsPointerUp}
                onMouseLeave={onBrandsPointerUp}
                className="grid grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3.5 pb-2"
                id="grid"
              >
                {brands1List.map((item, idx) => (
                  <div
                    key={idx}
                    className="no-decoration grid__item block rounded-lg overflow-hidden cursor-pointer select-none active:scale-95 transition relative"
                    onClick={(e) => {
                      e.preventDefault();
                      dragDistBrands.current = 0;
                      if (isEditMode) {
                        setVisualEditingItem({
                          type: 'brand1-item',
                          index: idx,
                          id: `brand1-${idx}`,
                          name: item.name || item.brand,
                          brand: item.brand,
                          image: item.img,
                          label: item.label,
                          recommendation: {
                            dimensions: '560 x 800 px (Rasio 7:10 Portrait) atau 3:4',
                            aspectRatio: '7:10 atau 3:4',
                            tips: 'Kartu poster vertikal brand atau lookbook aplikasi.'
                          }
                        });
                      } else {
                        handleProductOrAppClick({
                          brand: item.brand,
                          name: item.name || item.brand,
                          image: item.img
                        });
                      }
                    }}
                    data-placement-id="static"
                    data-entry-id={`brand-item-${idx}`}
                  >
                    <div className={`grid__media-item-wrapper aspect-[280/404] w-full overflow-hidden rounded-lg bg-gray-50 relative ${
                      isEditMode ? 'ring-2 ring-blue-500/80 hover:ring-blue-400' : ''
                    }`}>
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setVisualEditingItem({
                              type: 'brand1-item',
                              index: idx,
                              id: `brand1-${idx}`,
                              name: item.name || item.brand,
                              brand: item.brand,
                              image: item.img,
                              label: item.label,
                              recommendation: {
                                dimensions: '560 x 800 px (Rasio 7:10 Portrait) atau 3:4',
                                aspectRatio: '7:10 atau 3:4',
                                tips: 'Kartu poster vertikal brand atau lookbook aplikasi.'
                              }
                            });
                          }}
                          className="absolute top-1.5 right-1.5 z-30 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                      <img
                        fetchPriority={idx === 0 ? "high" : "auto"}
                        className="grid__media-image w-full h-full object-cover pointer-events-none"
                        src={item.img}
                        alt={item.brand}
                        loading={idx === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          7. TOP TIER RECOMMENDATIONS (Zalora Authentic Carousel)
      ========================================================= */}
      <section id="products-section" className="post-type-wrapper recommendation-wrapper custom-style w-full min-w-0 max-w-[1240px] mx-auto px-4 py-6 scroll-mt-20 overflow-hidden">
        <div className="recommendation__details-wrapper w-full min-w-0 max-w-full">
          <div className="post-type__title truncated truncated--two-lines recommendation__title--with-banner text-lg md:text-xl font-bold text-[#262626] mb-3">
            Aplikasi Terlaris (Top Tier)
          </div>
          <div className="recommendation__product-list-wrapper w-full min-w-0 max-w-full">
            <div className="cls-relative relative w-full min-w-0 max-w-full">
              <div 
                ref={topTierListRef}
                onScroll={(e) => updateScrollState(e.currentTarget, setTopTierScrollState)}
                onPointerDown={(e) => startDragScroll(e, topTierListRef, dragDistTopTier)}
                onTouchStart={(e) => onTouchStartCapture(e, dragDistTopTier)}
                onTouchMove={(e) => onTouchMoveCapture(e, dragDistTopTier)}
                onTouchEnd={() => onTouchEndCapture(dragDistTopTier)}
                onWheel={(e) => handleHorizontalWheel(e, topTierListRef)}
                onDragStart={(e) => e.preventDefault()}
                className="product-list__wrapper flex overflow-x-auto gap-2 sm:gap-2.5 pb-3 no-scrollbar cursor-grab active:cursor-grabbing select-none w-full max-w-full min-w-0" 
                id="grid" 
                style={{ justifyContent: 'unset', touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch' }}
              >
                {topTierProducts.map((prod, idx) => {
                  const resolvedImg = (prod.image && prod.image.trim() && !prod.image.includes('desain_tanpa_judul__4') && !prod.image.includes('edit_template_colors__') && !prod.image.includes('ctfassets'))
                    ? prod.image
                    : (getResolvedProductImage(prod, liveProducts) || '');

                  return (
                    <div 
                      key={prod.sku || idx} 
                      className={`product-item__wrapper shrink-0 w-[145px] sm:w-[175px] md:w-[210px] bg-white rounded-lg p-2 md:p-2.5 flex flex-col justify-between border border-zinc-100 hover:shadow-xs transition select-none cursor-pointer relative ${
                        isEditMode ? 'ring-2 ring-blue-500/80 hover:ring-blue-400' : ''
                      }`}
                      style={{ touchAction: 'pan-x pan-y' }}
                      data-sku={prod.sku}
                      onClick={(e) => {
                        if (isEditMode) {
                          e.preventDefault();
                          dragDistTopTier.current = 0;
                          setVisualEditingItem({
                            type: 'product-toptier',
                            id: prod.sku || prod.id,
                            name: prod.name,
                            brand: prod.brand,
                            image: resolvedImg,
                            price: prod.priceNumber || prod.price || 15000,
                            category: 'Top Tier',
                            recommendation: {
                              dimensions: '600 x 800 px (Rasio 3:4)',
                              aspectRatio: '3:4',
                              tips: 'Gunakan gambar vertikal 600 x 800 px (3:4) agar pas memenuhi kartu tanpa terpotong.'
                            }
                          });
                          return;
                        }
                        if (dragDistTopTier.current > 20) return;
                        dragDistTopTier.current = 0;
                        handleProductOrAppClick({
                          id: prod.sku,
                          name: prod.name,
                          brand: prod.brand,
                          image: prod.image,
                          price: prod.priceNumber,
                          originalPrice: prod.originalPriceNumber,
                          discount: prod.discount,
                          category: 'Top Tier'
                        });
                      }}
                    >
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dragDistTopTier.current = 0;
                            setVisualEditingItem({
                              type: 'product-toptier',
                              id: prod.sku || prod.id,
                              name: prod.name,
                              brand: prod.brand,
                              image: resolvedImg,
                              price: prod.priceNumber || prod.price || 15000,
                              category: 'Top Tier',
                              recommendation: {
                                dimensions: '600 x 800 px (Rasio 3:4)',
                                aspectRatio: '3:4',
                                tips: 'Gunakan gambar vertikal 600 x 800 px (3:4) agar pas memenuhi kartu tanpa terpotong.'
                              }
                            });
                          }}
                          className="absolute top-1.5 right-1.5 z-30 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md hover:bg-blue-700 active:scale-95 transition cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                      <div 
                        className="product-item__product-image-wrapper aspect-[3/4] bg-[#f7f7f7] rounded-lg overflow-hidden flex items-center justify-center relative block cursor-pointer p-0"
                        onClick={(e) => {
                          if (isEditMode) {
                            e.preventDefault();
                            e.stopPropagation();
                            dragDistTopTier.current = 0;
                            setVisualEditingItem({
                              type: 'product-toptier',
                              id: prod.sku || prod.id,
                              name: prod.name,
                              brand: prod.brand,
                              image: resolvedImg,
                              price: prod.priceNumber || prod.price || 15000,
                              category: 'Top Tier',
                              recommendation: {
                                dimensions: '600 x 800 px (Rasio 3:4)',
                                aspectRatio: '3:4',
                                tips: 'Gunakan gambar vertikal 600 x 800 px (3:4) agar pas memenuhi kartu tanpa terpotong.'
                              }
                            });
                          }
                        }}
                      >
                        <img 
                          className="product-item__product-image w-full h-full object-cover pointer-events-none transition duration-300 hover:scale-105" 
                          src={resolvedImg || '/uploads/desain_tanpa_judul__4_-1791989747452.webp'} 
                          alt={prod.name} 
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getResolvedProductImage(prod, liveProducts) || '/uploads/desain_tanpa_judul__4_-1791989747452.webp';
                          }}
                          fetchPriority="low" 
                          loading="eager" 
                        />
                      </div>
                      <div className="product-item__contents w-full relative mt-2 mb-2 flex-1 flex flex-col cursor-pointer">
                        <div className="no-decoration block pr-6 cursor-pointer">
                          <div className="product-item__brand truncated truncated--one-line text-xs md:text-sm font-bold text-[#262626] uppercase truncate">
                            {prod.brand}
                          </div>
                          <div className="product-item__name truncated truncated--one-line text-xs md:text-sm text-[#737373] truncate mt-0.5">
                            {prod.name}
                          </div>

                          <div className="my-1.5 flex max-w-full flex-wrap items-baseline gap-1.5 whitespace-nowrap" data-test-id="productPrice">
                            {(() => {
                              const live = getLiveProductStatus(prod);
                              if (live) {
                                if (!live.isAvailable) {
                                  return (
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-xs text-zinc-400 line-through">
                                        {prod.hasVoucher ? prod.voucherPrice : (prod.specialPrice || prod.originalPrice)}
                                      </span>
                                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                        Habis
                                      </span>
                                    </div>
                                  );
                                }
                                if (live.minPrice) {
                                  return (
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-xs sm:text-sm text-zinc-950">
                                        {formatRupiah(live.minPrice)}
                                      </span>
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Ready
                                      </span>
                                    </div>
                                  );
                                }
                              }
                              return (
                                <span className="font-bold text-xs sm:text-sm text-zinc-950">
                                  {prod.hasVoucher ? prod.voucherPrice : (prod.specialPrice || prod.originalPrice)}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                      <button 
                        className="zui-btn zui-btn-outline mt-auto h-10 min-h-[40px] rounded-lg tablet:h-12 w-full text-xs sm:text-sm font-bold border border-[#474747] text-[#262626] hover:bg-[#262626] hover:text-white transition active:scale-95 cursor-pointer flex items-center justify-center" 
                        aria-label={isEditMode ? 'Edit Produk' : 'Pesan'} 
                        data-test-id="addToBagButton"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          dragDistTopTier.current = 0;
                          if (isEditMode) {
                            setVisualEditingItem({
                              type: 'product-toptier',
                              id: prod.sku || prod.id,
                              name: prod.name,
                              brand: prod.brand,
                              image: resolvedImg,
                              price: prod.priceNumber || prod.price || 15000,
                              category: 'Top Tier',
                              recommendation: {
                                dimensions: '600 x 800 px (Rasio 3:4)',
                                aspectRatio: '3:4',
                                tips: 'Gunakan gambar vertikal 600 x 800 px (3:4) agar pas memenuhi kartu tanpa terpotong.'
                              }
                            });
                          } else {
                            handleProductOrAppClick({
                              id: prod.sku,
                              name: prod.name,
                              brand: prod.brand,
                              image: prod.image,
                              price: prod.priceNumber,
                              originalPrice: prod.originalPriceNumber,
                              discount: prod.discount,
                              category: 'Top Tier'
                            });
                          }
                        }}
                      >
                        {isEditMode ? 'Edit Produk' : 'Pesan'}
                      </button>
                    </div>
                  );
                })}
                {/* Spacer trailing agar carousel Top Tier di HP bisa di-slide sampai mentok dengan leluasa */}
                <div className="shrink-0 w-8 sm:w-16 h-1 pointer-events-none" aria-hidden="true" />
              </div>

              {/* Zalora Right Control Button (Desktop) */}
              <button
                type="button"
                onClick={() => {
                  if (topTierListRef.current) {
                    topTierListRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                  }
                }}
                className={`post-type__carousel-control-button post-type__carousel-right-button ${!topTierScrollState.canRight ? 'post-type__carousel-right-button--hide' : ''}`}
                aria-label="Scroll Top Tier Right"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block h-6 w-6">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12.307 6.338c-.34.33-.34.865.003 1.194l3.979 3.821H4.667c-.368 0-.667.336-.667.75s.299.75.667.75h11.37l-3.73 3.618c-.34.33-.34.865.003 1.194a.898.898 0 001.237-.003l5.25-5.091a.824.824 0 00-.003-1.194l-5.25-5.042a.898.898 0 00-1.237.003z" fill="#262626" />
                </svg>
              </button>

              {/* Zalora Left Control Button (Desktop) */}
              <button
                type="button"
                onClick={() => {
                  if (topTierListRef.current) {
                    topTierListRef.current.scrollBy({ left: -320, behavior: 'smooth' });
                  }
                }}
                className={`post-type__carousel-control-button post-type__carousel-left-button ${!topTierScrollState.canLeft ? 'post-type__carousel-left-button--hide' : ''}`}
                aria-label="Scroll Top Tier Left"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block h-6 w-6 rotate-180">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12.307 6.338c-.34.33-.34.865.003 1.194l3.979 3.821H4.667c-.368 0-.667.336-.667.75s.299.75.667.75h11.37l-3.73 3.618c-.34.33-.34.865.003 1.194a.898.898 0 001.237-.003l5.25-5.091a.824.824 0 00-.003-1.194l-5.25-5.042a.898.898 0 00-1.237.003z" fill="#262626" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          8. KATEGORI PILIHAN & TREN DIGITAL (Navigasi Halaman Sub-Kategori Baru)
      ========================================================= */}
      <section id="categories-section" className="banner__details-wrapper max-w-[1240px] mx-auto px-4 py-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-3.5 gap-2">
          <div>
            <div className="post-type__title text-lg md:text-xl font-bold text-[#262626]">
              Kategori Pilihan &amp; Tren Digital
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Pilih kategori untuk membuka halaman katalog lengkap dan varian lisensi resmi bergaransi.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-zinc-400">
              {trendList.length} Kategori Utama
            </span>
          </div>
        </div>

        {/* 6 Category Posters Grid (Rapat, Kompak & Menghubungkan ke Halaman Baru) */}
        <div className="post-type__content">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5">
            {trendList.map((slide, idx) => {
              const slugMap = {
                ai: 'ai-tools',
                streaming: 'streaming',
                design: 'graphic-design',
                music: 'music-audio',
                edukasi: 'edukasi',
                vpn: 'vpn-security',
                office: 'office-tools',
                all: 'all'
              };
              const targetSlug = slide.slug || slugMap[slide.segmentId] || (idx === 0 ? 'ai-tools' : idx === 1 ? 'streaming' : idx === 2 ? 'graphic-design' : idx === 3 ? 'music-audio' : idx === 4 ? 'vpn-security' : 'office-tools');
              const targetUrl = (slide.link && slide.link.startsWith('/store') ? slide.link : ('/store/' + targetSlug)) + (isAdminMode ? '?admin=1' : '');

              return (
                <Link
                  key={idx}
                  href={targetUrl}
                  onClick={(e) => {
                    if (isEditMode) {
                      e.preventDefault();
                      setVisualEditingItem({
                        type: 'trend-item',
                        index: idx,
                        id: 'trend-' + idx,
                        name: slide.title,
                        brand: slide.title,
                        image: slide.img,
                        label: slide.label,
                        recommendation: {
                          dimensions: '700 x 1200 px (Rasio 7:12 Portrait)',
                          aspectRatio: '7:12',
                          tips: 'Poster vertikal tren & kategori digital.'
                        }
                      });
                    }
                  }}
                  className="no-decoration grid__item block rounded-xl overflow-hidden cursor-pointer select-none active:scale-95 transition relative group"
                  data-placement-id="static"
                  data-entry-id={'trend-slide-' + idx}
                >
                  <div className={'aspect-[7/12] w-full overflow-hidden rounded-xl bg-zinc-900 relative shadow-xs transition duration-200 hover:shadow-md hover:scale-[1.01] ' + (
                    isEditMode ? 'ring-2 ring-blue-500/80 hover:ring-blue-400' : ''
                  )}>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setVisualEditingItem({
                            type: 'trend-item',
                            index: idx,
                            id: 'trend-' + idx,
                            name: slide.title,
                            brand: slide.title,
                            image: slide.img,
                            label: slide.label,
                            recommendation: {
                              dimensions: '700 x 1200 px (Rasio 7:12 Portrait)',
                              aspectRatio: '7:12',
                              tips: 'Poster vertikal tren & kategori digital.'
                            }
                          });
                        }}
                        className="absolute top-1.5 right-1.5 z-30 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow cursor-pointer"
                      >
                        Edit
                      </button>
                    )}

                    <img
                      className="w-full h-full object-cover pointer-events-none group-hover:scale-105 transition duration-300"
                      fetchPriority={idx === 0 ? "high" : "auto"}
                      src={slide.img}
                      alt={slide.title}
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          9. STEALS YOU CAN'T MISS (Zalora Hero Banner Carousel)
      ========================================================= */}
      <section className="banner__details-wrapper max-w-[1240px] mx-auto px-4 py-6">
        <div className="post-type__title truncated truncated--two-lines margin-bottom text-lg md:text-xl font-bold text-[#262626] mb-3">
          Promo Kilat &amp; Paket Hemat
        </div>
        <div className="post-type__content banner__hero-wrapper">
          <div style={{ paddingBottom: '0px' }}>
            <div className="slider-container relative select-none">
              <div aria-live="off" aria-atomic="true" tabIndex={-1} style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', padding: '0px', margin: '-1px', clip: 'rect(0px, 0px, 0px, 0px)', whiteSpace: 'nowrap', border: '0px' }}>
                {`Slide ${stealsCarousel.currentIndex + 1} of 2`}
              </div>

              {/* Bullet Dots */}
              <div className="slider-control-bottomcenter absolute z-10 bottom-1.5 left-1/2 -translate-x-1/2">
                <ul style={{ display: 'flex', margin: '0px', padding: '0px', listStyleType: 'none' }}>
                  {[0, 1].map((dotIdx) => {
                    const isActive = stealsCarousel.currentIndex === dotIdx;
                    return (
                      <li key={dotIdx} className={`paging-item ${isActive ? 'active' : ''}`} style={{ outline: 'none', padding: '0 6px' }}>
                        <button
                          className="banner__carousel-paging-dots--hide"
                          type="button"
                          aria-label={`slide ${dotIdx + 1} bullet`}
                          aria-selected={isActive}
                          onClick={() => stealsCarousel.goToSlide(dotIdx)}
                          style={{
                            cursor: 'pointer',
                            opacity: isActive ? 1 : 0.5,
                            background: 'transparent',
                            border: 'none',
                            fill: 'black',
                            padding: 0
                          }}
                        >
                          <svg className="paging-dot" width="6" height="6" aria-hidden="true" focusable="false">
                            <circle cx="3" cy="3" r="3" fill="#000" />
                          </svg>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Slider Frame */}
              <div
                ref={stealsCarousel.containerRef}
                {...stealsCarousel.handlers}
                className="slider-frame flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full relative outline-none h-auto cursor-grab active:cursor-grabbing rounded-xl select-none"
                style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', touchAction: 'pan-x pan-y' }}
                aria-label="carousel-slider"
                role="region"
                tabIndex={-1}
              >
                {stealsList.map((slide, idx) => (
                  <div
                    key={idx}
                    className="shrink-0 w-full min-w-full snap-start snap-always px-2"
                  >
                    <a
                      className="no-decoration banner__media-link block select-none"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (stealsCarousel.wasDragged()) return;
                        if (isEditMode) {
                          setVisualEditingItem({
                            type: 'steals-banner',
                            id: `steals-${idx}`,
                            index: idx,
                            name: slide.title,
                            title: slide.title,
                            image: slide.img,
                            recommendation: {
                              dimensions: '1240 x 300 px (Banner Horizontal)',
                              aspectRatio: '4:1',
                              tips: 'Banner horizontal penawaran steals / diskon spesial.'
                            }
                          });
                        } else {
                          handleProductOrAppClick({
                            name: slide.title,
                            title: slide.title,
                            image: slide.img
                          });
                        }
                      }}
                      data-placement-id="static"
                      data-entry-id={`steals-slide-${idx}`}
                      draggable={false}
                    >
                      <div className={`banner__media-item-wrapper rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition w-full h-[180px] sm:h-[240px] md:h-[300px] bg-transparent border-0 outline-none relative ${
                        isEditMode ? 'ring-2 ring-blue-500/80 hover:ring-blue-400' : ''
                      }`}>
                        {isEditMode && (
                          <div className="absolute top-2 right-2 z-20 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            Edit
                          </div>
                        )}
                        {(!slide.img || slide.img === '/uploads/banner_jasa_website_desktop.webp' || slide.img === '/uploads/banner_jasa_website_neo_brutalism.webp' || slide.img === '/uploads/banner_jasa_web_dstore_1080x450.webp') ? (
                          <>
                            <img
                              className="block sm:hidden unit-element__media-image banner__media-image w-full h-full object-cover object-center pointer-events-none"
                              fetchPriority={idx === 0 ? "high" : "auto"}
                              src="/uploads/banner_jasa_website_mobile.webp"
                              alt={slide.title}
                              draggable="false"
                            />
                            <img
                              className="hidden sm:block unit-element__media-image banner__media-image w-full h-full object-cover object-center pointer-events-none"
                              fetchPriority={idx === 0 ? "high" : "auto"}
                              src="/uploads/banner_jasa_website_desktop.webp"
                              alt={slide.title}
                              draggable="false"
                            />
                          </>
                        ) : (
                          <img
                            className="unit-element__media-image banner__media-image w-full h-full object-cover object-center pointer-events-none"
                            fetchPriority={idx === 0 ? "high" : "auto"}
                            src={slide.img}
                            alt={slide.title}
                            draggable="false"
                          />
                        )}
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          10. BRANDS THAT GOT YOU LOOKING (Round 2 - Exact Zalora Grid)
      ========================================================= */}
      <section className="post-type-wrapper grid-wrapper max-w-[1240px] mx-auto px-4 py-8">
        <div className="grid__inner-wrapper">
          <div className="post-type__title truncated truncated--two-lines text-lg md:text-xl font-bold text-[#262626]">
            Akun &amp; Layanan Produktivitas
          </div>
          <div className="post-type__description truncated truncated--two-lines text-xs text-[#737373] mt-0.5 mb-3">
            Aktivasi Cepat &amp; Siap Pakai
          </div>
          <div className="post-type__content">
            <div className="cls-relative">
              <div
                className="grid grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3.5 pb-2"
                id="grid"
              >
                {brands2List.map((item, idx) => (
                  <a
                    key={idx}
                    className="no-decoration grid__item block rounded-lg overflow-hidden cursor-pointer select-none active:scale-95 transition"
                    onClick={(e) => {
                      e.preventDefault();
                      if (isEditMode) {
                        setVisualEditingItem({
                          type: 'brand2-item',
                          id: `brand2-${idx}`,
                          index: idx,
                          name: item.brand,
                          brand: item.brand,
                          image: item.img,
                          recommendation: {
                            dimensions: '280 x 404 px (Rasio 7:10 Portrait)',
                            aspectRatio: '7:10',
                            tips: 'Kartu poster vertikal brand atau lookbook aplikasi.'
                          }
                        });
                      } else {
                        handleProductOrAppClick({
                          brand: item.brand,
                          name: item.brand,
                          image: item.img
                        });
                      }
                    }}
                    data-placement-id="static"
                    data-entry-id={`brand2-item-${idx}`}
                  >
                    <div className={`grid__media-item-wrapper aspect-[280/404] w-full overflow-hidden rounded-lg bg-gray-50 relative ${
                      isEditMode ? 'ring-2 ring-blue-500/80 hover:ring-blue-400' : ''
                    }`}>
                      {isEditMode && (
                        <div className="absolute top-1.5 right-1.5 z-20 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          Edit
                        </div>
                      )}
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
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          11. APPLY NOW (Zalora Hero Banner Carousel - Auto & Manual Slide)
      ========================================================= */}
      <section className="banner__details-wrapper max-w-[1240px] mx-auto px-4 py-4 md:py-6">
        <div className="post-type__content banner__hero-wrapper">
          <div style={{ paddingBottom: '0px' }}>
            <div className="slider-container relative select-none">
              <div aria-live="off" aria-atomic="true" tabIndex={-1} style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', padding: '0px', margin: '-1px', clip: 'rect(0px, 0px, 0px, 0px)', whiteSpace: 'nowrap', border: '0px' }}>
                {applyList.length > 1 ? `Slide ${applyCarousel.currentIndex + 1} of ${applyList.length}` : 'Slide 1 of 1'}
              </div>

              {/* Bullet Dots (Hanya jika slide lebih dari 1) */}
              {applyList.length > 1 && (
                <div className="slider-control-bottomcenter absolute z-10 bottom-1.5 left-1/2 -translate-x-1/2">
                  <ul style={{ display: 'flex', margin: '0px', padding: '0px', listStyleType: 'none' }}>
                    {applyList.map((_, dotIdx) => {
                      const isActive = applyCarousel.currentIndex === dotIdx;
                      return (
                        <li key={dotIdx} className={`paging-item ${isActive ? 'active' : ''}`} style={{ outline: 'none', padding: '0 6px' }}>
                          <button
                            className="banner__carousel-paging-dots--hide"
                            type="button"
                            aria-label={`slide ${dotIdx + 1} bullet`}
                            aria-selected={isActive}
                            onClick={() => applyCarousel.goToSlide(dotIdx)}
                            style={{
                              cursor: 'pointer',
                              opacity: isActive ? 1 : 0.5,
                              background: 'transparent',
                              border: 'none',
                              fill: 'black',
                              padding: 0
                            }}
                          >
                            <svg className="paging-dot" width="6" height="6" aria-hidden="true" focusable="false">
                              <circle cx="3" cy="3" r="3" fill="#000" />
                            </svg>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Slider Frame */}
              <div
                ref={applyCarousel.containerRef}
                {...applyCarousel.handlers}
                className="slider-frame flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full relative outline-none h-auto cursor-grab active:cursor-grabbing rounded-xl select-none"
                style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', touchAction: 'pan-x pan-y' }}
                aria-label="carousel-slider"
                role="region"
                tabIndex={-1}
              >
                {applyList.map((slide, idx) => (
                  <div
                    key={idx}
                    className="shrink-0 w-full min-w-full snap-start snap-always px-2"
                  >
                    <a
                      className="no-decoration banner__media-link block select-none"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (applyCarousel.wasDragged()) return;
                        if (isEditMode) {
                          setVisualEditingItem({
                            type: 'apply-banner',
                            id: `apply-${idx}`,
                            index: idx,
                            name: slide.title,
                            title: slide.title,
                            image: slide.img,
                            link: slide.link || '',
                            recommendation: {
                              dimensions: '1200 x 280 px (Banner Hero Horizontal)',
                              aspectRatio: '4:1',
                              tips: 'Banner keuntungan member / partner aplikasi / jasa web.'
                            }
                          });
                        } else {
                          const targetUrl = (slide.link && slide.link.startsWith('http'))
                            ? slide.link
                            : 'https://wa.me/6281230112240?text=' + encodeURIComponent('Halo Admin D Store, saya tertarik dengan jasa pembuatan website. Boleh konsultasi mengenai paket, fitur, dan harganya?');
                          openExternalUrl(targetUrl);
                        }
                      }}
                      data-placement-id="static"
                      data-entry-id={`apply-slide-${idx}`}
                      draggable={false}
                    >
                      <div className={`banner__media-item-wrapper rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition w-full h-[180px] sm:h-[230px] md:h-[280px] bg-transparent border-0 outline-none relative ${
                        isEditMode ? 'ring-2 ring-blue-500/80 hover:ring-blue-400' : ''
                      }`}>
                        {isEditMode && (
                          <div className="absolute top-2 right-2 z-20 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            Edit
                          </div>
                        )}
                        {(!slide.img || slide.img === '/uploads/banner_jasa_website_desktop.webp' || slide.img === '/uploads/banner_jasa_website_neo_brutalism.webp' || slide.img === '/uploads/banner_jasa_web_dstore_1080x450.webp') ? (
                          <>
                            <img
                              className="block sm:hidden unit-element__media-image banner__media-image w-full h-full object-cover object-center pointer-events-none"
                              fetchPriority={idx === 0 ? "high" : "auto"}
                              src="/uploads/banner_jasa_website_mobile.webp"
                              alt={slide.title}
                              draggable="false"
                            />
                            <img
                              className="hidden sm:block unit-element__media-image banner__media-image w-full h-full object-cover object-center pointer-events-none"
                              fetchPriority={idx === 0 ? "high" : "auto"}
                              src="/uploads/banner_jasa_website_desktop.webp"
                              alt={slide.title}
                              draggable="false"
                            />
                          </>
                        ) : (
                          <img
                            className="unit-element__media-image banner__media-image w-full h-full object-cover object-center pointer-events-none"
                            fetchPriority={idx === 0 ? "high" : "auto"}
                            src={slide.img}
                            alt={slide.title}
                            draggable="false"
                          />
                        )}
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* =========================================================
          13. JUST FOR YOU (Zalora Recommendation Product Carousel)
      ========================================================= */}
      <section className="post-type-wrapper recommendation-wrapper custom-style w-full min-w-0 max-w-[1240px] mx-auto px-4 py-8 overflow-hidden">
        <div className="recommendation__details-wrapper w-full min-w-0 max-w-full">
          <div className="post-type__title truncated truncated--two-lines text-lg md:text-xl font-bold text-[#262626] mb-3">
            Rekomendasi Spesial Untuk Anda
          </div>

          <div className="recommendation__product-list-wrapper w-full min-w-0 max-w-full">
            <div className="cls-relative relative w-full min-w-0 max-w-full">
              <div
                ref={justForYouListRef}
                onScroll={(e) => updateScrollState(e.currentTarget, setJfyScrollState)}
                onPointerDown={(e) => startDragScroll(e, justForYouListRef, dragDistJustForYou)}
                onTouchStart={(e) => onTouchStartCapture(e, dragDistJustForYou)}
                onTouchMove={(e) => onTouchMoveCapture(e, dragDistJustForYou)}
                onTouchEnd={() => onTouchEndCapture(dragDistJustForYou)}
                onWheel={(e) => handleHorizontalWheel(e, justForYouListRef)}
                onDragStart={(e) => e.preventDefault()}
                className="product-list__wrapper flex gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing pb-4 select-none w-full max-w-full min-w-0"
                id="grid"
                style={{
                  justifyContent: 'unset',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  touchAction: 'pan-x pan-y'
                }}
              >
                {justForYouProducts.map((prod, idx) => {
                  const resolvedImg = (prod.image && prod.image.trim() && !prod.image.includes('desain_tanpa_judul__4') && !prod.image.includes('edit_template_colors__') && !prod.image.includes('ctfassets'))
                    ? prod.image
                    : (getResolvedProductImage(prod, liveProducts) || '');

                  return (
                    <div
                      key={prod.sku || idx}
                      className={`product-item__wrapper shrink-0 w-[145px] sm:w-[175px] md:w-[210px] bg-white rounded-lg p-2 md:p-2.5 flex flex-col justify-between border border-zinc-100 hover:shadow-xs transition select-none cursor-pointer relative ${
                        isEditMode ? 'ring-2 ring-blue-500/80 hover:ring-blue-400' : ''
                      }`}
                      style={{ touchAction: 'pan-x pan-y' }}
                      data-sku={prod.sku}
                      onClick={(e) => {
                        if (isEditMode) {
                          e.preventDefault();
                          dragDistJustForYou.current = 0;
                          setVisualEditingItem({
                            type: 'product-justforyou',
                            id: prod.sku || prod.id,
                            name: prod.name,
                            brand: prod.brand,
                            image: resolvedImg,
                            price: prod.priceNumber || prod.price || 15000,
                            category: 'Just For You',
                            recommendation: {
                              dimensions: '600 x 800 px (Rasio 3:4)',
                              aspectRatio: '3:4',
                              tips: 'Gunakan gambar vertikal 600 x 800 px (3:4) agar pas memenuhi kartu tanpa terpotong.'
                            }
                          });
                          return;
                        }
                        if (dragDistJustForYou.current > 20) return;
                        dragDistJustForYou.current = 0;
                        handleProductOrAppClick({
                          id: prod.sku,
                          name: prod.name,
                          brand: prod.brand,
                          image: prod.image,
                          price: prod.priceNumber,
                          originalPrice: prod.originalPriceNumber,
                          discount: prod.discount,
                          category: 'Just For You'
                        });
                      }}
                    >
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dragDistJustForYou.current = 0;
                            setVisualEditingItem({
                              type: 'product-justforyou',
                              id: prod.sku || prod.id,
                              name: prod.name,
                              brand: prod.brand,
                              image: resolvedImg,
                              price: prod.priceNumber || prod.price || 15000,
                              category: 'Just For You',
                              recommendation: {
                                dimensions: '600 x 800 px (Rasio 3:4)',
                                aspectRatio: '3:4',
                                tips: 'Gunakan gambar vertikal 600 x 800 px (3:4) agar pas memenuhi kartu tanpa terpotong.'
                              }
                            });
                          }}
                          className="absolute top-1.5 right-1.5 z-30 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md hover:bg-blue-700 active:scale-95 transition cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                      <div
                        className="product-item__product-image-wrapper aspect-[3/4] bg-[#f7f7f7] rounded-lg overflow-hidden flex items-center justify-center relative block cursor-pointer p-0"
                        onClick={(e) => {
                          if (isEditMode) {
                            e.preventDefault();
                            e.stopPropagation();
                            dragDistJustForYou.current = 0;
                            setVisualEditingItem({
                              type: 'product-justforyou',
                              id: prod.sku || prod.id,
                              name: prod.name,
                              brand: prod.brand,
                              image: resolvedImg,
                              price: prod.priceNumber || prod.price || 15000,
                              category: 'Just For You',
                              recommendation: {
                                dimensions: '600 x 800 px (Rasio 3:4)',
                                aspectRatio: '3:4',
                                tips: 'Gunakan gambar vertikal 600 x 800 px (3:4) agar pas memenuhi kartu tanpa terpotong.'
                              }
                            });
                          }
                        }}
                      >
                        <img 
                          className="product-item__product-image w-full h-full object-cover pointer-events-none transition duration-300 hover:scale-105" 
                          src={resolvedImg || '/uploads/desain_tanpa_judul__4_-1791989747452.webp'} 
                          alt={prod.name} 
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getResolvedProductImage(prod, liveProducts) || '/uploads/desain_tanpa_judul__4_-1791989747452.webp';
                          }}
                          fetchPriority="low" 
                          loading="lazy" 
                        />
                      </div>

                      <div className="product-item__contents w-full relative mt-2 mb-2 flex-1 flex flex-col cursor-pointer">
                        <div 
                          className="no-decoration block pr-6 cursor-pointer" 
                          onClick={(e) => {
                            if (isEditMode) {
                              e.preventDefault();
                              e.stopPropagation();
                              dragDistJustForYou.current = 0;
                              setVisualEditingItem({
                                type: 'product-justforyou',
                                id: prod.sku || prod.id,
                                name: prod.name,
                                brand: prod.brand,
                                image: resolvedImg,
                                price: prod.priceNumber || prod.price || 15000,
                                category: 'Just For You',
                                recommendation: {
                                  dimensions: '600 x 800 px (Rasio 3:4)',
                                  aspectRatio: '3:4',
                                  tips: 'Gunakan gambar vertikal 600 x 800 px (3:4) agar pas memenuhi kartu tanpa terpotong.'
                                }
                              });
                            }
                          }}
                        >
                          <div className="product-item__brand truncated truncated--one-line text-xs md:text-sm font-bold text-[#262626] uppercase truncate">
                            {prod.brand}
                          </div>
                          <div className="product-item__name truncated truncated--one-line text-xs md:text-sm text-[#737373] truncate mt-0.5">
                            {prod.name}
                          </div>

                          <div className="my-1.5 flex max-w-full flex-wrap items-baseline gap-1.5 whitespace-nowrap" data-test-id="productPrice">
                            {(() => {
                              const live = getLiveProductStatus(prod);
                              if (live) {
                                if (!live.isAvailable) {
                                  return (
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-xs text-zinc-400 line-through">
                                        {prod.hasVoucher ? prod.voucherPrice : (prod.specialPrice || prod.originalPrice)}
                                      </span>
                                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                        Habis
                                      </span>
                                    </div>
                                  );
                                }
                                if (live.minPrice) {
                                  return (
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-xs sm:text-sm text-zinc-950">
                                        {formatRupiah(live.minPrice)}
                                      </span>
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Ready
                                      </span>
                                    </div>
                                  );
                                }
                              }
                              return (
                                <span className="font-bold text-xs sm:text-sm text-zinc-950">
                                  {prod.hasVoucher ? prod.voucherPrice : (prod.specialPrice || prod.originalPrice)}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      <button 
                        className="zui-btn zui-btn-outline mt-auto h-10 min-h-[40px] rounded-lg tablet:h-12 w-full text-xs sm:text-sm font-bold border border-[#474747] text-[#262626] hover:bg-[#262626] hover:text-white transition active:scale-95 cursor-pointer flex items-center justify-center" 
                        aria-label={isEditMode ? 'Edit Produk' : 'Pesan'} 
                        data-test-id="addToBagButton"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          dragDistJustForYou.current = 0;
                          if (isEditMode) {
                            setVisualEditingItem({
                              type: 'product-justforyou',
                              id: prod.sku || prod.id,
                              name: prod.name,
                              brand: prod.brand,
                              image: resolvedImg,
                              price: prod.priceNumber || prod.price || 15000,
                              category: 'Just For You',
                              recommendation: {
                                dimensions: '600 x 800 px (Rasio 3:4)',
                                aspectRatio: '3:4',
                                tips: 'Gunakan gambar vertikal 600 x 800 px (3:4) agar pas memenuhi kartu tanpa terpotong.'
                              }
                            });
                          } else {
                            handleProductOrAppClick({
                              id: prod.sku,
                              name: prod.name,
                              brand: prod.brand,
                              image: prod.image,
                              price: prod.priceNumber,
                              originalPrice: prod.originalPriceNumber,
                              discount: prod.discount,
                              category: 'Just For You'
                            });
                          }
                        }}
                      >
                        {isEditMode ? 'Edit Produk' : 'Pesan'}
                      </button>
                    </div>
                  );
                })}
                {/* Spacer trailing agar carousel Just For You di HP bisa di-slide sampai mentok dengan leluasa */}
                <div className="shrink-0 w-8 sm:w-16 h-1 pointer-events-none" aria-hidden="true" />
              </div>

              {/* Zalora Right Control Button (Desktop) */}
              <button
                type="button"
                onClick={() => {
                  if (justForYouListRef.current) {
                    justForYouListRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                  }
                }}
                className={`post-type__carousel-control-button post-type__carousel-right-button ${!jfyScrollState.canRight ? 'post-type__carousel-right-button--hide' : ''}`}
                aria-label="Scroll Just For You Right"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block h-6 w-6">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12.307 6.338c-.34.33-.34.865.003 1.194l3.979 3.821H4.667c-.368 0-.667.336-.667.75s.299.75.667.75h11.37l-3.73 3.618c-.34.33-.34.865.003 1.194a.898.898 0 001.237-.003l5.25-5.091a.824.824 0 00-.003-1.194l-5.25-5.042a.898.898 0 00-1.237.003z" fill="#262626" />
                </svg>
              </button>

              {/* Zalora Left Control Button (Desktop) */}
              <button
                type="button"
                onClick={() => {
                  if (justForYouListRef.current) {
                    justForYouListRef.current.scrollBy({ left: -320, behavior: 'smooth' });
                  }
                }}
                className={`post-type__carousel-control-button post-type__carousel-left-button ${!jfyScrollState.canLeft ? 'post-type__carousel-left-button--hide' : ''}`}
                aria-label="Scroll Just For You Left"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block h-6 w-6 rotate-180">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12.307 6.338c-.34.33-.34.865.003 1.194l3.979 3.821H4.667c-.368 0-.667.336-.667.75s.299.75.667.75h11.37l-3.73 3.618c-.34.33-.34.865.003 1.194a.898.898 0 001.237-.003l5.25-5.091a.824.824 0 00-.003-1.194l-5.25-5.042a.898.898 0 00-1.237.003z" fill="#262626" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
          13. CATEGORIES FOOTER PILLS & ACCORDION SEO TEXT
      ========================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 py-8 border-t border-zinc-200">
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
                onClick={() => setIsCategoriesOpen(true)}
                className="text-[11px] underline text-[#666] hover:text-black cursor-pointer font-medium"
              >
                Lihat Semua Brand &rarr;
              </button>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 leading-relaxed">
              {ZALORA_TOP_BRANDS.map((b, i) => {
                const bName = typeof b === 'string' ? b : b.name;
                const bHref = typeof b === 'string' ? `/store/app/${b.toLowerCase().replace(/\s+/g, '-')}` : b.href;
                return (
                  <span key={i} className="inline-flex items-center">
                    <Link 
                      href={bHref}
                      className="hover:text-black hover:underline cursor-pointer text-left"
                    >
                      {bName}
                    </Link>
                    {i < ZALORA_TOP_BRANDS.length - 1 && <span className="ml-3 text-zinc-300">|</span>}
                  </span>
                );
              })}
            </div>
          </div>


        </div>
      </section>

      {/* =========================================================
          15. FOOTER D STORE - Standar, Simpel & Elegan
      ========================================================= */}
      <footer className="mt-auto w-full border-t border-zinc-200 bg-white text-zinc-500 py-6 pb-20 sm:pb-6 text-xs">
        <div className="max-w-[1240px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-center sm:text-left">
            <span className="font-black text-sm tracking-[0.16em] uppercase text-zinc-950">
              D STORE
            </span>
            <span className="hidden sm:inline text-zinc-300">•</span>
            <span className="text-[11px] text-zinc-500">
              &copy; 2026 D STORE OFFICIAL. Seluruh Hak Cipta Dilindungi.
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-[11px] text-zinc-600">
            <a 
              href="https://wa.me/6281230112240" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-zinc-950 transition"
            >
              Bantuan CS
            </a>
            <span className="text-zinc-300">•</span>
            <a 
              href="https://t.me/dewipermata03" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-zinc-950 transition"
            >
              Telegram
            </a>
            <span className="text-zinc-300">•</span>
            <a 
              href="https://wa.me/6281230112240?text=Halo%20Admin%20D%20Store" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-zinc-950 transition"
            >
              Hubungi Kami
            </a>
          </div>
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
                    </div>
                  </div>

                  {/* Duration / Package Selector */}
                  <div className="mt-5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
                      PILIH PAKET / DURASI: <span className="text-[#666] font-normal">{selectedSize}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['1 Bulan (Private)', '3 Bulan (Private)', '6 Bulan', '1 Tahun', 'Lifetime / Edu'].map((sz) => (
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
                  <div className="mt-4 space-y-1.5 text-xs text-zinc-600 divide-y divide-zinc-100 border border-zinc-100 rounded-xl p-3 bg-zinc-50/60">
                    <div className="pt-1 first:pt-0">100% Legal dan berlisensi resmi siap pakai</div>
                    <div className="pt-1.5">Proses kilat 5 - 15 menit, ready stock</div>
                    <div className="pt-1.5">Mendukung multi-device: HP, Tablet, Laptop dan Web</div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="mt-5 space-y-2 pt-3 border-t border-zinc-100">
                  <a
                    href={getWhatsAppOrderUrl(`${activeProductModal.name} (Ukuran: ${selectedSize})`, activeProductModal.price)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-medium text-xs sm:text-sm text-center block transition cursor-pointer"
                  >
                    Pesan via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          POPUP MODAL VARIAN PAKET APLIKASI PREMIUM (SPOTIFY, NETFLIX, CHATGPT, DLL)
      ========================================================= */}
      {selectedAppModal && (
        <AppVariantModal
          appData={selectedAppModal}
          onClose={() => setSelectedAppModal(null)}
          onShowNotification={showNotification}
        />
      )}

      {/* Categories Modal Sheet */}
      <CategoriesModal
        isOpen={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
        activeCategory={activeSegment === "all" ? "ALL" : activeSegment}
        onSelectCategory={(cat) => {
          if (cat.href) {
            router.push(cat.href);
          }
        }}
      />

      {/* Visual Click-to-Edit Modal (Admin Live Editor) */}
      {visualEditingItem && (
        <VisualEditModal
          isOpen={!!visualEditingItem}
          elementData={visualEditingItem}
          onClose={() => setVisualEditingItem(null)}
          onSave={handleSaveVisualItem}
        />
      )}

      {/* =========================================================
          16. FLOATING PILL MOBILE BOTTOM NAVIGATION BAR
          (3 Menu: Home, Kategori, Produk)
      ========================================================= */}
      <div 
        id="mobile_bottom_nav" 
        className="fixed bottom-3 sm:bottom-4 inset-x-0 mx-auto z-50 w-[86%] max-w-[320px] md:hidden pointer-events-none"
        style={{ left: 0, right: 0, marginLeft: 'auto', marginRight: 'auto' }}
      >
        <div className="rounded-full iphone-glass-bottom-card px-2 py-1 pointer-events-auto overflow-hidden border border-zinc-200/80 bg-white/95 backdrop-blur-md">
          <div className="relative flex items-center justify-around px-0.5">
            {/* 1. Home */}
            <button 
              type="button"
              className="relative flex h-[44px] flex-1 flex-col items-center justify-center gap-y-0.5 cursor-pointer select-none rounded-full text-zinc-900 hover:text-black active:bg-zinc-200/60 active:scale-95 transition-all duration-100 outline-none" 
              onClick={() => {
                if (pathname === '/store' || pathname === '/store/dev') {
                  setActiveSegment('all');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  router.push('/store');
                }
              }}
            >
              <Home className="w-5 h-5 text-zinc-900" />
              <span className="text-[10px] leading-tight font-semibold text-zinc-900">Home</span>
            </button>

            {/* 2. Kategori */}
            <button 
              type="button"
              className="relative flex h-[44px] flex-1 flex-col items-center justify-center gap-y-0.5 cursor-pointer select-none rounded-full text-zinc-600 hover:text-black active:bg-zinc-200/60 active:scale-95 transition-all duration-100 outline-none" 
              onClick={() => setIsCategoriesOpen(true)}
            >
              <SlidersHorizontal className="w-5 h-5 text-zinc-600" />
              <span className="text-[10px] leading-tight font-medium text-zinc-600">Kategori</span>
            </button>

            {/* 3. Produk */}
            <Link
              href="/produk"
              prefetch={true}
              className="relative flex h-[44px] flex-1 flex-col items-center justify-center gap-y-0.5 cursor-pointer select-none rounded-full text-zinc-600 hover:text-black active:bg-zinc-200/60 active:scale-95 transition-all duration-100 outline-none" 
            >
              <Package className="w-5 h-5 text-zinc-600" />
              <span className="text-[10px] leading-tight font-medium text-zinc-600">Produk</span>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
