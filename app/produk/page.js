import ProdukClient from './ProdukClient';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export const metadata = {
  title: 'Katalog Produk & Akun Premium Legal | D Store Indonesia',
  description: 'Jelajahi seluruh koleksi akun dan layanan premium Netflix, ChatGPT, Canva, Spotify, dan 170+ produk digital legal bergaransi resmi.',
};

export default function ProdukPage() {
  let initialData = {
    products: [],
    variants: [],
    categories: [],
    settings: {}
  };

  try {
    const db = getDb(true) || {};
    initialData = {
      products: db.products || [],
      variants: db.variants || [],
      categories: db.categories || [],
      settings: db.settings || {}
    };
  } catch (err) {
    console.error('Failed to load DB for ProdukPage:', err);
  }

  return <ProdukClient initialData={initialData} />;
}
