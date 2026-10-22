'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  Lock,
  Unlock,
  Eye,
  ExternalLink,
  Sliders,
  Check,
  X,
  Search,
  Plus,
  Trash2,
  Edit3,
  Save,
  RefreshCw,
  Upload,
  ArrowRight,
  Package,
  Image as ImageIcon,
  Phone,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Store,
  Building,
  Bot,
  MessageCircle,
  ExternalLink as LinkIcon,
  HelpCircle,
  Calendar,
  Clock,
  User,
  Copy,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldAlert,
  Minus,
  Send
} from 'lucide-react';
import UserAvatar from '@/app/components/UserAvatar';

export default function WorkspaceClient({ initialAuth = false, initialData = {} }) {
  // Autentikasi state
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const pinInputRef = useRef(null);

  // Tab navigasi: 'products' | 'notes' | 'suppliers' | 'banners' | 'settings'
  const [activeTab, setActiveTab] = useState('products');

  // Buku Catatan Cerdas (Pelanggan, Expired & Garansi)
  const [customerNotes, setCustomerNotes] = useState(initialData.customerNotes || []);
  const [notesFilter, setNotesFilter] = useState('active'); // 'active' | 'expiring' | 'expired' | 'all'
  const [notesSearch, setNotesSearch] = useState('');
  const [autoHideExpired, setAutoHideExpired] = useState(true);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showEditNoteModal, setShowEditNoteModal] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [updatingNote, setUpdatingNote] = useState(false);
  const [newNoteForm, setNewNoteForm] = useState({
    customerName: '',
    contactType: 'whatsapp',
    contact: '',
    productId: '',
    productName: '',
    variantName: '',
    accountDetails: '',
    supplier: 'heavenprem',
    price: 0,
    durationDays: 30,
    startDate: new Date().toISOString().split('T')[0],
    expiredDate: '',
    notes: '',
    warrantyCount: 0,
    warrantyMax: 1
  });

  // Produk, varian & supplier data
  const [products, setProducts] = useState(initialData.products || []);
  const [variants, setVariants] = useState(initialData.variants || []);
  const [categories, setCategories] = useState(initialData.categories || []);
  const [suppliers, setSuppliers] = useState(initialData.suppliers || []);
  const [productsLoading, setProductsLoading] = useState(false);

  // Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'ready' | 'empty'

  // Accordion state: Set of expanded product IDs
  const [expandedProductIds, setExpandedProductIds] = useState(new Set());

  // Input per varian: { [variantId]: { price, name, costPrice, supplier } }
  const [variantInputs, setVariantInputs] = useState({});
  const [savingVariantId, setSavingVariantId] = useState(null);

  // Edit info produk inline
  const [editingProduct, setEditingProduct] = useState(null);

  // Modal tambah produk baru
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdForm, setNewProdForm] = useState({
    name: '',
    categoryName: 'AI Tools & Productivity',
    variantName: '1 Bulan (Private)',
    price: 25000,
    costPrice: 15000,
    supplier: 'heavenprem'
  });
  const [addingProduct, setAddingProduct] = useState(false);

  // Form tambah varian baru per produk
  const [newVariantForms, setNewVariantForms] = useState({});

  // Modal / Form Tambah Toko Kulak Baru
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [targetVariantForSupplier, setTargetVariantForSupplier] = useState(null); // { type: 'variant' | 'new_variant' | 'new_product', id: string }
  const [newSuppForm, setNewSuppForm] = useState({
    name: '',
    code: '',
    contact: '@nama_bot',
    type: 'bot',
    link: '',
    note: ''
  });
  const [addingSupplier, setAddingSupplier] = useState(false);

  // Edit Toko Kulak
  const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);
  const [editSuppForm, setEditSuppForm] = useState({
    id: '',
    name: '',
    code: '',
    contact: '',
    type: 'bot',
    link: '',
    note: ''
  });
  const [updatingSupplier, setUpdatingSupplier] = useState(false);

  const startEditSupplier = (s) => {
    setEditSuppForm({
      id: s.id,
      name: s.name,
      code: s.code,
      contact: s.contact || '',
      type: s.type || 'bot',
      link: s.link || '',
      note: s.note || ''
    });
    setShowEditSupplierModal(true);
  };

  const openAddSupplierModal = (target = null) => {
    setTargetVariantForSupplier(target);
    setShowAddSupplierModal(true);
  };

  // Banner state
  const [banners, setBanners] = useState(initialData.banners || null);
  const [visualEditorData, setVisualEditorData] = useState(initialData.visualEditorData || {});
  const [bannerLoading, setBannerLoading] = useState(false);
  const [activeBannerSection, setActiveBannerSection] = useState('hero');
  const [savingBanner, setSavingBanner] = useState(false);

  // Pengaturan toko
  const [settings, setSettings] = useState({
    storeName: 'D STORE OFFICIAL',
    waNumber: '6281230112240',
    tgAdminUsername: 'dewipermata03',
    tgGroupLink: 'https://t.me/dstore00000',
    announcement: 'Flash Sale Akun Aplikasi Premium & AI Tools Resmi Bergaransi'
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // Inisialisasi variant inputs dari data
  useEffect(() => {
    if (variants && variants.length > 0) {
      const inputs = {};
      variants.forEach((v) => {
        inputs[v.id] = {
          price: v.price !== undefined ? v.price : 0,
          name: v.name || '',
          costPrice: v.costPrice !== undefined ? v.costPrice : 0,
          supplier: v.supplier || 'dstore'
        };
      });
      setVariantInputs(inputs);
    }
  }, [variants]);

  // Fokus input PIN jika belum login
  useEffect(() => {
    if (!isAuthenticated && pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, [isAuthenticated]);

  // Cek sesi status saat awal
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.warn('Gagal cek sesi:', err);
      }
    };
    checkSession();
  }, []);

  // Handler Submit PIN Login
  const handlePinSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!pin.trim()) {
      setPinError('Silakan masukkan PIN keamanan.');
      return;
    }

    setPinLoading(true);
    setPinError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', pin: pin.trim() })
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setIsAuthenticated(true);
        setPin('');
        showToast('Login berhasil. Selamat datang di D-Workspace.');
        loadProducts();
        loadBanners();
      } else {
        setPinError(data.error || 'PIN salah. Akses ditolak.');
      }
    } catch (err) {
      setPinError('Gagal menghubungi server.');
    } finally {
      setPinLoading(false);
    }
  };

  // Handler Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      });
    } catch {}
    setIsAuthenticated(false);
    setPin('');
    showToast('Sesi kerja berhasil dikunci.');
  };

  // Muat Produk & Supplier dari API
  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.status === 'ok') {
        setProducts(data.products || []);
        setVariants(data.variants || []);
        setCategories(data.categories || []);
        if (data.suppliers) setSuppliers(data.suppliers);
        if (data.customerNotes) setCustomerNotes(data.customerNotes);
      }
    } catch (err) {
      console.error('Gagal memuat produk:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Muat Banner dari API
  const loadBanners = async () => {
    setBannerLoading(true);
    try {
      const res = await fetch('/api/store/banners');
      const data = await res.json();
      if (data.status === 'ok') {
        setBanners(data.banners);
        if (data.banners?.visualEditorData) {
          setVisualEditorData(data.banners.visualEditorData);
        }
      }
    } catch (err) {
      console.error('Gagal memuat banner:', err);
    } finally {
      setBannerLoading(false);
    }
  };

  // Toggle Accordion Buka/Tutup
  const toggleProductAccordion = (productId) => {
    setExpandedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedProductIds(new Set(products.map((p) => p.id)));
  };

  const collapseAll = () => {
    setExpandedProductIds(new Set());
  };

  // Helper mencari link/kontak supplier
  const getSupplierInfo = (supplierCode) => {
    if (!supplierCode) return null;
    const clean = supplierCode.toLowerCase().trim();
    return suppliers.find((s) => s.code.toLowerCase() === clean || s.name.toLowerCase() === clean);
  };

  // 1. Toggle Stok Varian (Ready <-> Habis)
  const handleToggleStock = async (variantId, currentAvailable) => {
    const nextAvail = !currentAvailable;
    // Optimistic update
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, isAvailable: nextAvail } : v))
    );

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_stock',
          variantId,
          isAvailable: nextAvail
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        showToast(`Stok: ${nextAvail ? 'Ready (Tersedia)' : 'Habis (Kosong)'}`);
      } else {
        // Rollback
        setVariants((prev) =>
          prev.map((v) => (v.id === variantId ? { ...v, isAvailable: currentAvailable } : v))
        );
        showToast(data.message || 'Gagal mengubah stok paket', 'error');
      }
    } catch (err) {
      setVariants((prev) =>
        prev.map((v) => (v.id === variantId ? { ...v, isAvailable: currentAvailable } : v))
      );
      showToast('Gagal menghubungi server', 'error');
    }
  };

  // 2. Toggle Stok Semua Varian Produk Sekaligus
  const handleToggleProductStock = async (productId, makeAvailable) => {
    setVariants((prev) =>
      prev.map((v) => (v.productId === productId ? { ...v, isAvailable: makeAvailable } : v))
    );

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_product_stock',
          productId,
          isAvailable: makeAvailable
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        showToast(`Semua paket disetel: ${makeAvailable ? 'Ready' : 'Habis'}`);
      } else {
        showToast(data.message || 'Gagal mengubah stok produk', 'error');
        loadProducts();
      }
    } catch (err) {
      showToast('Gagal menghubungi server', 'error');
      loadProducts();
    }
  };

  // 3. Simpan Paket Varian (Harga, Modal, Supplier & Nama Sekaligus)
  const handleSaveVariant = async (variantId) => {
    const input = variantInputs[variantId] || {};
    const newPrice = Number(input.price);
    const newCost = Number(input.costPrice);
    const newSupp = (input.supplier || 'dstore').trim();
    const newName = (input.name || '').trim();

    if (isNaN(newPrice) || newPrice < 0) {
      showToast('Harga jual harus berupa nominal valid', 'error');
      return;
    }

    setSavingVariantId(variantId);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_variant',
          variantId,
          price: newPrice,
          costPrice: isNaN(newCost) ? 0 : newCost,
          supplier: newSupp,
          name: newName
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setVariants((prev) =>
          prev.map((v) =>
            v.id === variantId
              ? { ...v, price: newPrice, costPrice: newCost, supplier: newSupp, name: newName || v.name }
              : v
          )
        );
        showToast(`Tersimpan: Jual Rp ${newPrice.toLocaleString('id-ID')} (Kulak: ${newSupp})`);
      } else {
        showToast(data.message || 'Gagal menyimpan perubahan', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setSavingVariantId(null);
    }
  };

  // 4. Simpan Perubahan Info Produk
  const handleSaveProductInfo = async (productId) => {
    if (!editingProduct || editingProduct.id !== productId) return;
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_product',
          productId,
          name: editingProduct.name,
          description: editingProduct.description,
          categoryId: editingProduct.categoryId
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, ...editingProduct } : p))
        );
        setEditingProduct(null);
        showToast('Info produk berhasil diperbarui.');
      } else {
        showToast(data.message || 'Gagal menyimpan info produk', 'error');
      }
    } catch (err) {
      showToast('Gagal menghubungi server', 'error');
    }
  };

  // 5. Tambah Varian Baru ke Produk
  const handleAddVariantToProduct = async (productId) => {
    const form = newVariantForms[productId];
    if (!form || !form.name.trim()) {
      showToast('Nama paket varian wajib diisi', 'error');
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_variant',
          productId,
          variantName: form.name.trim(),
          sellingPrice: Number(form.price) || 15000,
          costPrice: Number(form.costPrice) || 0,
          supplier: form.supplier || 'heavenprem'
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        if (data.variant) {
          setVariants((prev) => [...prev, data.variant]);
          setVariantInputs((prev) => ({
            ...prev,
            [data.variant.id]: {
              price: data.variant.price,
              name: data.variant.name,
              costPrice: data.variant.costPrice || 0,
              supplier: data.variant.supplier || 'heavenprem'
            }
          }));
        }
        setNewVariantForms((prev) => ({
          ...prev,
          [productId]: { open: false, name: '', price: 20000, costPrice: 0, supplier: 'heavenprem' }
        }));
        showToast('Paket varian berhasil ditambahkan.');
      } else {
        showToast(data.message || 'Gagal menambah paket varian', 'error');
      }
    } catch (err) {
      showToast('Gagal menghubungi server', 'error');
    }
  };

  // 6. Hapus Varian
  const handleDeleteVariant = async (variantId, variantName) => {
    if (!confirm(`Hapus paket "${variantName}"?`)) return;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_variant', variantId })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setVariants((prev) => prev.filter((v) => v.id !== variantId));
        showToast(`Paket "${variantName}" dihapus.`);
      } else {
        showToast(data.message || 'Gagal menghapus varian', 'error');
      }
    } catch (err) {
      showToast('Gagal menghubungi server', 'error');
    }
  };

  // 7. Hapus Produk
  const handleDeleteProduct = async (productId, productName) => {
    if (!confirm(`Hapus produk "${productName}" beserta seluruh paketnya?`)) return;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_product', productId })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setVariants((prev) => prev.filter((v) => v.productId !== productId));
        showToast(`Produk "${productName}" dihapus.`);
      } else {
        showToast(data.message || 'Gagal menghapus produk', 'error');
      }
    } catch (err) {
      showToast('Gagal menghubungi server', 'error');
    }
  };

  // 8. Tambah Produk Baru
  const handleAddNewProduct = async (e) => {
    e.preventDefault();
    if (!newProdForm.name.trim()) {
      showToast('Nama produk wajib diisi', 'error');
      return;
    }

    setAddingProduct(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_product',
          name: newProdForm.name.trim(),
          categoryName: newProdForm.categoryName,
          variantName: newProdForm.variantName || '1 Bulan',
          sellingPrice: Number(newProdForm.price) || 20000,
          costPrice: Number(newProdForm.costPrice) || 0,
          supplier: newProdForm.supplier || 'heavenprem'
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        showToast(`Produk "${newProdForm.name}" berhasil dibuat.`);
        setShowAddProductModal(false);
        setNewProdForm({
          name: '',
          categoryName: 'AI Tools & Productivity',
          variantName: '1 Bulan (Private)',
          price: 25000,
          costPrice: 15000,
          supplier: 'heavenprem'
        });
        loadProducts();
      } else {
        showToast(data.message || 'Gagal menambah produk', 'error');
      }
    } catch (err) {
      showToast('Gagal menghubungi server', 'error');
    } finally {
      setAddingProduct(false);
    }
  };

  // 9. Tambah Toko Kulak Baru
  const handleAddNewSupplier = async (e) => {
    e.preventDefault();
    if (!newSuppForm.name.trim()) {
      showToast('Nama toko kulak wajib diisi', 'error');
      return;
    }

    setAddingSupplier(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_supplier',
          ...newSuppForm
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        if (data.suppliers) setSuppliers(data.suppliers);
        const createdCode = data.supplier?.code || newSuppForm.code || newSuppForm.name.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Auto-select ke varian atau produk yang memicu modal
        if (targetVariantForSupplier) {
          if (targetVariantForSupplier.type === 'variant') {
            const vId = targetVariantForSupplier.id;
            setVariantInputs((prev) => ({
              ...prev,
              [vId]: { ...(prev[vId] || {}), supplier: createdCode }
            }));
          } else if (targetVariantForSupplier.type === 'new_variant') {
            const pId = targetVariantForSupplier.id;
            setNewVariantForms((prev) => ({
              ...prev,
              [pId]: { ...(prev[pId] || {}), supplier: createdCode }
            }));
          } else if (targetVariantForSupplier.type === 'new_product') {
            setNewProdForm((prev) => ({
              ...prev,
              supplier: createdCode
            }));
          }
          setTargetVariantForSupplier(null);
        }

        showToast(`Toko kulak "${newSuppForm.name}" berhasil ditambahkan.`);
        setShowAddSupplierModal(false);
        setNewSuppForm({
          name: '',
          code: '',
          contact: '@nama_bot',
          type: 'bot',
          link: '',
          note: ''
        });
      } else {
        showToast(data.message || 'Gagal menambah toko kulak', 'error');
      }
    } catch (err) {
      showToast('Gagal menghubungi server', 'error');
    } finally {
      setAddingSupplier(false);
    }
  };

  // 10. Update Toko Kulak
  const handleUpdateSupplier = async (e) => {
    e.preventDefault();
    if (!editSuppForm.name.trim()) {
      showToast('Nama toko kulak wajib diisi', 'error');
      return;
    }

    setUpdatingSupplier(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_supplier',
          ...editSuppForm
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        if (data.suppliers) setSuppliers(data.suppliers);
        showToast(`Toko kulak "${editSuppForm.name}" berhasil diperbarui.`);
        setShowEditSupplierModal(false);
      } else {
        showToast(data.message || 'Gagal memperbarui toko kulak', 'error');
      }
    } catch (err) {
      showToast('Gagal menghubungi server', 'error');
    } finally {
      setUpdatingSupplier(false);
    }
  };

  // 11. Hapus Toko Kulak
  const handleDeleteSupplier = async (id, code, name) => {
    if (!confirm(`Hapus toko kulak "${name}"?`)) return;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_supplier', id, code })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        if (data.suppliers) setSuppliers(data.suppliers);
        showToast(`Toko kulak "${name}" dihapus.`);
      } else {
        showToast(data.message || 'Gagal menghapus toko kulak', 'error');
      }
    } catch (err) {
      showToast('Gagal menghubungi server', 'error');
    }
  };

  // =========================================================================
  // HELPER & HANDLER BUKU CATATAN CERDAS (ORDER / SUBSCRIPTION NOTEBOOK)
  // =========================================================================

  // Hitung sisa waktu dan status masa aktif
  const getNoteExpiryStatus = (expiredAt) => {
    if (!expiredAt) return { status: 'active', days: 0, text: 'Waktu tidak ditentukan', color: 'emerald' };
    const now = new Date();
    const exp = new Date(expiredAt);
    const diffMs = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

    if (diffMs <= 0) {
      return {
        status: 'expired',
        days: diffDays,
        isExpired: true,
        text: 'Masa Aktif Habis',
        subtext: `Berakhir ${Math.abs(diffDays)} hari lalu`,
        color: 'rose'
      };
    }
    if (diffDays <= 3) {
      return {
        status: 'expiring',
        days: diffDays,
        isExpired: false,
        text: diffHours <= 24 ? `Sisa ${diffHours} Jam Lagi` : `Sisa ${diffDays} Hari Lagi`,
        subtext: 'Segera tawarkan perpanjangan',
        color: 'amber'
      };
    }
    return {
      status: 'active',
      days: diffDays,
      isExpired: false,
      text: `Sisa ${diffDays} Hari`,
      subtext: `Hingga ${exp.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`,
      color: 'emerald'
    };
  };

  // Statistik Catatan (Aktif, Hampir Habis, Habis)
  const notesStats = useMemo(() => {
    let active = 0;
    let expiring = 0;
    let expired = 0;

    (customerNotes || []).forEach((n) => {
      const st = getNoteExpiryStatus(n.expiredAt).status;
      if (st === 'expired') expired++;
      else if (st === 'expiring') {
        expiring++;
        active++;
      } else {
        active++;
      }
    });

    return { total: (customerNotes || []).length, active, expiring, expired };
  }, [customerNotes]);

  // Filter Catatan sesuai pilihan tab dan pencarian
  const filteredCustomerNotes = useMemo(() => {
    let list = customerNotes || [];

    // Filter kategori tab
    if (notesFilter === 'active') {
      list = list.filter((n) => {
        const st = getNoteExpiryStatus(n.expiredAt).status;
        return st !== 'expired';
      });
    } else if (notesFilter === 'expiring') {
      list = list.filter((n) => getNoteExpiryStatus(n.expiredAt).status === 'expiring');
    } else if (notesFilter === 'expired') {
      list = list.filter((n) => getNoteExpiryStatus(n.expiredAt).status === 'expired');
    }

    // Auto-hide expired jika diaktifkan dan filter adalah 'all' atau 'active'
    if (autoHideExpired && notesFilter === 'all') {
      list = list.filter((n) => getNoteExpiryStatus(n.expiredAt).status !== 'expired');
    }

    // Search query
    if (notesSearch.trim()) {
      const q = notesSearch.toLowerCase().trim();
      list = list.filter(
        (n) =>
          (n.customerName || '').toLowerCase().includes(q) ||
          (n.contact || '').toLowerCase().includes(q) ||
          (n.productName || '').toLowerCase().includes(q) ||
          (n.variantName || '').toLowerCase().includes(q) ||
          (n.accountDetails || '').toLowerCase().includes(q) ||
          (n.supplier || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [customerNotes, notesFilter, notesSearch, autoHideExpired]);

  // Tambah Catatan Baru
  const handleAddNewNote = async (e) => {
    e.preventDefault();
    setAddingNote(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_customer_note',
          ...newNoteForm
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        if (data.customerNotes) setCustomerNotes(data.customerNotes);
        showToast('Catatan langganan berhasil disimpan.');
        setShowAddNoteModal(false);
        setNewNoteForm({
          customerName: '',
          contactType: 'whatsapp',
          contact: '',
          productId: '',
          productName: '',
          variantName: '',
          accountDetails: '',
          supplier: 'heavenprem',
          price: 0,
          durationDays: 30,
          startDate: new Date().toISOString().split('T')[0],
          expiredDate: '',
          notes: '',
          warrantyCount: 0,
          warrantyMax: 1
        });
      } else {
        showToast(data.message || 'Gagal menyimpan catatan', 'error');
      }
    } catch (err) {
      showToast('Gagal menghubungi server', 'error');
    } finally {
      setAddingNote(false);
    }
  };

  // Update Catatan
  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (!editingNote) return;
    setUpdatingNote(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_customer_note',
          ...editingNote
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        if (data.customerNotes) setCustomerNotes(data.customerNotes);
        showToast('Catatan berhasil diperbarui.');
        setShowEditNoteModal(false);
        setEditingNote(null);
      } else {
        showToast(data.message || 'Gagal memperbarui catatan', 'error');
      }
    } catch (err) {
      showToast('Gagal menghubungi server', 'error');
    } finally {
      setUpdatingNote(false);
    }
  };

  // Ubah Jumlah Garansi (Tinggal atur-atur angka)
  const handleUpdateWarranty = async (noteId, delta) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_warranty_count',
          id: noteId,
          delta
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        if (data.customerNotes) setCustomerNotes(data.customerNotes);
        const updated = (data.customerNotes || []).find((n) => n.id === noteId);
        showToast(`Garansi diatur: ${updated?.warrantyCount || 0}x klaim`);
      }
    } catch (err) {
      showToast('Gagal memperbarui garansi', 'error');
    }
  };

  // Perpanjang Masa Aktif Cepat (+30 Hari)
  const handleExtendNote = async (note, days = 30) => {
    const currentExp = new Date(note.expiredAt);
    const baseDate = currentExp > new Date() ? currentExp : new Date();
    const newExp = new Date(baseDate.getTime() + days * 86400000);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_customer_note',
          id: note.id,
          expiredAt: newExp.toISOString(),
          durationDays: (Number(note.durationDays) || 30) + days
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        if (data.customerNotes) setCustomerNotes(data.customerNotes);
        showToast(`Masa aktif diperpanjang +${days} hari.`);
      }
    } catch (err) {
      showToast('Gagal memperpanjang masa aktif', 'error');
    }
  };

  // Hapus Catatan
  const handleDeleteNote = async (noteId, name) => {
    if (!confirm(`Hapus catatan untuk "${name || 'Pelanggan'}"?`)) return;
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_customer_note',
          id: noteId
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        if (data.customerNotes) setCustomerNotes(data.customerNotes);
        showToast('Catatan dihapus.');
      }
    } catch (err) {
      showToast('Gagal menghapus catatan', 'error');
    }
  };

  // Bersihkan Catatan Expired
  const handleClearExpiredNotes = async () => {
    if (!confirm('Hapus permanen semua catatan yang masa aktifnya sudah habis?')) return;
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_expired_notes' })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        if (data.customerNotes) setCustomerNotes(data.customerNotes);
        showToast('Catatan expired berhasil dibersihkan.');
      }
    } catch (err) {
      showToast('Gagal membersihkan catatan expired', 'error');
    }
  };

  // Helper Template Chat WA & Telegram
  const getFollowUpLink = (note) => {
    const customer = note.customerName ? `kak ${note.customerName}` : 'kak';
    const prod = `${note.productName}${note.variantName ? ` (${note.variantName})` : ''}`;
    const expDate = note.expiredAt ? new Date(note.expiredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    const text = encodeURIComponent(
      `Halo ${customer}, kami dari D Store ingin mengingatkan bahwa masa aktif langganan ${prod} milik kakak akan berakhir pada ${expDate}.\n\nApakah mau lanjut diperpanjang agar akun tidak terputus dan profil tetap aman? Terima kasih.`
    );

    if (note.contactType === 'whatsapp') {
      let cleanPhone = (note.contact || '').replace(/[^0-9]/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
      if (!cleanPhone.startsWith('62') && cleanPhone.length > 5) cleanPhone = '62' + cleanPhone;
      return `https://wa.me/${cleanPhone}?text=${text}`;
    } else {
      let cleanTg = (note.contact || '').replace('@', '').trim();
      return `https://t.me/${cleanTg}`;
    }
  };

  // 12. Upload Gambar Banner
  const handleBannerUpload = async (file, onDone) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.status === 'ok' && data.url) {
        onDone(data.url);
        showToast('Gambar berhasil diunggah.');
      } else {
        showToast(data.message || 'Gagal mengunggah gambar', 'error');
      }
    } catch (err) {
      showToast('Gagal mengunggah file', 'error');
    }
  };

  // 12. Simpan Banner ke Backend
  const handleSaveBanners = async () => {
    setSavingBanner(true);
    try {
      const res = await fetch('/api/store/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          banners,
          visualEditorData
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        showToast('Perubahan tampilan berhasil disimpan.');
      } else {
        showToast(data.message || 'Gagal menyimpan banner', 'error');
      }
    } catch (err) {
      showToast('Gagal menyimpan ke server', 'error');
    } finally {
      setSavingBanner(false);
    }
  };

  // Filter Produk (Search, Kategori, Stok Ready/Habis)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const prodVars = variants.filter((v) => v.productId === p.id);
      const matchSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prodVars.some((v) => v.name?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat =
        selectedCat === 'all' ||
        p.categoryId === selectedCat ||
        p.category === selectedCat;

      let matchStock = true;
      if (stockFilter === 'ready') {
        matchStock = prodVars.some((v) => v.isAvailable !== false);
      } else if (stockFilter === 'empty') {
        matchStock = prodVars.length === 0 || prodVars.every((v) => v.isAvailable === false);
      }

      return matchSearch && matchCat && matchStock;
    });
  }, [products, variants, searchQuery, selectedCat, stockFilter]);

  // Statistik Ringkas
  const stats = useMemo(() => {
    const totalProd = products.length;
    const readyVars = variants.filter((v) => v.isAvailable !== false).length;
    const emptyVars = variants.length - readyVars;
    return { totalProd, readyVars, emptyVars };
  }, [products, variants]);

  // =========================================================================
  // VIEW: LOGIN PIN SCREEN (RAMAH JEMPOL MOBILE)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 selection:bg-zinc-800">
        <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 mx-auto flex items-center justify-center text-zinc-300 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">D-Workspace</h1>
            <p className="text-xs text-zinc-400">
              Pusat kendali toko. Masukkan PIN keamanan untuk membuka akses.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  ref={pinInputRef}
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (pinError) setPinError('');
                  }}
                  placeholder="Ketik PIN..."
                  maxLength={10}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-2xl px-4 py-3.5 text-center text-2xl tracking-[0.3em] font-mono font-bold text-white outline-none transition"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1.5"
                >
                  {showPin ? 'Tutup' : 'Lihat'}
                </button>
              </div>
            </div>

            {pinError && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs text-center flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={pinLoading || !pin}
              className="w-full py-3.5 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {pinLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Buka Ruang Kendali</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/store"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition inline-flex items-center gap-1"
            >
              <span>Buka Halaman Toko Pembeli</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: MAIN WORKSPACE (MOBILE-FIRST ARCHITECTURE)
  // =========================================================================
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans antialiased selection:bg-zinc-800 selection:text-white pb-32">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-fade-in pointer-events-none">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border pointer-events-auto ${
              toast.type === 'error'
                ? 'bg-rose-950 border-rose-800 text-rose-200'
                : 'bg-zinc-900 border-zinc-700 text-white'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="truncate">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Sticky Header Atas (Ringkas & Bersih) */}
      <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          
          {/* Logo & Status */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
              D
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white tracking-wider uppercase truncate">
                  D-WORKSPACE
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium block -mt-0.5">Control Center</span>
            </div>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-2 shrink-0">
            {activeTab === 'notes' ? (
              <button
                type="button"
                onClick={() => setShowAddNoteModal(true)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs flex items-center gap-1 transition shadow-sm cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Catat</span>
              </button>
            ) : activeTab === 'suppliers' ? (
              <button
                type="button"
                onClick={() => openAddSupplierModal(null)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs flex items-center gap-1 transition shadow-sm cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Kulak</span>
              </button>
            ) : activeTab === 'editor' ? (
              <Link
                href="/d-workspace/editor"
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs flex items-center gap-1 transition shadow-sm cursor-pointer active:scale-95"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Buka</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddProductModal(true)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs flex items-center gap-1 transition shadow-sm cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tambah Produk</span>
                <span className="sm:hidden">Tambah</span>
              </button>
            )}

            <Link
              href="/store"
              target="_blank"
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 hover:text-emerald-300 transition border border-zinc-700 cursor-pointer"
              title="Buka Toko Pembeli"
            >
              <Store className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition border border-zinc-700 cursor-pointer"
              title="Kunci Sesi"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2 pl-1.5 border-l border-zinc-800">
              <UserAvatar 
                user={{ email: 'ivankafipradana@gmail.com', name: 'ivan Kafi pradana' }} 
                size={30} 
              />
              <div className="hidden sm:block text-left text-[11px] leading-tight">
                <div className="font-bold text-white truncate max-w-[100px]">ivan Kafi</div>
                <div className="text-[9px] text-emerald-400 font-semibold tracking-wide">Owner Toko</div>
              </div>
            </div>
          </div>

        </div>

        {/* Tab Selector di Layar Komputer (Hidden di Layar HP) */}
        <div className="hidden sm:flex max-w-4xl mx-auto px-4 gap-2 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Produk &amp; Stok ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'notes'
                ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Buku Catatan ({notesStats.active})</span>
            {notesStats.expiring > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title={`${notesStats.expiring} langganan hampir habis`}></span>
            )}
            {notesStats.expired > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500" title={`${notesStats.expired} langganan habis`}></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('suppliers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'suppliers'
                ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Toko Kulakan ({suppliers.length})</span>
          </button>

          <Link
            href="/d-workspace/editor"
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap text-zinc-400 hover:text-white"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Editor Toko</span>
          </Link>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Kontak Toko</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 pt-3.5 space-y-4">

        {/* =========================================================================
            TAB 1: PRODUK, HARGA & STOK (DILENGKAPI PILIHAN TOKO KULAK)
        ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-3.5">
            
            {/* Search Box Sticky-friendly */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari aplikasi atau paket (misal: Canva, Netflix)..."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-600 rounded-2xl pl-10 pr-9 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Filter Pills (Horizontal Scrollable) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {/* Filter Stok */}
              <button
                type="button"
                onClick={() => setStockFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  stockFilter === 'all'
                    ? 'bg-white text-zinc-950 font-bold'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                }`}
              >
                Semua ({products.length})
              </button>

              <button
                type="button"
                onClick={() => setStockFilter(stockFilter === 'ready' ? 'all' : 'ready')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  stockFilter === 'ready'
                    ? 'bg-emerald-500 text-zinc-950 font-bold'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Ready ({stats.readyVars})</span>
              </button>

              <button
                type="button"
                onClick={() => setStockFilter(stockFilter === 'empty' ? 'all' : 'empty')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  stockFilter === 'empty'
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>Habis</span>
              </button>

              <div className="h-4 w-[1px] bg-zinc-800 shrink-0 mx-1"></div>

              {/* Kategori Pills */}
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCat(selectedCat === c.id ? 'all' : c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                    selectedCat === c.id
                      ? 'bg-zinc-200 text-zinc-950 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Sub-Header: Buka Semua / Tutup Semua */}
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1 pt-1">
              <span>Menampilkan {filteredProducts.length} aplikasi</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={expandAll}
                  className="hover:text-white transition cursor-pointer"
                >
                  Buka Semua
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="hover:text-white transition cursor-pointer"
                >
                  Tutup Semua
                </button>
              </div>
            </div>

            {/* List Produk Accordion */}
            {productsLoading && products.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 text-xs">Memuat katalog...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-zinc-500 text-xs">
                Tidak ada produk yang cocok dengan pencarian atau filter ini.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredProducts.map((p) => {
                  const prodVariants = variants.filter((v) => v.productId === p.id);
                  const isExpanded = expandedProductIds.has(p.id);
                  const readyCount = prodVariants.filter((v) => v.isAvailable !== false).length;
                  const isAllReady = prodVariants.length > 0 && readyCount === prodVariants.length;
                  const minPrice = prodVariants.length > 0
                    ? Math.min(...prodVariants.map((v) => Number(v.price) || 0))
                    : 0;
                  const newVarForm = newVariantForms[p.id] || { open: false, name: '', price: 20000, costPrice: 0, supplier: 'heavenprem' };
                  const isEditingThis = editingProduct && editingProduct.id === p.id;

                  return (
                    <div
                      key={p.id}
                      className="bg-zinc-900 border border-zinc-800/90 rounded-2xl overflow-hidden shadow-sm transition"
                    >
                      {/* Accordion Header (Ramah Sentuhan Jempol) */}
                      <div
                        onClick={() => toggleProductAccordion(p.id)}
                        className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-800/40 select-none transition"
                      >
                        {/* Kiri: Avatar Inisial & Info Nama */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/80 font-bold text-xs text-white flex items-center justify-center shrink-0 shadow-inner">
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm sm:text-base text-white truncate">
                                {p.name}
                              </h3>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-medium shrink-0">
                                {p.category || 'Umum'}
                              </span>
                            </div>
                            <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span className={readyCount > 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                                {readyCount} / {prodVariants.length} Ready
                              </span>
                              <span>•</span>
                              <span>Mulai Rp {minPrice.toLocaleString('id-ID')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Kanan: Master Saklar Cepat + Icon Chevron */}
                        <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {/* Saklar Master Produk iOS Style */}
                          <button
                            type="button"
                            onClick={() => handleToggleProductStock(p.id, !isAllReady)}
                            className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                              isAllReady ? 'bg-emerald-500' : 'bg-zinc-700'
                            }`}
                            title={isAllReady ? 'Matikan semua paket' : 'Nyalakan semua paket'}
                          >
                            <div
                              className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                                isAllReady ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>

                          <div
                            onClick={() => toggleProductAccordion(p.id)}
                            className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Accordion Body (Hanya Muncul Jika Diklik Buka) */}
                      {isExpanded && (
                        <div className="border-t border-zinc-800 bg-zinc-950/70 p-3 sm:p-4 space-y-3">
                          
                          {/* Sub-bar Aksi Produk */}
                          <div className="flex items-center justify-between gap-2 text-xs border-b border-zinc-800/80 pb-2.5">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingProduct({
                                    id: p.id,
                                    name: p.name,
                                    description: p.description || '',
                                    categoryId: p.categoryId
                                  })
                                }
                                className="text-zinc-400 hover:text-white font-medium flex items-center gap-1"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Info</span>
                              </button>
                              <span>•</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setNewVariantForms((prev) => ({
                                    ...prev,
                                    [p.id]: { open: !newVarForm.open, name: '', price: 20000, costPrice: 0, supplier: 'heavenprem' }
                                  }))
                                }
                                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Paket</span>
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="text-zinc-500 hover:text-rose-400 p-1"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Form Edit Info Produk Inline */}
                          {isEditingThis && (
                            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2 text-xs">
                              <label className="font-semibold text-zinc-300 block">Edit Nama Produk</label>
                              <input
                                type="text"
                                value={editingProduct.name}
                                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none"
                              />
                              <input
                                type="text"
                                value={editingProduct.description || ''}
                                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                placeholder="Deskripsi ringkas..."
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none"
                              />
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveProductInfo(p.id)}
                                  className="px-3 py-1.5 bg-white text-zinc-950 font-bold rounded-lg"
                                >
                                  Simpan Info
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingProduct(null)}
                                  className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg"
                                >
                                  Batal
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Form Tambah Paket Baru */}
                          {newVarForm.open && (
                            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2.5 text-xs">
                              <div className="font-bold text-white flex items-center justify-between">
                                <span>Tambah Paket Baru ke {p.name}:</span>
                                <button
                                  type="button"
                                  onClick={() => setNewVariantForms((prev) => ({ ...prev, [p.id]: { ...newVarForm, open: false } }))}
                                  className="text-zinc-500 hover:text-white"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <input
                                type="text"
                                placeholder="Nama Paket (cth: 1 Bulan Private / Sharing)"
                                value={newVarForm.name}
                                onChange={(e) => setNewVariantForms((prev) => ({ ...prev, [p.id]: { ...newVarForm, name: e.target.value } }))}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white outline-none"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-zinc-400 block mb-0.5 text-[10px]">Harga Jual Rp</label>
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    value={newVarForm.price}
                                    onChange={(e) => setNewVariantForms((prev) => ({ ...prev, [p.id]: { ...newVarForm, price: e.target.value } }))}
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-zinc-400 block mb-0.5 text-[10px]">Modal Kulak Rp</label>
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    value={newVarForm.costPrice}
                                    onChange={(e) => setNewVariantForms((prev) => ({ ...prev, [p.id]: { ...newVarForm, costPrice: e.target.value } }))}
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono outline-none"
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-0.5">
                                  <label className="text-zinc-400 block text-[10px]">Toko Kulakan / Supplier</label>
                                  <button
                                    type="button"
                                    onClick={() => openAddSupplierModal({ type: 'new_variant', id: p.id })}
                                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                                  >
                                    <Plus className="w-2.5 h-2.5" />
                                    <span>+ Toko Baru</span>
                                  </button>
                                </div>
                                <select
                                  value={newVarForm.supplier}
                                  onChange={(e) => {
                                    if (e.target.value === '__add_new__') {
                                      openAddSupplierModal({ type: 'new_variant', id: p.id });
                                      return;
                                    }
                                    setNewVariantForms((prev) => ({ ...prev, [p.id]: { ...newVarForm, supplier: e.target.value } }));
                                  }}
                                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white outline-none"
                                >
                                  {suppliers.map((s) => (
                                    <option key={s.id || s.code} value={s.code}>
                                      {s.name} ({s.contact || s.type})
                                    </option>
                                  ))}
                                  <option value="__add_new__" className="bg-zinc-800 text-emerald-400 font-bold">
                                    + Tambah Toko Baru...
                                  </option>
                                </select>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddVariantToProduct(p.id)}
                                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-sm"
                              >
                                Tambahkan Paket
                              </button>
                            </div>
                          )}

                          {/* Daftar Paket Varian */}
                          <div className="space-y-2.5">
                            {prodVariants.length === 0 ? (
                              <div className="py-4 text-center text-xs text-zinc-500">
                                Belum ada varian paket. Klik "Tambah Paket" di atas.
                              </div>
                            ) : (
                              prodVariants.map((v) => {
                                const isReady = v.isAvailable !== false;
                                const input = variantInputs[v.id] || {
                                  price: v.price || 0,
                                  name: v.name || '',
                                  costPrice: v.costPrice || 0,
                                  supplier: v.supplier || 'heavenprem'
                                };
                                const selling = Number(input.price) || 0;
                                const cost = Number(input.costPrice) || 0;
                                const margin = selling - cost;
                                const isSaving = savingVariantId === v.id;
                                const currentSuppInfo = getSupplierInfo(input.supplier);

                                return (
                                  <div
                                    key={v.id}
                                    className="p-3 sm:p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5 transition"
                                  >
                                    {/* Baris 1: Nama Paket & Saklar Stok Ready/Habis */}
                                    <div className="flex items-center justify-between gap-2.5">
                                      <input
                                        type="text"
                                        value={input.name}
                                        onChange={(e) =>
                                          setVariantInputs((prev) => ({
                                            ...prev,
                                            [v.id]: { ...input, name: e.target.value }
                                          }))
                                        }
                                        className="bg-transparent border-b border-transparent focus:border-zinc-500 text-xs sm:text-sm font-bold text-white outline-none flex-1 min-w-0"
                                        placeholder="Nama Paket"
                                      />

                                      {/* Saklar Stok Varian */}
                                      <button
                                        type="button"
                                        onClick={() => handleToggleStock(v.id, isReady)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                                          isReady
                                            ? 'bg-emerald-950 border border-emerald-600 text-emerald-400'
                                            : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                                        }`}
                                      >
                                        <span className={`w-1.5 h-1.5 rounded-full ${isReady ? 'bg-emerald-400' : 'bg-zinc-500'}`}></span>
                                        <span>{isReady ? 'READY' : 'HABIS'}</span>
                                      </button>
                                    </div>

                                    {/* Baris 2: Pemilihan Toko Kulak & Tombol Chat/Bot */}
                                    <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                        <Building className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                        <span className="text-[11px] text-zinc-400 shrink-0">Kulak di:</span>
                                        <select
                                          value={input.supplier || 'heavenprem'}
                                          onChange={(e) => {
                                            if (e.target.value === '__add_new__') {
                                              openAddSupplierModal({ type: 'variant', id: v.id });
                                              return;
                                            }
                                            setVariantInputs((prev) => ({
                                              ...prev,
                                              [v.id]: { ...input, supplier: e.target.value }
                                            }));
                                          }}
                                          className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer truncate max-w-[130px] sm:max-w-[180px]"
                                        >
                                          {suppliers.map((s) => (
                                            <option key={s.id || s.code} value={s.code} className="bg-zinc-900 text-white">
                                              {s.name}
                                            </option>
                                          ))}
                                          <option value="__add_new__" className="bg-zinc-800 text-emerald-400 font-bold">
                                            + Tambah Toko Baru...
                                          </option>
                                        </select>
                                        <button
                                          type="button"
                                          onClick={() => openAddSupplierModal({ type: 'variant', id: v.id })}
                                          className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition shrink-0"
                                          title="Tambah Toko Kulak Baru"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>

                                      {/* Tombol Cepat Buka Bot / Chat Supplier */}
                                      {currentSuppInfo?.link && (
                                        <a
                                          href={currentSuppInfo.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold border border-zinc-700 transition shrink-0"
                                          title={`Buka chat ${currentSuppInfo.name}`}
                                        >
                                          <Bot className="w-3 h-3 text-blue-400" />
                                          <span>Buka {currentSuppInfo.contact || 'Chat'}</span>
                                          <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
                                        </a>
                                      )}
                                    </div>

                                    {/* Baris 3: Kolom Harga Jual, Modal Kulak, Profit & Tombol Simpan */}
                                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/60 flex-wrap">
                                      {/* Input Modal & Margin Laba */}
                                      <div className="flex items-center gap-2 text-xs">
                                        <div>
                                          <span className="text-[10px] text-zinc-500 block">Modal Kulak Rp</span>
                                          <input
                                            type="number"
                                            inputMode="numeric"
                                            value={input.costPrice}
                                            onChange={(e) =>
                                              setVariantInputs((prev) => ({
                                                ...prev,
                                                [v.id]: { ...input, costPrice: e.target.value }
                                              }))
                                            }
                                            className="w-20 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs font-mono text-zinc-300 outline-none"
                                          />
                                        </div>

                                        <div className="pt-2">
                                          <span className={`text-[11px] font-bold block ${margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            Profit: {margin >= 0 ? `+Rp ${margin.toLocaleString('id-ID')}` : `-Rp ${Math.abs(margin).toLocaleString('id-ID')}`}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Input Harga Jual + Tombol Simpan */}
                                      <div className="flex items-center gap-1.5 ml-auto">
                                        <div>
                                          <span className="text-[10px] text-zinc-500 block">Harga Jual Rp</span>
                                          <div className="flex items-center bg-zinc-950 border border-zinc-700 focus-within:border-zinc-500 rounded-xl px-2 py-1">
                                            <input
                                              type="number"
                                              inputMode="numeric"
                                              value={input.price}
                                              onChange={(e) =>
                                                setVariantInputs((prev) => ({
                                                  ...prev,
                                                  [v.id]: { ...input, price: e.target.value }
                                                }))
                                              }
                                              className="w-20 sm:w-24 bg-transparent text-xs sm:text-sm font-mono font-bold text-white outline-none"
                                            />
                                          </div>
                                        </div>

                                        <div className="pt-3.5 flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => handleSaveVariant(v.id)}
                                            disabled={isSaving}
                                            className="p-2 px-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1 shadow-sm"
                                            title="Simpan perubahan harga & toko kulak"
                                          >
                                            {isSaving ? (
                                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                              <>
                                                <Check className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">Simpan</span>
                                              </>
                                            )}
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => handleDeleteVariant(v.id, v.name)}
                                            className="p-2 text-zinc-600 hover:text-rose-400 transition"
                                            title="Hapus Paket"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB: BUKU CATATAN CERDAS (ORDER & GARANSI) - SIMPLE & ENAK DILIHAT
        ========================================================================= */}
        {activeTab === 'notes' && (
          <div className="space-y-3 sm:space-y-4">
            
            {/* Filter Berbasis Warna (Hijau = Aktif, Kuning = Hampir Habis, Merah = Habis, Netral = Semua) */}
            <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800/80 text-xs">
              {/* Hijau = Aktif */}
              <button
                type="button"
                onClick={() => setNotesFilter('active')}
                title="Aktif"
                className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  notesFilter === 'active'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : 'text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/5'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50"></span>
                <span className="font-mono text-xs">{notesStats.active}</span>
              </button>

              {/* Kuning = Hampir Habis */}
              <button
                type="button"
                onClick={() => setNotesFilter('expiring')}
                title="Hampir Habis"
                className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  notesFilter === 'expiring'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                    : 'text-zinc-400 hover:text-amber-400 hover:bg-amber-500/5'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-500/50"></span>
                <span className="font-mono text-xs">{notesStats.expiring}</span>
              </button>

              {/* Merah = Habis */}
              <button
                type="button"
                onClick={() => {
                  setNotesFilter('expired');
                  setAutoHideExpired(false);
                }}
                title="Habis"
                className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  notesFilter === 'expired'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                    : 'text-zinc-400 hover:text-rose-400 hover:bg-rose-500/5'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-500/50"></span>
                <span className="font-mono text-xs">{notesStats.expired}</span>
              </button>

              {/* Netral = Semua */}
              <button
                type="button"
                onClick={() => setNotesFilter('all')}
                title="Semua"
                className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  notesFilter === 'all'
                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span>Semua</span>
                <span className="font-mono text-xs opacity-70 font-normal">({notesStats.total})</span>
              </button>
            </div>

            {/* Bar Pencarian & Tombol Hapus Habis */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={notesSearch}
                  onChange={(e) => setNotesSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800/80 text-white placeholder-zinc-500 text-xs outline-none focus:border-zinc-700 transition"
                />
                {notesSearch && (
                  <button
                    type="button"
                    onClick={() => setNotesSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Tombol Bersihkan jika di tab expired */}
              {notesFilter === 'expired' && notesStats.expired > 0 && (
                <button
                  type="button"
                  onClick={handleClearExpiredNotes}
                  className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-800/80 transition shrink-0"
                >
                  Hapus Habis
                </button>
              )}
            </div>

            {/* List Kartu Catatan Pelanggan (Modern, Bersih & Enak Dilihat) */}
            {filteredCustomerNotes.length === 0 ? (
              <div className="py-12 text-center bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-2.5">
                <FileText className="w-7 h-7 text-zinc-600 mx-auto" />
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm text-white">Tidak ada catatan</h4>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                    {notesSearch
                      ? 'Tidak ada catatan yang cocok dengan pencarian.'
                      : 'Tidak ada catatan.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredCustomerNotes.map((note) => {
                  const expInfo = getNoteExpiryStatus(note.expiredAt);
                  const suppInfo = getSupplierInfo(note.supplier);
                  const followUpUrl = getFollowUpLink(note);

                  return (
                    <div
                      key={note.id}
                      className={`p-3.5 rounded-2xl bg-zinc-900 border transition space-y-2.5 shadow-sm ${
                        expInfo.status === 'expired'
                          ? 'border-zinc-800/60 bg-zinc-900/40 opacity-75'
                          : expInfo.status === 'expiring'
                          ? 'border-amber-500/40 bg-zinc-900 shadow-amber-500/5'
                          : 'border-zinc-800/90 hover:border-zinc-700'
                      }`}
                    >
                      {/* Baris Atas: Nama Pembeli, Kontak, & Badge Sisa Waktu */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-sm text-white truncate">
                              {note.customerName || note.contact || 'Tanpa Nama'}
                            </span>
                            {note.customerEmail && (
                              <span className="text-[11px] text-zinc-400 font-mono">
                                ({note.customerEmail})
                              </span>
                            )}
                            {note.orderId && (
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
                                <Store className="w-2.5 h-2.5" />
                                <span>{note.orderId}</span>
                              </span>
                            )}
                            {note.contact && (
                              <span className="text-[11px] text-zinc-400 font-mono inline-flex items-center gap-1 bg-zinc-950 px-1.5 py-0.5 rounded-md border border-zinc-800">
                                {note.contactType === 'telegram' ? (
                                  <Bot className="w-3 h-3 text-sky-400 shrink-0" />
                                ) : (
                                  <MessageCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                                )}
                                <span>{note.contact}</span>
                              </span>
                            )}
                          </div>

                          {/* Waktu Pembelian Presisi dari Pembeli */}
                          {note.orderTime && (
                            <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-1 font-mono">
                              <Clock className="w-3 h-3 text-zinc-500 shrink-0" />
                              <span>Waktu Beli: <strong className="text-zinc-300 font-normal">{note.orderTime}</strong></span>
                            </div>
                          )}
                        </div>

                        {/* Status Masa Aktif (Warna & Waktu Ringkas) */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                              expInfo.status === 'expired'
                                ? 'bg-rose-950/80 text-rose-400 border-rose-800/80'
                                : expInfo.status === 'expiring'
                                ? 'bg-amber-950 text-amber-300 border-amber-600/80'
                                : 'bg-emerald-950 text-emerald-300 border-emerald-700/80'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                expInfo.status === 'expired'
                                  ? 'bg-rose-400'
                                  : expInfo.status === 'expiring'
                                  ? 'bg-amber-400 animate-pulse'
                                  : 'bg-emerald-400'
                              }`}
                            ></span>
                            <span>
                              {expInfo.status === 'expired'
                                ? 'Habis'
                                : expInfo.days <= 0
                                ? 'Hari Ini'
                                : `${expInfo.days}h`}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Baris Tengah: Produk, Varian, Detail Akun & Supplier */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap font-medium">
                          <span className="text-white font-bold">{note.productName}</span>
                          {note.variantName && (
                            <span className="text-zinc-400 text-xs">({note.variantName})</span>
                          )}
                          {note.price > 0 && (
                            <span className="text-emerald-400 font-semibold text-xs ml-auto">
                              Rp {Number(note.price).toLocaleString('id-ID')}
                            </span>
                          )}
                          {note.supplier && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 px-1.5 py-0.5 rounded-md bg-zinc-950 border border-zinc-800" title="Supplier">
                              <Building className="w-2.5 h-2.5 text-zinc-500" />
                              <span>{suppInfo?.name || note.supplier}</span>
                            </span>
                          )}
                        </div>

                        {/* Akun Login (Jika ada) */}
                        {note.accountDetails && (
                          <div className="flex items-center justify-between gap-2 p-1.5 px-2 rounded-lg bg-zinc-950 border border-zinc-800/80 font-mono text-[11px] text-zinc-300">
                            <div className="flex items-center gap-1.5 min-w-0 truncate">
                              <User className="w-3 h-3 text-zinc-500 shrink-0" />
                              <span className="truncate">{note.accountDetails}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(note.accountDetails);
                                showToast('Detail akun disalin.');
                              }}
                              className="text-zinc-400 hover:text-white shrink-0 p-1 rounded hover:bg-zinc-800 transition cursor-pointer"
                              title="Salin"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Waktu Mulai & Berakhir */}
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
                          <div className="flex items-center gap-1.5 font-mono">
                            <Calendar className="w-3 h-3 text-zinc-500 shrink-0" />
                            <span>
                              {note.startDate ? new Date(note.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                              {' → '}
                              <strong className="text-zinc-200">
                                {note.expiredAt ? new Date(note.expiredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                              </strong>
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleExtendNote(note, 30)}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-800/60 transition cursor-pointer"
                          >
                            +30h
                          </button>
                        </div>

                        {note.notes && (
                          <div className="text-[11px] text-zinc-400 italic flex items-center gap-1.5 pt-0.5">
                            <FileText className="w-3 h-3 text-zinc-500 shrink-0" />
                            <span>{note.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Baris Bawah: Pengatur Garansi & Tombol Chat/Edit */}
                      <div className="pt-2 border-t border-zinc-800/70 flex items-center justify-between gap-2">
                        
                        {/* Garansi Ikut Masa Aktif Pesanan */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <div className="flex items-center gap-1" title="Klaim Garansi">
                            <ShieldAlert className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <div className="inline-flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-0.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateWarranty(note.id, -1)}
                                disabled={(note.warrantyCount || 0) <= 0}
                                className="w-6 h-6 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>

                              <span className={`w-6 text-center font-mono font-extrabold text-xs ${
                                (note.warrantyCount || 0) > 0 ? 'text-amber-400' : 'text-zinc-400'
                              }`}>
                                {note.warrantyCount || 0}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleUpdateWarranty(note.id, 1)}
                                className="w-6 h-6 rounded-lg text-emerald-400 hover:text-emerald-300 flex items-center justify-center transition cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                            expInfo.status === 'expired'
                              ? 'bg-rose-950/40 text-rose-400 border-rose-800/60'
                              : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                          }`}>
                            {expInfo.status === 'expired' 
                              ? `Garansi ${note.durationDays || 30}h Selesai` 
                              : `Garansi ${note.durationDays || 30}h Aktif`}
                          </span>
                        </div>

                        {/* Action Buttons: Chat & Menu */}
                        <div className="flex items-center gap-1.5">
                          {note.contact && (
                            <a
                              href={followUpUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                                expInfo.status === 'expiring'
                                  ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold shadow-sm'
                                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                              }`}
                            >
                              {note.contactType === 'telegram' ? (
                                <Bot className="w-3 h-3 text-sky-400" />
                              ) : (
                                <MessageCircle className="w-3 h-3 text-emerald-400" />
                              )}
                              <span>Chat</span>
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setEditingNote({ ...note });
                              setShowEditNoteModal(true);
                            }}
                            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id, note.customerName)}
                            className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            TAB 2: DAFTAR TOKO KULAKAN (SUPPLIER HUB) - SIMPLE & RINGKAS
        ========================================================================= */}
        {activeTab === 'suppliers' && (
          <div className="space-y-3">
            {/* List Toko Kulakan Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {suppliers.map((s) => {
                const suppliedVariants = variants.filter(
                  (v) => (v.supplier || '').toLowerCase() === s.code.toLowerCase()
                );

                return (
                  <div
                    key={s.id || s.code}
                    className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2.5 shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-extrabold text-sm text-white truncate">{s.name}</h4>
                            {s.contact && (
                              <span className="text-[11px] text-zinc-400 font-mono inline-flex items-center gap-1 bg-zinc-950 px-1.5 py-0.5 rounded-md border border-zinc-800">
                                {s.type === 'whatsapp' ? (
                                  <MessageCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                                ) : s.type === 'bot' ? (
                                  <Bot className="w-3 h-3 text-sky-400 shrink-0" />
                                ) : (
                                  <Store className="w-3 h-3 text-zinc-400 shrink-0" />
                                )}
                                <span>{s.contact}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {s.code !== 'dstore' && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => startEditSupplier(s)}
                              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSupplier(s.id, s.code, s.name)}
                              className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {s.note && (
                        <p className="text-xs text-zinc-400 italic bg-zinc-950/70 p-2 rounded-xl border border-zinc-800/60 line-clamp-2">
                          {s.note}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-zinc-800/70 flex items-center justify-between gap-2 text-xs">
                      <span className="text-zinc-500 text-[11px] flex items-center gap-1 font-mono">
                        <Package className="w-3 h-3 text-zinc-600" />
                        <span>{suppliedVariants.length} varian</span>
                      </span>

                      {s.link ? (
                        <a
                          href={s.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1.5 transition border border-zinc-700 cursor-pointer"
                        >
                          {s.type === 'whatsapp' ? (
                            <MessageCircle className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Bot className="w-3 h-3 text-sky-400" />
                          )}
                          <span>Chat</span>
                          <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-zinc-500 px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800">
                          Mandiri
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB: EDITOR VISUAL & GAMBAR TOKO
        ========================================================================= */}
        {(activeTab === 'editor' || activeTab === 'banners') && (
          <div className="py-4">
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-4 shadow-sm max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <Sliders className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-white">Editor Visual Toko</h3>
                <p className="text-xs text-zinc-400">
                  Ubah banner, foto kategori, foto produk, dan teks toko secara langsung dengan mengetuk elemen pada tampilan toko.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/d-workspace/editor"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition shadow-sm w-full cursor-pointer active:scale-95"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Buka Editor Visual</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-600" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: KONTAK & PENGATURAN TOKO
        ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase">Informasi &amp; Kontak Toko</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Nomor WhatsApp ini otomatis menjadi tujuan checkout saat pembeli memesan di toko.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1 font-semibold">Nama Toko</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3 py-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-semibold">Nomor WhatsApp CS (Awali 628...)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={settings.waNumber}
                  onChange={(e) => setSettings({ ...settings, waNumber: e.target.value })}
                  placeholder="6281230112240"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3 py-2.5 text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-semibold">Username Telegram CS (Tanpa tanda @)</label>
                <input
                  type="text"
                  value={settings.tgAdminUsername}
                  onChange={(e) => setSettings({ ...settings, tgAdminUsername: e.target.value })}
                  placeholder="dewipermata03"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3 py-2.5 text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-semibold">Teks Pengumuman Promo Berjalan</label>
                <input
                  type="text"
                  value={settings.announcement}
                  onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                  placeholder="Flash Sale Akun Premium & AI Tools Resmi..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3 py-2.5 text-white outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSavingSettings(true);
                setTimeout(() => {
                  setSavingSettings(false);
                  showToast('Pengaturan toko berhasil disimpan.');
                }, 350);
              }}
              disabled={savingSettings}
              className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition shadow-sm cursor-pointer"
            >
              {savingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        )}

      </main>

      {/* =========================================================================
          BOTTOM NAVIGATION BAR (RAMAH JEMPOL MOBILE)
      ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 py-2 px-2 shadow-2xl">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 text-center">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'products' ? 'text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Package className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Produk</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition cursor-pointer relative ${
              activeTab === 'notes' ? 'text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className="relative">
              <FileText className="w-5 h-5 mb-0.5" />
              {notesStats.expiring > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-zinc-900"></span>
              )}
              {notesStats.expired > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-zinc-900"></span>
              )}
            </div>
            <span className="text-[10px]">Catatan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('suppliers')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'suppliers' ? 'text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Building className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Kulakan</span>
          </button>

          <Link
            href="/d-workspace/editor"
            className="flex flex-col items-center justify-center py-1.5 rounded-xl transition cursor-pointer text-zinc-500 hover:text-zinc-300"
          >
            <Sliders className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Editor</span>
          </Link>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'settings' ? 'text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Phone className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Kontak</span>
          </button>
        </div>
      </nav>

      {/* Modal Tambah Produk Baru */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-sm text-white">Tambah Produk Baru</h3>
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Nama Produk</label>
                <input
                  type="text"
                  placeholder="Contoh: Canva Pro, Claude Pro..."
                  value={newProdForm.name}
                  onChange={(e) => setNewProdForm({ ...newProdForm, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-zinc-500"
                  required
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Kategori</label>
                <select
                  value={newProdForm.categoryName}
                  onChange={(e) => setNewProdForm({ ...newProdForm, categoryName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-zinc-500"
                >
                  <option value="AI Tools & Productivity">AI Tools &amp; Productivity</option>
                  <option value="Streaming & Movies">Streaming &amp; Movies</option>
                  <option value="Music & Audio">Music &amp; Audio</option>
                  <option value="Design & Creative">Design &amp; Creative</option>
                  <option value="VPN & Security">VPN &amp; Security</option>
                  <option value="Cloud & Utility">Cloud &amp; Utility</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Nama Paket Awal</label>
                <input
                  type="text"
                  placeholder="Contoh: 1 Bulan Private"
                  value={newProdForm.variantName}
                  onChange={(e) => setNewProdForm({ ...newProdForm, variantName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-zinc-400 block mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={newProdForm.price}
                    onChange={(e) => setNewProdForm({ ...newProdForm, price: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Modal Kulak (Rp)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={newProdForm.costPrice}
                    onChange={(e) => setNewProdForm({ ...newProdForm, costPrice: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-400 block">Toko Kulakan / Supplier</label>
                  <button
                    type="button"
                    onClick={() => openAddSupplierModal({ type: 'new_product' })}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Toko Baru</span>
                  </button>
                </div>
                <select
                  value={newProdForm.supplier}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      openAddSupplierModal({ type: 'new_product' });
                      return;
                    }
                    setNewProdForm({ ...newProdForm, supplier: e.target.value });
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-zinc-500"
                >
                  {suppliers.map((s) => (
                    <option key={s.id || s.code} value={s.code}>
                      {s.name} ({s.contact || s.type})
                    </option>
                  ))}
                  <option value="__add_new__" className="bg-zinc-800 text-emerald-400 font-bold">
                    + Tambah Toko Baru...
                  </option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addingProduct}
                  className="px-5 py-2 rounded-xl bg-white text-zinc-950 font-bold hover:bg-zinc-200 disabled:opacity-50"
                >
                  {addingProduct ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Toko Kulak Baru */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Tambah Toko Kulak</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSupplierModal(false)}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewSupplier} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Nama Toko</label>
                <input
                  type="text"
                  placeholder="Nama toko / supplier"
                  value={newSuppForm.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    const autoCode = val.toLowerCase().replace(/[^a-z0-9]/g, '');
                    setNewSuppForm({ ...newSuppForm, name: val, code: autoCode });
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-zinc-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-zinc-400 block mb-1">Jenis</label>
                  <select
                    value={newSuppForm.type}
                    onChange={(e) => setNewSuppForm({ ...newSuppForm, type: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-zinc-500 font-semibold"
                  >
                    <option value="bot">Bot Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="manual">Manual / Channel</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Kontak</label>
                  <input
                    type="text"
                    placeholder="@username / 08..."
                    value={newSuppForm.contact}
                    onChange={(e) => {
                      const c = e.target.value;
                      let link = newSuppForm.link;
                      if (c.startsWith('@')) link = `https://t.me/${c.replace('@', '')}`;
                      setNewSuppForm({ ...newSuppForm, contact: c, link });
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-zinc-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Tautan</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newSuppForm.link}
                  onChange={(e) => setNewSuppForm({ ...newSuppForm, link: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-zinc-500 font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Catatan</label>
                <input
                  type="text"
                  placeholder="Catatan khusus jika ada"
                  value={newSuppForm.note}
                  onChange={(e) => setNewSuppForm({ ...newSuppForm, note: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-zinc-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addingSupplier}
                  className="px-5 py-2 rounded-xl bg-white text-zinc-950 font-bold hover:bg-zinc-200 disabled:opacity-50 shadow-sm"
                >
                  {addingSupplier ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Toko Kulak */}
      {showEditSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm text-white">Edit Toko Kulak</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditSupplierModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Nama Toko</label>
                <input
                  type="text"
                  value={editSuppForm.name}
                  onChange={(e) => setEditSuppForm({ ...editSuppForm, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-zinc-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-zinc-400 block mb-1">Jenis</label>
                  <select
                    value={editSuppForm.type}
                    onChange={(e) => setEditSuppForm({ ...editSuppForm, type: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-zinc-500 font-semibold"
                  >
                    <option value="bot">Bot Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="manual">Manual / Channel</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Kontak</label>
                  <input
                    type="text"
                    placeholder="@username / 08..."
                    value={editSuppForm.contact}
                    onChange={(e) => {
                      const c = e.target.value;
                      let link = editSuppForm.link;
                      if (c.startsWith('@')) link = `https://t.me/${c.replace('@', '')}`;
                      setEditSuppForm({ ...editSuppForm, contact: c, link });
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-zinc-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Tautan</label>
                <input
                  type="text"
                  value={editSuppForm.link}
                  onChange={(e) => setEditSuppForm({ ...editSuppForm, link: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-zinc-500 font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Catatan</label>
                <input
                  type="text"
                  value={editSuppForm.note}
                  onChange={(e) => setEditSuppForm({ ...editSuppForm, note: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-zinc-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditSupplierModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updatingSupplier}
                  className="px-5 py-2 rounded-xl bg-white text-zinc-950 font-bold hover:bg-zinc-200 disabled:opacity-50"
                >
                  {updatingSupplier ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CATAT ORDER / LANGGANAN BARU
      ========================================================================= */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Catat Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddNoteModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewNote} className="space-y-3.5 text-xs">
              
              {/* Nama */}
              <div>
                <label className="text-zinc-400 block mb-1">Nama</label>
                <input
                  type="text"
                  placeholder="Nama pembeli"
                  value={newNoteForm.customerName}
                  onChange={(e) => setNewNoteForm({ ...newNoteForm, customerName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-zinc-500"
                />
              </div>

              {/* Kontak */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 block">Kontak</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <select
                      value={newNoteForm.contactType}
                      onChange={(e) => setNewNoteForm({ ...newNoteForm, contactType: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-white outline-none focus:border-zinc-500 font-semibold"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="telegram">Telegram</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder={newNoteForm.contactType === 'whatsapp' ? '08...' : '@username'}
                      value={newNoteForm.contact}
                      onChange={(e) => setNewNoteForm({ ...newNoteForm, contact: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-zinc-500 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Produk & Varian */}
              <div className="space-y-2">
                <div>
                  <label className="text-zinc-400 block mb-1">Produk</label>
                  <select
                    value={newNoteForm.productId}
                    onChange={(e) => {
                      const pId = e.target.value;
                      const selProd = products.find((p) => p.id === pId);
                      const prodVars = variants.filter((v) => v.productId === pId);
                      const firstVar = prodVars[0];
                      setNewNoteForm({
                        ...newNoteForm,
                        productId: pId,
                        productName: selProd ? selProd.name : newNoteForm.productName,
                        variantName: firstVar ? firstVar.name : '',
                        supplier: firstVar?.supplier || newNoteForm.supplier,
                        price: firstVar?.price || 0
                      });
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-zinc-500 font-semibold"
                  >
                    <option value="">-- Pilih Produk --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                    <option value="__custom__">+ Kustom...</option>
                  </select>
                </div>

                {newNoteForm.productId === '__custom__' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-zinc-400 block mb-0.5 text-[10px]">Nama Produk</label>
                      <input
                        type="text"
                        placeholder="Nama produk"
                        value={newNoteForm.productName}
                        onChange={(e) => setNewNoteForm({ ...newNoteForm, productName: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-0.5 text-[10px]">Varian</label>
                      <input
                        type="text"
                        placeholder="Paket / varian"
                        value={newNoteForm.variantName}
                        onChange={(e) => setNewNoteForm({ ...newNoteForm, variantName: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>
                ) : newNoteForm.productId ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-zinc-400 block mb-0.5 text-[10px]">Varian</label>
                      <select
                        value={newNoteForm.variantName}
                        onChange={(e) => {
                          const vName = e.target.value;
                          const matchVar = variants.find(
                            (v) => v.productId === newNoteForm.productId && v.name === vName
                          );
                          setNewNoteForm({
                            ...newNoteForm,
                            variantName: vName,
                            supplier: matchVar?.supplier || newNoteForm.supplier,
                            price: matchVar?.price || newNoteForm.price
                          });
                        }}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-white outline-none"
                      >
                        {variants
                          .filter((v) => v.productId === newNoteForm.productId)
                          .map((v) => (
                            <option key={v.id} value={v.name}>
                              {v.name} (Rp {Number(v.price).toLocaleString('id-ID')})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-0.5 text-[10px]">Supplier</label>
                      <select
                        value={newNoteForm.supplier}
                        onChange={(e) => setNewNoteForm({ ...newNoteForm, supplier: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-white outline-none"
                      >
                        {suppliers.map((s) => (
                          <option key={s.id || s.code} value={s.code}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Akun / Login */}
              <div>
                <label className="text-zinc-400 block mb-1">Akun / Login</label>
                <input
                  type="text"
                  placeholder="Email, Password, Profil/PIN"
                  value={newNoteForm.accountDetails}
                  onChange={(e) => setNewNoteForm({ ...newNoteForm, accountDetails: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none font-mono text-xs focus:border-zinc-500"
                />
              </div>

              {/* Masa Aktif */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 block">Masa Aktif</label>
                
                {/* Preset Durasi */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { label: '1 Hari', days: 1 },
                    { label: '7 Hari', days: 7 },
                    { label: '30 Hari', days: 30 },
                    { label: '60 Hari', days: 60 },
                    { label: '90 Hari', days: 90 },
                    { label: '1 Tahun', days: 365 }
                  ].map((p) => (
                    <button
                      key={p.days}
                      type="button"
                      onClick={() => setNewNoteForm({ ...newNoteForm, durationDays: p.days, expiredDate: '' })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 cursor-pointer ${
                        Number(newNoteForm.durationDays) === p.days && !newNoteForm.expiredDate
                          ? 'bg-white text-zinc-950 font-bold'
                          : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-zinc-500 block text-[10px] mb-0.5">Mulai</label>
                    <input
                      type="date"
                      value={newNoteForm.startDate}
                      onChange={(e) => setNewNoteForm({ ...newNoteForm, startDate: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-white outline-none font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-500 block text-[10px] mb-0.5">Berakhir</label>
                    <input
                      type="date"
                      value={newNoteForm.expiredDate}
                      onChange={(e) => setNewNoteForm({ ...newNoteForm, expiredDate: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-white outline-none font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Garansi */}
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-zinc-400" />
                  <span className="font-bold text-white text-xs">Garansi</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setNewNoteForm({
                        ...newNoteForm,
                        warrantyCount: Math.max(0, (newNoteForm.warrantyCount || 0) - 1)
                      })
                    }
                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center border border-zinc-700 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-mono font-bold text-sm text-white">
                    {newNoteForm.warrantyCount || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setNewNoteForm({
                        ...newNoteForm,
                        warrantyCount: (newNoteForm.warrantyCount || 0) + 1
                      })
                    }
                    className="w-8 h-8 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold flex items-center justify-center border border-emerald-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="text-zinc-400 block mb-1">Catatan</label>
                <input
                  type="text"
                  placeholder="Catatan tambahan"
                  value={newNoteForm.notes}
                  onChange={(e) => setNewNoteForm({ ...newNoteForm, notes: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-zinc-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addingNote}
                  className="px-5 py-2 rounded-xl bg-white text-zinc-950 font-bold hover:bg-zinc-200 disabled:opacity-50 shadow-sm"
                >
                  {addingNote ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT CATATAN LANGGANAN
      ========================================================================= */}
      {showEditNoteModal && editingNote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm text-white">Edit Catatan</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditNoteModal(false);
                  setEditingNote(null);
                }}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateNote} className="space-y-3.5 text-xs">
              
              {/* Nama */}
              <div>
                <label className="text-zinc-400 block mb-1">Nama</label>
                <input
                  type="text"
                  value={editingNote.customerName || ''}
                  onChange={(e) => setEditingNote({ ...editingNote, customerName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-zinc-500"
                />
              </div>

              {/* Kontak */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 block">Kontak</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <select
                      value={editingNote.contactType || 'whatsapp'}
                      onChange={(e) => setEditingNote({ ...editingNote, contactType: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-white outline-none font-semibold"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="telegram">Telegram</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={editingNote.contact || ''}
                      onChange={(e) => setEditingNote({ ...editingNote, contact: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Produk & Varian */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">Produk</label>
                  <input
                    type="text"
                    value={editingNote.productName || ''}
                    onChange={(e) => setEditingNote({ ...editingNote, productName: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Varian</label>
                  <input
                    type="text"
                    value={editingNote.variantName || ''}
                    onChange={(e) => setEditingNote({ ...editingNote, variantName: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              {/* Toko Kulakan */}
              <div>
                <label className="text-zinc-400 block mb-1">Supplier</label>
                <select
                  value={editingNote.supplier || 'heavenprem'}
                  onChange={(e) => setEditingNote({ ...editingNote, supplier: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none"
                >
                  {suppliers.map((s) => (
                    <option key={s.id || s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Detail Akun / Kredensial */}
              <div>
                <label className="text-zinc-400 block mb-1">Akun / Login</label>
                <input
                  type="text"
                  value={editingNote.accountDetails || ''}
                  onChange={(e) => setEditingNote({ ...editingNote, accountDetails: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none font-mono text-xs"
                />
              </div>

              {/* Tanggal Berakhir Masa Aktif */}
              <div>
                <label className="text-zinc-400 block mb-1">Berakhir</label>
                <input
                  type="date"
                  value={
                    editingNote.expiredAt
                      ? new Date(editingNote.expiredAt).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) => setEditingNote({ ...editingNote, expiredAt: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none font-mono"
                  required
                />
              </div>

              {/* Garansi */}
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-zinc-400" />
                  <span className="font-bold text-white text-xs">Garansi</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingNote({
                        ...editingNote,
                        warrantyCount: Math.max(0, (editingNote.warrantyCount || 0) - 1)
                      })
                    }
                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center border border-zinc-700 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-mono font-bold text-sm text-white">
                    {editingNote.warrantyCount || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingNote({
                        ...editingNote,
                        warrantyCount: (editingNote.warrantyCount || 0) + 1
                      })
                    }
                    className="w-8 h-8 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold flex items-center justify-center border border-emerald-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="text-zinc-400 block mb-1">Catatan</label>
                <input
                  type="text"
                  value={editingNote.notes || ''}
                  onChange={(e) => setEditingNote({ ...editingNote, notes: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditNoteModal(false);
                    setEditingNote(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updatingNote}
                  className="px-5 py-2 rounded-xl bg-white text-zinc-950 font-bold hover:bg-zinc-200 disabled:opacity-50"
                >
                  {updatingNote ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
