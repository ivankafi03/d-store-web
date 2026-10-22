import Link from 'next/link';
import { MessageCircle, ShieldCheck, Zap, QrCode } from 'lucide-react';
import StoreDevClient from './dev/StoreDevClient';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default function StoreFront() {
  const db = getDb(true); // force reload from disk
  const initialData = {
    banners: db.banners || null,
    visualEditorData: {
      ...(db.banners?.visualEditorData || {}),
      ...(db.visualEditorData || {})
    },
    products: db.products || [],
    variants: db.variants || [],
    categoryOverrides: db.categoryOverrides || {}
  };

  return <StoreDevClient isAdminMode={false} initialData={initialData} />;
}
