'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  MessageCircle, 
  ShoppingBag, 
  Heart, 
  Settings, 
  Zap, 
  ExternalLink,
  ChevronRight,
  LogOut,
  Mail,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  Package,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import UserAvatar from '@/app/components/UserAvatar';

// Google 'G' official SVG icon
function GoogleLogoSvg({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );
}

export default function AccountModal({ 
  isOpen, 
  onClose, 
  user = null,
  onLoginWithGoogle,
  onLogout,
  onUpdatePhone,
  cartCount = 0, 
  wishlistCount = 0, 
  onOpenCart, 
  onOpenWishlist 
}) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showFastLoginDialog, setShowFastLoginDialog] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [phoneSavedMessage, setPhoneSavedMessage] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [userOrders, setUserOrders] = useState(user?.orders || []);

  useEffect(() => {
    if (user?.orders) {
      setUserOrders(user.orders);
    }
  }, [user?.orders]);

  useEffect(() => {
    if (user?.email && isOpen) {
      fetch(`/api/user/orders?email=${encodeURIComponent(user.email)}`)
        .then(r => r.json())
        .then(data => {
          if (data?.ok && Array.isArray(data.orders)) {
            setUserOrders(data.orders);
          }
        })
        .catch(err => console.warn('Gagal memuat pesanan:', err));
    }
  }, [user?.email, isOpen]);

  useEffect(() => {
    if (user?.phone) {
      setPhoneNumber(user.phone);
    }
  }, [user?.phone]);

  const googleBtnContainerRef = useRef(null);
  const [gisLoaded, setGisLoaded] = useState(false);
  const isPromptingRef = useRef(false);

  useEffect(() => {
    if (!isOpen || user) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let isMounted = true;

    const initGIS = () => {
      if (!isMounted) return;
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              isPromptingRef.current = false;
              if (response?.credential && onLoginWithGoogle) {
                setIsLoggingIn(true);
                try {
                  await onLoginWithGoogle({ credential: response.credential });
                } finally {
                  setIsLoggingIn(false);
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false
          });

          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              theme: 'filled_black',
              size: 'large',
              type: 'standard',
              shape: 'pill',
              text: 'continue_with',
              logo_alignment: 'left',
              width: 320,
              locale: 'id'
            });
          }
          setGisLoaded(true);
        } catch (err) {
          console.warn('[GIS Init Error]', err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGIS();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          initGIS();
        }
      }, 300);
      return () => {
        isMounted = false;
        clearInterval(timer);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, user, onLoginWithGoogle]);

  if (!isOpen) return null;

  // Inisialisasi Google One-Tap / GIS jika Client ID tersedia
  const handleGoogleButtonClick = async () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (googleClientId && typeof window !== 'undefined' && window.google?.accounts?.id) {
      if (isPromptingRef.current) return;
      isPromptingRef.current = true;
      try {
        setIsLoggingIn(true);
        window.google.accounts.id.prompt((notification) => {
          isPromptingRef.current = false;
          setIsLoggingIn(false);
        });
        return;
      } catch (err) {
        isPromptingRef.current = false;
        setIsLoggingIn(false);
        console.warn('GIS prompt error:', err);
      }
    }

    setShowFastLoginDialog(true);
  };

  // Submit login akun Google
  const handleDoGoogleLogin = async (emailToUse, nameToUse) => {
    if (!emailToUse) return;
    setIsLoggingIn(true);
    try {
      const googleProfile = {
        email: emailToUse.toLowerCase().trim(),
        name: nameToUse ? nameToUse.trim() : emailToUse.split('@')[0],
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameToUse || emailToUse)}&backgroundColor=0284c7,2563eb,4f46e5`,
        sub: `google_user_${Date.now()}`
      };

      if (onLoginWithGoogle) {
        await onLoginWithGoogle({ profile: googleProfile });
      }
      setShowFastLoginDialog(false);
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Simpan nomor WhatsApp
  const handleSavePhone = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setIsSavingPhone(true);
    try {
      if (onUpdatePhone) {
        await onUpdatePhone(phoneNumber);
      }
      setPhoneSavedMessage(true);
      setTimeout(() => setPhoneSavedMessage(false), 3000);
    } catch (err) {
      console.error('Update phone error:', err);
    } finally {
      setIsSavingPhone(false);
    }
  };

  // WhatsApp CS dengan data akun terisi otomatis
  const handleWhatsAppCS = (keterangan) => {
    let text = `Halo Admin D Store, saya ${user ? user.name : 'Pelanggan D Store'}`;
    if (user) {
      text += ` (Email: ${user.email}, ID Member: ${user.memberId || '-'})`;
    }
    text += `.\n\n${keterangan}`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/6281230112240?text=${encoded}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 font-sans"
      onClick={onClose}
    >
      <div 
        className="bg-white text-zinc-900 rounded-t-2xl sm:rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 animate-in slide-in-from-bottom duration-250 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal - Minimalis, Bersih & Elegan Monokrom */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-xs">
              <User className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-950 tracking-tight">
                {user ? 'Profil Akun D Store' : 'Akun D Store'}
              </h2>
              <p className="text-[11px] text-zinc-500">
                {user ? user.email : 'Masuk akun resmi untuk aktivasi & riwayat lisensi'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">

          {/* =========================================================
              KONDISI A: PENGGUNA SUDAH LOGIN DENGAN GOOGLE
          ========================================================= */}
          {user ? (
            <>
              {/* Member Profile Card - Matte Black Monokrom Elegan */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 text-white shadow-xl relative overflow-hidden border border-zinc-900">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    <UserAvatar 
                      user={user} 
                      size={46} 
                      showGoogleBadge={true} 
                      badgeSize={15} 
                    />

                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                        {user.name}
                      </h3>
                      <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-zinc-500" />
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <span className="bg-white text-zinc-950 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0 shadow-xs">
                    {user.tier || 'MEMBER VIP'}
                  </span>
                </div>

                {/* ID Member & Status */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">ID Pelanggan Resmi:</span>
                    <span className="font-mono font-bold text-zinc-200">
                      {user.memberId || 'DST-72819'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Status Akun:</span>
                    <span className="font-semibold text-zinc-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-white" /> Terverifikasi
                    </span>
                  </div>
                </div>

                {/* Saldo Poin Reward */}
                <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs bg-zinc-900/60 rounded-xl px-3 py-2 border border-zinc-800">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <Award className="w-4 h-4 text-white" />
                    <span>D-Reward Points:</span>
                  </div>
                  <span className="font-bold text-white text-sm">
                    {user.points || 500} Poin
                  </span>
                </div>
              </div>

              {/* Form Nomor WhatsApp Pembeli */}
              <div className="p-3.5 rounded-xl border border-zinc-200/90 bg-white shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    Nomor WhatsApp Penerima Lisensi
                  </span>
                  {phoneSavedMessage && (
                    <span className="text-[11px] font-bold text-zinc-900 flex items-center gap-1 animate-in fade-in">
                      <CheckCircle2 className="w-3 h-3 text-zinc-950" /> Tersimpan
                    </span>
                  )}
                </div>
                <form onSubmit={handleSavePhone} className="flex gap-2">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="flex-1 bg-zinc-50 text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:border-zinc-950 focus:bg-white outline-none transition text-zinc-900"
                  />
                  <button
                    type="submit"
                    disabled={isSavingPhone || phoneNumber === user.phone}
                    className="px-3.5 py-2 bg-zinc-950 hover:bg-zinc-900 disabled:bg-zinc-200 disabled:text-zinc-400 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                  >
                    {isSavingPhone ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </form>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Nomor ini digunakan untuk pengiriman kredensial akun dan notifikasi otomatis.
                </p>
              </div>

              {/* Riwayat Pesanan & Langganan Aktif Pembeli */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-zinc-600" />
                    Pesanan &amp; Langganan Saya ({userOrders.length})
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Tersambung Catatan Toko
                  </span>
                </div>

                {userOrders.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 text-center space-y-1">
                    <p className="text-xs font-semibold text-zinc-700">Belum ada pesanan aktif</p>
                    <p className="text-[11px] text-zinc-400">
                      Aplikasi yang Anda beli akan otomatis tercatat di sini beserta waktu pembelian dan masa aktifnya.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 no-scrollbar">
                    {userOrders.map((ord, idx) => {
                      const orderTime = ord.orderTime || ord.date || 'Waktu tercatat';
                      const itemsList = Array.isArray(ord.items) && ord.items.length > 0 
                        ? ord.items 
                        : [{ name: ord.title || 'Aplikasi D Store', quantity: 1, price: ord.totalAmount || 0 }];
                      
                      return (
                        <div 
                          key={ord.id || idx}
                          className="p-3.5 rounded-xl border border-zinc-200/90 bg-white hover:border-zinc-300 transition shadow-xs space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-[10px] font-bold bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200">
                                  {ord.id || `ORD-${idx + 1}`}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  {ord.status || 'Aktif'}
                                </span>
                              </div>
                              <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-1 font-medium">
                                <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                                <span>Waktu Beli: <strong className="text-zinc-700">{orderTime}</strong></span>
                              </div>
                            </div>
                          </div>

                          {/* List Produk & Garansi Sesuai Durasi Pesanan */}
                          <div className="space-y-2">
                            {itemsList.map((it, iIdx) => {
                              const duration = it.durationDays || it.warrantyDays || ord.durationDays || 30;
                              const expDateStr = it.expiredAt || it.warrantyExpiredAt || ord.expiredAt;
                              const expDate = expDateStr ? new Date(expDateStr) : null;
                              const now = new Date();
                              const diffMs = expDate ? (expDate.getTime() - now.getTime()) : -1;
                              const isWarrantyActive = diffMs > 0;
                              const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                              const remainingHours = Math.ceil(diffMs / (1000 * 60 * 60));
                              const expDateFormatted = expDate 
                                ? expDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                : '-';

                              return (
                                <div key={iIdx} className="bg-zinc-50/90 rounded-xl p-3 border border-zinc-200/80 space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <div className="font-bold text-xs sm:text-sm text-zinc-900 truncate">
                                        {it.name}
                                      </div>
                                      {it.variantName && (
                                        <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                                          Paket: {it.variantName}
                                        </div>
                                      )}
                                      <div className="text-xs font-semibold text-zinc-800 mt-0.5">
                                        Rp {Number(it.price || 0).toLocaleString('id-ID')} {it.quantity > 1 ? `x${it.quantity}` : ''}
                                      </div>
                                    </div>

                                    {/* Tombol Ajukan Garansi Selama Masa Aktif Masih Berlaku */}
                                    <div className="shrink-0">
                                      {isWarrantyActive ? (
                                        <button
                                          type="button"
                                          onClick={() => handleWhatsAppCS(
                                            `Halo Admin D Store, saya ingin klaim garansi untuk pesanan saya:\n- ID Pesanan: ${ord.id}\n- Produk: ${it.name} (${it.variantName || 'Standar'})\n- Durasi Garansi: ${duration} Hari (Aktif s/d ${expDateFormatted})\n- Waktu Beli: ${orderTime}\n\nKendala akun yang dialami:\n[Tuliskan kendala akun di sini agar dapat dibantu reset/ganti oleh Admin]`
                                          )}
                                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                                        >
                                          <ShieldCheck className="w-3.5 h-3.5" />
                                          <span>Ajukan Garansi</span>
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleWhatsAppCS(
                                            `Halo Admin D Store, masa garansi pesanan ${ord.id} (${it.name}) saya telah selesai pada ${expDateFormatted}. Saya ingin membeli / memperpanjang kembali paket ini:`
                                          )}
                                          className="px-2.5 py-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                                        >
                                          <RefreshCw className="w-3 h-3 text-zinc-600" />
                                          <span>Beli / Perpanjang</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Info Status Garansi Sesuai Durasi Paket */}
                                  <div className="pt-1.5 border-t border-zinc-200/60 flex items-center justify-between gap-1 flex-wrap text-[10px]">
                                    {isWarrantyActive ? (
                                      <div className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                        <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                                        <span>Garansi {duration} Hari Aktif: Sisa {remainingHours <= 24 ? `${remainingHours} Jam` : `${remainingDays} Hari`}</span>
                                      </div>
                                    ) : (
                                      <div className="inline-flex items-center gap-1 font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
                                        <AlertCircle className="w-3 h-3 text-zinc-400 shrink-0" />
                                        <span>Masa Garansi {duration} Hari Berakhir</span>
                                      </div>
                                    )}

                                    <span className="text-zinc-500">
                                      Berakhir: <strong>{expDateFormatted}</strong>
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {ord.totalAmount > 0 && (
                            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-100">
                              <span className="text-zinc-500">Total Pembayaran</span>
                              <span className="font-extrabold text-zinc-950">
                                Rp {Number(ord.totalAmount).toLocaleString('id-ID')}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status Garansi & Layanan Pelanggan */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                  Pusat Bantuan &amp; Garansi Akun
                </div>

                {/* Klaim Garansi Akun */}
                <button
                  type="button"
                  onClick={() => handleWhatsAppCS('Saya ingin mengajukan klaim garansi atau reset akses akun:')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200/90 bg-white hover:bg-zinc-50 hover:border-zinc-950 transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:bg-zinc-900 transition">
                      <ShieldCheck className="w-4 h-4 stroke-[1.9]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-950 transition">
                        Klaim Garansi &amp; Bantuan Akun
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        Proses penggantian atau perpanjangan akun resmi
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 transition" />
                </button>

                {/* Chat CS WhatsApp Langsung */}
                <button
                  type="button"
                  onClick={() => handleWhatsAppCS('Saya butuh bantuan / tanya ketersediaan stok aplikasi:')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200/90 bg-white hover:bg-zinc-50 hover:border-zinc-950 transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:bg-zinc-900 transition">
                      <MessageCircle className="w-4 h-4 stroke-[1.9]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-950 transition">
                        Hubungi Customer Service WhatsApp
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        Layanan responsif 24 jam dengan email Anda terlampir
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 transition" />
                </button>

                {/* Tas Belanja */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenCart) onOpenCart();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200/90 bg-white hover:bg-zinc-50 hover:border-zinc-950 transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:bg-zinc-900 transition">
                      <ShoppingBag className="w-4 h-4 stroke-[1.9]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-950 transition">
                        Tas Belanja ({cartCount} item)
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        Periksa item yang siap diproses
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-md">
                    Lihat
                  </span>
                </button>

                {/* Wishlist */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenWishlist) onOpenWishlist();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200/90 bg-white hover:bg-zinc-50 hover:border-zinc-950 transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:bg-zinc-900 transition">
                      <Heart className="w-4 h-4 stroke-[1.9]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-950 transition">
                        Wishlist Saya ({wishlistCount} item)
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        Daftar aplikasi yang disimpan
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-md">
                    Buka
                  </span>
                </button>

                {/* Program Reseller & Kulakan */}
                <button
                  type="button"
                  onClick={() => handleWhatsAppCS('Saya berminat bergabung menjadi Reseller D Store:')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200/90 bg-white hover:bg-zinc-50 hover:border-zinc-950 transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:bg-zinc-900 transition">
                      <Zap className="w-4 h-4 stroke-[1.9]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-950 transition">
                        Gabung Reseller &amp; Harga Grosir
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        Harga modal termurah untuk dijual kembali
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 transition" />
                </button>
              </div>

              {/* D-Workspace Admin Area (HANYA MUNCUL UNTUK EMAIL PEMILIK TOKO) */}
              {user?.email?.toLowerCase().trim() === 'ivankafipradana@gmail.com' && (
                <div className="pt-2 border-t border-zinc-100">
                  <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider px-1 mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    Panel Khusus Pemilik Toko (Admin)
                  </div>
                  <Link
                    href="/d-workspace"
                    onClick={onClose}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white hover:bg-black transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-400">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold">
                          Buka D-Workspace (Owner Admin)
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          Buku Catatan, Toko Kulakan, Editor Toko
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-zinc-400" />
                  </Link>
                </div>
              )}

              {/* Tombol Logout Akun Google */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (onLogout) await onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100/80 text-red-700 text-xs font-bold transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar dari Akun Google
                </button>
              </div>
            </>
          ) : (
            /* =========================================================
                KONDISI B: PENGGUNA BELUM LOGIN (LANGSUNG SATU KLIK GOOGLE)
            ========================================================= */
            <div className="py-4 space-y-5 text-center">
              <div className="max-w-[280px] mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-zinc-950">Masuk Akun D Store</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Pilih akun Google Anda untuk aktivasi instan &amp; pantau riwayat garansi aplikasi.
                </p>
              </div>

              {/* Tombol Utama: Langsung Buka Pilihan Akun Google di Perangkat */}
              <div className="flex flex-col items-center justify-center w-full pt-1">
                <a
                  href={`/api/auth/google?returnTo=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/store')}`}
                  className="w-full max-w-[320px] flex items-center justify-center gap-3 py-3 px-5 rounded-full bg-zinc-950 hover:bg-zinc-900 active:scale-[0.98] text-white font-semibold text-xs shadow-md transition cursor-pointer no-underline"
                >
                  <GoogleLogoSvg className="w-4 h-4 shrink-0" />
                  <span>Lanjutkan dengan Google</span>
                </a>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Otorisasi Resmi &bull; Aman &amp; Terenkripsi</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer Modal */}
        <div className="px-5 py-3 border-t border-zinc-100 bg-white flex items-center justify-between text-[11px] text-zinc-400">
          <span>D Store Official • Akun Terverifikasi</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-zinc-800 hover:text-black transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
