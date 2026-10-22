'use client';

import Link from 'next/link';
import { Sliders, Plus, RotateCcw, ExternalLink, Eye, Edit3, RefreshCw } from 'lucide-react';

export default function AdminEditToolbar({
  isEditMode,
  setIsEditMode,
  onAddNewProduct,
  onResetData,
  onSyncToServer,
  isSyncing
}) {
  return (
    <div className="sticky top-0 z-[110] bg-zinc-950 text-white border-b border-zinc-800 py-2 px-3 sm:px-6 shadow-md transition-all font-sans">
      <div className="max-w-[1240px] mx-auto flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-2.5">
          <span className="bg-white text-zinc-950 text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
            ADMIN STORE
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                isEditMode
                  ? 'bg-blue-600 text-white ring-1 ring-blue-400'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {isEditMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isEditMode ? 'Mode Edit: AKTIF' : 'Mode Pratinjau Toko'}</span>
            </button>

            {isEditMode && (
              <span className="hidden md:inline text-[11px] text-zinc-400">
                Klik elemen apa pun di bawah untuk mengedit gambar, nama &amp; harga.
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 text-xs">
          {onSyncToServer && (
            <button
              type="button"
              onClick={onSyncToServer}
              disabled={isSyncing}
              className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
                isSyncing
                  ? 'bg-emerald-700 text-zinc-200 cursor-not-allowed opacity-80'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              title="Kirim semua editan ke server dan database agar langsung aktif di HP pembeli"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan ke Server & HP'}</span>
            </button>
          )}

          {isEditMode && (
            <>
              <button
                type="button"
                onClick={onAddNewProduct}
                className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-white font-medium flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Produk</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin mengembalikan semua data gambar dan produk ke bawaan awal?')) {
                    onResetData();
                  }
                }}
                className="px-2.5 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1 transition cursor-pointer"
                title="Reset Data ke Default"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </>
          )}

          <Link
            href="/store"
            target="_blank"
            className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1 transition"
            title="Buka halaman toko seperti yang dilihat pembeli"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">Toko Pembeli</span>
            <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
          </Link>

          <Link
            href="/d-workspace"
            className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1 transition"
          >
            <Sliders className="w-3 h-3" />
            <span>Kembali ke Workspace</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
