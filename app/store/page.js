'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { MessageCircle, ShieldCheck, Zap, QrCode } from 'lucide-react';

function HoldingContent() {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center relative overflow-hidden px-4 text-center select-none">
      
      {/* SVG Filter Ombak Air Halus "D STORE" (Persis Gaya Wave HOOSH Sesuai Gambar Referensi) */}
      <svg width="0" height="0" className="absolute pointer-events-none" style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="hoosh-wave" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.015 0.06" 
              numOctaves="1" 
              result="noise" 
              seed="5"
            >
              <animate 
                attributeName="baseFrequency" 
                dur="4s" 
                keyTimes="0; 0.5; 1" 
                values="0.012 0.055; 0.018 0.075; 0.012 0.055" 
                repeatCount="indefinite" 
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Ambient Glow Emas Lembut di Belakang Teks */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-amber-400/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="relative z-10 max-w-xl mx-auto space-y-6">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] font-mono tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Sistem Sedang Diperbarui</span>
        </div>

        {/* Teks D STORE Bergelombang Ombak Air - Font Putih Bersih Proporsional (Gaya HOOSH) */}
        <div className="py-2">
          <h1 
            style={{ filter: 'url(#hoosh-wave)', letterSpacing: '0.24em' }} 
            className="text-6xl sm:text-8xl md:text-9xl font-semibold uppercase text-white inline-block drop-shadow-[0_4px_24px_rgba(255,255,255,0.25)]"
          >
            D STORE
          </h1>
        </div>

        {/* Subtitle Elegan Berkelas di Bawah Teks */}
        <div className="space-y-3">
          <p className="text-zinc-300 text-xs sm:text-sm tracking-[0.25em] uppercase font-medium">
            Official Digital License &amp; Premium Account
          </p>

          <p className="text-zinc-500 text-xs leading-relaxed max-w-md mx-auto">
            Kami sedang memperbarui sistem tampilan web untuk pengalaman belanja terbaik. Pemesanan akun premium, lisensi resmi, dan klaim garansi tetap berjalan normal 24/7.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-zinc-400 text-[11px] pt-1">
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /> Proses 1-5 Menit</span>
            <span>•</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Garansi Resmi</span>
            <span>•</span>
            <span className="flex items-center gap-1"><QrCode className="w-3.5 h-3.5 text-sky-400" /> QRIS Semua Bank</span>
          </div>
        </div>

        {/* Tombol Kontak WhatsApp & Telegram */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://wa.me/6281230112240?text=Halo%20Admin%20D%20Store,%20saya%20ingin%20memesan%20akun%20premium"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-black hover:bg-zinc-200 font-bold text-xs tracking-wider uppercase transition shadow-[0_4px_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Pesan via WhatsApp (081230112240)</span>
          </a>

          <a
            href="https://t.me/dewipermata03"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-semibold text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Telegram (@dewipermata03)</span>
          </a>
        </div>

        {/* Footer Kecil */}
        <div className="pt-8 text-[11px] text-zinc-600">
          © 2026 D STORE OFFICIAL • Seluruh Hak Cipta Dilindungi
        </div>

      </div>

    </div>
  );
}

export default function StoreFront() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <HoldingContent />
    </Suspense>
  );
}
