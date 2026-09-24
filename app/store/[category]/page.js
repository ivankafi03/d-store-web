import StoreFront from '../page';
import { CATEGORY_META, resolveCategorySlug } from '@/lib/categories';

export const dynamicParams = true;

export function generateStaticParams() {
  return [
    { category: 'music&audio' },
    { category: 'music-audio' },
    { category: 'streaming&entertainment' },
    { category: 'streaming' },
    { category: 'ai&productivity' },
    { category: 'ai-tools' },
    { category: 'graphic&design' },
    { category: 'graphic-design' },
    { category: 'edukasi&bahasa' },
    { category: 'edukasi-bahasa' },
    { category: 'vpn&security' },
    { category: 'vpn-security' },
    { category: 'office&tools' },
    { category: 'office-tools' }
  ];
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.category;
  const catId = resolveCategorySlug(slug);
  const meta = CATEGORY_META[catId];

  const name = meta?.name || 'Kategori Aplikasi';
  const desc = meta?.desc || 'Katalog akun premium resmi dan bergaransi di D Store';

  return {
    title: `${name} | D Store`,
    description: `Beli akun premium ${name} resmi dan bergaransi: ${desc}.`,
    alternates: {
      canonical: `https://dstore.sbs/store/${encodeURIComponent(slug || '')}`,
    },
  };
}

export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  return <StoreFront initialCategorySlug={resolvedParams?.category} />;
}
