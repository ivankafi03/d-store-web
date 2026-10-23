'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  User,
  Sparkles,
  Home,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Zap,
  ShieldCheck,
  Check
} from 'lucide-react';
import { 
  ZALORA_TOP_TIER_PRODUCTS, 
  ZALORA_JUST_FOR_YOU_PRODUCTS, 
  ZALORA_PRODUCTS 
} from '@/lib/zaloraMenData';
import { getAppVariantData } from '@/lib/appVariantsData';
import UserAvatar from '@/app/components/UserAvatar';
import CartModal from '@/app/components/CartModal';
import AccountModal from '@/app/components/AccountModal';
import CategoriesModal from '@/app/components/CategoriesModal';
import AppVariantModal from '@/app/components/AppVariantModal';
import { useUserAuth } from '@/lib/useUserAuth';

export default function WishlistClient({ initialProducts = [], initialVariants = [] }) {
  const router = useRouter();
  const { user, loginWithGoogle, logout, updateProfile } = useUserAuth();

  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [selectedAppModal, setSelectedAppModal] = useState(null);
  const [notification, setNotification] = useState(null);

  // Load wishlist & cart dari localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedWishlist = localStorage.getItem('d_store_wishlist');
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      } catch (e) {}
      try {
        const savedCart = localStorage.getItem('d_store_cart');
        if (savedCart) setCart(JSON.parse(savedCart));
      } catch (e) {}
    }
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // Simpan perubahan wishlist ke localStorage
  const removeFromWishlist = (productId) => {
    setWishlist((prev) => {
      const updated = prev.filter((id) => id !== productId);
      try {
        localStorage.setItem('d_store_wishlist', JSON.stringify(updated));
      } catch (e) {}
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
      try {
        localStorage.setItem('d_store_cart', JSON.stringify(updated));
      } catch (e) {}
      showNotification('Dimasukkan ke Tas Belanja');
      return updated;
    });
  };

  // Kumpulkan seluruh data produk katalog
  const allCatalogProducts = useMemo(() => {
    const list = [
      ...ZALORA_TOP_TIER_PRODUCTS,
      ...ZALORA_JUST_FOR_YOU_PRODUCTS,
      ...ZALORA_PRODUCTS,
      ...initialProducts
    ];
    // Hilangkan duplikasi berdasarkan sku atau id
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
        brand: 'D Store',
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
    // Fallback buka varian
    setSelectedAppModal({
      id: item.sku || item.id,
      name: item.name || 'Aplikasi Premium',
      category: item.brand || 'D Store',
      image: item.image,
      variants: [
        { id: 'v1', name: '1 Bulan Sharing', price: 15000, isAvailable: true },
        { id: 'v2', name: '1 Bulan Private', price: 35000, isAvailable: true }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#222] font-sans antialiased pb-24 md:pb-12">
      {/* Toast Notifikasi */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black/90 text-white px-4 py-2.5 rounded-full text-xs font-semibold shadow-xl flex items-center gap-2 animate-fade-in border border-zinc-700">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Sticky Atas */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-2xs">
        <div className="max-w-[1240px] mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-1.5 -ml-1 text-zinc-700 hover:text-black transition cursor-pointer"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base text-zinc-950 uppercase tracking-wide">
                Wishlist Saya
              </h1>
              <p className="text-[11px] text-zinc-500 font-mono">
                {wishlistItems.length} produk tersimpan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 text-[#222]">
            <Link
              href="/store"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold hover:text-black transition"
            >
              <Home className="w-4 h-4" />
              <span>Beranda Toko</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 text-zinc-700 hover:text-black transition cursor-pointer"
              aria-label="Tas Belanja"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Konten Utama Wishlist */}
      <main className="max-w-[1240px] mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {wishlistItems.length === 0 ? (
          /* Tampilan Kosong (Empty State) */
          <div className="py-16 sm:py-24 text-center max-w-md mx-auto px-4 space-y-4">
            <div className="w-20 h-20 rounded-full bg-zinc-200/80 flex items-center justify-center mx-auto text-zinc-400">
              <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M16.308 8.335c1.68-1.666 3.691-2.219 5.9-1.571 2.168.635 3.57 2.147 4.13 4.394.058.229.082.409.122.802l.012.127.028.279c-.039 1.496-.545 2.874-1.502 4.4-1.454 2.318-3.335 4.298-6.147 6.683-.362.306-.666.549-1.317 1.058l-.031.025c-.454.356-.665.522-.916.727-.375.305-.767.329-1.162.027-3.318-2.532-5.666-4.724-7.574-7.255-1.107-1.467-1.826-2.832-2.196-4.323-.805-3.25 1.625-6.761 4.946-7.141 1.989-.228 3.692.368 5.086 1.786.16.163.228.246.296.248.072 0 .145-.087.325-.266zm9.196 4.083a10.708 10.708 0 01-.04-.361 4.378 4.378 0 00-.095-.658c-.477-1.907-1.621-3.142-3.441-3.676-1.853-.543-3.49-.093-4.915 1.322-.74.735-1.317.744-2.04.01-1.176-1.199-2.574-1.688-4.258-1.495-2.721.312-4.75 3.243-4.09 5.907.334 1.345.993 2.594 2.024 3.962 1.836 2.435 4.11 4.56 7.339 7.028.244-.198.459-.368.898-.712l.032-.025c.64-.502.938-.74 1.287-1.034 2.74-2.324 4.557-4.237 5.946-6.451.87-1.387 1.316-2.602 1.353-3.817z" fill="#737373" />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-zinc-950">
                Wishlist Anda Masih Kosong
              </h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Simpan produk dan aplikasi premium favorit Anda dengan menekan ikon hati pada katalog produk.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/store"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-zinc-800 transition active:scale-95 shadow-md"
              >
                Mulai Belanja Sekarang
              </Link>
            </div>
          </div>
        ) : (
          /* Grid Produk Wishlist */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <span className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                Semua Item ({wishlistItems.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Hapus semua item dari Wishlist?')) {
                    setWishlist([]);
                    try { localStorage.removeItem('d_store_wishlist'); } catch (e) {}
                    showNotification('Wishlist telah dikosongkan');
                  }
                }}
                className="text-xs text-zinc-500 hover:text-rose-600 transition font-medium"
              >
                Kosongkan
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {wishlistItems.map((prod, idx) => {
                const prodKey = prod.sku || prod.id;
                return (
                  <div
                    key={prodKey || idx}
                    onClick={() => handleProductClick(prod)}
                    className="bg-white rounded-xl border border-zinc-200/90 overflow-hidden flex flex-col justify-between hover:shadow-md transition cursor-pointer group"
                  >
                    {/* Gambar & Tombol Hapus Heart */}
                    <div className="relative aspect-square bg-[#F0F0F0] overflow-hidden">
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white">
                          <Sparkles className="w-8 h-8 text-zinc-500" />
                        </div>
                      )}

                      {/* Tombol Heart Merah Solid di Sudut Kanan Atas */}
                      <button
                        type="button"
                        aria-label="Hapus dari Wishlist"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFromWishlist(prodKey);
                        }}
                        className="absolute top-1.5 right-1.5 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center transition cursor-pointer"
                        title="Hapus dari Wishlist"
                      >
                        <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block size-6 cursor-pointer">
                          <path d="M16.308 8.335c1.68-1.666 3.691-2.219 5.9-1.571 2.168.635 3.57 2.147 4.13 4.394.058.229.082.409.122.802l.012.127.028.279c-.039 1.496-.545 2.874-1.502 4.4-1.454 2.318-3.335 4.298-6.147 6.683-.362.306-.666.549-1.317 1.058l-.031.025c-.454.356-.665.522-.916.727-.375.305-.767.329-1.162.027-3.318-2.532-5.666-4.724-7.574-7.255-1.107-1.467-1.826-2.832-2.196-4.323-.805-3.25 1.625-6.761 4.946-7.141 1.989-.228 3.692.368 5.086 1.786.16.163.228.246.296.248.072 0 .145-.087.325-.266z" fill="#d92534" />
                        </svg>
                      </button>
                    </div>

                    {/* Info Produk */}
                    <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                          {prod.brand || 'D Store'}
                        </span>
                        <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 line-clamp-2 leading-snug">
                          {prod.name}
                        </h3>
                      </div>

                      <div className="pt-1">
                        <div className="font-bold text-xs sm:text-sm text-zinc-950">
                          {prod.price || 'Rp 15.000'}
                        </div>
                      </div>

                      {/* Tombol Pesan */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(prod);
                        }}
                        className="mt-1 w-full py-2 rounded-lg bg-black text-white hover:bg-zinc-800 text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Pesan</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Navigasi Bawah Mobile (5 Tab Zalora Style) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-zinc-200">
        <div className="flex h-14 items-center justify-around text-zinc-500 text-[10px]">
          {/* Tab 1: Beranda */}
          <Link
            href="/store"
            className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 cursor-pointer hover:text-black"
          >
            <Home className="w-5 h-5 text-zinc-600" />
            <span>Beranda</span>
          </Link>

          {/* Tab 2: Kategori */}
          <button
            type="button"
            onClick={() => setIsCategoriesOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 cursor-pointer hover:text-black"
          >
            <SlidersHorizontal className="w-5 h-5 text-zinc-600" />
            <span>Kategori</span>
          </button>

          {/* Tab 3: Tas */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 cursor-pointer hover:text-black relative"
          >
            <ShoppingBag className="w-5 h-5 text-zinc-600" />
            {cart.length > 0 && (
              <span className="absolute top-1.5 right-6 bg-black text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {cart.reduce((s, it) => s + (it.quantity || 1), 0)}
              </span>
            )}
            <span>Tas</span>
          </button>

          {/* Tab 4: Wishlist (Aktif) */}
          <Link
            href="/store/wishlist"
            className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 cursor-pointer text-rose-600 font-semibold relative"
          >
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.308 8.335c1.68-1.666 3.691-2.219 5.9-1.571 2.168.635 3.57 2.147 4.13 4.394.058.229.082.409.122.802l.012.127.028.279c-.039 1.496-.545 2.874-1.502 4.4-1.454 2.318-3.335 4.298-6.147 6.683-.362.306-.666.549-1.317 1.058l-.031.025c-.454.356-.665.522-.916.727-.375.305-.767.329-1.162.027-3.318-2.532-5.666-4.724-7.574-7.255-1.107-1.467-1.826-2.832-2.196-4.323-.805-3.25 1.625-6.761 4.946-7.141 1.989-.228 3.692.368 5.086 1.786.16.163.228.246.296.248.072 0 .145-.087.325-.266z" fill="#d92534" />
            </svg>
            <span>Wishlist</span>
          </Link>

          {/* Tab 5: Akun */}
          <button
            type="button"
            onClick={() => setIsAccountOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 cursor-pointer hover:text-black"
          >
            {user ? (
              <UserAvatar user={user} size={20} />
            ) : (
              <User className="w-5 h-5 text-zinc-600" />
            )}
            <span>{user ? (user.name ? user.name.split(' ')[0] : 'Akun') : 'Akun'}</span>
          </button>
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
        wishlistCount={wishlist.length}
        onOpenWishlist={() => {
          setIsAccountOpen(false);
        }}
      />
    </div>
  );
}
