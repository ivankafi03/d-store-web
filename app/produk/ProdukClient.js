'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
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
  ExternalLink
} from 'lucide-react';

export default function ProdukClient({ initialData }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('cheapest'); // 'cheapest' | 'expensive' | 'az'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const products = initialData?.products || [];
  const variants = initialData?.variants || [];
  const categories = initialData?.categories || [];
  const waNumber = initialData?.settings?.waNumber || '6281230112240';

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
      map[pId].sort((a, b) => (a.price || 0) - (b.price || 0));
    }
    return map;
  }, [variants]);

  // Category list
  const categoryTabs = useMemo(() => {
    return [
      { id: 'ALL', name: 'Semua Produk' },
      { id: 'cat_1', name: 'AI & Tools' },
      { id: 'cat_2', name: 'Streaming' },
      { id: 'cat_3', name: 'Desain & Video' },
      { id: 'cat_4', name: 'Musik' },
      { id: 'cat_5', name: 'Edukasi' },
      { id: 'cat_6', name: 'VPN' },
      { id: 'cat_7', name: 'Office & Akun' },
    ];
  }, []);

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Must be active and have at least 1 variant
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

    const brand = selectedProduct.brand || selectedProduct.name;
    const variantName = selectedVariant.name || 'Default';
    const price = formatRupiah(selectedVariant.price || 0);

    const message = `Halo Admin D Store, saya ingin order akun premium legal:\n\n` +
      `*Produk*: ${selectedProduct.name}\n` +
      `*Brand*: ${brand}\n` +
      `*Paket / Varian*: ${variantName}\n` +
      `*Harga*: ${price}\n\n` +
      `Apakah stok paket ini ready dan siap proses? Terima kasih.`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${waNumber}?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 flex flex-col pb-24 md:pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="p-1.5 -ml-1 text-zinc-600 hover:text-zinc-950 rounded-lg hover:bg-zinc-100 transition"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="flex items-center gap-1.5 group">
              <span className="text-base sm:text-lg font-black tracking-tighter text-zinc-950 group-hover:text-black">
                D STORE
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-zinc-900 text-white px-2 py-0.5 rounded-full">
                Katalog
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Admin D Store, saya ingin tanya katalog produk.')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hubungi Admin</span>
              <span className="sm:hidden">CS</span>
            </a>
          </div>
        </div>

        {/* Search & Category Filter Sub-Header */}
        <div className="max-w-6xl mx-auto px-4 pb-3 pt-1">
          <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari produk (Netflix, ChatGPT, Canva, Spotify, dll)..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 focus:bg-white transition text-zinc-900 placeholder:text-zinc-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-2 font-medium text-zinc-800 focus:outline-none focus:border-zinc-900"
              >
                <option value="cheapest">Harga Termurah</option>
                <option value="expensive">Harga Tertinggi</option>
                <option value="az">Nama A - Z</option>
              </select>
            </div>
          </div>

          {/* Category Chips Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 pb-0.5">
            {categoryTabs.map((tab) => {
              const active = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`text-xs whitespace-nowrap px-3 py-1.5 rounded-full font-medium transition cursor-pointer shrink-0 ${
                    active
                      ? 'bg-zinc-900 text-white shadow-2xs font-semibold'
                      : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900'
                  }`}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pt-6 w-full flex-1">
        {/* Banner / Info Bar */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-zinc-950">
              Katalog Seluruh Produk
            </h1>
            <span className="text-xs text-zinc-500 bg-zinc-200/70 px-2 py-0.5 rounded-full font-semibold">
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
          <div className="bg-white border border-dashed border-zinc-300 rounded-2xl p-12 text-center my-8">
            <Package className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-zinc-800 mb-1">
              Tidak ada produk yang cocok
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
              Coba gunakan kata kunci pencarian lain atau pilih kategori yang berbeda.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
              }}
              className="text-xs font-semibold px-4 py-2 bg-zinc-900 text-white rounded-xl hover:bg-black transition"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Product Cards Grid - NO IMAGES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredProducts.map((prod) => {
            const pVars = productVariantsMap[prod.id] || [];
            const minPrice = pVars[0]?.price || prod.price || 0;
            const brandLabel = (prod.brand || prod.name || 'AKUN').toUpperCase();

            return (
              <div
                key={prod.id}
                onClick={() => handleOpenProduct(prod)}
                className="group bg-white border border-zinc-200 hover:border-zinc-900 rounded-2xl p-4 sm:p-5 transition shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Brand Badge & Category */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="inline-block bg-zinc-900 text-white font-extrabold text-[10px] tracking-wider px-2.5 py-1 rounded-md uppercase">
                      {brandLabel}
                    </span>
                    <span className="text-[11px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
                      {pVars.length} Varian
                    </span>
                  </div>

                  {/* Product Title */}
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 group-hover:text-black line-clamp-2 leading-snug mb-2">
                    {prod.name}
                  </h3>

                  {/* Description / Variants chips preview */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {pVars.slice(0, 3).map((v, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium text-zinc-600 bg-zinc-50 border border-zinc-200/80 px-2 py-0.5 rounded"
                      >
                        {v.name.replace(prod.name, '').trim() || v.name}
                      </span>
                    ))}
                    {pVars.length > 3 && (
                      <span className="text-[10px] font-medium text-zinc-400 self-center">
                        +{pVars.length - 3} lainnya
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Price & Pilih Paket Button */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-[10px] text-zinc-400 font-medium">
                      Mulai dari
                    </span>
                    <span className="text-sm sm:text-base font-black text-emerald-600">
                      {formatRupiah(minPrice)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenProduct(prod);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-zinc-900 text-white group-hover:bg-black transition shadow-2xs"
                  >
                    <span>Pilih Paket</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal Detail & Pilih Paket */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div 
            className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 max-h-[88vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-200">
              <div>
                <span className="inline-block bg-zinc-900 text-white font-extrabold text-[10px] tracking-wider px-2 py-0.5 rounded uppercase mb-1.5">
                  {selectedProduct.brand || 'D STORE'}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-zinc-950 leading-snug">
                  {selectedProduct.name}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Garansi Resmi & Legal</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: List of Packages/Variants */}
            <div className="py-4 overflow-y-auto space-y-2 flex-1">
              <span className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2">
                Pilih Durasi / Paket
              </span>
              {(productVariantsMap[selectedProduct.id] || []).map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-zinc-950 bg-zinc-50 shadow-2xs'
                        : 'border-zinc-200 hover:border-zinc-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-zinc-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs sm:text-sm font-bold text-zinc-900 truncate">
                          {v.name}
                        </span>
                        {v.supplierOffers?.[0]?.note && (
                          <span className="block text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                            {v.supplierOffers[0].note}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-emerald-600">
                        {formatRupiah(v.price)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer: Action */}
            <div className="pt-3 border-t border-zinc-200 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-medium">Total Harga:</span>
                <span className="text-base font-black text-zinc-950">
                  {formatRupiah(selectedVariant?.price || 0)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleOrderWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Pesan Sekarang via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation Bar (Mobile) */}
      <div className="fixed bottom-3 inset-x-0 mx-auto z-40 w-[88%] max-w-[320px] md:hidden pointer-events-none">
        <div className="pointer-events-auto rounded-full border border-black/10 bg-white/95 px-3 py-1 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex h-[44px] flex-1 flex-col items-center justify-center gap-y-0.5 text-zinc-500 hover:text-black transition"
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-tight">Home</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex h-[44px] flex-1 flex-col items-center justify-center gap-y-0.5 text-zinc-500 hover:text-black transition"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-tight">Kategori</span>
            </button>

            <div className="flex h-[44px] flex-1 flex-col items-center justify-center gap-y-0.5 text-zinc-950 font-bold">
              <Package className="w-5 h-5 text-zinc-950" />
              <span className="text-[10px] font-bold leading-tight">Produk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
