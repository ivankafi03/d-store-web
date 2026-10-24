import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { USER_COOKIE_NAME, verifyUserSessionToken, getAllUsers, pullUsersFromGoogleSheet } from '@/lib/userAuth';
import { getDb, pullNotesFromGoogleSheet } from '@/lib/db';
import WorkspaceClient from './WorkspaceClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function WorkspacePage() {
  let isOwner = false;
  try {
    const cookieStore = await cookies();
    const userToken = cookieStore.get(USER_COOKIE_NAME)?.value;
    const userSession = verifyUserSessionToken(userToken);
    const email = (userSession?.email || '').toLowerCase().trim();
    isOwner = email === 'ivankafipradana@gmail.com';
  } catch (err) {
    console.warn('[WorkspacePage Auth Error]', err);
  }

  // Jika bukan ivankafipradana@gmail.com, langsung tolak dan lempar ke /store
  if (!isOwner) {
    redirect('/store');
  }

  let db = {};
  try {
    // Selalu sinkronkan data catatan dan pengguna terbaru dari cloud Google Sheets saat membuka Workspace
    await Promise.allSettled([
      pullNotesFromGoogleSheet(),
      pullUsersFromGoogleSheet()
    ]);
    db = getDb(true) || {};
  } catch (e) {
    console.warn('[WorkspacePage Cloud Sync Error]', e);
    db = getDb() || {};
  }

  let registeredUsers = [];
  try {
    registeredUsers = getAllUsers(true) || [];
  } catch (e) {
    console.warn('[WorkspacePage Users Error]', e);
  }

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
