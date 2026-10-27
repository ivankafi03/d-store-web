import ProdukClient from './ProdukClient';
import { getDb } from '@/lib/db';

export const revalidate = 30; // ISR cache 30 detik untuk respon super instan di Edge CDN

export const metadata = {
  title: 'Katalog Produk & Akun Premium Legal | D Store Indonesia',
  description: 'Jelajahi seluruh koleksi akun dan layanan premium Netflix, ChatGPT, Canva, Spotify, dan 77 produk digital legal bergaransi resmi.',
};

export default function ProdukPage() {
  let initialData = {
    products: [],
    variants: [],
    categories: [],
    settings: {}
  };

  try {
    const db = getDb() || {};
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
