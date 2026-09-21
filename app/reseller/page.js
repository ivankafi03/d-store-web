'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Store,
  DollarSign,
  TrendingUp,
  Download,
  Copy,
  Share2,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MessageCircle,
  HelpCircle,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Sliders,
  Palette,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  CheckSquare,
  Square,
  Check,
  ListChecks,
  Circle,
  Monitor,
  Smartphone,
  Send,
  AlertCircle
} from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';

export default function ResellerStudioPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyReady, setOnlyReady] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Reseller Custom Branding
  const [storeName, setStoreName] = useState('DIGITAL STORE PRO');
  const [storeTagline, setStoreTagline] = useState('Pusat Akun Premium & Lisensi Digital Bergaransi');
  const [resellerWa, setResellerWa] = useState('081234567890');
  const [resellerTele, setResellerTele] = useState('@tokodigital');
  const [customNote, setCustomNote] = useState('Order Cepat & Garansi: WA 081234567890 / Telegram @tokodigital');

  // Reseller Markup Settings
  const [markupType, setMarkupType] = useState('flat'); // 'flat' or 'percent'
  const [markupValue, setMarkupValue] = useState(2000); // default +Rp 2.000 profit

  // Poster Design Settings
  const [posterTheme, setPosterTheme] = useState('yellow'); // 'yellow', 'white', 'dark', 'emerald', 'purple', 'cyan'
  const [posterColumns, setPosterColumns] = useState('3'); // '2', '3', '4', '5'
  const [posterShape, setPosterShape] = useState('badge'); // 'badge', 'circle'
  const [posterDensity, setPosterDensity] = useState('standard'); // 'standard', 'compact'
  const [posterPageSize, setPosterPageSize] = useState('24'); // number string or 'all'
  const [posterCurrentPage, setPosterCurrentPage] = useState(1);
  const [showPrice, setShowPrice] = useState(true);
  const [productFilter, setProductFilter] = useState('all');

  // Creative Editing Options
  const [cardCorner, setCardCorner] = useState('rounded'); // 'rounded', 'sharp'
  const [promoBadgeText, setPromoBadgeText] = useState('100% GARANSI RESMI');
  const [contactOption, setContactOption] = useState('all'); // 'all', 'wa', 'tele', 'none'
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [showStockDisclaimer, setShowStockDisclaimer] = useState(true);
  const [stockDisclaimerText, setStockDisclaimerText] = useState('*Status stok (ready/habis) dapat berubah sewaktu-waktu & bisa terjadi salah update. Harap konfirmasi ketersediaan saat order.');

  // Reseller Product Selection / Cherry-picking
  const [selectedProductIds, setSelectedProductIds] = useState(null); // null = all products in catalog
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('all');
  const [pickerStockFilter, setPickerStockFilter] = useState('all'); // 'all' or 'ready'

  // Processing & Toast state
  const [generatingPoster, setGeneratingPoster] = useState(false);
  const [toasts, setToasts] = useState([]);
  const posterRef = useRef(null);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Format IDR Rupiah
  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(Number(val) || 0);
  };

  // Clean variant name
  const getCleanVariantName = (variantName, productName) => {
    if (!variantName) return 'Standard';
    if (!productName) return variantName;
    const pLower = productName.toLowerCase().trim();
    let vClean = variantName.replace(new RegExp(`^${pLower}\\s*[-:]*\\s*`, 'i'), '').trim();
    if (vClean.length < 2) return variantName;
    return vClean;
  };

  // Fetch safe public products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/store/products');
      const data = await res.json();
      if (data.status === 'ok') {
        setProducts(data.products || []);
        setCategories(data.categories || []);
      } else {
        showToast('Gagal memuat katalog: ' + (data.message || 'Error server'), 'error');
      }
    } catch (err) {
      showToast('Koneksi terputus: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Update customNote when contact changes or contactOption changes
  useEffect(() => {
    const cleanTele = resellerTele.startsWith('@') ? resellerTele : `@${resellerTele}`;
    if (contactOption === 'all') {
      setCustomNote(`Order Cepat & Garansi: WA ${resellerWa} / Telegram ${cleanTele}`);
    } else if (contactOption === 'wa') {
      setCustomNote(`Order Cepat & Garansi: WhatsApp ${resellerWa}`);
    } else if (contactOption === 'tele') {
      setCustomNote(`Order Cepat & Garansi: Telegram ${cleanTele}`);
    } else {
      setCustomNote('Garansi Resmi • Akun Legal & Pelayanan Cepat');
    }
  }, [resellerWa, resellerTele, contactOption]);

  // Calculate marked-up selling price
  const calculateSellingPrice = (basePrice) => {
    const base = Number(basePrice) || 0;
    if (markupType === 'percent') {
      return Math.round(base * (1 + Number(markupValue || 0) / 100));
    }
    return base + Number(markupValue || 0);
  };

  // Calculate profit
  const calculateProfit = (basePrice) => {
    return calculateSellingPrice(basePrice) - (Number(basePrice) || 0);
  };

  // Product Selection Handlers
  const isProductSelected = (productId) => {
    if (selectedProductIds === null) return true;
    return selectedProductIds.includes(productId);
  };

  const handleToggleProduct = (productId) => {
    if (selectedProductIds === null) {
      setSelectedProductIds(products.map((p) => p.id).filter((id) => id !== productId));
    } else {
      if (selectedProductIds.includes(productId)) {
        setSelectedProductIds(selectedProductIds.filter((id) => id !== productId));
      } else {
        setSelectedProductIds([...selectedProductIds, productId]);
      }
    }
  };

  const handleSelectAllProducts = () => {
    setSelectedProductIds(null);
    showToast('Semua produk dipilih untuk jualan.', 'info');
  };

  const handleDeselectAllProducts = () => {
    setSelectedProductIds([]);
    showToast('Semua produk dikosongkan dari pilihan.', 'info');
  };

  const handleSelectReadyOnly = () => {
    const readyIds = products
      .filter((p) => (p.variants || []).some((v) => v.isAvailable !== false))
      .map((p) => p.id);
    setSelectedProductIds(readyIds);
    showToast(`Dipilih ${readyIds.length} produk dengan stok ready.`, 'info');
  };

  const isAllProductsSelected = selectedProductIds === null || selectedProductIds.length === products.length;
  const currentSelectedCount = selectedProductIds === null ? products.length : selectedProductIds.length;

  // Filtered products inside the picker modal
  const pickerProducts = useMemo(() => {
    let list = [...products];

    if (pickerCategory !== 'all') {
      list = list.filter((p) => p.categoryId === pickerCategory);
    }

    if (pickerStockFilter === 'ready') {
      list = list.filter((p) => (p.variants || []).some((v) => v.isAvailable !== false));
    }

    if (pickerSearch.trim()) {
      const q = pickerSearch.toLowerCase().trim();
      list = list.filter((p) => {
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchVar = (p.variants || []).some((v) => (v.name || '').toLowerCase().includes(q));
        return matchName || matchVar;
      });
    }

    return list;
  }, [products, pickerCategory, pickerStockFilter, pickerSearch]);

  // Filtered products for poster
  const filteredPosterProducts = useMemo(() => {
    let list = [...products];

    // Filter by Reseller Selected Products
    if (Array.isArray(selectedProductIds)) {
      list = list.filter((p) => selectedProductIds.includes(p.id));
    }

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.categoryId === selectedCategory);
    }

    if (productFilter !== 'all') {
      list = list.filter((p) => p.id === productFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchVar = (p.variants || []).some((v) => (v.name || '').toLowerCase().includes(q));
        return matchName || matchVar;
      });
    }

    return list
      .map((p) => {
        let vars = p.variants || [];
        if (onlyReady) {
          vars = vars.filter((v) => v.isAvailable !== false);
        }
        return { ...p, filteredVariants: vars };
      })
      .filter((p) => p.filteredVariants.length > 0);
  }, [products, selectedProductIds, selectedCategory, productFilter, searchQuery, onlyReady]);

  const totalPosterPages = useMemo(() => {
    if (posterPageSize === 'all') return 1;
    const size = Number(posterPageSize) || 24;
    return Math.max(1, Math.ceil(filteredPosterProducts.length / size));
  }, [filteredPosterProducts, posterPageSize]);

  useEffect(() => {
    if (posterCurrentPage > totalPosterPages) {
      setPosterCurrentPage(1);
    }
  }, [totalPosterPages, posterCurrentPage]);

  // Displayed products on the current poster page
  const displayedPosterProducts = useMemo(() => {
    if (posterPageSize === 'all') return filteredPosterProducts;
    const size = Number(posterPageSize) || 24;
    const start = (posterCurrentPage - 1) * size;
    return filteredPosterProducts.slice(start, start + size);
  }, [filteredPosterProducts, posterPageSize, posterCurrentPage]);

  // Overall catalog summary for reseller
  const resellerSummary = useMemo(() => {
    const targetProducts = Array.isArray(selectedProductIds)
      ? products.filter((p) => selectedProductIds.includes(p.id))
      : products;

    let totalProducts = targetProducts.length;
    let totalVariants = 0;
    let sampleProfitTotal = 0;

    for (const p of targetProducts) {
      for (const v of p.variants || []) {
        totalVariants += 1;
        sampleProfitTotal += calculateProfit(v.price);
      }
    }

    const avgProfit = totalVariants > 0 ? Math.round(sampleProfitTotal / totalVariants) : 0;
    return {
      totalProducts,
      totalVariants,
      avgProfit,
      isFiltered: Array.isArray(selectedProductIds) && selectedProductIds.length < products.length
    };
  }, [products, selectedProductIds, markupType, markupValue]);

  // Theme Styling Definition
  const themeClasses = {
    yellow: {
      id: 'yellow',
      name: 'Kuning',
      desc: 'Cyber Yellow',
      bg: 'bg-[#FFE600]',
      headerBg: 'bg-white text-black',
      taglineColor: 'text-zinc-800',
      badgeBg: 'bg-black text-[#FFE600]',
      footerBg: 'bg-white text-black',
      border: 'border-black'
    },
    white: {
      id: 'white',
      name: 'Putih',
      desc: 'Clean Brutal',
      bg: 'bg-[#F4F4F5]',
      headerBg: 'bg-white text-black',
      taglineColor: 'text-zinc-700',
      badgeBg: 'bg-black text-white',
      footerBg: 'bg-white text-black',
      border: 'border-black'
    },
    dark: {
      id: 'dark',
      name: 'Dark',
      desc: 'Dark Cyber',
      bg: 'bg-zinc-950',
      headerBg: 'bg-zinc-900 text-white',
      taglineColor: 'text-zinc-300',
      badgeBg: 'bg-yellow-400 text-black',
      footerBg: 'bg-zinc-900 text-white',
      border: 'border-zinc-700'
    },
    emerald: {
      id: 'emerald',
      name: 'Mint',
      desc: 'Mint Emerald',
      bg: 'bg-[#6EE7B7]',
      headerBg: 'bg-white text-black',
      taglineColor: 'text-zinc-800',
      badgeBg: 'bg-emerald-900 text-emerald-300',
      footerBg: 'bg-white text-black',
      border: 'border-black'
    },
    purple: {
      id: 'purple',
      name: 'Ungu',
      desc: 'Neon Violet',
      bg: 'bg-[#C4B5FD]',
      headerBg: 'bg-white text-black',
      taglineColor: 'text-zinc-800',
      badgeBg: 'bg-purple-900 text-white',
      footerBg: 'bg-white text-black',
      border: 'border-black'
    },
    cyan: {
      id: 'cyan',
      name: 'Sky',
      desc: 'Ocean Blue',
      bg: 'bg-[#7DD3FC]',
      headerBg: 'bg-white text-black',
      taglineColor: 'text-zinc-800',
      badgeBg: 'bg-cyan-950 text-cyan-200',
      footerBg: 'bg-white text-black',
      border: 'border-black'
    }
  };

  const currentTheme = themeClasses[posterTheme] || themeClasses.yellow;

  // Grid columns class
  const getGridColsClass = () => {
    if (posterColumns === '2') return 'grid-cols-1 sm:grid-cols-2';
    if (posterColumns === '4') return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    if (posterColumns === '5') return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
  };

  // Download Poster
  const handleDownloadPoster = async (format = 'png') => {
    if (!posterRef.current) return;
    setGeneratingPoster(true);
    try {
      const options = {
        quality: 0.98,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: posterTheme === 'dark' ? '#09090b' : posterTheme === 'white' ? '#f4f4f5' : '#ffffff'
      };

      const dataUrl = format === 'png' ? await toPng(posterRef.current, options) : await toJpeg(posterRef.current, options);

      const link = document.createElement('a');
      const cleanName = storeName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      link.download = `poster_promo_${cleanName}_${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();
      showToast(`Poster promosi ${format.toUpperCase()} berhasil diunduh!`, 'success');
    } catch (err) {
      showToast('Gagal memproses gambar: ' + err.message, 'error');
    } finally {
      setGeneratingPoster(false);
    }
  };

  // Copy Poster to Clipboard
  const handleCopyPosterImage = async () => {
    if (!posterRef.current) return;
    setGeneratingPoster(true);
    try {
      const blob = await new Promise(async (resolve, reject) => {
        try {
          const dataUrl = await toPng(posterRef.current, {
            quality: 0.98,
            pixelRatio: 2,
            cacheBust: true
          });
          const res = await fetch(dataUrl);
          const b = await res.blob();
          resolve(b);
        } catch (err) {
          reject(err);
        }
      });

      if (typeof window !== 'undefined' && window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('Gambar poster disalin! Tempel langsung dengan Ctrl+V di WhatsApp / Telegram.', 'success');
      } else {
        showToast('Browser ini tidak mendukung salin langsung, silakan klik tombol Unduh PNG.', 'warning');
      }
    } catch (err) {
      showToast('Gagal menyalin gambar: ' + err.message, 'error');
    } finally {
      setGeneratingPoster(false);
    }
  };

  // Copy Broadcast WhatsApp text
  const handleCopyBroadcastText = () => {
    let txt = `*${storeName.toUpperCase()}*\n`;
    txt += `${storeTagline}\n\n`;
    txt += `Pricelist Update & Status Stok:\n\n`;

    for (const p of displayedPosterProducts) {
      txt += `*${p.name.toUpperCase()}*\n`;
      for (const v of p.filteredVariants) {
        const finalP = calculateSellingPrice(v.price);
        const status = v.isAvailable !== false ? 'Ready' : 'Habis';
        txt += `- ${getCleanVariantName(v.name, p.name)} : ${formatRupiah(finalP)} [${status}]\n`;
      }
      txt += `\n`;
    }

    if (showStockDisclaimer && stockDisclaimerText) {
      txt += `${stockDisclaimerText}\n\n`;
    }
    txt += `${customNote}\n`;
    txt += `Garansi Full • Akun Resmi • Pelayanan Cepat\n`;

    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(txt);
      showToast('Format teks WhatsApp berhasil disalin ke clipboard!', 'success');
    }
  };

  // Order to D Store (Supplier) via WhatsApp
  const handleOrderToSupplier = (prodName, varName, basePrice) => {
    const adminPhone = '6281230112240';
    const text = `Halo Admin D Store, saya reseller mau order:\n\n` +
      `Toko Saya: ${storeName}\n` +
      `Produk: ${prodName}\n` +
      `Varian: ${varName}\n` +
      `Harga Modal D Store: ${formatRupiah(basePrice)}\n\n` +
      `Mohon info rekening pembayaran dan akunnya ya. Terima kasih!`;
    const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF0] text-black font-sans pb-20 selection:bg-[#FFE600] selection:text-black">
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-xl border-3 border-black shadow-[4px_4px_0_#000] text-xs font-black flex items-start gap-2.5 transition-all transform duration-200 ${
              t.type === 'success'
                ? 'bg-emerald-300 text-black'
                : t.type === 'error'
                ? 'bg-rose-300 text-black'
                : t.type === 'warning'
                ? 'bg-amber-300 text-black'
                : 'bg-[#FFE600] text-black'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {t.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : t.type === 'error' ? (
                <XCircle className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 leading-snug break-words">{t.message}</div>
          </div>
        ))}
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#FFE600] border-b-4 border-black px-3 sm:px-8 py-3 sm:py-4 shadow-[0_4px_0_#000]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-black text-yellow-300 border-2 border-black rounded-xl flex items-center justify-center font-black shadow-[2px_2px_0_#000] shrink-0">
              <Store className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-2xl font-black uppercase tracking-tight truncate">
                  Studio Reseller D Store
                </h1>
                <span className="bg-black text-[#FFE600] text-[8px] sm:text-[10px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded border border-black shadow-[1px_1px_0_#000] shrink-0">
                  Dropship
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-black/80 truncate hidden sm:block">
                Atur margin profitmu sendiri, buat poster tokomu, dan jualan tanpa modal stok!
              </p>
            </div>
          </div>

          {/* Desktop Navigation Buttons */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <a
              href="https://t.me/dstore00000"
              target="_blank"
              rel="noopener noreferrer"
              className="neo-btn px-3 py-2 rounded-xl bg-cyan-300 hover:bg-cyan-200 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider flex items-center gap-1.5"
              title="Gabung Grup Telegram Resmi D Store"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Grup Tele</span>
            </a>
            <Link
              href="/store"
              className="neo-btn px-3 py-2 rounded-xl bg-white hover:bg-yellow-100 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Lihat Toko Retail</span>
            </Link>
            <button
              type="button"
              onClick={fetchProducts}
              disabled={loading}
              className="neo-btn px-3 py-2 rounded-xl bg-cyan-200 hover:bg-cyan-100 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sinkron Stok</span>
            </button>
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
          <div className="sm:hidden mt-3 pt-3 border-t-2 border-black space-y-2 animate-in slide-in-from-top-2 duration-150">
            <div className="text-[10px] font-black uppercase tracking-wider text-black px-1">
              Menu Navigasi Reseller
            </div>
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
              href="/store"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full neo-btn px-3 py-2.5 rounded-xl bg-white hover:bg-yellow-100 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                <span>Lihat Toko Retail</span>
              </span>
              <span className="text-[9px] font-bold text-zinc-500">/store</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                fetchProducts();
                setMobileMenuOpen(false);
              }}
              disabled={loading}
              className="w-full neo-btn px-3 py-2.5 rounded-xl bg-cyan-200 hover:bg-cyan-100 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider flex items-center justify-between disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Segarkan Stok</span>
              </span>
              <span className="text-[10px] font-bold bg-white px-1.5 py-0.2 rounded border border-black">{products.length} Produk</span>
            </button>

            <a
              href="https://wa.me/6281230112240?text=Halo%20Admin%20D%20Store,%20saya%20reseller%20mau%20tanya"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full neo-btn px-3 py-2.5 rounded-xl bg-emerald-300 hover:bg-emerald-200 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>Chat Admin D Store</span>
              </span>
              <span className="text-[9px] font-bold text-emerald-950">WA</span>
            </a>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* Desktop Mode Recommendation Banner for Mobile (Visible ONLY on mobile/tablet, hidden on desktop: block lg:hidden) */}
        <div className="block lg:hidden p-4 sm:p-5 rounded-2xl bg-[#FFE600] border-3 border-black shadow-[5px_5px_0_#000] space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-black text-[#FFE600] rounded-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#000] shrink-0">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <span className="inline-block bg-black text-[#FFE600] text-[9px] font-black uppercase px-2 py-0.5 rounded border border-black mb-0.5 shadow-[1px_1px_0_#000]">
                  PENTING UNTUK PENGGUNA HP
                </span>
                <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-black">
                  Disarankan Gunakan Mode Situs Desktop
                </h3>
              </div>
            </div>
          </div>

          <p className="text-xs font-bold text-black leading-relaxed">
            Untuk mengedit poster, mengatur kolom produk (2-5 kolom), dan melihat pratinjau gambar secara maksimal, sangat disarankan mengaktifkan fitur <strong>Situs Desktop</strong> pada browser HP kamu atau mengeditnya melalui Laptop / Komputer.
          </p>

          <div className="p-3 bg-white rounded-xl border-2 border-black text-xs space-y-1.5 shadow-[2px_2px_0_#000]">
            <div className="font-black text-black uppercase text-[11px] flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Cara Cepat Aktifkan di HP:</span>
            </div>
            <ol className="list-decimal list-inside font-bold text-zinc-800 space-y-1 text-[11px]">
              <li>Tekan tombol menu titik tiga (<strong>⋮</strong>) di Google Chrome atau ikon (<strong>aA</strong>) di Safari.</li>
              <li>Centang opsi <strong>"Situs Desktop"</strong> (Desktop Site).</li>
              <li>Halaman editor akan langsung melebar penuh dan semua tombol kontrol lebih mudah diakses.</li>
            </ol>
          </div>
        </div>

        {/* Dropship Mechanism Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border-3 border-black shadow-[5px_5px_0_#000]">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-black" />
            <h2 className="text-sm sm:text-base font-black uppercase tracking-tight">
              Cara Kerja Reseller & Dropshipper:
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-yellow-50 border-2 border-black">
              <div className="font-black text-black mb-1">1. Pasang Keuntungan</div>
              <div className="font-bold text-zinc-700">
                Pilih markup harga (misal +Rp 2.000 atau +20%). Harga jual tokomu otomatis terhitung.
              </div>
            </div>
            <div className="p-3 rounded-xl bg-cyan-50 border-2 border-black">
              <div className="font-black text-black mb-1">2. Pasang Nama Tokomu</div>
              <div className="font-bold text-zinc-700">
                Tulis nama toko, kontak WhatsApp, dan Telegram kamu di pengaturan identitas.
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border-2 border-black">
              <div className="font-black text-black mb-1">3. Bagikan Poster & Chat</div>
              <div className="font-bold text-zinc-700">
                Unduh poster beresolusi HD atau salin format teks WhatsApp untuk promosi ke kontak pembeli.
              </div>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 border-2 border-black">
              <div className="font-black text-black mb-1">4. Ambil Cuan Langsung</div>
              <div className="font-bold text-zinc-700">
                Saat ada pembeli, terima uang mereka dengan harga markup, lalu order ke D Store seharga modal.
              </div>
            </div>
          </div>
        </div>

        {/* Reseller Setup Dashboard (Branding & Markup Controls) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (Left) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Atur Identitas Toko Reseller */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border-3 border-black shadow-[5px_5px_0_#000] space-y-3.5">
              <div className="flex items-center gap-2 border-b-2 border-black pb-2.5">
                <Sliders className="w-4 h-4" />
                <h3 className="text-sm font-black uppercase tracking-tight">
                  Identitas Brand Tokomu
                </h3>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1">
                  Nama Toko Kamu
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Contoh: RIZKY DIGITAL STORE"
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFDF0] border-2 border-black shadow-[2px_2px_0_#000] text-xs font-black uppercase text-black outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1">
                  Tagline / Keterangan Toko
                </label>
                <input
                  type="text"
                  value={storeTagline}
                  onChange={(e) => setStoreTagline(e.target.value)}
                  placeholder="Pusat Akun Premium & Legalitas 100% Bergaransi"
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFDF0] border-2 border-black shadow-[2px_2px_0_#000] text-xs font-bold text-black outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1">
                    Nomor WhatsApp Kamu
                  </label>
                  <input
                    type="text"
                    value={resellerWa}
                    onChange={(e) => setResellerWa(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFDF0] border-2 border-black shadow-[2px_2px_0_#000] text-xs font-mono font-bold text-black outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1">
                    Username Telegram Kamu
                  </label>
                  <input
                    type="text"
                    value={resellerTele}
                    onChange={(e) => setResellerTele(e.target.value)}
                    placeholder="@tokosaya"
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFDF0] border-2 border-black shadow-[2px_2px_0_#000] text-xs font-mono font-bold text-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1">
                  Teks Footer / Catatan Garansi
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFDF0] border-2 border-black shadow-[2px_2px_0_#000] text-xs font-bold text-black outline-none"
                />
              </div>
            </div>

            {/* 2. Atur Markup Harga & Profit */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border-3 border-black shadow-[5px_5px_0_#000] space-y-3.5">
              <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-sm font-black uppercase tracking-tight">
                    Pengaturan Markup Keuntungan
                  </h3>
                </div>
                <span className="bg-emerald-300 text-black text-[10px] font-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0_#000]">
                  {markupValue > 0
                    ? markupType === 'flat'
                      ? `+${formatRupiah(markupValue)} / item`
                      : `+${markupValue}% / item`
                    : 'Harga Normal'}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-2">
                  Pilihan Cepat Markup Keuntungan
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMarkupType('flat');
                      setMarkupValue(0);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0_#000] transition ${
                      markupValue === 0
                        ? 'bg-black text-yellow-300'
                        : 'bg-white text-black hover:bg-yellow-100'
                    }`}
                  >
                    Modal (+0)
                  </button>
                  {[1000, 2000, 3000, 5000, 10000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setMarkupType('flat');
                        setMarkupValue(val);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0_#000] transition ${
                        markupType === 'flat' && markupValue === val
                          ? 'bg-[#FFE600] text-black font-black'
                          : 'bg-white text-black hover:bg-yellow-100'
                      }`}
                    >
                      +{val >= 1000 ? `${val / 1000}rb` : val}
                    </button>
                  ))}
                  {[10, 20, 30, 50].map((pct) => (
                    <button
                      key={`pct_${pct}`}
                      type="button"
                      onClick={() => {
                        setMarkupType('percent');
                        setMarkupValue(pct);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0_#000] transition ${
                        markupType === 'percent' && markupValue === pct
                          ? 'bg-emerald-300 text-black font-black'
                          : 'bg-white text-black hover:bg-emerald-100'
                      }`}
                    >
                      +{pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1">
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1">
                    Input Nominal Manual
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 2500"
                    value={markupValue === 0 ? '' : markupValue}
                    onChange={(e) => setMarkupValue(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFDF0] border-2 border-black shadow-[2px_2px_0_#000] text-xs font-mono font-bold text-black outline-none"
                  />
                </div>
                <div className="w-28">
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1">
                    Satuan
                  </label>
                  <select
                    value={markupType}
                    onChange={(e) => setMarkupType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFDF0] border-2 border-black shadow-[2px_2px_0_#000] text-xs font-black text-black outline-none cursor-pointer"
                  >
                    <option value="flat">Rupiah (Rp)</option>
                    <option value="percent">Persen (%)</option>
                  </select>
                </div>
              </div>

              {/* Profit Estimation Card */}
              <div className="p-3 rounded-xl bg-emerald-50 border-2 border-black flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase text-emerald-900 tracking-wider">
                    Rata-Rata Profit Bersihmu
                  </div>
                  <div className="text-base font-black text-emerald-800">
                    +{formatRupiah(resellerSummary.avgProfit)} / transaksi
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase text-zinc-600 tracking-wider">
                    Katalog Tersedia
                  </div>
                  <div className="text-xs font-black text-black">
                    {resellerSummary.totalVariants} Varian ({resellerSummary.totalProducts} Produk)
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Kurasi & Pilih Produk Yang Ingin Dijual */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border-3 border-black shadow-[5px_5px_0_#000] space-y-3.5">
              <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-black" />
                  <h3 className="text-sm font-black uppercase tracking-tight">
                    Pilih Produk Yang Ingin Dijual
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0_#000] ${
                    isAllProductsSelected ? 'bg-emerald-300 text-black' : 'bg-[#FFE600] text-black'
                  }`}
                >
                  {isAllProductsSelected ? 'Semua Dipilih' : `${currentSelectedCount} Terpilih`}
                </span>
              </div>

              <p className="text-xs font-bold text-zinc-700 leading-snug">
                Pilih produk tertentu yang ingin kamu jual. Poster promosi, tabel estimasi cuan, dan pesan WhatsApp otomatis menyesuaikan produk pilihanmu.
              </p>

              {/* Main Picker Trigger Button */}
              <button
                type="button"
                onClick={() => setShowProductPicker(true)}
                className="w-full neo-btn py-2.5 px-3 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-black font-black text-xs border-2 border-black shadow-[3px_3px_0_#000] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition active:translate-x-0.5 active:translate-y-0.5"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Buka Checklist Produk ({currentSelectedCount} / {products.length})</span>
              </button>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleSelectAllProducts}
                  className={`px-2.5 py-1 rounded-lg border border-black text-[11px] font-black uppercase transition cursor-pointer ${
                    isAllProductsSelected ? 'bg-black text-[#FFE600]' : 'bg-white hover:bg-yellow-100 text-black'
                  }`}
                >
                  Pilih Semua ({products.length})
                </button>
                <button
                  type="button"
                  onClick={handleSelectReadyOnly}
                  className="px-2.5 py-1 rounded-lg border border-black bg-emerald-100 hover:bg-emerald-200 text-emerald-950 text-[11px] font-black uppercase transition cursor-pointer"
                >
                  Hanya Ready Stok
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllProducts}
                  className="px-2.5 py-1 rounded-lg border border-black bg-rose-100 hover:bg-rose-200 text-rose-950 text-[11px] font-black uppercase transition cursor-pointer"
                >
                  Kosongkan
                </button>
              </div>

              {/* Selected Chips Preview (if custom filtered and has items) */}
              {!isAllProductsSelected && currentSelectedCount > 0 && (
                <div className="pt-2 border-t border-black/10">
                  <div className="text-[10px] font-black uppercase text-zinc-600 mb-1.5 flex items-center justify-between">
                    <span>Produk Pilihanmu ({currentSelectedCount}):</span>
                    <button
                      type="button"
                      onClick={handleSelectAllProducts}
                      className="text-[10px] text-blue-700 hover:underline font-bold"
                    >
                      Reset (Pilih Semua)
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                    {products
                      .filter((p) => isProductSelected(p.id))
                      .map((p) => (
                        <span
                          key={`chip_${p.id}`}
                          className="inline-flex items-center gap-1 bg-[#FFFDF0] px-2 py-0.5 rounded-md border border-black text-[10px] font-black text-black shadow-[1px_1px_0_#000]"
                        >
                          <span className="truncate max-w-[130px]">{p.name}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleProduct(p.id)}
                            className="text-zinc-500 hover:text-red-600 font-black ml-0.5"
                            title="Hapus dari daftar"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {currentSelectedCount === 0 && (
                <div className="p-2.5 rounded-xl bg-rose-50 border-2 border-dashed border-rose-400 text-rose-900 text-xs font-bold text-center">
                  Belum ada produk yang dipilih. Silakan klik tombol di atas untuk memilih produk yang ingin kamu jual.
                </div>
              )}
            </div>

            {/* 4. Desain Poster & Filter */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border-3 border-black shadow-[5px_5px_0_#000] space-y-3.5">
              <div className="flex items-center gap-2 border-b-2 border-black pb-2.5">
                <Palette className="w-4 h-4" />
                <h3 className="text-sm font-black uppercase tracking-tight">
                  Kustomisasi Tampilan Poster
                </h3>
              </div>

              {/* Panjang Poster (Bebas Atur Jumlah Produk) */}
              <div className="bg-yellow-100/70 p-3 rounded-xl border-2 border-black shadow-[2px_2px_0_#000] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] font-black uppercase text-zinc-900 tracking-wider">
                    Panjang Poster (Bebas Atur Jumlah Produk)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max={filteredPosterProducts.length || 200}
                      value={posterPageSize === 'all' ? filteredPosterProducts.length : posterPageSize}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        setPosterPageSize(String(val));
                        setPosterCurrentPage(1);
                      }}
                      className="w-16 px-2 py-0.5 rounded-lg bg-white border-2 border-black text-center font-mono font-black text-xs text-black shadow-[1.5px_1.5px_0_#000]"
                    />
                    <span className="text-[10px] font-black uppercase text-zinc-600">
                      / {filteredPosterProducts.length} Produk
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="4"
                    max={Math.max(4, filteredPosterProducts.length || 100)}
                    step="1"
                    value={posterPageSize === 'all' ? filteredPosterProducts.length : Number(posterPageSize) || 24}
                    onChange={(e) => {
                      setPosterPageSize(e.target.value);
                      setPosterCurrentPage(1);
                    }}
                    className="flex-1 accent-black cursor-pointer h-2 bg-white rounded-lg border border-black"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPosterPageSize('all');
                      setPosterCurrentPage(1);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border-2 border-black shadow-[1.5px_1.5px_0_#000] cursor-pointer transition ${
                      posterPageSize === 'all'
                        ? 'bg-black text-[#FFE600]'
                        : 'bg-white hover:bg-yellow-200 text-black'
                    }`}
                  >
                    Muat Semua (1 Lembar)
                  </button>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap text-[10px] pt-1">
                  <span className="font-black text-zinc-600 uppercase text-[9px]">Pilihan Cepat:</span>
                  {[8, 12, 18, 24, 32, 48].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setPosterPageSize(String(num));
                        setPosterCurrentPage(1);
                      }}
                      className={`px-2 py-0.5 rounded-md border border-black font-black uppercase transition cursor-pointer ${
                        posterPageSize === String(num)
                          ? 'bg-black text-[#FFE600]'
                          : 'bg-white hover:bg-yellow-100 text-black'
                      }`}
                    >
                      {num} Produk
                    </button>
                  ))}
                </div>
              </div>

              {/* Tema Latar Poster */}
              <div>
                <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1.5">
                  Tema Latar Poster
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.values(themeClasses).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setPosterTheme(t.id)}
                      className={`p-1.5 rounded-xl border-2 border-black flex items-center gap-1.5 text-xs font-black uppercase transition cursor-pointer ${
                        posterTheme === t.id
                          ? 'bg-black text-[#FFE600] shadow-[2px_2px_0_#000]'
                          : 'bg-white hover:bg-zinc-50 text-black'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full border border-black shrink-0 ${t.bg}`}></span>
                      <span className="truncate text-[10px] font-black">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bentuk Indikator Stok & Tampilkan Harga */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1">
                    Bentuk Indikator
                  </label>
                  <div className="flex rounded-xl border-2 border-black overflow-hidden shadow-[2px_2px_0_#000]">
                    <button
                      type="button"
                      onClick={() => setPosterShape('badge')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition flex items-center justify-center gap-1 cursor-pointer ${
                        posterShape === 'badge'
                          ? 'bg-black text-yellow-300'
                          : 'bg-white text-black hover:bg-yellow-50'
                      }`}
                    >
                      <Square className="w-3 h-3" />
                      <span>Kotak</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosterShape('circle')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition border-l-2 border-black flex items-center justify-center gap-1 cursor-pointer ${
                        posterShape === 'circle'
                          ? 'bg-black text-yellow-300'
                          : 'bg-white text-black hover:bg-yellow-50'
                      }`}
                    >
                      <Circle className="w-3 h-3" />
                      <span>Lingkaran</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1">
                    Tampilkan Harga
                  </label>
                  <div className="flex rounded-xl border-2 border-black overflow-hidden shadow-[2px_2px_0_#000]">
                    <button
                      type="button"
                      onClick={() => setShowPrice(true)}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition cursor-pointer ${
                        showPrice
                          ? 'bg-[#FFE600] text-black font-black'
                          : 'bg-white text-zinc-700 hover:bg-yellow-50'
                      }`}
                    >
                      Sertakan
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPrice(false)}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition border-l-2 border-black cursor-pointer ${
                        !showPrice
                          ? 'bg-[#FFE600] text-black font-black'
                          : 'bg-white text-zinc-700 hover:bg-yellow-50'
                      }`}
                    >
                      Tanpa Harga
                    </button>
                  </div>
                </div>
              </div>

              {/* Kerapatan Kartu & Gaya Sudut Kartu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1">
                    Kerapatan Kartu
                  </label>
                  <div className="flex rounded-xl border-2 border-black overflow-hidden shadow-[2px_2px_0_#000]">
                    <button
                      type="button"
                      onClick={() => setPosterDensity('standard')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition cursor-pointer ${
                        posterDensity === 'standard' ? 'bg-[#FFE600] text-black font-black' : 'bg-white text-zinc-700 hover:bg-yellow-50'
                      }`}
                    >
                      Standar
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosterDensity('compact')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition border-l-2 border-black cursor-pointer ${
                        posterDensity === 'compact' ? 'bg-[#FFE600] text-black font-black' : 'bg-white text-zinc-700 hover:bg-yellow-50'
                      }`}
                    >
                      Kompak
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1">
                    Gaya Sudut Kartu
                  </label>
                  <div className="flex rounded-xl border-2 border-black overflow-hidden shadow-[2px_2px_0_#000]">
                    <button
                      type="button"
                      onClick={() => setCardCorner('rounded')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition cursor-pointer ${
                        cardCorner === 'rounded' ? 'bg-[#FFE600] text-black font-black' : 'bg-white text-zinc-700 hover:bg-yellow-50'
                      }`}
                    >
                      Melengkung
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardCorner('sharp')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition border-l-2 border-black cursor-pointer ${
                        cardCorner === 'sharp' ? 'bg-[#FFE600] text-black font-black' : 'bg-white text-zinc-700 hover:bg-yellow-50'
                      }`}
                    >
                      Kotak Tajam
                    </button>
                  </div>
                </div>
              </div>

              {/* Jumlah Kolom & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1">
                    Jumlah Kolom
                  </label>
                  <select
                    value={posterColumns}
                    onChange={(e) => setPosterColumns(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FFFDF0] border-2 border-black shadow-[2px_2px_0_#000] text-xs font-bold text-black outline-none cursor-pointer"
                  >
                    <option value="2">2 Kolom</option>
                    <option value="3">3 Kolom</option>
                    <option value="4">4 Kolom</option>
                    <option value="5">5 Kolom</option>
                  </select>
                  <span className="block lg:hidden text-[9px] font-bold text-zinc-600 mt-1 leading-tight">
                    Catatan: Di HP, aktifkan "Situs Desktop" browser agar susunan kolom lebar terlihat seperti di komputer.
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1">
                    Filter Kategori
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setProductFilter('all');
                      setPosterCurrentPage(1);
                    }}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FFFDF0] border-2 border-black shadow-[2px_2px_0_#000] text-xs font-bold text-black outline-none cursor-pointer"
                  >
                    <option value="all">Semua Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pilihan Kontak Poster */}
              <div>
                <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1">
                  Pilihan Kontak Poster
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'all', label: 'WA + Tele' },
                    { id: 'wa', label: 'WA Saja' },
                    { id: 'tele', label: 'Tele Saja' },
                    { id: 'none', label: 'Tanpa Kontak' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setContactOption(opt.id)}
                      className={`py-1.5 px-2 rounded-xl border-2 border-black text-[11px] font-black uppercase transition cursor-pointer text-center ${
                        contactOption === opt.id
                          ? 'bg-black text-[#FFE600] shadow-[2px_2px_0_#000]'
                          : 'bg-white hover:bg-yellow-50 text-zinc-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pita Banner Garansi / Promo Header */}
              <div>
                <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1">
                  Teks Banner Promo / Garansi
                </label>
                <input
                  type="text"
                  value={promoBadgeText}
                  onChange={(e) => setPromoBadgeText(e.target.value)}
                  placeholder="100% GARANSI RESMI"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#FFFDF0] border-2 border-black shadow-[2px_2px_0_#000] text-xs font-black uppercase text-black outline-none mb-1.5"
                />
                <div className="flex flex-wrap gap-1">
                  {[
                    '100% GARANSI RESMI',
                    'FAST RESPON 24 JAM',
                    'PROMO FLASH SALE',
                    'AKUN LEGAL 100%'
                  ].map((badge) => (
                    <button
                      key={badge}
                      type="button"
                      onClick={() => setPromoBadgeText(badge)}
                      className={`px-2 py-0.5 rounded-md border border-black text-[9px] font-black uppercase transition cursor-pointer ${
                        promoBadgeText === badge
                          ? 'bg-black text-yellow-300'
                          : 'bg-white hover:bg-yellow-100 text-zinc-700'
                      }`}
                    >
                      {badge}
                    </button>
                  ))}
                </div>
              </div>

              {/* Watermark & Stok Ready Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t-2 border-black/10">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-black uppercase">
                  <input
                    type="checkbox"
                    checked={watermarkEnabled}
                    onChange={(e) => setWatermarkEnabled(e.target.checked)}
                    className="w-4 h-4 accent-black rounded"
                  />
                  <span>Watermark Toko</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-black uppercase">
                  <input
                    type="checkbox"
                    checked={onlyReady}
                    onChange={(e) => setOnlyReady(e.target.checked)}
                    className="w-4 h-4 accent-black rounded"
                  />
                  <span>Hanya Stok Ready</span>
                </label>
              </div>

              {/* Catatan / Keterangan Disclaimer Stok */}
              <div className="pt-2 border-t-2 border-black/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                    <span>Keterangan Status Stok</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-black uppercase text-zinc-800">
                    <input
                      type="checkbox"
                      checked={showStockDisclaimer}
                      onChange={(e) => setShowStockDisclaimer(e.target.checked)}
                      className="w-3.5 h-3.5 accent-black rounded"
                    />
                    <span>Tampilkan di Poster</span>
                  </label>
                </div>

                {showStockDisclaimer && (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={stockDisclaimerText}
                      onChange={(e) => setStockDisclaimerText(e.target.value)}
                      placeholder="*Status stok (ready/habis) dapat berubah sewaktu-waktu..."
                      className="w-full px-3 py-1.5 rounded-xl bg-[#FFFDF0] border-2 border-black shadow-[2px_2px_0_#000] text-xs font-bold text-black outline-none"
                    />
                    <div className="flex flex-wrap gap-1">
                      {[
                        '*Status stok ready/habis dapat berubah sewaktu-waktu & bisa terjadi kekeliruan. Harap konfirmasi saat order.',
                        '*Stok ready/habis bersifat dinamis. Mohon tanyakan ketersediaan ke admin sebelum order.',
                        '*Perhatian: Status stok aplikasi bisa sewaktu-waktu berbeda, hubungi admin untuk kepastian.'
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setStockDisclaimerText(preset)}
                          className={`px-2 py-0.5 rounded-md border border-black text-[9px] font-black uppercase transition cursor-pointer ${
                            stockDisclaimerText === preset
                              ? 'bg-black text-yellow-300'
                              : 'bg-white hover:bg-yellow-100 text-zinc-700'
                          }`}
                        >
                          Contoh {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Poster Preview & Export Column (Right) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Action Buttons Bar */}
            <div className="p-4 rounded-2xl bg-white border-3 border-black shadow-[5px_5px_0_#000] flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-black">
                  Aksi Ekspor:
                </span>
                <span className="bg-yellow-200 text-black text-[10px] font-black px-2 py-0.5 rounded border border-black">
                  {displayedPosterProducts.length} Produk Terpilih
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={generatingPoster}
                  onClick={() => handleDownloadPoster('png')}
                  className="neo-btn px-3 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black border-2 border-black shadow-[3px_3px_0_#000] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Unduh gambar beresolusi tinggi PNG untuk WhatsApp Story / Instagram"
                >
                  <Download className="w-4 h-4" />
                  <span>{generatingPoster ? 'Memproses...' : 'Unduh PNG HD'}</span>
                </button>

                <button
                  type="button"
                  disabled={generatingPoster}
                  onClick={() => handleDownloadPoster('jpg')}
                  className="neo-btn px-3 py-2 rounded-xl bg-[#FFE600] hover:bg-[#ffea33] text-black text-xs font-black border-2 border-black shadow-[3px_3px_0_#000] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Unduh gambar ukuran ringan JPG"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh JPG</span>
                </button>

                <button
                  type="button"
                  disabled={generatingPoster}
                  onClick={handleCopyPosterImage}
                  className="neo-btn px-3 py-2 rounded-xl bg-white hover:bg-yellow-50 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Salin gambar poster ke clipboard"
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Salin Gambar</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyBroadcastText}
                  className="neo-btn px-3 py-2 rounded-xl bg-purple-300 hover:bg-purple-200 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  title="Salin daftar harga & kontak dalam format teks chat WhatsApp"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Salin Chat WA</span>
                </button>
              </div>
            </div>

            {/* Poster Live Canvas */}
            <div className="overflow-x-auto pb-4">
              <div
                ref={posterRef}
                className={`relative w-full min-w-0 max-w-[960px] mx-auto p-3 sm:p-6 ${
                  cardCorner === 'sharp' ? 'rounded-none' : 'rounded-2xl'
                } border-3 sm:border-4 ${currentTheme.border} ${currentTheme.bg} shadow-[4px_4px_0_#000] sm:shadow-[6px_6px_0_#000] transition-colors overflow-hidden`}
              >
                {/* Watermark Anti-Curi (Transparan di Latar) */}
                {watermarkEnabled && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none z-0 opacity-[0.05] overflow-hidden">
                    <span className="text-7xl sm:text-9xl font-black uppercase rotate-[-25deg] tracking-widest text-black text-center whitespace-nowrap">
                      {storeName}
                    </span>
                  </div>
                )}

                {/* Poster Header */}
                <div
                  className={`relative z-10 ${
                    cardCorner === 'sharp' ? 'rounded-none' : 'rounded-2xl'
                  } border-3 border-black ${currentTheme.headerBg} p-3.5 sm:p-5 text-center shadow-[4px_4px_0_#000] mb-4 space-y-2`}
                >
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-md border-2 border-black font-black text-[10px] uppercase tracking-wider shadow-[1.5px_1.5px_0_#000] ${currentTheme.badgeBg}`}>
                      OFFICIAL STORE
                    </span>
                    <span className="bg-emerald-300 text-black px-2 py-0.5 rounded-full border border-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-[1px_1px_0_#000]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-950 animate-pulse"></span>
                      <span>Ready Stock</span>
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-black leading-tight">
                    {storeName}
                  </h2>
                  <p className={`text-xs sm:text-sm font-bold ${currentTheme.taglineColor}`}>
                    {storeTagline}
                  </p>

                  <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
                    <div className="inline-flex items-center gap-2 bg-yellow-100 text-black px-3 py-1 rounded-full text-[11px] font-black border-2 border-black shadow-[1.5px_1.5px_0_#000]">
                      <span>REALTIME UPDATE</span>
                      <span>•</span>
                      <span>{promoBadgeText || '100% GARANSI RESMI'}</span>
                    </div>

                    {totalPosterPages > 1 && posterPageSize !== 'all' && (
                      <div className="flex items-center gap-1 bg-white text-black px-2.5 py-0.5 rounded-full border-2 border-black text-[10px] font-black shadow-[1.5px_1.5px_0_#000]">
                        <button
                          type="button"
                          disabled={posterCurrentPage <= 1}
                          onClick={() => setPosterCurrentPage(prev => Math.max(1, prev - 1))}
                          className="p-0.5 rounded hover:bg-yellow-200 disabled:opacity-30 cursor-pointer"
                          title="Slide Sebelumnya"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <span>Slide {posterCurrentPage} / {totalPosterPages}</span>
                        <button
                          type="button"
                          disabled={posterCurrentPage >= totalPosterPages}
                          onClick={() => setPosterCurrentPage(prev => Math.min(totalPosterPages, prev + 1))}
                          className="p-0.5 rounded hover:bg-yellow-200 disabled:opacity-30 cursor-pointer"
                          title="Slide Berikutnya"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Poster Products Grid */}
                {displayedPosterProducts.length === 0 ? (
                  <div className={`relative z-10 p-8 text-center bg-white ${cardCorner === 'sharp' ? 'rounded-none' : 'rounded-xl'} border-2 border-black text-xs font-bold text-zinc-600`}>
                    Tidak ada produk yang sesuai dengan filter pilihan.
                  </div>
                ) : (
                  <div className={`relative z-10 grid ${getGridColsClass()} gap-3`}>
                    {displayedPosterProducts.map((p) => (
                      <div
                        key={p.id}
                        className={`bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] ${
                          cardCorner === 'sharp' ? 'rounded-none' : 'rounded-xl'
                        } flex flex-col justify-between ${
                          posterDensity === 'compact' ? 'p-2.5' : 'p-3'
                        }`}
                      >
                        <div>
                          {/* Product Title & Badge */}
                          <div
                            className={`flex items-start justify-between gap-1.5 border-b-2 border-black ${
                              posterDensity === 'compact' ? 'mb-1.5 pb-1.5' : 'mb-2 pb-1.5'
                            }`}
                          >
                            <h4
                              className={`font-black uppercase leading-tight line-clamp-2 ${
                                posterDensity === 'compact' ? 'text-[11px]' : 'text-xs'
                              }`}
                            >
                              {p.name}
                            </h4>
                            <span
                              className={`font-black uppercase bg-yellow-200 border border-black rounded shrink-0 ${
                                posterDensity === 'compact'
                                  ? 'text-[8px] px-1 py-0.5'
                                  : 'text-[9px] px-1.5 py-0.5'
                              }`}
                            >
                              {p.categoryName ? p.categoryName.split(' ')[0] : 'Item'}
                            </span>
                          </div>

                          {/* Variants List */}
                          <div
                            className={
                              posterDensity === 'compact' ? 'space-y-1' : 'space-y-1.5'
                            }
                          >
                            {p.filteredVariants.map((v, vIdx) => {
                              const isReady = v.isAvailable !== false;
                              const sellingPrice = calculateSellingPrice(v.price);
                              return (
                                <div
                                  key={v.id ? `${v.id}_${vIdx}` : vIdx}
                                  className={`flex items-center justify-between ${
                                    cardCorner === 'sharp' ? 'rounded-none' : 'rounded-lg'
                                  } border-2 border-black transition ${
                                    posterDensity === 'compact'
                                      ? 'p-1 text-[10px]'
                                      : 'p-1.5 text-[11px]'
                                  } ${
                                    isReady
                                      ? 'bg-emerald-50/80 shadow-[1px_1px_0_#000]'
                                      : 'bg-rose-50/70 border-dashed opacity-75'
                                  }`}
                                >
                                  <div className="min-w-0 flex-1 mr-1.5">
                                    <div
                                      className="font-black text-black leading-snug truncate"
                                      title={v.name}
                                    >
                                      {getCleanVariantName(v.name, p.name)}
                                    </div>
                                    {showPrice && (
                                      <div className="font-mono font-black text-zinc-800 text-[10px]">
                                        {formatRupiah(sellingPrice)}
                                      </div>
                                    )}
                                  </div>

                                  {/* Status Indicator */}
                                  <div className="shrink-0">
                                    {posterShape === 'circle' ? (
                                      <span
                                        className={`rounded-full border-2 border-black flex items-center justify-center shadow-[1px_1px_0_#000] ${
                                          posterDensity === 'compact' ? 'w-3 h-3' : 'w-3.5 h-3.5'
                                        } ${isReady ? 'bg-emerald-400' : 'bg-rose-400'}`}
                                      ></span>
                                    ) : (
                                      <span
                                        className={`${
                                          cardCorner === 'sharp' ? 'rounded-none' : 'rounded'
                                        } font-black uppercase border border-black shadow-[1px_1px_0_#000] ${
                                          posterDensity === 'compact'
                                            ? 'px-1 py-0.2 text-[8px]'
                                            : 'px-1.5 py-0.5 text-[9px]'
                                        } ${
                                          isReady
                                            ? 'bg-emerald-400 text-black'
                                            : 'bg-rose-400 text-black'
                                        }`}
                                      >
                                        {isReady ? 'Ready' : 'Habis'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Keterangan Disclaimer Status Stok Poster */}
                {showStockDisclaimer && stockDisclaimerText && (
                  <div
                    className={`relative z-10 ${
                      cardCorner === 'sharp' ? 'rounded-none' : 'rounded-xl'
                    } border-2 border-black/80 bg-white/95 px-3 py-1.5 text-center shadow-[2px_2px_0_#000] mt-3`}
                  >
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight text-zinc-900 leading-snug">
                      {stockDisclaimerText}
                    </p>
                  </div>
                )}

                {/* Poster Footer */}
                <div
                  className={`relative z-10 ${
                    cardCorner === 'sharp' ? 'rounded-none' : 'rounded-2xl'
                  } border-3 border-black ${currentTheme.footerBg} p-3 sm:p-3.5 text-center shadow-[4px_4px_0_#000] mt-3 flex flex-col sm:flex-row items-center justify-between gap-2`}
                >
                  <p className="text-xs sm:text-sm font-black uppercase tracking-tight text-black">
                    {customNote}
                  </p>
                  <div className="px-2.5 py-0.5 rounded-lg bg-yellow-200 text-black border-2 border-black font-black text-[10px] uppercase tracking-wider shrink-0 shadow-[1.5px_1.5px_0_#000]">
                    PROSES CEPAT & GARANSI RESMI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reseller Interactive Price & Margin Table */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border-3 border-black shadow-[5px_5px_0_#000] space-y-4">
          {/* Alert Keterangan Stok Dinamis */}
          <div className="p-3 bg-amber-50 rounded-xl border-2 border-black flex items-start gap-2 shadow-[2px_2px_0_#000]">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs font-bold text-black leading-snug">
              <span className="font-black uppercase mr-1 bg-amber-300 px-1.5 py-0.5 rounded border border-black text-[10px]">
                Perhatian Stok
              </span>
              Status Ready atau Habis dapat berubah sewaktu-waktu atau berpotensi mengalami keterlambatan sinkronisasi. Selalu tanyakan dan konfirmasi ketersediaan stok ke admin D Store saat meneruskan pesanan.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-700" />
                <span>Kalkulator Margin & Order Langsung ke D Store</span>
              </h3>
              <p className="text-xs font-bold text-zinc-600">
                Saat pembelimu membayar, klik tombol "Order ke D Store" untuk meneruskan pesanan dengan 1 klik.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Cari produk atau varian..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#FFFDF0] border-2 border-black shadow-[2px_2px_0_#000] text-xs font-bold text-black outline-none"
                />
              </div>
            </div>
          </div>

          {/* Mobile Card List (sm:hidden) */}
          <div className="block sm:hidden space-y-3">
            {displayedPosterProducts.flatMap((p) =>
              p.filteredVariants.map((v, vIdx) => {
                const costToReseller = v.price;
                const sellingPrice = calculateSellingPrice(v.price);
                const profit = calculateProfit(v.price);
                const isReady = v.isAvailable !== false;

                return (
                  <div
                    key={`mob_${p.id}_${vIdx}`}
                    className="p-3.5 rounded-xl border-2 border-black bg-white shadow-[3px_3px_0_#000] space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-black/10 pb-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-black text-black text-xs uppercase truncate">{p.name}</div>
                        <div className="text-[11px] font-bold text-zinc-600 truncate">{getCleanVariantName(v.name, p.name)}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border border-black shrink-0 shadow-[1px_1px_0_#000] ${
                          isReady ? 'bg-emerald-300 text-black' : 'bg-rose-300 text-black'
                        }`}
                      >
                        {isReady ? 'Ready' : 'Habis'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
                      <div className="bg-yellow-50 p-1.5 rounded-lg border border-black/30 text-center">
                        <div className="text-[8px] font-sans font-black text-zinc-600 uppercase">Modal</div>
                        <div className="font-bold text-zinc-800 text-[10px]">{formatRupiah(costToReseller)}</div>
                      </div>
                      <div className="bg-yellow-100 p-1.5 rounded-lg border border-black/30 text-center">
                        <div className="text-[8px] font-sans font-black text-black uppercase">Jualmu</div>
                        <div className="font-black text-black text-[10px]">{formatRupiah(sellingPrice)}</div>
                      </div>
                      <div className="bg-emerald-100 p-1.5 rounded-lg border border-black/30 text-center">
                        <div className="text-[8px] font-sans font-black text-emerald-900 uppercase">Untung</div>
                        <div className="font-black text-emerald-700 text-[10px]">+{formatRupiah(profit)}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOrderToSupplier(p.name, v.name, costToReseller)}
                      className="w-full neo-btn py-2 rounded-lg bg-[#FFE600] hover:bg-[#ffea33] text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Order ke D Store</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table (hidden sm:block) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-yellow-200 border-2 border-black text-black font-black uppercase text-[11px] tracking-wider">
                  <th className="p-2.5 border-r border-black">Produk & Varian</th>
                  <th className="p-2.5 border-r border-black">Kategori</th>
                  <th className="p-2.5 border-r border-black text-right">Modal Kamu (D Store)</th>
                  <th className="p-2.5 border-r border-black text-right">Harga Jualmu</th>
                  <th className="p-2.5 border-r border-black text-right">Keuntungan Bersih</th>
                  <th className="p-2.5 border-r border-black text-center">Status Stok</th>
                  <th className="p-2.5 text-center">Aksi Reseller</th>
                </tr>
              </thead>
              <tbody>
                {displayedPosterProducts.flatMap((p) =>
                  p.filteredVariants.map((v, vIdx) => {
                    const costToReseller = v.price;
                    const sellingPrice = calculateSellingPrice(v.price);
                    const profit = calculateProfit(v.price);
                    const isReady = v.isAvailable !== false;

                    return (
                      <tr
                        key={`${p.id}_${vIdx}`}
                        className="border-b border-black/20 hover:bg-yellow-50/70 font-bold transition"
                      >
                        <td className="p-2.5 border-r border-black/20">
                          <div className="font-black text-black">{p.name}</div>
                          <div className="text-[11px] text-zinc-600">
                            {getCleanVariantName(v.name, p.name)}
                          </div>
                        </td>
                        <td className="p-2.5 border-r border-black/20">
                          <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-[10px] font-bold border border-black/30">
                            {p.categoryName || 'Umum'}
                          </span>
                        </td>
                        <td className="p-2.5 border-r border-black/20 text-right font-mono font-bold text-zinc-700">
                          {formatRupiah(costToReseller)}
                        </td>
                        <td className="p-2.5 border-r border-black/20 text-right font-mono font-black text-black">
                          {formatRupiah(sellingPrice)}
                        </td>
                        <td className="p-2.5 border-r border-black/20 text-right font-mono font-black text-emerald-700">
                          +{formatRupiah(profit)}
                        </td>
                        <td className="p-2.5 border-r border-black/20 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border border-black shadow-[1px_1px_0_#000] ${
                              isReady
                                ? 'bg-emerald-300 text-black'
                                : 'bg-rose-300 text-black'
                            }`}
                          >
                            {isReady ? 'Ready' : 'Habis'}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              handleOrderToSupplier(p.name, v.name, costToReseller)
                            }
                            className="neo-btn px-2.5 py-1 rounded-lg bg-[#FFE600] hover:bg-[#ffea33] text-black text-[10px] font-black border-2 border-black shadow-[1.5px_1.5px_0_#000] uppercase tracking-tight flex items-center gap-1 mx-auto cursor-pointer"
                            title="Pesan varian ini ke D Store lewat WhatsApp resmi"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>Order ke D Store</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Product Selection Modal */}
      {showProductPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#FFE600] border-b-3 border-black flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 bg-black text-yellow-300 border-2 border-black rounded-xl flex items-center justify-center font-black shadow-[2px_2px_0_#000] shrink-0">
                  <ListChecks className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-black">
                    Pilih Produk Yang Ingin Dijual
                  </h3>
                  <p className="text-[11px] font-bold text-black/80">
                    Centang produk yang ingin kamu tampilkan di poster, tabel cuan, dan pesan WhatsApp
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProductPicker(false)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-rose-200 text-black border-2 border-black shadow-[2px_2px_0_#000] flex items-center justify-center font-black transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Toolbar: Search & Category Filter */}
            <div className="p-3 sm:p-4 bg-zinc-50 border-b-2 border-black space-y-2.5 shrink-0">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama produk / varian (misal: Canva, Netflix, CapCut)..."
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs font-bold text-black outline-none"
                  />
                  {pickerSearch && (
                    <button
                      type="button"
                      onClick={() => setPickerSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-500 hover:text-black"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={pickerCategory}
                    onChange={(e) => setPickerCategory(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs font-black text-black outline-none cursor-pointer"
                  >
                    <option value="all">Semua Kategori ({categories.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={pickerStockFilter}
                    onChange={(e) => setPickerStockFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs font-black text-black outline-none cursor-pointer"
                  >
                    <option value="all">Semua Stok</option>
                    <option value="ready">Hanya Ready</option>
                  </select>
                </div>
              </div>

              {/* Bulk Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const currentFilterIds = pickerProducts.map((p) => p.id);
                      if (selectedProductIds === null) {
                        // Already all selected
                      } else {
                        const merged = Array.from(new Set([...selectedProductIds, ...currentFilterIds]));
                        setSelectedProductIds(merged.length === products.length ? null : merged);
                      }
                      showToast(`Memilih semua produk dari filter ini (${pickerProducts.length} produk).`, 'info');
                    }}
                    className="px-2.5 py-1 rounded-lg border-2 border-black bg-yellow-200 hover:bg-yellow-300 text-black font-black text-[11px] uppercase shadow-[1.5px_1.5px_0_#000] transition cursor-pointer"
                  >
                    Pilih Yang Tampil ({pickerProducts.length})
                  </button>

                  <button
                    type="button"
                    onClick={handleSelectAllProducts}
                    className="px-2.5 py-1 rounded-lg border-2 border-black bg-white hover:bg-yellow-100 text-black font-black text-[11px] uppercase shadow-[1.5px_1.5px_0_#000] transition cursor-pointer"
                  >
                    Pilih Semua Katalog ({products.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const currentFilterIds = pickerProducts.map((p) => p.id);
                      if (selectedProductIds === null) {
                        const remaining = products.filter((p) => !currentFilterIds.includes(p.id)).map((p) => p.id);
                        setSelectedProductIds(remaining);
                      } else {
                        setSelectedProductIds(selectedProductIds.filter((id) => !currentFilterIds.includes(id)));
                      }
                      showToast('Membatalkan pilihan produk dari filter ini.', 'info');
                    }}
                    className="px-2.5 py-1 rounded-lg border-2 border-black bg-rose-100 hover:bg-rose-200 text-rose-950 font-black text-[11px] uppercase shadow-[1.5px_1.5px_0_#000] transition cursor-pointer"
                  >
                    Lepas Yang Tampil
                  </button>

                  <button
                    type="button"
                    onClick={handleDeselectAllProducts}
                    className="px-2.5 py-1 rounded-lg border-2 border-black bg-zinc-200 hover:bg-zinc-300 text-zinc-900 font-black text-[11px] uppercase shadow-[1.5px_1.5px_0_#000] transition cursor-pointer"
                  >
                    Kosongkan Semua
                  </button>
                </div>

                <div className="text-[11px] font-black uppercase text-zinc-700 bg-white px-2.5 py-1 rounded-lg border border-black shadow-[1px_1px_0_#000]">
                  {currentSelectedCount} dari {products.length} Terpilih
                </div>
              </div>
            </div>

            {/* Product Cards List (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 bg-[#FFFDF0]/50">
              {pickerProducts.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                  <div className="text-sm font-black text-zinc-800 uppercase">Tidak ada produk yang cocok</div>
                  <div className="text-xs font-bold text-zinc-500 mt-1">Coba ganti kata kunci pencarian atau kategori filter</div>
                </div>
              ) : (
                pickerProducts.map((p) => {
                  const isSelected = isProductSelected(p.id);
                  const isReady = (p.variants || []).some((v) => v.isAvailable !== false);
                  const minPrice = (p.variants && p.variants.length > 0)
                    ? Math.min(...p.variants.map((v) => Number(v.price) || 0))
                    : 0;
                  const minSellingPrice = calculateSellingPrice(minPrice);

                  return (
                    <div
                      key={`pick_${p.id}`}
                      onClick={() => handleToggleProduct(p.id)}
                      className={`p-3 rounded-xl border-2 transition cursor-pointer select-none flex flex-col justify-between ${
                        isSelected
                          ? 'border-black bg-yellow-100/90 shadow-[3px_3px_0_#000]'
                          : 'border-black/30 bg-white hover:border-black hover:bg-yellow-50/50 shadow-[1px_1px_0_#000] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-black text-black text-xs uppercase leading-tight line-clamp-2">
                            {p.name}
                          </div>
                          <div className="shrink-0 mt-0.5">
                            {isSelected ? (
                              <div className="w-5 h-5 bg-black text-[#FFE600] rounded flex items-center justify-center border border-black shadow-[1px_1px_0_#000]">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 bg-white border-2 border-black/50 rounded" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-[9px] font-bold border border-black/30">
                            {p.categoryName || 'Umum'}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border border-black ${
                              isReady ? 'bg-emerald-200 text-emerald-950' : 'bg-rose-200 text-rose-950'
                            }`}
                          >
                            {isReady ? 'Ready' : 'Habis'}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-500">
                            {(p.variants || []).length} Varian
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t border-black/10 flex items-baseline justify-between">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase">Jual Mulai:</span>
                        <span className="text-xs font-mono font-black text-black">
                          {formatRupiah(minSellingPrice)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-white border-t-3 border-black flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs font-bold text-zinc-700 text-center sm:text-left">
                <span className="font-black text-black text-sm">{currentSelectedCount}</span> produk dipilih. Poster, ekspor HD, dan tabel cuan otomatis diperbarui.
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSelectAllProducts}
                  className="flex-1 sm:flex-none neo-btn px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider cursor-pointer"
                >
                  Reset Semua
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductPicker(false)}
                  className="flex-1 sm:flex-none neo-btn px-5 py-2 rounded-xl bg-[#FFE600] hover:bg-[#ffea33] text-black text-xs font-black border-2 border-black shadow-[3px_3px_0_#000] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Selesai ({currentSelectedCount})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
