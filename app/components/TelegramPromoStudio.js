'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Send,
  Image as ImageIcon,
  Upload,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Search,
  Sparkles,
  ExternalLink,
  Users,
  Bookmark,
  MessageCircle,
  Share2,
  AlertCircle,
  X,
  Download,
  CheckCircle2,
  Layers,
  FileText
} from 'lucide-react';

export default function TelegramPromoStudio({ showToast, products = [], variants = [] }) {
  const [presets, setPresets] = useState([]);
  const [targetGroups, setTargetGroups] = useState([]);
  const [hasTelegramSession, setHasTelegramSession] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncingGroups, setSyncingGroups] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [savingPreset, setSavingPreset] = useState(false);

  // Active Promo Composer State
  const [promoTitle, setPromoTitle] = useState('Promo Spesial Akun Digital D-Store');
  const [promoCaption, setPromoCaption] = useState('');
  const [promoImage, setPromoImage] = useState('');
  const [activePresetId, setActivePresetId] = useState(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Target Groups Filter State
  const [groupSearch, setGroupSearch] = useState('');
  const [selectedGroupCat, setSelectedGroupCat] = useState('all');
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);

  // New Group Form State
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newGroupLink, setNewGroupLink] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('Jual Beli Akun');
  const [newGroupNotes, setNewGroupNotes] = useState('');

  const fileInputRef = useRef(null);

  // Load Data on Mount
  useEffect(() => {
    fetchPromoData();
    // Default caption jika kosong
    if (!promoCaption) {
      handleAutoGenerateCaption(false);
    }
  }, []);

  const fetchPromoData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/promo');
      const data = await res.json();
      if (data.status === 'ok') {
        setPresets(data.presets || []);
        setTargetGroups(data.targetGroups || []);
        setHasTelegramSession(!!data.hasTelegramSession);
      }
    } catch (err) {
      console.error('[PromoStudio] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Pilih Gambar dari File
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast?.('File harus berupa gambar (JPG, PNG, atau WebP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast?.('Ukuran gambar maksimal 5 MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPromoImage(event.target.result);
      showToast?.('Gambar berhasil dipilih!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // 2. Auto-Generate Caption dari Stok Ready
  const handleAutoGenerateCaption = async (notify = true) => {
    setGeneratingCaption(true);
    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_ready_caption' })
      });
      const data = await res.json();
      if (data.status === 'ok' && data.caption) {
        setPromoCaption(data.caption);
        if (notify) showToast?.('Caption promosi otomatis berhasil dibuat dari stok ready!', 'success');
      }
    } catch (err) {
      if (notify) showToast?.('Gagal membuat caption otomatis', 'error');
    } finally {
      setGeneratingCaption(false);
    }
  };

  // 3. Simpan Promo ke Riwayat (Preset)
  const handleSavePreset = async () => {
    if (!promoTitle.trim()) {
      showToast?.('Harap beri nama/judul promo terlebih dahulu', 'error');
      return;
    }

    setSavingPreset(true);
    try {
      const isDataUrl = promoImage && promoImage.startsWith('data:image/');
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_preset',
          id: activePresetId || undefined,
          title: promoTitle,
          caption: promoCaption,
          imageDataUrl: isDataUrl ? promoImage : undefined,
          imagePath: !isDataUrl ? promoImage : undefined
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setPresets(data.presets || []);
        if (data.preset?.id) setActivePresetId(data.preset.id);
        if (data.preset?.image) setPromoImage(data.preset.image);
        showToast?.('Promo dan gambar berhasil disimpan ke riwayat!', 'success');
      } else {
        showToast?.(data.message || 'Gagal menyimpan promo', 'error');
      }
    } catch (err) {
      showToast?.('Error saat menyimpan promo', 'error');
    } finally {
      setSavingPreset(false);
    }
  };

  // 4. Pakai Promo dari Riwayat
  const handleUsePreset = (preset) => {
    setActivePresetId(preset.id);
    setPromoTitle(preset.title);
    setPromoCaption(preset.caption || '');
    setPromoImage(preset.image || '');
    showToast?.(`Promo "${preset.title}" dimuat ke editor!`, 'info');
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  // 5. Hapus Promo dari Riwayat
  const handleDeletePreset = async (presetId, title, e) => {
    e.stopPropagation();
    if (!confirm(`Hapus promo "${title}" dari riwayat tersimpan?`)) return;

    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_preset', presetId })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setPresets(data.presets || []);
        if (activePresetId === presetId) {
          setActivePresetId(null);
        }
        showToast?.('Promo dihapus dari riwayat', 'info');
      }
    } catch (err) {
      showToast?.('Gagal menghapus promo', 'error');
    }
  };

  // 6. Sinkron / Baca Grup dari Akun Telegram
  const handleSyncTelegramGroups = async () => {
    setSyncingGroups(true);
    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_telegram_groups' })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setTargetGroups(data.targetGroups || []);
        showToast?.(data.message || 'Grup Telegram berhasil disinkronkan!', 'success');
      } else {
        showToast?.(data.message || 'Gagal menyinkronkan grup Telegram', 'error');
      }
    } catch (err) {
      showToast?.('Gagal menghubungkan ke Telegram: ' + err.message, 'error');
    } finally {
      setSyncingGroups(false);
    }
  };

  // 7. Hapus Grup ("Keknya grup ini gausah deh")
  const handleDeleteGroup = async (groupId, title) => {
    if (!confirm(`Hapus "${title}" dari target promosi?`)) return;

    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_group', groupId })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setTargetGroups(data.targetGroups || []);
        showToast?.(`Grup "${title}" berhasil dihapus dari target!`, 'info');
      } else {
        showToast?.(data.message || 'Gagal menghapus grup', 'error');
      }
    } catch (err) {
      showToast?.('Gagal menghapus grup', 'error');
    }
  };

  // 8. Tambah Grup Manual
  const handleAddCustomGroup = async (e) => {
    e.preventDefault();
    if (!newGroupTitle.trim()) {
      showToast?.('Nama grup wajib diisi', 'error');
      return;
    }

    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_group',
          title: newGroupTitle,
          usernameOrLink: newGroupLink,
          category: newGroupCategory,
          notes: newGroupNotes
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setTargetGroups(data.targetGroups || []);
        setShowAddGroupModal(false);
        setNewGroupTitle('');
        setNewGroupLink('');
        setNewGroupNotes('');
        showToast?.('Grup berhasil ditambahkan ke target!', 'success');
      } else {
        showToast?.(data.message || 'Gagal menambahkan grup', 'error');
      }
    } catch (err) {
      showToast?.('Gagal menambahkan grup', 'error');
    }
  };

  // 9. Salin Caption ke Clipboard
  const handleCopyCaption = async () => {
    if (!promoCaption) {
      showToast?.('Caption masih kosong', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(promoCaption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2500);
      showToast?.('Teks caption promosi berhasil disalin ke clipboard!', 'success');
    } catch (err) {
      showToast?.('Gagal menyalin teks', 'error');
    }
  };

  // 10. Kirim ke Grup Tertentu (1-Klik: Salin Teks + Buka Telegram)
  const handleSendToGroup = async (group) => {
    if (!promoCaption.trim()) {
      showToast?.('Harap isi caption promosi terlebih dahulu!', 'error');
      return;
    }

    // 1. Salin teks ke clipboard
    try {
      await navigator.clipboard.writeText(promoCaption);
    } catch (_) {}

    // 2. Tentukan URL Telegram grup
    let targetUrl = group.link;
    if (!targetUrl && group.username) {
      targetUrl = `https://t.me/${group.username.replace(/^@/, '')}`;
    }
    if (!targetUrl) {
      targetUrl = `https://t.me/share/url?url=https%3A%2F%2Fdstore.sbs&text=${encodeURIComponent(promoCaption)}`;
    }

    // 3. Buka jendela Telegram
    window.open(targetUrl, '_blank');
    showToast?.(`Caption tersalin! Buka Telegram & Paste (Ctrl+V) di "${group.title}".`, 'success');
  };

  // 11. Bagikan Cepat ke Telegram (Pilih Chat / Grup Manapun)
  const handleQuickTelegramShare = async () => {
    if (!promoCaption.trim()) {
      showToast?.('Harap isi caption promosi terlebih dahulu!', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(promoCaption);
    } catch (_) {}

    const shareUrl = `https://t.me/share/url?url=https%3A%2F%2Fdstore.sbs&text=${encodeURIComponent(promoCaption)}`;
    window.open(shareUrl, '_blank');
    showToast?.('Membuka Telegram Share Dialog! Pilih chat atau grup yang dituju.', 'info');
  };

  // Filter Group List
  const filteredGroups = targetGroups.filter((g) => {
    const matchSearch =
      !groupSearch ||
      (g.title && g.title.toLowerCase().includes(groupSearch.toLowerCase())) ||
      (g.username && g.username.toLowerCase().includes(groupSearch.toLowerCase())) ||
      (g.category && g.category.toLowerCase().includes(groupSearch.toLowerCase()));

    const matchCat =
      selectedGroupCat === 'all' ||
      (g.category && g.category.toLowerCase() === selectedGroupCat.toLowerCase());

    return matchSearch && matchCat;
  });

  const groupCategories = Array.from(new Set(targetGroups.map((g) => g.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* HEADER BANNER NEO-BRUTALISM                                           */}
      {/* ===================================================================== */}
      <div className="neo-card p-4 sm:p-6 bg-[#FFE600] border-3 border-black shadow-[6px_6px_0_#000]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-black text-[#FFE600] text-[10px] font-black uppercase tracking-wider rounded border border-black shadow-[2px_2px_0_#fff]">
              <Send className="w-3.5 h-3.5" />
              <span>Marketing & Telegram Broadcaster</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
              Studio Promo Telegram & Target Grup
            </h2>
            <p className="text-xs sm:text-sm text-zinc-900 font-bold max-w-2xl">
              Pilih gambar, susun teks promosi otomatis, simpan template yang pernah dipakai, dan sebar ke grup-grup Telegram pilihan hanya dengan 1-klik aman.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleQuickTelegramShare}
              className="neo-btn flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-[#FFE600] text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0_#000] hover:bg-zinc-800 transition flex-1 md:flex-initial"
            >
              <Share2 className="w-4 h-4" />
              <span>Bagikan Bebas ke Telegram</span>
            </button>
            <button
              onClick={handleSyncTelegramGroups}
              disabled={syncingGroups}
              className={`neo-btn flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0_#000] hover:bg-yellow-100 transition flex-1 md:flex-initial ${
                syncingGroups ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${syncingGroups ? 'animate-spin' : ''}`} />
              <span>{syncingGroups ? 'Membaca Grup...' : 'Baca Grup dari Akun Tele'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2-KOLOM: COMPOSER (KIRI) & PREVIEW / RIWAYAT (KANAN)                  */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* KOLOM KIRI: COMPOSER PROMO (7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="neo-card p-4 sm:p-5 bg-white border-3 border-black shadow-[5px_5px_0_#000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#FFE600] border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0_#000]">
                  <FileText className="w-4 h-4 text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-black uppercase tracking-wide">
                    {activePresetId ? 'Edit Promo Tersimpan' : 'Susun Materi Promo Baru'}
                  </h3>
                  <p className="text-[11px] text-zinc-600 font-bold">
                    {activePresetId ? 'Sedang mengedit template riwayat' : 'Pilih gambar dan tentukan keterangannya'}
                  </p>
                </div>
              </div>

              {activePresetId && (
                <button
                  onClick={() => {
                    setActivePresetId(null);
                    setPromoTitle('Promo Spesial Akun Digital D-Store');
                    setPromoImage('');
                    handleAutoGenerateCaption(false);
                    showToast?.('Mode promo baru diaktifkan', 'info');
                  }}
                  className="text-[10px] font-black px-2 py-1 bg-zinc-200 hover:bg-zinc-300 border border-black rounded uppercase"
                >
                  + Buat Baru
                </button>
              )}
            </div>

            {/* Input 1: Judul Promo */}
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-black flex items-center justify-between">
                <span>Judul / Label Promo:</span>
                <span className="text-[10px] text-zinc-500 font-bold lowercase">(untuk riwayat & penanda)</span>
              </label>
              <input
                type="text"
                value={promoTitle}
                onChange={(e) => setPromoTitle(e.target.value)}
                placeholder="Contoh: Promo Gajian Canva & YouTube 1 Bulan"
                className="w-full px-3 py-2 border-2 border-black rounded-lg text-xs font-bold text-black focus:bg-yellow-50 focus:outline-none shadow-[2px_2px_0_#000]"
              />
            </div>

            {/* Input 2: Pemilihan Gambar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pilih Gambar Promo:</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPromoImage('/qris.png');
                      showToast?.('Gambar QRIS Toko berhasil dipasang!', 'success');
                    }}
                    className="text-[10px] font-black text-black bg-[#FFE600] hover:bg-yellow-300 border border-black rounded px-2 py-0.5 flex items-center gap-1 uppercase shadow-[1px_1px_0_#000] cursor-pointer"
                    title="Gunakan gambar barcode QRIS resmi toko"
                  >
                    <span>💳 Gunakan QRIS Toko</span>
                  </button>
                  {promoImage && (
                    <button
                      type="button"
                      onClick={() => setPromoImage('')}
                      className="text-[10px] font-black text-rose-600 hover:underline flex items-center gap-1 uppercase"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus Gambar</span>
                    </button>
                  )}
                </div>
              </div>

              {promoImage ? (
                <div className="relative border-2 border-black rounded-lg p-2 bg-zinc-50 flex items-center gap-4 shadow-[2px_2px_0_#000]">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-black rounded overflow-hidden bg-black shrink-0 flex items-center justify-center">
                    <img
                      src={promoImage}
                      alt="Promo Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-500 rounded text-[10px] font-black uppercase">
                      ✓ Gambar Siap Digunakan
                    </span>
                    <p className="text-xs font-bold text-zinc-700 truncate">
                      Gambar tersimpan di template promo ini
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-white hover:bg-zinc-100 border border-black rounded text-[10px] font-black uppercase shadow-[1px_1px_0_#000]"
                      >
                        Ganti Gambar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-black hover:border-black rounded-lg p-5 bg-zinc-50 hover:bg-yellow-50 text-center cursor-pointer transition space-y-2 group shadow-[2px_2px_0_#000]"
                >
                  <div className="w-10 h-10 mx-auto rounded-full bg-[#FFE600] border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000] group-hover:scale-105 transition">
                    <Upload className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-black uppercase">
                      Klik untuk Upload Gambar Promo
                    </p>
                    <p className="text-[11px] text-zinc-500 font-bold">
                      Format JPG, PNG, atau WebP (Maks. 5 MB)
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </div>

            {/* Input 3: Tulisannya / Keterangan Caption */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tulis Keterangan / Caption Promo:</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAutoGenerateCaption(true)}
                    disabled={generatingCaption}
                    className="neo-btn px-2.5 py-1 bg-[#FFE600] hover:bg-yellow-300 text-black border border-black rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-[1.5px_1.5px_0_#000]"
                    title="Buat caption otomatis dari produk yang berstatus Ready"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{generatingCaption ? 'Meracik Teks...' : 'Auto-Generate dari Stok Ready'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className="neo-btn px-2.5 py-1 bg-white hover:bg-zinc-100 text-black border border-black rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-[1.5px_1.5px_0_#000]"
                  >
                    {copiedCaption ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCaption ? 'Tersalin!' : 'Salin Teks'}</span>
                  </button>
                </div>
              </div>

              {/* Shortcut Tag Tombol */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black text-zinc-500 uppercase">Sisipkan Cepat:</span>
                {[
                  '🔥 PROMO SPESIAL',
                  '⚡ READY STOK',
                  '💎 GARANSI RESMI',
                  '🛒 https://dstore.sbs',
                  '📲 Hubungi @dewipermata03'
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setPromoCaption((prev) => (prev ? prev + '\n' + tag : tag))}
                    className="px-2 py-0.5 bg-zinc-100 hover:bg-yellow-200 border border-black rounded text-[10px] font-bold text-black shadow-[1px_1px_0_#000]"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <textarea
                rows={9}
                value={promoCaption}
                onChange={(e) => setPromoCaption(e.target.value)}
                placeholder="Tuliskan materi promosi di sini (bisa gunakan emoji, link, dan format tebal *kata* atau miring _kata_ ala Telegram)..."
                className="w-full px-3 py-2.5 border-2 border-black rounded-lg text-xs font-mono font-medium text-black focus:bg-yellow-50 focus:outline-none shadow-[2px_2px_0_#000] leading-relaxed resize-y"
              />
              <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500">
                <span>Mendukung Markdown Telegram (*tebal*, _miring_, `kode`)</span>
                <span>{promoCaption.length} Karakter</span>
              </div>
            </div>

            {/* Action Bar Simpan Promo */}
            <div className="pt-2 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSavePreset}
                disabled={savingPreset}
                className="neo-btn w-full sm:w-auto px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0_#000] transition"
              >
                <Bookmark className="w-4 h-4" />
                <span>{savingPreset ? 'Menyimpan...' : '💾 Simpan Promo & Gambar ke Riwayat'}</span>
              </button>

              <div className="text-[11px] font-bold text-zinc-600 text-center sm:text-right">
                Gambar & teks tersimpan aman di sistem
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: LIVE TELEGRAM PREVIEW & RIWAYAT PROMO TERSIMPAN (5 COLS) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. MOCKUP LIVE PREVIEW TELEGRAM */}
          <div className="neo-card bg-[#517da2] border-3 border-black shadow-[5px_5px_0_#000] overflow-hidden">
            {/* Header Mockup */}
            <div className="px-3.5 py-2.5 bg-[#436e92] border-b-2 border-black flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 border border-black"></div>
                <span className="text-xs font-black uppercase tracking-wide">
                  Pratinjau Pesan Telegram
                </span>
              </div>
              <span className="text-[10px] font-mono bg-black/30 px-2 py-0.5 rounded text-white">
                D-Store Preview
              </span>
            </div>

            {/* Body Chat Bubble */}
            <div className="p-4 space-y-3 bg-[#e4e9ed] min-h-[220px] max-h-[380px] overflow-y-auto">
              <div className="bg-white border-2 border-black rounded-xl p-3 shadow-[3px_3px_0_#000] space-y-2.5 max-w-sm ml-auto">
                {promoImage && (
                  <div className="border border-black rounded-lg overflow-hidden bg-black max-h-48 flex items-center justify-center">
                    <img
                      src={promoImage}
                      alt="Preview Foto"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="text-[11px] text-zinc-900 font-mono whitespace-pre-wrap leading-relaxed break-words">
                  {promoCaption || (
                    <span className="text-zinc-400 italic">
                      Teks promosi akan muncul di sini...
                    </span>
                  )}
                </div>
                <div className="text-[9px] text-zinc-400 text-right font-mono">
                  {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} ✓✓
                </div>
              </div>
            </div>
          </div>

          {/* 2. RIWAYAT PROMO TERSIMPAN */}
          <div className="neo-card p-4 bg-white border-3 border-black shadow-[5px_5px_0_#000] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <div className="flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-black text-black uppercase tracking-wider">
                  Riwayat Promo Tersimpan ({presets.length})
                </h4>
              </div>
              <span className="text-[10px] font-bold text-zinc-500">Klik untuk pakai ulang</span>
            </div>

            {presets.length === 0 ? (
              <div className="p-4 text-center border-2 border-dashed border-zinc-300 rounded-lg space-y-1">
                <p className="text-xs font-bold text-zinc-500">Belum ada promo yang disimpan.</p>
                <p className="text-[11px] text-zinc-400">
                  Susun materi promo lalu klik &quot;Simpan Promo &amp; Gambar&quot;.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {presets.map((pr) => {
                  const isSelected = activePresetId === pr.id;
                  return (
                    <div
                      key={pr.id}
                      onClick={() => handleUsePreset(pr)}
                      className={`p-2.5 rounded-lg border-2 border-black cursor-pointer transition flex items-center gap-3 ${
                        isSelected
                          ? 'bg-[#FFE600] shadow-[3px_3px_0_#000]'
                          : 'bg-zinc-50 hover:bg-yellow-50 shadow-[2px_2px_0_#000]'
                      }`}
                    >
                      <div className="w-12 h-12 rounded border border-black bg-zinc-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {pr.image ? (
                          <img src={pr.image} alt={pr.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-zinc-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="text-xs font-black text-black truncate uppercase">
                            {pr.title}
                          </h5>
                          <button
                            type="button"
                            onClick={(e) => handleDeletePreset(pr.id, pr.title, e)}
                            className="text-zinc-400 hover:text-rose-600 p-1"
                            title="Hapus dari riwayat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-zinc-600 line-clamp-1 font-mono">
                          {pr.caption || 'Tanpa teks'}
                        </p>
                        <span className="text-[9px] text-zinc-400 font-bold">
                          {pr.updatedAt ? new Date(pr.updatedAt).toLocaleDateString('id-ID') : 'Tersimpan'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BAGIAN 3: DIREKTORI & TARGET GRUP TELEGRAM (BISA HAPUS / PILIH)      */}
      {/* ===================================================================== */}
      <div className="neo-card p-4 sm:p-6 bg-white border-3 border-black shadow-[6px_6px_0_#000] space-y-5">
        {/* Header Grup */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-black pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#FFE600] border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0_#000]">
                <Users className="w-4 h-4 text-black" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-black uppercase tracking-tight">
                Direktori Target Grup Telegram ({targetGroups.length} Grup)
              </h3>
            </div>
            <p className="text-xs text-zinc-600 font-bold mt-1">
              Daftar grup tempat promosi akun digital. Klik &quot;Kirim ke Grup&quot; untuk salin teks &amp; buka Telegram, atau hapus grup yang tidak relevan.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowAddGroupModal(true)}
              className="neo-btn flex items-center gap-1.5 px-3 py-2 bg-[#FFE600] text-black text-xs font-black uppercase tracking-wider border-2 border-black rounded shadow-[2px_2px_0_#000] hover:bg-yellow-300"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Grup</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar Grup */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              placeholder="Cari nama grup, username @grup, atau kategori..."
              className="w-full pl-9 pr-3 py-2 border-2 border-black rounded-lg text-xs font-bold text-black focus:outline-none focus:bg-yellow-50 shadow-[2px_2px_0_#000]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedGroupCat('all')}
              className={`px-3 py-1.5 rounded-lg border-2 border-black text-[11px] font-black uppercase whitespace-nowrap shadow-[1.5px_1.5px_0_#000] ${
                selectedGroupCat === 'all' ? 'bg-black text-[#FFE600]' : 'bg-white text-black hover:bg-yellow-100'
              }`}
            >
              Semua ({targetGroups.length})
            </button>
            {groupCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedGroupCat(cat)}
                className={`px-3 py-1.5 rounded-lg border-2 border-black text-[11px] font-black uppercase whitespace-nowrap shadow-[1.5px_1.5px_0_#000] ${
                  selectedGroupCat === cat ? 'bg-black text-[#FFE600]' : 'bg-white text-black hover:bg-yellow-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Kartu Grup */}
        {filteredGroups.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-zinc-300 rounded-xl space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-zinc-400" />
            <h4 className="text-sm font-black text-black uppercase">Tidak Ada Grup yang Cocok</h4>
            <p className="text-xs text-zinc-500 font-bold">
              Coba kata kunci pencarian lain, atau klik &quot;Baca Grup dari Akun Tele&quot; untuk mengimpor dari Telegram kamu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredGroups.map((group) => {
              const usernameStr = group.username ? `@${group.username.replace(/^@/, '')}` : '-';
              return (
                <div
                  key={group.id}
                  className="neo-card p-3.5 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0_#000] flex flex-col justify-between hover:shadow-[4px_4px_0_#000] transition space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 bg-yellow-200 text-black border border-black rounded text-[9px] font-black uppercase">
                        {group.category || 'Grup Telegram'}
                      </span>
                      {group.membersCount && (
                        <span className="text-[10px] font-mono font-bold text-zinc-500">
                          👥 {Number(group.membersCount).toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-black text-black leading-snug line-clamp-2">
                      {group.title}
                    </h4>

                    {group.username ? (
                      <p className="text-[11px] font-mono font-bold text-blue-600 truncate">
                        {usernameStr}
                      </p>
                    ) : (
                      <p className="text-[10px] text-zinc-400 font-mono italic">
                        Link Pribadi / Invite
                      </p>
                    )}

                    {group.notes && (
                      <p className="text-[10px] text-zinc-600 font-bold line-clamp-1 bg-zinc-50 p-1 rounded border border-zinc-200">
                        {group.notes}
                      </p>
                    )}
                  </div>

                  {/* Tombol Aksi per Grup */}
                  <div className="pt-2 border-t border-black/10 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendToGroup(group)}
                      className="neo-btn flex-1 py-2 px-3 bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim ke Grup</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteGroup(group.id, group.title)}
                      className="neo-btn p-2 bg-rose-100 hover:bg-rose-200 text-rose-800 border-2 border-black rounded-lg text-xs font-black shadow-[2px_2px_0_#000]"
                      title="Hapus grup ini dari daftar target"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* MODAL TAMBAH GRUP MANUAL                                              */}
      {/* ===================================================================== */}
      {showAddGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="neo-card w-full max-w-md bg-white border-3 border-black shadow-[6px_6px_0_#000] p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-black" />
                <h3 className="text-sm font-black text-black uppercase tracking-wider">
                  Tambah Grup Target Baru
                </h3>
              </div>
              <button
                onClick={() => setShowAddGroupModal(false)}
                className="p-1 hover:bg-zinc-200 rounded border border-black"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>

            <form onSubmit={handleAddCustomGroup} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-black">Nama Grup / Komunitas:</label>
                <input
                  type="text"
                  required
                  value={newGroupTitle}
                  onChange={(e) => setNewGroupTitle(e.target.value)}
                  placeholder="Contoh: Komunitas Jual Beli Canva & Akun"
                  className="w-full px-3 py-2 border-2 border-black rounded text-xs font-bold focus:bg-yellow-50 focus:outline-none shadow-[2px_2px_0_#000]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-black">Username / Link Grup Telegram:</label>
                <input
                  type="text"
                  value={newGroupLink}
                  onChange={(e) => setNewGroupLink(e.target.value)}
                  placeholder="@nama_grup atau https://t.me/nama_grup"
                  className="w-full px-3 py-2 border-2 border-black rounded text-xs font-bold font-mono focus:bg-yellow-50 focus:outline-none shadow-[2px_2px_0_#000]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-black">Kategori:</label>
                <select
                  value={newGroupCategory}
                  onChange={(e) => setNewGroupCategory(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded text-xs font-black bg-white focus:bg-yellow-50 focus:outline-none shadow-[2px_2px_0_#000]"
                >
                  <option value="Jual Beli Akun">Jual Beli Akun</option>
                  <option value="Edukasi & Mahasiswa">Edukasi & Mahasiswa</option>
                  <option value="Desainer & Video">Desainer & Video</option>
                  <option value="Digital Marketer">Digital Marketer</option>
                  <option value="Komunitas Umum">Komunitas Umum</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-black">Catatan (Opsional):</label>
                <input
                  type="text"
                  value={newGroupNotes}
                  onChange={(e) => setNewGroupNotes(e.target.value)}
                  placeholder="Contoh: Boleh posting malam hari / ramah reseller"
                  className="w-full px-3 py-2 border-2 border-black rounded text-xs font-bold focus:bg-yellow-50 focus:outline-none shadow-[2px_2px_0_#000]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddGroupModal(false)}
                  className="px-3 py-2 border-2 border-black rounded text-xs font-black uppercase hover:bg-zinc-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="neo-btn px-4 py-2 bg-[#FFE600] text-black border-2 border-black rounded text-xs font-black uppercase tracking-wider shadow-[2px_2px_0_#000]"
                >
                  Simpan Grup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
