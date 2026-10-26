import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { USER_COOKIE_NAME, verifyUserSessionToken, getAllUsers, pullUsersFromGoogleSheet, isOwnerEmail } from '@/lib/userAuth';
import { getDb, pullNotesFromGoogleSheet } from '@/lib/db';
import WorkspaceClient from './WorkspaceClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function WorkspacePage() {
  const cookieStore = await cookies();
  const userToken = cookieStore.get(USER_COOKIE_NAME)?.value;
  const userSession = verifyUserSessionToken(userToken);

  // 1. Wajib login dengan Google
  if (!userSession || !userSession.email) {
    redirect('/api/auth/google?returnTo=/d-workspace');
  }

  // 2. Jika email lain (hash tidak cocok dengan ivankafipradana@gmail.com), mental ke home google.com
  if (!isOwnerEmail(userSession.email)) {
    redirect('https://www.google.com');
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
