import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { USER_COOKIE_NAME, verifyUserSessionToken } from '@/lib/userAuth';
import StoreDevClient from './StoreDevClient';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function StoreDevPage() {
  let isOwner = false;
  try {
    const cookieStore = await cookies();
    const userToken = cookieStore.get(USER_COOKIE_NAME)?.value;
    const userSession = verifyUserSessionToken(userToken);
    const email = (userSession?.email || '').toLowerCase().trim();
    isOwner = email === 'ivankafipradana@gmail.com';
  } catch (err) {}

  if (!isOwner) {
    redirect('/store');
  }

  let initialData = {
    banners: null,
    visualEditorData: {},
    products: [],
    variants: [],
    categoryOverrides: {}
  };

  try {
    const db = getDb() || {};
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
  } catch (err) {}

  return <StoreDevClient isAdminMode={true} initialData={initialData} />;
}
