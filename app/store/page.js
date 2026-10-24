import Link from 'next/link';
import { MessageCircle, ShieldCheck, Zap, QrCode } from 'lucide-react';
import StoreDevClient from './dev/StoreDevClient';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default function StoreFront() {
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
    console.error('[StoreFront Error]', err);
  }

  return <StoreDevClient isAdminMode={false} initialData={initialData} />;
}
