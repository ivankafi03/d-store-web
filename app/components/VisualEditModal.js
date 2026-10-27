'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Check, RefreshCw, ExternalLink, Link as LinkIcon, Sparkles } from 'lucide-react';
import { getAppVariantData } from '@/lib/appVariantsData';

const QUICK_APP_BRANDS = [
  { label: 'Gemini AI', brand: 'GEMINI' },
  { label: 'ChatGPT', brand: 'CHATGPT' },
  { label: 'Spotify', brand: 'SPOTIFY' },
  { label: 'Netflix', brand: 'NETFLIX' },
  { label: 'Canva', brand: 'CANVA' },
  { label: 'YouTube', brand: 'YOUTUBE' },
  { label: 'Bstation', brand: 'BSTATION' },
  { label: 'CapCut', brand: 'CAPCUT' },
  { label: 'Midjourney', brand: 'MIDJOURNEY' },
  { label: 'Disney+', brand: 'DISNEY+' },
  { label: 'Vidio', brand: 'VIDIO' },
  { label: 'WeTV', brand: 'WETV' },
  { label: 'Viu', brand: 'VIU' },
  { label: 'Zoom', brand: 'ZOOM' },
  { label: 'Office 365', brand: 'MICROSOFT' },
  { label: 'Duolingo', brand: 'DUOLINGO' },
  { label: 'Surfshark', brand: 'SURFSHARK' },
  { label: 'Gmail', brand: 'GMAIL' }
];

export const STORE_CATEGORIES = [
  'AI & Tools',
  'Streaming & Film',
  'Desain & Video',
  'Musik & Audio',
  'VPN & Security',
  'Office & Akun Tools',
  'Edukasi & Bahasa'
];

export default function VisualEditModal({
  isOpen,
  elementData,
  onClose,
  onSave
}) {
  const [name, setName] = useState(elementData?.name || elementData?.title || '');
  const [brand, setBrand] = useState(elementData?.brand || '');
  const [image, setImage] = useState(elementData?.image || elementData?.desktopImg || '');
  const [price, setPrice] = useState(elementData?.price || elementData?.priceNumber || '');
  const [category, setCategory] = useState(elementData?.category || '');
  const [link, setLink] = useState(elementData?.link || '');
  const [previewError, setPreviewError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState(null);

  // Seluruh database produk toko dari API backend
  const [dbProducts, setDbProducts] = useState([]);
  const [dbVariants, setDbVariants] = useState([]);

  // Deteksi otomatis apakah brand / nama / link mengarah ke aplikasi tertentu
  const detectedApp = getAppVariantData({ brand, name, link }, dbProducts, dbVariants);
  const prevDetectedKeyRef = useRef('');
  const lastOpenedIdRef = useRef(null);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'ok') {
          setDbProducts(data.products || []);
          setDbVariants(data.variants || []);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (elementData) {
      const currentItemId = `${elementData.type || ''}_${elementData.id || elementData.sku || elementData.name || ''}`;
      
      // Hanya re-inisialisasi state form saat item yang diedit berganti atau modal baru dibuka
      if (currentItemId !== lastOpenedIdRef.current) {
        lastOpenedIdRef.current = currentItemId;

        const initialName = elementData.name || elementData.title || '';
        const initialBrand = elementData.brand || '';
        const initialLink = elementData.link || '';

        setName(initialName);
        setBrand(initialBrand);
        setImage(elementData.image || elementData.desktopImg || '');
        setPrice(elementData.price || elementData.priceNumber || '');
        setLink(initialLink);
        setPreviewError(false);

        const detected = getAppVariantData(
          { brand: initialBrand, name: initialName, link: initialLink },
          dbProducts,
          dbVariants
        );

        if (detected?.category) {
          setCategory(detected.category);
          prevDetectedKeyRef.current = detected.slug || detected.name;
        } else if (elementData.category) {
          setCategory(elementData.category);
        } else {
          setCategory('AI & Tools');
        }
      }
    } else {
      lastOpenedIdRef.current = null;
    }
  }, [elementData]);

  // Real-time auto-sync: saat brand/nama/link berubah dan mendeteksi produk baru, ganti kategori otomatis
  useEffect(() => {
    if (detectedApp?.category) {
      const currentKey = detectedApp.slug || detectedApp.name;
      if (currentKey && currentKey !== prevDetectedKeyRef.current) {
        prevDetectedKeyRef.current = currentKey;
        setCategory(detectedApp.category);
      }
    }
  }, [detectedApp]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('Ukuran file maksimal 20 MB.');
      return;
    }

    setUploading(true);
    setUploadStats(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.status === 'ok') {
        setImage(data.url);
        setPreviewError(false);
        setUploadStats({
          originalSizeKb: Math.round(data.originalSize / 1024),
          convertedSizeKb: Math.round(data.convertedSize / 1024),
          savedPercent: data.savedPercent,
          format: data.format
        });
      } else {
        alert(data.message || 'Gagal memproses gambar');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat memproses gambar.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...elementData,
      name,
      title: name,
      brand,
      image,
      desktopImg: image,
      price: Number(price) || price,
      priceNumber: Number(price) || price,
      category,
      link
    });
  };

  if (!isOpen || !elementData) return null;

  const isCardOrProduct = Boolean(
    elementData.type?.includes('product') || 
    elementData.type?.includes('slide') || 
    elementData.type?.includes('app') ||
    elementData.category !== undefined ||
    elementData.price !== undefined || 
    elementData.priceNumber !== undefined
  );
  const isProduct = isCardOrProduct;
  const isHeroBanner = Boolean(
    elementData.type?.includes('hero-top') || 
    elementData.type === 'main-hero' || 
    elementData.type?.includes('banner')
  );

  const recommendation = elementData.recommendation || {
    dimensions: isHeroBanner ? '1240 x 520 px (Desktop) / 800 x 800 px (Mobile)' : '600 x 800 px (Rasio 3:4)',
    aspectRatio: isHeroBanner ? '21:9 atau 16:9' : '3:4',
    tips: isHeroBanner
      ? 'Gunakan gambar lanskap horizontal lebar agar tidak terpotong saat layar melebar.'
      : 'Gunakan gambar ukuran 600 x 800 px dengan latar belakang putih bersih atau abu muda agar tampak rapi.'
  };

  return (
    <div 
      className="fixed inset-0 z-[160] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div 
        className="bg-white text-zinc-900 rounded-lg max-w-lg w-full overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col border border-zinc-200 font-sans"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between gap-3 bg-zinc-50/70">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Visual Live Editor
            </div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-950">
              {isProduct ? 'Edit Produk' : 'Edit Banner / Gambar'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-zinc-200/70 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1 no-scrollbar text-xs">
          
          {/* Box Rekomendasi Ukuran */}
          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="font-semibold text-zinc-950 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
              <span>Panduan Ukuran Gambar Rekomendasi</span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              <strong className="text-zinc-900">Dimensi Pas:</strong> {recommendation.dimensions}
            </p>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              <strong className="text-zinc-900">Saran:</strong> {recommendation.tips}
            </p>
          </div>

          {/* Pratinjau Gambar */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-900 block text-[11px] uppercase tracking-wider">
              Pratinjau Gambar
            </label>
            <div className="w-full h-44 rounded-lg border border-zinc-200 bg-zinc-100 overflow-hidden flex items-center justify-center relative">
              {image && !previewError ? (
                <img 
                  src={image} 
                  alt="Preview" 
                  className="w-full h-full object-contain p-2"
                  onError={() => setPreviewError(true)}
                />
              ) : (
                <div className="text-zinc-400 text-center p-4">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 stroke-1" />
                  <span>Gambar belum dipilih atau URL tidak valid</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload / Ganti Gambar */}
          <div className="space-y-2">
            <label className="font-semibold text-zinc-900 block text-[11px] uppercase tracking-wider">
              Pilih Gambar
            </label>
            <div className="flex flex-col gap-2">
              <label className={`w-full px-3 py-2.5 border rounded-lg text-center font-medium transition flex items-center justify-center gap-2 cursor-pointer ${
                uploading 
                  ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-wait'
                  : 'bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-300'
              }`}>
                {uploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-500" />
                    <span>Mengonversi ke WebP otomatis...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Gambar Canva (JPG / PNG)</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  disabled={uploading}
                  onChange={handleFileUpload}
                />
              </label>

              {uploadStats && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] space-y-0.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Otomatis Dikonversi ke WebP</span>
                  </div>
                  <div className="text-emerald-700">
                    Ukuran Canva: {uploadStats.originalSizeKb} KB &rarr; WebP: {uploadStats.convertedSizeKb} KB (Hemat {uploadStats.savedPercent}%)
                  </div>
                </div>
              )}
            </div>

            <div>
              <span className="text-[11px] text-zinc-500 block mb-1">Atau masukkan URL gambar langsung:</span>
              <input
                type="text"
                value={image}
                onChange={(e) => {
                  setImage(e.target.value);
                  setPreviewError(false);
                }}
                placeholder="https://... (link gambar)"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 text-xs"
              />
            </div>
          </div>

          {/* Nama / Judul */}
          <div className="space-y-1">
            <label className="font-semibold text-zinc-900 block text-[11px] uppercase tracking-wider">
              {isProduct ? 'Nama Produk / Aplikasi' : 'Judul Banner'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Spotify Premium Individual"
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 text-xs"
              required
            />
          </div>

          {/* Brand */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-zinc-900 block text-[11px] uppercase tracking-wider">
                Brand / Label
              </label>
              <span className="text-[10px] text-zinc-500 font-medium">
                Ketik kata kunci (misal: gpt, netflix)
              </span>
            </div>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Contoh: CHATGPT, SPOTIFY, NETFLIX, dll."
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 text-xs"
            />

            {/* Quick Brand Selector Chips */}
            <div className="pt-0.5">
              <div className="text-[10px] text-zinc-400 font-medium mb-1">Pilihan Cepat Brand:</div>
              <div className="flex flex-wrap gap-1">
                {QUICK_APP_BRANDS.map((item) => {
                  const isSelected = brand.toUpperCase().includes(item.brand);
                  return (
                    <button
                      key={item.brand}
                      type="button"
                      onClick={() => {
                        setBrand(item.brand);
                        const appData = getAppVariantData({ brand: item.brand, name: item.label }, dbProducts, dbVariants);
                        if (appData) {
                          setName(appData.name || `${item.label} Premium`);
                          if (appData.packages?.[0]?.price) {
                            setPrice(appData.packages[0].price);
                          }
                          if (appData.slug) {
                            setLink(`/store/app/${appData.slug}`);
                          }
                          if (appData.category) {
                            setCategory(appData.category);
                          }
                        } else {
                          setName(`${item.label} Premium`);
                        }
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition border cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-950 text-white border-zinc-950'
                          : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dropdown Pencarian Seluruh Produk Database */}
            {dbProducts.length > 0 && (
              <div className="pt-1">
                <div className="text-[10px] text-zinc-500 font-medium mb-1">
                  Atau Pilih Langsung dari Katalog Produk ({dbProducts.length} Produk Database):
                </div>
                <select
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-950 cursor-pointer"
                  onChange={(e) => {
                    const prodId = e.target.value;
                    if (!prodId) return;
                    const selected = dbProducts.find((p) => p.id === prodId);
                    if (selected) {
                      const app = getAppVariantData({ id: selected.id, name: selected.name }, dbProducts, dbVariants);
                      if (app) {
                        setName(app.name);
                        setBrand(app.brand || selected.name.toUpperCase());
                        if (app.packages?.[0]?.price) {
                          setPrice(app.packages[0].price);
                        }
                        setLink(`/store/app/${app.slug}`);
                        if (app.category) {
                          setCategory(app.category);
                        }
                      } else {
                        setName(selected.name);
                        setBrand(selected.name.toUpperCase());
                        const catMap = {
                          cat_1: 'AI & Tools',
                          cat_2: 'Streaming & Film',
                          cat_3: 'Desain & Video',
                          cat_4: 'Musik & Audio',
                          cat_5: 'Edukasi & Bahasa',
                          cat_6: 'VPN & Security',
                          cat_7: 'Office & Akun Tools'
                        };
                        if (catMap[selected.categoryId]) {
                          setCategory(catMap[selected.categoryId]);
                        } else if (selected.categoryName) {
                          setCategory(selected.categoryName);
                        }
                        const pVars = dbVariants.filter((v) => v.productId === selected.id);
                        if (pVars.length > 0) {
                          const lowest = Math.min(...pVars.map((v) => Number(v.price) || 0).filter((p) => p > 0));
                          if (lowest > 0) setPrice(lowest);
                        }
                        const s = selected.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        setLink(`/store/app/${s}`);
                      }
                    }
                  }}
                  value={dbProducts.find((p) => p.name.toLowerCase() === name.toLowerCase() || p.name.toLowerCase() === brand.toLowerCase())?.id || ''}
                >
                  <option value="" disabled>-- Pilih Produk Toko (Otomatis Isi Semua) --</option>
                  {dbProducts.map((p) => {
                    const pVars = dbVariants.filter((v) => v.productId === p.id);
                    const validPrices = pVars.map((v) => Number(v.price) || 0).filter((pr) => pr > 0);
                    const lowest = validPrices.length > 0 ? Math.min(...validPrices) : 0;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} {lowest > 0 ? `(Mulai Rp ${lowest.toLocaleString('id-ID')})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Indikator Deteksi Otomatis Target Klik & Harga */}
            <div className="pt-1.5">
              {detectedApp ? (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex flex-col gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1 shrink-0" />
                    <div className="space-y-0.5 flex-1">
                      <div className="font-bold text-emerald-950 text-xs flex items-center justify-between">
                        <span>Target Terdeteksi Otomatis: {detectedApp.name}</span>
                        {detectedApp.packages?.[0]?.price && (
                          <span className="font-bold text-emerald-700">
                            Mulai Rp {Number(detectedApp.packages[0].price).toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        Saat diklik di beranda, pengunjung otomatis diarahkan ke popup varian paket {detectedApp.name} ({detectedApp.packages?.length || 0} pilihan paket).
                      </p>
                    </div>
                  </div>

                  {detectedApp.packages?.[0]?.price && isCardOrProduct && (
                    <div className="pt-1.5 border-t border-emerald-200/60 flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[11px] text-emerald-800">
                        Harga paket termurah: <strong>Rp {Number(detectedApp.packages[0].price).toLocaleString('id-ID')}</strong>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPrice(detectedApp.packages[0].price)}
                          className="px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold cursor-pointer transition shadow-xs"
                        >
                          Terapkan Harga Ini
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setName(detectedApp.name);
                            setBrand(detectedApp.brand || detectedApp.name.toUpperCase());
                            if (detectedApp.packages?.[0]?.price) {
                              setPrice(detectedApp.packages[0].price);
                            }
                            setLink(`/store/app/${detectedApp.slug}`);
                            if (detectedApp.category) {
                              setCategory(detectedApp.category);
                            }
                          }}
                          className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-800 text-white text-[10px] font-bold cursor-pointer transition shadow-xs"
                        >
                          Sinkronkan Semua
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-600 text-[11px] leading-relaxed flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1 shrink-0" />
                  <div>
                    <strong className="text-zinc-800">Pencarian Otomatis:</strong> Ketik nama produk apa saja yang ada di katalog (misal: <strong>gemini</strong>, <strong>bstation</strong>, <strong>canva</strong>, <strong>netflix</strong>) atau tempel link produk dari admin agar otomatis terdeteksi.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Harga (Untuk Produk & Hero Mini Card) */}
          {isCardOrProduct && (
            <div className="space-y-1">
              <label className="font-semibold text-zinc-900 block text-[11px] uppercase tracking-wider">
                Harga Jual Bersih (Rp)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Contoh: 10000"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 text-xs font-semibold"
                required
              />
              <span className="text-[10px] text-zinc-500 block">
                Harga ini ditampilkan pada badge kartu produk atau slider beranda.
              </span>
            </div>
          )}

          {/* Kategori */}
          {isCardOrProduct && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-zinc-900 block text-[11px] uppercase tracking-wider">
                  Kategori
                </label>
                {detectedApp?.category && category !== detectedApp.category && (
                  <button
                    type="button"
                    onClick={() => setCategory(detectedApp.category)}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                  >
                    Gunakan Kategori Terdeteksi ({detectedApp.category})
                  </button>
                )}
              </div>

              {/* Pilihan Cepat Kategori 1-Klik */}
              <div className="space-y-1">
                <div className="text-[10px] text-zinc-500 font-medium">Klik Kategori (Otomatis Terpilih):</div>
                <div className="flex flex-wrap gap-1.5">
                  {STORE_CATEGORIES.map((cat) => {
                    const isSelected = category.trim().toLowerCase() === cat.trim().toLowerCase();
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer border ${
                          isSelected
                            ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs font-semibold'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200 hover:text-zinc-950'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dropdown Kategori & Input Kustom Alternatif */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                <div>
                  <select
                    value={STORE_CATEGORIES.find((c) => c.toLowerCase() === category.toLowerCase()) || ''}
                    onChange={(e) => {
                      if (e.target.value) setCategory(e.target.value);
                    }}
                    className="w-full px-2.5 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 text-xs bg-white text-zinc-900 cursor-pointer"
                  >
                    <option value="">-- Pilih dari Dropdown --</option>
                    {STORE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Atau ketik nama kustom..."
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 text-xs"
                  />
                </div>
              </div>
              <span className="text-[10px] text-zinc-500 block">
                Kategori ini mengelompokkan produk di tab dan filter etalase toko.
              </span>
            </div>
          )}

          {/* Link Tujuan / URL Target Saat Diklik */}
          <div className="space-y-1.5 pt-1 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-zinc-900 block text-[11px] uppercase tracking-wider">
                Link Tujuan / URL Produk Saat Diklik
              </label>
              <a
                href="/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
                title="Buka katalog admin untuk mencari dan menyalin URL produk"
              >
                <span>Cari di Admin (/admin)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Tombol Cepat WhatsApp Jasa Web */}
            <div className="flex items-center gap-2 mb-1.5">
              <button
                type="button"
                onClick={() => setLink('https://wa.me/6281230112240?text=Halo%20Admin%20D%20Store%2C%20saya%20tertarik%20dengan%20jasa%20pembuatan%20website.%20Boleh%20konsultasi%20mengenai%20paket%2C%20fitur%2C%20dan%20harganya%3F')}
                className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200 transition cursor-pointer"
              >
                Gunakan Link WhatsApp Jasa Web
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={link}
                onChange={(e) => {
                  const val = e.target.value;
                  setLink(val);
                  // Jika admin menempelkan URL produk dari admin (misal /store/app/bstation)
                  const detected = getAppVariantData(val, dbProducts, dbVariants);
                  if (detected) {
                    if (!brand || brand === 'D STORE' || brand === 'Aplikasi Baru') {
                      setBrand(detected.brand.toUpperCase());
                    }
                    if (!name || name === 'Aplikasi Baru') {
                      setName(detected.name);
                    }
                    if (detected.packages?.[0]?.price && (!price || price === 10000 || price === 15000 || price === 25000)) {
                      setPrice(detected.packages[0].price);
                    }
                    if (detected.category) {
                      setCategory(detected.category);
                    }
                  }
                }}
                placeholder="Contoh: /store/app/bstation atau http://localhost:3000/store/app/bstation"
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 text-xs font-mono"
              />
              <LinkIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Quick URL Suggestions */}
            <div>
              <div className="text-[10px] text-zinc-400 font-medium mb-1">Pilihan Cepat URL Produk:</div>
              <div className="flex flex-wrap gap-1">
                {[
                  { label: 'Bstation', url: '/store/app/bstation' },
                  { label: 'Canva', url: '/store/app/canva' },
                  { label: 'Netflix', url: '/store/app/netflix' },
                  { label: 'ChatGPT', url: '/store/app/chatgpt' },
                  { label: 'Spotify', url: '/store/app/spotify' },
                  { label: 'YouTube', url: '/store/app/youtube' },
                  { label: 'CapCut', url: '/store/app/capcut' },
                  { label: 'Vidio', url: '/store/app/vidio' },
                  { label: 'WeTV', url: '/store/app/wetv' },
                  { label: 'Viu', url: '/store/app/viu' }
                ].map((u) => (
                  <button
                    key={u.url}
                    type="button"
                    onClick={() => {
                      setLink(u.url);
                      const detected = getAppVariantData(u.url);
                      if (detected) {
                        setBrand(detected.brand.toUpperCase());
                        setName(detected.name);
                        if (detected.packages?.[0]?.price) {
                          setPrice(detected.packages[0].price);
                        }
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition border cursor-pointer ${
                      link === u.url
                        ? 'bg-zinc-950 text-white border-zinc-950'
                        : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-[10px] text-zinc-500 block leading-relaxed">
              Anda dapat menyalin URL dari tombol <strong>"Salin URL"</strong> di <a href="/admin" target="_blank" className="text-zinc-800 underline">Katalog Admin</a>, lalu menempelkannya (paste) ke kolom di atas.
            </span>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-medium transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan &amp; Terapkan</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
