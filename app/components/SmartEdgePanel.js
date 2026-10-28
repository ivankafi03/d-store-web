'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, MessageCircle, ShieldCheck, Zap } from 'lucide-react';

function WhatsAppLogo({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path 
        fill="#25D366" 
        d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z" 
      />
      <path 
        fill="#FFFFFF" 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M17.47 14.38C17.18 14.23 15.72 13.51 15.45 13.41C15.18 13.31 14.98 13.26 14.78 13.56C14.58 13.86 14.01 14.53 13.84 14.73C13.67 14.93 13.5 14.95 13.2 14.8C12.9 14.65 11.94 14.34 10.8 13.33C9.92 12.54 9.32 11.57 9.15 11.27C8.98 10.97 9.13 10.81 9.28 10.66C9.41 10.53 9.57 10.32 9.72 10.15C9.87 9.97 9.92 9.85 10.02 9.65C10.12 9.45 10.07 9.28 10 9.13C9.92 8.98 9.25 7.37 9.01 6.77C8.77 6.19 8.52 6.27 8.34 6.26C8.17 6.25 7.97 6.25 7.77 6.25C7.57 6.25 7.25 6.32 6.98 6.62C6.71 6.92 5.94 7.64 5.94 9.1C5.94 10.56 7.01 11.97 7.16 12.17C7.31 12.37 9.25 15.38 12.23 16.67C12.94 16.98 13.49 17.16 13.92 17.3C14.63 17.53 15.28 17.49 15.79 17.42C16.36 17.33 17.55 16.7 17.8 16.01C18.05 15.31 18.05 14.72 17.97 14.59C17.9 14.47 17.7 14.39 17.47 14.38Z" 
      />
    </svg>
  );
}

export default function SmartEdgePanel({ 
  isOpen: propIsOpen, 
  onToggle: propOnToggle,
  waNumber = '6281230112240',
  groupUrl = 'https://chat.whatsapp.com/EABjpw4T4om1z4pM5RMLcf'
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOpen = propIsOpen !== undefined ? propIsOpen : internalOpen;
  const setIsOpen = (val) => {
    if (propOnToggle) {
      propOnToggle(val);
    } else {
      setInternalOpen(val);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(groupUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Kunci scroll body dan cegah layar memantul/naik saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isOpen]);

  // Tutup panel ketika menekan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* === HANDLE MELAYANG DI TEPI LAYAR (AUTHENTIC IPHONE LIQUID GLASS) === */}
      {!isOpen && (
        <aside
          role="complementary"
          aria-label="Panel Pintar WhatsApp"
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 cursor-pointer select-none group"
        >
          <div 
            className="flex items-center justify-center pl-2.5 pr-2 py-3 rounded-l-2xl border-l border-t border-b border-white/70 shadow-lg hover:pl-3.5 transition-all duration-200 active:scale-95"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.35)',
              backdropFilter: 'blur(25px) saturate(190%)',
              WebkitBackdropFilter: 'blur(25px) saturate(190%)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.9)'
            }}
          >
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative">
                <WhatsAppLogo className="w-6 h-6 drop-shadow-xs group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white" />
                </span>
              </div>
              <div className="w-1 h-3 bg-zinc-400/80 rounded-full group-hover:bg-zinc-600 transition-colors" />
            </div>
          </div>
        </aside>
      )}

      {/* === BACKDROP OVERLAY LEMBUT & CEGAH TOUCH SCROLL (DI ATAS SEMUA ELEMEN TERMASUK BOTTOM NAV) === */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] transition-opacity animate-in fade-in duration-200 touch-none overscroll-none"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)'
          }}
          onClick={() => setIsOpen(false)}
          onTouchMove={(e) => e.preventDefault()}
        />
      )}

      {/* === PANEL PINTAR IPHONE LIQUID FROSTED GLASS ASLI === */}
      <div
        className={`fixed right-2 sm:right-5 top-1/2 -translate-y-1/2 z-[105] w-[315px] sm:w-[360px] max-w-[94vw] max-h-[85dvh] text-zinc-900 rounded-3xl overflow-hidden flex flex-col font-sans transition-all duration-200 ease-out border border-white/60 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.38)',
          backdropFilter: 'blur(35px) saturate(200%)',
          WebkitBackdropFilter: 'blur(35px) saturate(200%)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.85), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panel Header */}
        <div 
          className="px-4 py-3.5 border-b border-white/40 flex items-center justify-between"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
        >
          <div className="flex items-center gap-2.5">
            <WhatsAppLogo className="w-7 h-7 drop-shadow-xs" />
            <div>
              <div className="text-xs font-bold text-zinc-950 leading-tight">
                Panel Pintar
              </div>
              <div className="text-[10px] text-zinc-600 font-medium">
                Komunitas &amp; CS
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-full text-zinc-600 hover:text-zinc-950 border border-white/70 shadow-2xs flex items-center justify-center transition cursor-pointer"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(10px)'
            }}
            aria-label="Tutup Panel Pintar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Panel Body (Scrollable dengan overscroll-contain) */}
        <div 
          className="p-3.5 flex-1 overflow-y-auto space-y-3 no-scrollbar overscroll-contain touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
        >

          {/* Card 1: Grup WhatsApp Resmi (Glass Card) */}
          <div 
            className="rounded-2xl p-3.5 border border-white/60 space-y-2.5"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.32)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.7)'
            }}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <WhatsAppLogo className="w-4 h-4" />
                <h4 className="text-xs font-bold text-zinc-950">
                  Grup WhatsApp Resmi
                </h4>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Dapatkan info restock akun kilat, drop lisensi digital, dan promo flash harian sebelum kuota habis.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/25 text-[10px] font-semibold">
                <Zap className="w-3 h-3 text-emerald-600" />
                <span>Restock Cepat</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/40 text-zinc-700 border border-white/60 text-[10px] font-semibold">
                <ShieldCheck className="w-3 h-3 text-zinc-600" />
                <span>Garansi Resmi</span>
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <a
                href={groupUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-zinc-950 hover:bg-black active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
              >
                <WhatsAppLogo className="w-3.5 h-3.5" />
                <span>Gabung Grup WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2 px-3 rounded-xl active:scale-98 text-zinc-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-white/80 shadow-2xs cursor-pointer"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.55)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{copied ? 'Tautan Grup Tersalin' : 'Salin Tautan Undangan'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Customer Support (Glass Card) */}
          <div 
            className="rounded-2xl p-3.5 border border-white/60 space-y-2"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.32)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.7)'
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-zinc-950">Customer Support</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/25 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online</span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              Ada kendala, ingin tanya stok tertentu, atau transaksi custom? Hubungi admin langsung via WhatsApp.
            </p>
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Admin D Store, saya ingin tanya katalog produk.')}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 px-3 rounded-xl active:scale-98 text-zinc-900 text-xs font-semibold flex items-center justify-center gap-2 transition border border-white/80 shadow-2xs cursor-pointer"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.55)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chat Admin WhatsApp</span>
            </a>
          </div>

          {/* Section 3: Catatan Keterlambatan Update */}
          <div 
            className="px-3 py-2 rounded-xl border border-white/50 text-[10px] text-zinc-600 leading-relaxed"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
          >
            <span className="font-semibold text-zinc-800">Catatan:</span> Produk dan varian bisa saja kosong karena keterlambatan update stok sistem.
          </div>

        </div>

        {/* Panel Footer */}
        <div 
          className="py-2.5 px-4 border-t border-white/40 text-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <span className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">
            D STORE OFFICIAL &bull; LISENSI RESMI BERGARANSI
          </span>
        </div>
      </div>
    </>
  );
}
