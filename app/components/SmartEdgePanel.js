'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, MessageCircle, ShieldCheck, Zap } from 'lucide-react';

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
      {/* === HANDLE MELAYANG PERSIS SEPERTI IPHONE (ASSISTIVETOUCH / EDGE GLASS) DENGAN LOGO === */}
      {!isOpen && (
        <aside
          role="complementary"
          aria-label="Panel Pintar D Store"
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 cursor-pointer select-none group"
        >
          <div className="flex items-center justify-center pl-2 pr-1.5 py-2.5 rounded-l-2xl bg-white/95 backdrop-blur-md border-l border-t border-b border-zinc-200/90 shadow-xl shadow-black/5 hover:pl-3 hover:bg-white transition-all duration-200 active:scale-95">
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative">
                <img 
                  src="/icon-192.png" 
                  alt="Logo D Store" 
                  className="w-6 h-6 rounded-lg object-cover shadow-2xs border border-zinc-200/80 group-hover:scale-105 transition-transform" 
                />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white" />
                </span>
              </div>
              <div className="w-1 h-3 bg-zinc-300 rounded-full group-hover:bg-zinc-500 transition-colors" />
            </div>
          </div>
        </aside>
      )}

      {/* === BACKDROP OVERLAY LEMBUT === */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* === PANEL PINTAR IPHONE GLASS CARD === */}
      <div
        className={`fixed right-2 sm:right-5 top-1/2 -translate-y-1/2 z-50 w-[315px] sm:w-[360px] max-w-[94vw] max-h-[90vh] bg-white/95 backdrop-blur-md border border-zinc-200/90 text-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans transition-all duration-200 ease-out ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panel Header */}
        <div className="px-4 py-3.5 border-b border-zinc-100 flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-2.5">
            <img 
              src="/icon-192.png" 
              alt="Logo" 
              className="w-7 h-7 rounded-xl object-cover border border-zinc-200/80 shadow-2xs" 
            />
            <div>
              <div className="text-xs font-bold text-zinc-950 leading-tight">
                Panel Pintar
              </div>
              <div className="text-[10px] text-zinc-500 font-medium">
                Komunitas &amp; CS
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition cursor-pointer"
            aria-label="Tutup Panel Pintar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Panel Body (Scrollable) */}
        <div className="p-3.5 flex-1 overflow-y-auto space-y-3 no-scrollbar">

          {/* Card 1: Grup WhatsApp Resmi */}
          <div className="rounded-2xl p-3.5 bg-zinc-50/90 border border-zinc-200/80 space-y-2.5">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-zinc-950">
                  Grup WhatsApp Resmi
                </h4>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Dapatkan info restock akun kilat, drop lisensi digital, dan promo flash harian sebelum kuota habis.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold">
                <Zap className="w-3 h-3 text-emerald-600" />
                <span>Restock Cepat</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 text-[10px] font-semibold">
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
                <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gabung Grup WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-zinc-100 active:scale-98 text-zinc-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-zinc-200 shadow-2xs cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{copied ? 'Tautan Grup Tersalin' : 'Salin Tautan Undangan'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Customer Support */}
          <div className="rounded-2xl p-3.5 bg-zinc-50/90 border border-zinc-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-zinc-950">Customer Support</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold">
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
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-zinc-100 active:scale-98 text-zinc-900 text-xs font-semibold flex items-center justify-center gap-2 transition border border-zinc-200 shadow-2xs cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chat Admin WhatsApp</span>
            </a>
          </div>

          {/* Section 3: Catatan Keterlambatan Update */}
          <div className="px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200/80 text-[10px] text-zinc-500 leading-relaxed">
            <span className="font-semibold text-zinc-700">Catatan:</span> Produk dan varian bisa saja kosong karena keterlambatan update stok sistem.
          </div>

        </div>

        {/* Panel Footer */}
        <div className="py-2.5 px-4 border-t border-zinc-100 bg-white/60 text-center">
          <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">
            D STORE OFFICIAL &bull; LISENSI RESMI BERGARANSI
          </span>
        </div>
      </div>
    </>
  );
}
