'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Package, 
  Store, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  DownloadCloud, 
  UploadCloud, 
  Plus, 
  Search, 
  Edit3, 
  AlertCircle, 
  Send, 
  Copy, 
  Check, 
  TrendingUp, 
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  Layers,
  ShieldAlert,
  ArrowRightLeft,
  FileSpreadsheet,
  FileDown,
  Database,
  Columns,
  PlusCircle,
  Code,
  Share2,
  CheckCheck,
  Bot,
  Zap,
  Terminal,
  KeyRound,
  MessageCircle,
  RotateCcw,
  BarChart3,
  ShieldCheck,
  Trash2,
  ExternalLink,
  X,
  Image as ImageIcon,
  Palette,
  Download,
  Menu,
  CheckSquare,
  ListChecks
} from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [sales, setSales] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [analytics, setAnalytics] = useState({ topProducts: [], supplierStats: [] });
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [currentMonthReport, setCurrentMonthReport] = useState({
    monthLabel: '',
    orderCount: 0,
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    marginPercent: 0
  });
  const [salesViewMode, setSalesViewMode] = useState('transactions'); // 'transactions' or 'monthly'
  const [salesStats, setSalesStats] = useState({ totalRevenue: 0, totalCost: 0, totalProfit: 0, expiringSoonCount: 0 });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Siap');

  // Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // all, ready, out
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [variantSortOrder, setVariantSortOrder] = useState('cheapest'); // cheapest, profit, selling, default

  // Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [supplierTargetVar, setSupplierTargetVar] = useState(null);
  const [showAddSupplierForm, setShowAddSupplierForm] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [lastRecordedSale, setLastRecordedSale] = useState(null);

  // Glossary & Canva Guide Modal State
  const [glossaryModalOpen, setGlossaryModalOpen] = useState(false);
  const [glossaryTab, setGlossaryTab] = useState('canva'); // 'canva', 'terms', 'categories'
  const [copiedCanvaPromo, setCopiedCanvaPromo] = useState(false);

  // Warranty Modal State
  const [warrantyModalOpen, setWarrantyModalOpen] = useState(false);
  const [targetSaleForWarranty, setTargetSaleForWarranty] = useState(null);
  const [warrantyForm, setWarrantyForm] = useState({
    issue: 'Reset sandi / Akun terputus',
    newAccount: '',
    newVaultId: '',
    notes: ''
  });
  const [lastWarrantyClaim, setLastWarrantyClaim] = useState(null);
  const [copiedWarrantyText, setCopiedWarrantyText] = useState(false);

  // Gudang Akun (Stock Vault) State
  const [vaultItems, setVaultItems] = useState([]);
  const [vaultReadyCounts, setVaultReadyCounts] = useState({});
  const [vaultFilter, setVaultFilter] = useState('all'); // all, ready, sold
  const [vaultSearch, setVaultSearch] = useState('');
  const [newVaultForm, setNewVaultForm] = useState({
    variantId: '',
    rawAccounts: '',
    supplier: '',
    costPrice: ''
  });
  const [vaultFeedback, setVaultFeedback] = useState('');
  const [vaultActionLoading, setVaultActionLoading] = useState(false);

  // Form Penjualan
  const [saleForm, setSaleForm] = useState({
    variantId: '',
    account: '',
    duration: '30d',
    buyer: '',
    buyerPlatform: 'whatsapp',
    buyerContact: '',
    buyerPhone: '',
    sellingPrice: '',
    costPrice: '',
    notes: '',
    vaultId: ''
  });

  // Form Tambah Produk & Supplier
  const [newProdForm, setNewProdForm] = useState({
    productName: '',
    categoryName: 'AI Tools',
    variantName: '',
    sellingPrice: '',
    costPrice: '',
    supplier: 'heavenprem'
  });

  const [newSupplierForm, setNewSupplierForm] = useState({
    supplier: '',
    costPrice: '',
    contact: '',
    isAvailable: true
  });

  // Spreadsheet & Custom Tools State
  const [sheetUrl, setSheetUrl] = useState('');
  const [showSheetUrlModal, setShowSheetUrlModal] = useState(false);
  const [tempSheetUrl, setTempSheetUrl] = useState('');
  const [newSheetName, setNewSheetName] = useState('');
  const [newColumnName, setNewColumnName] = useState('');
  const [sheetActionLoading, setSheetActionLoading] = useState(false);
  const [toolFeedback, setToolFeedback] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState('all');
  const [broadcastOnlyReady, setBroadcastOnlyReady] = useState(true);
  const [broadcastCopied, setBroadcastCopied] = useState(false);
  const restoreFileRef = useRef(null);
  const [showAppsScriptCode, setShowAppsScriptCode] = useState(false);

  // Poster Promo Generator State
  const posterRef = useRef(null);
  const [posterShape, setPosterShape] = useState('badge'); // 'badge' (kotak), 'circle' (lingkaran)
  const [posterTheme, setPosterTheme] = useState('yellow'); // 'yellow', 'white', 'dark', 'emerald'
  const [posterCategory, setPosterCategory] = useState('all');
  const [posterProductFilter, setPosterProductFilter] = useState('all');
  const [posterStockFilter, setPosterStockFilter] = useState('all'); // 'all', 'ready_only'
  const [posterIncludeVariants, setPosterIncludeVariants] = useState(true); // true = lengkap varian, false = hanya nama produk
  const [posterSelectedProductIds, setPosterSelectedProductIds] = useState(null); // null = all products
  const [showPosterProductPicker, setShowPosterProductPicker] = useState(false);
  const [posterPickerSearch, setPosterPickerSearch] = useState('');
  const [posterPickerCategory, setPosterPickerCategory] = useState('all');
  const [posterPickerStockFilter, setPosterPickerStockFilter] = useState('all'); // 'all' or 'ready'
  const [posterTitle, setPosterTitle] = useState('D STORE - LIVE STOCK STATUS');
  const [posterSubtitle, setPosterSubtitle] = useState('Katalog Akun Premium & Bergaransi Resmi');
  const [posterWa, setPosterWa] = useState('081230112240');
  const [posterTele, setPosterTele] = useState('dewipermata03');
  const [posterBrand, setPosterBrand] = useState('D STORE • RESMI & BERGARANSI');
  const [posterContactMode, setPosterContactMode] = useState('both'); // 'both', 'wa', 'tele', 'admin', 'custom'
  const [posterFooter, setPosterFooter] = useState('Order Cepat & Garansi: WA 081230112240 / Telegram @dewipermata03');
  const [posterColumns, setPosterColumns] = useState('3'); // '2', '3', '4', '5'
  const [posterPageSize, setPosterPageSize] = useState('24'); // number string or 'all'
  const [posterCurrentPage, setPosterCurrentPage] = useState(1);
  const [posterDensity, setPosterDensity] = useState('standard'); // 'standard', 'compact'
  const [posterShowPrice, setPosterShowPrice] = useState(true);
  const [posterMarkupType, setPosterMarkupType] = useState('flat'); // 'flat', 'percent'
  const [posterMarkupValue, setPosterMarkupValue] = useState(0);
  const [showPosterSettings, setShowPosterSettings] = useState(false);
  const [generatingPoster, setGeneratingPoster] = useState(false);

  const handleTogglePosterProduct = (productId) => {
    if (posterSelectedProductIds === null) {
      setPosterSelectedProductIds(products.filter((p) => p.id !== productId).map((p) => p.id));
    } else {
      if (posterSelectedProductIds.includes(productId)) {
        setPosterSelectedProductIds(posterSelectedProductIds.filter((id) => id !== productId));
      } else {
        setPosterSelectedProductIds([...posterSelectedProductIds, productId]);
      }
    }
  };

  const handleSelectAllPosterProducts = () => {
    setPosterSelectedProductIds(null);
    showToast('Semua produk dipilih untuk poster.', 'info');
  };

  const handleDeselectAllPosterProducts = () => {
    setPosterSelectedProductIds([]);
    showToast('Semua produk dikosongkan dari pilihan poster.', 'info');
  };

  const handleSelectReadyOnlyPosterProducts = () => {
    const readyIds = products
      .filter((p) => (variants || []).some((v) => v.productId === p.id && v.isAvailable !== false))
      .map((p) => p.id);
    setPosterSelectedProductIds(readyIds);
    showToast(`Dipilih ${readyIds.length} produk dengan stok ready.`, 'info');
  };

  const isAllPosterProductsSelected = posterSelectedProductIds === null || posterSelectedProductIds.length === products.length;
  const currentPosterSelectedCount = posterSelectedProductIds === null ? products.length : posterSelectedProductIds.length;
  const isPosterProductSelected = (productId) => {
    if (posterSelectedProductIds === null) return true;
    return posterSelectedProductIds.includes(productId);
  };

  const applyPosterContact = (mode, wa = posterWa, tele = posterTele) => {
    setPosterContactMode(mode);
    const cleanTele = tele.startsWith('@') ? tele : `@${tele}`;
    if (mode === 'both') {
      setPosterFooter(`Order Cepat & Garansi: WA ${wa} / Telegram ${cleanTele}`);
    } else if (mode === 'wa') {
      setPosterFooter(`Order Cepat & Garansi: WhatsApp ${wa}`);
    } else if (mode === 'tele') {
      setPosterFooter(`Order Cepat & Garansi: Telegram ${cleanTele}`);
    } else if (mode === 'admin') {
      setPosterFooter('Order Cepat & Garansi: Chat Admin D Store');
    }
  };

  // Scraper State
  const [scraperTargetBot, setScraperTargetBot] = useState('heavenprem_bot');
  const [scraperLimit, setScraperLimit] = useState(10);
  const [telegramScraping, setTelegramScraping] = useState(false);
  const [telegramScrapeLogs, setTelegramScrapeLogs] = useState([]);
  const [rawPricelistText, setRawPricelistText] = useState('');
  const [textSupplierName, setTextSupplierName] = useState('Toko Baru');
  const [textParsingLoading, setTextParsingLoading] = useState(false);
  const [parsedItems, setParsedItems] = useState([]);
  const [importingLoading, setImportingLoading] = useState(false);
  const [scraperFeedback, setScraperFeedback] = useState('');
  const [scrapeSummary, setScrapeSummary] = useState(null);
  const [scrapeDetailTab, setScrapeDetailTab] = useState('outOfStock'); // 'outOfStock', 'newItems', 'priceChanges', 'logs'

  // Toast & Modal Feedback System (Neo-Brutalist)
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null); // { title, message, confirmText, onConfirm }

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  // Chat AI State
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Halo Bos Ivan. Saya asisten pintar D Store. Ada yang bisa saya bantu terkait cek stok, rekomendasi supplier termurah, atau update harga?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Format IDR Rupiah
  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(Number(val) || 0);
  };

  // Hitung harga poster dengan markup reseller
  const getPosterVariantPrice = (price) => {
    const base = Number(price) || 0;
    if (posterMarkupType === 'percent') {
      return Math.round(base * (1 + Number(posterMarkupValue || 0) / 100));
    }
    return base + Number(posterMarkupValue || 0);
  };

  // Standardize duration units: hari -> d, bulan -> m, tahun -> y, minggu -> w
  const standardizeDurationStr = (name) => {
    if (!name || typeof name !== 'string') return name;
    let s = name;
    s = s.replace(/(\d+)\s*(?:hari|Hari|HARI)\b/gi, '$1d');
    s = s.replace(/(\d+)\s*(?:bulan|Bulan|BULAN|bln|Bln)\b/gi, '$1m');
    s = s.replace(/(\d+)\s*(?:tahun|Tahun|TAHUN|thn|Thn)\b/gi, '$1y');
    s = s.replace(/(\d+)\s*(?:minggu|Minggu|MINGGU|mgg|Mgg)\b/gi, '$1w');
    s = s.replace(/(\d+)\s*(?:day|days)\b/gi, '$1d');
    s = s.replace(/(\d+)\s*(?:month|months)\b/gi, '$1m');
    s = s.replace(/(\d+)\s*(?:year|years)\b/gi, '$1y');
    s = s.replace(/(\d+)\s*(?:week|weeks)\b/gi, '$1w');
    return s;
  };

  // Helper untuk membersihkan redundansi nama produk dari nama varian (contoh: "Meitu VIP 7d" -> "VIP 7d")
  const getCleanVariantName = (variantName, productName) => {
    if (!variantName) return '';
    const cleanStr = standardizeDurationStr(variantName);
    const pName = (productName || '').trim().toLowerCase();
    const vName = cleanStr.trim();
    if (pName && vName.toLowerCase().startsWith(pName)) {
      const stripped = vName.slice(pName.length).trim().replace(/^[-–:_\s/]+/, '');
      if (stripped) return standardizeDurationStr(stripped);
    }
    const words = pName.split(/\s+/);
    if (words.length > 1) {
      const firstWord = words[0];
      if (firstWord.length > 2 && vName.toLowerCase().startsWith(firstWord)) {
        const stripped = vName.slice(firstWord.length).trim().replace(/^[-–:_\s/]+/, '');
        if (stripped) return standardizeDurationStr(stripped);
      }
    }
    return standardizeDurationStr(vName);
  };

  // Template Broadcast Promo Canva Pro
  const canvaPromoBroadcastText = useMemo(() => {
    return `[PROMO SPESIAL CANVA PRO PREMIUM]\nDesain Tanpa Batas, Semua Fitur & Template Terbuka!\n\n` +
      `- Akses 100 Juta+ Foto, Video, Audio & Grafis Premium\n` +
      `- Hapus Background Otomatis 1x Klik (Magic Eraser)\n` +
      `- Resize Desain Instan ke Semua Ukuran Medsos\n` +
      `- Magic AI Studio (Generator Gambar & Teks AI)\n` +
      `- Bebas Unduh Format SVG Transparan & Resolusi Tinggi\n\n` +
      `DAFTAR HARGA TERMURAH & BERGARANSI:\n` +
      `* 1m (Invite Member) : Rp 3.500\n` +
      `* 3m (Invite Member) : Rp 5.500\n` +
      `* 6m (Invite Member) : Rp 8.000\n` +
      `* 1y (Invite Member) : Rp 11.000\n` +
      `* 1y (No Renew)      : Rp 15.000\n` +
      `* Lifetime (Garansi 1y): Rp 13.000\n` +
      `* Lifetime (No Garansi) : Rp 10.000\n\n` +
      `KHUSUS ADMIN / KANTOR / RESELLER:\n` +
      `* Head Owner 1m (Bisa Invite 100 User): Rp 7.000\n` +
      `* Head Owner 3m (Bisa Invite 100 User): Rp 15.000\n\n` +
      `Keterangan Paket:\n` +
      `- Invite Member: Pakai email & password pribadi Anda sendiri, privasi aman.\n` +
      `- Head Owner: Jadi owner tim Canva, bisa undang teman/klien hingga 100 orang.\n` +
      `- Lifetime: Aktif permanen tanpa iuran bulanan.\n\n` +
      `Proses Cepat 1-3 Menit Langsung Aktif!\n` +
      `Garansi Resmi & Full Support.\n` +
      `Order Sekarang: Chat Admin D Store`;
  }, []);

  // WhatsApp Click-to-Chat URL Generator
  const getWaUrl = (phone, text) => {
    let clean = String(phone || '').replace(/[^0-9]/g, '');
    if (!clean) {
      return `https://wa.me/?text=${encodeURIComponent(text || '')}`;
    }
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    } else if (!clean.startsWith('62')) {
      clean = '62' + clean;
    }
    return `https://wa.me/${clean}?text=${encodeURIComponent(text || '')}`;
  };

  // Helper untuk deteksi dan link chat pembeli (WhatsApp, Telegram, IG, TikTok, dll)
  const getBuyerChatInfo = (sale, text = '') => {
    const platform = (sale?.buyerPlatform || 'whatsapp').toLowerCase();
    const contact = String(sale?.buyerContact || sale?.buyerPhone || '').trim();

    if (platform === 'telegram') {
      let username = contact.replace(/^@/, '').trim();
      let url = 'https://t.me/';
      if (username.startsWith('http://') || username.startsWith('https://')) {
        url = username;
      } else if (username) {
        url = `https://t.me/${username}`;
      }
      return {
        url,
        label: 'Kirim via Telegram',
        platform: 'Telegram',
        contactDisplay: contact ? (contact.startsWith('@') ? contact : `@${contact}`) : 'Telegram',
        type: 'telegram'
      };
    }

    if (platform === 'instagram') {
      let username = contact.replace(/^@/, '').trim();
      let url = 'https://instagram.com/';
      if (username.startsWith('http://') || username.startsWith('https://')) {
        url = username;
      } else if (username) {
        url = `https://instagram.com/${username}`;
      }
      return {
        url,
        label: 'Buka Instagram',
        platform: 'Instagram',
        contactDisplay: contact ? (contact.startsWith('@') ? contact : `@${contact}`) : 'Instagram',
        type: 'instagram'
      };
    }

    if (platform === 'tiktok') {
      let username = contact.replace(/^@/, '').trim();
      let url = 'https://www.tiktok.com/';
      if (username.startsWith('http://') || username.startsWith('https://')) {
        url = username;
      } else if (username) {
        url = `https://www.tiktok.com/@${username}`;
      }
      return {
        url,
        label: 'Buka TikTok',
        platform: 'TikTok',
        contactDisplay: contact ? (contact.startsWith('@') ? contact : `@${contact}`) : 'TikTok',
        type: 'tiktok'
      };
    }

    if (platform === 'other' || platform === 'lainnya') {
      if (contact.startsWith('http://') || contact.startsWith('https://')) {
        return {
          url: contact,
          label: 'Buka Tautan',
          platform: 'Lainnya',
          contactDisplay: contact,
          type: 'other'
        };
      }
      const digits = contact.replace(/[^0-9]/g, '');
      if (digits.length >= 9) {
        return {
          url: getWaUrl(digits, text),
          label: 'Kirim via WhatsApp',
          platform: 'WhatsApp',
          contactDisplay: digits,
          type: 'whatsapp'
        };
      }
      if (contact.startsWith('@')) {
        return {
          url: `https://t.me/${contact.replace(/^@/, '')}`,
          label: 'Kirim via Telegram',
          platform: 'Telegram',
          contactDisplay: contact,
          type: 'telegram'
        };
      }
      return {
        url: '#',
        label: 'Kontak Pembeli',
        platform: 'Lainnya',
        contactDisplay: contact || '-',
        type: 'other'
      };
    }

    // Default WhatsApp
    return {
      url: getWaUrl(contact, text),
      label: 'Kirim via WhatsApp',
      platform: 'WhatsApp',
      contactDisplay: contact || 'WhatsApp',
      type: 'whatsapp'
    };
  };

  // Helper untuk deteksi link direct supplier (Telegram Bot / WhatsApp / Custom Link)
  const getSupplierLinkInfo = (supplierName = '', supplierContact = '') => {
    const supp = String(supplierName || '').trim();
    const contact = String(supplierContact || '').trim();

    if (contact) {
      if (contact.startsWith('http://') || contact.startsWith('https://')) {
        return { url: contact, type: 'url', label: supp || 'Supplier' };
      }
      if (contact.startsWith('@')) {
        return { url: `https://t.me/${contact.replace(/^@/, '')}`, type: 'telegram', label: contact };
      }
      const digits = contact.replace(/[^0-9]/g, '');
      if ((contact.startsWith('08') || contact.startsWith('62')) && digits.length >= 9) {
        const waNum = digits.startsWith('0') ? '62' + digits.slice(1) : digits;
        return { url: `https://wa.me/${waNum}`, type: 'whatsapp', label: `WA: ${contact}` };
      }
      if (contact.toLowerCase().endsWith('_bot') || !contact.includes(' ')) {
        return { url: `https://t.me/${contact.replace(/^@/, '')}`, type: 'telegram', label: contact };
      }
    }

    // Auto-detect dari nama supplier
    const lower = supp.toLowerCase();
    if (lower.includes('heaven') || lower === 'heavenprem' || lower === 'heavenprem_bot') {
      return { url: 'https://t.me/heavenprem_bot', type: 'telegram', label: 'heavenprem_bot' };
    }
    if (lower.includes('ziem') || lower === 'ziem7' || lower === 'ziem7_bot') {
      return { url: 'https://t.me/Ziem7_bot', type: 'telegram', label: 'Ziem7_bot' };
    }
    if (lower.includes('buatprem') || lower === 'buatprem_bot') {
      return { url: 'https://t.me/buatprem_bot', type: 'telegram', label: 'buatprem_bot' };
    }
    if (lower.endsWith('_bot') || lower.startsWith('@')) {
      return { url: `https://t.me/${supp.replace(/^@/, '')}`, type: 'telegram', label: supp };
    }
    const suppDigits = supp.replace(/[^0-9]/g, '');
    if ((supp.startsWith('08') || supp.startsWith('62')) && suppDigits.length >= 9) {
      const waNum = suppDigits.startsWith('0') ? '62' + suppDigits.slice(1) : suppDigits;
      return { url: `https://wa.me/${waNum}`, type: 'whatsapp', label: `WA: ${supp}` };
    }

    if (lower.startsWith('tele ') || lower.startsWith('t.me/')) {
      const username = supp.replace(/^(tele\s+|t\.me\/|@)/i, '').trim();
      return { url: `https://t.me/${username}`, type: 'telegram', label: `@${username}` };
    }
    return { url: '#', type: 'store', label: supp };
  };

  // Fetch initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.status === 'ok') {
        setCategories(data.categories || []);
        setProducts(data.products || []);
        const cleanVars = (data.variants || []).map(v => ({
          ...v,
          name: standardizeDurationStr(v.name)
        }));
        setVariants(cleanVars);
      }
      await loadSales();
      await loadVaultData();
      await loadSheetUrl();
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSheetUrl = async () => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('d_store_sheet_url');
        if (saved) setSheetUrl(saved);
      }
      const res = await fetch('/api/sync?action=get_sheet_url');
      const data = await res.json();
      if (data && data.sheetUrl) {
        setSheetUrl(data.sheetUrl);
        if (typeof window !== 'undefined') {
          localStorage.setItem('d_store_sheet_url', data.sheetUrl);
        }
      }
    } catch (err) {
      console.warn('Failed to load sheet URL:', err);
    }
  };

  const loadSales = async () => {
    try {
      const res = await fetch('/api/sales');
      const data = await res.json();
      setSales(data.sales || []);
      setWarranties(data.warranties || []);
      setAnalytics(data.analytics || { topProducts: [], supplierStats: [] });
      setMonthlyReports(data.monthlyReports || []);
      if (data.currentMonthReport) {
        setCurrentMonthReport(data.currentMonthReport);
      }
      setSalesStats({
        totalRevenue: data.totalRevenue || 0,
        totalCost: data.totalCost || 0,
        totalProfit: data.totalProfit || 0,
        expiringSoonCount: data.expiringSoonCount || 0
      });
    } catch (err) {
      console.error('Failed to load sales:', err);
    }
  };

  const loadVaultData = async () => {
    try {
      const res = await fetch('/api/vault');
      const data = await res.json();
      if (data.status === 'ok') {
        setVaultItems(data.items || []);
        setVaultReadyCounts(data.readyCounts || {});
      }
    } catch (err) {
      console.error('Failed to load vault data:', err);
    }
  };

  const VALID_TABS = useMemo(() => [
    'catalog', 'vault', 'matrix', 'sales', 'expiry', 'scraper', 'sheets_tools', 'promo_poster', 'ai'
  ], []);

  // Sync tab with URL hash & localStorage so refresh preserves the current tab
  useEffect(() => {
    const getInitialTab = () => {
      if (typeof window === 'undefined') return 'catalog';
      
      // 1. Prioritaskan URL hash (#vault, #sales, dll)
      const hash = window.location.hash.replace('#', '').trim();
      if (VALID_TABS.includes(hash)) return hash;

      // 2. Cek query parameter (?tab=sales)
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (VALID_TABS.includes(tabParam)) return tabParam;

      // 3. Cek localStorage dari sesi sebelumnya
      try {
        const saved = localStorage.getItem('d_store_active_tab');
        if (VALID_TABS.includes(saved)) return saved;
      } catch (e) {}

      return 'catalog';
    };

    const initialTab = getInitialTab();
    setActiveTab(initialTab);
    if (window.location.hash !== `#${initialTab}`) {
      window.history.replaceState(null, '', `#${initialTab}`);
    }

    const handleUrlChange = () => {
      const currentHash = window.location.hash.replace('#', '').trim();
      if (VALID_TABS.includes(currentHash)) {
        setActiveTab(currentHash);
        try {
          localStorage.setItem('d_store_active_tab', currentHash);
        } catch (e) {}
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [VALID_TABS]);

  const handleTabChange = (tabId) => {
    if (!VALID_TABS.includes(tabId)) return;
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `#${tabId}`);
      try {
        localStorage.setItem('d_store_active_tab', tabId);
      } catch (e) {}
    }
    if (tabId === 'promo_poster' || tabId === 'matrix' || tabId === 'catalog') {
      loadData();
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  // Handler Tarik Data dari Spreadsheet
  const handlePullSheet = async () => {
    setSyncing(true);
    setSyncStatus('Menarik data...');
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pull' })
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatus(`Sinkron (${data.count} varian)`);
        await loadData();
      } else {
        setSyncStatus(`Gagal: ${data.message || data.error}`);
      }
    } catch (err) {
      setSyncStatus(`Gagal: ${err.message}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncStatus('Tersambung Cloud'), 4000);
    }
  };

  // Handler Unggah Data ke Spreadsheet
  const handlePushSheet = async () => {
    setSyncing(true);
    setSyncStatus('Mengunggah...');
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'push' })
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatus(`Katalog terunggah (${data.count} varian)`);
      } else {
        setSyncStatus(`Gagal: ${data.error || 'Terjadi kesalahan'}`);
      }
    } catch (err) {
      setSyncStatus(`Gagal: ${err.message}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncStatus('Tersambung Cloud'), 4000);
    }
  };

  // Saklar Toggle Ready/Kosong Stok
  const handleToggleStock = async (variantId, currentAvailable) => {
    const nextStatus = !currentAvailable;
    setVariants(prev => prev.map(v => v.id === variantId ? { ...v, isAvailable: nextStatus } : v));

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_stock',
          variantId,
          isAvailable: nextStatus
        })
      });
      const data = await res.json();
      if (data.status !== 'ok') {
        setVariants(prev => prev.map(v => v.id === variantId ? { ...v, isAvailable: currentAvailable } : v));
      }
    } catch {
      setVariants(prev => prev.map(v => v.id === variantId ? { ...v, isAvailable: currentAvailable } : v));
    }
  };

  // Simpan Edit Harga & Toko
  const handleSaveEditVariant = async (e) => {
    e.preventDefault();
    if (!editingVariant) return;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_price',
          variantId: editingVariant.id,
          sellingPrice: editingVariant.price,
          costPrice: editingVariant.costPrice,
          supplier: editingVariant.supplier
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setVariants(prev => prev.map(v => v.id === editingVariant.id ? data.variant : v));
        setEditModalOpen(false);
        showToast('Harga dan supplier berhasil diperbarui!', 'success');
      }
    } catch (err) {
      showToast('Gagal menyimpan perubahan: ' + err.message, 'error');
    }
  };

  // Simpan Supplier Baru / Penawaran Harga Toko
  const handleSaveSupplierOffer = async (e) => {
    e.preventDefault();
    if (!supplierTargetVar) return;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert_supplier',
          variantId: supplierTargetVar.id,
          supplier: newSupplierForm.supplier,
          costPrice: newSupplierForm.costPrice,
          contact: newSupplierForm.contact,
          isAvailable: newSupplierForm.isAvailable
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setVariants(prev => prev.map(v => v.id === supplierTargetVar.id ? data.variant : v));
        setSupplierModalOpen(false);
        setNewSupplierForm({ supplier: '', costPrice: '', contact: '', isAvailable: true });
        showToast('Penawaran toko supplier berhasil disimpan ke matrix!', 'success');
      }
    } catch (err) {
      showToast('Gagal menyimpan harga supplier: ' + err.message, 'error');
    }
  };

  // Ganti Toko Supplier Aktif untuk Varian Ini
  const handleSelectSupplier = async (variantId, supplierName) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'select_supplier',
          variantId,
          supplier: supplierName
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setVariants(prev => prev.map(v => v.id === variantId ? data.variant : v));
        if (supplierTargetVar && supplierTargetVar.id === variantId) {
          setSupplierTargetVar(prev => ({ ...prev, ...data.variant }));
        }
        showToast(`Supplier aktif diubah ke ${supplierName}`, 'success');
      } else {
        showToast(data.message || 'Gagal mengubah supplier', 'error');
      }
    } catch (err) {
      showToast('Gagal mengubah supplier: ' + err.message, 'error');
    }
  };

  // Tambah Produk Baru
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_product',
          ...newProdForm
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        await loadData();
        setAddProductModalOpen(false);
        setNewProdForm({
          productName: '',
          categoryName: 'AI Tools',
          variantName: '',
          sellingPrice: '',
          costPrice: '',
          supplier: 'heavenprem'
        });
        showToast('Produk baru berhasil ditambahkan ke katalog & spreadsheet!', 'success');
      }
    } catch (err) {
      showToast('Gagal menambah produk: ' + err.message, 'error');
    }
  };

  // ====================================================================
  // GUDANG AKUN (STOCK VAULT) HANDLERS
  // ====================================================================
  const handleAddVaultBatch = async (e) => {
    e.preventDefault();
    if (!newVaultForm.variantId || !newVaultForm.rawAccounts.trim()) {
      showToast('Pilih varian dan masukkan daftar akun terlebih dahulu.', 'warning');
      return;
    }

    setVaultActionLoading(true);
    setVaultFeedback('');
    try {
      const res = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_batch',
          ...newVaultForm
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setVaultFeedback(data.message);
        setNewVaultForm({ variantId: '', rawAccounts: '', supplier: '', costPrice: '' });
        await loadVaultData();
        await loadData();
        showToast('Akun berhasil dimasukkan ke gudang stok!', 'success');
      } else {
        setVaultFeedback(`Gagal: ${data.message}`);
        showToast(`Gagal: ${data.message}`, 'error');
      }
    } catch (err) {
      setVaultFeedback(`Error: ${err.message}`);
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setVaultActionLoading(false);
    }
  };

  const handleDeleteVaultItem = (id) => {
    setConfirmState({
      title: 'Hapus Akun dari Gudang',
      message: 'Apakah Anda yakin ingin menghapus kredensial akun ini dari gudang stok?',
      confirmText: 'Ya, Hapus Akun',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/vault', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id })
          });
          const data = await res.json();
          if (data.status === 'ok') {
            await loadVaultData();
            showToast('Akun berhasil dihapus dari gudang.', 'success');
          }
        } catch (err) {
          showToast('Gagal menghapus akun: ' + err.message, 'error');
        } finally {
          setConfirmState(null);
        }
      }
    });
  };

  // Ambil otomatis 1 akun dari gudang saat mencatat penjualan
  const handlePickVaultForSale = () => {
    if (!saleForm.variantId) {
      showToast('Pilih paket / varian terlebih dahulu.', 'warning');
      return;
    }
    const readyAccount = vaultItems.find(i => i.variantId === saleForm.variantId && i.status === 'ready');
    if (!readyAccount) {
      showToast('Tidak ada akun ready di gudang untuk varian ini.', 'warning');
      return;
    }
    setSaleForm(prev => ({
      ...prev,
      account: readyAccount.account,
      vaultId: readyAccount.id,
      costPrice: readyAccount.costPrice || prev.costPrice
    }));
    showToast('Akun dari gudang berhasil diambil!', 'info');
  };

  // Catat Penjualan
  const handleRecordSale = async (e) => {
    e.preventDefault();
    if (!saleForm.variantId || !saleForm.account) {
      showToast('Pilih varian dan isi data akun terlebih dahulu.', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleForm)
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setLastRecordedSale(data.sale);
        await loadSales();
        await loadVaultData();
        showToast(`Pesanan #${data.sale.id} berhasil dicatat!`, 'success');
        setSaleForm({
          variantId: '',
          account: '',
          duration: '30d',
          buyer: '',
          buyerPlatform: 'whatsapp',
          buyerContact: '',
          buyerPhone: '',
          sellingPrice: '',
          costPrice: '',
          notes: '',
          vaultId: ''
        });
      }
    } catch (err) {
      showToast('Gagal mencatat penjualan: ' + err.message, 'error');
    }
  };

  // ====================================================================
  // KLAIM GARANSI & PENGGANTIAN AKUN HANDLERS
  // ====================================================================
  const handleOpenWarrantyModal = (sale) => {
    setTargetSaleForWarranty(sale);
    setWarrantyForm({
      issue: 'Reset sandi / Akun terputus',
      newAccount: '',
      newVaultId: '',
      notes: ''
    });
    setWarrantyModalOpen(true);
  };

  const handlePickVaultForWarranty = () => {
    if (!targetSaleForWarranty) return;
    const readyAccount = vaultItems.find(i => i.variantId === targetSaleForWarranty.variantId && i.status === 'ready');
    if (!readyAccount) {
      showToast('Gudang akun untuk varian ini kosong. Silakan ketik akun pengganti manual.', 'info');
      return;
    }
    setWarrantyForm(prev => ({
      ...prev,
      newAccount: readyAccount.account,
      newVaultId: readyAccount.id
    }));
    showToast('Akun pengganti dari gudang berhasil dimuat!', 'info');
  };

  const handleClaimWarranty = async (e) => {
    e.preventDefault();
    if (!targetSaleForWarranty || !warrantyForm.newAccount.trim()) {
      showToast('Kredensial akun pengganti wajib diisi.', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'claim_warranty',
          saleId: targetSaleForWarranty.id,
          issue: warrantyForm.issue,
          newAccount: warrantyForm.newAccount,
          newVaultId: warrantyForm.newVaultId,
          notes: warrantyForm.notes
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setLastWarrantyClaim(data.warranty);
        setWarrantyModalOpen(false);
        await loadSales();
        await loadVaultData();
        showToast(`Garansi pesanan #${data.warranty.saleId} berhasil diproses!`, 'success');
      } else {
        showToast(`Gagal: ${data.message}`, 'error');
      }
    } catch (err) {
      showToast('Error klaim garansi: ' + err.message, 'error');
    }
  };

  // Chat Gemini AI
  const handleSendChatMessage = async (msgToSend) => {
    const text = msgToSend || inputMessage;
    if (!text.trim() || chatLoading) return;

    const userMsg = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
      loadData();
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Gagal terhubung ke AI: ' + err.message }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Sheet Handlers
  const handleCreateSheet = async (e) => {
    e.preventDefault();
    if (!newSheetName.trim()) return;
    setSheetActionLoading(true);
    setToolFeedback('');
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_sheet', sheetName: newSheetName })
      });
      const data = await res.json();
      if (data.success) {
        setToolFeedback(`Berhasil membuat sheet "${newSheetName}" di Google Spreadsheet.`);
        setNewSheetName('');
      } else {
        setToolFeedback(`Gagal: ${data.message || data.error}`);
      }
    } catch (err) {
      setToolFeedback(`Error: ${err.message}`);
    } finally {
      setSheetActionLoading(false);
    }
  };

  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;
    setSheetActionLoading(true);
    setToolFeedback('');
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_column', columnName: newColumnName })
      });
      const data = await res.json();
      if (data.success) {
        setToolFeedback(`Berhasil menambahkan kolom "${newColumnName}" ke Google Spreadsheet.`);
        setNewColumnName('');
      } else {
        setToolFeedback(`Gagal: ${data.message || data.error}`);
      }
    } catch (err) {
      setToolFeedback(`Error: ${err.message}`);
    } finally {
      setSheetActionLoading(false);
    }
  };

  const handleDownloadExcel = () => {
    window.open('/api/sync?action=export_excel', '_blank');
  };

  const handleOpenSpreadsheet = () => {
    if (sheetUrl && sheetUrl.trim().startsWith('http')) {
      window.open(sheetUrl.trim(), '_blank', 'noopener,noreferrer');
    } else {
      setTempSheetUrl(sheetUrl || '');
      setShowSheetUrlModal(true);
    }
  };

  const handleSaveSheetUrl = async (e) => {
    if (e) e.preventDefault();
    const cleanUrl = tempSheetUrl.trim();
    if (!cleanUrl) {
      showToast('Masukkan link Google Spreadsheet yang valid.', 'warning');
      return;
    }
    if (!cleanUrl.startsWith('http')) {
      showToast('Link harus diawali dengan https://', 'warning');
      return;
    }
    setSheetUrl(cleanUrl);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('d_store_sheet_url', cleanUrl);
      }
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_sheet_url', sheetUrl: cleanUrl })
      });
      showToast('Link Google Spreadsheet berhasil disimpan!', 'success');
      setShowSheetUrlModal(false);
      window.open(cleanUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      showToast('Gagal menyimpan link: ' + err.message, 'error');
    }
  };

  const handleDownloadBackup = () => {
    window.open('/api/sync?action=backup_json', '_blank');
  };

  const handleRestoreBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'restore_json', data: parsed })
        });
        const data = await res.json();
        if (data.success) {
          setToolFeedback('Data cadangan berhasil dipulihkan.');
          loadData();
        } else {
          setToolFeedback(`Gagal memulihkan: ${data.message}`);
        }
      } catch (err) {
        setToolFeedback(`File JSON tidak valid: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Poster Promo Handlers
  const handleDownloadPoster = async (format = 'png') => {
    if (!posterRef.current) return;
    setGeneratingPoster(true);
    try {
      let dataUrl;
      const opts = {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true
      };
      if (format === 'jpeg' || format === 'jpg') {
        dataUrl = await toJpeg(posterRef.current, opts);
      } else {
        dataUrl = await toPng(posterRef.current, opts);
      }
      const link = document.createElement('a');
      const slideSuffix = posterPageSize !== 'all' && totalPosterPages > 1 ? `-Slide-${posterCurrentPage}` : '';
      link.download = `D-Store-Stok-Promo${slideSuffix}-${new Date().toISOString().slice(0, 10)}.${format}`;
      link.href = dataUrl;
      link.click();
      showToast(`Poster promo stok${slideSuffix ? ` (Slide ${posterCurrentPage})` : ''} berhasil diunduh (.${format.toUpperCase()})!`, 'success');
    } catch (err) {
      showToast('Gagal memproses poster gambar: ' + err.message, 'error');
    } finally {
      setGeneratingPoster(false);
    }
  };

  const handleDownloadAllSlides = async (format = 'png') => {
    if (!posterRef.current || totalPosterPages <= 1) return;
    setGeneratingPoster(true);
    const initialPage = posterCurrentPage;
    try {
      for (let p = 1; p <= totalPosterPages; p++) {
        setPosterCurrentPage(p);
        await new Promise(r => setTimeout(r, 350));
        if (!posterRef.current) continue;
        const opts = { quality: 0.95, pixelRatio: 2, cacheBust: true };
        const dataUrl = (format === 'jpeg' || format === 'jpg')
          ? await toJpeg(posterRef.current, opts)
          : await toPng(posterRef.current, opts);
        const link = document.createElement('a');
        link.download = `D-Store-Stok-Promo-Slide-${p}-${new Date().toISOString().slice(0, 10)}.${format}`;
        link.href = dataUrl;
        link.click();
        await new Promise(r => setTimeout(r, 200));
      }
      showToast(`Semua ${totalPosterPages} slide poster berhasil diunduh!`, 'success');
    } catch (err) {
      showToast('Gagal mengunduh semua slide: ' + err.message, 'error');
    } finally {
      setPosterCurrentPage(initialPage);
      setGeneratingPoster(false);
    }
  };

  const handleCopyPosterImage = async () => {
    if (!posterRef.current) return;
    setGeneratingPoster(true);
    try {
      const dataUrl = await toPng(posterRef.current, { pixelRatio: 2, cacheBust: true });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      if (typeof window !== 'undefined' && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('Gambar poster disalin! Langsung tekan Ctrl+V di WhatsApp / Telegram.', 'success');
      } else {
        showToast('Browser tidak mendukung salin gambar langsung, silakan klik Unduh PNG.', 'warning');
      }
    } catch (err) {
      showToast('Gagal menyalin gambar: ' + err.message, 'error');
    } finally {
      setGeneratingPoster(false);
    }
  };

  const handleCopyResellerBroadcast = () => {
    let txt = `*${posterTitle}*\n${posterSubtitle}\n\n`;
    for (const p of displayedPosterProducts) {
      if (posterIncludeVariants === false) {
        const prices = (p.filteredVariants || []).map(v => v.price).filter(pr => typeof pr === 'number' && !isNaN(pr));
        const minP = prices.length > 0 ? Math.min(...prices) : 0;
        const hasReady = (p.filteredVariants || []).some(v => v.isAvailable !== false);
        const status = hasReady ? 'Ready' : 'Habis';
        txt += `• *${p.name.toUpperCase()}* : Mulai ${formatRupiah(getPosterVariantPrice(minP))} [${status}]\n`;
      } else {
        txt += `*${p.name.toUpperCase()}*\n`;
        for (const v of p.filteredVariants) {
          const finalP = getPosterVariantPrice(v.price);
          const status = v.isAvailable !== false ? 'Ready' : 'Habis';
          txt += `- ${getCleanVariantName(v.name, p.name)} : ${formatRupiah(finalP)} [${status}]\n`;
        }
        txt += `\n`;
      }
    }
    if (posterIncludeVariants === false) {
      txt += `\n`;
    }
    txt += `${posterFooter}\n`;
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(txt);
      showToast('Format chat WhatsApp reseller berhasil disalin!', 'success');
    }
  };

  // Scraper Handlers
  const handleResetScraperLock = async () => {
    try {
      await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_lock' })
      });
      setTelegramScraping(false);
      setTelegramScrapeLogs(prev => [...prev, `[${new Date().toLocaleTimeString('id-ID')}] [INFO] Kunci scraper berhasil direset.`]);
      showToast('Kunci scraper berhasil direset!', 'success');
    } catch (err) {
      showToast('Gagal mereset: ' + err.message, 'error');
    }
  };

  const handleTelegramBotScrape = async () => {
    if (telegramScraping) return;
    setTelegramScraping(true);
    setScraperFeedback('');
    setTelegramScrapeLogs([`[${new Date().toLocaleTimeString('id-ID')}] Memulai koneksi ke UserBot Telegram untuk @${scraperTargetBot}...`]);

    try {
      const res = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'telegram_bot_scrape',
          limit: scraperLimit,
          targetBot: scraperTargetBot
        })
      });
      const data = await res.json();
      if (data.success) {
        const outCount = data.diff?.outOfStock?.length || 0;
        const newProdCount = data.diff?.newProducts?.length || 0;
        const newVarCount = data.diff?.newVariants?.length || 0;
        const priceCount = data.diff?.priceChanges?.length || 0;
        const sheetMsg = data.sheetSync?.status || 'Tersimpan di Cloud';

        setScraperFeedback(`Berhasil menyedot ${data.scrapedCount} produk dari @${scraperTargetBot}. Ditemukan: ${outCount} varian habis, ${newProdCount} produk baru (${newVarCount} varian), ${priceCount} perubahan harga. ${sheetMsg}.`);
        if (Array.isArray(data.logs)) {
          setTelegramScrapeLogs(data.logs);
        }
        if (data.diff) {
          setScrapeSummary({
            scrapedCount: data.scrapedCount,
            productCount: data.productCount,
            variantCount: data.variantCount,
            diff: data.diff,
            sheetSync: data.sheetSync,
            timestamp: new Date().toLocaleTimeString('id-ID')
          });
          if (outCount > 0) {
            setScrapeDetailTab('outOfStock');
          } else if (newProdCount > 0 || newVarCount > 0) {
            setScrapeDetailTab('newItems');
          } else if (priceCount > 0) {
            setScrapeDetailTab('priceChanges');
          } else {
            setScrapeDetailTab('logs');
          }
        }
        await loadData();
      } else {
        setScraperFeedback(`Gagal: ${data.error || data.message}`);
        setTelegramScrapeLogs(prev => [...prev, `[ERROR] ${data.error || data.message}`]);
      }
    } catch (err) {
      setScraperFeedback(`Error koneksi: ${err.message}`);
      setTelegramScrapeLogs(prev => [...prev, `[ERROR] ${err.message}`]);
    } finally {
      setTelegramScraping(false);
    }
  };

  const handleParseSupplierText = async (e) => {
    e?.preventDefault();
    if (!rawPricelistText.trim() || textParsingLoading) return;
    setTextParsingLoading(true);
    setScraperFeedback('');

    try {
      const res = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'parse_text',
          rawText: rawPricelistText,
          defaultSupplier: textSupplierName
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setParsedItems(data.items);
        setScraperFeedback(`Berhasil mengekstrak ${data.count} produk dan varian.`);
      } else {
        setScraperFeedback(`Gagal mengekstrak: ${data.error || data.message}`);
      }
    } catch (err) {
      setScraperFeedback(`Error parser: ${err.message}`);
    } finally {
      setTextParsingLoading(false);
    }
  };

  const handleImportParsedItems = async () => {
    if (parsedItems.length === 0 || importingLoading) return;
    setImportingLoading(true);
    try {
      const res = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import_parsed',
          items: parsedItems
        })
      });
      const data = await res.json();
      if (data.success) {
        setScraperFeedback(`Berhasil mengimpor ${data.count || parsedItems.length} produk ke database dan spreadsheet.`);
        setParsedItems([]);
        setRawPricelistText('');
        await loadData();
      } else {
        setScraperFeedback(`Gagal impor: ${data.message || data.error}`);
      }
    } catch (err) {
      setScraperFeedback(`Error impor: ${err.message}`);
    } finally {
      setImportingLoading(false);
    }
  };

  // Suppliers List
  const allSuppliers = useMemo(() => {
    const map = new Map();
    map.set('heavenprem', 'heavenprem');
    map.set('ziem7_bot', 'Ziem7_bot');
    map.set('buatprem_bot', 'buatprem_bot');

    variants.forEach(v => {
      const supp = (v.supplier || '').trim();
      if (supp) {
        let k = supp.toLowerCase();
        if (k === 'heavenprem_bot') k = 'heavenprem';
        const display = k === 'heavenprem' ? 'heavenprem' : supp;
        if (!map.has(k)) map.set(k, display);
      }
      if (Array.isArray(v.supplierOffers)) {
        v.supplierOffers.forEach(o => {
          const oSupp = (o.supplier || '').trim();
          if (oSupp) {
            let k = oSupp.toLowerCase();
            if (k === 'heavenprem_bot') k = 'heavenprem';
            const display = k === 'heavenprem' ? 'heavenprem' : oSupp;
            if (!map.has(k)) map.set(k, display);
          }
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [variants]);

  // Clean WhatsApp Broadcast Text Generator
  const broadcastText = useMemo(() => {
    let text = `DAFTAR HARGA D STORE\n`;
    text += `Ready Stock Akun Premium & Bergaransi\n\n`;

    const catsToInclude = broadcastCategory === 'all' 
      ? categories 
      : categories.filter(c => c.id === broadcastCategory);

    let count = 0;
    for (const cat of catsToInclude) {
      const catProds = products.filter(p => p.categoryId === cat.id);
      const catVars = [];
      for (const p of catProds) {
        const pVars = variants.filter(v => v.productId === p.id);
        for (const v of pVars) {
          if (!broadcastOnlyReady || v.isAvailable) {
            catVars.push({ prodName: p.name, varName: v.name, price: v.price, isAvailable: v.isAvailable });
          }
        }
      }

      if (catVars.length > 0) {
        text += `[ ${cat.name.toUpperCase()} ]\n`;
        catVars.forEach(v => {
          text += `- ${v.prodName} (${v.varName}) : Rp${(v.price || 0).toLocaleString('id-ID')} (${v.isAvailable ? 'Ready' : 'Kosong'})\n`;
          count++;
        });
        text += `\n`;
      }
    }

    if (count === 0) {
      text += `(Belum ada produk sesuai filter yang dipilih)\n\n`;
    }

    text += `------------------------------------\n`;
    text += `Order Cepat / Klaim Garansi: Chat Admin\n`;
    text += `Terima kasih telah berlangganan di D Store.`;
    return text;
  }, [categories, products, variants, broadcastCategory, broadcastOnlyReady]);

  const handleCopyBroadcast = () => {
    navigator.clipboard.writeText(broadcastText);
    setBroadcastCopied(true);
    setTimeout(() => setBroadcastCopied(false), 2000);
  };

  // Deskripsi Penjelasan Kategori Resmi D-Store
  const CATEGORY_DESCRIPTIONS = useMemo(() => ({
    all: 'Menampilkan seluruh produk digital D-Store (126 Produk, 345 Paket) dari supplier aktif.',
    cat_1: 'AI Tools & Productivity: Model AI generasi teks, gambar, video & token API (ChatGPT, Gemini AI Pro, Quillbot, Token API).',
    cat_2: 'Streaming & Entertainment: Layanan nonton film, drama & serial TV (Netflix, Disney+, YouTube Premium, Prime Video, Vidio, Viu, WeTV).',
    cat_3: 'Graphic, Design & Video: Aplikasi desain grafis, editing foto & video kreatif (Canva Pro, Capcut, Adobe, Lightroom, Meitu, Alight Motion, VSCO).',
    cat_4: 'Music & Audio: Layanan streaming lagu, musik & podcast bergaransi (Spotify, Apple Music, Deezer).',
    cat_5: 'Edukasi & Bahasa: Aplikasi belajar bahasa, grammar checker & kursus (Duolingo, Grammarly, Scribd, Quizlet, Kahoot, Kilonotes).',
    cat_6: 'VPN & Security: Jaringan privat, enkripsi data & proteksi privasi (Surfshark VPN, ExpressVPN, HMA VPN).',
    cat_7: 'Office, Akun & Tools: Akun kerja, cloud storage & lisensi tools (Microsoft 365, Zoom Pro, GSuite, Source Code, Fizzo).'
  }), []);

  // Filtered Products untuk Poster Promo Stok
  const filteredPosterProducts = useMemo(() => {
    const catsToFilter = posterCategory === 'all'
      ? categories
      : categories.filter(c => c.id === posterCategory);

    const result = [];
    for (const cat of catsToFilter) {
      let prods = products.filter(p => p.categoryId === cat.id);
      if (posterProductFilter !== 'all') {
        prods = prods.filter(p => p.id === posterProductFilter);
      }
      if (Array.isArray(posterSelectedProductIds)) {
        prods = prods.filter(p => posterSelectedProductIds.includes(p.id));
      }
      for (const p of prods) {
        let vars = variants.filter(v => v.productId === p.id);
        if (posterStockFilter === 'ready_only') {
          vars = vars.filter(v => v.isAvailable !== false);
        }
        if (vars.length > 0) {
          result.push({
            ...p,
            categoryName: cat.name,
            filteredVariants: vars
          });
        }
      }
    }
    return result;
  }, [categories, products, variants, posterCategory, posterStockFilter, posterProductFilter, posterSelectedProductIds]);

  const posterPickerProducts = useMemo(() => {
    return products.filter((p) => {
      if (posterPickerCategory !== 'all' && p.categoryId !== posterPickerCategory) {
        return false;
      }
      const prodVariants = variants.filter((v) => v.productId === p.id);
      if (posterPickerStockFilter === 'ready') {
        const hasReady = prodVariants.some((v) => v.isAvailable !== false);
        if (!hasReady) return false;
      }
      if (posterPickerSearch.trim()) {
        const query = posterPickerSearch.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(query);
        const matchCat = (categories.find((c) => c.id === p.categoryId)?.name || '').toLowerCase().includes(query);
        const matchVar = prodVariants.some((v) => (v.name || '').toLowerCase().includes(query));
        if (!matchName && !matchCat && !matchVar) return false;
      }
      return true;
    });
  }, [products, variants, categories, posterPickerCategory, posterPickerStockFilter, posterPickerSearch]);

  const posterAvailableProducts = useMemo(() => {
    if (posterCategory === 'all') return products;
    return products.filter(p => p.categoryId === posterCategory);
  }, [products, posterCategory]);

  const totalPosterPages = useMemo(() => {
    if (posterPageSize === 'all') return 1;
    const size = Number(posterPageSize) || 24;
    return Math.max(1, Math.ceil(filteredPosterProducts.length / size));
  }, [filteredPosterProducts, posterPageSize]);

  const getPaginationPages = (current, total) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  useEffect(() => {
    if (posterCurrentPage > totalPosterPages) {
      setPosterCurrentPage(1);
    }
  }, [totalPosterPages, posterCurrentPage]);

  const displayedPosterProducts = useMemo(() => {
    if (posterPageSize === 'all') return filteredPosterProducts;
    const size = Number(posterPageSize) || 24;
    const start = (posterCurrentPage - 1) * size;
    return filteredPosterProducts.slice(start, start + size);
  }, [filteredPosterProducts, posterPageSize, posterCurrentPage]);

  // Multi-keyword search helper
  const searchWords = useMemo(() => {
    return searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
  }, [searchQuery]);

  // Hitung jumlah produk per kategori (real-time dari products)
  const categoryCounts = useMemo(() => {
    const counts = { all: products.length };
    for (const cat of categories) {
      counts[cat.id] = products.filter(p => p.categoryId === cat.id).length;
    }
    return counts;
  }, [categories, products]);

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return products.map(p => {
      const pVars = Array.isArray(p.variants)
        ? p.variants
        : (variants || []).filter(v => v.productId === p.id);
      return { ...p, variants: pVars };
    }).filter(p => {
      const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
      if (!matchCat) return false;

      if (searchWords.length === 0) return true;

      // Cocokkan kata kunci ke nama produk atau kombinasi nama produk + nama varian
      const prodNameMatches = searchWords.every(w => p.name.toLowerCase().includes(w));
      const anyVarMatches = p.variants.some(v => {
        const combined = `${p.name} ${v.name}`.toLowerCase();
        return searchWords.every(w => combined.includes(w));
      });

      return prodNameMatches || anyVarMatches;
    }).map(p => {
      let matchedVariants = p.variants.filter(v => {
        const matchStock = stockFilter === 'all' || 
          (stockFilter === 'ready' && v.isAvailable) || 
          (stockFilter === 'out' && !v.isAvailable);

        const matchSupplier = selectedSupplier === 'all' || 
          v.supplier === selectedSupplier ||
          (Array.isArray(v.supplierOffers) && v.supplierOffers.some(o => o.supplier === selectedSupplier));

        if (searchWords.length > 0) {
          const combined = `${p.name} ${v.name}`.toLowerCase();
          const matchesVar = searchWords.every(w => combined.includes(w));
          const matchesProdOnly = searchWords.every(w => p.name.toLowerCase().includes(w));
          return matchStock && matchSupplier && (matchesVar || matchesProdOnly);
        }

        return matchStock && matchSupplier;
      });

      // Urutkan varian (Secara default atau saat mencari: Modal Termurah selalu paling atas)
      if (variantSortOrder === 'cheapest' || searchQuery) {
        matchedVariants.sort((a, b) => (a.costPrice || 0) - (b.costPrice || 0));
      } else if (variantSortOrder === 'profit') {
        matchedVariants.sort((a, b) => ((b.price || 0) - (b.costPrice || 0)) - ((a.price || 0) - (a.costPrice || 0)));
      } else if (variantSortOrder === 'selling') {
        matchedVariants.sort((a, b) => (a.price || 0) - (b.price || 0));
      }

      return { ...p, variants: matchedVariants };
    }).filter(p => p.variants.length > 0);
  }, [products, variants, searchQuery, searchWords, selectedCategory, stockFilter, selectedSupplier, variantSortOrder]);

  const readyVariantsCount = useMemo(() => variants.filter(v => v.isAvailable).length, [variants]);
  const outOfStockCount = useMemo(() => variants.filter(v => !v.isAvailable).length, [variants]);
  const totalVaultReady = useMemo(() => vaultItems.filter(i => i.status === 'ready').length, [vaultItems]);

  return (
    <div className="min-h-screen text-black font-sans pb-12">
      {/* Top Header Bar - Authentic Neo Brutalism (like laju.asia) */}
      <header className="sticky top-0 z-40 bg-[#FFE600] border-b-3 border-black shadow-[0_4px_0_0_#000]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Store Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000] shrink-0 font-black">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-black text-black" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-sm sm:text-base tracking-tighter text-black uppercase truncate">
                  D
                  <span className="bg-white text-black px-2 py-0.5 ml-1.5 border-2 border-black rotate-2 inline-block shadow-[2px_2px_0_#000] text-[10px] sm:text-xs font-black tracking-wider">
                    STORE
                  </span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-900 font-bold hidden sm:block truncate">Cloud Reseller Dashboard &amp; Stock Hub</p>
            </div>
          </div>

          {/* Sync Status & Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-emerald-100 text-emerald-950 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black uppercase">
              <span className={`w-2 h-2 rounded-full shrink-0 ${syncing ? 'bg-yellow-400 animate-ping' : 'bg-emerald-600 animate-pulse'}`}></span>
              <span>{syncStatus}</span>
            </div>

            <button
              onClick={handlePullSheet}
              disabled={syncing}
              className="neo-btn flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white hover:bg-black hover:text-white text-black text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] transition disabled:opacity-50"
              title="Tarik data terbaru dari Google Spreadsheet"
            >
              <DownloadCloud className={`w-3.5 h-3.5 shrink-0 ${syncing ? 'animate-bounce' : ''}`} />
              <span>Tarik</span>
            </button>

            <button
              onClick={handlePushSheet}
              disabled={syncing}
              className="neo-btn flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white hover:bg-black hover:text-white text-black text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] transition disabled:opacity-50"
              title="Unggah katalog ke Google Spreadsheet"
            >
              <UploadCloud className="w-3.5 h-3.5 shrink-0" />
              <span>Push</span>
            </button>

            <a
              href="/store"
              target="_blank"
              rel="noopener noreferrer"
              className="neo-btn flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#FFE600] hover:bg-yellow-300 text-black text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] transition"
              title="Buka Halaman Web Jual-Beli Khusus Pembeli"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>Web Pembeli</span>
            </a>

            <a
              href="/reseller"
              target="_blank"
              rel="noopener noreferrer"
              className="neo-btn flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-purple-300 hover:bg-purple-200 text-black text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] transition"
              title="Buka Studio Reseller & Dropshipper"
            >
              <Store className="w-3.5 h-3.5 shrink-0" />
              <span>Studio Reseller</span>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 border-2 border-black shadow-[1.5px_1.5px_0_#000] text-[10px] font-black uppercase">
              <span className={`w-2 h-2 rounded-full ${syncing ? 'bg-yellow-400 animate-ping' : 'bg-emerald-600 animate-pulse'}`}></span>
              <span>Sync</span>
            </div>

            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="p-1.5 rounded-xl bg-black text-[#FFE600] border-2 border-black shadow-[2px_2px_0_#000] shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              title="Buka Menu Hamburger"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Drawer */}
        {mobileNavOpen && (
          <div className="md:hidden mt-2 pt-3 border-t-2 border-black space-y-3 animate-in slide-in-from-top-2 duration-150 pb-3 px-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-black mb-1.5">
                Aksi Cepat & Eksternal
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neo-btn flex items-center justify-center gap-1.5 px-2.5 py-2 bg-white text-black text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0_#000]"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Web Pembeli</span>
                </a>
                <a
                  href="/reseller"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neo-btn flex items-center justify-center gap-1.5 px-2.5 py-2 bg-purple-300 text-black text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0_#000]"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Studio Reseller</span>
                </a>
                <button
                  type="button"
                  onClick={() => { handlePullSheet(); setMobileNavOpen(false); }}
                  disabled={syncing}
                  className="neo-btn flex items-center justify-center gap-1.5 px-2.5 py-2 bg-white text-black text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0_#000] disabled:opacity-50"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>Tarik Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => { handlePushSheet(); setMobileNavOpen(false); }}
                  disabled={syncing}
                  className="neo-btn flex items-center justify-center gap-1.5 px-2.5 py-2 bg-white text-black text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0_#000] disabled:opacity-50"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Push Sheet</span>
                </button>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-black mb-1.5">
                Pilih Tab Halaman
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'catalog', label: 'Katalog & Stok' },
                  { id: 'vault', label: 'Gudang Akun' },
                  { id: 'matrix', label: 'Matrix Kulakan' },
                  { id: 'sales', label: 'Penjualan' },
                  { id: 'expiry', label: 'Pantau Expired' },
                  { id: 'scraper', label: 'Sedot Supplier' },
                  { id: 'sheets_tools', label: 'Spreadsheet' },
                  { id: 'promo_poster', label: 'Poster Promo' },
                  { id: 'ai', label: 'Asisten AI' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      handleTabChange(t.id);
                      setMobileNavOpen(false);
                    }}
                    className={`px-2.5 py-2 rounded-lg border-2 border-black text-xs font-black uppercase tracking-tight shadow-[1.5px_1.5px_0_#000] text-left ${
                      activeTab === t.id ? 'bg-black text-yellow-300' : 'bg-white text-black hover:bg-yellow-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Quick Stat Cards (Authentic Neo Brutalism) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="neo-card p-3.5 sm:p-4 neo-card-hover flex flex-col justify-between min-w-0 bg-white">
            <div className="flex items-center justify-between text-zinc-600 text-xs font-black uppercase tracking-wider">
              <span className="truncate">Total Produk</span>
              <div className="p-1.5 bg-sky-200 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black">
                <Package className="w-3.5 h-3.5 shrink-0" />
              </div>
            </div>
            <div className="mt-2.5 min-w-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-black tracking-tight truncate">{products.length}</div>
              <div className="text-[11px] font-bold text-emerald-700 mt-0.5 truncate">{readyVariantsCount} varian ready</div>
            </div>
          </div>

          <div className="neo-card p-3.5 sm:p-4 neo-card-hover flex flex-col justify-between min-w-0 bg-white">
            <div className="flex items-center justify-between text-zinc-600 text-xs font-black uppercase tracking-wider">
              <span className="truncate">Gudang Akun</span>
              <div className="p-1.5 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black">
                <KeyRound className="w-3.5 h-3.5 shrink-0" />
              </div>
            </div>
            <div className="mt-2.5 min-w-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-black tracking-tight truncate">{totalVaultReady}</div>
              <div className="text-[11px] font-bold text-amber-700 mt-0.5 truncate">Akun siap kirim</div>
            </div>
          </div>

          <div className="neo-card p-3.5 sm:p-4 neo-card-hover flex flex-col justify-between min-w-0 bg-white">
            <div className="flex items-center justify-between text-zinc-600 text-xs font-black uppercase tracking-wider">
              <span className="truncate">Untung Bersih</span>
              <div className="p-1.5 bg-emerald-300 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              </div>
            </div>
            <div className="mt-2.5 min-w-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-700 truncate" title={formatRupiah(salesStats.totalProfit)}>
                {formatRupiah(salesStats.totalProfit)}
              </div>
              <div className="text-[11px] font-bold text-emerald-800 mt-0.5 truncate">
                {currentMonthReport?.totalProfit > 0 ? `+${formatRupiah(currentMonthReport.totalProfit)} bln ini` : `Dari ${sales.length} pesanan`}
              </div>
            </div>
          </div>

          <div className="neo-card p-3.5 sm:p-4 neo-card-hover flex flex-col justify-between min-w-0 bg-white">
            <div className="flex items-center justify-between text-zinc-600 text-xs font-black uppercase tracking-wider">
              <span className="truncate">Masa Aktif Akun</span>
              <div className="p-1.5 bg-rose-200 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black">
                <Clock className="w-3.5 h-3.5 shrink-0" />
              </div>
            </div>
            <div className="mt-2.5 min-w-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-rose-600 truncate">{salesStats.expiringSoonCount}</div>
              <div className="text-[11px] font-bold text-zinc-600 mt-0.5 truncate">Expired &lt;= 3 hari</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu (Authentic Neo Brutalism Tabs) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b-3 border-black text-sm no-scrollbar">
          {[
            { id: 'catalog', label: 'Katalog & Stok', icon: Package },
            { id: 'vault', label: 'Gudang Akun', icon: KeyRound, badge: totalVaultReady },
            { id: 'matrix', label: 'Matrix Kulakan', icon: ArrowRightLeft },
            { id: 'sales', label: 'Penjualan & Garansi', icon: ShoppingBag },
            { id: 'expiry', label: 'Pantau Expired', icon: Clock, badge: salesStats.expiringSoonCount },
            { id: 'scraper', label: 'Sedot Supplier', icon: Zap },
            { id: 'sheets_tools', label: 'Spreadsheet & Tools', icon: FileSpreadsheet },
            { id: 'promo_poster', label: 'Poster Promo', icon: ImageIcon },
            { id: 'ai', label: 'Asisten AI', icon: Sparkles }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`neo-btn flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 font-black whitespace-nowrap text-xs uppercase tracking-tight transition ${
                  isActive 
                    ? 'bg-[#FFE600] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000]' 
                    : 'bg-white text-zinc-800 hover:text-black hover:bg-yellow-100 border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 font-black border border-black ${
                    isActive 
                      ? 'bg-black text-[#FFE600]' 
                      : 'bg-zinc-200 text-black'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ==================================================================== */}
        {/* TAB 1: KATALOG & LIVE STOK CONTROL                                  */}
        {/* ==================================================================== */}
        {activeTab === 'catalog' && (
          <div className="space-y-4">
            {/* Filter & Action Bar (Clean 2-Row Neo-Brutalist Layout) */}
            <div className="space-y-3">
              {/* Baris 1: Pencarian & Tombol Aksi */}
              <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold" />
                  <input
                    type="text"
                    placeholder="Cari canva, netflix, chatgpt, 1y, 1m..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value) setSelectedCategory('all');
                    }}
                    className="w-full pl-10 pr-9 py-2.5 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] focus:shadow-[5px_5px_0px_0px_#000] text-xs font-bold text-black placeholder-zinc-400 outline-none transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-black bg-zinc-200 hover:bg-black hover:text-white px-1.5 py-0.5 border border-black cursor-pointer transition"
                      title="Hapus pencarian"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-start sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setGlossaryTab('canva');
                      setGlossaryModalOpen(true);
                    }}
                    className="neo-btn flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-cyan-200 hover:bg-cyan-100 text-black text-xs font-black uppercase tracking-tight border-2 border-black shadow-[3px_3px_0px_0px_#000] transition cursor-pointer"
                    title="Penjelasan Lengkap Kategori &amp; Paket Canva Pro"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    <span>Panduan Paket</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange('promo_poster')}
                    className="neo-btn flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-fuchsia-300 hover:bg-fuchsia-200 text-black text-xs font-black uppercase tracking-tight border-2 border-black shadow-[3px_3px_0px_0px_#000] transition cursor-pointer"
                    title="Buat Poster Gambar Promo Stok"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Poster Promo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddProductModalOpen(true)}
                    className="neo-btn flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FFE600] hover:bg-yellow-300 text-black text-xs font-black uppercase tracking-tight border-2 border-black shadow-[3px_3px_0px_0px_#000] transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Produk</span>
                  </button>
                </div>
              </div>

              {/* Baris 2: Filter Stok, Toko, dan Urutan Varian */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="px-3.5 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-bold text-black outline-none cursor-pointer"
                >
                  <option value="all">Semua Stok</option>
                  <option value="ready">Hanya Ready</option>
                  <option value="out">Hanya Kosong</option>
                </select>

                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="px-3.5 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-bold text-black outline-none max-w-[180px] truncate cursor-pointer"
                >
                  <option value="all">Semua Toko ({allSuppliers.length})</option>
                  {allSuppliers.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  value={variantSortOrder}
                  onChange={(e) => setVariantSortOrder(e.target.value)}
                  className="px-3.5 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-bold text-black outline-none cursor-pointer"
                  title="Urutan Tampilan Varian"
                >
                  <option value="cheapest">Urutan: Modal Termurah</option>
                  <option value="profit">Urutan: Untung Tertinggi</option>
                  <option value="selling">Urutan: Harga Jual Terendah</option>
                  <option value="default">Urutan: Standar</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className={`neo-btn px-3.5 py-1.5 font-black whitespace-nowrap uppercase tracking-tight transition ${
                  selectedCategory === 'all' 
                    ? 'bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]' 
                    : 'bg-white text-zinc-800 hover:bg-yellow-100 hover:text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                }`}
              >
                Semua ({categoryCounts.all || 0})
              </button>
              {categories.map(cat => {
                const count = categoryCounts[cat.id] || 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSearchQuery('');
                    }}
                    className={`neo-btn px-3.5 py-1.5 font-black whitespace-nowrap uppercase tracking-tight transition ${
                      selectedCategory === cat.id 
                        ? 'bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]' 
                        : 'bg-white text-zinc-800 hover:bg-yellow-100 hover:text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Category Explanation Banner */}
            <div className="p-3 bg-amber-100/90 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-between gap-3 text-xs font-bold text-black">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1 bg-[#FFE600] border border-black shadow-[1px_1px_0_#000] shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                </span>
                <span className="truncate">
                  {CATEGORY_DESCRIPTIONS[selectedCategory] || CATEGORY_DESCRIPTIONS.all}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setGlossaryTab('categories');
                  setGlossaryModalOpen(true);
                }}
                className="text-[11px] font-black underline uppercase hover:text-amber-900 shrink-0 cursor-pointer"
              >
                Detail &rarr;
              </button>
            </div>

            {/* Product & Variant Cards Grid */}
            {loading ? (
              <div className="py-20 text-center text-zinc-700 flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-black" />
                <span className="text-xs font-bold uppercase tracking-wider">Memuat katalog D Store...</span>
              </div>
            ) : filteredCatalog.length === 0 ? (
              <div className="py-12 px-4 text-center neo-card border-dashed bg-amber-50/70 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-200 border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000]">
                  <Search className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-black uppercase tracking-tight">
                    Tidak Ada Produk yang Cocok
                  </h4>
                  <p className="text-xs text-zinc-700 font-bold mt-1 max-w-md mx-auto">
                    Kategori <span className="text-black uppercase underline">"{categories.find(c => c.id === selectedCategory)?.name || 'Semua'}"</span> memiliki {categoryCounts[selectedCategory] || categoryCounts.all || 0} produk, namun tersembunyi karena filter aktif di bawah ini:
                  </p>
                </div>

                {/* Info Filter Aktif */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-black pt-1">
                  {searchQuery && (
                    <span className="px-2.5 py-1 bg-white border border-black shadow-[1px_1px_0_#000]">
                      Kata Kunci: <b>"{searchQuery}"</b>
                    </span>
                  )}
                  {selectedSupplier !== 'all' && (
                    <span className="px-2.5 py-1 bg-white border border-black shadow-[1px_1px_0_#000]">
                      Toko: <b>"{selectedSupplier}"</b>
                    </span>
                  )}
                  {stockFilter !== 'all' && (
                    <span className="px-2.5 py-1 bg-white border border-black shadow-[1px_1px_0_#000]">
                      Stok: <b>"{stockFilter === 'ready' ? 'Hanya Ready' : 'Hanya Kosong'}"</b>
                    </span>
                  )}
                </div>

                {/* Tombol Pemulih Filter */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="neo-btn px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-black text-xs font-black uppercase tracking-tight border-2 border-black shadow-[2px_2px_0_#000] cursor-pointer"
                    >
                      Hapus Kata Kunci "{searchQuery}"
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSupplier('all');
                      setStockFilter('all');
                    }}
                    className="neo-btn px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-tight border-2 border-black shadow-[2px_2px_0_#000] cursor-pointer"
                  >
                    Tampilkan Semua ({categoryCounts[selectedCategory] || categoryCounts.all || 0} Produk) di Kategori Ini
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCatalog.map(prod => (
                  <div key={prod.id} className="neo-card p-4 sm:p-5 neo-card-hover flex flex-col justify-between bg-white">
                    <div>
                      <div className="flex items-start justify-between gap-2 border-b-2 border-black pb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-black text-sm sm:text-base text-black uppercase tracking-tight line-clamp-2 break-words" title={prod.name}>{prod.name}</h3>
                          <p className="text-xs text-zinc-600 mt-0.5 line-clamp-1 font-medium">
                            {selectedSupplier !== 'all'
                              ? `Katalog Paket ${selectedSupplier}`
                              : (prod.description && !prod.description.includes('Produk supplier') && !prod.description.includes('AI Scraper')
                                  ? prod.description
                                  : 'Akun Premium Resmi & Bergaransi')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                          {prod.name.toLowerCase().includes('canva') && (
                            <button
                              type="button"
                              onClick={() => {
                                setGlossaryTab('canva');
                                setGlossaryModalOpen(true);
                              }}
                              className="neo-btn text-[10px] font-black px-2 py-1 bg-cyan-200 hover:bg-cyan-300 text-black border-2 border-black shadow-[1.5px_1.5px_0_#000] uppercase tracking-tight flex items-center gap-1 cursor-pointer"
                              title="Lihat arti paket Invite Member, Head Owner 100 User, dan Lifetime"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Arti Paket</span>
                            </button>
                          )}
                          <span className="text-xs font-black px-2.5 py-1 bg-yellow-200 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] whitespace-nowrap uppercase">
                            {prod.variants.length} Paket
                          </span>
                        </div>
                      </div>

                      {/* Variant Rows with Saklar Toggle (Neo Brutalism) */}
                      <div className="mt-3.5 space-y-2.5">
                        {prod.variants.map((v, vIdx) => {
                          const profit = (v.price || 0) - (v.costPrice || 0);
                          const vaultCount = vaultReadyCounts[v.id] || 0;
                          const minCostInProduct = Math.min(...prod.variants.map(x => x.costPrice || 0));
                          const isCheapestInProduct = prod.variants.length > 1 && (v.costPrice || 0) === minCostInProduct;
                          const hasMultipleOffers = Array.isArray(v.supplierOffers) && v.supplierOffers.length > 1;
                          const maxOfferCost = hasMultipleOffers 
                            ? Math.max(...v.supplierOffers.map(o => o.costPrice || 0)) 
                            : (v.costPrice || 0);

                          return (
                            <div 
                              key={v.id ? `${v.id}_${vIdx}` : vIdx} 
                              className={`flex items-center justify-between gap-2.5 sm:gap-3 p-3 border-2 border-black transition ${
                                v.isAvailable 
                                  ? 'bg-[#fafaf7] shadow-[2px_2px_0px_0px_#000]' 
                                  : 'bg-zinc-100 opacity-70'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                {/* Baris 1: Nama variant + Badge Termurah */}
                                <div className="mb-1.5 flex items-center justify-between gap-1.5 flex-wrap">
                                  <span className="font-black text-xs text-black leading-tight break-words" title={v.name}>
                                    {getCleanVariantName(v.name, prod.name)}
                                  </span>
                                  {isCheapestInProduct && (
                                    <span className="text-[10px] px-2 py-0.5 bg-[#FFE600] text-black border-2 border-black font-black uppercase shadow-[1.5px_1.5px_0_#000] shrink-0">
                                      Termurah
                                    </span>
                                  )}
                                </div>
                                {/* Baris 2: Supplier badge + Status badge */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {(() => {
                                    const offer = Array.isArray(v.supplierOffers) ? v.supplierOffers.find(o => o.supplier === v.supplier) : null;
                                    const suppInfo = getSupplierLinkInfo(v.supplier || 'heavenprem', offer?.contact);
                                    const isClickable = suppInfo.url && suppInfo.url !== '#';
                                    const badgeContent = (
                                      <>
                                        {suppInfo.type === 'telegram' ? (
                                          <Send className="w-2.5 h-2.5 text-sky-600 shrink-0" />
                                        ) : suppInfo.type === 'whatsapp' ? (
                                          <MessageCircle className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                        ) : (
                                          <Store className="w-2.5 h-2.5 text-zinc-600 shrink-0" />
                                        )}
                                        <span className="truncate">{v.supplier || 'heavenprem'}</span>
                                      </>
                                    );

                                    return isClickable ? (
                                      <a
                                        href={suppInfo.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        title={`Buka chat/bot: ${suppInfo.label} (${suppInfo.type === 'telegram' ? 'Telegram' : 'WhatsApp'})`}
                                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-white hover:bg-yellow-200 text-black border border-black font-bold truncate max-w-[110px] sm:max-w-[140px] shadow-[1px_1px_0_#000] transition active:scale-95"
                                      >
                                        {badgeContent}
                                      </a>
                                    ) : (
                                      <span
                                        title={`Toko Supplier: ${v.supplier}`}
                                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-white text-black border border-black font-bold truncate max-w-[110px] sm:max-w-[140px] shadow-[1px_1px_0_#000]"
                                      >
                                        {badgeContent}
                                      </span>
                                    );
                                  })()}
                                  <span className={`text-[10px] px-2 py-0.5 font-black uppercase shrink-0 border-2 border-black shadow-[1.5px_1.5px_0_#000] ${
                                    v.isAvailable 
                                      ? 'bg-emerald-300 text-black' 
                                      : 'bg-rose-200 text-black'
                                  }`}>
                                    {v.isAvailable ? 'Ready' : 'Kosong'}
                                  </span>
                                  {vaultCount > 0 && (
                                    <span className="text-[10px] px-2 py-0.5 bg-sky-200 text-black border-2 border-black shadow-[1.5px_1.5px_0_#000] font-black shrink-0">
                                      {vaultCount} di gudang
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-x-2.5 sm:gap-x-3 gap-y-1 text-xs mt-1.5 flex-wrap">
                                  <span className="text-black font-black whitespace-nowrap">{formatRupiah(v.price)}</span>
                                  <span className="text-zinc-600 text-xs whitespace-nowrap font-bold">Modal: {formatRupiah(v.costPrice)}</span>
                                  <span className="bg-emerald-200 text-emerald-950 text-xs font-black px-1.5 py-0.2 border border-black whitespace-nowrap">+{formatRupiah(profit)}</span>
                                  {hasMultipleOffers && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSupplierTargetVar({ ...v, productName: prod.name });
                                        setSupplierModalOpen(true);
                                      }}
                                      className="neo-btn text-[10px] bg-sky-200 hover:bg-sky-300 text-black border-2 border-black shadow-[1.5px_1.5px_0_#000] px-2 py-0.5 font-black whitespace-nowrap cursor-pointer transition flex items-center gap-1 active:scale-95"
                                      title="Klik untuk melihat perbandingan toko supplier, harga modal, dan opsi toko"
                                    >
                                      <Store className="w-3 h-3" />
                                      <span>{v.supplierOffers.length} Toko (Batas Aman: {formatRupiah(maxOfferCost)})</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons & Switch Toggle */}
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingVariant({ ...v, productName: prod.name });
                                    setEditModalOpen(true);
                                  }}
                                  className="p-2 bg-white hover:bg-black hover:text-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] neo-btn transition"
                                  title="Edit harga atau toko"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                {/* Switch Toggle Button */}
                                <button
                                  onClick={() => handleToggleStock(v.id, v.isAvailable)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                                    v.isAvailable ? 'bg-emerald-400' : 'bg-zinc-300'
                                  }`}
                                  title={v.isAvailable ? 'Klik untuk kosongkan stok' : 'Klik untuk readikan stok'}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                                      v.isAvailable ? 'translate-x-5.5' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: GUDANG AKUN SIAP PAKAI (STOCK VAULT)                          */}
        {/* ==================================================================== */}
        {activeTab === 'vault' && (
          <div className="space-y-5">
            <div className="neo-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
              <div>
                <h2 className="font-black text-sm sm:text-base text-black flex items-center gap-2 uppercase tracking-tight">
                  <span className="p-1.5 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0_#000]">
                    <KeyRound className="w-4 h-4 text-black" />
                  </span>
                  Gudang Akun Siap Pakai (Stock Vault)
                </h2>
                <p className="text-xs text-zinc-600 mt-1 font-medium">
                  Simpan batch kredensial akun kulakan. Saat ada pesanan atau klaim garansi, sistem otomatis mendisposisikan akun ke pembeli.
                </p>
              </div>

              <div className="text-xs px-3.5 py-2 bg-[#FFE600] text-black border-2 border-black font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] self-start sm:self-auto">
                Total {totalVaultReady} Akun Ready
              </div>
            </div>

            {vaultFeedback && (
              <div className="p-3.5 bg-yellow-200 border-2 border-black shadow-[3px_3px_0px_0px_#000] text-xs font-bold text-black flex items-center justify-between">
                <span>{vaultFeedback}</span>
                <button onClick={() => setVaultFeedback('')} className="text-black bg-white hover:bg-black hover:text-white font-black text-xs px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] neo-btn">
                  Tutup
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
              {/* Form Input Batch Akun */}
              <div className="xl:col-span-1 neo-card p-4 sm:p-5 space-y-4 bg-white">
                <h3 className="font-black text-xs sm:text-sm text-black flex items-center gap-2 uppercase tracking-tight pb-2 border-b-2 border-black">
                  <Plus className="w-4 h-4" />
                  Tambah Batch Akun
                </h3>

                <form onSubmit={handleAddVaultBatch} className="space-y-3.5">
                  <div>
                    <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Pilih Varian Paket</label>
                    <select
                      value={newVaultForm.variantId}
                      onChange={(e) => {
                        const vId = e.target.value;
                        const selected = variants.find(v => v.id === vId);
                        setNewVaultForm(prev => ({
                          ...prev,
                          variantId: vId,
                          supplier: selected ? selected.supplier : '',
                          costPrice: selected ? selected.costPrice : ''
                        }));
                      }}
                      required
                      className="w-full mt-1 px-3 py-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-bold text-black focus:shadow-[4px_4px_0px_0px_#000] outline-none cursor-pointer"
                    >
                      <option value="">-- Pilih Varian Produk --</option>
                      {products.map(p => (
                        <optgroup key={p.id} label={p.name}>
                          {variants.filter(v => v.productId === p.id).map((v, vIdx) => (
                            <option key={v.id ? `${v.id}_${vIdx}` : vIdx} value={v.id}>
                              {p.name} - {v.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Toko Supplier</label>
                      <input
                        type="text"
                        placeholder="Toko A"
                        value={newVaultForm.supplier}
                        onChange={(e) => setNewVaultForm({ ...newVaultForm, supplier: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-bold text-black focus:shadow-[4px_4px_0px_0px_#000] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Modal / Akun (Rp)</label>
                      <input
                        type="number"
                        placeholder="15000"
                        value={newVaultForm.costPrice}
                        onChange={(e) => setNewVaultForm({ ...newVaultForm, costPrice: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-mono font-bold text-black focus:shadow-[4px_4px_0px_0px_#000] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">
                      Daftar Akun (1 Akun per baris)
                    </label>
                    <textarea
                      rows={6}
                      placeholder={`user1@gmail.com:pass123:PIN 1\nuser2@gmail.com:pass456:PIN 2\nuser3@gmail.com:pass789:PIN 3`}
                      value={newVaultForm.rawAccounts}
                      onChange={(e) => setNewVaultForm({ ...newVaultForm, rawAccounts: e.target.value })}
                      required
                      className="w-full mt-1 p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-mono font-bold text-black placeholder-zinc-400 leading-relaxed focus:shadow-[4px_4px_0px_0px_#000] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={vaultActionLoading}
                    className="w-full py-3 bg-[#FFE600] hover:bg-yellow-300 text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] neo-btn transition active:scale-95 disabled:opacity-50"
                  >
                    {vaultActionLoading ? 'Menyimpan...' : 'Simpan Akun ke Gudang'}
                  </button>
                </form>
              </div>

              {/* Tabel Stok Akun di Gudang */}
              <div className="xl:col-span-2 neo-card p-4 sm:p-5 space-y-4 bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <h3 className="font-black text-xs sm:text-sm text-black uppercase tracking-tight">Daftar Akun Tersimpan</h3>
                  
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Cari akun / produk..."
                      value={vaultSearch}
                      onChange={(e) => setVaultSearch(e.target.value)}
                      className="flex-1 sm:w-48 px-3 py-1.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-bold text-black outline-none focus:shadow-[3px_3px_0_#000]"
                    />
                    <select
                      value={vaultFilter}
                      onChange={(e) => setVaultFilter(e.target.value)}
                      className="px-3 py-1.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-bold text-black outline-none shrink-0 cursor-pointer"
                    >
                      <option value="all">Semua Status</option>
                      <option value="ready">Hanya Ready</option>
                      <option value="sold">Terjual</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-96 no-scrollbar border-2 border-black shadow-[3px_3px_0_#000]">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead className="bg-[#FFE600] border-b-2 border-black text-black font-black uppercase tracking-wider text-[11px] sticky top-0">
                      <tr>
                        <th className="p-2.5">Varian</th>
                        <th className="p-2.5">Akun (Email:Pass)</th>
                        <th className="p-2.5">Supplier</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-zinc-200 text-black bg-white">
                      {vaultItems
                        .filter(i => {
                          const matchStatus = vaultFilter === 'all' || 
                            (vaultFilter === 'ready' && i.status === 'ready') ||
                            (vaultFilter === 'sold' && i.status !== 'ready');
                          const matchSearch = vaultSearch === '' || 
                            i.account.toLowerCase().includes(vaultSearch.toLowerCase()) ||
                            i.productName.toLowerCase().includes(vaultSearch.toLowerCase());
                          return matchStatus && matchSearch;
                        })
                        .map(item => (
                          <tr key={item.id} className="hover:bg-yellow-50/70 transition">
                            <td className="p-2.5 font-bold">
                              <div>{item.productName}</div>
                              <div className="text-[10px] text-zinc-600 font-medium">{item.variantName}</div>
                            </td>
                            <td className="p-2.5 font-mono font-bold text-xs max-w-[140px] sm:max-w-[200px] md:max-w-[240px] truncate" title={item.account}>
                              {item.account}
                            </td>
                            <td className="p-2.5 text-zinc-700 text-xs font-bold">{item.supplier}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 border-2 border-black shadow-[1.5px_1.5px_0_#000] font-black text-[10px] uppercase whitespace-nowrap ${
                                item.status === 'ready' 
                                  ? 'bg-emerald-300 text-black' 
                                  : (item.status === 'warranty_replaced' ? 'bg-[#FFE600] text-black' : 'bg-zinc-200 text-zinc-700')
                              }`}>
                                {item.status === 'ready' ? 'Ready' : (item.status === 'warranty_replaced' ? 'Garansi' : 'Terjual')}
                              </span>
                            </td>
                            <td className="p-2.5 text-right">
                              {item.status === 'ready' && (
                                <button
                                  onClick={() => handleDeleteVaultItem(item.id)}
                                  className="p-1 text-zinc-600 hover:text-rose-600 hover:bg-rose-100 transition border border-transparent hover:border-black rounded cursor-pointer"
                                  title="Hapus dari gudang"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      {vaultItems.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-zinc-600 font-bold uppercase text-xs">
                            Belum ada akun tersimpan di gudang. Masukkan akun baru pada form di samping.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: MATRIX SUPPLIER & SMART KULAKAN ADVISOR                       */}
        {/* ==================================================================== */}
        {activeTab === 'matrix' && (
          <div className="space-y-4">
            <div className="neo-card p-4 sm:p-5">
              <h2 className="font-black text-sm sm:text-base text-black flex items-center gap-2 uppercase tracking-wide">
                <ArrowRightLeft className="w-5 h-5 text-black" />
                Matrix Kulakan Multi-Supplier
              </h2>
              <p className="text-xs text-zinc-600 mt-1 font-medium">
                Perbandingan harga modal antar-supplier untuk memilih margin keuntungan terbaik.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {variants.map((v, vIdx) => {
                const prod = products.find(p => p.id === v.productId);
                const offers = Array.isArray(v.supplierOffers) && v.supplierOffers.length > 0
                  ? v.supplierOffers
                  : [{ supplier: v.supplier || 'heavenprem', costPrice: v.costPrice || 0, isAvailable: v.isAvailable !== false }];

                const sortedOffers = [...offers].sort((a, b) => a.costPrice - b.costPrice);
                const cheapestReady = sortedOffers.find(o => o.isAvailable);

                return (
                  <div key={v.id ? `${v.id}_${vIdx}` : vIdx} className="neo-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 neo-card-hover">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs sm:text-sm text-black">{prod ? prod.name : 'Produk'}</span>
                        <span className="text-xs text-zinc-600 font-bold">({v.name})</span>
                      </div>
                      <div className="text-xs text-zinc-600 mt-1 font-medium">
                        Harga Jual: <span className="font-black text-black">{formatRupiah(v.price)}</span>
                      </div>

                      {/* Pill Supplier Offers (Neo Brutalism) */}
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        {sortedOffers.map((o, idx) => {
                          const isBest = cheapestReady && cheapestReady.supplier === o.supplier;
                          const suppInfo = getSupplierLinkInfo(o.supplier, o.contact);
                          return (
                            <a
                              key={idx}
                              href={suppInfo.url}
                              target="_blank"
                              rel="noreferrer"
                              title={`Buka chat/bot supplier: ${suppInfo.label} (${suppInfo.type === 'telegram' ? 'Telegram' : 'WhatsApp'})`}
                              className={`neo-btn text-xs px-2.5 py-1 rounded-lg border-2 border-black flex items-center gap-1.5 transition cursor-pointer hover:opacity-95 ${
                                isBest 
                                  ? 'bg-[#FFE600] text-black font-black shadow-[2px_2px_0_#000]' 
                                  : (o.isAvailable ? 'bg-white hover:bg-yellow-50 text-black font-bold shadow-[2px_2px_0_#000]' : 'bg-zinc-100 text-zinc-400 line-through')
                              }`}
                            >
                              {suppInfo.type === 'telegram' ? (
                                <Send className="w-3 h-3 text-sky-700 shrink-0" />
                              ) : suppInfo.type === 'whatsapp' ? (
                                <MessageCircle className="w-3 h-3 text-emerald-700 shrink-0" />
                              ) : (
                                <ExternalLink className="w-3 h-3 text-zinc-700 shrink-0" />
                              )}
                              <span>{o.supplier}: {formatRupiah(o.costPrice)}</span>
                              {isBest && <span className="text-[9px] bg-emerald-400 text-black px-1.5 py-0.5 rounded font-black border border-black shadow-[1px_1px_0_#000]">TERMURAH</span>}
                              {!o.isAvailable && <span className="text-[9px] text-rose-700 font-black border border-rose-400 px-1 rounded bg-rose-100">KOSONG</span>}
                            </a>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => {
                          setSupplierTargetVar(v);
                          setNewSupplierForm({ supplier: '', costPrice: '', contact: '', isAvailable: true });
                          setSupplierModalOpen(true);
                        }}
                        className="neo-btn px-3 py-1.5 text-xs font-black rounded-lg bg-sky-100 hover:bg-sky-200 text-black border-2 border-black shadow-[2px_2px_0_#000]"
                      >
                        + Tambah Toko
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: CATAT PENJUALAN, DIRECT WHATSAPP & KLAIM GARANSI              */}
        {/* ==================================================================== */}
        {activeTab === 'sales' && (
          <div className="space-y-5">
            
            {/* Header Pembukuan Toko & Switcher Mode */}
            <div className="neo-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-[#FFE600] text-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#000]">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-black uppercase tracking-wide">
                      Pembukuan &amp; Penjualan Toko
                    </h2>
                    <p className="text-xs text-zinc-600 font-bold mt-0.5">
                      Periode Berjalan: <span className="text-black font-black uppercase underline decoration-[#FFE600] decoration-2">{currentMonthReport.monthLabel || 'Bulan Ini'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* View Mode Switcher: Log Kasir vs Laporan Pembukuan */}
              <div className="flex items-center gap-2 self-start md:self-center">
                <button
                  type="button"
                  onClick={() => setSalesViewMode('transactions')}
                  className={`neo-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase transition border-2 border-black ${
                    salesViewMode === 'transactions'
                      ? 'bg-[#FFE600] text-black shadow-[3px_3px_0_#000]'
                      : 'bg-white text-zinc-700 hover:bg-yellow-50 shadow-[2px_2px_0_#000]'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Log Kasir &amp; Form</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSalesViewMode('monthly')}
                  className={`neo-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase transition border-2 border-black ${
                    salesViewMode === 'monthly'
                      ? 'bg-emerald-300 text-black shadow-[3px_3px_0_#000]'
                      : 'bg-white text-zinc-700 hover:bg-emerald-50 shadow-[2px_2px_0_#000]'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Laporan Pembukuan ({monthlyReports.length} Bln)</span>
                </button>
              </div>
            </div>

            {/* 4 KPI Keuangan Bulan Berjalan (Current Month Financial Health) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="neo-card p-3.5 bg-white flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600">Omzet Bulan Ini</span>
                <div className="mt-2">
                  <div className="text-base sm:text-xl font-black text-black truncate">{formatRupiah(currentMonthReport.totalRevenue)}</div>
                  <div className="text-[10px] text-zinc-500 font-bold">{currentMonthReport.orderCount} pesanan</div>
                </div>
              </div>

              <div className="neo-card p-3.5 bg-white flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600">Modal Kulakan</span>
                <div className="mt-2">
                  <div className="text-base sm:text-xl font-black text-rose-700 truncate">{formatRupiah(currentMonthReport.totalCost)}</div>
                  <div className="text-[10px] text-zinc-500 font-bold">Biaya HPP akun</div>
                </div>
              </div>

              <div className="neo-card p-3.5 bg-white flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600">Laba Bersih Toko</span>
                <div className="mt-2">
                  <div className="text-base sm:text-xl font-black text-emerald-700 truncate">+{formatRupiah(currentMonthReport.totalProfit)}</div>
                  <div className="text-[10px] text-emerald-800 font-black">Profit bersih toko</div>
                </div>
              </div>

              <div className="neo-card p-3.5 bg-white flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600">Margin Rata-rata</span>
                <div className="mt-2">
                  <div className="text-base sm:text-xl font-black text-indigo-700 truncate">{currentMonthReport.marginPercent}%</div>
                  <div className="text-[10px] text-zinc-500 font-bold">Rasio keuntungan</div>
                </div>
              </div>
            </div>

            {salesViewMode === 'monthly' ? (
              /* TABEL PEMBUKUAN BULANAN (P&L TOKO) */
              <div className="neo-card p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black">
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-black uppercase tracking-wide flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-black" />
                      Rekap Laba Rugi Bulanan (P&amp;L)
                    </h3>
                    <p className="text-xs text-zinc-600 font-bold mt-0.5">
                      Pembukuan performa omzet, modal, laba bersih, dan profit margin toko per bulan.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadExcel}
                    className="neo-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wide self-start sm:self-auto"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Unduh Excel Pembukuan</span>
                  </button>
                </div>

                <div className="overflow-x-auto no-scrollbar border-2 border-black rounded-xl">
                  <table className="w-full text-left text-xs min-w-[650px]">
                    <thead className="bg-[#FFE600] border-b-2 border-black text-black font-black uppercase text-[11px]">
                      <tr>
                        <th className="p-3">Periode Bulan</th>
                        <th className="p-3 text-center">Transaksi</th>
                        <th className="p-3 text-right">Omzet Penjualan</th>
                        <th className="p-3 text-right">Modal Kulakan</th>
                        <th className="p-3 text-right">Untung Bersih</th>
                        <th className="p-3 text-center">Margin (%)</th>
                        <th className="p-3 text-center">Kinerja</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black font-bold">
                      {monthlyReports.map((m, idx) => (
                        <tr key={idx} className="hover:bg-yellow-50/60 transition">
                          <td className="p-3">
                            <span className="font-black text-black uppercase">{m.monthLabel}</span>
                          </td>
                          <td className="p-3 text-center font-mono">
                            {m.orderCount} order
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-black">
                            {formatRupiah(m.totalRevenue)}
                          </td>
                          <td className="p-3 text-right font-mono text-rose-700">
                            {formatRupiah(m.totalCost)}
                          </td>
                          <td className="p-3 text-right font-mono font-black text-emerald-700">
                            +{formatRupiah(m.totalProfit)}
                          </td>
                          <td className="p-3 text-center font-mono font-black text-indigo-700">
                            {m.marginPercent}%
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black border border-black uppercase ${
                              m.totalProfit > 0 
                                ? 'bg-emerald-300 text-black' 
                                : m.totalProfit === 0 
                                ? 'bg-zinc-200 text-black' 
                                : 'bg-rose-300 text-black'
                            }`}>
                              {m.totalProfit > 0 ? 'Surplus' : m.totalProfit === 0 ? 'BEP' : 'Defisit'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {monthlyReports.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-zinc-600 font-bold text-xs uppercase">
                            Belum ada riwayat transaksi penjualan untuk direkap.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <>
            {/* Widget Analitik Ringkas (Neo Brutalism) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Top 5 Produk Terlaris */}
              <div className="neo-card p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xs sm:text-sm text-black flex items-center gap-1.5 uppercase tracking-wide">
                    <BarChart3 className="w-4 h-4 text-black" />
                    Produk Terlaris
                  </h3>
                  <span className="text-[11px] text-zinc-600 font-bold uppercase">Paling Diminati</span>
                </div>
                <div className="space-y-2">
                  {analytics.topProducts.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#f4f4f0] border-2 border-black shadow-[2px_2px_0_#000]">
                      <div className="min-w-0 flex-1 mr-2">
                        <span className="font-black text-black truncate block">{item.name}</span>
                        <div className="text-[10px] text-zinc-600 font-bold">{item.count} pesanan</div>
                      </div>
                      <span className="text-emerald-700 font-black whitespace-nowrap">+{formatRupiah(item.profit)}</span>
                    </div>
                  ))}
                  {analytics.topProducts.length === 0 && (
                    <p className="text-xs text-zinc-500 font-medium">Belum ada riwayat transaksi.</p>
                  )}
                </div>
              </div>

              {/* Performa Supplier & Garansi */}
              <div className="neo-card p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xs sm:text-sm text-black flex items-center gap-1.5 uppercase tracking-wide">
                    <ShieldCheck className="w-4 h-4 text-black" />
                    Performa Supplier &amp; Kualitas
                  </h3>
                  <span className="text-[11px] text-zinc-600 font-bold uppercase">Tingkat Garansi</span>
                </div>
                <div className="space-y-2">
                  {analytics.supplierStats.slice(0, 4).map((supp, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#f4f4f0] border-2 border-black shadow-[2px_2px_0_#000]">
                      <div className="min-w-0 flex-1 mr-2">
                        <span className="font-black text-black truncate block">{supp.supplier}</span>
                        <div className="text-[10px] text-zinc-600 font-bold">{supp.salesCount} akun terjual</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-emerald-700 font-black whitespace-nowrap">+{formatRupiah(supp.profit)}</div>
                        <div className={`text-[10px] font-black ${supp.warrantyCount > 0 ? 'text-rose-600' : 'text-zinc-600'}`}>
                          {supp.warrantyCount} komplain
                        </div>
                      </div>
                    </div>
                  ))}
                  {analytics.supplierStats.length === 0 && (
                    <p className="text-xs text-zinc-500 font-medium">Belum ada data supplier.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
              {/* Form Transaksi Penjualan */}
              <div className="xl:col-span-1 neo-card p-4 sm:p-5 space-y-4">
                <h2 className="font-black text-sm text-black flex items-center gap-2 uppercase tracking-wide">
                  <ShoppingBag className="w-4 h-4 text-black" />
                  Form Catat Penjualan
                </h2>

                <form onSubmit={handleRecordSale} className="space-y-3">
                  <div>
                    <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Pilih Paket / Varian</label>
                    <select
                      value={saleForm.variantId}
                      onChange={(e) => {
                        const vId = e.target.value;
                        const selected = variants.find(v => v.id === vId);
                        setSaleForm(prev => ({
                          ...prev,
                          variantId: vId,
                          sellingPrice: selected ? selected.price : '',
                          costPrice: selected ? selected.costPrice : '',
                          vaultId: ''
                        }));
                      }}
                      required
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-bold focus:outline-none focus:bg-yellow-50"
                    >
                      <option value="">-- Pilih Paket --</option>
                      {products.map(p => (
                        <optgroup key={p.id} label={p.name}>
                          {variants.filter(v => v.productId === p.id).map((v, vIdx) => (
                            <option key={v.id ? `${v.id}_${vIdx}` : vIdx} value={v.id}>
                              {p.name} - {v.name} ({formatRupiah(v.price)})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Kredensial Akun</label>
                      {saleForm.variantId && (vaultReadyCounts[saleForm.variantId] || 0) > 0 && (
                        <button
                          type="button"
                          onClick={handlePickVaultForSale}
                          className="text-[11px] text-blue-700 font-black hover:underline flex items-center gap-1"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Ambil dari Gudang ({vaultReadyCounts[saleForm.variantId]})</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="email@gmail.com:pass123:Profil 1:1234"
                      value={saleForm.account}
                      onChange={(e) => setSaleForm({ ...saleForm, account: e.target.value })}
                      required
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-mono focus:outline-none focus:bg-yellow-50"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Nama Pembeli</label>
                    <input
                      type="text"
                      placeholder="Budi / Nama Pelanggan"
                      value={saleForm.buyer}
                      onChange={(e) => setSaleForm({ ...saleForm, buyer: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-bold focus:outline-none focus:bg-yellow-50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-5">
                      <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Saluran Kontak</label>
                      <select
                        value={saleForm.buyerPlatform}
                        onChange={(e) => setSaleForm({ ...saleForm, buyerPlatform: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-black focus:outline-none focus:bg-yellow-50"
                      >
                        <option value="whatsapp">WhatsApp (WA)</option>
                        <option value="telegram">Telegram (@user)</option>
                        <option value="instagram">Instagram (IG)</option>
                        <option value="tiktok">TikTok</option>
                        <option value="other">Sosmed Lainnya</option>
                      </select>
                    </div>

                    <div className="sm:col-span-7">
                      <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">
                        {saleForm.buyerPlatform === 'telegram' ? 'Kontak / Username Telegram' :
                         saleForm.buyerPlatform === 'instagram' ? 'Username Instagram' :
                         saleForm.buyerPlatform === 'tiktok' ? 'Username TikTok' :
                         saleForm.buyerPlatform === 'other' ? 'Kontak / Link Profil' : 'No. WhatsApp'}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          saleForm.buyerPlatform === 'telegram' ? '@username atau budi_tg' :
                          saleForm.buyerPlatform === 'instagram' ? '@username_ig' :
                          saleForm.buyerPlatform === 'tiktok' ? '@username_tiktok' :
                          saleForm.buyerPlatform === 'other' ? 'Tautan profil atau ID' : '08123456789'
                        }
                        value={saleForm.buyerContact}
                        onChange={(e) => setSaleForm({ 
                          ...saleForm, 
                          buyerContact: e.target.value,
                          buyerPhone: e.target.value
                        })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-bold focus:outline-none focus:bg-yellow-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Durasi</label>
                      <input
                        type="text"
                        placeholder="30d"
                        value={saleForm.duration}
                        onChange={(e) => setSaleForm({ ...saleForm, duration: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-bold focus:outline-none focus:bg-yellow-50"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Harga Jual</label>
                      <input
                        type="number"
                        value={saleForm.sellingPrice}
                        onChange={(e) => setSaleForm({ ...saleForm, sellingPrice: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-bold focus:outline-none focus:bg-yellow-50"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Modal</label>
                      <input
                        type="number"
                        value={saleForm.costPrice}
                        onChange={(e) => setSaleForm({ ...saleForm, costPrice: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-bold focus:outline-none focus:bg-yellow-50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 rounded-lg bg-[#FFE600] hover:bg-[#fff033] text-black text-xs font-black border-2 border-black shadow-[3px_3px_0_#000] neo-btn transition active:scale-95 uppercase tracking-wide"
                  >
                    Simpan Transaksi
                  </button>
                </form>
              </div>

              {/* Template Kirim & Riwayat Penjualan */}
              <div className="xl:col-span-2 space-y-4">
                {/* Invoice Terakhir dengan Tombol Direct Chat Platform */}
                {lastRecordedSale && (() => {
                  const invoiceText = 
                    `PESANAN SELESAI - D STORE\n\n` +
                    `Halo Kak ${lastRecordedSale.buyer}, terima kasih telah berbelanja di D Store.\n\n` +
                    `ID Pesanan : ${lastRecordedSale.id}\n` +
                    `Produk     : ${lastRecordedSale.productName} (${lastRecordedSale.variantName})\n` +
                    `Akun       : ${lastRecordedSale.account}\n` +
                    `Masa Aktif : Sampai ${lastRecordedSale.expiryDate}\n\n` +
                    `Klaim garansi wajib menyertakan ID Pesanan ini.`;
                  const chatInfo = getBuyerChatInfo(lastRecordedSale, invoiceText);

                  return (
                    <div className="neo-card p-4 space-y-3 bg-sky-50 border-2 border-black shadow-[4px_4px_0_#000]">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-black uppercase tracking-wider bg-sky-200 px-2.5 py-1 rounded border border-black shadow-[1px_1px_0_#000]">
                            Pesanan Tersimpan: {lastRecordedSale.id}
                          </span>
                          <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded border border-black bg-white shadow-[1px_1px_0_#000]">
                            {chatInfo.platform}: {chatInfo.contactDisplay}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(invoiceText);
                              setCopiedInvoice(true);
                              setTimeout(() => setCopiedInvoice(false), 2000);
                            }}
                            className="neo-btn flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] text-xs font-black"
                          >
                            {copiedInvoice ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedInvoice ? 'Tersalin' : 'Salin'}</span>
                          </button>

                          <a
                            href={chatInfo.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`neo-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] ${
                              chatInfo.type === 'telegram'
                                ? 'bg-sky-300 hover:bg-sky-200'
                                : chatInfo.type === 'instagram'
                                ? 'bg-fuchsia-300 hover:bg-fuchsia-200'
                                : chatInfo.type === 'tiktok'
                                ? 'bg-zinc-200 hover:bg-zinc-300'
                                : 'bg-emerald-400 hover:bg-emerald-300'
                            }`}
                          >
                            {chatInfo.type === 'telegram' ? (
                              <Send className="w-3.5 h-3.5" />
                            ) : chatInfo.type === 'whatsapp' ? (
                              <MessageCircle className="w-3.5 h-3.5" />
                            ) : (
                              <Share2 className="w-3.5 h-3.5" />
                            )}
                            <span>{chatInfo.label}</span>
                          </a>
                        </div>
                      </div>
                      <pre className="text-xs bg-white p-3 rounded-lg text-black font-mono overflow-x-auto whitespace-pre-wrap border-2 border-black shadow-[2px_2px_0_#000]">
{invoiceText}
                      </pre>
                    </div>
                  );
                })()}

                {/* Notifikasi Garansi Terakhir */}
                {lastWarrantyClaim && (() => {
                  const warrantyMsg =
                    `GARANSI AKUN - D STORE\n\n` +
                    `Halo Kak ${lastWarrantyClaim.buyer}, berikut adalah akun pengganti garansi Anda:\n\n` +
                    `ID Pesanan : ${lastWarrantyClaim.saleId}\n` +
                    `Produk     : ${lastWarrantyClaim.productName} (${lastWarrantyClaim.variantName})\n` +
                    `Akun Baru  : ${lastWarrantyClaim.newAccount}\n` +
                    `Kendala    : ${lastWarrantyClaim.issue}\n\n` +
                    `Silakan dicoba login kembali. Jika masih ada kendala, silakan balas chat ini.`;
                  const chatInfo = getBuyerChatInfo(lastWarrantyClaim, warrantyMsg);

                  return (
                    <div className="neo-card p-4 space-y-3 bg-emerald-50 border-2 border-black shadow-[4px_4px_0_#000]">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-black text-black flex items-center gap-1.5 uppercase tracking-wide">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Garansi Berhasil Diproses: {lastWarrantyClaim.id}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(warrantyMsg);
                              setCopiedWarrantyText(true);
                              setTimeout(() => setCopiedWarrantyText(false), 2000);
                            }}
                            className="neo-btn flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] text-xs font-black"
                          >
                            {copiedWarrantyText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedWarrantyText ? 'Tersalin' : 'Salin'}</span>
                          </button>

                          <a
                            href={chatInfo.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`neo-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] ${
                              chatInfo.type === 'telegram'
                                ? 'bg-sky-300 hover:bg-sky-200'
                                : chatInfo.type === 'instagram'
                                ? 'bg-fuchsia-300 hover:bg-fuchsia-200'
                                : 'bg-emerald-400 hover:bg-emerald-300'
                            }`}
                          >
                            {chatInfo.type === 'telegram' ? (
                              <Send className="w-3.5 h-3.5" />
                            ) : chatInfo.type === 'whatsapp' ? (
                              <MessageCircle className="w-3.5 h-3.5" />
                            ) : (
                              <Share2 className="w-3.5 h-3.5" />
                            )}
                            <span>Kirim Akun Baru ({chatInfo.platform})</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Tabel Riwayat Penjualan */}
                <div className="neo-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-xs sm:text-sm text-black uppercase tracking-wide">Riwayat Transaksi Penjualan</h3>
                    <span className="text-xs text-black font-black bg-[#FFE600] px-2 py-0.5 rounded border border-black shadow-[1px_1px_0_#000]">{sales.length} Pesanan</span>
                  </div>

                  <div className="overflow-x-auto no-scrollbar border-2 border-black rounded-lg">
                    <table className="w-full text-left text-xs min-w-[500px]">
                      <thead className="bg-[#FFE600] border-b-2 border-black text-black font-black uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3">Tanggal</th>
                          <th className="py-2.5 px-3">Produk</th>
                          <th className="py-2.5 px-3">Pembeli</th>
                          <th className="py-2.5 px-3">Harga</th>
                          <th className="py-2.5 px-3">Laba</th>
                          <th className="py-2.5 px-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-zinc-200 text-black bg-white">
                        {sales.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-zinc-500 font-bold uppercase text-xs">
                              Belum ada riwayat transaksi tercatat.
                            </td>
                          </tr>
                        ) : (
                          sales.slice(0, 10).map(s => {
                            const profit = (s.sellingPrice || 0) - (s.costPrice || 0);
                            return (
                              <tr key={s.id} className="hover:bg-yellow-50/70 transition">
                                <td className="py-2.5 px-3 text-zinc-600 whitespace-nowrap font-bold">{s.date}</td>
                                <td className="py-2.5 px-3 font-black">
                                  <div className="truncate max-w-[140px] sm:max-w-none text-black">{s.productName} ({s.variantName})</div>
                                  <div className="text-[10px] text-zinc-500 font-mono font-normal">{s.id}</div>
                                </td>
                                <td className="py-2.5 px-3 text-black">
                                  <div className="truncate max-w-[100px] sm:max-w-none font-bold">{s.buyer || '-'}</div>
                                  {(() => {
                                    const chatInfo = getBuyerChatInfo(s);
                                    if (!s.buyerContact && !s.buyerPhone) return null;
                                    return (
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase border border-black ${
                                          chatInfo.type === 'telegram'
                                            ? 'bg-sky-200 text-sky-950'
                                            : chatInfo.type === 'instagram'
                                            ? 'bg-pink-200 text-pink-950'
                                            : chatInfo.type === 'tiktok'
                                            ? 'bg-zinc-200 text-zinc-950'
                                            : 'bg-emerald-200 text-emerald-950'
                                        }`}>
                                          {chatInfo.platform}
                                        </span>
                                        <span className="text-[10px] text-zinc-700 font-bold truncate max-w-[90px]">{chatInfo.contactDisplay}</span>
                                      </div>
                                    );
                                  })()}
                                </td>
                                <td className="py-2.5 px-3 whitespace-nowrap font-black">{formatRupiah(s.sellingPrice)}</td>
                                <td className="py-2.5 px-3 text-emerald-700 font-black whitespace-nowrap">+{formatRupiah(profit)}</td>
                                <td className="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
                                  {/* Tombol Direct Chat Pembeli */}
                                  {(() => {
                                    const chatMsg = 
                                      `PESANAN - D STORE\n\n` +
                                      `Halo Kak ${s.buyer}, terima kasih telah berbelanja di D Store.\n\n` +
                                      `ID Pesanan : ${s.id}\n` +
                                      `Produk     : ${s.productName} (${s.variantName})\n` +
                                      `Akun       : ${s.account}\n` +
                                      `Masa Aktif : Sampai ${s.expiryDate}`;
                                    const chatInfo = getBuyerChatInfo(s, chatMsg);
                                    return (
                                      <a
                                        href={chatInfo.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`neo-btn inline-flex items-center p-1.5 rounded-lg text-black border-2 border-black shadow-[1px_1px_0_#000] ${
                                          chatInfo.type === 'telegram'
                                            ? 'bg-sky-300 hover:bg-sky-400'
                                            : chatInfo.type === 'instagram'
                                            ? 'bg-fuchsia-300 hover:bg-fuchsia-400'
                                            : 'bg-emerald-300 hover:bg-emerald-400'
                                        }`}
                                        title={`Kirim chat via ${chatInfo.platform}`}
                                      >
                                        {chatInfo.type === 'telegram' ? (
                                          <Send className="w-3.5 h-3.5" />
                                        ) : chatInfo.type === 'whatsapp' ? (
                                          <MessageCircle className="w-3.5 h-3.5" />
                                        ) : (
                                          <Share2 className="w-3.5 h-3.5" />
                                        )}
                                      </a>
                                    );
                                  })()}

                                  {/* Tombol Klaim Garansi */}
                                  <button
                                    onClick={() => handleOpenWarrantyModal(s)}
                                    className="neo-btn inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FFE600] hover:bg-yellow-300 text-black border-2 border-black text-[11px] font-black shadow-[1px_1px_0_#000]"
                                    title="Ganti akun garansi"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Garansi</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tabel Riwayat Klaim Garansi */}
                {warranties.length > 0 && (
                  <div className="neo-card p-3.5 sm:p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-xs sm:text-sm text-black flex items-center gap-1.5 uppercase tracking-wide">
                        <RotateCcw className="w-4 h-4 text-black" />
                        Riwayat Klaim Garansi ({warranties.length})
                      </h3>
                    </div>

                    <div className="overflow-x-auto max-h-48 no-scrollbar border-2 border-black rounded-lg">
                      <table className="w-full text-left text-xs min-w-[500px]">
                        <thead className="border-b-2 border-black bg-[#FFE600] text-black font-black uppercase tracking-wider text-[11px] sticky top-0">
                          <tr>
                            <th className="py-2.5 px-3">Tanggal</th>
                            <th className="py-2.5 px-3">Pesanan &amp; Pembeli</th>
                            <th className="py-2.5 px-3">Kendala</th>
                            <th className="py-2.5 px-3">Akun Baru</th>
                            <th className="py-2.5 px-3">Supplier</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-zinc-200 text-black bg-white">
                          {warranties.map(w => (
                            <tr key={w.id} className="hover:bg-yellow-50/70 transition">
                              <td className="py-2 px-3 text-zinc-600 font-bold">{w.date}</td>
                              <td className="py-2 px-3 font-bold">
                                <div>{w.productName}</div>
                                <div className="text-[10px] text-zinc-500 font-normal">{w.buyer} ({w.saleId})</div>
                              </td>
                              <td className="py-2 px-3 text-rose-700 text-[11px] font-black">{w.issue}</td>
                              <td className="py-2 px-3 font-mono text-[11px] max-w-[150px] truncate" title={w.newAccount}>
                                {w.newAccount}
                              </td>
                              <td className="py-2 px-3 text-zinc-700 text-[11px] font-black">{w.supplier}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    )}

        {/* ==================================================================== */}
        {/* TAB 5: PANTAU EXPIRED (DENGAN DIRECT CHAT WHATSAPP)                 */}
        {/* ==================================================================== */}
        {activeTab === 'expiry' && (
          <div className="space-y-4">
            <div className="neo-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-black text-sm sm:text-base text-black flex items-center gap-2 uppercase tracking-wide">
                  <span className="w-8 h-8 rounded-lg bg-[#FFE600] text-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#000]">
                    <Clock className="w-4 h-4" />
                  </span>
                  Pemantauan Masa Aktif Akun
                </h2>
                <p className="text-xs text-zinc-600 mt-1 font-medium">
                  Daftar akun pembeli yang mendekati masa tenggang. Bos dapat langsung mengirim tawaran perpanjangan via WhatsApp dengan 1 klik.
                </p>
              </div>
              <div className="text-xs font-black px-3 py-1.5 rounded-lg bg-[#FFE600] border-2 border-black shadow-[2px_2px_0_#000] text-black self-start sm:self-auto uppercase tracking-wider">
                Masa Tenggang: &le; 7 Hari
              </div>
            </div>

            <div className="space-y-3">
              {sales.filter(s => s.daysRemaining <= 7).length === 0 ? (
                <div className="py-14 text-center text-zinc-500 neo-card border-dashed text-xs font-bold uppercase tracking-wider">
                  Semua akun masih aktif aman (&gt; 7 hari).
                </div>
              ) : (
                sales.filter(s => s.daysRemaining <= 7).map(s => {
                  const isCritical = s.daysRemaining <= 3;
                  const isExpired = s.daysRemaining < 0;
                  const followUpMsg = 
                    `Halo Kak ${s.buyer}, akun ${s.productName} Kakak tersisa ${s.daysRemaining} hari lagi (sampai ${s.expiryDate}).\n\n` +
                    `Mau langsung diperpanjang agar tidak terputus? Silakan balas pesan ini untuk memperpanjang langganan ya Kak. Terima kasih!`;

                  return (
                    <div 
                      key={s.id} 
                      className={`neo-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-transform ${
                        isExpired 
                          ? 'border-2 border-rose-600 bg-rose-50 shadow-[4px_4px_0_#000]' 
                          : (isCritical ? 'border-2 border-black bg-amber-50 shadow-[4px_4px_0_#000]' : 'shadow-[4px_4px_0_#000]')
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-black text-xs sm:text-sm text-black tracking-wide">{s.productName} ({s.variantName})</span>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border-2 border-black uppercase tracking-wider whitespace-nowrap shadow-[2px_2px_0_#000] ${
                            isExpired 
                              ? 'bg-rose-400 text-black' 
                              : (isCritical ? 'bg-[#FFE600] text-black' : 'bg-white text-black')
                          }`}>
                            {isExpired ? 'Sudah Expired' : `${s.daysRemaining} Hari Lagi`}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-700 mt-2 break-all sm:break-normal flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span>Pembeli: <strong className="text-black font-black">{s.buyer || '-'}</strong></span>
                          <span className="text-zinc-400">|</span>
                          <span>Akun: <code className="font-mono text-xs bg-yellow-100 px-2 py-0.5 rounded border border-black text-black font-bold inline-block max-w-full sm:max-w-md truncate align-bottom" title={s.account}>{s.account}</code></span>
                        </div>
                      </div>

                      {(() => {
                        const chatInfo = getBuyerChatInfo(s, followUpMsg);
                        return (
                          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(followUpMsg);
                                showToast('Teks tawaran perpanjang berhasil disalin!', 'success');
                              }}
                              className="neo-btn px-3 py-1.5 rounded-lg bg-white hover:bg-yellow-50 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000]"
                            >
                              Salin Teks
                            </button>

                            <a
                              href={chatInfo.url}
                              target="_blank"
                              rel="noreferrer"
                              className={`neo-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-black text-xs font-black border-2 border-black shadow-[3px_3px_0_#000] ${
                                chatInfo.type === 'telegram'
                                  ? 'bg-sky-300 hover:bg-sky-200'
                                  : chatInfo.type === 'instagram'
                                  ? 'bg-fuchsia-300 hover:bg-fuchsia-200'
                                  : 'bg-emerald-400 hover:bg-emerald-300'
                              }`}
                            >
                              {chatInfo.type === 'telegram' ? (
                                <Send className="w-4 h-4" />
                              ) : chatInfo.type === 'whatsapp' ? (
                                <MessageCircle className="w-4 h-4" />
                              ) : (
                                <Share2 className="w-4 h-4" />
                              )}
                              <span>Chat ({chatInfo.platform})</span>
                            </a>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 6: SEDOT / SCRAPER DATA SUPPLIER (BOT TELEGRAM & AI PARSER)        */}
        {/* ==================================================================== */}
        {activeTab === 'scraper' && (
          <div className="space-y-4">
            <div className="neo-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-black text-black flex items-center gap-2 uppercase tracking-wide">
                  <span className="w-8 h-8 rounded-lg bg-[#FFE600] text-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#000]">
                    <Zap className="w-4 h-4" />
                  </span>
                  Sedot Data &amp; Scraper Supplier
                </h2>
                <p className="text-xs text-zinc-600 mt-1 font-medium">
                  Tarik harga modal langsung dari bot supplier Telegram atau ekstrak teks broadcast pricelist secara instan.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black px-3 py-1.5 rounded-lg bg-sky-200 text-black border-2 border-black shadow-[2px_2px_0_#000] flex items-center gap-1.5 uppercase tracking-wider">
                  <Bot className="w-4 h-4" />
                  UserBot Aktif
                </span>
              </div>
            </div>

            {scraperFeedback && (
              <div className="p-3.5 rounded-xl bg-yellow-50 border-2 border-black shadow-[3px_3px_0_#000] text-xs text-black flex items-center justify-between font-bold">
                <span>{scraperFeedback}</span>
                <button 
                  onClick={() => setScraperFeedback('')} 
                  className="neo-btn text-xs px-2.5 py-1 rounded bg-white text-black font-black border border-black"
                >
                  Tutup
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* KOLOM 1: SCRAPER BOT TELEGRAM */}
              <div className="neo-card p-4 sm:p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black">
                    <div className="w-8 h-8 rounded-lg bg-sky-300 border-2 border-black shadow-[2px_2px_0_#000] flex items-center justify-center text-black font-black">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-xs sm:text-sm text-black uppercase tracking-wide">Scraper Bot Telegram</h3>
                      <p className="text-[11px] text-zinc-600 font-bold">Sedot otomatis katalog dari bot supplier</p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-zinc-800 font-black uppercase tracking-wider">
                          Username Bot Supplier
                        </label>
                        <span className="text-[10px] font-bold text-zinc-500">
                          Ketik atau pilih preset
                        </span>
                      </div>

                      <div className="flex rounded-xl border-2 border-black shadow-[2px_2px_0_#000] overflow-hidden bg-white">
                        <div className="px-3 py-2 bg-yellow-300 border-r-2 border-black text-black font-mono font-black text-xs select-none flex items-center shrink-0">
                          @
                        </div>
                        <input
                          type="text"
                          value={scraperTargetBot}
                          onChange={(e) => setScraperTargetBot(e.target.value.replace(/^@/, ''))}
                          placeholder="heavenprem_bot / Ziem7_bot"
                          className="flex-1 px-3 py-2 text-xs text-black font-mono font-bold bg-transparent outline-none focus:bg-yellow-50 transition"
                        />
                      </div>

                      {/* Preset Bot Supplier Populer */}
                      <div className="pt-1">
                        <div className="text-[10px] font-black uppercase text-zinc-600 mb-1.5 flex items-center justify-between">
                          <span>Pilihan Bot Populer:</span>
                          <span className="text-[9px] font-bold text-zinc-400">Klik untuk langsung pilih</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'heavenprem_bot',
                            'Ziem7_bot',
                            'buatprem_bot',
                            'bagahstorebot',
                            'prabumailbot',
                            'YSAutoOrderBot'
                          ].map((bot) => (
                            <button
                              key={bot}
                              type="button"
                              onClick={() => setScraperTargetBot(bot)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black border-2 border-black shadow-[1.5px_1.5px_0_#000] transition whitespace-nowrap cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                                scraperTargetBot.toLowerCase() === bot.toLowerCase()
                                  ? 'bg-[#FFE600] text-black ring-1 ring-black'
                                  : 'bg-white text-zinc-800 hover:bg-yellow-50'
                              }`}
                              title={`@${bot}`}
                            >
                              @{bot}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Jumlah Produk Disedot</label>
                      <div className="grid grid-cols-3 gap-2 mt-1.5">
                        {[
                          { val: 10, label: 'Cepat (10)' },
                          { val: 25, label: 'Sedang (25)' },
                          { val: 75, label: 'Semua (75)' }
                        ].map(opt => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setScraperLimit(opt.val)}
                            className={`py-2 rounded-lg text-xs font-black border-2 border-black transition shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                              scraperLimit === opt.val
                                ? 'bg-[#FFE600] text-black'
                                : 'bg-white text-black hover:bg-yellow-50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50 border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black space-y-1">
                      <p className="text-black font-black flex items-center gap-1.5 uppercase tracking-wide">
                        <ShieldAlert className="w-4 h-4 text-emerald-600" />
                        Proteksi Data Toko Kustom
                      </p>
                      <p className="text-[11px] leading-relaxed font-medium text-zinc-700">
                        Varian yang dialihkan ke supplier lain tidak akan tertimpa. Hanya harga modal bot supplier yang diperbarui.
                      </p>
                    </div>

                    <button
                      onClick={handleTelegramBotScrape}
                      disabled={telegramScraping}
                      className="neo-btn w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FFE600] hover:bg-[#ffea33] text-black text-xs font-black border-2 border-black shadow-[4px_4px_0_#000] disabled:opacity-50 uppercase tracking-wide"
                    >
                      {telegramScraping ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-black" />
                          <span>Menyedot data dari Telegram...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Mulai Sedot dari Bot</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Terminal Log Live Monitor */}
                  {telegramScrapeLogs.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs text-zinc-600">
                        <span className="flex items-center gap-1.5 font-black uppercase tracking-wider text-[10px] text-black">
                          <Terminal className="w-3.5 h-3.5 text-black" />
                          Log Real-Time
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button 
                            type="button"
                            onClick={handleResetScraperLock}
                            className="neo-btn text-[11px] px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-black border border-black font-bold"
                            title="Reset kunci jika proses scraper tertahan"
                          >
                            Reset Kunci
                          </button>
                          <button 
                            type="button"
                            onClick={() => setTelegramScrapeLogs([])}
                            className="neo-btn text-[11px] px-2 py-0.5 rounded bg-white hover:bg-zinc-100 text-black border border-black font-bold"
                          >
                            Bersihkan
                          </button>
                        </div>
                      </div>
                      <div className="p-3.5 bg-black border-2 border-black shadow-[4px_4px_0_#000] rounded-xl max-h-44 overflow-y-auto font-mono text-[11px] text-[#00E599] space-y-1 no-scrollbar leading-relaxed">
                        {telegramScrapeLogs.map((log, idx) => (
                          <div key={idx}>{log}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* KOLOM 2: AI SMART PRICELIST SCAPER */}
              <div className="neo-card p-4 sm:p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black">
                    <div className="w-8 h-8 rounded-lg bg-emerald-300 border-2 border-black shadow-[2px_2px_0_#000] flex items-center justify-center text-black font-black">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-xs sm:text-sm text-black uppercase tracking-wide">Ekstraksi Teks Daftar Harga</h3>
                      <p className="text-[11px] text-zinc-600 font-bold">Bedah teks / chat broadcast supplier</p>
                    </div>
                  </div>

                  <form onSubmit={handleParseSupplierText} className="space-y-3.5">
                    <div>
                      <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Nama Supplier / Toko Asal</label>
                      <input
                        type="text"
                        value={textSupplierName}
                        onChange={(e) => setTextSupplierName(e.target.value)}
                        placeholder="Toko A, Toko B, Langganan"
                        required
                        className="w-full mt-1.5 px-3 py-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-bold focus:outline-none focus:bg-yellow-50 transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Tempel Daftar Harga</label>
                      <textarea
                        rows={5}
                        value={rawPricelistText}
                        onChange={(e) => setRawPricelistText(e.target.value)}
                        placeholder={`Canva pro 1 bulan modal 1.5k jual 4.5k\nNetflix 1 bulan sharing modal 20rb jual 25rb\nChatGPT Plus 1 bulan 28k modal 20k`}
                        className="w-full mt-1.5 p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black placeholder-zinc-400 focus:outline-none focus:bg-yellow-50 font-mono leading-relaxed transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={textParsingLoading || !rawPricelistText.trim()}
                      className="neo-btn w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-200 hover:bg-sky-300 text-black text-xs font-black border-2 border-black shadow-[3px_3px_0_#000] disabled:opacity-50 uppercase tracking-wide"
                    >
                      {textParsingLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Menganalisis teks...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Ekstrak Produk dengan AI</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Tabel Hasil Preview Parsing AI */}
                  {parsedItems.length > 0 && (
                    <div className="space-y-3 pt-3 border-t-2 border-black">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-black uppercase tracking-wider">Hasil Ekstraksi ({parsedItems.length} Produk)</span>
                        <button
                          onClick={() => setParsedItems([])}
                          className="neo-btn text-[11px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-black font-black"
                        >
                          Batal
                        </button>
                      </div>

                      <div className="border-2 border-black rounded-xl overflow-x-auto max-h-44 shadow-[3px_3px_0_#000] bg-white no-scrollbar">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#FFE600] text-black font-black uppercase tracking-wider sticky top-0 border-b-2 border-black">
                            <tr>
                              <th className="p-2.5">Produk</th>
                              <th className="p-2.5">Modal</th>
                              <th className="p-2.5">Jual</th>
                              <th className="p-2.5">Toko</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y-2 divide-zinc-200 text-black">
                            {parsedItems.map((item, idx) => (
                              <tr key={idx} className="hover:bg-yellow-50/70">
                                <td className="p-2.5 font-bold">
                                  <div className="text-black font-black">{item.productName}</div>
                                  <div className="text-[10px] text-zinc-600 font-medium">{item.variantName}</div>
                                </td>
                                <td className="p-2.5 text-rose-700 font-mono font-black">Rp{Number(item.costPrice).toLocaleString('id-ID')}</td>
                                <td className="p-2.5 text-emerald-700 font-mono font-black">Rp{Number(item.sellingPrice).toLocaleString('id-ID')}</td>
                                <td className="p-2.5 text-blue-700 font-mono font-black">{item.supplier}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <button
                        onClick={handleImportParsedItems}
                        disabled={importingLoading}
                        className="neo-btn w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black border-2 border-black shadow-[3px_3px_0_#000] disabled:opacity-50 uppercase tracking-wide"
                      >
                        {importingLoading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Menyimpan ke Spreadsheet...</span>
                          </>
                        ) : (
                          <>
                            <DownloadCloud className="w-3.5 h-3.5" />
                            <span>Impor {parsedItems.length} Produk ke Katalog</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* ==================================================================== */}
            {/* HASIL ANALISIS SEDOTAN & STATUS STOK SUPPLIER (BARU, HABIS, BERUBAH) */}
            {/* ==================================================================== */}
            <div className="neo-card p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black">
                <div>
                  <h3 className="font-black text-sm sm:text-base text-black uppercase tracking-wide flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Hasil Analisis &amp; Status Stok Terakhir
                  </h3>
                  <p className="text-xs text-zinc-600 font-medium mt-0.5">
                    {scrapeSummary 
                      ? `Laporan sedotan terakhir pada pukul ${scrapeSummary.timestamp || '-'} dari @${scraperTargetBot}`
                      : 'Data ringkasan stok supplier dari database katalog aktif.'}
                  </p>
                </div>

                {scrapeSummary?.sheetSync && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border-2 border-black text-xs font-black bg-emerald-200 text-emerald-950 shadow-[2px_2px_0_#000]">
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Spreadsheet: {scrapeSummary.sheetSync.status}</span>
                  </div>
                )}
              </div>

              {/* 4 Kartu Metrik Ringkasan */}
              {(() => {
                const outOfStockCount = scrapeSummary?.diff?.outOfStock?.length ?? variants.filter(v => !v.isAvailable).length;
                const newProdCount = scrapeSummary?.diff?.newProducts?.length ?? 0;
                const newVarCount = scrapeSummary?.diff?.newVariants?.length ?? 0;
                const priceChangesCount = scrapeSummary?.diff?.priceChanges?.length ?? 0;
                const totalReady = scrapeSummary?.diff?.readyCount ?? variants.filter(v => v.isAvailable).length;

                return (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Kartu 1: Stok Habis / Kosong */}
                    <div 
                      onClick={() => setScrapeDetailTab('outOfStock')}
                      className={`p-3.5 rounded-xl border-2 border-black cursor-pointer transition active:scale-95 ${
                        scrapeDetailTab === 'outOfStock' 
                          ? 'bg-rose-200 shadow-[4px_4px_0_#000]' 
                          : 'bg-rose-50 hover:bg-rose-100 shadow-[2px_2px_0_#000]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-950">Stok Habis / Kosong</span>
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-rose-950 mt-1">
                        {outOfStockCount} <span className="text-xs font-bold text-rose-800">Varian</span>
                      </div>
                      <p className="text-[10px] font-bold text-rose-800 mt-0.5">Klik untuk lihat daftar</p>
                    </div>

                    {/* Kartu 2: Produk & Varian Baru */}
                    <div 
                      onClick={() => setScrapeDetailTab('newItems')}
                      className={`p-3.5 rounded-xl border-2 border-black cursor-pointer transition active:scale-95 ${
                        scrapeDetailTab === 'newItems' 
                          ? 'bg-emerald-200 shadow-[4px_4px_0_#000]' 
                          : 'bg-emerald-50 hover:bg-emerald-100 shadow-[2px_2px_0_#000]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-950">Produk Baru</span>
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-emerald-950 mt-1">
                        {newProdCount} <span className="text-xs font-bold text-emerald-800">Item ({newVarCount} Varian)</span>
                      </div>
                      <p className="text-[10px] font-bold text-emerald-800 mt-0.5">Klik untuk lihat daftar</p>
                    </div>

                    {/* Kartu 3: Perubahan Harga Modal */}
                    <div 
                      onClick={() => setScrapeDetailTab('priceChanges')}
                      className={`p-3.5 rounded-xl border-2 border-black cursor-pointer transition active:scale-95 ${
                        scrapeDetailTab === 'priceChanges' 
                          ? 'bg-yellow-200 shadow-[4px_4px_0_#000]' 
                          : 'bg-yellow-50 hover:bg-yellow-100 shadow-[2px_2px_0_#000]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-950">Perubahan Modal</span>
                        <TrendingUp className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-amber-950 mt-1">
                        {priceChangesCount} <span className="text-xs font-bold text-amber-800">Varian</span>
                      </div>
                      <p className="text-[10px] font-bold text-amber-800 mt-0.5">Klik untuk lihat selisih</p>
                    </div>

                    {/* Kartu 4: Stok Ready / Aman */}
                    <div 
                      onClick={() => setScrapeDetailTab('logs')}
                      className={`p-3.5 rounded-xl border-2 border-black cursor-pointer transition active:scale-95 ${
                        scrapeDetailTab === 'logs' 
                          ? 'bg-sky-200 shadow-[4px_4px_0_#000]' 
                          : 'bg-sky-50 hover:bg-sky-100 shadow-[2px_2px_0_#000]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-sky-950">Stok Ready &amp; Log</span>
                        <CheckCheck className="w-4 h-4 text-sky-600" />
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-sky-950 mt-1">
                        {totalReady} <span className="text-xs font-bold text-sky-800">Varian Ready</span>
                      </div>
                      <p className="text-[10px] font-bold text-sky-800 mt-0.5">Lihat terminal log scraper</p>
                    </div>
                  </div>
                );
              })()}

              {/* Segmented Tab Headers */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-b-2 border-black pb-2">
                <button
                  onClick={() => setScrapeDetailTab('outOfStock')}
                  className={`neo-btn px-3 py-1.5 rounded-lg text-xs font-black border-2 border-black flex items-center gap-1.5 transition ${
                    scrapeDetailTab === 'outOfStock' 
                      ? 'bg-rose-400 text-black shadow-[2px_2px_0_#000]' 
                      : 'bg-white text-black hover:bg-zinc-100 shadow-[1px_1px_0_#000]'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-900" />
                  <span>Stok Habis / Kosong ({(scrapeSummary?.diff?.outOfStock?.length ?? variants.filter(v => !v.isAvailable).length)})</span>
                </button>

                <button
                  onClick={() => setScrapeDetailTab('newItems')}
                  className={`neo-btn px-3 py-1.5 rounded-lg text-xs font-black border-2 border-black flex items-center gap-1.5 transition ${
                    scrapeDetailTab === 'newItems' 
                      ? 'bg-emerald-300 text-black shadow-[2px_2px_0_#000]' 
                      : 'bg-white text-black hover:bg-zinc-100 shadow-[1px_1px_0_#000]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-900" />
                  <span>Produk &amp; Varian Baru ({(scrapeSummary?.diff?.newProducts?.length ?? 0) + (scrapeSummary?.diff?.newVariants?.length ?? 0)})</span>
                </button>

                <button
                  onClick={() => setScrapeDetailTab('priceChanges')}
                  className={`neo-btn px-3 py-1.5 rounded-lg text-xs font-black border-2 border-black flex items-center gap-1.5 transition ${
                    scrapeDetailTab === 'priceChanges' 
                      ? 'bg-yellow-300 text-black shadow-[2px_2px_0_#000]' 
                      : 'bg-white text-black hover:bg-zinc-100 shadow-[1px_1px_0_#000]'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-amber-900" />
                  <span>Perubahan Harga Modal ({(scrapeSummary?.diff?.priceChanges?.length ?? 0)})</span>
                </button>

                <button
                  onClick={() => setScrapeDetailTab('logs')}
                  className={`neo-btn px-3 py-1.5 rounded-lg text-xs font-black border-2 border-black flex items-center gap-1.5 transition ${
                    scrapeDetailTab === 'logs' 
                      ? 'bg-black text-[#FFE600] shadow-[2px_2px_0_#000]' 
                      : 'bg-white text-black hover:bg-zinc-100 shadow-[1px_1px_0_#000]'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Log Terminal ({telegramScrapeLogs.length})</span>
                </button>
              </div>

              {/* Konten Tab Detail */}
              <div className="pt-1">
                {/* TAB 1: DAFTAR STOK HABIS / KOSONG */}
                {scrapeDetailTab === 'outOfStock' && (() => {
                  const outItems = scrapeSummary?.diff?.outOfStock || variants.filter(v => !v.isAvailable).map(v => {
                    const p = products.find(prod => prod.id === v.productId);
                    return {
                      id: v.id,
                      productName: p ? p.name : 'Produk',
                      variantName: v.name,
                      costPrice: v.costPrice,
                      price: v.price,
                      stock: 0
                    };
                  });

                  if (outItems.length === 0) {
                    return (
                      <div className="p-8 text-center bg-emerald-50 rounded-xl border-2 border-black text-xs font-black text-emerald-950 uppercase tracking-wide">
                        Semua varian supplier sedang READY! Tidak ada stok kosong.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="p-3 bg-rose-100 border-2 border-black rounded-lg text-xs font-bold text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span>Peringatan: Varian di bawah ini berstatus <strong>KOSONG / HABIS</strong> di bot supplier @{scraperTargetBot}. Matikan penjualan atau cari supplier cadangan di Matrix Kulakan.</span>
                        <button
                          onClick={() => handleTabChange('matrix')}
                          className="neo-btn text-[11px] font-black px-2.5 py-1 rounded bg-[#FFE600] text-black border border-black uppercase whitespace-nowrap self-start sm:self-auto"
                        >
                          Buka Matrix Kulakan
                        </button>
                      </div>

                      <div className="overflow-x-auto no-scrollbar border-2 border-black rounded-xl">
                        <table className="w-full text-left text-xs min-w-[500px]">
                          <thead className="bg-rose-200 border-b-2 border-black text-rose-950 font-black uppercase text-[11px]">
                            <tr>
                              <th className="p-2.5">Produk</th>
                              <th className="p-2.5">Varian</th>
                              <th className="p-2.5">Harga Modal</th>
                              <th className="p-2.5">Harga Jual</th>
                              <th className="p-2.5 text-center">Status Supplier</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y-2 divide-zinc-200 bg-white">
                            {outItems.map((item, idx) => (
                              <tr key={idx} className="hover:bg-rose-50/50">
                                <td className="p-2.5 font-black text-black">{item.productName}</td>
                                <td className="p-2.5 font-bold text-zinc-700">{item.variantName}</td>
                                <td className="p-2.5 font-mono font-bold text-zinc-600">{formatRupiah(item.costPrice)}</td>
                                <td className="p-2.5 font-mono font-black text-black">{formatRupiah(item.price)}</td>
                                <td className="p-2.5 text-center">
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-200 text-rose-950 border border-black uppercase">
                                    KOSONG / HABIS
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}

                {/* TAB 2: PRODUK & VARIAN BARU */}
                {scrapeDetailTab === 'newItems' && (() => {
                  const newProds = scrapeSummary?.diff?.newProducts || [];
                  const newVars = scrapeSummary?.diff?.newVariants || [];

                  if (newProds.length === 0 && newVars.length === 0) {
                    return (
                      <div className="p-8 text-center bg-zinc-50 rounded-xl border-2 border-black text-xs font-bold text-zinc-500 uppercase">
                        Tidak ada produk atau varian baru yang terdeteksi pada sedotan ini.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {newProds.length > 0 && (
                        <div>
                          <h4 className="text-xs font-black text-black uppercase tracking-wider mb-2">Produk Baru Ditambahkan ({newProds.length}):</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {newProds.map((p, idx) => (
                              <div key={idx} className="p-3 bg-emerald-50 rounded-lg border-2 border-black shadow-[2px_2px_0_#000] text-xs">
                                <div className="font-black text-black">{p.name}</div>
                                <div className="text-[10px] text-zinc-600 font-bold mt-0.5">Kategori: {p.category}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {newVars.length > 0 && (
                        <div>
                          <h4 className="text-xs font-black text-black uppercase tracking-wider mb-2">Varian Baru Ditemukan ({newVars.length}):</h4>
                          <div className="overflow-x-auto no-scrollbar border-2 border-black rounded-xl">
                            <table className="w-full text-left text-xs min-w-[500px]">
                              <thead className="bg-emerald-200 border-b-2 border-black text-emerald-950 font-black uppercase text-[11px]">
                                <tr>
                                  <th className="p-2.5">Produk</th>
                                  <th className="p-2.5">Varian Baru</th>
                                  <th className="p-2.5">Modal Supplier</th>
                                  <th className="p-2.5">Harga Rekomendasi</th>
                                  <th className="p-2.5 text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y-2 divide-zinc-200 bg-white">
                                {newVars.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-emerald-50/50">
                                    <td className="p-2.5 font-black text-black">{item.productName}</td>
                                    <td className="p-2.5 font-bold text-zinc-700">{item.variantName}</td>
                                    <td className="p-2.5 font-mono font-bold text-zinc-600">{formatRupiah(item.costPrice)}</td>
                                    <td className="p-2.5 font-mono font-black text-emerald-700">{formatRupiah(item.price)}</td>
                                    <td className="p-2.5 text-center">
                                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border border-black uppercase ${
                                        item.isAvailable ? 'bg-emerald-200 text-emerald-950' : 'bg-rose-200 text-rose-950'
                                      }`}>
                                        {item.isAvailable ? 'Ready' : 'Kosong'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* TAB 3: PERUBAHAN HARGA MODAL */}
                {scrapeDetailTab === 'priceChanges' && (() => {
                  const changes = scrapeSummary?.diff?.priceChanges || [];

                  if (changes.length === 0) {
                    return (
                      <div className="p-8 text-center bg-zinc-50 rounded-xl border-2 border-black text-xs font-bold text-zinc-500 uppercase">
                        Tidak ada perubahan harga modal pada sedotan ini. Semua harga modal masih sama.
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto no-scrollbar border-2 border-black rounded-xl">
                      <table className="w-full text-left text-xs min-w-[500px]">
                        <thead className="bg-yellow-200 border-b-2 border-black text-amber-950 font-black uppercase text-[11px]">
                          <tr>
                            <th className="p-2.5">Produk</th>
                            <th className="p-2.5">Varian</th>
                            <th className="p-2.5">Modal Lama</th>
                            <th className="p-2.5">Modal Baru</th>
                            <th className="p-2.5 text-right">Selisih</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-zinc-200 bg-white">
                          {changes.map((c, idx) => (
                            <tr key={idx} className="hover:bg-yellow-50/50">
                              <td className="p-2.5 font-black text-black">{c.productName}</td>
                              <td className="p-2.5 font-bold text-zinc-700">{c.variantName}</td>
                              <td className="p-2.5 font-mono text-zinc-500 line-through">{formatRupiah(c.oldCost)}</td>
                              <td className="p-2.5 font-mono font-black text-black">{formatRupiah(c.newCost)}</td>
                              <td className={`p-2.5 font-mono font-black text-right ${c.diff > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {c.diff > 0 ? `+${formatRupiah(c.diff)} (Naik)` : `${formatRupiah(c.diff)} (Turun)`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}

                {/* TAB 4: LOG TERMINAL */}
                {scrapeDetailTab === 'logs' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-600">
                      <span className="flex items-center gap-1.5 font-black uppercase tracking-wider text-[10px] text-black">
                        <Terminal className="w-3.5 h-3.5 text-black" />
                        Log Terminal Real-Time (@{scraperTargetBot})
                      </span>
                      <button 
                        onClick={() => setTelegramScrapeLogs([])}
                        className="neo-btn text-[11px] px-2 py-0.5 rounded bg-white text-black border border-black font-bold"
                      >
                        Bersihkan
                      </button>
                    </div>
                    <div className="p-3.5 bg-black border-2 border-black shadow-[4px_4px_0_#000] rounded-xl max-h-72 overflow-y-auto font-mono text-[11px] text-[#00E599] space-y-1 no-scrollbar leading-relaxed">
                      {telegramScrapeLogs.length === 0 ? (
                        <div className="text-zinc-500">Belum ada log aktif. Tekan "Mulai Sedot dari Bot" untuk memantau.</div>
                      ) : (
                        telegramScrapeLogs.map((log, idx) => (
                          <div key={idx}>{log}</div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 7: TOOLS & SPREADSHEET                                           */}
        {/* ==================================================================== */}
        {activeTab === 'sheets_tools' && (
          <div className="space-y-4">
            <div className="neo-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-black text-black flex items-center gap-2 uppercase tracking-wide">
                  <span className="w-8 h-8 rounded-lg bg-emerald-300 text-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#000]">
                    <FileSpreadsheet className="w-4 h-4" />
                  </span>
                  Spreadsheet &amp; Tools Mandiri
                </h2>
                <p className="text-xs text-zinc-600 mt-1 font-medium">
                  Kendali Google Spreadsheet cloud, ekspor Excel, dan pembuat format broadcast promosi.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleOpenSpreadsheet}
                  className="neo-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFE600] hover:bg-[#ffea33] text-black text-xs font-black border-2 border-black shadow-[3px_3px_0_#000] uppercase tracking-wide cursor-pointer"
                  title={sheetUrl ? "Buka Google Spreadsheet di tab baru" : "Atur Link Google Spreadsheet"}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka Spreadsheet</span>
                </button>

                <button
                  onClick={handleDownloadExcel}
                  className="neo-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black border-2 border-black shadow-[3px_3px_0_#000] uppercase tracking-wide"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Excel (.xlsx)</span>
                </button>
              </div>
            </div>

            {toolFeedback && (
              <div className="p-3.5 rounded-xl bg-yellow-50 border-2 border-black shadow-[3px_3px_0_#000] text-xs text-black flex items-center justify-between font-bold">
                <span>{toolFeedback}</span>
                <button 
                  onClick={() => setToolFeedback('')} 
                  className="neo-btn text-xs px-2.5 py-1 rounded bg-white text-black font-black border border-black"
                >
                  Tutup
                </button>
              </div>
            )}

            <input 
              type="file" 
              ref={restoreFileRef} 
              onChange={handleRestoreBackup} 
              accept=".json" 
              className="hidden" 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

              {/* KARTU 1: KONTROL GOOGLE SPREADSHEET CLOUD */}
              <div className="neo-card p-4 sm:p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black">
                    <div className="w-8 h-8 rounded-lg bg-emerald-300 border-2 border-black shadow-[2px_2px_0_#000] flex items-center justify-center text-black font-black">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-xs sm:text-sm text-black uppercase tracking-wide">Google Spreadsheet</h3>
                      <p className="text-[11px] text-emerald-700 font-black">Tersambung Cloud</p>
                    </div>
                  </div>

                  {/* Banner Tautan File Spreadsheet */}
                  <div className="p-3 bg-emerald-50 rounded-xl border-2 border-black shadow-[2px_2px_0_#000] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-800" />
                        Tautan File Spreadsheet
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setTempSheetUrl(sheetUrl || '');
                          setShowSheetUrlModal(true);
                        }}
                        className="text-[10px] font-black text-blue-700 hover:underline cursor-pointer uppercase tracking-wider"
                      >
                        {sheetUrl ? 'Ubah Link' : '+ Atur Link'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-black font-mono text-[11px] text-zinc-700 truncate font-bold select-all">
                        {sheetUrl ? sheetUrl : 'Belum diatur link Google Spreadsheet'}
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenSpreadsheet}
                        className="neo-btn px-3 py-1.5 rounded-lg bg-[#FFE600] hover:bg-yellow-300 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider flex items-center gap-1 shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka</span>
                      </button>
                    </div>
                  </div>

                  {/* Form 1: Buat Sheet / Tab Baru */}
                  <form onSubmit={handleCreateSheet} className="space-y-2">
                    <label className="text-xs font-black text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                      <PlusCircle className="w-3.5 h-3.5 text-black" />
                      Buat Tab / Sheet Baru
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Misal: Garansi, Supplier_Baru"
                        value={newSheetName}
                        onChange={(e) => setNewSheetName(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-mono font-bold focus:outline-none focus:bg-yellow-50 transition"
                      />
                      <button
                        type="submit"
                        disabled={sheetActionLoading || !newSheetName.trim()}
                        className="neo-btn px-3.5 py-2 rounded-xl bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0_#000] text-xs font-black disabled:opacity-50 uppercase"
                      >
                        + Buat
                      </button>
                    </div>
                  </form>

                  {/* Form 2: Tambah Kolom Baru */}
                  <form onSubmit={handleAddColumn} className="space-y-2 pt-3 border-t-2 border-black">
                    <label className="text-xs font-black text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Columns className="w-3.5 h-3.5 text-black" />
                      Tambah Kolom Baru
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Misal: Nomor Rekening, Keterangan"
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-mono font-bold focus:outline-none focus:bg-yellow-50 transition"
                      />
                      <button
                        type="submit"
                        disabled={sheetActionLoading || !newColumnName.trim()}
                        className="neo-btn px-3.5 py-2 rounded-xl bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0_#000] text-xs font-black disabled:opacity-50 uppercase"
                      >
                        + Kolom
                      </button>
                    </div>
                  </form>

                  {/* Sinkronisasi Manual */}
                  <div className="pt-3 border-t-2 border-black space-y-2">
                    <span className="text-[11px] text-zinc-600 font-black uppercase tracking-wider">Sinkronisasi Cloud:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handlePullSheet}
                        disabled={syncing}
                        className="neo-btn flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-yellow-50 text-black border-2 border-black shadow-[2px_2px_0_#000] text-xs font-black disabled:opacity-50"
                      >
                        <DownloadCloud className="w-3.5 h-3.5" />
                        <span>Tarik Sheet</span>
                      </button>
                      <button
                        onClick={handlePushSheet}
                        disabled={syncing}
                        className="neo-btn flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-yellow-50 text-black border-2 border-black shadow-[2px_2px_0_#000] text-xs font-black disabled:opacity-50"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-black" />
                        <span>Push Sheet</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Apps Script Code */}
                <div className="pt-3 border-t-2 border-black">
                  <button
                    onClick={() => setShowAppsScriptCode(!showAppsScriptCode)}
                    className="w-full text-left text-xs font-black text-black hover:text-zinc-700 flex items-center justify-between transition py-1 uppercase tracking-wide"
                  >
                    <span className="flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-black" />
                      {showAppsScriptCode ? 'Tutup Kode Apps Script' : 'Kode Google Apps Script'}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${showAppsScriptCode ? 'rotate-90' : ''}`} />
                  </button>

                  {showAppsScriptCode && (
                    <div className="mt-2.5 space-y-2 text-xs">
                      <pre className="p-3 bg-black border-2 border-black shadow-[3px_3px_0_#000] rounded-xl overflow-x-auto text-[10px] text-[#00E599] font-mono max-h-40 leading-relaxed">
{`function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. SYNC ALL: Tulis seluruh produk, varian, modal & harga jual
    if (data.action === "sync_all") {
      var sheet = ss.getSheetByName("Katalog Produk") || ss.getSheets()[0];
      sheet.clearContents();
      
      var headers = [
        "ID Produk", "Kategori", "Nama Produk", 
        "ID Varian", "Nama Varian / Paket", "Supplier", 
        "Modal (Rp)", "Harga Jual (Rp)", "Status Stok", "Tawaran Toko"
      ];
      var rows = [headers];
      var items = data.items || [];
      
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        rows.push([
          it.productId || "",
          it.category || "",
          it.productName || "",
          it.variantId || "",
          it.variantName || "",
          it.supplier || "",
          Number(it.costPrice) || 0,
          Number(it.sellingPrice) || 0,
          it.isAvailable ? "Ready" : "Kosong",
          it.supplierOffers || ""
        ]);
      }
      
      if (rows.length > 0) {
        sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#FFE600");
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "ok", count: items.length })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. READ ALL: Baca data spreadsheet ke web
    if (data.action === "read_all") {
      var sheet = ss.getSheetByName("Katalog Produk") || ss.getSheets()[0];
      var values = sheet.getDataRange().getValues();
      var items = [];
      if (values.length > 1) {
        for (var i = 1; i < values.length; i++) {
          var r = values[i];
          items.push({
            productId: r[0], category: r[1], productName: r[2],
            variantId: r[3], variantName: r[4], supplier: r[5],
            costPrice: Number(r[6]) || 0, sellingPrice: Number(r[7]) || 0,
            isAvailable: String(r[8]).toLowerCase() === "ready",
            supplierOffers: r[9]
          });
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "ok", items: items })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. CREATE SHEET & ADD COLUMN
    if (data.action === "create_sheet") {
      var s = ss.getSheetByName(data.sheetName);
      if (!s) { s = ss.insertSheet(data.sheetName); if (data.headers) s.appendRow(data.headers); }
      return ContentService.createTextOutput(JSON.stringify({ status: "ok" })).setMimeType(ContentService.MimeType.JSON);
    }
    if (data.action === "add_column") {
      var s = ss.getSheets()[0];
      s.getRange(1, s.getLastColumn() + 1).setValue(data.columnName);
      return ContentService.createTextOutput(JSON.stringify({ status: "ok" })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "ok" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`}
                      </pre>
                      <button
                        onClick={() => {
                          const scriptCode = `function doPost(e) {\n  try {\n    var data = JSON.parse(e.postData.contents);\n    var ss = SpreadsheetApp.getActiveSpreadsheet();\n    if (data.action === "sync_all") {\n      var sheet = ss.getSheetByName("Katalog Produk") || ss.getSheets()[0];\n      sheet.clearContents();\n      var headers = ["ID Produk", "Kategori", "Nama Produk", "ID Varian", "Nama Varian / Paket", "Supplier", "Modal (Rp)", "Harga Jual (Rp)", "Status Stok", "Tawaran Toko"];\n      var rows = [headers];\n      var items = data.items || [];\n      for (var i = 0; i < items.length; i++) {\n        var it = items[i];\n        rows.push([it.productId || "", it.category || "", it.productName || "", it.variantId || "", it.variantName || "", it.supplier || "", Number(it.costPrice) || 0, Number(it.sellingPrice) || 0, it.isAvailable ? "Ready" : "Kosong", it.supplierOffers || ""]);\n      }\n      if (rows.length > 0) {\n        sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);\n        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#FFE600");\n      }\n      return ContentService.createTextOutput(JSON.stringify({ status: "ok", count: items.length })).setMimeType(ContentService.MimeType.JSON);\n    }\n    if (data.action === "read_all") {\n      var sheet = ss.getSheetByName("Katalog Produk") || ss.getSheets()[0];\n      var values = sheet.getDataRange().getValues();\n      var items = [];\n      if (values.length > 1) {\n        for (var i = 1; i < values.length; i++) {\n          var r = values[i];\n          items.push({ productId: r[0], category: r[1], productName: r[2], variantId: r[3], variantName: r[4], supplier: r[5], costPrice: Number(r[6]) || 0, sellingPrice: Number(r[7]) || 0, isAvailable: String(r[8]).toLowerCase() === "ready", supplierOffers: r[9] });\n        }\n      }\n      return ContentService.createTextOutput(JSON.stringify({ status: "ok", items: items })).setMimeType(ContentService.MimeType.JSON);\n    }\n    if (data.action === "create_sheet") {\n      var s = ss.getSheetByName(data.sheetName);\n      if (!s) { s = ss.insertSheet(data.sheetName); if (data.headers) s.appendRow(data.headers); }\n      return ContentService.createTextOutput(JSON.stringify({ status: "ok" })).setMimeType(ContentService.MimeType.JSON);\n    }\n    if (data.action === "add_column") {\n      var s = ss.getSheets()[0];\n      s.getRange(1, s.getLastColumn() + 1).setValue(data.columnName);\n      return ContentService.createTextOutput(JSON.stringify({ status: "ok" })).setMimeType(ContentService.MimeType.JSON);\n    }\n    return ContentService.createTextOutput(JSON.stringify({ status: "ok" })).setMimeType(ContentService.MimeType.JSON);\n  } catch (err) {\n    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);\n  }\n}`;
                          navigator.clipboard.writeText(scriptCode);
                          setToolFeedback('Kode Google Apps Script lengkap (sync_all & read_all) berhasil disalin ke clipboard.');
                        }}
                        className="neo-btn w-full py-2 rounded-xl bg-white hover:bg-yellow-50 text-xs text-black font-black border-2 border-black shadow-[2px_2px_0_#000] transition uppercase tracking-wide"
                      >
                        Salin Seluruh Kode Script
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* KARTU 2: EKSPOR & CADANGAN */}
              <div className="neo-card p-4 sm:p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black">
                    <div className="w-8 h-8 rounded-lg bg-sky-300 border-2 border-black shadow-[2px_2px_0_#000] flex items-center justify-center text-black font-black">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-xs sm:text-sm text-black uppercase tracking-wide">Cadangan &amp; Ekspor</h3>
                      <p className="text-[11px] text-zinc-600 font-bold">Amankan data katalog dan penjualan</p>
                    </div>
                  </div>

                  {/* Unduh Excel */}
                  <div className="p-3.5 rounded-xl bg-[#f4f4f0] border-2 border-black shadow-[2px_2px_0_#000] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-black uppercase tracking-wider">File Excel (.xlsx)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-black border border-black bg-emerald-400 text-black shadow-[1px_1px_0_#000]">2 Sheet</span>
                    </div>
                    <p className="text-xs text-zinc-600 font-medium">
                      Unduh tabel katalog harga dan rekap penjualan dengan rumus laba.
                    </p>
                    <button
                      onClick={handleDownloadExcel}
                      className="neo-btn w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black border-2 border-black shadow-[3px_3px_0_#000] uppercase tracking-wide"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Download Excel</span>
                    </button>
                  </div>

                  {/* Unduh Cadangan JSON */}
                  <div className="p-3.5 rounded-xl bg-[#f4f4f0] border-2 border-black shadow-[2px_2px_0_#000] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-black uppercase tracking-wider">Cadangan JSON</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-black bg-sky-200 text-black border border-black shadow-[1px_1px_0_#000]">Snapshot</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={handleDownloadBackup}
                        className="neo-btn flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white hover:bg-yellow-50 text-black border-2 border-black shadow-[2px_2px_0_#000] text-xs font-black"
                      >
                        <DownloadCloud className="w-3.5 h-3.5" />
                        <span>Unduh JSON</span>
                      </button>
                      <button
                        onClick={() => restoreFileRef.current?.click()}
                        className="neo-btn flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white hover:bg-yellow-50 text-black border-2 border-black shadow-[2px_2px_0_#000] text-xs font-black"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-black" />
                        <span>Pulihkan JSON</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-yellow-50 border-2 border-black shadow-[2px_2px_0_#000] text-[11px] text-zinc-700">
                  <strong className="text-black font-black uppercase">Tips:</strong> Rutin unduh file Excel secara berkala untuk memiliki salinan rekap penjualan offline yang aman.
                </div>
              </div>

              {/* KARTU 3: GENERATOR BROADCAST WA / TELEGRAM */}
              <div className="neo-card p-4 sm:p-5 space-y-4 flex flex-col justify-between md:col-span-2 xl:col-span-1">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black">
                    <div className="w-8 h-8 rounded-lg bg-[#FFE600] border-2 border-black shadow-[2px_2px_0_#000] flex items-center justify-center text-black font-black">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-xs sm:text-sm text-black uppercase tracking-wide">Broadcast WhatsApp / Tele</h3>
                      <p className="text-[11px] text-zinc-600 font-bold">Format teks bersih siap kirim</p>
                    </div>
                  </div>

                  {/* Filter Kategori & Ready */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <select
                        value={broadcastCategory}
                        onChange={(e) => setBroadcastCategory(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-bold focus:outline-none focus:bg-yellow-50 transition"
                      >
                        <option value="all">Semua Kategori</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>

                      <label className="flex items-center gap-1.5 text-xs text-black font-black cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={broadcastOnlyReady}
                          onChange={(e) => setBroadcastOnlyReady(e.target.checked)}
                          className="w-4 h-4 rounded border-2 border-black text-[#FFE600] focus:ring-0"
                        />
                        <span>Hanya Ready</span>
                      </label>
                    </div>

                    <textarea
                      readOnly
                      rows={8}
                      value={broadcastText}
                      className="w-full p-3 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-mono leading-relaxed focus:outline-none resize-none no-scrollbar"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCopyBroadcast}
                  className={`neo-btn w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black border-2 border-black shadow-[4px_4px_0_#000] uppercase tracking-wide ${
                    broadcastCopied 
                      ? 'bg-emerald-400 text-black' 
                      : 'bg-[#FFE600] hover:bg-[#ffea33] text-black'
                  }`}
                >
                  {broadcastCopied ? (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      <span>Format Berhasil Disalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Format Broadcast</span>
                    </>
                  )}
                </button>
              </div>

              {/* KARTU 4: STUDIO POSTER PROMO STOK */}
              <div className="neo-card p-4 sm:p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black">
                    <div className="w-8 h-8 rounded-lg bg-fuchsia-300 border-2 border-black shadow-[2px_2px_0_#000] flex items-center justify-center text-black font-black">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-xs sm:text-sm text-black uppercase tracking-wide">Studio Poster Promo</h3>
                      <p className="text-[11px] text-zinc-600 font-bold">Download status stok PNG / JPG</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-700 font-medium leading-relaxed">
                    Cetak gambar status stok akun ready (hijau) dan kosong (merah) bergaya Neo-Brutalism untuk diposting di WhatsApp Story, Instagram, dan Telegram.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabChange('promo_poster')}
                  className="neo-btn w-full py-2.5 rounded-xl bg-fuchsia-300 hover:bg-fuchsia-200 text-xs text-black font-black border-2 border-black shadow-[2px_2px_0_#000] transition uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Palette className="w-4 h-4" />
                  <span>Buka Studio Poster</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB: STUDIO POSTER PROMO STOK (NEO-BRUTALISM)                        */}
        {/* ==================================================================== */}
        {activeTab === 'promo_poster' && (
          <div className="space-y-5">
            {/* Control Panel Header */}
            <div className="neo-card p-4 sm:p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-black">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-black flex items-center gap-2 uppercase tracking-wide">
                    <span className="w-8 h-8 rounded-lg bg-fuchsia-300 text-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#000]">
                      <ImageIcon className="w-4 h-4" />
                    </span>
                    Studio Poster Stok Promo (Neo-Brutalism)
                  </h2>
                  <p className="text-xs text-zinc-600 font-bold mt-1">
                    Hasilkan gambar status stok ready &amp; kosong untuk materi promosi WhatsApp Story, Telegram Channel, dan Instagram.
                  </p>
                </div>

                {/* Export Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={loading || generatingPoster}
                    onClick={() => {
                      loadData();
                      showToast('Data stok & harga poster berhasil diperbarui!', 'success');
                    }}
                    className="neo-btn flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-200 hover:bg-cyan-100 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider disabled:opacity-50"
                    title="Tarik data produk dan status stok paling baru dari database"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Segarkan Data</span>
                  </button>

                  <button
                    type="button"
                    disabled={generatingPoster}
                    onClick={() => handleDownloadPoster('png')}
                    className="neo-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black border-2 border-black shadow-[3px_3px_0_#000] uppercase tracking-wider disabled:opacity-50"
                    title="Download gambar resolusi tinggi PNG"
                  >
                    <Download className="w-4 h-4" />
                    <span>{generatingPoster ? 'Memproses...' : 'Unduh PNG (HD)'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={generatingPoster}
                    onClick={() => handleDownloadPoster('jpg')}
                    className="neo-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFE600] hover:bg-[#ffea33] text-black text-xs font-black border-2 border-black shadow-[3px_3px_0_#000] uppercase tracking-wider disabled:opacity-50"
                    title="Download gambar ukuran ringan JPG"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh JPG</span>
                  </button>

                  <button
                    type="button"
                    disabled={generatingPoster}
                    onClick={handleCopyPosterImage}
                    className="neo-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-yellow-50 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider disabled:opacity-50"
                    title="Salin gambar agar bisa langsung paste di WhatsApp / Telegram"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">Salin Gambar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyResellerBroadcast}
                    className="neo-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-300 hover:bg-purple-200 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider cursor-pointer"
                    title="Salin daftar harga & kontak dalam format teks pesan WhatsApp untuk reseller"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Salin Format Chat WA</span>
                  </button>
                </div>
              </div>

              {/* Product Multi-Picker Trigger & Quick Actions */}
              <div className="bg-yellow-50/80 p-3 rounded-xl border-2 border-black shadow-[2px_2px_0_#000] space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-[11px] font-black uppercase text-zinc-900 tracking-wider block">
                      Pilih Produk Khusus Poster
                    </label>
                    <p className="text-[10px] font-bold text-zinc-600">
                      Bisa pilih produk tertentu saja (contoh: Canva, Netflix, CapCut) atau seluruh katalog.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPosterProductPicker(true)}
                    className="neo-btn py-2 px-3.5 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-black font-black text-xs border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Buka Checklist Produk ({currentPosterSelectedCount} / {products.length})</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-black/10">
                  <button
                    type="button"
                    onClick={handleSelectAllPosterProducts}
                    className={`px-2.5 py-1 rounded-lg border border-black text-[10px] font-black uppercase transition cursor-pointer ${
                      isAllPosterProductsSelected ? 'bg-black text-[#FFE600]' : 'bg-white hover:bg-yellow-100 text-black'
                    }`}
                  >
                    Pilih Semua ({products.length})
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectReadyOnlyPosterProducts}
                    className="px-2.5 py-1 rounded-lg border border-black bg-emerald-100 hover:bg-emerald-200 text-emerald-950 text-[10px] font-black uppercase transition cursor-pointer"
                  >
                    Hanya Ready Stok
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAllPosterProducts}
                    className="px-2.5 py-1 rounded-lg border border-black bg-rose-100 hover:bg-rose-200 text-rose-950 text-[10px] font-black uppercase transition cursor-pointer"
                  >
                    Kosongkan
                  </button>

                  {!isAllPosterProductsSelected && currentPosterSelectedCount > 0 && (
                    <div className="w-full flex items-center gap-1 pt-1.5 overflow-x-auto no-scrollbar">
                      <span className="text-[9px] font-black uppercase text-zinc-600 shrink-0">Terpilih:</span>
                      {products
                        .filter((p) => isPosterProductSelected(p.id))
                        .map((p) => (
                          <span
                            key={`chip_adm_${p.id}`}
                            className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-black text-[9px] font-black text-black shrink-0"
                          >
                            <span>{p.name}</span>
                            <button
                              type="button"
                              onClick={() => handleTogglePosterProduct(p.id)}
                              className="text-zinc-500 hover:text-black font-bold text-[10px]"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Customizer Toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {/* 1. Kategori Produk */}
                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1.5">
                    Kategori Produk
                  </label>
                  <select
                    value={posterCategory}
                    onChange={(e) => {
                      setPosterCategory(e.target.value);
                      setPosterProductFilter('all');
                      setPosterCurrentPage(1);
                    }}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs font-bold text-black outline-none cursor-pointer"
                  >
                    <option value="all">Semua Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Fokus Produk */}
                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1.5">
                    Fokus Produk
                  </label>
                  <select
                    value={posterProductFilter}
                    onChange={(e) => {
                      setPosterProductFilter(e.target.value);
                      setPosterCurrentPage(1);
                    }}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs font-bold text-black outline-none cursor-pointer"
                  >
                    <option value="all">Semua Produk ({posterAvailableProducts.length})</option>
                    {posterAvailableProducts.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Filter Stok */}
                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1.5">
                    Tampilkan Stok
                  </label>
                  <select
                    value={posterStockFilter}
                    onChange={(e) => {
                      setPosterStockFilter(e.target.value);
                      setPosterCurrentPage(1);
                    }}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs font-bold text-black outline-none cursor-pointer"
                  >
                    <option value="all">Semua (Ready &amp; Kosong)</option>
                    <option value="ready_only">Hanya Ready Saja</option>
                  </select>
                </div>

                {/* Format Detail Produk: Sertakan Jenis vs Tanpa Jenis */}
                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1.5">
                    Format Detail Produk
                  </label>
                  <div className="flex rounded-xl border-2 border-black overflow-hidden shadow-[2px_2px_0_#000]">
                    <button
                      type="button"
                      onClick={() => setPosterIncludeVariants(true)}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition ${
                        posterIncludeVariants ? 'bg-[#FFE600] text-black' : 'bg-white text-zinc-700 hover:bg-yellow-50'
                      }`}
                      title="Menampilkan rincian paket dan harganya masing-masing"
                    >
                      Sertakan Jenis
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosterIncludeVariants(false)}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition border-l-2 border-black ${
                        !posterIncludeVariants ? 'bg-[#FFE600] text-black' : 'bg-white text-zinc-700 hover:bg-yellow-50'
                      }`}
                      title="Hanya menampilkan nama produk dengan estimasi Mulai Rp XX.XXX"
                    >
                      Tanpa Jenis
                    </button>
                  </div>
                </div>

                {/* 4. Atur Bebas Panjang Poster (Slider & Input Langsung) */}
                <div className="sm:col-span-2 bg-yellow-100/60 p-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0_#000]">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="text-[11px] font-black uppercase text-zinc-900 tracking-wider">
                      Panjang Poster (Bebas Atur Jumlah Produk)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max={filteredPosterProducts.length || 200}
                        value={posterPageSize === 'all' ? filteredPosterProducts.length : posterPageSize}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value) || 1);
                          setPosterPageSize(String(val));
                          setPosterCurrentPage(1);
                        }}
                        className="w-16 px-2 py-0.5 rounded-lg bg-white border-2 border-black text-center font-mono font-black text-xs text-black shadow-[1.5px_1.5px_0_#000]"
                      />
                      <span className="text-[10px] font-black uppercase text-zinc-600">/ {filteredPosterProducts.length} Produk</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="4"
                      max={Math.max(4, filteredPosterProducts.length || 100)}
                      step="1"
                      value={posterPageSize === 'all' ? filteredPosterProducts.length : Number(posterPageSize) || 24}
                      onChange={(e) => {
                        setPosterPageSize(e.target.value);
                        setPosterCurrentPage(1);
                      }}
                      className="flex-1 accent-black cursor-pointer h-2 bg-white rounded-lg border border-black"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPosterPageSize('all');
                        setPosterCurrentPage(1);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border-2 border-black shadow-[1.5px_1.5px_0_#000] cursor-pointer transition ${
                        posterPageSize === 'all' ? 'bg-black text-[#FFE600]' : 'bg-white hover:bg-yellow-200 text-black'
                      }`}
                    >
                      Muat Semua (1 Lembar)
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                    <span className="font-black text-zinc-600 uppercase text-[9px]">Pilihan Cepat:</span>
                    {[8, 12, 18, 24, 32, 48].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setPosterPageSize(String(num));
                          setPosterCurrentPage(1);
                        }}
                        className={`px-2 py-0.5 rounded-md border border-black font-black uppercase transition cursor-pointer ${
                          posterPageSize === String(num) ? 'bg-black text-[#FFE600]' : 'bg-white hover:bg-yellow-100 text-black'
                        }`}
                      >
                        {num} Produk
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Kerapatan Kartu (Density) */}
                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1.5">
                    Kerapatan Kartu
                  </label>
                  <div className="flex rounded-xl border-2 border-black overflow-hidden shadow-[2px_2px_0_#000]">
                    <button
                      type="button"
                      onClick={() => setPosterDensity('standard')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition ${
                        posterDensity === 'standard' ? 'bg-[#FFE600] text-black' : 'bg-white text-zinc-700 hover:bg-yellow-50'
                      }`}
                    >
                      Standar
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosterDensity('compact')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition border-l-2 border-black ${
                        posterDensity === 'compact' ? 'bg-[#FFE600] text-black' : 'bg-white text-zinc-700 hover:bg-yellow-50'
                      }`}
                    >
                      Kompak
                    </button>
                  </div>
                </div>

                {/* 6. Jumlah Kolom */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider">
                      Jumlah Kolom
                    </label>
                    <span className="text-[9px] font-black text-black bg-yellow-200 px-1.5 py-0.2 rounded border border-black">
                      {posterColumns} Kolom
                    </span>
                  </div>
                  <div className="flex rounded-xl border-2 border-black overflow-hidden shadow-[2px_2px_0_#000]">
                    <button
                      type="button"
                      onClick={() => setPosterColumns('2')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition ${
                        posterColumns === '2' ? 'bg-[#FFE600] text-black font-black' : 'bg-white text-zinc-700 hover:bg-yellow-50'
                      }`}
                    >
                      2
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosterColumns('3')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition border-l-2 border-black ${
                        posterColumns === '3' ? 'bg-[#FFE600] text-black font-black' : 'bg-white text-zinc-700 hover:bg-yellow-50'
                      }`}
                    >
                      3
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosterColumns('4')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition border-l-2 border-black ${
                        posterColumns === '4' ? 'bg-[#FFE600] text-black font-black' : 'bg-white text-zinc-700 hover:bg-yellow-50'
                      }`}
                    >
                      4
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosterColumns('5')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition border-l-2 border-black ${
                        posterColumns === '5' ? 'bg-[#FFE600] text-black font-black' : 'bg-white text-zinc-700 hover:bg-yellow-50'
                      }`}
                    >
                      5
                    </button>
                  </div>
                  <p className="text-[10px] font-bold text-zinc-500 mt-1 leading-tight">
                    Catatan: Di HP, aktifkan mode "Situs Desktop" pada browser agar susunan kolom lebar terlihat seperti wujud aslinya.
                  </p>
                </div>

                {/* 7. Tema Latar */}
                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1.5">
                    Tema Latar
                  </label>
                  <div className="flex rounded-xl border-2 border-black overflow-hidden shadow-[2px_2px_0_#000]">
                    <button
                      type="button"
                      onClick={() => setPosterTheme('yellow')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition ${
                        posterTheme === 'yellow' ? 'bg-[#FFE600] text-black font-black' : 'bg-yellow-100 text-black'
                      }`}
                      title="Kuning Neo"
                    >
                      Kuning
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosterTheme('white')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition border-l-2 border-black ${
                        posterTheme === 'white' ? 'bg-zinc-200 text-black font-black' : 'bg-white text-black'
                      }`}
                      title="Putih Bersih"
                    >
                      Putih
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosterTheme('dark')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition border-l-2 border-black ${
                        posterTheme === 'dark' ? 'bg-zinc-900 text-white font-black' : 'bg-zinc-800 text-zinc-300'
                      }`}
                      title="Dark Cyber"
                    >
                      Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosterTheme('emerald')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition border-l-2 border-black ${
                        posterTheme === 'emerald' ? 'bg-emerald-300 text-black font-black' : 'bg-emerald-100 text-black'
                      }`}
                      title="Mint Emerald"
                    >
                      Mint
                    </button>
                  </div>
                </div>

                {/* 8. Bentuk Indikator */}
                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1.5">
                    Bentuk Indikator
                  </label>
                  <div className="flex rounded-xl border-2 border-black overflow-hidden shadow-[2px_2px_0_#000]">
                    <button
                      type="button"
                      onClick={() => setPosterShape('badge')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition ${
                        posterShape === 'badge' ? 'bg-[#FFE600] text-black' : 'bg-white text-zinc-700 hover:bg-yellow-50'
                      }`}
                    >
                      Kotak
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosterShape('circle')}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition border-l-2 border-black ${
                        posterShape === 'circle' ? 'bg-[#FFE600] text-black' : 'bg-white text-zinc-700 hover:bg-yellow-50'
                      }`}
                    >
                      Lingkaran
                    </button>
                  </div>
                </div>

                {/* 9. Tampilkan Harga */}
                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider block mb-1.5">
                    Tampilkan Harga
                  </label>
                  <div className="flex rounded-xl border-2 border-black overflow-hidden shadow-[2px_2px_0_#000]">
                    <button
                      type="button"
                      onClick={() => setPosterShowPrice(true)}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition ${
                        posterShowPrice ? 'bg-[#FFE600] text-black font-black' : 'bg-white text-zinc-700 hover:bg-yellow-50'
                      }`}
                    >
                      Sertakan
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosterShowPrice(false)}
                      className={`flex-1 py-1.5 text-xs font-black uppercase transition border-l-2 border-black ${
                        !posterShowPrice ? 'bg-[#FFE600] text-black font-black' : 'bg-white text-zinc-700 hover:bg-yellow-50'
                      }`}
                    >
                      Tanpa Harga
                    </button>
                  </div>
                </div>

                {/* 10. Markup Harga Reseller */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-black uppercase text-zinc-700 tracking-wider">
                      Markup Harga Reseller
                    </label>
                    <span className="text-[10px] font-bold text-zinc-500">
                      {posterMarkupValue > 0 ? (posterMarkupType === 'flat' ? `+${formatRupiah(posterMarkupValue)}` : `+${posterMarkupValue}%`) : 'Harga Normal'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setPosterMarkupType('flat'); setPosterMarkupValue(0); }}
                      className={`px-2 py-1 rounded-lg border-2 border-black text-[10px] font-black uppercase tracking-tight shadow-[1.5px_1.5px_0_#000] ${
                        posterMarkupValue === 0 ? 'bg-black text-yellow-300' : 'bg-white text-black hover:bg-yellow-100'
                      }`}
                    >
                      Normal (+0)
                    </button>
                    {[1000, 2000, 3000, 5000, 10000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => { setPosterMarkupType('flat'); setPosterMarkupValue(val); }}
                        className={`px-2 py-1 rounded-lg border-2 border-black text-[10px] font-black uppercase tracking-tight shadow-[1.5px_1.5px_0_#000] ${
                          posterMarkupType === 'flat' && posterMarkupValue === val ? 'bg-[#FFE600] text-black' : 'bg-white text-black hover:bg-yellow-100'
                        }`}
                      >
                        +{val >= 1000 ? `${val / 1000}rb` : val}
                      </button>
                    ))}
                    {[10, 20, 30].map((pct) => (
                      <button
                        key={`pct_${pct}`}
                        type="button"
                        onClick={() => { setPosterMarkupType('percent'); setPosterMarkupValue(pct); }}
                        className={`px-2 py-1 rounded-lg border-2 border-black text-[10px] font-black uppercase tracking-tight shadow-[1.5px_1.5px_0_#000] ${
                          posterMarkupType === 'percent' && posterMarkupValue === pct ? 'bg-emerald-300 text-black' : 'bg-white text-black hover:bg-emerald-100'
                        }`}
                      >
                        +{pct}%
                      </button>
                    ))}
                    <div className="flex items-center gap-1 ml-auto">
                      <input
                        type="number"
                        placeholder="Custom"
                        value={posterMarkupValue === 0 ? '' : posterMarkupValue}
                        onChange={(e) => {
                          const v = parseInt(e.target.value) || 0;
                          setPosterMarkupValue(v);
                        }}
                        className="w-20 px-2 py-1 rounded-lg border-2 border-black text-[11px] font-mono font-bold bg-white text-black shadow-[1.5px_1.5px_0_#000] outline-none"
                      />
                      <select
                        value={posterMarkupType}
                        onChange={(e) => setPosterMarkupType(e.target.value)}
                        className="px-1.5 py-1 rounded-lg border-2 border-black text-[10px] font-black uppercase bg-white text-black shadow-[1.5px_1.5px_0_#000] outline-none"
                      >
                        <option value="flat">Rp</option>
                        <option value="percent">%</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Presets for Popular Products */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t-2 border-black/10">
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-700">Preset Poster Cepat:</span>
                <button
                  type="button"
                  onClick={() => {
                    setPosterCategory('cat_3');
                    const cv = products.find(p => p.name.toLowerCase().includes('canva'));
                    if (cv) setPosterProductFilter(cv.id);
                    setPosterColumns('2');
                    setPosterTitle('CANVA PRO PREMIUM - D STORE');
                    setPosterSubtitle('Solusi Desain Tanpa Batas • Akses Fitur & Elemen Pro Resmi');
                    applyPosterContact(posterContactMode);
                    showToast('Preset Poster Canva Pro dimuat!', 'success');
                  }}
                  className="neo-btn px-2.5 py-1 rounded-lg bg-cyan-200 hover:bg-cyan-300 text-black text-xs font-black border-2 border-black shadow-[1.5px_1.5px_0_#000] uppercase tracking-tight flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Poster Canva Pro</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPosterCategory('cat_2');
                    const nfx = products.find(p => p.name.toLowerCase().includes('netflix'));
                    if (nfx) setPosterProductFilter(nfx.id);
                    setPosterColumns('2');
                    setPosterTitle('NETFLIX PREMIUM - D STORE');
                    setPosterSubtitle('Nonton 4K Ultra HD Tanpa Iklan • Full Garansi');
                    applyPosterContact(posterContactMode);
                    showToast('Preset Poster Netflix dimuat!', 'success');
                  }}
                  className="neo-btn px-2.5 py-1 rounded-lg bg-rose-200 hover:bg-rose-300 text-black text-xs font-black border-2 border-black shadow-[1.5px_1.5px_0_#000] uppercase tracking-tight flex items-center gap-1 cursor-pointer"
                >
                  <span>Poster Netflix</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPosterCategory('cat_2');
                    const yt = products.find(p => p.name.toLowerCase().includes('youtube'));
                    if (yt) setPosterProductFilter(yt.id);
                    setPosterColumns('2');
                    setPosterTitle('YOUTUBE PREMIUM - D STORE');
                    setPosterSubtitle('Bebas Iklan + Putar di Latar Belakang + YouTube Music');
                    applyPosterContact(posterContactMode);
                    showToast('Preset Poster YouTube dimuat!', 'success');
                  }}
                  className="neo-btn px-2.5 py-1 rounded-lg bg-red-200 hover:bg-red-300 text-black text-xs font-black border-2 border-black shadow-[1.5px_1.5px_0_#000] uppercase tracking-tight flex items-center gap-1 cursor-pointer"
                >
                  <span>Poster YouTube</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPosterCategory('all');
                    setPosterProductFilter('all');
                    setPosterColumns('3');
                    setPosterTitle('D STORE - LIVE STOCK STATUS');
                    setPosterSubtitle('Katalog Akun Premium & Bergaransi Resmi');
                    applyPosterContact('both');
                    showToast('Reset ke semua produk!', 'info');
                  }}
                  className="neo-btn px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-black text-xs font-black border-2 border-black shadow-[1.5px_1.5px_0_#000] uppercase tracking-tight cursor-pointer"
                >
                  <span>Semua Produk</span>
                </button>
              </div>

              {/* Baris Tombol Kontak 1-Klik (WA & Telegram) */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-zinc-200">
                <span className="text-[11px] font-black uppercase text-zinc-700 tracking-tight mr-1">
                  Pilihan Kontak Poster:
                </span>
                <button
                  type="button"
                  onClick={() => applyPosterContact('both')}
                  className={`neo-btn px-2.5 py-1 rounded-lg text-xs font-black border-2 border-black shadow-[1.5px_1.5px_0_#000] uppercase tracking-tight cursor-pointer transition ${
                    posterContactMode === 'both' ? 'bg-[#FFE600] text-black ring-1 ring-black' : 'bg-white hover:bg-yellow-50 text-black'
                  }`}
                  title="Cantumkan WhatsApp & Telegram di footer poster"
                >
                  <span>WA + Telegram</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPosterContact('wa')}
                  className={`neo-btn px-2.5 py-1 rounded-lg text-xs font-black border-2 border-black shadow-[1.5px_1.5px_0_#000] uppercase tracking-tight cursor-pointer transition ${
                    posterContactMode === 'wa' ? 'bg-emerald-300 text-black ring-1 ring-black' : 'bg-white hover:bg-emerald-50 text-black'
                  }`}
                  title="Cantumkan WhatsApp saja di footer poster"
                >
                  <span>WA Saja ({posterWa})</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPosterContact('tele')}
                  className={`neo-btn px-2.5 py-1 rounded-lg text-xs font-black border-2 border-black shadow-[1.5px_1.5px_0_#000] uppercase tracking-tight cursor-pointer transition ${
                    posterContactMode === 'tele' ? 'bg-sky-300 text-black ring-1 ring-black' : 'bg-white hover:bg-sky-50 text-black'
                  }`}
                  title="Cantumkan Telegram saja di footer poster"
                >
                  <span>Telegram Saja (@{posterTele.replace(/^@/, '')})</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPosterContact('admin')}
                  className={`neo-btn px-2.5 py-1 rounded-lg text-xs font-black border-2 border-black shadow-[1.5px_1.5px_0_#000] uppercase tracking-tight cursor-pointer transition ${
                    posterContactMode === 'admin' ? 'bg-zinc-300 text-black ring-1 ring-black' : 'bg-white hover:bg-zinc-100 text-black'
                  }`}
                  title="Cantumkan Chat Admin tanpa nomor langsung"
                >
                  <span>Chat Admin</span>
                </button>
              </div>

              {/* Accordion / Toggle Edit Teks Poster */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowPosterSettings(!showPosterSettings)}
                  className="text-xs font-black text-black hover:underline flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{showPosterSettings ? 'Tutup Pengaturan Teks Poster' : '+ Ubah Judul, Kontak WA/Tele & Branding'}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showPosterSettings ? 'rotate-90' : ''}`} />
                </button>

                {showPosterSettings && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 mt-2 bg-[#f4f4f0] rounded-xl border-2 border-black shadow-[2px_2px_0_#000]">
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-700 block mb-1">Judul Poster</label>
                      <input
                        type="text"
                        value={posterTitle}
                        onChange={(e) => setPosterTitle(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border-2 border-black text-xs font-bold text-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-700 block mb-1">Subjudul / Info Garansi</label>
                      <input
                        type="text"
                        value={posterSubtitle}
                        onChange={(e) => setPosterSubtitle(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border-2 border-black text-xs font-bold text-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-700 block mb-1">Nomor WhatsApp</label>
                      <input
                        type="text"
                        value={posterWa}
                        onChange={(e) => {
                          setPosterWa(e.target.value);
                          applyPosterContact(posterContactMode, e.target.value, posterTele);
                        }}
                        placeholder="081230112240"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border-2 border-black text-xs font-bold text-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-700 block mb-1">Username Telegram</label>
                      <input
                        type="text"
                        value={posterTele}
                        onChange={(e) => {
                          setPosterTele(e.target.value);
                          applyPosterContact(posterContactMode, posterWa, e.target.value);
                        }}
                        placeholder="dewipermata03"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border-2 border-black text-xs font-bold text-black outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-black uppercase text-zinc-700 block mb-1">Teks Kontak Lengkap di ⚡</label>
                      <input
                        type="text"
                        value={posterFooter}
                        onChange={(e) => {
                          setPosterFooter(e.target.value);
                          setPosterContactMode('custom');
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border-2 border-black text-xs font-bold text-black outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-black uppercase text-zinc-700 block mb-1">Label Kanan Bawah (Ganti Branding)</label>
                      <input
                        type="text"
                        value={posterBrand}
                        onChange={(e) => setPosterBrand(e.target.value)}
                        placeholder="D STORE • RESMI & BERGARANSI"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border-2 border-black text-xs font-bold text-black outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Slide Navigation Bar (Jika lebih dari 1 slide) */}
            {totalPosterPages > 1 && (
              <div className="p-3 bg-white border-3 border-black shadow-[3px_3px_0_#000] rounded-xl flex flex-wrap items-center justify-between gap-3">
                {/* Left: Previous & Next Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={posterCurrentPage <= 1}
                    onClick={() => setPosterCurrentPage((p) => Math.max(1, p - 1))}
                    className="neo-btn px-3 py-1.5 rounded-lg bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black font-black text-xs disabled:opacity-40 uppercase tracking-tight flex items-center gap-1 cursor-pointer transition active:translate-x-0.5 shadow-[1.5px_1.5px_0_#000]"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Sebelumnya</span>
                  </button>

                  <button
                    type="button"
                    disabled={posterCurrentPage >= totalPosterPages}
                    onClick={() => setPosterCurrentPage((p) => Math.min(totalPosterPages, p + 1))}
                    className="neo-btn px-3 py-1.5 rounded-lg bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black font-black text-xs disabled:opacity-40 uppercase tracking-tight flex items-center gap-1 cursor-pointer transition active:translate-x-0.5 shadow-[1.5px_1.5px_0_#000]"
                  >
                    <span>Selanjutnya</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Center: Slide Indicator & Selector */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-zinc-100 px-2.5 py-1 rounded-lg border-2 border-black shadow-[1.5px_1.5px_0_#000]">
                    <span className="text-xs font-black uppercase text-zinc-700">Slide:</span>
                    <select
                      value={posterCurrentPage}
                      onChange={(e) => setPosterCurrentPage(Number(e.target.value))}
                      className="px-2 py-0.5 bg-[#FFE600] font-black text-xs border border-black rounded shadow-[1px_1px_0_#000] outline-none cursor-pointer"
                    >
                      {Array.from({ length: totalPosterPages }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs font-black uppercase text-zinc-700">
                      dari {totalPosterPages}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-500 hidden sm:inline">
                      ({filteredPosterProducts.length} Produk)
                    </span>
                  </div>

                  {/* Number Pills (Hanya jika <= 8 halaman agar tidak desak-desakan) */}
                  {totalPosterPages <= 8 && (
                    <div className="hidden lg:flex items-center gap-1">
                      {Array.from({ length: totalPosterPages }).map((_, idx) => (
                        <button
                          key={idx + 1}
                          type="button"
                          onClick={() => setPosterCurrentPage(idx + 1)}
                          className={`w-7 h-7 rounded-lg border-2 border-black text-xs font-black transition cursor-pointer ${
                            posterCurrentPage === idx + 1
                              ? 'bg-black text-[#FFE600] shadow-[1.5px_1.5px_0_#FFE600]'
                              : 'bg-white text-black hover:bg-yellow-100 shadow-[1px_1px_0_#000]'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Download All Slides Button */}
                <div className="flex items-center">
                  <button
                    type="button"
                    disabled={generatingPoster}
                    onClick={() => handleDownloadAllSlides('png')}
                    className="neo-btn flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-300 hover:bg-cyan-200 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider disabled:opacity-50 cursor-pointer transition"
                    title="Otomatis unduh seluruh slide sebagai gambar terpisah"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Unduh Semua Slide ({totalPosterPages})</span>
                  </button>
                </div>
              </div>
            )}

            {/* LIVE POSTER PREVIEW CONTAINER (Untuk di-download PNG/JPG) */}
            <div className="overflow-x-auto pb-4 no-scrollbar">
              <div
                ref={posterRef}
                className={`p-6 sm:p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0_#000] min-w-[700px] transition-colors ${
                  posterTheme === 'yellow'
                    ? 'bg-[#FFE600] text-black'
                    : posterTheme === 'white'
                    ? 'bg-[#F8F8F6] text-black'
                    : posterTheme === 'dark'
                    ? 'bg-zinc-950 text-white'
                    : 'bg-emerald-300 text-black'
                }`}
              >
                {/* Poster Header */}
                <div className="flex items-center justify-between pb-5 border-b-3 border-black gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <div className="px-3 py-1 bg-black text-[#FFE600] font-black text-sm sm:text-base uppercase tracking-wider border-2 border-black shadow-[2px_2px_0_#000] -rotate-1 inline-block">
                        D STORE
                      </div>
                      <div className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-black border-2 border-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[1.5px_1.5px_0_#000]">
                        <span className="w-2 h-2 rounded-full bg-emerald-950 animate-pulse"></span>
                        <span>Live Stock</span>
                      </div>
                      {totalPosterPages > 1 && posterPageSize !== 'all' && (
                        <div className="px-2.5 py-0.5 rounded-full bg-yellow-300 text-black border-2 border-black text-[10px] font-black uppercase tracking-wider shadow-[1.5px_1.5px_0_#000]">
                          Slide {posterCurrentPage} / {totalPosterPages}
                        </div>
                      )}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black pt-1">
                      {posterTitle}
                    </h1>
                    <p className={`text-xs font-bold ${posterTheme === 'dark' ? 'text-zinc-300' : 'text-zinc-800'}`}>
                      {posterSubtitle} • <span className="underline decoration-2">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </p>
                  </div>

                  {/* Indicator Legend Bar */}
                  <div className="bg-white text-black p-3 rounded-xl border-3 border-black shadow-[3px_3px_0_#000] shrink-0 space-y-1.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-zinc-600 border-b border-black pb-1">
                      Status Ketersediaan
                    </div>
                    <div className="flex items-center gap-3 text-xs font-black">
                      <div className="flex items-center gap-1.5">
                        {posterShape === 'circle' ? (
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black shadow-[1px_1px_0_#000]"></span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-400 text-black border border-black text-[9px] font-black">READY</span>
                        )}
                        <span className="text-emerald-950 uppercase text-[11px]">
                          {posterStockFilter === 'ready_only' ? '100% Ready Stock' : 'Ready Stock'}
                        </span>
                      </div>
                      {posterStockFilter !== 'ready_only' && (
                        <div className="flex items-center gap-1.5">
                          {posterShape === 'circle' ? (
                            <span className="w-3.5 h-3.5 rounded-full bg-rose-400 border-2 border-black shadow-[1px_1px_0_#000]"></span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-rose-400 text-black border border-black text-[9px] font-black">KOSONG</span>
                          )}
                          <span className="text-rose-950 uppercase text-[11px]">Habis</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Poster Grid of Products */}
                <div
                  className={`grid ${posterDensity === 'compact' ? 'gap-2.5 pt-4' : 'gap-4 pt-6'} ${
                    posterColumns === '2'
                      ? 'grid-cols-2'
                      : posterColumns === '4'
                      ? 'grid-cols-2 md:grid-cols-4'
                      : posterColumns === '5'
                      ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
                      : 'grid-cols-2 sm:grid-cols-3'
                  }`}
                >
                  {displayedPosterProducts.map((p) => (
                    <div
                      key={p.id}
                      className={`bg-white text-black border-3 border-black shadow-[4px_4px_0_#000] rounded-xl flex flex-col justify-between ${
                        posterDensity === 'compact' ? 'p-2.5' : 'p-3.5'
                      }`}
                    >
                      <div>
                        {/* Product Title & Badge */}
                        <div className={`flex items-start justify-between gap-1.5 border-b-2 border-black ${
                          posterDensity === 'compact' ? 'mb-1.5 pb-1.5' : 'mb-2.5 pb-2'
                        }`}>
                          <h3
                            className={`font-black text-black uppercase leading-tight line-clamp-2 break-words ${
                              posterDensity === 'compact' ? 'text-xs' : 'text-xs sm:text-sm'
                            }`}
                            title={p.name}
                          >
                            {p.name}
                          </h3>
                          <span
                            className={`font-black uppercase bg-yellow-200 border border-black rounded shrink-0 ${
                              posterDensity === 'compact' ? 'text-[8px] px-1 py-0.5' : 'text-[9px] px-1.5 py-0.5'
                            }`}
                          >
                            {p.categoryName ? p.categoryName.split(' ')[0].replace(/[,\s]+$/, '') : 'Item'}
                          </span>
                        </div>

                        {/* Variants List or Product-Only View */}
                        {posterIncludeVariants ? (
                          <div className={posterDensity === 'compact' ? 'space-y-1' : 'space-y-1.5'}>
                            {p.filteredVariants.map((v, vIdx) => {
                              const isReady = v.isAvailable !== false;
                              return (
                                <div
                                  key={v.id ? `${v.id}_${vIdx}` : vIdx}
                                  className={`flex items-center justify-between rounded-lg border-2 border-black transition ${
                                    posterDensity === 'compact' ? 'p-1 text-[11px]' : 'p-1.5 text-xs'
                                  } ${
                                    isReady ? 'bg-emerald-50/80 shadow-[1.5px_1.5px_0_#000]' : 'bg-rose-50/70 border-dashed opacity-75'
                                  }`}
                                >
                                  <div className="min-w-0 flex-1 mr-1.5">
                                    <div
                                      className={`font-black text-black leading-snug break-words line-clamp-2 ${
                                        posterDensity === 'compact' ? 'text-[10px]' : 'text-[11px]'
                                      }`}
                                      title={v.name}
                                    >
                                      {getCleanVariantName(v.name, p.name)}
                                    </div>
                                    {posterShowPrice && (
                                      <div
                                        className={`font-mono font-bold text-zinc-700 ${
                                          posterDensity === 'compact' ? 'text-[9px]' : 'text-[10px]'
                                        }`}
                                      >
                                        {formatRupiah(getPosterVariantPrice(v.price))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Indicator (Kotak atau Lingkaran) */}
                                  <div className="shrink-0">
                                    {posterShape === 'circle' ? (
                                      <span
                                        className={`rounded-full border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0_#000] ${
                                          posterDensity === 'compact' ? 'w-3 h-3' : 'w-4 h-4'
                                        } ${
                                          isReady ? 'bg-emerald-400' : 'bg-rose-400'
                                        }`}
                                        title={isReady ? 'Ready' : 'Habis'}
                                      ></span>
                                    ) : (
                                      <span
                                        className={`rounded font-black uppercase border-2 border-black shadow-[1.5px_1.5px_0_#000] ${
                                          posterDensity === 'compact' ? 'px-1 py-0.5 text-[8px]' : 'px-1.5 py-0.5 text-[9px]'
                                        } ${
                                          isReady ? 'bg-emerald-400 text-black' : 'bg-rose-400 text-black line-through'
                                        }`}
                                      >
                                        {isReady ? 'Ready' : 'Habis'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-yellow-50/90 border-2 border-black flex items-center justify-between gap-2 shadow-[1.5px_1.5px_0_#000]">
                            <div className="min-w-0 flex-1">
                              {posterShowPrice && (
                                <div className="font-mono font-black text-black text-xs sm:text-sm">
                                  {p.filteredVariants.length > 0
                                    ? `Mulai ${formatRupiah(getPosterVariantPrice(Math.min(...p.filteredVariants.map((v) => Number(v.price) || 0))))}`
                                    : 'Hubungi Kami'}
                                </div>
                              )}
                              <div className="text-[10px] font-bold text-zinc-600 mt-0.5">
                                {p.filteredVariants.length} Pilihan Paket / Durasi
                              </div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border-2 border-black shadow-[1px_1px_0_#000] ${
                                p.filteredVariants.some((v) => v.isAvailable !== false)
                                  ? 'bg-emerald-400 text-black'
                                  : 'bg-rose-400 text-black'
                              }`}
                            >
                              {p.filteredVariants.some((v) => v.isAvailable !== false) ? 'Ready' : 'Habis'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {filteredPosterProducts.length === 0 && (
                  <div className="py-12 text-center bg-white border-3 border-black rounded-xl text-black font-black uppercase text-xs shadow-[4px_4px_0_#000]">
                    Tidak ada produk sesuai filter stok yang dipilih.
                  </div>
                )}

                {/* Poster Footer Banner */}
                <div className="mt-6 p-3.5 bg-white text-black border-3 border-black shadow-[4px_4px_0_#000] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#FFE600] text-black border-2 border-black shadow-[1.5px_1.5px_0_#000] flex items-center justify-center font-black text-xs">
                      <Zap className="w-3.5 h-3.5 fill-black text-black" />
                    </span>
                    <span className="text-xs font-black uppercase tracking-wide">
                      {posterFooter}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-black uppercase text-zinc-700 self-end sm:self-auto bg-zinc-100 px-2 py-0.5 border border-black rounded shadow-[1px_1px_0_#000]">
                    {posterBrand}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 8: ASISTEN AI GEMINI                                             */}
        {/* ==================================================================== */}
        {activeTab === 'ai' && (
          <div className="neo-card border-3 border-black shadow-[6px_6px_0_#000] flex flex-col h-[580px] overflow-hidden bg-white">
            {/* AI Header */}
            <div className="p-4 border-b-2 border-black bg-[#FFE600] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border-2 border-black shadow-[2px_2px_0_#000] flex items-center justify-center text-black font-black">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-xs sm:text-sm text-black uppercase tracking-wide">Google Gemini AI Assistant</h3>
                  <p className="text-[11px] text-black font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Terhubung Data Toko
                  </p>
                </div>
              </div>

              <div className="text-xs font-black px-2.5 py-1 rounded bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] uppercase">
                Gemini Flash
              </div>
            </div>

            {/* AI Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs sm:text-sm bg-[#f4f4f0]">
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-4 py-3 leading-relaxed whitespace-pre-wrap text-xs ${
                      m.sender === 'user' 
                        ? 'bg-[#FFE600] text-black font-bold border-2 border-black shadow-[3px_3px_0_#000]' 
                        : 'bg-white text-black border-2 border-black shadow-[3px_3px_0_#000] font-medium'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 border-2 border-black shadow-[2px_2px_0_#000] font-black">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                    <span>Gemini sedang memproses...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-4 py-2.5 bg-white border-t-2 border-black flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                'Canva 1 bulan paling murah di mana?',
                'Toko B kosong, opsi lain yang murah?',
                'Tarik data spreadsheet terbaru',
                'Buatkan ide promo story WA'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChatMessage(chip)}
                  className="neo-btn px-3 py-1.5 rounded-lg bg-[#f4f4f0] hover:bg-yellow-100 text-black text-xs whitespace-nowrap transition border-2 border-black shadow-[2px_2px_0_#000] font-black"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-3.5 border-t-2 border-black bg-white flex items-center gap-2.5">
              <input
                type="text"
                placeholder="Ketik pertanyaan atau perintah untuk toko..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#f4f4f0] border-2 border-black text-xs text-black placeholder-zinc-500 focus:outline-none focus:bg-white font-bold transition shadow-[2px_2px_0_#000]"
              />
              <button
                onClick={() => handleSendChatMessage()}
                disabled={chatLoading || !inputMessage.trim()}
                className="neo-btn p-2.5 rounded-xl bg-[#FFE600] hover:bg-[#ffea33] text-black border-2 border-black shadow-[3px_3px_0_#000] transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ==================================================================== */}
      {/* MODAL: KLAIM GARANSI & GANTI AKUN                                    */}
      {/* ==================================================================== */}
      {warrantyModalOpen && targetSaleForWarranty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border-3 border-black rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-[8px_8px_0_#000] my-auto max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <h3 className="font-black text-sm sm:text-base text-black flex items-center gap-2 uppercase tracking-wide">
                <span className="w-8 h-8 rounded-lg bg-[#FFE600] text-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#000]">
                  <RotateCcw className="w-4 h-4" />
                </span>
                Proses Klaim Garansi
              </h3>
              <button
                type="button"
                onClick={() => setWarrantyModalOpen(false)}
                className="neo-btn w-8 h-8 rounded-lg bg-white hover:bg-rose-300 border-2 border-black shadow-[2px_2px_0_#000] flex items-center justify-center font-black transition"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3.5 rounded-xl bg-[#f4f4f0] border-2 border-black text-xs space-y-1.5 text-black shadow-[2px_2px_0_#000]">
              <div><span className="text-zinc-600 font-black uppercase text-[10px]">Pesanan:</span> <span className="font-mono text-black font-bold">{targetSaleForWarranty.id}</span></div>
              <div><span className="text-zinc-600 font-black uppercase text-[10px]">Produk:</span> <strong className="text-black font-black">{targetSaleForWarranty.productName} ({targetSaleForWarranty.variantName})</strong></div>
              <div><span className="text-zinc-600 font-black uppercase text-[10px]">Pembeli:</span> <span className="text-black font-bold">{targetSaleForWarranty.buyer}</span></div>
              <div className="truncate"><span className="text-zinc-600 font-black uppercase text-[10px]">Akun Lama:</span> <code className="text-blue-700 font-mono font-bold">{targetSaleForWarranty.account}</code></div>
            </div>

            <form onSubmit={handleClaimWarranty} className="space-y-3.5">
              <div>
                <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Jenis Kendala</label>
                <select
                  value={warrantyForm.issue}
                  onChange={(e) => setWarrantyForm({ ...warrantyForm, issue: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-bold focus:outline-none focus:bg-yellow-50 transition"
                >
                  <option value="Reset sandi / Akun terputus">Reset sandi / Akun terputus</option>
                  <option value="Akun kena on-hold / suspended">Akun kena on-hold / suspended</option>
                  <option value="Layar penuh / Limit device">Layar penuh / Limit device</option>
                  <option value="Profil terhapus / PIN berubah">Profil terhapus / PIN berubah</option>
                  <option value="Kendala lainnya">Kendala lainnya</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Akun Pengganti Baru</label>
                  {(vaultReadyCounts[targetSaleForWarranty.variantId] || 0) > 0 && (
                    <button
                      type="button"
                      onClick={handlePickVaultForWarranty}
                      className="text-xs font-black text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Ambil dari Gudang ({vaultReadyCounts[targetSaleForWarranty.variantId]})</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="email@gmail.com:passBaru:Profil 1:1234"
                  value={warrantyForm.newAccount}
                  onChange={(e) => setWarrantyForm({ ...warrantyForm, newAccount: e.target.value })}
                  required
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-mono font-bold focus:outline-none focus:bg-yellow-50 transition"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Catatan Internal</label>
                <input
                  type="text"
                  placeholder="Misal: komplain jam 10 pagi, diganti akun batch baru"
                  value={warrantyForm.notes}
                  onChange={(e) => setWarrantyForm({ ...warrantyForm, notes: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-bold focus:outline-none focus:bg-yellow-50 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setWarrantyModalOpen(false)}
                  className="neo-btn px-4 py-2 rounded-xl text-xs font-black text-black bg-zinc-100 hover:bg-zinc-200 border-2 border-black shadow-[2px_2px_0_#000] uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="neo-btn px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black border-2 border-black shadow-[3px_3px_0_#000] uppercase tracking-wide"
                >
                  Konfirmasi Penggantian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: EDIT HARGA & SUPPLIER                                         */}
      {/* ==================================================================== */}
      {editModalOpen && editingVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border-3 border-black rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-[8px_8px_0_#000] my-auto max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-start justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#FFE600] text-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#000]">
                  <Edit3 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-black uppercase tracking-wide">Edit Harga &amp; Supplier</h3>
                  <p className="text-xs text-zinc-600 font-bold mt-0.5">{editingVariant.productName} ({editingVariant.name})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="neo-btn w-8 h-8 rounded-lg bg-white hover:bg-rose-300 border-2 border-black shadow-[2px_2px_0_#000] flex items-center justify-center font-black transition"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditVariant} className="space-y-3.5">
              <div>
                <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Harga Jual (Rp)</label>
                <input
                  type="number"
                  value={editingVariant.price}
                  onChange={(e) => setEditingVariant({ ...editingVariant, price: e.target.value })}
                  required
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-mono font-bold focus:outline-none focus:bg-yellow-50 transition"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Harga Modal (Rp)</label>
                <input
                  type="number"
                  value={editingVariant.costPrice}
                  onChange={(e) => setEditingVariant({ ...editingVariant, costPrice: e.target.value })}
                  required
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-mono font-bold focus:outline-none focus:bg-yellow-50 transition"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Toko / Supplier</label>
                <input
                  type="text"
                  value={editingVariant.supplier}
                  onChange={(e) => setEditingVariant({ ...editingVariant, supplier: e.target.value })}
                  required
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-bold focus:outline-none focus:bg-yellow-50 transition"
                />
                {Array.isArray(editingVariant.supplierOffers) && editingVariant.supplierOffers.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] text-zinc-600 font-black uppercase tracking-wider">Pilih Cepat Toko Kulakan:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editingVariant.supplierOffers.map((o, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditingVariant({ ...editingVariant, supplier: o.supplier, costPrice: o.costPrice })}
                          className={`neo-btn text-xs px-3 py-1.5 rounded-lg border-2 border-black transition shadow-[2px_2px_0_#000] ${
                            editingVariant.supplier?.toLowerCase() === o.supplier?.toLowerCase()
                              ? 'bg-[#FFE600] text-black font-black'
                              : 'bg-white text-black hover:bg-yellow-50 font-bold'
                          }`}
                        >
                          {o.supplier} (Rp{Number(o.costPrice).toLocaleString('id-ID')})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="neo-btn px-4 py-2 rounded-xl text-xs font-black text-black bg-zinc-100 hover:bg-zinc-200 border-2 border-black shadow-[2px_2px_0_#000] uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="neo-btn px-4 py-2 rounded-xl bg-[#FFE600] hover:bg-[#ffea33] text-black text-xs font-black border-2 border-black shadow-[3px_3px_0_#000] uppercase tracking-wide"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: TAMBAH PENAWARAN TOKO                                         */}
      {/* ==================================================================== */}
      {supplierModalOpen && supplierTargetVar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border-3 border-black rounded-2xl w-full max-w-xl p-5 sm:p-6 space-y-4 shadow-[8px_8px_0_#000] my-auto max-h-[92vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="flex items-start justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-sky-300 text-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#000]">
                  <Store className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-black uppercase tracking-wide">
                    Daftar Toko Supplier &amp; Perbandingan Modal
                  </h3>
                  <p className="text-xs text-zinc-600 font-bold mt-0.5">
                    Varian: <strong className="text-black">{supplierTargetVar.productName ? `${supplierTargetVar.productName} - ` : ''}{supplierTargetVar.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSupplierModalOpen(false);
                  setShowAddSupplierForm(false);
                }}
                className="neo-btn w-8 h-8 rounded-lg bg-white hover:bg-rose-300 border-2 border-black shadow-[2px_2px_0_#000] flex items-center justify-center font-black transition cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Kartu Ringkasan Harga Jual & Batas Aman */}
            {(() => {
              const offers = Array.isArray(supplierTargetVar.supplierOffers) && supplierTargetVar.supplierOffers.length > 0
                ? [...supplierTargetVar.supplierOffers].sort((a, b) => (a.costPrice || 0) - (b.costPrice || 0))
                : [{ supplier: supplierTargetVar.supplier || 'heavenprem', costPrice: supplierTargetVar.costPrice || 0, isAvailable: supplierTargetVar.isAvailable !== false }];

              const minCost = offers[0].costPrice;
              const maxCost = offers[offers.length - 1].costPrice;
              const currentProfit = (supplierTargetVar.price || 0) - (supplierTargetVar.costPrice || 0);

              return (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-[#fafaf7] rounded-xl border-2 border-black shadow-[2px_2px_0_#000] text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-600 font-black uppercase block">Harga Jual D-Store</span>
                      <span className="text-sm font-black text-black">{formatRupiah(supplierTargetVar.price)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-600 font-black uppercase block">Modal Aktif ({supplierTargetVar.supplier})</span>
                      <span className="text-sm font-black text-emerald-800">{formatRupiah(supplierTargetVar.costPrice)} (+{formatRupiah(currentProfit)})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-600 font-black uppercase block">Batas Aman (Termahal)</span>
                      <span className="text-sm font-black text-rose-800">{formatRupiah(maxCost)}</span>
                    </div>
                  </div>

                  {/* List Toko Supplier */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-black">
                      <span>Pilihan Tempat Kulakan ({offers.length} Toko)</span>
                      <span className="text-[10px] text-zinc-500 font-bold lowercase">urut modal termurah</span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {offers.map((offer, idx) => {
                        const isCheapest = offer.costPrice === minCost;
                        const isHighest = offers.length > 1 && offer.costPrice === maxCost;
                        const isCurrentActive = supplierTargetVar.supplier?.toLowerCase() === offer.supplier?.toLowerCase();
                        const profit = (supplierTargetVar.price || 0) - (offer.costPrice || 0);
                        const suppInfo = getSupplierLinkInfo(offer.supplier, offer.contact);

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border-2 border-black transition ${
                              isCurrentActive
                                ? 'bg-yellow-50 shadow-[3px_3px_0_#000]'
                                : 'bg-white shadow-[2px_2px_0_#000]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                  <span className="font-black text-xs text-black">
                                    #{idx + 1} {offer.supplier}
                                  </span>
                                  {isCheapest && (
                                    <span className="text-[9px] px-1.5 py-0.2 bg-[#FFE600] text-black border border-black font-black uppercase">
                                      Termurah (Rekomendasi)
                                    </span>
                                  )}
                                  {isHighest && !isCheapest && (
                                    <span className="text-[9px] px-1.5 py-0.2 bg-rose-200 text-black border border-black font-black uppercase">
                                      Batas Aman Termahal
                                    </span>
                                  )}
                                  {isCurrentActive && (
                                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-300 text-black border border-black font-black uppercase">
                                      Aktif Digunakan
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-x-3 gap-y-1 text-xs font-bold text-zinc-700 flex-wrap">
                                  <span>Modal: <b className="text-black font-black">{formatRupiah(offer.costPrice)}</b></span>
                                  <span className="text-emerald-800 font-black">Untung: +{formatRupiah(profit)}</span>
                                  <span className={`text-[10px] px-1.5 py-0.2 border border-black font-bold uppercase ${offer.isAvailable !== false ? 'bg-emerald-100 text-emerald-950' : 'bg-rose-100 text-rose-950'}`}>
                                    {offer.isAvailable !== false ? 'Ready' : 'Kosong'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 pt-1 sm:pt-0">
                                {suppInfo.url && suppInfo.url !== '#' && (
                                  <a
                                    href={suppInfo.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="neo-btn text-[10px] font-black px-2 py-1.5 bg-white hover:bg-yellow-200 text-black border-2 border-black shadow-[1.5px_1.5px_0_#000] uppercase"
                                    title={`Buka Chat / Kontak Toko ${offer.supplier}`}
                                  >
                                    Chat Toko
                                  </a>
                                )}
                                {!isCurrentActive && (
                                  <button
                                    type="button"
                                    onClick={() => handleSelectSupplier(supplierTargetVar.id, offer.supplier)}
                                    className="neo-btn text-[10px] font-black px-2.5 py-1.5 bg-[#FFE600] hover:bg-yellow-300 text-black border-2 border-black shadow-[1.5px_1.5px_0_#000] uppercase cursor-pointer"
                                    title="Ganti kulakan varian ini ke toko ini"
                                  >
                                    Pilih Toko Ini
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Toggle Form Tambah Penawaran Toko Baru */}
            <div className="pt-2 border-t-2 border-black">
              <button
                type="button"
                onClick={() => setShowAddSupplierForm(!showAddSupplierForm)}
                className="text-xs font-black text-black hover:underline flex items-center gap-1.5 uppercase cursor-pointer"
              >
                <span>{showAddSupplierForm ? 'Tutup Formulir Tambah Toko' : '+ Tambah Opsi Toko Lain untuk Varian Ini'}</span>
              </button>

              {showAddSupplierForm && (
                <form onSubmit={handleSaveSupplierOffer} className="space-y-3 pt-3 mt-2 border-t border-zinc-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-zinc-700 font-black uppercase tracking-wider block">Nama Toko Supplier</label>
                      <input
                        type="text"
                        placeholder="Nama Toko / Bot"
                        value={newSupplierForm.supplier}
                        onChange={(e) => setNewSupplierForm({ ...newSupplierForm, supplier: e.target.value })}
                        required
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-white border-2 border-black text-xs text-black font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-700 font-black uppercase tracking-wider block">Harga Modal (Rp)</label>
                      <input
                        type="number"
                        placeholder="Contoh: 1500"
                        value={newSupplierForm.costPrice}
                        onChange={(e) => setNewSupplierForm({ ...newSupplierForm, costPrice: e.target.value })}
                        required
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-white border-2 border-black text-xs text-black font-mono font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-700 font-black uppercase tracking-wider block">Kontak / Link Chat (Opsional)</label>
                    <input
                      type="text"
                      placeholder="@bot_telegram atau nomor WA 08..."
                      value={newSupplierForm.contact}
                      onChange={(e) => setNewSupplierForm({ ...newSupplierForm, contact: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-white border-2 border-black text-xs text-black font-bold outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="suppAvailModal"
                      checked={newSupplierForm.isAvailable}
                      onChange={(e) => setNewSupplierForm({ ...newSupplierForm, isAvailable: e.target.checked })}
                      className="w-4 h-4 rounded border-2 border-black text-[#FFE600] focus:ring-0"
                    />
                    <label htmlFor="suppAvailModal" className="text-xs text-black font-bold cursor-pointer select-none">
                      Stok di toko baru ini sedang READY
                    </label>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="neo-btn px-4 py-2 rounded-xl bg-[#FFE600] hover:bg-yellow-300 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase"
                    >
                      Simpan Toko ke Varian
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: TAMBAH PRODUK BARU                                            */}
      {/* ==================================================================== */}
      {addProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border-3 border-black rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-[8px_8px_0_#000] my-auto max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-start justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-emerald-300 text-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#000]">
                  <PlusCircle className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-black uppercase tracking-wide">Tambah Produk Baru</h3>
                  <p className="text-xs text-zinc-600 font-bold mt-0.5">Daftarkan item baru ke katalog toko &amp; spreadsheet</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddProductModalOpen(false)}
                className="neo-btn w-8 h-8 rounded-lg bg-white hover:bg-rose-300 border-2 border-black shadow-[2px_2px_0_#000] flex items-center justify-center font-black transition"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3.5">
              <div>
                <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Nama Produk</label>
                <input
                  type="text"
                  placeholder="Misal: Netflix Premium 4K"
                  value={newProdForm.productName}
                  onChange={(e) => setNewProdForm({ ...newProdForm, productName: e.target.value })}
                  required
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-bold focus:outline-none focus:bg-yellow-50 transition"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Kategori</label>
                <input
                  type="text"
                  placeholder="AI Tools, Streaming, Design"
                  value={newProdForm.categoryName}
                  onChange={(e) => setNewProdForm({ ...newProdForm, categoryName: e.target.value })}
                  required
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-bold focus:outline-none focus:bg-yellow-50 transition"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Nama Varian Paket</label>
                <input
                  type="text"
                  placeholder="Misal: 1m - Shared"
                  value={newProdForm.variantName}
                  onChange={(e) => setNewProdForm({ ...newProdForm, variantName: e.target.value })}
                  required
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-bold focus:outline-none focus:bg-yellow-50 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={newProdForm.sellingPrice}
                    onChange={(e) => setNewProdForm({ ...newProdForm, sellingPrice: e.target.value })}
                    required
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-mono font-bold focus:outline-none focus:bg-yellow-50 transition"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Harga Modal (Rp)</label>
                  <input
                    type="number"
                    placeholder="20000"
                    value={newProdForm.costPrice}
                    onChange={(e) => setNewProdForm({ ...newProdForm, costPrice: e.target.value })}
                    required
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-mono font-bold focus:outline-none focus:bg-yellow-50 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">Toko / Supplier Asal</label>
                <input
                  type="text"
                  placeholder="heavenprem / Toko A"
                  value={newProdForm.supplier}
                  onChange={(e) => setNewProdForm({ ...newProdForm, supplier: e.target.value })}
                  required
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-bold focus:outline-none focus:bg-yellow-50 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setAddProductModalOpen(false)}
                  className="neo-btn px-4 py-2 rounded-xl text-xs font-black text-black bg-zinc-100 hover:bg-zinc-200 border-2 border-black shadow-[2px_2px_0_#000] uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="neo-btn px-4 py-2 rounded-xl bg-[#FFE600] hover:bg-[#ffea33] text-black text-xs font-black border-2 border-black shadow-[3px_3px_0_#000] uppercase tracking-wide"
                >
                  Tambah ke Katalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: PENGATURAN LINK GOOGLE SPREADSHEET                            */}
      {/* ==================================================================== */}
      {showSheetUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border-3 border-black rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-[8px_8px_0_#000] my-auto max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-emerald-300 text-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#000]">
                  <FileSpreadsheet className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-black uppercase tracking-wide">Link Google Spreadsheet</h3>
                  <p className="text-xs text-zinc-600 font-bold mt-0.5">Tautan file dokumen spreadsheet cloud D Store</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSheetUrlModal(false)}
                className="neo-btn w-8 h-8 rounded-lg bg-white hover:bg-rose-300 border-2 border-black shadow-[2px_2px_0_#000] flex items-center justify-center font-black transition"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSheetUrl} className="space-y-3.5">
              <div>
                <label className="text-xs text-zinc-700 font-black uppercase tracking-wider">URL File Google Spreadsheet</label>
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/1.../edit"
                  value={tempSheetUrl}
                  onChange={(e) => setTempSheetUrl(e.target.value)}
                  required
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black font-mono font-bold focus:outline-none focus:bg-yellow-50 transition"
                />
                <p className="text-[11px] text-zinc-500 font-bold mt-1.5">
                  Tips: Buka Google Sheet Anda di browser, salin link URL dari address bar, lalu tempel di sini. Tombol &quot;Buka Spreadsheet&quot; akan langsung membuka file ini di tab baru.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setShowSheetUrlModal(false)}
                  className="neo-btn px-4 py-2 rounded-xl text-xs font-black text-black bg-zinc-100 hover:bg-zinc-200 border-2 border-black shadow-[2px_2px_0_#000] uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="neo-btn px-4 py-2 rounded-xl bg-[#FFE600] hover:bg-[#ffea33] text-black text-xs font-black border-2 border-black shadow-[3px_3px_0_#000] uppercase tracking-wide flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Simpan &amp; Buka Tab Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: PANDUAN KATEGORI & GLOSARIUM PAKET                            */}
      {/* ==================================================================== */}
      {glossaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border-3 border-black rounded-2xl w-full max-w-2xl p-5 sm:p-6 space-y-4 shadow-[8px_8px_0_#000] my-auto max-h-[92vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#FFE600] text-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#000]">
                  <Sparkles className="w-4 h-4 text-black" />
                </span>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-black uppercase tracking-wide">
                    Panduan Paket &amp; Kategori Produk D-Store
                  </h3>
                  <p className="text-xs text-zinc-600 font-bold mt-0.5">
                    Penjelasan jenis paket (Canva, Invite, Head Owner, Lifetime) &amp; 7 kategori produk
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGlossaryModalOpen(false)}
                className="neo-btn w-8 h-8 rounded-lg bg-white hover:bg-rose-300 border-2 border-black shadow-[2px_2px_0_#000] flex items-center justify-center font-black transition cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-2 border-b-2 border-black pb-2 text-xs overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setGlossaryTab('canva')}
                className={`neo-btn px-3 py-1.5 font-black uppercase tracking-tight rounded-lg border-2 border-black transition cursor-pointer ${
                  glossaryTab === 'canva' ? 'bg-[#FFE600] text-black shadow-[2px_2px_0_#000]' : 'bg-white text-zinc-700 hover:bg-yellow-50'
                }`}
              >
                Paket Canva Pro
              </button>
              <button
                type="button"
                onClick={() => setGlossaryTab('categories')}
                className={`neo-btn px-3 py-1.5 font-black uppercase tracking-tight rounded-lg border-2 border-black transition cursor-pointer ${
                  glossaryTab === 'categories' ? 'bg-[#FFE600] text-black shadow-[2px_2px_0_#000]' : 'bg-white text-zinc-700 hover:bg-yellow-50'
                }`}
              >
                7 Kategori Produk
              </button>
              <button
                type="button"
                onClick={() => setGlossaryTab('terms')}
                className={`neo-btn px-3 py-1.5 font-black uppercase tracking-tight rounded-lg border-2 border-black transition cursor-pointer ${
                  glossaryTab === 'terms' ? 'bg-[#FFE600] text-black shadow-[2px_2px_0_#000]' : 'bg-white text-zinc-700 hover:bg-yellow-50'
                }`}
              >
                Istilah Akun Digital
              </button>
            </div>

            {/* TAB CONTENT: CANVA */}
            {glossaryTab === 'canva' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-cyan-50 rounded-xl border-2 border-black shadow-[2px_2px_0_#000] space-y-2">
                  <h4 className="font-black text-xs sm:text-sm text-black uppercase flex items-center gap-1.5">
                    <span>Mengapa Banyak Varian di Canva Pro?</span>
                  </h4>
                  <p className="text-xs text-zinc-700 font-medium leading-relaxed">
                    Canva Pro di D-Store memiliki 3 tipe lisensi utama: <b>Invite Member</b> (untuk pengguna individu), <b>Head Owner</b> (untuk admin/reseller yang ingin mengundang tim sendiri), dan <b>Lifetime</b> (akun permanen tanpa iuran bulanan).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0_#000] space-y-1.5">
                    <div className="font-black text-black uppercase flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-black w-fit">
                      Invite Member
                    </div>
                    <p className="text-zinc-600 text-[11px] font-bold leading-snug">
                      Pembeli masuk via email pribadi mereka. Desain &amp; privasi 100% aman terpisah. Paling laris untuk individu/mahasiswa.
                    </p>
                    <div className="text-[10px] font-mono font-bold text-zinc-800 pt-1 border-t border-zinc-200">
                      Tersedia: 1m, 3m, 6m, 1y.
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0_#000] space-y-1.5">
                    <div className="font-black text-black uppercase flex items-center gap-1 text-[11px] text-sky-800 bg-sky-100 px-2 py-0.5 rounded border border-black w-fit">
                      Head Owner (100 User)
                    </div>
                    <p className="text-zinc-600 text-[11px] font-bold leading-snug">
                      Pembeli diberikan akun sebagai <b>Admin/Owner Tim</b>. Bisa mengundang s/d 100 orang teman/klien/reseller sendiri!
                    </p>
                    <div className="text-[10px] font-mono font-bold text-zinc-800 pt-1 border-t border-zinc-200">
                      Tersedia: 1m (Rp 7.000), 3m (Rp 15.000).
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0_#000] space-y-1.5">
                    <div className="font-black text-black uppercase flex items-center gap-1 text-[11px] text-purple-800 bg-purple-100 px-2 py-0.5 rounded border border-black w-fit">
                      Lifetime Permanen
                    </div>
                    <p className="text-zinc-600 text-[11px] font-bold leading-snug">
                      Aktif permanen tanpa biaya langganan bulanan. Pilihan <b>Garansi 1y</b> (diganti jika terputus) &amp; <b>No Garansi</b> (hemat).
                    </p>
                    <div className="text-[10px] font-mono font-bold text-zinc-800 pt-1 border-t border-zinc-200">
                      Garansi 1y: Rp 13.000 • No Garansi: Rp 10.000.
                    </div>
                  </div>
                </div>

                {/* Broadcast Promo Box */}
                <div className="p-3.5 bg-yellow-50 rounded-xl border-2 border-black shadow-[3px_3px_0_#000] space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-black" />
                      <span>Teks Siap Broadcast WhatsApp / Telegram</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(canvaPromoBroadcastText);
                        setCopiedCanvaPromo(true);
                        setTimeout(() => setCopiedCanvaPromo(false), 2000);
                      }}
                      className="neo-btn flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FFE600] hover:bg-[#fff033] text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase cursor-pointer"
                    >
                      {copiedCanvaPromo ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCanvaPromo ? 'Tersalin!' : 'Salin Teks Broadcast'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 bg-white rounded-lg border border-black text-[10.5px] font-mono text-zinc-800 whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                    {canvaPromoBroadcastText}
                  </pre>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-200">
                  <button
                    type="button"
                    onClick={() => {
                      setGlossaryModalOpen(false);
                      handleTabChange('promo_poster');
                      setPosterCategory('cat_3');
                      const cv = products.find(p => p.name.toLowerCase().includes('canva'));
                      if (cv) setPosterProductFilter(cv.id);
                      setPosterColumns('2');
                      setPosterTitle('CANVA PRO PREMIUM - D STORE');
                    }}
                    className="neo-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-fuchsia-300 hover:bg-fuchsia-200 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Buka Studio Poster Promo Canva &rarr;</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CATEGORIES */}
            {glossaryTab === 'categories' && (
              <div className="space-y-3">
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {[
                    { id: 'cat_3', name: 'Graphic, Design & Video', desc: 'Aplikasi desain grafis, editing foto & video.', prods: 'Canva Pro, Capcut, Adobe, Lightroom, Meitu, Alight Motion, VSCO, Remini, Ibis Paint, Picsart, Wink.' },
                    { id: 'cat_2', name: 'Streaming & Entertainment', desc: 'Layanan streaming film, drama Korea/Asia, serial & bioskop online.', prods: 'Netflix, Disney+, YouTube Premium, Prime Video, Vidio, Viu, WeTV, HBO Max, Bstation, IQIYI, Loklok, Catchplay, Apple TV.' },
                    { id: 'cat_4', name: 'Music & Audio', desc: 'Layanan streaming lagu tanpa iklan, kualitas audio HD & offline mode.', prods: 'Spotify Premium, Apple Music, Deezer.' },
                    { id: 'cat_1', name: 'AI Tools & Productivity', desc: 'Model kecerdasan buatan, generator konten & API token untuk developer.', prods: 'ChatGPT Plus, Gemini AI Pro, Quillbot, Promo APIKey (Claude Opus, GPT-5).' },
                    { id: 'cat_5', name: 'Edukasi & Bahasa', desc: 'Aplikasi belajar bahasa, grammar checker & kursus.', prods: 'Duolingo Super, Grammarly Premium, Scribd, Quizlet Teacher, Kahoot, Kilonotes, Ilovepdf, WPS.' },
                    { id: 'cat_6', name: 'VPN & Security', desc: 'Enkripsi internet, proteksi privasi IP & bypass blokir jaringan.', prods: 'Surfshark VPN, ExpressVPN, HMA VPN.' },
                    { id: 'cat_7', name: 'Office, Akun & Tools', desc: 'Paket software kantor, webinar & penyimpanan cloud.', prods: 'Microsoft 365, Zoom Pro, GSuite, Source Code.' }
                  ].map(c => {
                    const cCount = categoryCounts[c.id] || 0;
                    return (
                      <div key={c.id} className="p-3 bg-zinc-50 rounded-xl border-2 border-black shadow-[2px_2px_0_#000] space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-xs text-black uppercase">{c.name}</span>
                          <span className="text-[10px] font-black px-2 py-0.5 bg-yellow-200 border border-black shadow-[1px_1px_0_#000]">
                            {cCount} Produk
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-600 font-bold leading-snug">{c.desc}</p>
                        <p className="text-[10px] text-zinc-800 font-mono pt-1 border-t border-zinc-200">
                          <b>Produk:</b> {c.prods}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setGlossaryModalOpen(false);
                            handleTabChange('catalog');
                            setSelectedCategory(c.id);
                            setSearchQuery('');
                            setSelectedSupplier('all');
                            setStockFilter('all');
                          }}
                          className="mt-1 neo-btn w-full py-1.5 px-3 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-[11px] border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-tight flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Buka Katalog Kategori Ini ({cCount} Produk) &rarr;</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: TERMS */}
            {glossaryTab === 'terms' && (
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1 text-xs">
                {[
                  { term: 'Via Invite / Invite Member', desc: 'Pembeli masuk menggunakan email pribadinya sendiri. Seller mengirimkan link undangan tim resmi. Privasi dan proyek pembeli tidak akan bisa dilihat orang lain.' },
                  { term: 'Head Owner / Admin Tim', desc: 'Pembeli diberikan akun sebagai pemilik/admin tim. Memiliki hak penuh untuk mengundang member lain (biasanya s/d 100 member). Sangat menguntungkan untuk dijual eceran lagi.' },
                  { term: 'Lifetime (Garansi vs No Garansi)', desc: 'Akun aktif permanen tanpa iuran bulanan. Opsi Garansi 1y menjamin penggantian jika terjadi reset tim dari pusat Canva. Opsi No Garansi menawarkan harga paling murah tanpa klaim garansi.' },
                  { term: 'Renew vs No Renew', desc: 'Renew artinya akun bisa diperpanjang terus di tim/akun yang sama setelah masa aktif habis. No Renew artinya setelah durasi habis harus pindah ke tautan tim baru.' },
                  { term: 'Sharing vs Private', desc: 'Sharing adalah 1 akun yang dipakai bersama beberapa pengguna lain dengan harga sangat murah (contoh 1p1u = 1 profile 1 user). Private adalah 1 akun utuh milik pembeli sendiri bebas ganti password.' },
                  { term: 'Famplan, Indplan & Jaspay', desc: 'Famplan = Family Plan (paket keluarga), Indplan = Individual Plan (paket pribadi), Jaspay = Jasa Pembayaran tagihan akun buyer.' }
                ].map((t, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0_#000] space-y-1">
                    <span className="font-black text-xs text-black uppercase block">{t.term}</span>
                    <p className="text-[11px] text-zinc-600 font-bold leading-relaxed">{t.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* NEO-BRUTALIST TOAST NOTIFICATION CONTAINER                          */}
      {/* ==================================================================== */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          let bgClass = 'bg-sky-200';
          let IconComp = Zap;
          if (isSuccess) {
            bgClass = 'bg-emerald-300';
            IconComp = Check;
          } else if (isError) {
            bgClass = 'bg-rose-300';
            IconComp = AlertCircle;
          } else if (isWarning) {
            bgClass = 'bg-[#FFE600]';
            IconComp = ShieldAlert;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border-3 border-black ${bgClass} text-black shadow-[4px_4px_0_#000] transition-all animate-in slide-in-from-top-2 duration-150`}
            >
              <span className="w-6 h-6 rounded-md bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0_#000]">
                <IconComp className="w-3.5 h-3.5 text-black" />
              </span>
              <div className="flex-1 text-xs font-black leading-snug pt-0.5">
                {t.message}
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                className="neo-btn w-6 h-6 rounded-md bg-white hover:bg-black hover:text-white border-2 border-black flex items-center justify-center shrink-0 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* NEO-BRUTALIST CONFIRM DIALOG MODAL                                  */}
      {/* ==================================================================== */}
      {confirmState && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border-3 border-black rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-[8px_8px_0_#000] my-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-rose-400 text-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#000]">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <h3 className="font-black text-sm text-black uppercase tracking-wide">
                  {confirmState.title || 'Konfirmasi Tindakan'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className="neo-btn w-7 h-7 rounded-lg bg-white hover:bg-rose-300 border-2 border-black shadow-[2px_2px_0_#000] flex items-center justify-center font-black transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs font-bold text-zinc-800 leading-relaxed">
              {confirmState.message}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className="neo-btn px-3.5 py-2 rounded-xl text-xs font-black text-black bg-zinc-100 hover:bg-zinc-200 border-2 border-black shadow-[2px_2px_0_#000] uppercase"
              >
                {confirmState.cancelText || 'Batal'}
              </button>
              <button
                type="button"
                onClick={confirmState.onConfirm}
                className="neo-btn px-4 py-2 rounded-xl bg-rose-400 hover:bg-rose-300 text-black text-xs font-black border-2 border-black shadow-[3px_3px_0_#000] uppercase tracking-wide"
              >
                {confirmState.confirmText || 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* POSTER PRODUCT CHECKLIST PICKER MODAL                               */}
      {/* ==================================================================== */}
      {showPosterProductPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#FFE600] border-b-3 border-black flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 bg-black text-yellow-300 border-2 border-black rounded-xl flex items-center justify-center font-black shadow-[2px_2px_0_#000] shrink-0">
                  <ListChecks className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-black">
                    Pilih Produk Poster Promo
                  </h3>
                  <p className="text-[11px] font-bold text-black/80">
                    Centang produk yang ingin kamu sertakan di poster (misal: Canva, Netflix, CapCut doang).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPosterProductPicker(false)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-rose-200 text-black border-2 border-black shadow-[2px_2px_0_#000] flex items-center justify-center font-black transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Toolbar: Search & Category Filter */}
            <div className="p-3 sm:p-4 bg-zinc-50 border-b-2 border-black space-y-2.5 shrink-0">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama produk / varian (misal: Canva, Netflix, CapCut)..."
                    value={posterPickerSearch}
                    onChange={(e) => setPosterPickerSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs font-bold text-black outline-none"
                  />
                  {posterPickerSearch && (
                    <button
                      type="button"
                      onClick={() => setPosterPickerSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-500 hover:text-black"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={posterPickerCategory}
                    onChange={(e) => setPosterPickerCategory(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs font-black text-black outline-none cursor-pointer"
                  >
                    <option value="all">Semua Kategori ({categories.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={posterPickerStockFilter}
                    onChange={(e) => setPosterPickerStockFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_#000] text-xs font-black text-black outline-none cursor-pointer"
                  >
                    <option value="all">Semua Stok</option>
                    <option value="ready">Hanya Ready</option>
                  </select>
                </div>
              </div>

              {/* Bulk Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const currentFilterIds = posterPickerProducts.map((p) => p.id);
                      if (posterSelectedProductIds === null) {
                        // Already all selected
                      } else {
                        const merged = Array.from(new Set([...posterSelectedProductIds, ...currentFilterIds]));
                        setPosterSelectedProductIds(merged.length === products.length ? null : merged);
                      }
                      showToast(`Memilih produk dari filter ini (${posterPickerProducts.length} produk).`, 'info');
                    }}
                    className="px-2.5 py-1 rounded-lg border-2 border-black bg-yellow-200 hover:bg-yellow-300 text-black font-black text-[11px] uppercase shadow-[1.5px_1.5px_0_#000] transition cursor-pointer"
                  >
                    Pilih Yang Tampil ({posterPickerProducts.length})
                  </button>

                  <button
                    type="button"
                    onClick={handleSelectAllPosterProducts}
                    className="px-2.5 py-1 rounded-lg border-2 border-black bg-white hover:bg-yellow-100 text-black font-black text-[11px] uppercase shadow-[1.5px_1.5px_0_#000] transition cursor-pointer"
                  >
                    Pilih Semua Katalog ({products.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const currentFilterIds = posterPickerProducts.map((p) => p.id);
                      if (posterSelectedProductIds === null) {
                        const remaining = products.filter((p) => !currentFilterIds.includes(p.id)).map((p) => p.id);
                        setPosterSelectedProductIds(remaining);
                      } else {
                        setPosterSelectedProductIds(posterSelectedProductIds.filter((id) => !currentFilterIds.includes(id)));
                      }
                      showToast('Membatalkan pilihan produk dari filter ini.', 'info');
                    }}
                    className="px-2.5 py-1 rounded-lg border-2 border-black bg-rose-100 hover:bg-rose-200 text-rose-950 font-black text-[11px] uppercase shadow-[1.5px_1.5px_0_#000] transition cursor-pointer"
                  >
                    Lepas Yang Tampil
                  </button>

                  <button
                    type="button"
                    onClick={handleDeselectAllPosterProducts}
                    className="px-2.5 py-1 rounded-lg border-2 border-black bg-zinc-200 hover:bg-zinc-300 text-zinc-900 font-black text-[11px] uppercase shadow-[1.5px_1.5px_0_#000] transition cursor-pointer"
                  >
                    Kosongkan Semua
                  </button>
                </div>

                <div className="text-[11px] font-black uppercase text-zinc-700 bg-white px-2.5 py-1 rounded-lg border border-black shadow-[1px_1px_0_#000]">
                  {currentPosterSelectedCount} dari {products.length} Terpilih
                </div>
              </div>
            </div>

            {/* Product Cards List (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 bg-[#FFFDF0]/50">
              {posterPickerProducts.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                  <div className="text-sm font-black text-zinc-800 uppercase">Tidak ada produk yang cocok</div>
                  <div className="text-xs font-bold text-zinc-500 mt-1">Coba ganti kata kunci pencarian atau kategori filter</div>
                </div>
              ) : (
                posterPickerProducts.map((p) => {
                  const isSelected = isPosterProductSelected(p.id);
                  const prodVars = variants.filter((v) => v.productId === p.id);
                  const isReady = prodVars.some((v) => v.isAvailable !== false);
                  const minPrice = prodVars.length > 0
                    ? Math.min(...prodVars.map((v) => Number(v.price) || 0))
                    : 0;

                  return (
                    <div
                      key={`pick_adm_${p.id}`}
                      onClick={() => handleTogglePosterProduct(p.id)}
                      className={`p-3 rounded-xl border-2 transition cursor-pointer select-none flex flex-col justify-between ${
                        isSelected
                          ? 'border-black bg-yellow-100/90 shadow-[3px_3px_0_#000]'
                          : 'border-black/30 bg-white hover:border-black hover:bg-yellow-50/50 shadow-[1px_1px_0_#000] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-black text-black text-xs uppercase leading-tight line-clamp-2">
                            {p.name}
                          </div>
                          <div className="shrink-0 mt-0.5">
                            {isSelected ? (
                              <div className="w-5 h-5 bg-black text-[#FFE600] rounded flex items-center justify-center border border-black shadow-[1px_1px_0_#000]">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 bg-white border-2 border-black/50 rounded" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-[9px] font-bold border border-black/30">
                            {categories.find((c) => c.id === p.categoryId)?.name || 'Umum'}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border border-black ${
                              isReady ? 'bg-emerald-200 text-emerald-950' : 'bg-rose-200 text-rose-950'
                            }`}
                          >
                            {isReady ? 'Ready' : 'Habis'}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-500">
                            {prodVars.length} Varian
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t border-black/10 flex items-baseline justify-between">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase">Harga Mulai:</span>
                        <span className="text-xs font-mono font-black text-black">
                          {formatRupiah(getPosterVariantPrice(minPrice))}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-white border-t-3 border-black flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs font-bold text-zinc-700 text-center sm:text-left">
                <span className="font-black text-black text-sm">{currentPosterSelectedCount}</span> produk dipilih. Poster otomatis diperbarui.
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSelectAllPosterProducts}
                  className="flex-1 sm:flex-none neo-btn px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] uppercase tracking-wider cursor-pointer"
                >
                  Reset Semua
                </button>
                <button
                  type="button"
                  onClick={() => setShowPosterProductPicker(false)}
                  className="flex-1 sm:flex-none neo-btn px-5 py-2 rounded-xl bg-[#FFE600] hover:bg-[#ffea33] text-black text-xs font-black border-2 border-black shadow-[3px_3px_0_#000] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Selesai ({currentPosterSelectedCount})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
