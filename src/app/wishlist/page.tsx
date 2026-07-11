import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import AppWrapper from '@/components/bachat/AppWrapper';

export const metadata: Metadata = pageMetadata(
  '/wishlist',
  'Wishlist',
  'View your saved items and wishlist at Bachat Bazar. Keep track of products you love and purchase them when ready. Free delivery on orders over Rs 25,000.'
);

export default function WishlistPage() {
  return <AppWrapper initialPath="/wishlist" />;
}