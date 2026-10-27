import { cookies } from 'next/headers';
import Link from 'next/link';
import { MessageCircle, ShieldCheck, Zap, QrCode } from 'lucide-react';
import StoreDevClient from './dev/StoreDevClient';
import { getDb } from '@/lib/db';
import { USER_COOKIE_NAME, verifyUserSessionToken, isOwnerEmail } from '@/lib/userAuth';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function StoreFront() {
  const cookieStore = await cookies();
  const userToken = cookieStore.get(USER_COOKIE_NAME)?.value;
  const userSession = verifyUserSessionToken(userToken);
  const isOwner = Boolean(userSession?.email && isOwnerEmail(userSession.email));

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

  return <StoreDevClient isAdminMode={isOwner} initialData={initialData} />;
}
