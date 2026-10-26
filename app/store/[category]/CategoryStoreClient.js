'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ArrowLeft,
  X,
  SlidersHorizontal,
  Check,
  Zap,
  ShieldCheck,
  MessageCircle,
  Home,
  Package,
  Sparkles,
  Edit3
} from 'lucide-react';
import { resolveCategorySlug } from '@/lib/categories';
import { getAppVariantData } from '@/lib/appVariantsData';
import { 
  ZALORA_PRODUCTS, 
  ZALORA_TOP_TIER_PRODUCTS, 
  ZALORA_JUST_FOR_YOU_PRODUCTS,
  ZALORA_BUBBLES 
} from '@/lib/zaloraMenData';
import AppVariantModal from '@/app/components/AppVariantModal';
import CategoriesModal from '@/app/components/CategoriesModal';
import AdminEditToolbar from '@/app/components/AdminEditToolbar';
import VisualEditModal from '@/app/components/VisualEditModal';

const CATEGORY_TABS = [
  { id: 'all', name: 'Semua App', slug: 'all', href: '/store/all' },
  { id: 'cat_1', name: 'AI & Tools', slug: 'ai-tools', href: '/store/ai-tools' },
  { id: 'cat_2', name: 'Streaming & Film', slug: 'streaming', href: '/store/streaming' },
  { id: 'cat_3', name: 'Desain & Video', slug: 'graphic-design', href: '/store/graphic-design' },
  { id: 'cat_4', name: 'Musik & Audio', slug: 'music-audio', href: '/store/music-audio' },
  { id: 'cat_6', name: 'VPN & Security', slug: 'vpn-security', href: '/store/vpn-security' },
  { id: 'cat_7', name: 'Office & Akun Tools', slug: 'office-tools', href: '/store/office-tools' },
];

export default function CategoryStoreClient({ initialSlug, initialProducts = [], initialVariants = [], initialOverrides = {} }) {
  const router = useRouter();
  const catId = resolveCategorySlug(initialSlug) || 'all';
  const currentCategory = CATEGORY_TABS.find((t) => t.id === catId) || CATEGORY_TABS[0];

  const [liveProducts, setLiveProducts] = useState(initialProducts);
  const [liveVariants, setLiveVariants] = useState(initialVariants);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState('popular');
  const [selectedAppModal, setSelectedAppModal] = useState(null);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Mode Admin Visual Editor State (Hanya aktif jika diakses via route admin/dev)
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [visualEditingItem, setVisualEditingItem] = useState(null);
  const [customOverrides, setCustomOverrides] = useState(() => initialOverrides || {});

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isUrlAdmin = window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/store/dev');
      if (isUrlAdmin) {
        setIsAdminMode(true);
        setIsEditMode(true);
      }
      try {
        const saved = localStorage.getItem('d_store_cat_overrides');
        if (saved) setCustomOverrides(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleSaveVisualItem = async (updated) => {
    const updatedId = updated.id || updated.sku || `prod_${Date.now()}`;
    const finalPrice = Number(updated.price) || 15000;

    // 1. Simpan ke local overrides
    const newOverrides = {
      ...customOverrides,
      [updatedId]: {
        name: updated.name,
        brand: updated.brand,
        image: updated.image,
        price: finalPrice
      }
    };
    setCustomOverrides(newOverrides);
    try {
      localStorage.setItem('d_store_cat_overrides', JSON.stringify(newOverrides));
    } catch (e) {}

    // 2. Update liveProducts
    setLiveProducts((prev) => {
      const idx = prev.findIndex((p) => (p.id === updatedId || p.sku === updatedId));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          name: updated.name || copy[idx].name,
          brand: updated.brand || copy[idx].brand,
          image: updated.image || copy[idx].image,
          price: finalPrice
        };
        return copy;
      } else {
        return [
          {
            id: updatedId,
            name: updated.name || 'Produk Baru',
            brand: updated.brand || currentCategory.name,
            categoryId: catId,
            category: currentCategory.name,
            image: updated.image || null,
            price: finalPrice
          },
          ...prev
        ];
      }
    });

    // 3. Simpan ke database backend
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_product',
          productId: updatedId,
          name: updated.name,
          brand: updated.brand,
          categoryId: catId,
          image: updated.image,
          price: finalPrice
        })
      });
    } catch (err) {}

    setVisualEditingItem(null);
    showToast('Perubahan produk berhasil disimpan!');
  };

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setLiveProducts(data.products || []);
          setLiveVariants(data.variants || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatRupiah = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

  // Helper pencarian gambar bawaan dari katalog utama
  const getProductImage = (prod) => {
    if (!prod) return null;
    if (prod.image) return prod.image;
    if (prod.img) return prod.img;

    const nameLower = ((prod.name || '') + ' ' + (prod.brand || '')).toLowerCase();

    // 1. Cek dari liveProducts database
    const dbMatch = (liveProducts || []).find((p) => {
      if (!p.image) return false;
      const pName = (p.name || '').toLowerCase();
      const pBrand = (p.brand || '').toLowerCase();
      return (pBrand && nameLower.includes(pBrand)) || (pName && (nameLower.includes(pName.slice(0, 7)) || pName.includes(nameLower.slice(0, 7))));
    });
    if (dbMatch?.image) return dbMatch.image;

    // 2. Cek dari template map
    const templateMap = {
    "gmail": "/uploads/edit_template_colors__75_-1792068727340.webp",
    "outlook": "/uploads/edit_template_colors__76_-1792068859070.webp",
    "canva": "/uploads/edit_template_colors__47_-1792066001271.webp",
    "alight motion": "/uploads/edit_template_colors__52_-1792066524775.webp",
    "alight": "/uploads/edit_template_colors__52_-1792066524775.webp",
    "meitu 7d vip": "/uploads/edit_template_colors__54_-1792066644151.webp",
    "meitu": "/uploads/edit_template_colors__54_-1792066644151.webp",
    "wink  7d vip+": "/uploads/edit_template_colors__55_-1792066715723.webp",
    "wink": "/uploads/edit_template_colors__55_-1792066715723.webp",
    "surfshark": "/uploads/edit_template_colors__68_-1792068248607.webp",
    "promo apikey": "/uploads/edit_template_colors__20_-1792037811676.webp",
    "promo": "/uploads/edit_template_colors__20_-1792037811676.webp",
    "gsuite": "/uploads/edit_template_colors__77_-1792068950260.webp",
    "source code": "/uploads/edit_template_colors__78_-1792069028787.webp",
    "source": "/uploads/edit_template_colors__78_-1792069028787.webp",
    "zoom": "/uploads/edit_template_colors__72_-1792068539269.webp",
    "gemini": "/uploads/desain_tanpa_judul__4_-1791989747452.webp",
    "aifiesta ai": "/uploads/desain_tanpa_judul__6_-1791990257626.webp",
    "aifiesta": "/uploads/desain_tanpa_judul__6_-1791990257626.webp",
    "apple music": "/uploads/edit_template_colors__67_-1792068132937.webp",
    "apple": "/uploads/edit_template_colors__67_-1792068132937.webp",
    "capcut": "/uploads/edit_template_colors__48_-1792066089965.webp",
    "captions ai": "/uploads/desain_tanpa_judul__7_-1791990518505.webp",
    "captions": "/uploads/desain_tanpa_judul__7_-1791990518505.webp",
    "chatgpt": "/uploads/chatgpt1-1791989318192.webp",
    "clico ai": "/uploads/desain_tanpa_judul__8_-1791990706984.webp",
    "clico": "/uploads/desain_tanpa_judul__8_-1791990706984.webp",
    "domo ai": "/uploads/desain_tanpa_judul__9_-1791990924746.webp",
    "domo": "/uploads/desain_tanpa_judul__9_-1791990924746.webp",
    "duolingo": "/uploads/edit_template_colors__73_-1792068583257.webp",
    "flux ai": "/uploads/edit_template_colors__79_-1792069102452.webp",
    "flux": "/uploads/edit_template_colors__79_-1792069102452.webp",
    "flora ai": "/uploads/edit_template_colors-1791991281334.webp",
    "flora": "/uploads/edit_template_colors-1791991281334.webp",
    "framer ai": "/uploads/edit_template_colors__1_-1791991369207.webp",
    "framer": "/uploads/edit_template_colors__1_-1791991369207.webp",
    "genmotions ai": "/uploads/edit_template_colors__2_-1791991724320.webp",
    "genmotions": "/uploads/edit_template_colors__2_-1791991724320.webp",
    "getcontac premium": "/uploads/edit_template_colors__80_-1792069161458.webp",
    "getcontac": "/uploads/edit_template_colors__80_-1792069161458.webp",
    "google colab": "/uploads/desain_tanpa_judul__5_-1791989816103.webp",
    "google": "/uploads/desain_tanpa_judul__5_-1791989816103.webp",
    "hailuo ai": "/uploads/edit_template_colors__3_-1791991855073.webp",
    "hailuo": "/uploads/edit_template_colors__3_-1791991855073.webp",
    "hyperwrite ai": "/uploads/edit_template_colors__4_-1791991938278.webp",
    "hyperwrite": "/uploads/edit_template_colors__4_-1791991938278.webp",
    "kapwing ai": "/uploads/edit_template_colors__5_-1791992099472.webp",
    "kapwing": "/uploads/edit_template_colors__5_-1791992099472.webp",
    "kalodata": "/uploads/edit_template_colors__81_-1792069253804.webp",
    "magic patterns ai": "/uploads/edit_template_colors__82_-1792069377286.webp",
    "magic": "/uploads/edit_template_colors__82_-1792069377286.webp",
    "magichlight ai": "/uploads/edit_template_colors__7_-1791992213848.webp",
    "magichlight": "/uploads/edit_template_colors__7_-1791992213848.webp",
    "mootion ai": "/uploads/edit_template_colors__8_-1791992441731.webp",
    "mootion": "/uploads/edit_template_colors__8_-1791992441731.webp",
    "morphic ai": "/uploads/edit_template_colors__9_-1791992805695.webp",
    "morphic": "/uploads/edit_template_colors__9_-1791992805695.webp",
    "myclaw ai": "/uploads/edit_template_colors__83_-1792069440814.webp",
    "myclaw": "/uploads/edit_template_colors__83_-1792069440814.webp",
    "oneover ai": "/uploads/edit_template_colors__10_-1791992914778.webp",
    "oneover": "/uploads/edit_template_colors__10_-1791992914778.webp",
    "recraft ai": "/uploads/edit_template_colors__11_-1792036444809.webp",
    "recraft": "/uploads/edit_template_colors__11_-1792036444809.webp",
    "reve ai": "/uploads/edit_template_colors__12_-1792036724518.webp",
    "reve": "/uploads/edit_template_colors__12_-1792036724518.webp",
    "scispace ai": "/uploads/edit_template_colors__13_-1792036799194.webp",
    "scispace": "/uploads/edit_template_colors__13_-1792036799194.webp",
    "supercool ai": "/uploads/edit_template_colors__14_-1792036875665.webp",
    "supercool": "/uploads/edit_template_colors__14_-1792036875665.webp",
    "viggle ai": "/uploads/edit_template_colors__15_-1792036957887.webp",
    "viggle": "/uploads/edit_template_colors__15_-1792036957887.webp",
    "viu": "/uploads/edit_template_colors__33_-1792039419700.webp",
    "express vpn": "/uploads/edit_template_colors__69_-1792068301151.webp",
    "express": "/uploads/edit_template_colors__69_-1792068301151.webp",
    "wayin ai": "/uploads/edit_template_colors__16_-1792037013798.webp",
    "wayin": "/uploads/edit_template_colors__16_-1792037013798.webp",
    "weshsop ai": "/uploads/images__16_-1792069554197.webp",
    "weshsop": "/uploads/images__16_-1792069554197.webp",
    "youmind ai": "/uploads/edit_template_colors__17_-1792037090394.webp",
    "youmind": "/uploads/edit_template_colors__17_-1792037090394.webp",
    "cuty ai": "/uploads/edit_template_colors__18_-1792037156723.webp",
    "cuty": "/uploads/edit_template_colors__18_-1792037156723.webp",
    "adobe": "/uploads/edit_template_colors__56_-1792066820530.webp",
    "hbo max": "/uploads/edit_template_colors__25_-1792038428121.webp",
    "hbo": "/uploads/edit_template_colors__25_-1792038428121.webp",
    "netflix": "/uploads/edit_template_colors__21_-1792038128249.webp",
    "picsart": "/uploads/edit_template_colors__49_-1792066147591.webp",
    "prime video": "/uploads/edit_template_colors__24_-1792038375667.webp",
    "amazon": "/uploads/edit_template_colors__24_-1792038375667.webp",
    "spotify": "/uploads/edit_template_colors__65_-1792067965755.webp",
    "deezer": "/uploads/edit_template_colors__66_-1792068080894.webp",
    "youtube": "/uploads/edit_template_colors__22_-1792038177853.webp",
    "disney+": "/uploads/edit_template_colors__23_-1792038286242.webp",
    "iqiyi": "/uploads/edit_template_colors__27_-1792038629652.webp",
    "youku": "/uploads/edit_template_colors__28_-1792038741633.webp",
    "bstation": "/uploads/edit_template_colors__34_-1792039470941.webp",
    "wetv": "/uploads/edit_template_colors__35_-1792039527109.webp",
    "moviebox": "/uploads/edit_template_colors__36_-1792039736084.webp",
    "loklok": "/uploads/edit_template_colors__32_-1792039158451.webp",
    "drakor.id": "/uploads/edit_template_colors__37_-1792039957544.webp",
    "catchplay": "/uploads/edit_template_colors__30_-1792038902672.webp",
    "catchplay+": "/uploads/edit_template_colors__30_-1792038902672.webp",
    "dramabox": "/uploads/edit_template_colors__31_-1792039016698.webp",
    "melolo": "/uploads/edit_template_colors__38_-1792040024585.webp",
    "wibuku": "/uploads/edit_template_colors__39_-1792040088913.webp",
    "viki rakuten": "/uploads/edit_template_colors__40_-1792040238043.webp",
    "viki": "/uploads/edit_template_colors__40_-1792040238043.webp",
    "vidio": "/uploads/edit_template_colors__41_-1792040316523.webp",
    "vision+": "/uploads/edit_template_colors__42_-1792040383050.webp",
    "apple tv": "/uploads/edit_template_colors__26_-1792038562452.webp",
    "mubi": "/uploads/edit_template_colors__43_-1792040440193.webp",
    "mangotv": "/uploads/edit_template_colors__44_-1792065658421.webp",
    "iflix": "/uploads/edit_template_colors__45_-1792065737722.webp",
    "crunchyroll": "/uploads/edit_template_colors__29_-1792038800627.webp",
    "remini": "/uploads/edit_template_colors__57_-1792066910525.webp",
    "ibis paint": "/uploads/edit_template_colors__50_-1792066232833.webp",
    "ibis": "/uploads/edit_template_colors__50_-1792066232833.webp",
    "snow": "/uploads/edit_template_colors__59_-1792067201074.webp",
    "epik": "/uploads/edit_template_colors__60_-1792067253593.webp",
    "vsco": "/uploads/edit_template_colors__51_-1792066453948.webp",
    "scrl": "/uploads/edit_template_colors__61_-1792067395518.webp",
    "polar studio": "/uploads/edit_template_colors__62_-1792067571099.webp",
    "polar": "/uploads/edit_template_colors__62_-1792067571099.webp",
    "dazzcam": "/uploads/edit_template_colors__63_-1792067672068.webp",
    "lightroom": "/uploads/edit_template_colors__64_-1792067721209.webp",
    "grammarly": "/uploads/desain_tanpa_judul__3_-1791989707474.webp",
    "microsoft 365": "/uploads/edit_template_colors__71_-1792068481250.webp",
    "microsoft": "/uploads/edit_template_colors__71_-1792068481250.webp",
    "scribd": "/uploads/edit_template_colors__74_-1792068638593.webp",
    "ilovepdf": "/uploads/edit_template_colors__84_-1792069628302.webp",
    "wps": "/uploads/edit_template_colors__85_-1792070896245.webp",
    "hma vpn": "/uploads/edit_template_colors__70_-1792068346360.webp",
    "hma": "/uploads/edit_template_colors__70_-1792068346360.webp",
    "gagaoolala": "/uploads/edit_template_colors__46_-1792065933979.webp",
    "google pro": "/uploads/edit_template_colors__86_-1792070999941.webp",
    "seedance ai": "/uploads/edit_template_colors__19_-1792037322132.webp",
    "seedance": "/uploads/edit_template_colors__19_-1792037322132.webp",
    "perplexity": "/uploads/perplexity-ai-icon-black-logo-png_seeklogo-611679-1791989517364.webp"
};

    for (const [key, pth] of Object.entries(templateMap)) {
      if (nameLower.includes(key)) return pth;
    }

    const matchTop = (ZALORA_TOP_TIER_PRODUCTS || []).find((t) =>
      t.image && ((t.name && t.name.toLowerCase().includes(nameLower)) || (t.brand && nameLower.includes(t.brand.toLowerCase())))
    );
    if (matchTop?.image) return matchTop.image;

    const matchJfu = (ZALORA_JUST_FOR_YOU_PRODUCTS || []).find((j) =>
      j.image && ((j.name && j.name.toLowerCase().includes(nameLower)) || (j.brand && nameLower.includes(j.brand.toLowerCase())))
    );
    if (matchJfu?.image) return matchJfu.image;

    return null;
  };

  // Filter & Urutkan Produk Sesuai Kategori
  const filteredProducts = useMemo(() => {
    // 1. Kurasi produk unggulan berdasarkan kategori
    const CURATED_CATEGORY_PATTERNS = {
      cat_1: [/\bperplexity\b/i, /\bcolab\b/i, /\bgrammarly\b/i, /\bchatgpt\b/i, /\bgemini\b/i],
      cat_2: [/\bnetflix\b/i, /\byoutube\b/i, /\bdisney/i, /\bprime video\b/i, /\bhbo\b/i, /\bapple tv\b/i, /\biqiyi\b/i, /\byouku\b/i, /\bcrunchyroll\b/i, /\bcatchplay\b/i, /\bdramabox\b/i, /\bloklok\b/i],
      cat_3: [/\bcanva\b/i, /\bcapcut\b/i, /\bpicsart\b/i, /\bibis\b/i, /\bvsco\b/i],
      cat_4: [/\bspotify\b/i, /\bdeezer\b/i, /\bapple music\b/i],
      cat_6: [/\bsurfshark\b/i, /\bexpress\s?vpn\b/i],
      cat_7: [/\bmicrosoft\b/i, /\bzoom\b/i, /\bduolingo\b/i, /\bscribd\b/i, /\bgmail\b/i]
    };

    const isAll = catId === 'all';
    const patterns = isAll
      ? Object.values(CURATED_CATEGORY_PATTERNS).flat()
      : (CURATED_CATEGORY_PATTERNS[catId] || []);
    const allCuratedSources = [...(ZALORA_TOP_TIER_PRODUCTS || []), ...(ZALORA_JUST_FOR_YOU_PRODUCTS || [])];
    const curatedMatches = allCuratedSources.filter((p) => {
      const txt = ((p.name || '') + ' ' + (p.brand || ''));
      return patterns.some((regex) => regex.test(txt));
    });

    // 2. Ambil produk dari database lokal/live
    const dbCategoryProducts = isAll
      ? liveProducts
      : liveProducts.filter((p) => p.categoryId === catId);

    // 3. Gabungkan dan deduplikasi
    const combined = [];
    const seenNames = new Set();

    // Prioritaskan flagship curated products
    for (const item of curatedMatches) {
      const cleanName = (item.name || '').toLowerCase();
      const cleanBrand = (item.brand || '').toLowerCase();
      // Cari padanan di liveProducts untuk mengambil ID & variants asli jika ada
      const dbMatch = liveProducts.find((p) => {
        const pName = (p.name || '').toLowerCase();
        const pBrand = (p.brand || '').toLowerCase();
        return (cleanBrand && pBrand === cleanBrand) || pName.includes(cleanName.slice(0, 7)) || cleanName.includes(pName.slice(0, 7));
      });

      const key = (item.brand || item.name || '').toLowerCase();
      if (!seenNames.has(key)) {
        seenNames.add(key);
        const resolvedImg = dbMatch?.image || item.image || getProductImage({ name: item.name, brand: item.brand });
        combined.push({
          id: dbMatch?.id || item.sku || `curated-${key}`,
          name: dbMatch?.name || item.name,
          brand: dbMatch?.brand || item.brand,
          description: dbMatch?.description || item.description || item.brand || 'Akun Lisensi Resmi D Store',
          image: resolvedImg,
          isCurated: true
        });
      }
    }

    // Tambahkan produk database yang belum ada di daftar
    for (const dbProd of dbCategoryProducts) {
      const pNameLower = (dbProd.name || '').toLowerCase();
      const isAlreadyIncluded = Array.from(seenNames).some((key) => pNameLower.includes(key) || key.includes(pNameLower));
      if (!isAlreadyIncluded) {
        seenNames.add(pNameLower);
        combined.push({
          ...dbProd,
          image: dbProd.image || getProductImage(dbProd)
        });
      }
    }

    // Bila promo technical SKU seperti PROMO APIKEY ada di daftar, pindahkan ke belakang
    combined.sort((a, b) => {
      const aIsApiKey = (a.name || '').toLowerCase().includes('apikey');
      const bIsApiKey = (b.name || '').toLowerCase().includes('apikey');
      if (aIsApiKey && !bIsApiKey) return 1;
      if (!aIsApiKey && bIsApiKey) return -1;
      return 0;
    });

    let list = combined;

    // Filter pencarian teks
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }

    // Hitung harga terendah dan varian
    const enriched = list.map((prod) => {
      const vars = liveVariants.filter((v) => v.productId === prod.id);
      const validPrices = vars.map((v) => Number(v.price) || 0).filter((p) => p > 0);
      const baseMinPrice = validPrices.length > 0 ? Math.min(...validPrices) : (Number(prod.price) || 15000);

      const ov = customOverrides[prod.id];
      const finalImage = ov?.image || prod.image || getProductImage(prod);
      const finalName = ov?.name || prod.name;
      const finalBrand = ov?.brand || prod.brand;
      const finalMinPrice = ov?.price ? Number(ov.price) : baseMinPrice;
      const originalPrice = Math.round(finalMinPrice * 1.5);

      return {
        ...prod,
        name: finalName,
        brand: finalBrand,
        image: finalImage,
        variantCount: vars.length,
        minPrice: finalMinPrice,
        originalPrice
      };
    });

    // Urutkan
    if (activeSort === 'price-asc') {
      enriched.sort((a, b) => a.minPrice - b.minPrice);
    } else if (activeSort === 'price-desc') {
      enriched.sort((a, b) => b.minPrice - a.minPrice);
    } else if (activeSort === 'name') {
      enriched.sort((a, b) => a.name.localeCompare(b.name));
    }

    return enriched;
  }, [liveProducts, liveVariants, catId, searchQuery, activeSort, customOverrides]);

  const handleProductClick = (prod) => {
    const app = getAppVariantData(prod, liveProducts, liveVariants);
    if (app) {
      setSelectedAppModal(app);
    } else {
      setSelectedAppModal({
        name: prod.name,
        brand: prod.brand || prod.name,
        slug: (prod.name || 'app').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: currentCategory.name,
        tagline: prod.description || 'Akun Lisensi Resmi & Bergaransi D Store',
        description: prod.description || 'Layanan resmi D Store dengan aktivasi cepat dan garansi penuh.',
        rating: 4.9,
        soldCount: '300+',
        packages: [
          {
            id: `${prod.id}-std`,
            name: `${prod.name} Standar`,
            duration: '30 Hari',
            price: prod.minPrice || 15000,
            originalPrice: prod.originalPrice || 25000,
            discount: '40% OFF',
            badge: 'BEST SELLER',
            popular: true,
            desc: prod.description || 'Paket resmi bergaransi siap pakai.'
          }
        ]
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFB] text-[#262626] font-sans antialiased selection:bg-black selection:text-white">
      
      {/* Toast Notifikasi Minimalis */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#262626] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-zinc-700 animate-fade-in flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Visual Live Editor Toolbar */}
      {isAdminMode && (
        <AdminEditToolbar
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          onAddNewProduct={() => {
            setVisualEditingItem({
              type: 'new-product',
              id: 'new-' + Date.now(),
              name: '',
              brand: currentCategory.name,
              category: currentCategory.name,
              categoryId: catId,
              price: 15000,
              image: '',
              recommendation: {
                dimensions: '600 x 800 px (Rasio 3:4 Portrait)',
                aspectRatio: '3:4',
                tips: 'Poster vertikal produk aplikasi D Store.'
              }
            });
          }}
          onResetData={() => {
            if (confirm('Reset custom override tampilan kategori ini?')) {
              localStorage.removeItem('d_store_cat_overrides');
              setCustomOverrides({});
              showToast('Override visual dikembalikan ke default');
            }
          }}
        />
      )}

      {/* 1. TOP UTILITY ANNOUNCEMENT BAR (Persis Halaman Utama) */}
      <div className="hidden md:block bg-[#F8F8F8] text-[#555555] text-[11px] py-1.5 px-4 border-b border-[#EAEAEA]">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
            <span className="flex items-center gap-1">
              <span className="text-[#888]">↺</span> Layanan Aktif 24 Jam | S&amp;K Berlaku &gt;
            </span>
            <span className="flex items-center gap-1 font-semibold text-black">
              <span className="bg-black text-white text-[9px] px-1.5 py-0.2 rounded font-bold">VIP</span>
              D STORE VIP: Diskon Tambahan Khusus Reseller Terdaftar &gt;
            </span>
            <span className="hidden lg:inline-flex items-center gap-1 text-[#555]">
              ✓ 100% Akun Legal &amp; Terverifikasi
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-[#666]">
            <a href="https://wa.me/6281230112240" target="_blank" rel="noopener noreferrer" className="hover:text-black transition">
              Bantuan CS
            </a>
            <span className="text-zinc-300">•</span>
            <a href="https://wa.me/6281230112240" target="_blank" rel="noopener noreferrer" className="hover:text-black transition">
              Kontak Admin
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Persis Zalora / Halaman Utama - Responsif Mobile) */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#EAEAEA] shadow-2xs">
        <div className="max-w-[1240px] mx-auto px-2.5 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2.5 sm:gap-8">
          
          {/* Logo D Store */}
          <Link href="/store" className="shrink-0 flex items-center gap-1">
            <span className="text-lg sm:text-2xl md:text-[26px] font-black tracking-[0.14em] sm:tracking-[0.18em] uppercase text-black hover:opacity-90 transition">
              D STORE
            </span>
          </Link>

          {/* Search Bar Minimalis */}
          <div className="flex-1 max-w-xl relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3 sm:left-4 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#888888] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Cari di ${currentCategory.name}...`}
                className="w-full bg-[#F4F4F4] hover:bg-[#EFEFEF] focus:bg-white text-xs sm:text-sm pl-8 sm:pl-11 pr-8 sm:pr-10 py-1.5 sm:py-2.5 rounded-full border border-transparent focus:border-black outline-hidden transition placeholder:text-[#888]"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 sm:right-3.5 text-[#888] hover:text-black cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-6 shrink-0 text-[#222]">
            {/* Quick Admin Toggle - HANYA jika sudah di route admin */}
            {isAdminMode && (
              <button
                type="button"
                onClick={() => {
                  const next = !isEditMode;
                  setIsEditMode(next);
                }}
                className={`text-[10px] font-bold px-2 py-1 rounded transition border cursor-pointer ${
                  isEditMode 
                    ? 'bg-blue-600 text-white border-blue-500' 
                    : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                }`}
                title="Aktifkan Mode Editor Visual"
              >
                {isEditMode ? 'Mode Edit: AKTIF' : 'Mode Pratinjau'}
              </button>
            )}

            <Link 
              href="/store#all-products-section"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Semua Produk</span>
            </Link>

            <a 
              href="https://wa.me/6281230112240"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-black transition select-none"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden lg:inline">Bantuan CS</span>
            </a>
          </div>

        </div>

        {/* 3. SEGMENT TABS (Rapat & Responsif di Mobile) */}
        <div className="border-t border-[#EAEAEA] bg-white overflow-x-auto no-scrollbar">
          <div className="max-w-[1240px] mx-auto px-2.5 sm:px-4 flex items-center gap-3.5 sm:gap-8 min-w-max h-9 sm:h-11">
            {CATEGORY_TABS.map((tab) => {
              const isActive = tab.id === catId;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`text-[11px] sm:text-xs md:text-sm font-bold tracking-wide uppercase transition relative h-full flex items-center ${
                    isActive
                      ? 'text-black font-extrabold border-b-2 border-black'
                      : 'text-[#737373] hover:text-black'
                  }`}
                >
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA: Simetris, Center, dan Lebar Pas di Mobile & Desktop */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-2 sm:px-4 py-2.5 sm:py-5">
        
        {/* Breadcrumb Sederhana */}
        <div className="text-[10px] sm:text-[11px] text-[#888888] mb-1.5 sm:mb-3 flex items-center gap-1 font-medium px-0.5 sm:px-0">
          <Link href="/store" className="hover:text-black transition">Beranda</Link>
          <span>/</span>
          <span className="text-[#262626] font-semibold">{currentCategory.name}</span>
        </div>

        {/* Judul Kategori & Toolbar Penyortiran */}
        <div className="flex items-center justify-between pb-2 mb-2 sm:mb-4 border-b border-[#EAEAEA] gap-2 px-0.5 sm:px-0">
          <div>
            <h1 className="text-base sm:text-xl md:text-2xl font-black text-[#262626] uppercase tracking-wide">
              {currentCategory.name}
            </h1>
            <p className="text-[10px] sm:text-xs text-[#737373] mt-0.5">
              {filteredProducts.length} Produk Akun Resmi
            </p>
          </div>

          {/* Sort Selector Minimalis */}
          <div className="flex items-center gap-1 shrink-0">
            <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#737373]" />
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              className="text-[11px] sm:text-xs bg-white border border-[#D9D9D9] rounded px-2 py-1 font-medium text-[#262626] focus:outline-hidden focus:border-black cursor-pointer"
            >
              <option value="popular">Paling Populer</option>
              <option value="price-asc">Harga Terendah</option>
              <option value="price-desc">Harga Tertinggi</option>
              <option value="name">Nama (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-24 text-center text-xs text-[#737373]">
            <div className="inline-block w-6 h-6 border-2 border-zinc-200 border-t-black rounded-full animate-spin mb-3"></div>
            <p>Memuat produk kategori...</p>
          </div>
        )}

        {/* Grid Produk - Sempurna 2 Kolom di Mobile, Lebar Penuh & Simetris */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-2.5 w-full">
            {filteredProducts.map((prod, idx) => {
              return (
                <div
                  key={prod.id || idx}
                  className={`w-full bg-white rounded-lg sm:rounded-xl p-1.5 sm:p-2.5 flex flex-col justify-between border hover:border-black hover:shadow-xs transition select-none cursor-pointer relative group overflow-hidden box-border ${
                    isEditMode ? 'ring-2 ring-blue-500/80 hover:ring-blue-400' : 'border-zinc-200/80'
                  }`}
                  onClick={() => handleProductClick(prod)}
                >
                  
                  {/* Gambar Produk - Aspect 3:4, Mengisi Penuh Lebar Kolom */}
                  <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-100 rounded-md sm:rounded-lg relative shadow-2xs transition duration-200 group-hover:scale-[1.01]">
                    {/* Visual Edit Button (Hanya jika isEditMode aktif) */}
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVisualEditingItem({
                            type: 'product',
                            id: prod.id,
                            sku: prod.id,
                            name: prod.name,
                            brand: prod.brand || prod.name,
                            image: prod.image,
                            price: prod.minPrice || 15000,
                            category: currentCategory.name,
                            categoryId: catId,
                            recommendation: {
                              dimensions: '600 x 800 px (Rasio 3:4 Portrait)',
                              aspectRatio: '3:4',
                              tips: 'Poster vertikal produk aplikasi D Store.'
                            }
                          });
                        }}
                        className="absolute top-1.5 left-1.5 z-30 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow cursor-pointer flex items-center gap-1"
                        title="Edit Produk Ini"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    )}

                    {prod.image ? (
                      <img
                        className="w-full h-full object-cover pointer-events-none group-hover:scale-105 transition duration-300"
                        fetchPriority={idx < 4 ? "high" : "auto"}
                        alt={prod.name}
                        loading={idx < 4 ? "eager" : "lazy"}
                        src={prod.image}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-zinc-800 to-zinc-950 text-white select-none">
                        <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-2">
                          <Sparkles className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-200 truncate max-w-[110px]">
                          {prod.name}
                        </span>
                        <span className="text-[9px] text-zinc-400 font-medium mt-0.5">
                          D Store Official
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Konten Teks Produk */}
                  <div className="w-full relative mt-1.5 sm:mt-2 mb-0.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] sm:text-xs font-bold text-[#262626] uppercase truncate leading-tight">
                        {prod.name}
                      </div>
                      <div className="text-[9px] sm:text-[11px] text-[#737373] truncate mt-0.5 leading-tight">
                        {prod.description || 'Akun Resmi Bergaransi Penuh'}
                      </div>
                    </div>

                    {/* Harga & Status Ready */}
                    <div className="mt-1.5 pt-1 sm:pt-1.5 border-t border-zinc-100 flex items-center justify-between">
                      <div>
                        <div className="text-[8px] sm:text-[9px] text-[#999] line-through font-medium leading-none">
                          {formatRupiah(prod.originalPrice)}
                        </div>
                        <div className="text-[11px] sm:text-sm font-black text-[#262626] leading-tight">
                          {formatRupiah(prod.minPrice)}
                        </div>
                      </div>

                      <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Ready
                      </span>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-zinc-200 p-6 max-w-sm mx-auto">
            <p className="text-sm font-bold text-[#262626]">
              Tidak ditemukan produk untuk "{searchQuery}"
            </p>
            <p className="text-xs text-[#737373] mt-1">
              Gunakan kata kunci lain atau lihat seluruh aplikasi di kategori ini.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-3 px-4 py-1.5 bg-black text-white text-xs font-bold rounded hover:opacity-90 transition cursor-pointer"
            >
              Reset Pencarian
            </button>
          </div>
        )}

      </main>

      {/* 4. FOOTER D STORE - Standar, Simpel & Elegan */}
      <footer className="mt-auto w-full border-t border-zinc-200 bg-white text-zinc-500 py-6 pb-20 sm:pb-6 text-xs">
        <div className="max-w-[1240px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-center sm:text-left">
            <span className="font-black text-sm tracking-[0.16em] uppercase text-zinc-950">
              D STORE
            </span>
            <span className="hidden sm:inline text-zinc-300">•</span>
            <span className="text-[11px] text-zinc-500">
              &copy; 2026 D STORE OFFICIAL. Seluruh Hak Cipta Dilindungi.
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-[11px] text-zinc-600">
            <a 
              href="https://wa.me/6281230112240" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-zinc-950 transition"
            >
              Bantuan CS
            </a>
            <span className="text-zinc-300">•</span>
            <a 
              href="https://t.me/dewipermata03" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-zinc-950 transition"
            >
              Telegram
            </a>
            <span className="text-zinc-300">•</span>
            <a 
              href="https://wa.me/6281230112240?text=Halo%20Admin%20D%20Store" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-zinc-950 transition"
            >
              Hubungi Kami
            </a>
          </div>
        </div>
      </footer>

      {/* 5. FLOATING PILL MOBILE BOTTOM BAR (Home, Kategori, Produk) */}
      <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-zinc-200/80 rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.12)] px-6 py-2 flex items-center gap-8">
        <Link href="/store" className="flex flex-col items-center gap-0.5 text-zinc-900 hover:text-black">
          <Home className="w-4 h-4" />
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <button 
          type="button" 
          onClick={() => setIsCategoriesOpen(true)} 
          className="flex flex-col items-center gap-0.5 text-zinc-600 hover:text-black transition cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-[10px] font-medium">Kategori</span>
        </button>
        <Link href="/store#all-products-section" className="flex flex-col items-center gap-0.5 text-zinc-600 hover:text-black transition">
          <Package className="w-4 h-4" />
          <span className="text-[10px] font-medium">Produk</span>
        </Link>
      </div>

      {/* Modal Detail Paket */}
      {selectedAppModal && (
        <AppVariantModal
          appData={selectedAppModal}
          app={selectedAppModal}
          isOpen={true}
          onClose={() => setSelectedAppModal(null)}
          onShowNotification={showToast}
        />
      )}

      {isCategoriesOpen && (
        <CategoriesModal
          isOpen={isCategoriesOpen}
          onClose={() => setIsCategoriesOpen(false)}
        />
      )}

      {/* Visual Live Edit Modal */}
      {visualEditingItem && (
        <VisualEditModal
          isOpen={!!visualEditingItem}
          elementData={visualEditingItem}
          onClose={() => setVisualEditingItem(null)}
          onSave={handleSaveVisualItem}
        />
      )}

    </div>
  );
}
