'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, MessageCircle, ShieldCheck, Zap, ChevronLeft } from 'lucide-react';

function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
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
      {/* === HANDLE PANEL PINTAR (EDGE HANDLE SEPERTI HP SAMSUNG / INFINIX) === */}
      {!isOpen && (
        <aside
          role="complementary"
          aria-label="Panel Pintar D Store"
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 group cursor-pointer select-none"
        >
          <div className="flex items-center">
            {/* Grip Handle */}
            <div className="w-8 sm:w-9 h-20 bg-zinc-950/90 hover:bg-black text-white border-l border-t border-b border-zinc-700/80 rounded-l-xl flex flex-col items-center justify-center gap-1.5 shadow-2xl backdrop-blur-md transition-all duration-200 group-hover:w-10 group-hover:border-emerald-500/60 active:scale-95">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <WhatsAppIcon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div className="w-1 h-3 bg-zinc-600 rounded-full group-hover:bg-zinc-400 transition-colors" />
            </div>
          </div>
        </aside>
      )}

      {/* === BACKDROP OVERLAY === */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* === PANEL PINTAR FLOATING BODY (EDGE SLIDEOUT) === */}
      <div
        className={`fixed right-0 top-4 bottom-4 sm:top-6 sm:bottom-6 z-50 w-[310px] sm:w-[350px] max-w-[92vw] bg-zinc-950 text-white border-l border-y border-zinc-800/90 rounded-l-2xl shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-out font-sans ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Ambient Effect */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Panel Header */}
        <div className="p-4 pb-3 border-b border-zinc-800/80 flex items-center justify-between relative z-10 bg-zinc-950/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Panel Pintar
            </span>
            <span className="text-xs font-bold text-zinc-300">Komunitas &amp; CS</span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Tutup Panel Pintar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Panel Body (Scrollable) */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3.5 relative z-10 no-scrollbar">

          {/* Card Utama: Grup WhatsApp Komunitas */}
          <div className="rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-3.5 space-y-3 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white tracking-tight">
                    Grup WhatsApp Resmi
                  </h4>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Dapatkan info restock akun kilat, drop lisensi digital, dan promo flash harian sebelum kuota habis.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-zinc-400 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/60">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Restock Cepat</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Garansi Resmi</span>
              </div>
            </div>

            <div className="space-y-2 pt-0.5">
              <a
                href={groupUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-zinc-950" />
                <span>Gabung Grup WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700/80 active:scale-98 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-zinc-700/80 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{copied ? 'Tautan Grup Tersalin' : 'Salin Tautan Undangan'}</span>
              </button>
            </div>
          </div>

          {/* Card Kontak Admin WhatsApp */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-200">Customer Support</span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Ada kendala, ingin tanya stok tertentu, atau transaksi custom? Hubungi admin langsung via WhatsApp.
            </p>
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Admin D Store, saya ingin tanya katalog produk.')}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition border border-zinc-700 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chat Admin WhatsApp</span>
            </a>
          </div>

          {/* Info Keterlambatan Update */}
          <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 text-[10px] text-zinc-400 leading-relaxed">
            <span className="font-semibold text-zinc-300">Catatan:</span> Produk dan varian bisa saja kosong karena keterlambatan update stok sistem.
          </div>

        </div>

        {/* Panel Footer */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/80 text-center relative z-10">
          <span className="text-[10px] text-zinc-500 font-medium">
            D STORE OFFICIAL &bull; LISENSI RESMI BERGARANSI
          </span>
        </div>
      </div>
    </>
  );
}
