import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { USER_COOKIE_NAME, verifyUserSessionToken, findUserByEmail } from '@/lib/userAuth';
import { getDb } from '@/lib/db';
import WorkspaceClient from './WorkspaceClient';

export const dynamic = 'force-dynamic';

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

  const db = getDb();
  const initialData = {
    products: db.products || [],
    variants: db.variants || [],
    categories: db.categories || [],
    suppliers: db.suppliers || [],
    customerNotes: db.customerNotes || [],
    banners: db.banners || null,
    visualEditorData: {
      ...(db.banners?.visualEditorData || {}),
      ...(db.visualEditorData || {})
    }
  };

  return <WorkspaceClient initialAuth={true} initialData={initialData} />;
}
