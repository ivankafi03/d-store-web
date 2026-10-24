import StoreDevClient from './store/dev/StoreDevClient';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default function RootPage() {
  let initialData = {
    banners: null,
    visualEditorData: {},
    products: [],
    variants: [],
    categoryOverrides: {}
  };

  try {
    const db = getDb(true) || {};
    initialData = {
      banners: db.banners || null,
      visualEditorData: {
        ...(db.banners?.visualEditorData || {}),
        ...(db.visualEditorData || {})
      },
      products: Array.isArray(db.products) ? db.products : [],
      variants: Array.isArray(db.variants) ? db.variants : [],
      categoryOverrides: db.categoryOverrides || {}
    };
  } catch (err) {
    console.error('[RootPage Error]', err);
  }

  return <StoreDevClient isAdminMode={false} initialData={initialData} />;
}
