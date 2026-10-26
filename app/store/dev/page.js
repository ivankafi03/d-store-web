import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { USER_COOKIE_NAME, verifyUserSessionToken, isOwnerEmail } from '@/lib/userAuth';
import StoreDevClient from './StoreDevClient';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function StoreDevPage() {
  const cookieStore = await cookies();
  const userToken = cookieStore.get(USER_COOKIE_NAME)?.value;
  const userSession = verifyUserSessionToken(userToken);

  // 1. Wajib login dengan Google terlebih dahulu
  if (!userSession || !userSession.email) {
    redirect('/api/auth/google?returnTo=/store/dev');
  }

  // 2. Jika email lain (hash tidak cocok dengan ivankafipradana@gmail.com), mental ke home google.com
  if (!isOwnerEmail(userSession.email)) {
    redirect('https://www.google.com');
  }

  // 3. Hanya akun ivankafipradana@gmail.com yang diizinkan memuat editor
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
  } catch (err) {}

  return <StoreDevClient isAdminMode={true} initialData={initialData} />;
}
