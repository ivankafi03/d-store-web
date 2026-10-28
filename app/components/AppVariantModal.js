'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, Info } from 'lucide-react';

export default function AppVariantModal({ appData: propAppData, app, onClose, onAddToCart, onShowNotification }) {
  const appData = propAppData || app;
  const [selectedPackage, setSelectedPackage] = useState(
    appData?.packages?.find((p) => p.popular) || appData?.packages?.[0] || null
  );
  const [activeTab, setActiveTab] = useState('paket'); // 'paket' | 'fitur' | 'cara-pesan'
  const [copied, setCopied] = useState(false);

  if (!appData) return null;

  const formatRupiah = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

  const getWhatsAppOrderUrl = () => {
    const invoiceId = `DST-${Date.now().toString().slice(-6)}`;
    const pkgName = selectedPackage?.name || 'Paket Standar';
    const pkgDuration = selectedPackage?.duration || '30 Hari';
    const priceText = formatRupiah(selectedPackage?.price || 0);

    const message = 
      `Halo Admin D Store, saya ingin memesan lisensi resmi:\n\n` +
      `*RINCIAN PESANAN*\n` +
      `• Invoice : ${invoiceId}\n` +
      `• Layanan : ${appData.name}\n` +
      `• Paket   : ${pkgName}\n` +
      `• Durasi  : ${pkgDuration}\n` +
      `• Total   : ${priceText}\n\n` +
      `*METODE PEMBAYARAN*\n` +
      `• QRIS Otomatis / Transfer Bank\n\n` +
      `Mohon kirimkan QRIS dan instruksi pembayarannya. Terima kasih.`;

    return `https://wa.me/6281230112240?text=${encodeURIComponent(message)}`;
  };

  const copyOrderFormat = () => {
    const invoiceId = `DST-${Date.now().toString().slice(-6)}`;
    const text = 
      `*ORDER D STORE*\n` +
      `Invoice : ${invoiceId}\n` +
      `Layanan : ${appData.name}\n` +
      `Paket   : ${selectedPackage?.name || 'Paket Standar'}\n` +
      `Durasi  : ${selectedPackage?.duration || '30 Hari'}\n` +
      `Total   : ${formatRupiah(selectedPackage?.price || 0)}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    if (onShowNotification) onShowNotification('Format pesanan berhasil disalin');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white text-zinc-900 rounded-t-lg sm:rounded-lg max-w-lg w-full overflow-hidden shadow-xl relative max-h-[90vh] flex flex-col border border-zinc-200/90 animate-in slide-in-from-bottom duration-250 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* === HEADER === */}
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-start justify-between gap-4 bg-white">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              {appData.brand && appData.name && appData.brand.trim().toLowerCase() !== appData.name.trim().toLowerCase() && (
                <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500">
                  {appData.brand}
                </span>
              )}
              {appData.badge && (
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-800">
                  {appData.badge}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-950">
              {appData.name}
            </h2>
            <div className="text-xs text-zinc-500">
              <span>{appData.soldCount || '1.000+'} transaksi terverifikasi</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition cursor-pointer shrink-0 mt-0.5"
            aria-label="Tutup"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* === TAB NAVIGATION === */}
        <div className="flex items-center px-5 border-b border-zinc-100 text-xs sm:text-sm font-medium gap-5 bg-zinc-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('paket')}
            className={`py-2.5 transition relative cursor-pointer ${
              activeTab === 'paket' 
                ? 'text-zinc-950 font-semibold border-b-2 border-zinc-950' 
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Pilihan Paket
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fitur')}
            className={`py-2.5 transition relative cursor-pointer ${
              activeTab === 'fitur' 
                ? 'text-zinc-950 font-semibold border-b-2 border-zinc-950' 
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Fitur
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cara-pesan')}
            className={`py-2.5 transition relative cursor-pointer ${
              activeTab === 'cara-pesan' 
                ? 'text-zinc-950 font-semibold border-b-2 border-zinc-950' 
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Cara Pesan
          </button>
        </div>

        {/* === SCROLLABLE BODY === */}
        <div className="overflow-y-auto px-5 py-3.5 flex-1 space-y-3.5 no-scrollbar">

          {/* TAB 1: PAKET */}
          {activeTab === 'paket' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200/80 text-[11px] text-zinc-600">
                <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>Produk dan varian bisa saja kosong karena keterlambatan update.</span>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Pilih Durasi / Varian
                </div>

                <div className="space-y-1.5">
                  {appData.packages?.map((pkg) => {
                    const isAvailable = pkg.isAvailable !== false;
                    const isSelected = selectedPackage?.id === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => {
                          if (isAvailable) setSelectedPackage(pkg);
                        }}
                        className={`p-3 rounded-lg border transition select-none relative ${
                          !isAvailable
                            ? 'border-zinc-200 bg-zinc-50 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'border-zinc-950 bg-zinc-50/80 shadow-xs ring-1 ring-zinc-950/5 cursor-pointer'
                            : 'border-zinc-200/90 hover:border-zinc-300 bg-white cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            {/* Minimalist Radio Indicator */}
                            <div className={`w-3.5 h-3.5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition ${
                              !isAvailable
                                ? 'border-zinc-300 bg-zinc-200'
                                : isSelected 
                                ? 'border-zinc-950 bg-zinc-950' 
                                : 'border-zinc-300 bg-white'
                            }`}>
                              {isSelected && isAvailable && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-semibold text-xs sm:text-sm ${isAvailable ? 'text-zinc-950' : 'text-zinc-500 line-through'}`}>
                                  {pkg.name}
                                </span>
                                {!isAvailable ? (
                                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                    Stok Habis
                                  </span>
                                ) : pkg.badge ? (
                                  <span className="text-[10px] font-medium uppercase px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700">
                                    {pkg.badge}
                                  </span>
                                ) : null}
                              </div>
                              <div className="text-[11px] font-medium text-zinc-500 mt-0.5">
                                Durasi: {pkg.duration}
                              </div>
                            </div>
                          </div>

                          {/* Pricing */}
                          <div className="text-right shrink-0">
                            <div className={`text-sm sm:text-base font-bold ${isAvailable ? 'text-zinc-950' : 'text-zinc-400'}`}>
                              {formatRupiah(pkg.price)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>


            </div>
          )}

          {/* TAB 2: FITUR */}
          {activeTab === 'fitur' && (
            <div className="space-y-3">
              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                <div className="text-[11px] font-semibold uppercase text-zinc-500 tracking-wider mb-1">
                  Deskripsi
                </div>
                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                  {appData.description}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold uppercase text-zinc-500 tracking-wider">
                  Daftar Fitur Resmi
                </div>
                <div className="divide-y divide-zinc-100 border border-zinc-200/80 rounded-lg overflow-hidden bg-white">
                  {appData.features?.map((feat, idx) => (
                    <div key={idx} className="p-2.5 text-xs sm:text-sm text-zinc-800 flex items-center justify-between">
                      <span className="font-medium">{feat}</span>
                      <span className="text-[11px] text-zinc-400 font-normal">Tersedia</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CARA PESAN */}
          {activeTab === 'cara-pesan' && (
            <div className="space-y-2.5 text-xs sm:text-sm text-zinc-700 leading-relaxed">
              <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="font-bold text-zinc-950 text-xs uppercase tracking-wider">
                  Alur Pemesanan
                </div>
                <ol className="space-y-1.5 list-decimal pl-4 text-xs text-zinc-600 leading-relaxed">
                  <li>Pilih paket dan durasi yang Anda inginkan.</li>
                  <li>Klik tombol Pesan Sekarang via WhatsApp di bawah.</li>
                  <li>Lakukan transfer sesuai total nominal melalui QRIS atau rekening bank.</li>
                  <li>Akses akun atau link aktivasi dikirimkan langsung oleh CS kami.</li>
                </ol>
              </div>
            </div>
          )}

        </div>

        {/* === CHECKOUT BAR === */}
        <div className="p-3.5 bg-white border-t border-zinc-100 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-zinc-500">Total Harga:</div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950">
                  {formatRupiah(selectedPackage?.price || 0)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={copyOrderFormat}
                className="px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition cursor-pointer"
              >
                {copied ? 'Tersalin' : 'Salin Format'}
              </button>

              {onAddToCart && (
                <button
                  type="button"
                  disabled={selectedPackage?.isAvailable === false}
                  onClick={() => {
                    if (selectedPackage?.isAvailable === false) return;
                    onAddToCart({
                      id: `${appData.slug}-${selectedPackage?.id}`,
                      name: appData.name,
                      variantName: `${selectedPackage?.name} (${selectedPackage?.duration || '1 Bulan'})`,
                      price: selectedPackage?.price,
                      brand: appData.brand,
                      image: appData.image || appData.img,
                      duration: selectedPackage?.duration,
                      category: 'Aplikasi Premium'
                    });
                    if (onShowNotification) onShowNotification(`${appData.name} (${selectedPackage?.name}) masuk ke tas`);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedPackage?.isAvailable === false
                      ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 cursor-pointer'
                  }`}
                >
                  + Tas
                </button>
              )}
            </div>
          </div>

          {selectedPackage?.isAvailable === false ? (
            <div className="w-full py-2.5 px-4 rounded-lg bg-zinc-100 text-zinc-400 font-semibold text-xs sm:text-sm tracking-wide text-center cursor-not-allowed border border-zinc-200">
              Stok Paket Ini Sedang Habis
            </div>
          ) : (
            <a
              href={getWhatsAppOrderUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-lg bg-zinc-950 hover:bg-zinc-900 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm tracking-wide text-center transition cursor-pointer"
            >
              Pesan Sekarang via WhatsApp
            </a>
          )}

          <div className="text-center">
            <Link
              href={`/store/app/${appData.slug}`}
              onClick={onClose}
              className="text-[11px] text-zinc-500 hover:text-zinc-800 underline transition"
            >
              Buka halaman detail lengkap
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
