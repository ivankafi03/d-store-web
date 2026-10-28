'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Info } from 'lucide-react';
import { APP_VARIANTS_DATA, getAppVariantData } from '@/lib/appVariantsData';

export default function AppDetailPage({ params }) {
  const resolvedParams = typeof params?.then === 'function' ? use(params) : params;
  const slug = resolvedParams?.slug;
  const initialAppData = getAppVariantData(slug);
  const [appData, setAppData] = useState(initialAppData);
  const [loading, setLoading] = useState(!initialAppData);

  useEffect(() => {
    if (slug) {
      fetch('/api/store/products')
        .then((r) => r.json())
        .then((data) => {
          if (data.status === 'ok') {
            const detected = getAppVariantData(slug, data.rawProducts || data.products, data.rawVariants || data.variants);
            if (detected) {
              setAppData(detected);
              setSelectedPackage(detected.packages?.find((p) => p.popular) || detected.packages?.[0]);
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const [selectedPackage, setSelectedPackage] = useState(
    initialAppData?.packages?.find((p) => p.popular) || initialAppData?.packages?.[0]
  );
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center text-xs text-zinc-500">
        Memuat informasi produk...
      </div>
    );
  }

  if (!appData) {
    notFound();
  }

  const formatRupiah = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

  const triggerToast = (msg) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 2500);
  };

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
    triggerToast('Format pesanan berhasil disalin');
    setTimeout(() => setCopied(false), 2000);
  };

  const relatedApps = Object.values(APP_VARIANTS_DATA)
    .filter((a) => a.slug !== appData.slug)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-zinc-900 font-sans pb-24 md:pb-16 selection:bg-zinc-900 selection:text-white">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[150] bg-zinc-950 text-white px-4 py-2 rounded-md text-xs font-medium shadow-lg">
          {showToast}
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-zinc-200/80">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 h-13 flex items-center justify-between">
          <Link 
            href="/store/all"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Katalog</span>
          </Link>

          <Link href="/store" className="font-bold text-xs sm:text-sm tracking-[0.25em] uppercase text-zinc-950">
            D STORE
          </Link>

          <a 
            href="https://wa.me/6281230112240" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-950 transition"
          >
            Bantuan CS
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-3.5">
        
        {/* === HERO BANNER === */}
        <div className="bg-white rounded-lg p-4 sm:p-5 border border-zinc-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                {appData.brand}
              </span>
              {appData.badge && (
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-800">
                  {appData.badge}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
              {appData.name}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 max-w-xl leading-relaxed">
              {appData.tagline}
            </p>

            <div className="flex items-center gap-2 text-xs text-zinc-500 pt-0.5">
              <span>{appData.soldCount || '1.000+'} transaksi terverifikasi</span>
            </div>
          </div>

          <div className="w-full md:w-auto p-3 sm:p-4 rounded-lg bg-zinc-50 border border-zinc-200/70 flex md:flex-col items-center justify-between md:justify-center gap-1.5 shrink-0">
            <span className="text-[11px] text-zinc-500 font-medium">Mulai dari:</span>
            <span className="text-lg sm:text-xl font-bold text-zinc-950">
              {formatRupiah(appData.packages?.[0]?.price || 0)}
            </span>
            <span className="text-[10px] text-zinc-600 font-medium bg-zinc-200/60 px-1.5 py-0.2 rounded">
              Ready Stock
            </span>
          </div>
        </div>

        {/* === SECTION 1: PILIHAN PAKET & VARIAN === */}
        <section className="bg-white rounded-lg p-4 sm:p-5 border border-zinc-200/80 shadow-2xs space-y-3.5">
          <div className="flex items-baseline justify-between border-b border-zinc-100 pb-2.5">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-950">
                Pilih Durasi &amp; Paket Langganan
              </h2>
            </div>
            <span className="text-xs text-zinc-400">
              {appData.packages?.length} Varian
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200/80 text-[11px] text-zinc-600">
            <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span>Produk dan varian bisa saja kosong karena keterlambatan update.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
            {appData.packages?.map((pkg) => {
              const isSelected = selectedPackage?.id === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`p-3 sm:p-3.5 rounded-lg border transition cursor-pointer select-none flex flex-col justify-between ${
                    isSelected
                      ? 'border-zinc-950 bg-zinc-50/70 shadow-xs ring-1 ring-zinc-950/5'
                      : 'border-zinc-200/90 hover:border-zinc-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <div className={`w-3.5 h-3.5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition ${
                          isSelected ? 'border-zinc-950 bg-zinc-950' : 'border-zinc-300 bg-white'
                        }`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-semibold text-xs sm:text-sm text-zinc-950">
                              {pkg.name}
                            </h3>
                            {pkg.badge && (
                              <span className="text-[10px] font-medium uppercase px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700">
                                {pkg.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-medium text-zinc-600 mt-1">
                            Durasi: {pkg.duration}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500 font-medium">
                      Harga
                    </span>

                    <div className="text-right">
                      <div className="text-sm sm:text-base font-bold text-zinc-950">
                        {formatRupiah(pkg.price)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>


        </section>

        {/* === SECTION 2: FITUR & PANDUAN PEMESANAN === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
          <div className="bg-white rounded-lg p-4 sm:p-5 border border-zinc-200/80 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs sm:text-sm text-zinc-950">
              Fitur &amp; Keuntungan Layanan
            </h3>
            <div className="divide-y divide-zinc-100 border border-zinc-200/80 rounded-lg overflow-hidden bg-white">
              {appData.features?.map((feat, idx) => (
                <div key={idx} className="p-2.5 text-xs text-zinc-800 flex items-center justify-between">
                  <span className="font-medium">{feat}</span>
                  <span className="text-[11px] text-zinc-400 font-normal">Tersedia</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-5 border border-zinc-200/80 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs sm:text-sm text-zinc-950">
              Panduan Pemesanan
            </h3>
            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs">
              <ol className="list-decimal pl-4 space-y-2 text-zinc-600 leading-relaxed">
                <li>Pilih varian paket durasi yang Anda inginkan di atas.</li>
                <li>Klik tombol Pesan via WhatsApp di bagian bawah.</li>
                <li>Selesaikan pembayaran melalui QRIS atau transfer rekening.</li>
                <li>Akses akun atau link aktivasi dikirimkan langsung oleh CS kami.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* === SECTION 3: REKOMENDASI APLIKASI LAINNYA === */}
        <div className="bg-white rounded-lg p-4 sm:p-5 border border-zinc-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
            <h3 className="font-bold text-xs sm:text-sm text-zinc-950">
              Aplikasi Populer Lainnya
            </h3>
            <Link href="/store/all" className="text-xs text-zinc-500 hover:text-zinc-950 transition">
              Lihat Semua
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            {relatedApps.map((rel) => (
              <Link
                key={rel.slug}
                href={`/store/app/${rel.slug}`}
                className="p-3 rounded-lg border border-zinc-200/80 bg-white hover:border-zinc-400 transition flex flex-col justify-between text-left cursor-pointer"
              >
                <div>
                  <div className="text-[10px] font-semibold uppercase text-zinc-400">
                    {rel.brand}
                  </div>
                  <h4 className="font-semibold text-xs text-zinc-950 mt-0.5 line-clamp-1">
                    {rel.name}
                  </h4>
                </div>
                <div className="text-[11px] font-medium text-zinc-600 mt-2 pt-1.5 border-t border-zinc-100">
                  Mulai {formatRupiah(rel.packages?.[0]?.price)}
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>

      {/* === FLOATING BOTTOM BAR === */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xs border-t border-zinc-200 py-2.5 px-4 z-30 shadow-md">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-zinc-500">Pilihan: {selectedPackage?.name}</div>
            <div className="text-base sm:text-lg font-bold text-zinc-950">
              {formatRupiah(selectedPackage?.price || 0)}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={copyOrderFormat}
              className="px-3 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition cursor-pointer"
            >
              {copied ? 'Tersalin' : 'Salin Format'}
            </button>

            <a
              href={getWhatsAppOrderUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-900 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm transition cursor-pointer"
            >
              Pesan via WhatsApp
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
