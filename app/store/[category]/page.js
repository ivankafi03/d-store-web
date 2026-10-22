import CategoryStoreClient from './CategoryStoreClient';
import { CATEGORY_META, resolveCategorySlug } from '@/lib/categories';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.category;
  const catId = resolveCategorySlug(slug);
  const meta = CATEGORY_META[catId];

  const name = meta?.name || 'Katalog Sub-Kategori';
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
  let initialOverrides = {};

  try {
    const db = getDb(true);
    initialProducts = db.products || [];
    initialVariants = db.variants || [];
    initialOverrides = db.categoryOverrides || {};
  } catch (e) {}

  return (
    <CategoryStoreClient 
      initialSlug={resolvedParams?.category} 
      initialProducts={initialProducts}
      initialVariants={initialVariants}
      initialOverrides={initialOverrides}
    />
  );
}
