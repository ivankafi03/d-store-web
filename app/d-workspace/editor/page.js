import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { USER_COOKIE_NAME, verifyUserSessionToken } from '@/lib/userAuth';
import StoreDevClient from '@/app/store/dev/StoreDevClient';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function WorkspaceEditorPage() {
  let isOwner = false;
  try {
    const cookieStore = await cookies();
    const userToken = cookieStore.get(USER_COOKIE_NAME)?.value;
    const userSession = verifyUserSessionToken(userToken);
    const email = (userSession?.email || '').toLowerCase().trim();
    isOwner = email === 'ivankafipradana@gmail.com';
  } catch (err) {}

  // Jika akun lain atau belum login ivankafipradana@gmail.com, langsung tolak dan lempar ke /store
  if (!isOwner) {
    redirect('/store');
  }

  let initialData = {
    banners: null,
    visualEditorData: {},
    products: [],
    variants: []
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
      variants: Array.isArray(db.variants) ? db.variants : []
    };
  } catch (err) {}

  return <StoreDevClient isAdminMode={true} initialData={initialData} />;
}
