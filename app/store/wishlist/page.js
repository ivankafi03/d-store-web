import WishlistClient from './WishlistClient';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export const metadata = {
  title: 'Wishlist Saya | D Store Official',
  description: 'Daftar produk dan aplikasi premium favorit yang Anda simpan di D Store.',
  alternates: {
    canonical: 'https://dstore.sbs/store/wishlist',
  },
};

export default async function WishlistPage() {
  let initialProducts = [];
  let initialVariants = [];
  let banners = null;

  try {
    const db = getDb(true);
    initialProducts = db.products || [];
    initialVariants = db.variants || [];
    banners = db.banners || null;
  } catch (e) {}

  return (
    <WishlistClient
      initialProducts={initialProducts}
      initialVariants={initialVariants}
      banners={banners}
    />
  );
}
