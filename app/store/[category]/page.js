import CategoryStoreClient from './CategoryStoreClient';
import { CATEGORY_META, resolveCategorySlug } from '@/lib/categories';
import { getDb } from '@/lib/db';
import bundledCatalog from '@/data/public-catalog.json';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.category;
  const catId = resolveCategorySlug(slug);
  const meta = CATEGORY_META[catId];

  const name = meta?.name || 'Katalog Kategori';
  const desc = meta?.desc || 'Katalog akun premium resmi dan lisensi digital bergaransi di D Store';

  return {
    title: `${name} | D Store Official`,
    description: `Beli akun premium ${name} resmi dan bergaransi: ${desc}.`,
    alternates: {
      canonical: `https://dstore.sbs/store/${encodeURIComponent(slug || '')}`,
    },
  };
}

export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  let initialProducts = [];
  let initialVariants = [];
  let initialCategories = [];
  let initialSettings = {};

  try {
    const db = getDb(true);
    initialProducts = (db.products && db.products.length > 0) ? db.products : (bundledCatalog.products || []);
    initialVariants = (db.variants && db.variants.length > 0) ? db.variants : (bundledCatalog.variants || []);
    initialCategories = (db.categories && db.categories.length > 0) ? db.categories : (bundledCatalog.categories || []);
    initialSettings = db.settings || {};
  } catch (e) {
    initialProducts = bundledCatalog.products || [];
    initialVariants = bundledCatalog.variants || [];
    initialCategories = bundledCatalog.categories || [];
  }

  return (
    <CategoryStoreClient 
      initialSlug={resolvedParams?.category} 
      initialProducts={initialProducts}
      initialVariants={initialVariants}
      initialCategories={initialCategories}
      initialSettings={initialSettings}
    />
  );
}
