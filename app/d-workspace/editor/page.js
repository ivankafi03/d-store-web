import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { USER_COOKIE_NAME, verifyUserSessionToken, findUserByEmail } from '@/lib/userAuth';
import StoreDevClient from '@/app/store/dev/StoreDevClient';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function WorkspaceEditorPage() {
  const cookieStore = await cookies();

  const userToken = cookieStore.get(USER_COOKIE_NAME)?.value;
  const userSession = verifyUserSessionToken(userToken);
  const email = (userSession?.email || '').toLowerCase().trim();
  const isOwner = email === 'ivankafipradana@gmail.com';

  // Jika akun lain atau belum login ivankafipradana@gmail.com, langsung tolak dan lempar ke /store
  if (!isOwner) {
    redirect('/store');
  }

  const db = getDb();
  const initialData = {
    banners: db.banners || null,
    visualEditorData: {
      ...(db.banners?.visualEditorData || {}),
      ...(db.visualEditorData || {})
    },
    products: db.products || [],
    variants: db.variants || []
  };

  return <StoreDevClient isAdminMode={true} initialData={initialData} />;
}
