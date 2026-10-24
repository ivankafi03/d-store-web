import StoreFront from './store/page';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default function RootPage() {
  return <StoreFront />;
}
