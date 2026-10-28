'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, MessageCircle, ShieldCheck, Zap } from 'lucide-react';

function WhatsAppLogo({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#25D366" />
      <path 
        d="M17.5 14.4c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.47-.88-.79-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.59-.49-.51-.67-.52-.18 0-.37 0-.57 0-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.7.3 1.26.48 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.58-.35Z" 
        fill="#FFFFFF" 
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
      {/* === HANDLE MELAYANG DI TEPI LAYAR (IPHONE FROSTED GLASS & LOGO WHATSAPP) === */}
      {!isOpen && (
        <aside
          role="complementary"
          aria-label="Panel Pintar WhatsApp"
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 cursor-pointer select-none group"
        >
          <div className="flex items-center justify-center pl-2.5 pr-2 py-3 rounded-l-2xl bg-white/70 hover:bg-white/85 backdrop-blur-xl border-l border-t border-b border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:pl-3.5 transition-all duration-200 active:scale-95">
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

      {/* === BACKDROP OVERLAY DENGAN BLUR OPTIK === */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/35 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* === PANEL PINTAR DENGAN TEMA IPHONE LIQUID FROSTED GLASS ASLI === */}
      <div
        className={`fixed right-2 sm:right-5 top-1/2 -translate-y-1/2 z-50 w-[315px] sm:w-[360px] max-w-[94vw] max-h-[90vh] bg-white/75 backdrop-blur-2xl border border-white/80 text-zinc-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col font-sans transition-all duration-200 ease-out ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panel Header */}
        <div className="px-4 py-3.5 border-b border-white/60 flex items-center justify-between bg-white/40 backdrop-blur-sm">
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
            className="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-zinc-600 hover:text-zinc-950 border border-white/60 shadow-2xs flex items-center justify-center transition cursor-pointer"
            aria-label="Tutup Panel Pintar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Panel Body (Scrollable) */}
        <div className="p-3.5 flex-1 overflow-y-auto space-y-3 no-scrollbar">

          {/* Card 1: Grup WhatsApp Resmi */}
          <div className="rounded-2xl p-3.5 bg-white/60 backdrop-blur-md border border-white/80 shadow-xs space-y-2.5">
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
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50/90 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                <Zap className="w-3 h-3 text-emerald-600" />
                <span>Restock Cepat</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/80 text-zinc-700 border border-zinc-200/80 text-[10px] font-semibold">
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
                className="w-full py-2 px-3 rounded-xl bg-white/90 hover:bg-white active:scale-98 text-zinc-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-white/90 shadow-2xs cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{copied ? 'Tautan Grup Tersalin' : 'Salin Tautan Undangan'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Customer Support */}
          <div className="rounded-2xl p-3.5 bg-white/60 backdrop-blur-md border border-white/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-zinc-950">Customer Support</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50/90 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
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
              className="w-full py-2 px-3 rounded-xl bg-white/90 hover:bg-white active:scale-98 text-zinc-900 text-xs font-semibold flex items-center justify-center gap-2 transition border border-white/90 shadow-2xs cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chat Admin WhatsApp</span>
            </a>
          </div>

          {/* Section 3: Catatan Keterlambatan Update */}
          <div className="px-3 py-2 rounded-xl bg-white/50 backdrop-blur-sm border border-white/70 text-[10px] text-zinc-600 leading-relaxed">
            <span className="font-semibold text-zinc-800">Catatan:</span> Produk dan varian bisa saja kosong karena keterlambatan update stok sistem.
          </div>

        </div>

        {/* Panel Footer */}
        <div className="py-2.5 px-4 border-t border-white/60 bg-white/40 text-center">
          <span className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">
            D STORE OFFICIAL &bull; LISENSI RESMI BERGARANSI
          </span>
        </div>
      </div>
    </>
  );
}
