import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function WishlistPage() {
  redirect('/store#all-products-section');
}
