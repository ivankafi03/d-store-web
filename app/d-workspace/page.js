import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { USER_COOKIE_NAME, verifyUserSessionToken, findUserByEmail, getAllUsers, pullUsersFromGoogleSheet } from '@/lib/userAuth';
import { getDb, pullNotesFromGoogleSheet } from '@/lib/db';
import WorkspaceClient from './WorkspaceClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function WorkspacePage() {
  const cookieStore = await cookies();

  const userToken = cookieStore.get(USER_COOKIE_NAME)?.value;
  const userSession = verifyUserSessionToken(userToken);
  const email = (userSession?.email || '').toLowerCase().trim();
  const isOwner = email === 'ivankafipradana@gmail.com';

  // Jika bukan ivankafipradana@gmail.com, langsung tolak dan lempar ke /store
  if (!isOwner) {
    redirect('/store');
  }

  let db = getDb();
  // Jika catatan pelanggan kosong (misal baru deploy atau cold-start Vercel), pulihkan otomatis dari cloud Google Sheets
  if (!db.customerNotes || db.customerNotes.length === 0) {
    try {
      await Promise.allSettled([
        pullNotesFromGoogleSheet(),
        pullUsersFromGoogleSheet()
      ]);
      db = getDb(true);
    } catch (e) {
      console.warn('[WorkspacePage Cloud Sync Error]', e);
    }
  }

  const allUsers = getAllUsers();
  const initialData = {
    products: db.products || [],
    variants: db.variants || [],
    categories: db.categories || [],
    suppliers: db.suppliers || [],
    customerNotes: db.customerNotes || [],
    registeredUsers,
    banners: db.banners || null,
    visualEditorData: {
      ...(db.banners?.visualEditorData || {}),
      ...(db.visualEditorData || {})
    }
  };

  return <WorkspaceClient initialAuth={true} initialData={initialData} />;
}
